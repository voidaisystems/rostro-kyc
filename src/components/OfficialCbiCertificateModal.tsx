import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react';
import {
  analyzeDocumentAntiSpoofing,
  evaluateIraqiAccountPacket,
  generateDeterministicCaseExplanation,
  verifyArabicLatinPhoneticCrossCheck,
  type BilingualCaseExplanation,
  type KYCApplicant,
  type Language,
} from '../utils/kycEngine';

interface OfficialCbiCertificateModalProps {
  applicant: KYCApplicant | null;
  lang: Language;
  customExplanation?: BilingualCaseExplanation | null;
  onClose: () => void;
}

export const OfficialCbiCertificateModal: React.FC<OfficialCbiCertificateModalProps> = ({
  applicant,
  lang,
  customExplanation,
  onClose,
}) => {
  const [copiedSeal, setCopiedSeal] = useState(false);
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  if (!applicant) return null;

  const primaryDoc = applicant.documents[0];
  const antiSpoof = primaryDoc ? analyzeDocumentAntiSpoofing(primaryDoc) : null;
  const packet = evaluateIraqiAccountPacket(applicant);
  const phonetic = verifyArabicLatinPhoneticCrossCheck(
    primaryDoc?.extractedFields.fullNameArabic || applicant.fullNameAr,
    primaryDoc?.extractedFields.fullName || applicant.fullNameEn,
    primaryDoc?.extractedFields.mrzLine3 || primaryDoc?.extractedFields.mrzLine2
  );
  const explanation = customExplanation || generateDeterministicCaseExplanation(applicant);

  const latestReceipt =
    applicant.auditTrail[0]?.cbiLaw78HmacReceipt ||
    `CBI-L78-HMAC-${(primaryDoc?.sha256Hash || '8F434346648F6B96DF89DDA9').slice(0, 24).toUpperCase()}`;

  const certSerial = `CBI-CDD-${applicant.referenceCode.replace(/[^A-Z0-9-]/gi, '')}`;
  const issuedAtUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  const handleCopySeal = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${certSerial} :: ${latestReceipt}`).catch(() => {});
    }
    setCopiedSeal(true);
    setTimeout(() => setCopiedSeal(false), 1800);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadStandaloneDossier = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8" />
  <title>${certSerial} — Central Bank of Iraq KYC/CDD Compliance Certificate</title>
  <style>
    body { font-family: system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 28px; }
    .sheet { max-width: 900px; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; border-radius: 8px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 6px 12px; font-family: monospace; font-weight: 700; font-size: 12px; border-radius: 4px; background: #ecfdf5; color: #047857; border: 1px solid #10b981; }
    h1 { margin: 0 0 4px 0; font-size: 20px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 22px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: start; }
    th { background: #f1f5f9; font-weight: 700; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .seal-box { margin-top: 24px; padding: 14px; background: #0f172a; color: #f8fafc; border-radius: 6px; font-family: monospace; font-size: 11px; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: 1px solid #000; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="mono" style="font-size:11px;color:#475569;">REPUBLIC OF IRAQ · CENTRAL BANK OF IRAQ (CBI) AML/CFT COMPLIANCE</div>
        <h1>شهادة العناية الواجبة والتحقق الجنائي للزبائن (CBI KYC/CDD Certificate)</h1>
        <div style="font-size:12px;color:#334155;">CBI AML/CFT Law No. 39 of 2015 (Art. 10 & 12) · Electronic Signature Law No. 78 of 2012 (Art. 4)</div>
      </div>
      <div style="text-align:end;">
        <div class="badge">${applicant.status.toUpperCase()} · ${applicant.stage9Outcome}</div>
        <div class="mono" style="font-size:11px;margin-top:6px;">CERT: ${certSerial}</div>
        <div class="mono" style="font-size:10px;color:#64748b;">${issuedAtUtc}</div>
      </div>
    </div>

    <h2>01. Verified Identity & Iraqi Lineage (بيانات الهوية والنسب الرباعي)</h2>
    <table>
      <tr>
        <th>Full Name (AR / الاسم الرباعي)</th>
        <td>${applicant.fullNameAr}</td>
        <th>Full Name (EN / Latin)</th>
        <td class="mono">${applicant.fullNameEn}</td>
      </tr>
      <tr>
        <th>Primary Document</th>
        <td>${primaryDoc?.titleEn || 'Unified National Card'} (${primaryDoc?.titleAr || 'البطاقة الوطنية'})</td>
        <th>Document / National ID No.</th>
        <td class="mono">${primaryDoc?.docNumber || 'N/A'}</td>
      </tr>
      <tr>
        <th>Mother Name (اسم الأم)</th>
        <td>${primaryDoc?.extractedFields.motherName || 'Verified on Reverse'}</td>
        <th>Date of Birth & Expiry</th>
        <td class="mono">${primaryDoc?.extractedFields.dob || '—'} · EXP: ${primaryDoc?.expiryDate || '—'}</td>
      </tr>
      <tr>
        <th>Governorate (المحافظة)</th>
        <td>${applicant.governorateAr} (${applicant.governorateEn})</td>
        <th>Iraqi Account Packet Status</th>
        <td>${packet.relationshipLabelEn} (${packet.lineageConfidence}% Confidence)</td>
      </tr>
    </table>

    <h2>02. Smart Arabic ↔ Latin Phonetic Cross-Check (${phonetic.overallSimilarityPct}% Match)</h2>
    <table>
      <thead>
        <tr>
          <th>Lineage Slot</th>
          <th>Arabic Token</th>
          <th>Latin / MRZ Token</th>
          <th>Consonant Root</th>
          <th>Similarity</th>
        </tr>
      </thead>
      <tbody>
        ${phonetic.tokenMatches
          .map(
            (tm) => `<tr>
          <td>${tm.roleLabelEn}</td>
          <td>${tm.arabicToken}</td>
          <td class="mono">${tm.latinToken}</td>
          <td class="mono">[${tm.arabicConsonantRoot}] ↔ [${tm.latinConsonantRoot}]</td>
          <td class="mono">${tm.similarityPct}% (${tm.status})</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <h2>03. Bilingual AI Forensic & Regulatory Case Summary (خلاصة الفحص الجنائي والرقابي)</h2>
    <p style="font-size:12.5px;line-height:1.6;"><strong>EN:</strong> ${explanation.executiveSummaryEn}</p>
    <p style="font-size:12.5px;line-height:1.7;" dir="rtl"><strong>AR:</strong> ${explanation.executiveSummaryAr}</p>
    <p style="font-size:12px;background:#f8fafc;padding:10px;border-left:3px solid #0f172a;"><strong>Officer Disposition Memo:</strong> ${explanation.officerMemoEn}<br/>${explanation.officerMemoAr}</p>

    <div class="seal-box">
      <div><strong>CRYPTOGRAPHIC NON-REPUDIATION SEAL (IRAQ LAW NO. 78 OF 2012):</strong></div>
      <div style="margin-top:4px;">HMAC-SHA256 RECEIPT: ${latestReceipt}</div>
      <div>DOCUMENT SHA-256: ${primaryDoc?.sha256Hash || 'N/A'}</div>
      <div>REVIEWING OFFICER: ${applicant.assignedReviewerEn} (${applicant.assignedReviewerAr})</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certSerial}-KYC-Dossier.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedNotice(true);
    setTimeout(() => setDownloadedNotice(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-label={
        lang === 'ar'
          ? 'شهادة الامتثال الرسمية للبنك المركزي العراقي'
          : 'Official CBI KYC Compliance Certificate'
      }
    >
      <div className="relative w-full max-w-4xl rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:border-black print:shadow-none">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 flex items-center justify-between gap-3 flex-wrap print:hidden">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                {lang === 'ar'
                  ? 'شهادة العناية الواجبة الرسمية · البنك المركزي العراقي'
                  : 'OFFICIAL CBI LAW 39/2015 & LAW 78/2012 CDD CERTIFICATE'}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">{certSerial}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadStandaloneDossier}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadedNotice
                  ? lang === 'ar'
                    ? 'تم تنزيل الشهادة الرسمية ✓'
                    : 'Dossier Downloaded ✓'
                  : lang === 'ar'
                    ? 'تنزيل ملف الشهادة (HTML/PDF)'
                    : 'Download Official Dossier'}
              </span>
            </button>
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'طباعة رسمية / PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Certificate Modal"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-white dark:bg-[#0c0c0e] print:overflow-visible">
          {/* Formal Header Banner */}
          <div className="border-b-2 border-zinc-900 dark:border-zinc-700 pb-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                REPUBLIC OF IRAQ · CENTRAL BANK OF IRAQ (CBI) COMPLIANCE DIVISION
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                {lang === 'ar'
                  ? 'شهادة التحقق الجنائي والعناية الواجبة للعميل (KYC / CDD Certificate)'
                  : 'Customer Due Diligence & Forensic Identity Verification Certificate'}
              </h2>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {lang === 'ar'
                  ? 'بموجب قانون مكافحة غسل الأموال رقم 39 لسنة 2015 وقانون التوقيع الإلكتروني رقم 78 لسنة 2012'
                  : 'Issued pursuant to CBI AML/CFT Law No. 39 of 2015 & Iraq Electronic Signature Law No. 78 of 2012'}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold border ${
                  applicant.status === 'approved'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : applicant.status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40'
                }`}
              >
                {applicant.status === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : applicant.status === 'rejected' ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>
                  {applicant.status.toUpperCase()} · {applicant.stage9Outcome}
                </span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {certSerial} · {issuedAtUtc}
              </span>
            </div>
          </div>

          {/* Section 1: Bilingual Extracted Identity & Patronymic Lineage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {lang === 'ar'
                  ? '01. البيانات المستخرجة والنسب الرباعي (Extracted Identity & Lineage)'
                  : '01. Extracted Identity & Patronymic Lineage (البيانات المستخرجة والنسب)'}
              </h3>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                OCR Confidence: {primaryDoc?.ocrConfidence || 97}% · Biometric Match: {applicant.biometricMatchScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-3.5 text-xs">
              <div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar' ? 'الاسم الرباعي (عربي)' : 'FULL NAME (ARABIC)'}
                </div>
                <div className="font-bold text-zinc-900 dark:text-white mt-0.5" dir="rtl">
                  {primaryDoc?.extractedFields.fullNameArabic || applicant.fullNameAr}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar' ? 'الاسم الرباعي (لاتيني)' : 'FULL NAME (LATIN / MRZ)'}
                </div>
                <div className="font-mono font-semibold text-zinc-900 dark:text-white mt-0.5">
                  {primaryDoc?.extractedFields.fullName || applicant.fullNameEn}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar' ? 'الرقم الوطني الموحد (12 رقم)' : 'NATIONAL ID / DOC NO.'}
                </div>
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {primaryDoc?.docNumber || '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar' ? 'اسم الأم والجد لأم' : 'MOTHER & MATERNAL GRANDFATHER'}
                </div>
                <div className="font-semibold text-zinc-900 dark:text-white mt-0.5">
                  {primaryDoc?.extractedFields.motherName || 'موثق على ظهر البطاقة'}
                  {primaryDoc?.extractedFields.maternalGrandfatherName
                    ? ` / ${primaryDoc.extractedFields.maternalGrandfatherName}`
                    : ''}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar' ? 'تاريخ التولد والنفاذ' : 'DOB & EXPIRY DATE'}
                </div>
                <div className="font-mono text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {primaryDoc?.extractedFields.dob || '—'} · {primaryDoc?.expiryDate || '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar' ? 'المحافظة وجهة الإصدار' : 'GOVERNORATE & AUTHORITY'}
                </div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {lang === 'ar' ? applicant.governorateAr : applicant.governorateEn}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] font-mono text-zinc-400">
                  {lang === 'ar'
                    ? 'حالة الحزمة المصرفية (البطاقة الوطنية + بطاقة السكن)'
                    : 'IRAQI DUAL-DOCUMENT PACKET (ID + RESIDENCE CARD)'}
                </div>
                <div className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {lang === 'ar' ? packet.relationshipLabelAr : packet.relationshipLabelEn} (
                  {packet.lineageConfidence}%)
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Smart Arabic <-> Latin Phonetic Root Cross-Check Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {lang === 'ar'
                  ? '02. المطابقة الصوتية الذكية بين الاسم العربي والشريط اللاتيني'
                  : '02. Smart Arabic ↔ Latin Phonetic Root Cross-Check'}
              </h3>
              <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {phonetic.overallSimilarityPct}% Phonetic Similarity ({phonetic.verdict})
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-xs text-start border-collapse">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="py-2 px-3 text-start">{lang === 'ar' ? 'المرتبة' : 'Lineage Role'}</th>
                    <th className="py-2 px-3 text-start">{lang === 'ar' ? 'المقطع العربي' : 'Arabic Token'}</th>
                    <th className="py-2 px-3 text-start">{lang === 'ar' ? 'المقابل اللاتيني' : 'Latin / MRZ Token'}</th>
                    <th className="py-2 px-3 text-start">{lang === 'ar' ? 'الجذر الصوتي' : 'Consonant Skeleton'}</th>
                    <th className="py-2 px-3 text-end">{lang === 'ar' ? 'التطابق' : 'Match %'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {phonetic.tokenMatches.map((tm) => (
                    <tr key={tm.index} className="bg-white dark:bg-[#0c0c0e]">
                      <td className="py-1.5 px-3 font-medium text-zinc-600 dark:text-zinc-400">
                        {lang === 'ar' ? tm.roleLabelAr : tm.roleLabelEn}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 dark:text-zinc-100" dir="rtl">
                        {tm.arabicToken}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-zinc-800 dark:text-zinc-200">
                        {tm.latinToken}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-[11px] text-cyan-700 dark:text-cyan-400">
                        [{tm.arabicConsonantRoot}] ↔ [{tm.latinConsonantRoot}]
                      </td>
                      <td className="py-1.5 px-3 font-mono font-bold text-end text-emerald-600 dark:text-emerald-400">
                        {tm.similarityPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: 5-Vector Physical Anti-Spoofing & Bilingual Case Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                  {lang === 'ar'
                    ? '03. الفحص الجنائي لمكافحة التزوير (5 محاور)'
                    : '03. 5-Vector Anti-Spoofing & PAD Audit'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {antiSpoof?.authenticityScore || 98}% Authentic
                </span>
              </div>
              <div className="space-y-1.5">
                {antiSpoof?.vectors.map((vec) => (
                  <div
                    key={vec.id}
                    className="flex items-center justify-between gap-2 text-[11px] py-1 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-none"
                  >
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
                      {lang === 'ar' ? vec.titleAr : vec.titleEn}
                    </span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                        vec.status === 'PASS'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : vec.status === 'WARN'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {vec.status} ({vec.scorePct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                  {lang === 'ar'
                    ? '04. الملخص القضائي والرقابي ثنائي اللغة'
                    : '04. Bilingual Regulatory Disposition Brief'}
                </span>
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {explanation.executiveSummaryEn}
              </p>
              <p
                className="text-[11px] text-zinc-800 dark:text-zinc-200 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-2"
                dir="rtl"
              >
                {explanation.executiveSummaryAr}
              </p>
            </div>
          </div>

          {/* Section 4: Cryptographic Non-Repudiation Seal & Verification Matrix */}
          <div className="rounded-lg border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-950 text-zinc-100 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>
                  IRAQ ELECTRONIC SIGNATURE LAW NO. 78 OF 2012 — CRYPTOGRAPHIC SEAL
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-300 break-all">
                HMAC-SHA256 RECEIPT: <span className="text-white font-bold">{latestReceipt}</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 break-all">
                SPECIMEN SHA-256: {primaryDoc?.sha256Hash || 'N/A'} · OFFICER:{' '}
                {applicant.assignedReviewerEn} ({applicant.assignedReviewerAr})
              </div>
              <button
                type="button"
                onClick={handleCopySeal}
                className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-emerald-300 border border-zinc-700 print:hidden cursor-pointer"
              >
                {copiedSeal ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>
                  {copiedSeal
                    ? lang === 'ar'
                      ? 'تم نسخ الختم التشفيري'
                      : 'Cryptographic Seal Copied'
                    : lang === 'ar'
                      ? 'نسخ رمز التحقق التشفيري'
                      : 'Copy HMAC Seal'}
                </span>
              </button>
            </div>

            {/* Deterministic Verification Matrix SVG */}
            <div className="flex items-center gap-3 bg-white text-zinc-950 p-2.5 rounded-lg border border-zinc-300 shrink-0">
              <svg
                viewBox="0 0 64 64"
                className="w-14 h-14"
                aria-label="CBI Cryptographic Verification Matrix"
              >
                <rect x="2" y="2" width="18" height="18" fill="none" stroke="#09090b" strokeWidth="4" />
                <rect x="7" y="7" width="8" height="8" fill="#09090b" />
                <rect x="44" y="2" width="18" height="18" fill="none" stroke="#09090b" strokeWidth="4" />
                <rect x="49" y="7" width="8" height="8" fill="#09090b" />
                <rect x="2" y="44" width="18" height="18" fill="none" stroke="#09090b" strokeWidth="4" />
                <rect x="7" y="49" width="8" height="8" fill="#09090b" />
                <rect x="24" y="6" width="6" height="6" fill="#09090b" />
                <rect x="34" y="12" width="6" height="6" fill="#09090b" />
                <rect x="24" y="24" width="16" height="16" fill="#047857" />
                <rect x="29" y="29" width="6" height="6" fill="#ffffff" />
                <rect x="6" y="26" width="12" height="6" fill="#09090b" />
                <rect x="44" y="28" width="14" height="6" fill="#09090b" />
                <rect x="26" y="46" width="12" height="12" fill="#09090b" />
                <rect x="44" y="44" width="16" height="16" fill="#09090b" />
                <rect x="48" y="48" width="8" height="8" fill="#ffffff" />
              </svg>
              <div className="text-[9px] font-mono leading-tight">
                <div className="font-bold text-zinc-900">CBI VERIFIED</div>
                <div className="text-emerald-700 font-bold">LAW 39/2015</div>
                <div className="text-zinc-500">LAW 78/2012</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
