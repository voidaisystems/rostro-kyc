from datetime import datetime, date
from typing import List, Tuple, Dict, Any

from ..models.document import (
    MerchantKYCDocumentSet,
    CrossCheckResult,
    ReviewerSummaryDossier,
    KYCApplicationEvaluation
)
from .arabic_normalizer import IraqiArabicNormalizer

class CrossDocumentReconciler:
    CONFIDENCE_PASS_THRESHOLD = 0.82
    NAME_MATCH_THRESHOLD = 0.80

    @classmethod
    def evaluate_kyc_application(cls, doc_set: MerchantKYCDocumentSet) -> KYCApplicationEvaluation:
        cross_checks: List[CrossCheckResult] = []
        flags: List[str] = []
        low_confidence_fields: List[str] = []

        nat = doc_set.national_card
        lic = doc_set.business_license
        tax = doc_set.tax_card

        # -------------------------------------------------------------
        # 1. Cross-Check: Owner Name (National Card vs Business License)
        # -------------------------------------------------------------
        name_nat = nat.full_name_ar.normalized_value or nat.full_name_ar.raw_value or ""
        name_lic = lic.owner_name.normalized_value or lic.owner_name.raw_value or ""

        if not name_nat or not name_lic:
            sim_nl = 0.0
            status_nl = "UNVERIFIABLE"
            desc_nl = "اسم التاجر غير مقروء في أحد المستندات (انعكاس ضوئي أو حجب)"
            flags.append("UNREADABLE_OWNER_NAME")
        else:
            sim_nl, status_nl = IraqiArabicNormalizer.compare_iraqi_names(name_nat, name_lic)
            if sim_nl >= cls.NAME_MATCH_THRESHOLD:
                desc_nl = f"تطابق ممتاز للاسم الرباعي ({int(sim_nl * 100)}%) بعد المعايرة اللغوية"
            else:
                desc_nl = f"تباين في اسم المالك بين الوطنية ({name_nat}) وإجازة المهنة ({name_lic})"
                flags.append(f"NAME_MISMATCH_NAT_VS_LIC_{int(sim_nl*100)}PCT")

        cross_checks.append(CrossCheckResult(
            check_name="تطابق اسم المالك (الهوية الوطنية vs إجازة الممارسة)",
            status="MATCH" if sim_nl >= cls.NAME_MATCH_THRESHOLD else ("MISMATCH" if status_nl != "UNVERIFIABLE" else "UNVERIFIABLE"),
            score=sim_nl,
            details=desc_nl,
            source_fields=["national_card.full_name_ar", "business_license.owner_name"]
        ))

        # -------------------------------------------------------------
        # 2. Cross-Check: Taxpayer Name (National Card vs Tax ID Card)
        # -------------------------------------------------------------
        name_tax = tax.taxpayer_name.normalized_value or tax.taxpayer_name.raw_value or ""
        if not name_tax:
            sim_nt = 0.0
            status_nt = "UNVERIFIABLE"
            desc_nt = "اسم المكلف الضريبي غير مقروء في الهوية الضريبية"
        else:
            sim_nt, status_nt = IraqiArabicNormalizer.compare_iraqi_names(name_nat, name_tax)
            if sim_nt >= cls.NAME_MATCH_THRESHOLD:
                desc_nt = f"تطابق اسم المكلف الضريبي بنسبة ({int(sim_nt * 100)}%)"
            else:
                desc_nt = f"اختلاف اسم المكلف في الضريبة ({name_tax}) عن صاحب الهوية ({name_nat})"
                flags.append("TAX_NAME_MISMATCH")

        cross_checks.append(CrossCheckResult(
            check_name="تطابق اسم المكلف (الهوية الوطنية vs البطاقة الضريبية)",
            status="MATCH" if sim_nt >= cls.NAME_MATCH_THRESHOLD else ("MISMATCH" if status_nt != "UNVERIFIABLE" else "UNVERIFIABLE"),
            score=sim_nt,
            details=desc_nt,
            source_fields=["national_card.full_name_ar", "tax_card.taxpayer_name"]
        ))

        # -------------------------------------------------------------
        # 3. Cross-Check: National ID Number (National Card vs Tax Reference)
        # -------------------------------------------------------------
        id_nat = (nat.national_id_number.raw_value or "").strip()
        id_tax_ref = (tax.national_id_reference.raw_value or "").strip()

        if id_nat and id_tax_ref:
            if id_nat == id_tax_ref:
                score_id = 1.0
                status_id = "MATCH"
                desc_id = f"الرقم الوطني الموحد متطابق تماماً ({id_nat})"
            else:
                score_id = 0.0
                status_id = "MISMATCH"
                desc_id = f"تعارض في الرقم الوطني: الوطنية ({id_nat}) مقابل الضريبة ({id_tax_ref})"
                flags.append("NATIONAL_ID_MISMATCH")
        else:
            score_id = 0.0
            status_id = "UNVERIFIABLE"
            desc_id = "تعذر قراءة الرقم الوطني في أحد المستندات"
            flags.append("UNREADABLE_NATIONAL_ID")

        cross_checks.append(CrossCheckResult(
            check_name="تطابق الرقم الوطني الموحد عبر السجلات",
            status=status_id,
            score=score_id,
            details=desc_id,
            source_fields=["national_card.national_id_number", "tax_card.national_id_reference"]
        ))

        # -------------------------------------------------------------
        # 4. Temporal Audit: License Expiry Date Check
        # -------------------------------------------------------------
        lic_exp_raw = lic.expiry_date.raw_value
        today_iso = date.today().isoformat()

        if lic_exp_raw and lic.expiry_date.confidence >= 0.70:
            try:
                exp_date = datetime.strptime(lic_exp_raw, "%Y-%m-%d").date()
                today_date = date.today()
                if exp_date < today_date:
                    elapsed_days = (today_date - exp_date).days
                    status_exp = "EXPIRED"
                    score_exp = 0.0
                    desc_exp = f"إجازة غرفة التجارة منتهية الصلاحية منذ {elapsed_days} يوماً (انتهت بتاريخ {lic_exp_raw})"
                    flags.append(f"EXPIRED_BUSINESS_LICENSE_{elapsed_days}_DAYS")
                else:
                    days_left = (exp_date - today_date).days
                    status_exp = "MATCH"
                    score_exp = 1.0
                    desc_exp = f"إجازة ممارسة المهنة سارية المفعول (متبقي {days_left} يوماً)"
            except ValueError:
                status_exp = "UNVERIFIABLE"
                score_exp = 0.3
                desc_exp = f"تنسيق تاريخ نفاذ الإجازة غير صالح: {lic_exp_raw}"
                flags.append("INVALID_LICENSE_EXPIRY_DATE")
        else:
            status_exp = "UNVERIFIABLE"
            score_exp = 0.0
            desc_exp = "تاريخ نفاذ إجازة غرفة التجارة غير مقروء بسبب عيوب التصوير أو الانعكاس"
            flags.append("UNREADABLE_LICENSE_EXPIRY")

        cross_checks.append(CrossCheckResult(
            check_name="صلاحية إجازة ممارسة المهنة (غرفة التجارة)",
            status=status_exp,
            score=score_exp,
            details=desc_exp,
            source_fields=["business_license.expiry_date"]
        ))

        # -------------------------------------------------------------
        # 5. Field Confidence Audit & Decision Engine
        # -------------------------------------------------------------
        all_fields = [
            ("الاسم الرباعي", nat.full_name_ar),
            ("الرقم الوطني", nat.national_id_number),
            ("تاريخ ميلاد التاجر", nat.date_of_birth),
            ("اسم التاجر بالإجازة", lic.owner_name),
            ("الاسم التجاري", lic.commercial_trade_name),
            ("تاريخ نفاذ الإجازة", lic.expiry_date),
            ("رقم السجل التجاري", lic.license_number),
            ("الرقم الضريبي", tax.tax_id_number),
            ("اسم المكلف بالضريبة", tax.taxpayer_name),
        ]

        total_conf = 0.0
        for fname, fobj in all_fields:
            total_conf += fobj.confidence
            if fobj.confidence < cls.CONFIDENCE_PASS_THRESHOLD or fobj.is_occluded:
                low_confidence_fields.append(f"{fname} (الثقة: {int(fobj.confidence * 100)}% - {fobj.flag_reason or 'جودة منخفضة'})")

        avg_confidence = round(total_conf / len(all_fields), 3)

        # Policy Thresholds
        has_expired_doc = any("EXPIRED" in f for f in flags)
        has_mismatch = any("MISMATCH" in c.status for c in cross_checks)
        has_low_conf = len(low_confidence_fields) > 0

        if not has_expired_doc and not has_mismatch and not has_low_conf and avg_confidence >= 0.88:
            status = "APPROVED_AUTOMATIC"
            rec_decision = "AUTO_PASS"
            rationale_ar = (
                f"تم التحقق التلقائي بنجاح تام وبثقة إجمالية {int(avg_confidence * 100)}%. "
                f"جميع بيانات التاجر متطابقة عبر البطاقة الوطنية وإجازة غرفة التجارة والبطاقة الضريبية دون أي تعارض."
            )
            est_seconds = 0
        elif has_mismatch:
            status = "NEEDS_MANUAL_REVIEW"
            rec_decision = "MANUAL_REVIEW_REQUIRED"
            rationale_ar = (
                f"⚠️ تعارض في مطابقة البيانات بين المستندات الرسمية: {'; '.join(flags)}. "
                f"يتطلب تدقيق ضابط الامتثال للبت في هوية التاجر."
            )
            est_seconds = 45
        elif has_expired_doc:
            status = "NEEDS_MANUAL_REVIEW"
            rec_decision = "MANUAL_REVIEW_REQUIRED"
            rationale_ar = (
                f"⚠️ إجازة ممارسة المهنة منتهية الصلاحية رسمياً. "
                f"يرجى مراجعة وصل التجديد أو طلب إجازة سارية المفعول من التاجر."
            )
            est_seconds = 20
        else:
            status = "NEEDS_MANUAL_REVIEW"
            rec_decision = "MANUAL_REVIEW_REQUIRED"
            rationale_ar = (
                f"⚠️ انخفاض معدل الثقة البصرية في بعض الحقول ({', '.join(low_confidence_fields)}). "
                f"المستندات مطابقة مبدئياً لكن تحتاج تأكيداً بشرياً للحقول غير الواضحة."
            )
            est_seconds = 25

        dossier = ReviewerSummaryDossier(
            recommended_decision=rec_decision,
            overall_confidence=avg_confidence,
            decision_rationale_ar=rationale_ar,
            identified_flags=flags + low_confidence_fields,
            estimated_human_review_seconds=est_seconds
        )

        return KYCApplicationEvaluation(
            application_id=doc_set.application_id,
            status=status,
            overall_confidence=avg_confidence,
            field_extractions={
                "national_card": nat.dict(),
                "business_license": lic.dict(),
                "tax_card": tax.dict()
            },
            cross_checks=cross_checks,
            reviewer_dossier=dossier
        )
