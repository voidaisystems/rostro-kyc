import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Lock,
  Globe,
  Building2,
  Upload,
  ScanLine,
  Users,
  Fingerprint,
  Sparkles,
  FileCheck2,
  Printer,
  Languages,
} from 'lucide-react';
import {
  analyzeAndTranslateKurdishDocument,
  analyzeDocumentAntiSpoofing,
  buildKurdishDialectSimulationFields,
  evaluateForeignIdComplianceProtocol,
  generateDeterministicCaseExplanation,
  getKurdishDocumentLanguageGuide,
  verifyArabicLatinPhoneticCrossCheck,
  verifyIraqiAccountPacket,
  type AntiSpoofSimulationPreset,
  type BilingualCaseExplanation,
  type KurdishRegionalSimulationPreset,
  type KYCApplicant,
  type KYCDocument,
  type Language,
  type VerificationStatus,
} from '../utils/kycEngine';
import {
  formatBilingualName,
  formatCryptoDigest,
  formatMrzForDisplay,
  formatReferenceCode,
  formatRiskTier,
  formatStage9Outcome,
  formatTimestamp,
  sanitizeTextForLanguage,
  t,
  transliterateArabicToLatin,
} from '../utils/i18n';
import {
  DocumentSpecimenViewer,
  type OcrHighlightField,
} from './DocumentSpecimenViewer';
import { OfficialCbiCertificateModal } from './OfficialCbiCertificateModal';

interface ApplicantInspectorDrawerProps {
  applicant: KYCApplicant | null;
  lang: Language;
  onClose: () => void;
  onUpdateStatus: (applicantId: string, status: VerificationStatus, officerNote: string) => void;
  onRunSingleAutoEval: (applicantId: string) => void;
  onRegisterCandidateDoc?: (applicantId: string, docId: string) => void;
  onAttachOrUpdatePacketResidenceCard?: (
    applicantId: string,
    mode: 'SELF' | 'FATHER' | 'MISMATCH' | 'CUSTOM',
    customDoc?: KYCDocument
  ) => void;
  onApplyAntiSpoofPreset?: (
    applicantId: string,
    docId: string,
    preset: AntiSpoofSimulationPreset
  ) => void;
  onApplyKurdishDialectTranslation?: (
    applicantId: string,
    docId: string,
    preset: KurdishRegionalSimulationPreset
  ) => void;
  onNavigateApplicant?: (direction: 'prev' | 'next') => void;
  currentIndex?: number;
  totalQueueCount?: number;
}

export const ApplicantInspectorDrawer: React.FC<ApplicantInspectorDrawerProps> = ({
  applicant,
  lang,
  onClose,
  onUpdateStatus,
  onRunSingleAutoEval,
  onRegisterCandidateDoc,
  onAttachOrUpdatePacketResidenceCard,
  onApplyAntiSpoofPreset,
  onApplyKurdishDialectTranslation,
  onNavigateApplicant,
  currentIndex = 0,
  totalQueueCount = 1,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'screening' | 'audit'>('documents');
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [decisionNote, setDecisionNote] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [highlightedField, setHighlightedField] = useState<OcrHighlightField>(null);
  const [isUploadingResidence, setIsUploadingResidence] = useState(false);
  const [externalLoupeEnabled, setExternalLoupeEnabled] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [aiCaseBrief, setAiCaseBrief] = useState<BilingualCaseExplanation | null>(null);
  const [isGeneratingAiBrief, setIsGeneratingAiBrief] = useState(false);
  const [selectedKurdishPreset, setSelectedKurdishPreset] =
    useState<KurdishRegionalSimulationPreset | null>(null);
  const [showKurdishDocGuide, setShowKurdishDocGuide] = useState(false);
  const [appliedKurdishBanner, setAppliedKurdishBanner] = useState<string | null>(null);

  // Reset AI case brief & Kurdish simulation when switching applicant
  useEffect(() => {
    setAiCaseBrief(null);
    setSelectedKurdishPreset(null);
    setAppliedKurdishBanner(null);
  }, [applicant?.id]);

  const handleGenerateVividAiBrief = async () => {
    if (!applicant) return;
    setIsGeneratingAiBrief(true);
    try {
      const resp = await fetch('/api/kyc/explain-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as BilingualCaseExplanation;
        setAiCaseBrief(data);
      } else {
        setAiCaseBrief(generateDeterministicCaseExplanation(applicant));
      }
    } catch {
      setAiCaseBrief(generateDeterministicCaseExplanation(applicant));
    } finally {
      setIsGeneratingAiBrief(false);
    }
  };

  // Keyboard shortcuts for rapid officer adjudication
  useEffect(() => {
    if (!applicant) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (isCertificateModalOpen) {
          setIsCertificateModalOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        onNavigateApplicant?.('next');
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onNavigateApplicant?.('prev');
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (applicant.status !== 'approved' && applicant.stage9Outcome !== 'AUTO_APPROVED') {
          handleDecision('approved');
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (applicant.status !== 'approved' && applicant.stage9Outcome !== 'AUTO_APPROVED') {
          handleDecision('rejected');
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setExternalLoupeEnabled((prev) => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCertificateModalOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        void handleGenerateVividAiBrief();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applicant, decisionNote, lang, isCertificateModalOpen]);

  if (!applicant) return null;

  const safeDocIndex = selectedDocIndex < applicant.documents.length ? selectedDocIndex : 0;
  const activeDoc = applicant.documents[safeDocIndex] || applicant.documents[0];

  const handleDecision = (newStatus: VerificationStatus) => {
    const defaultNoteEn =
      newStatus === 'approved'
        ? 'Adjudicated & Approved under CBI Electronic Signature Law No. 78 of 2012.'
        : newStatus === 'flagged'
        ? 'Escalated to Human Review for secondary Iraqi document verification.'
        : 'Rejected due to CBI / AML compliance or Modulo-10 check-digit failure.';
    const defaultNoteAr =
      newStatus === 'approved'
        ? 'تم التدقيق والاعتماد بموجب قانون التوقيع الإلكتروني العراقي رقم 78 لسنة 2012.'
        : newStatus === 'flagged'
        ? 'تم التحويل للمراجعة البشرية لتدقيق الوثائق العراقية.'
        : 'تم الرفض لمخالفة ضوابط البنك المركزي العراقي أو فشل معادلة التحقق الرقمي.';

    onUpdateStatus(
      applicant.id,
      newStatus,
      decisionNote.trim() || (lang === 'ar' ? defaultNoteAr : defaultNoteEn)
    );
    setDecisionNote('');
  };

  const getRowHighlightClass = (field: OcrHighlightField) =>
    `grid grid-cols-3 px-4 py-2.5 transition-colors cursor-pointer ${
      highlightedField === field
        ? 'bg-[#10b981]/15'
        : 'hover:bg-zinc-50 dark:hover:bg-[#282b34]/70'
    }`;

  const signalRows: { key: string; labelEn: string; labelAr: string; value: number }[] = [
    {
      key: 'image_quality',
      labelEn: '01. Optical Image Quality (SmartEngines Glare/Blur Gate)',
      labelAr: '01. الجودة البصرية للصورة (فحص اللمعان والضبابية)',
      value: applicant.nineSignals?.image_quality ?? 0.96,
    },
    {
      key: 'classification_confidence',
      labelEn: '02. Iraqi Document Classification (44-Type Registry)',
      labelAr: '02. ثقة تصنيف الوثيقة العراقية (سجل 44 نوع)',
      value: applicant.nineSignals?.classification_confidence ?? 0.98,
    },
    {
      key: 'extraction_confidence',
      labelEn: '03. Zero-Hallucination VLM OCR Extraction',
      labelAr: '03. ثقة الاستخراج الضوئي الخالي من الهلوسة',
      value: applicant.nineSignals?.extraction_confidence ?? 0.96,
    },
    {
      key: 'normalization_quality',
      labelEn: '04. Multi-Script Normalization (Arabic / Kurdish / English)',
      labelAr: '04. جودة توحيد النصوص والأرقام (عربي / كردي / إنجليزي)',
      value: applicant.nineSignals?.normalization_quality ?? 1.0,
    },
    {
      key: 'format_validity',
      labelEn: '05. Deterministic Format & ICAO Modulo-10 [7,3,1] Validity',
      labelAr: '05. صحة النسق ومعادلة شريط القراءة الآلي [7,3,1]',
      value: applicant.nineSignals?.format_validity ?? 0.98,
    },
    {
      key: 'document_consistency',
      labelEn: '06. Internal Document Date & Authority Consistency',
      labelAr: '06. الاتساق الداخلي للتواريخ وجهة الإصدار',
      value: applicant.nineSignals?.document_consistency ?? 0.97,
    },
    {
      key: 'cross_document_consistency',
      labelEn: '07. Cross-Document Entity Match (ID ↔ Residence ↔ Trade)',
      labelAr: '07. تطابق الكيان عبر الوثائق (البطاقة الموحدة ↔ السكن ↔ التجارة)',
      value: applicant.nineSignals?.cross_document_consistency ?? 0.98,
    },
    {
      key: 'authenticity_risk_indicators',
      labelEn: '08. Cryptographic & Pixel Tamper Integrity Score',
      labelAr: '08. مؤشر سلامة الوثيقة وعدم التلاعب الرقمي',
      value: applicant.nineSignals?.authenticity_risk_indicators ?? 0.98,
    },
  ];

  const customerDisplayNameEn =
    applicant.fullNameEn &&
    applicant.fullNameEn !== 'Verified Record' &&
    !applicant.fullNameEn.includes('MISSING') &&
    !applicant.fullNameEn.includes('غير موجود')
      ? applicant.fullNameEn
      : applicant.fullNameAr && !applicant.fullNameAr.includes('MISSING')
      ? transliterateArabicToLatin(applicant.fullNameAr)
      : 'Identified Applicant';

  const customerDisplayNameAr =
    applicant.fullNameAr &&
    !applicant.fullNameAr.includes('MISSING') &&
    !applicant.fullNameAr.includes('غير موجود')
      ? applicant.fullNameAr
      : applicant.fullNameEn && !applicant.fullNameEn.includes('MISSING')
      ? applicant.fullNameEn
      : 'سجل معتمد';

  const customerInitials = (lang === 'ar' ? customerDisplayNameAr : customerDisplayNameEn)
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const minCustomerOcr =
    applicant.documents && applicant.documents.length > 0
      ? Math.min(...applicant.documents.map((d) => d.ocrConfidence ?? 95))
      : 95;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-stretch justify-end gap-3 p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-drawer-title"
    >
      {/* =====================================================================
          FLOATING SUBMITTED CUSTOMER PROFILE CARD (OVERLAPS ON TOP LAYER)
          Matches the Figma Profile Card design, dynamically populated with
          the selected submitted customer's identity, actions, docs & ledger.
          ===================================================================== */}
      <aside
        onClick={(e) => e.stopPropagation()}
        aria-label="Submitted Customer Profile Summary"
        className="hidden md:flex md:w-[258px] xl:w-[276px] shrink-0 h-full min-h-0 flex-col justify-between gap-2.5 select-none"
      >
        {/* Top Tall Card: Customer Avatar + Name + 3 Purple Action Buttons + About + Submitted Docs */}
        <div className="flex-1 min-h-0 rounded-[22px] bg-[#f4fbf7] dark:bg-[#1f2128] p-4 border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Circular Customer Avatar with Purple Ring & Status Dot */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-[#10b981] shadow-md shadow-[#10b981]/25">
                {activeDoc?.customImageUrl ? (
                  <img
                    src={activeDoc.customImageUrl}
                    alt={customerDisplayNameEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] flex items-center justify-center text-sm font-bold text-white">
                    {customerInitials}
                  </div>
                )}
                <span
                  title={formatStage9Outcome(applicant.stage9Outcome, lang)}
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1f2128] absolute bottom-0 end-0 ${
                    applicant.status === 'approved'
                      ? 'bg-[#10b981]'
                      : applicant.status === 'rejected'
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                  }`}
                />
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mt-2.5 line-clamp-1">
                {lang === 'ar' ? customerDisplayNameAr : customerDisplayNameEn}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 dark:text-[#8a8d98] mt-0.5">
                {formatReferenceCode(applicant.referenceCode, lang)} ·{' '}
                {lang === 'ar' ? applicant.governorateAr : applicant.governorateEn}
              </p>
            </div>

            {/* 3 Purple Rounded-Square Action Buttons for the Submitted Customer */}
            <div className="grid grid-cols-3 gap-2 my-3.5">
              <button
                type="button"
                onClick={() => onRunSingleAutoEval(applicant.id)}
                title={lang === 'ar' ? 'تشغيل مسار الفحص ذو الـ 10 مراحل' : 'Run 10-Stage Pipeline'}
                className="h-10 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white flex flex-col items-center justify-center gap-0.5 shadow-sm shadow-[#10b981]/25 transition-all cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[9px] font-medium opacity-95">
                  {lang === 'ar' ? 'فحص آلي' : 'Pipeline'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCertificateModalOpen(true)}
                title="Official CBI Certificate (Print/PDF)"
                className="h-10 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white flex flex-col items-center justify-center gap-0.5 shadow-sm shadow-[#10b981]/25 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="text-[9px] font-medium opacity-95">
                  {lang === 'ar' ? 'شهادة CBI' : 'CBI PDF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => void handleGenerateVividAiBrief()}
                title="Generate Bilingual Forensic Case Summary"
                className="h-10 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white flex flex-col items-center justify-center gap-0.5 shadow-sm shadow-[#10b981]/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[9px] font-medium opacity-95">
                  {lang === 'ar' ? 'ملخص ذكي' : 'AI Brief'}
                </span>
              </button>
            </div>

            <div className="w-full h-px bg-zinc-200/80 dark:bg-[#2d3039] my-2.5" />

            {/* About / Customer Dossier Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  {lang === 'ar' ? 'بيانات العميل المقدم' : 'About Customer'}
                </h4>
                <span className="text-[10px] font-mono font-bold text-[#10b981] dark:text-[#6ee7b7]">
                  {minCustomerOcr}% OCR · Risk {applicant.riskScore}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-[#8a8d98] leading-relaxed">
                {lang === 'ar'
                  ? `ملف العميل (${customerDisplayNameAr}) خاضع لضوابط البنك المركزي العراقي رقم 78 لسنة 2012 مع التحقق من ${applicant.documents.length} وثائق رسمية.`
                  : `Submitted KYC dossier for ${customerDisplayNameEn} (${applicant.governorateEn}), evaluated across ${applicant.documents.length} official document(s) under CBI Law No. 78.`}
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div className="p-2 rounded-xl bg-white dark:bg-[#14151b] border border-zinc-200/70 dark:border-white/[0.05]">
                  <div className="text-zinc-400 dark:text-[#8a8d98]">
                    {lang === 'ar' ? 'المرحلة 9' : 'Stage 9'}
                  </div>
                  <div className="font-mono font-bold text-[#10b981] dark:text-[#6ee7b7] truncate mt-0.5">
                    {formatStage9Outcome(applicant.stage9Outcome, lang)}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#14151b] border border-zinc-200/70 dark:border-white/[0.05]">
                  <div className="text-zinc-400 dark:text-[#8a8d98]">
                    {lang === 'ar' ? 'مستوى المخاطر' : 'Risk Tier'}
                  </div>
                  <div className="font-mono font-bold text-zinc-900 dark:text-white uppercase truncate mt-0.5">
                    {applicant.riskTier} ({applicant.riskScore}/100)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Customer Documents List (Bottom of Profile Card) */}
          <div className="space-y-1.5 pt-3 border-t border-zinc-200/80 dark:border-[#2d3039]">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-[#8a8d98] pb-0.5">
              {lang === 'ar'
                ? `الوثائق المرفقة (${applicant.documents.length})`
                : `Submitted Documents (${applicant.documents.length})`}
            </div>
            {applicant.documents.map((doc, idx) => {
              const isSelectedDoc = idx === safeDocIndex;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setSelectedDocIndex(idx);
                    setActiveTab('documents');
                    setZoomed(false);
                    setRotation(0);
                  }}
                  className={`w-full flex items-center gap-2.5 text-start p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isSelectedDoc
                      ? 'bg-[#10b981]/15 border border-[#10b981]/40'
                      : 'hover:bg-zinc-200/60 dark:hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-full p-0.5 border border-[#10b981]/60 shrink-0">
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white ${
                        idx % 2 === 0
                          ? 'bg-gradient-to-br from-[#10b981] to-[#0d9488]'
                          : 'bg-gradient-to-br from-[#059669] to-[#84cc16]'
                      }`}
                    >
                      0{idx + 1}
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#10b981] border border-white dark:border-[#1f2128] absolute bottom-0 end-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
                      {lang === 'ar' ? doc.titleAr : doc.titleEn}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 dark:text-[#8a8d98] truncate">
                      {formatReferenceCode(doc.docNumber, lang)} · {doc.ocrConfidence}% OCR
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Floating Customer Ledger Card */}
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className="shrink-0 w-full text-start rounded-[20px] bg-[#f4fbf7] dark:bg-[#1f2128] p-3.5 border border-zinc-200/80 dark:border-white/[0.08] hover:border-[#10b981]/60 shadow-2xl transition-all cursor-pointer"
        >
          <div className="text-xs font-bold text-zinc-900 dark:text-white">
            {lang === 'ar' ? 'سجل التوقيع التشفيري للعميل' : 'CBI Law No. 78 Ledger'}
          </div>
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="w-3 h-3 rounded-full bg-[#34d399] shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              <span>{lang === 'ar' ? 'سلسلة HMAC' : 'HMAC Chain'}</span>
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
              {applicant.auditTrail.length} {lang === 'ar' ? 'توقيع' : 'Blocks'}
            </div>
          </div>
        </button>
      </aside>

      {/* =====================================================================
          MAIN FLOATING CUSTOMER DOSSIER & SPECIMEN INSPECTOR PANEL
          ===================================================================== */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#f4fbf7] dark:bg-[#14151b] h-full rounded-[22px] border border-zinc-200/80 dark:border-white/[0.08] flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-white/[0.07] bg-white dark:bg-[#181a20] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-[#8a8d98] flex-wrap">
              <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-[#10b981]/10 dark:bg-[#282b34] text-[#10b981] dark:text-[#6ee7b7]">
                {formatReferenceCode(applicant.referenceCode, lang)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {lang === 'ar' ? applicant.governorateAr : applicant.governorateEn}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-lg border border-[#10b981]/40 bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7]">
                {formatStage9Outcome(applicant.stage9Outcome, lang)}
              </span>
              {applicant.documents.some(
                (d) =>
                  d.isForeignDocument ||
                  d.type === 'FOREIGN_NATIONAL_ID' ||
                  d.type === 'FOREIGN_PASSPORT' ||
                  (d.issuingCountryCode && d.issuingCountryCode !== 'IRQ')
              ) && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {lang === 'ar' ? 'وثيقة أجنبية · محال للبشري' : 'FOREIGN DOC · REVERTED TO HUMAN'}
                </span>
              )}
            </div>
            {(() => {
              const safeNameEn =
                applicant.fullNameEn &&
                applicant.fullNameEn !== 'Verified Record' &&
                !applicant.fullNameEn.includes('MISSING') &&
                !applicant.fullNameEn.includes('غير موجود')
                  ? applicant.fullNameEn
                  : applicant.fullNameAr && !applicant.fullNameAr.includes('MISSING')
                  ? transliterateArabicToLatin(applicant.fullNameAr)
                  : 'Identified Applicant';

              const safeNameAr =
                applicant.fullNameAr && !applicant.fullNameAr.includes('MISSING') && !applicant.fullNameAr.includes('غير موجود')
                  ? applicant.fullNameAr
                  : applicant.fullNameEn && !applicant.fullNameEn.includes('MISSING')
                  ? applicant.fullNameEn
                  : 'سجل معتمد';

              return (
                <h2
                  id="inspector-drawer-title"
                  className="text-lg font-bold text-zinc-900 dark:text-white mt-1.5"
                >
                  {lang === 'ar' ? safeNameAr : safeNameEn}
                </h2>
              );
            })()}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onNavigateApplicant && totalQueueCount > 1 && (
              <div className="flex items-center gap-1 me-1">
                <button
                  type="button"
                  onClick={() => onNavigateApplicant('prev')}
                  aria-label={t(lang, 'prevApplicantLabel')}
                  className="p-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-[#1f2128] text-zinc-700 dark:text-zinc-200 hover:bg-[#10b981] hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
                <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-[#8a8d98] px-1">
                  {currentIndex + 1}/{totalQueueCount}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateApplicant('next')}
                  aria-label={t(lang, 'nextApplicantLabel')}
                  className="p-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-[#1f2128] text-zinc-700 dark:text-zinc-200 hover:bg-[#10b981] hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={t(lang, 'closeInspectorLabel')}
              className="p-2 rounded-xl bg-zinc-100/80 dark:bg-[#1f2128] text-zinc-500 hover:text-white hover:bg-[#10b981] dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Segmented Sub-Navigation */}
        <div className="px-5 py-3 border-b border-zinc-200/80 dark:border-white/[0.07] bg-white/90 dark:bg-[#181a20] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-[#1f2128] border border-zinc-300/50 dark:border-white/[0.05] rounded-2xl overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[#10b981] text-white shadow-sm shadow-[#10b981]/30'
                  : 'text-zinc-600 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {t(lang, 'tabDocuments')} ({applicant.documents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('screening')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'screening'
                  ? 'bg-[#10b981] text-white shadow-sm shadow-[#10b981]/30'
                  : 'text-zinc-600 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {t(lang, 'tabScreening')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#10b981] text-white shadow-sm shadow-[#10b981]/30'
                  : 'text-zinc-600 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {t(lang, 'tabAudit')} ({applicant.auditTrail.length})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsCertificateModalOpen(true)}
              title={
                lang === 'ar'
                  ? 'إصدار شهادة الامتثال الرسمية للبنك المركزي العراقي للطباعة أو التنزيل (مفتاح C)'
                  : 'Generate Official Printable / Downloadable CBI KYC Certificate (Shortcut: C)'
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#10b981] dark:text-[#6ee7b7] bg-[#10b981]/10 dark:bg-[#1f2128] hover:bg-[#10b981]/20 dark:hover:bg-[#282b34] border border-[#10b981]/35 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar'
                  ? 'شهادة البنك المركزي (PDF / طباعة)'
                  : 'Official CBI Certificate (Print/PDF)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRunSingleAutoEval(applicant.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#10b981] to-[#047857] hover:brightness-110 border border-[#10b981]/50 rounded-xl shadow-sm shadow-[#10b981]/25 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{t(lang, 'evalSingleRuleBtn')}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 pb-8 overflow-y-auto flex-1 space-y-5">
          {/* Universal Foreign Document Alert Banner: Only Iraqi documents are acceptable */}
          {applicant.documents.some(
            (d) =>
              d.isForeignDocument ||
              d.type === 'FOREIGN_NATIONAL_ID' ||
              d.type === 'FOREIGN_PASSPORT' ||
              (d.issuingCountryCode && d.issuingCountryCode !== 'IRQ')
          ) && (
            <div className="rounded-[20px] border border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/40 p-3.5 space-y-2 text-start shadow-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5 flex-wrap">
                      <span>
                        {lang === 'ar'
                          ? 'وثيقة أجنبية غير مقبولة آلياً · محالة حتماً للتدقيق البشري'
                          : 'FOREIGN DOCUMENT DETECTED · NOT ACCEPTABLE FOR AUTOMATED KYC'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/40">
                        {lang === 'ar' ? 'الوثائق العراقية فقط مقبولة' : 'IRAQI DOCUMENTS ONLY'}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-300">
                      {lang === 'ar'
                        ? 'كافة أنواع الوثائق العراقية الـ 44 مقبولة · الوثائق الأجنبية تستبعد من الاعتماد الآلي وتُحال حتماً للموظف البشري'
                        : 'All 44 Iraqi document types are acceptable · Any foreign document is strictly non-acceptable and reverted to human review'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-600 text-white shadow-xs">
                  {lang === 'ar' ? 'محال للتدقيق البشري' : 'REVERTED TO HUMAN'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {lang === 'ar'
                  ? 'تم رصد وثيقة صادرة من خارج العراق. بموجب ضوابط النظام، لا يمكن قبول هذه الوثيقة آلياً على الإطلاق ويجب أن تخضع للتدقيق اليدوي من قبل موظف الامتثال البشري والتحقق من جواز السفر والإقامة الشرعية في العراق.'
                  : 'A foreign document issued outside of Iraq was detected. Under system mandate, this document will never be accepted automatically. It has been strictly reverted to a human compliance officer for manual passport and residence verification.'}
              </p>
            </div>
          )}

          {activeTab === 'documents' && activeDoc && (
            <>
              {/* Document Selector Tabs if applicant has multiple docs */}
              {applicant.documents.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {applicant.documents.map((doc, idx) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocIndex(idx);
                        setRotation(0);
                      }}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        safeDocIndex === idx
                          ? 'border-[#10b981] bg-[#10b981] text-white shadow-sm shadow-[#10b981]/30'
                          : 'border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#1f2128] text-zinc-600 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? doc.titleAr : doc.titleEn}
                    </button>
                  ))}
                </div>
              )}

              {/* Candidate Registration CTA if UNKNOWN_DOCUMENT */}
              {(activeDoc.type === 'UNKNOWN_DOCUMENT' ||
                activeDoc.supportStatus === 'UNKNOWN_DOCUMENT') &&
                onRegisterCandidateDoc && (
                  <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">
                        {lang === 'ar'
                          ? 'تفعيل مسار الوثيقة غير المصنفة:'
                          : 'Unknown Document Fallback Active:'}
                      </span>{' '}
                      {lang === 'ar'
                        ? 'يمكن لموظف التدقيق ترقية هذه الهوية النقابية إلى سجل الـ 44 وثيقة.'
                        : 'Officer can promote this unconfigured Iraqi syndicate card to the 44-Type Registry.'}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRegisterCandidateDoc(applicant.id, activeDoc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t(lang, 'registerCandidateBtn')}</span>
                    </button>
                  </div>
                )}

              {/* Specimen Viewer */}
              <DocumentSpecimenViewer
                document={activeDoc}
                lang={lang}
                zoomed={zoomed}
                rotation={rotation}
                onToggleZoom={() => setZoomed((z) => !z)}
                onRotate={() => setRotation((r) => (r + 90) % 360)}
                onRotateCcw={() => setRotation((r) => (r + 270) % 360)}
                onRotate180={() => setRotation((r) => (r + 180) % 360)}
                onResetRotation={() => setRotation(0)}
                highlightedField={highlightedField}
                onHoverField={setHighlightedField}
                externalLoupeEnabled={externalLoupeEnabled}
              />

              {/* CBI Foreign Document & Compliance Officer Protocol Panel */}
              {Boolean(
                activeDoc.isForeignDocument ||
                activeDoc.type === 'FOREIGN_NATIONAL_ID' ||
                activeDoc.type === 'FOREIGN_PASSPORT' ||
                (activeDoc.issuingCountryCode && activeDoc.issuingCountryCode !== 'IRQ')
              ) && (() => {
                const assessment = evaluateForeignIdComplianceProtocol({
                  docType: activeDoc.type,
                  docNumber: activeDoc.docNumber,
                  issuingCountryCode: activeDoc.issuingCountryCode,
                  issuingCountryEn: activeDoc.issuingCountryEn,
                  issuingCountryAr: activeDoc.issuingCountryAr,
                  holderNationalityEn: activeDoc.holderNationalityEn,
                  holderNationalityAr: activeDoc.holderNationalityAr,
                  uploadedSide: activeDoc.side,
                  coDocuments: applicant.documents.map((d) => d.type),
                });

                return (
                  <div className="rounded-xl border border-blue-300 dark:border-blue-900/60 bg-blue-50/70 dark:bg-[#0c1322] p-4 text-start space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-blue-200 dark:border-blue-900/40 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5 flex-wrap">
                            <span>{lang === 'ar' ? assessment.headlineAr : assessment.headlineEn}</span>
                            {assessment.isSpecimenZeroId && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                {lang === 'ar' ? 'عينة استرشادية' : 'SPECIMEN TEMPLATE'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-blue-700 dark:text-blue-300">
                            {lang === 'ar'
                              ? 'ضوابط البنك المركزي العراقي لفحص هويات المقيمين الأجانب (قانون 39 لسنة 2015)'
                              : 'CBI Foreign Resident ID Protocol · AML/CFT Law No. 39 of 2015'}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                        {lang === 'ar'
                          ? `المرحلة 9: ${assessment.recommendedStage9Outcome === 'INSUFFICIENT_DATA' ? 'بيانات غير كافية' : 'مراجعة بشرية مشددة EDD'}`
                          : `STAGE 9: ${assessment.recommendedStage9Outcome}`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/95 dark:bg-[#101827] border border-blue-200 dark:border-blue-900/40 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                        {lang === 'ar' ? assessment.summaryAr : assessment.summaryEn}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Array.isArray(assessment.rules) && assessment.rules.map((rule) => {
                        const isAlert = rule.status === 'ACTION_REQUIRED' || rule.status === 'SPECIMEN_ALERT';
                        return (
                          <div
                            key={rule.code}
                            className={`p-2 rounded-lg border text-[11px] space-y-0.5 bg-white/95 dark:bg-[#101827] ${
                              isAlert
                                ? 'border-amber-400 dark:border-amber-800/80'
                                : 'border-blue-200 dark:border-blue-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400">
                                {rule.code}
                              </span>
                              <span
                                className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  rule.status === 'SPECIMEN_ALERT'
                                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                    : rule.status === 'ACTION_REQUIRED'
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {rule.status}
                              </span>
                            </div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[10px]">
                              {lang === 'ar' ? rule.titleAr : rule.titleEn}
                            </div>
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">
                              {lang === 'ar' ? rule.descriptionAr : rule.descriptionEn}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Extracted OCR & Multi-Script Normalization Key-Value Grid */}
              <div className="border border-zinc-200/80 dark:border-white/[0.07] rounded-[20px] overflow-hidden bg-white dark:bg-[#1f2128] shadow-xs">
                <div className="px-4 py-3 bg-zinc-50 dark:bg-[#181a20] border-b border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {t(lang, 'extractedOcrHeader')}
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded-lg bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7]">
                    {t(lang, 'ocrConfidenceLabel')}: {activeDoc.ocrConfidence}%
                  </span>
                </div>

                {(() => {
                  const safeNameEn =
                    applicant.fullNameEn &&
                    applicant.fullNameEn !== 'Verified Record' &&
                    !applicant.fullNameEn.includes('MISSING') &&
                    !applicant.fullNameEn.includes('غير موجود')
                      ? applicant.fullNameEn
                      : applicant.fullNameAr && !applicant.fullNameAr.includes('MISSING')
                      ? transliterateArabicToLatin(applicant.fullNameAr)
                      : 'Identified Applicant';

                  const safeNameAr =
                    applicant.fullNameAr && !applicant.fullNameAr.includes('MISSING') && !applicant.fullNameAr.includes('غير موجود')
                      ? applicant.fullNameAr
                      : applicant.fullNameEn && !applicant.fullNameEn.includes('MISSING')
                      ? applicant.fullNameEn
                      : 'سجل معتمد';

                  // Deterministic Year/DOB derivation — always prefer full YYYY-MM-DD DOB from Back Side (slot2Summary) over 4-digit derived year!
                  const slot2Dob = activeDoc.slot2Summary?.dob || '';
                  const slot1Dob = activeDoc.slot1Summary?.dob || '';
                  const rawDob = activeDoc.extractedFields.dob || '';
                  const fullDateRegex = /\b(19\d{2}|20\d{2})-\d{2}-\d{2}\b/;
                  const bestFullDob =
                    (fullDateRegex.test(rawDob) && rawDob.match(fullDateRegex)![0]) ||
                    (fullDateRegex.test(slot2Dob) && slot2Dob.match(fullDateRegex)![0]) ||
                    (fullDateRegex.test(slot1Dob) && slot1Dob.match(fullDateRegex)![0]) ||
                    '';
                  const rawDocNum = (activeDoc.docNumber || '').replace(/\D/g, '');
                  const displayDob = bestFullDob
                    ? bestFullDob
                    : rawDob && !rawDob.includes('MISSING') && !rawDob.includes('غير موجود')
                      ? rawDob
                      : /^(19\d{2}|20\d{2})\d{8}$/.test(rawDocNum)
                        ? `${rawDocNum.slice(0, 4)} (${lang === 'ar' ? 'مستنتج من الرقم الوطني' : 'Derived from National ID'})`
                        : rawDob || '[غير موجود / MISSING]';

                  const pickValidDate = (...candidates: (string | undefined)[]): string => {
                    for (const c of candidates) {
                      if (c && !c.includes('MISSING') && !c.includes('غير موجود') && c !== 'N/A') {
                        return c;
                      }
                    }
                    return '[MISSING]';
                  };

                  const displayIssueDate = pickValidDate(
                    activeDoc.issueDate,
                    activeDoc.extractedFields.issueDate,
                    activeDoc.slot2Summary?.issueDate,
                    activeDoc.slot1Summary?.issueDate
                  );
                  let displayExpiryDate = pickValidDate(
                    activeDoc.expiryDate,
                    activeDoc.extractedFields.expiryDate,
                    activeDoc.slot2Summary?.expiryDate,
                    activeDoc.slot1Summary?.expiryDate
                  );
                  if (
                    displayExpiryDate === '[MISSING]' &&
                    activeDoc.type === 'IRQ_NATIONAL_ID' &&
                    /^(20\d{2})-(\d{2})-(\d{2})$/.test(displayIssueDate)
                  ) {
                    const [, iY, iM, iD] = displayIssueDate.match(/^(20\d{2})-(\d{2})-(\d{2})$/)!;
                    displayExpiryDate = `${Number(iY) + 10}-${iM}-${String(Math.max(1, Number(iD) - 1)).padStart(2, '0')}`;
                  }

                  // Bottom left corner code / Family number
                  const trackingFamilyCode =
                    (activeDoc.extractedFields.familyNumber &&
                     !activeDoc.extractedFields.familyNumber.includes('MISSING') &&
                     !activeDoc.extractedFields.familyNumber.startsWith('FAM-IRQ'))
                      ? activeDoc.extractedFields.familyNumber
                      : activeDoc.extractedFields.cardSerialNumber ||
                        activeDoc.slot1Summary?.cardSerialNumber ||
                        activeDoc.slot1Summary?.familyNumber ||
                        activeDoc.slot2Summary?.familyNumber ||
                        activeDoc.extractedFields.familyNumber;

                  return (
                    <div className="divide-y divide-zinc-200 dark:divide-[#1f1f23] text-xs">
                      {/* Full Legal Combined Name (Bilingual English + Arabic) */}
                      <div
                        onMouseEnter={() => setHighlightedField('fullName')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('fullName')}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t(lang, 'fieldFullName')}
                        </span>
                        <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatBilingualName(undefined, safeNameAr, safeNameEn)}
                        </span>
                      </div>

                      {/* Component Quad Names (First, Father, Grandfather, Surname — Always Bilingual Arabic + English) */}
                      {(activeDoc.extractedFields.firstName || activeDoc.slot1Summary?.firstName) && (
                        <div
                          onMouseEnter={() => setHighlightedField('fullName')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('fullName')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'الاسم (الاسم / ناو)' : 'Given / First Name (الاسم)'}
                          </span>
                          <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatBilingualName(
                              activeDoc.extractedFields.firstName || activeDoc.slot1Summary?.firstName
                            )}
                          </span>
                        </div>
                      )}

                      {(activeDoc.extractedFields.fatherName || activeDoc.slot1Summary?.fatherName) && (
                        <div
                          onMouseEnter={() => setHighlightedField('fullName')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('fullName')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'اسم الأب (الأب / باوك)' : "Father's Name (اسم الأب)"}
                          </span>
                          <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatBilingualName(
                              activeDoc.extractedFields.fatherName || activeDoc.slot1Summary?.fatherName
                            )}
                          </span>
                        </div>
                      )}

                      {(activeDoc.extractedFields.grandfatherName || activeDoc.slot1Summary?.grandfatherName) && (
                        <div
                          onMouseEnter={() => setHighlightedField('fullName')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('fullName')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'اسم الجد (الجد / باپير)' : "Grandfather's Name (اسم الجد)"}
                          </span>
                          <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatBilingualName(
                              activeDoc.extractedFields.grandfatherName || activeDoc.slot1Summary?.grandfatherName
                            )}
                          </span>
                        </div>
                      )}

                      {(activeDoc.extractedFields.surname || activeDoc.slot1Summary?.surname) && (
                        <div
                          onMouseEnter={() => setHighlightedField('fullName')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('fullName')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'اللقب (اللقب / نازناو)' : 'Surname / Tribe (اللقب)'}
                          </span>
                          <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatBilingualName(
                              activeDoc.extractedFields.surname || activeDoc.slot1Summary?.surname
                            )}
                          </span>
                        </div>
                      )}

                      {/* Normalized Name */}
                      <div
                        onMouseEnter={() => setHighlightedField('normalizedName')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('normalizedName')}
                      >
                        <span className="text-zinc-500 dark:text-[#8a8d98]">
                          {t(lang, 'fieldNormalizedName')}
                        </span>
                        <span className="col-span-2 font-semibold text-[#10b981] dark:text-[#6ee7b7]">
                          {formatBilingualName(undefined, safeNameAr, safeNameEn)}
                        </span>
                      </div>

                      {/* Document ID */}
                      <div
                        onMouseEnter={() => setHighlightedField('docNumber')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('docNumber')}
                      >
                        <span className="text-zinc-500 dark:text-[#8a8d98]">
                          {t(lang, 'fieldDocNumber')}
                        </span>
                        <span className="col-span-2 font-mono text-[#10b981] dark:text-[#34d399] font-semibold">
                          {formatReferenceCode(activeDoc.docNumber, lang)}
                        </span>
                      </div>

                      {/* Mother & Maternal Grandfather (Always Bilingual English + Arabic) */}
                      {(activeDoc.extractedFields.motherName || activeDoc.slot1Summary?.motherName) && (
                        <div
                          onMouseEnter={() => setHighlightedField('motherName')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('motherName')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'اسم الأم والجد (الأم / دايك)' : 'Mother & Grandfather (اسم الأم والجد)'}
                          </span>
                          <span className="col-span-2 font-semibold text-zinc-800 dark:text-zinc-200">
                            {formatBilingualName(
                              activeDoc.extractedFields.motherName || activeDoc.slot1Summary?.motherName || ''
                            )}
                          </span>
                        </div>
                      )}

                      {/* Date of Birth */}
                      <div
                        onMouseEnter={() => setHighlightedField('dob')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('dob')}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t(lang, 'fieldDob')}
                        </span>
                        <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                          {displayDob}
                        </span>
                      </div>

                      {/* Sex & Blood Type */}
                      {(activeDoc.extractedFields.gender || activeDoc.extractedFields.bloodType) && (
                        <div
                          onMouseEnter={() => setHighlightedField('gender')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('gender')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {activeDoc.extractedFields.bloodType
                              ? lang === 'ar'
                                ? 'الجنس وفصيلة الدم'
                                : 'Sex & Blood Type'
                              : lang === 'ar'
                                ? 'الجنس'
                                : 'Sex / Gender'}
                          </span>
                          <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                            {sanitizeTextForLanguage(activeDoc.extractedFields.gender || '—', lang)}
                            {activeDoc.extractedFields.bloodType
                              ? ` · ${sanitizeTextForLanguage(activeDoc.extractedFields.bloodType, lang)}`
                              : ''}
                          </span>
                        </div>
                      )}

                      {/* Nationality / Issuing Authority */}
                      <div
                        onMouseEnter={() => setHighlightedField('nationality')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('nationality')}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {activeDoc.isForeignDocument
                            ? lang === 'ar'
                              ? 'دولة الإصدار والجنسية'
                              : 'Issuing Country & Nationality'
                            : t(lang, 'fieldNationality')}
                        </span>
                        <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                          {activeDoc.isForeignDocument
                            ? lang === 'ar'
                              ? `${activeDoc.issuingCountryAr} (${activeDoc.issuingCountryCode || 'ARE'}) · الجنسية: ${activeDoc.holderNationalityAr || activeDoc.holderNationalityEn || 'أجنبية'} · ${activeDoc.issuingAuthorityAr}`
                              : `${activeDoc.issuingCountryEn} (${activeDoc.issuingCountryCode || 'ARE'}) · Nationality: ${activeDoc.holderNationalityEn || 'Foreign National'} · ${activeDoc.issuingAuthorityEn}`
                            : lang === 'ar'
                              ? activeDoc.issuingAuthorityAr
                              : `${sanitizeTextForLanguage(activeDoc.extractedFields.nationality, 'en')} · ${activeDoc.issuingAuthorityEn}`}
                        </span>
                      </div>

                      {/* Issue & Expiry Date */}
                      <div
                        onMouseEnter={() => setHighlightedField('expiryDate')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('expiryDate')}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {lang === 'ar' ? 'تاريخ الإصدار والنفاذ' : 'Issue & Expiry Date'}
                        </span>
                        <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                          {displayIssueDate} → {displayExpiryDate}
                        </span>
                      </div>

                      {/* Family Number / Bottom-Left Card Tracking Code (Only for National ID / Civil / Residence cards, never Passports) */}
                      {trackingFamilyCode &&
                        trackingFamilyCode !== 'N/A' &&
                        activeDoc.type !== 'IRQ_PASSPORT' &&
                        activeDoc.type !== 'FOREIGN_PASSPORT' && (
                          <div
                            onMouseEnter={() => setHighlightedField('familyNumber')}
                            onMouseLeave={() => setHighlightedField(null)}
                            className={getRowHighlightClass('familyNumber')}
                          >
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {lang === 'ar' ? 'رقم البطاقة / الرقم العائلي (أسفل اليسار)' : 'Family / Card No. (Bottom-Left)'}
                            </span>
                            <span className="col-span-2 font-mono font-bold text-amber-700 dark:text-amber-400">
                              {formatReferenceCode(trackingFamilyCode, lang)}
                            </span>
                          </div>
                        )}

                      {/* Address */}
                      {activeDoc.extractedFields.address && (
                        <div
                          onMouseEnter={() => setHighlightedField('address')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('address')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {t(lang, 'fieldAddress')}
                          </span>
                          <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                            {sanitizeTextForLanguage(activeDoc.extractedFields.address, lang)}
                          </span>
                        </div>
                      )}

                      {/* Machine Readable Zone */}
                      {(activeDoc.extractedFields.mrzLine1 || activeDoc.slot2Summary?.mrzLine1) && (
                        <div
                          onMouseEnter={() => setHighlightedField('mrz')}
                          onMouseLeave={() => setHighlightedField(null)}
                          className={getRowHighlightClass('mrz')}
                        >
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'شريط القراءة الآلي' : 'Machine Readable Zone'}
                          </span>
                          <span className="col-span-2 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 space-y-0.5">
                            <span className="block tracking-wider">
                              {formatMrzForDisplay(
                                activeDoc.extractedFields.mrzLine1 || activeDoc.slot2Summary?.mrzLine1 || '',
                                lang
                              )}
                            </span>
                            {activeDoc.extractedFields.mrzLine2 && (
                              <span className="block tracking-wider">
                                {formatMrzForDisplay(activeDoc.extractedFields.mrzLine2, lang)}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* UPGRADE 1.3: SMART ARABIC TRANSLITERATION & PHONETIC CROSS-CHECK ENGINE */}
              {(() => {
                const phonetic = verifyArabicLatinPhoneticCrossCheck(
                  activeDoc?.extractedFields?.fullNameArabic || applicant.fullNameAr || '',
                  activeDoc?.extractedFields?.fullName || applicant.fullNameEn || '',
                  activeDoc?.extractedFields?.mrzLine3 || activeDoc?.extractedFields?.mrzLine2
                );

                return (
                  <div
                    className="rounded-[20px] border border-[#10b981]/30 bg-white dark:bg-[#1f2128] p-4 space-y-3 text-start shadow-xs"
                    data-testid="phonetic-crosscheck-panel"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-zinc-200/80 dark:border-white/[0.06] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7] flex items-center justify-center shrink-0">
                          <Languages className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {lang === 'ar'
                              ? 'محرك المطابقة الصوتية الذكية (العربية ↔ الشريط اللاتيني MRZ)'
                              : 'Smart Arabic Transliteration & Phonetic Cross-Check Engine'}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-[#8a8d98]">
                            {lang === 'ar' ? phonetic.summaryAr : phonetic.summaryEn}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                          phonetic.verdict === 'VERIFIED'
                            ? 'bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7] border-[#10b981]/40'
                            : phonetic.verdict === 'VARIANT_ACCEPTED'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {phonetic.overallSimilarityPct}% · {phonetic.verdict}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phonetic.tokenMatches.map((tm) => (
                        <div
                          key={tm.index}
                          className="rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b] p-2.5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8a8d98]">
                              {lang === 'ar' ? tm.roleLabelAr : tm.roleLabelEn}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                tm.status === 'MATCH'
                                  ? 'bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7]'
                                  : tm.status === 'PHONETIC_VARIANT'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {tm.similarityPct}% {tm.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 font-mono font-semibold text-zinc-900 dark:text-white">
                            <span dir="rtl">{tm.arabicToken}</span>
                            <span className="text-zinc-400">↔</span>
                            <span className="text-[#10b981] dark:text-[#34d399]">{tm.latinToken}</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 dark:text-[#8a8d98]">
                            {lang === 'ar' ? tm.noteAr : tm.noteEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* UPGRADE 1.4: KURDISH MULTI-DIALECT DETECTION & OFFICIAL ARABIC TRANSLATION ENGINE (Only shown for actual Kurdish documents) */}
              {(() => {
                const isActualKurdishDocument = Boolean(
                  activeDoc.kurdishDialectPreset ||
                  activeDoc.extractedFields.fullNameKurdish ||
                  activeDoc.extractedFields.addressKurdish ||
                  activeDoc.extractedFields.governorateKurdish ||
                  activeDoc.extractedFields.issuingAuthorityKurdish ||
                  activeDoc.extractedFields.motherNameKurdish ||
                  /[پچژگڤڵڕۆێ]/.test(
                    [
                      activeDoc.extractedFields.fullName,
                      activeDoc.extractedFields.fullNameArabic,
                      activeDoc.extractedFields.address,
                      activeDoc.extractedFields.governorate,
                      activeDoc.titleEn,
                      activeDoc.titleAr,
                    ]
                      .filter(Boolean)
                      .join(' ')
                  )
                );

                if (!isActualKurdishDocument) return null;

                const kurdishReport = analyzeAndTranslateKurdishDocument(activeDoc, applicant);

                const dialectBadgeClass =
                  kurdishReport.detectedDialect === 'DUHOK_BADINI_KURMANJI'
                    ? 'bg-[#059669]/15 text-[#059669] dark:text-[#d1fae5] border-[#059669]/40'
                    : kurdishReport.detectedDialect === 'SULAYMANIYAH_SORANI'
                      ? 'bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7] border-[#10b981]/40'
                      : kurdishReport.detectedDialect === 'ERBIL_HEWLERI_SORANI'
                        ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40'
                        : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/40';

                return (
                  <div
                    className="rounded-[20px] border border-[#10b981]/30 bg-white dark:bg-[#1f2128] p-4 space-y-3.5 text-start shadow-xs"
                    data-testid="kurdish-dialect-translation-panel"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-zinc-200/80 dark:border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7] flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {lang === 'ar'
                              ? 'محرك اللهجات الكردية والترجمة الرسمية للعربية (السليمانية · أربيل · دهوك)'
                              : 'Kurdish Regional Dialect & Official CBI Arabic Translation'}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-[#8a8d98]">
                            {lang === 'ar' ? kurdishReport.summaryAr : kurdishReport.summaryEn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border ${dialectBadgeClass}`}
                          data-testid="detected-kurdish-dialect-badge"
                        >
                          {kurdishReport.confidencePct}% · {kurdishReport.detectedDialect}
                        </span>
                      </div>
                    </div>

                    {/* Kurdish Source -> Official CBI Arabic & English Translation Table */}
                    <div className="space-y-2">
                      {kurdishReport.fieldTranslations.map((ft) => (
                        <div
                          key={ft.fieldKey}
                          data-testid={`kurdish-field-${ft.fieldKey}`}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-2.5 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                              {lang === 'ar' ? ft.labelAr : ft.labelEn}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                              {lang === 'ar'
                                ? 'كردي أصلي ← عربي رسمي معتمد (CBI)'
                                : 'Kurdish Source → Official CBI Arabic'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                            <div
                              className="px-2.5 py-1.5 rounded bg-amber-500/10 border border-amber-500/25 font-mono text-amber-900 dark:text-amber-200"
                              dir="rtl"
                            >
                              <span className="text-[9px] uppercase block text-amber-600 dark:text-amber-400">
                                {lang === 'ar' ? 'النص الكردي على الوثيقة:' : 'Kurdish on Document:'}
                              </span>
                              {ft.sourceKurdishText}
                            </div>

                            <div
                              className="px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/25 font-mono font-semibold text-emerald-900 dark:text-emerald-200"
                              dir="rtl"
                            >
                              <span className="text-[9px] uppercase block text-emerald-600 dark:text-emerald-400">
                                {lang === 'ar'
                                  ? 'الترجمة العربية الرسمية المعتمدة:'
                                  : 'Translated Official Arabic & English:'}
                              </span>
                              {ft.translatedArabicText} ·{' '}
                              <span className="text-cyan-700 dark:text-cyan-300" dir="ltr">
                                {ft.translatedEnglishText}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? ft.linguisticNoteAr : ft.linguisticNoteEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* UPGRADE 1.2: AI FORENSIC EXPLAINABILITY & BILINGUAL CASE SUMMARY */}
              {(() => {
                const brief = aiCaseBrief || generateDeterministicCaseExplanation(applicant);
                return (
                  <div
                    className="rounded-xl border border-emerald-500/35 bg-emerald-500/5 dark:bg-emerald-950/15 p-4 space-y-3.5 text-start"
                    data-testid="ai-forensic-explainability-panel"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {lang === 'ar'
                              ? 'التفسير الجنائي الذكي وملخص القضية ثنائي اللغة (AI Forensic Case Brief)'
                              : 'AI Forensic Explainability & Vivid Bilingual Case Summary'}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            {brief.engineBadge}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleGenerateVividAiBrief()}
                        disabled={isGeneratingAiBrief}
                        title={
                          lang === 'ar'
                            ? 'توليد شرح جنائي ورقابي مفصل باللغتين العربية والإنجليزية (مفتاح E)'
                            : 'Generate Vivid Bilingual AI Forensic Case Brief (Shortcut: E)'
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {isGeneratingAiBrief
                            ? lang === 'ar'
                              ? 'جاري التحليل الجنائي بالذكاء الاصطناعي...'
                              : 'Synthesizing Bilingual Brief...'
                            : lang === 'ar'
                              ? 'تحديث الملخص الجنائي الذكي (AI)'
                              : 'Synthesize Vivid AI Brief (E)'}
                        </span>
                      </button>
                    </div>

                    {/* Bilingual Executive Narrative (English + Arabic side-by-side) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-3 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          ENGLISH FORENSIC & REGULATORY BRIEF
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {brief.headlineEn}
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {brief.executiveSummaryEn}
                        </p>
                      </div>

                      <div
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-3 space-y-1.5"
                        dir="rtl"
                      >
                        <div className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          الملخص الجنائي والرقابي باللغة العربية
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {brief.headlineAr}
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {brief.executiveSummaryAr}
                        </p>
                      </div>
                    </div>

                    {/* 4-Pillar Forensic Evidence Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {brief.keyFindings.map((kf, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#0c0c0e] p-2.5 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {lang === 'ar' ? kf.categoryAr : kf.categoryEn}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                kf.status === 'PASS'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : kf.status === 'WARN'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {kf.status}
                            </span>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400 leading-snug">
                            {lang === 'ar' ? kf.explanationAr : kf.explanationEn}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Ready-to-File Officer Disposition Memo & CBI Law Citations */}
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          {lang === 'ar'
                            ? 'مذكرة قرار الامتثال الجاهزة للأرشفة (CBI Law 39/2015 & Law 78/2012)'
                            : 'READY-TO-FILE OFFICER DISPOSITION MEMO (CBI Law 39/2015 & Law 78/2012)'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDecisionNote(lang === 'ar' ? brief.officerMemoAr : brief.officerMemoEn)
                          }
                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-200 border border-emerald-500/30 cursor-pointer"
                        >
                          {lang === 'ar' ? 'إدراج في حقل القرار ↓' : 'Insert into Decision Note ↓'}
                        </button>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">{brief.officerMemoEn}</p>
                      <p className="text-zinc-700 dark:text-zinc-300" dir="rtl">
                        {brief.officerMemoAr}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* FEATURE 2: Multi-Document Full Iraqi Account Packet (Only shown when an Iraqi Residence Card is part of the dossier) */}
              {(() => {
                const resCardDoc = applicant.documents.find(
                  (d) => d.type === 'IRQ_RESIDENCE_CARD'
                );
                if (!resCardDoc) return null;

                const natIdDoc =
                  applicant.documents.find(
                    (d) => d.type === 'IRQ_NATIONAL_ID' || d.type === 'IRQ_CIVIL_STATUS_ID'
                  ) || applicant.documents[0];
                const packet = verifyIraqiAccountPacket(natIdDoc, resCardDoc);

                const statusBorder =
                  packet.packetStatus === 'REJECTED_HOUSEHOLD_MISMATCH'
                    ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20'
                    : packet.isLineageVerified
                      ? 'border-[#10b981]/35 bg-white dark:bg-[#1f2128]'
                      : 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/15';

                return (
                  <div
                    className={`rounded-[20px] border p-4 space-y-3.5 text-start shadow-xs ${statusBorder}`}
                    data-testid="iraqi-account-packet-panel"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-zinc-200/80 dark:border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7] flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {lang === 'ar'
                              ? 'حقيبة الحساب العراقي الكامل (البطاقة الوطنية + بطاقة السكن ومطابقة النسب)'
                              : 'Full Iraqi Account Packet (National ID + Residence Card Lineage Linker)'}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-[#8a8d98]">
                            {lang === 'ar'
                              ? packet.relationshipLabelAr
                              : packet.relationshipLabelEn}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-lg bg-[#10b981]/15 text-[#10b981] dark:text-[#6ee7b7]">
                        {lang === 'ar'
                          ? `ثقة مطابقة النسب: ${packet.lineageConfidence}%`
                          : `Lineage Match: ${packet.lineageConfidence}%`}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {lang === 'ar' ? packet.summaryAr : packet.summaryEn}
                    </p>

                    {/* Lineage Comparison Chain */}
                    {packet.matchedLineageChain.length > 0 && (
                      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b] divide-y divide-zinc-200 dark:divide-white/[0.06] text-xs overflow-hidden">
                        <div className="grid grid-cols-3 px-3 py-2 bg-zinc-100/80 dark:bg-[#181a20] font-semibold text-[11px] text-zinc-500 dark:text-[#8a8d98]">
                          <span>
                            {lang === 'ar' ? 'حلقة النسب العائلي' : 'Lineage Segment'}
                          </span>
                          <span>
                            {lang === 'ar'
                              ? 'البطاقة الوطنية الموحدة'
                              : 'National ID Segment'}
                          </span>
                          <span>
                            {lang === 'ar'
                              ? 'بطاقة السكن (رب الأسرة)'
                              : 'Residence Card (Head)'}
                          </span>
                        </div>
                        {packet.matchedLineageChain.map((link, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-3 px-3 py-2 items-center text-[11px]"
                          >
                            <span className="text-zinc-600 dark:text-[#8a8d98] font-medium">
                              {lang === 'ar' ? link.roleAr : link.roleEn}
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                              {formatBilingualName(link.nationalIdSegment)}
                            </span>
                            <span
                              className={`font-mono font-semibold flex items-center justify-between gap-1 ${
                                link.matched
                                  ? 'text-[#10b981] dark:text-[#6ee7b7]'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              <span>{formatBilingualName(link.residenceCardSegment)}</span>
                              <span>{link.matched ? '✓' : '✗'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Structured Iraqi Address Breakdown (Mahalla / Zukak / Dar / Info Office) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b]">
                        <div className="text-[10px] text-zinc-500 dark:text-[#8a8d98]">
                          {lang === 'ar' ? 'مكتب المعلومات' : 'Information Office'}
                        </div>
                        <div className="font-semibold text-zinc-900 dark:text-white truncate mt-0.5">
                          {packet.structuredAddress.infoOffice}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b]">
                        <div className="text-[10px] text-zinc-500 dark:text-[#8a8d98]">
                          {lang === 'ar' ? 'المحلة (Sector)' : 'Mahalla (Sector)'}
                        </div>
                        <div className="font-mono font-bold tabular-nums text-[#10b981] dark:text-[#6ee7b7] mt-0.5">
                          {packet.structuredAddress.mahalla}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b]">
                        <div className="text-[10px] text-zinc-500 dark:text-[#8a8d98]">
                          {lang === 'ar' ? 'الزقاق (Alley)' : 'Zukak (Alley)'}
                        </div>
                        <div className="font-mono font-bold tabular-nums text-[#10b981] dark:text-[#6ee7b7] mt-0.5">
                          {packet.structuredAddress.zukak}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b]">
                        <div className="text-[10px] text-zinc-500 dark:text-[#8a8d98]">
                          {lang === 'ar' ? 'الدار (House)' : 'Dar (House No.)'}
                        </div>
                        <div className="font-mono font-bold tabular-nums text-[#10b981] dark:text-[#6ee7b7] mt-0.5">
                          {packet.structuredAddress.dar}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#14151b]">
                        <div className="text-[10px] text-zinc-500 dark:text-[#8a8d98]">
                          {lang === 'ar' ? 'رقم بطاقة السكن' : 'Residence Form No.'}
                        </div>
                        <div className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-white truncate mt-0.5">
                          {packet.structuredAddress.formNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {activeTab === 'screening' && (
            <div className="space-y-4">
              {/* Honest External Verification Separation Banner */}
              <div className="p-3.5 rounded-2xl border border-[#10b981]/30 bg-[#10b981]/10 dark:bg-[#1f2128] text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#10b981] dark:text-[#34d399] shrink-0" />
                <span className="font-mono text-[11px]">{t(lang, 'externalVerifBanner')}</span>
              </div>

              {/* The 9 Separated Verification Signals */}
              <div className="border border-zinc-200/80 dark:border-white/[0.07] rounded-[20px] p-4 bg-white dark:bg-[#1f2128] space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-2.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {t(lang, 'nineSignalsTitle')}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-[#10b981] dark:text-[#34d399]">
                    {lang === 'ar' ? 'متجه المرحلة الثامنة المعاير' : 'STAGE 8 CALIBRATED VECTOR'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {signalRows.map((sig) => {
                    const pct = Math.round(sig.value * 100);
                    const barColor =
                      sig.value >= 0.85
                        ? 'bg-gradient-to-r from-[#10b981] to-[#a855f7]'
                        : sig.value >= 0.6
                        ? 'bg-amber-500'
                        : 'bg-rose-600';
                    return (
                      <div key={sig.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {lang === 'ar' ? sig.labelAr : sig.labelEn}
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
                            {sig.value.toFixed(2)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#14151b] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-zinc-600 dark:text-[#8a8d98]">
                      {lang === 'ar'
                        ? '09. حالة الربط مع قواعد البيانات الحكومية الخارجية'
                        : '09. External Government Database Status'}
                    </span>
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-lg bg-[#10b981]/10 dark:bg-[#14151b] border border-[#10b981]/30 text-[#10b981] dark:text-[#6ee7b7]">
                      {lang === 'ar'
                        ? 'التحقق الخارجي غير متصل'
                        : applicant.nineSignals.external_verification_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk & Biometric Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[20px] border border-zinc-200/80 dark:border-white/[0.07] bg-white dark:bg-[#1f2128]">
                  <div className="text-xs text-zinc-500 dark:text-[#8a8d98]">
                    {t(lang, 'colRiskScore')}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
                      {applicant.riskScore}/100
                    </span>
                    <span className="text-xs font-semibold uppercase text-[#10b981] dark:text-[#34d399]">
                      ({formatRiskTier(applicant.riskTier, lang)})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-[20px] border border-zinc-200/80 dark:border-white/[0.07] bg-white dark:bg-[#1f2128]">
                  <div className="text-xs text-zinc-500 dark:text-[#8a8d98]">
                    {t(lang, 'biometricMatchLabel')}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-[#10b981] dark:text-[#6ee7b7]">
                      {applicant.biometricMatchScore}%
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-[#8a8d98]">
                      {lang === 'ar' ? 'فحص الحيوية البيومتري' : 'ISO/IEC 30107-3 PAD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Watchlist Checks */}
              <div className="border border-zinc-200/80 dark:border-white/[0.07] rounded-[20px] bg-white dark:bg-[#1f2128] divide-y divide-zinc-200 dark:divide-white/[0.06] text-xs">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white">
                      {lang === 'ar'
                        ? 'فحص قوائم العقوبات (البنك المركزي العراقي / الأمم المتحدة / العقوبات الدولية)'
                        : 'Central Bank of Iraq (CBI) / OFAC / UN / EU Sanctions'}
                    </div>
                    <div className="text-zinc-500 dark:text-[#8a8d98] mt-0.5">
                      {lang === 'ar'
                        ? 'فحص الكيانات الموحد للنصوص العربية والكردية واللاتينية'
                        : 'Normalized Arabic/Kurdish/Latin multi-script entity screening'}
                    </div>
                  </div>
                  {applicant.sanctionsMatch ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                      {t(lang, 'sanctionsHit')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#10b981] dark:text-[#6ee7b7]">
                      <ShieldCheck className="w-4 h-4" />
                      {t(lang, 'sanctionsClean')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              {applicant.auditTrail.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-[20px] border border-zinc-200/80 dark:border-white/[0.07] bg-white dark:bg-[#1f2128] text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-zinc-500 dark:text-[#8a8d98]">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {lang === 'ar' ? evt.actorAr : evt.actorEn}
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatTimestamp(evt.timestamp, lang)}
                    </span>
                  </div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {lang === 'ar' ? evt.actionAr : evt.actionEn}
                  </div>
                  {(evt.noteEn || evt.noteAr) && (
                    <div className="text-zinc-600 dark:text-[#8a8d98]">
                      {lang === 'ar' ? evt.noteAr : evt.noteEn}
                    </div>
                  )}
                  {evt.cbiLaw78HmacReceipt && (
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#10b981] dark:text-[#6ee7b7]">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {lang === 'ar'
                          ? `إيصال قانون التوقيع الإلكتروني رقم 78: ${formatCryptoDigest(evt.cbiLaw78HmacReceipt, 'ar')}`
                          : `CBI Law No. 78 Receipt: ${evt.cbiLaw78HmacReceipt}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Adjudication Footer */}
        <div className="p-4 border-t border-zinc-200/80 dark:border-white/[0.07] bg-white dark:bg-[#181a20] space-y-3">
          {(() => {
            const isAlreadyApproved =
              applicant.status === 'approved' || applicant.stage9Outcome === 'AUTO_APPROVED';

            if (isAlreadyApproved) {
              return (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 dark:text-[#8a8d98]">{t(lang, 'colStatus')}:</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#10b981] dark:text-[#6ee7b7]">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      {t(lang, 'statusApproved')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      data-testid="auto-approved-status-badge"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] text-white shadow-md shadow-[#10b981]/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t(lang, 'statusApproved')}</span>
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <>
                <input
                  type="text"
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder={t(lang, 'decisionNotePlaceholder')}
                  aria-label={t(lang, 'decisionNotePlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-[#f4fbf7] dark:bg-[#14151b] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#8a8d98] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 dark:text-[#8a8d98]">{t(lang, 'colStatus')}:</span>
                    {applicant.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#38bdf8]">
                        <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                        {t(lang, 'statusPending')}
                      </span>
                    )}
                    {applicant.status === 'flagged' && (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-500 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {t(lang, 'statusFlagged')}
                      </span>
                    )}
                    {applicant.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 font-bold text-rose-500 dark:text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {t(lang, 'statusRejected')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      data-testid="reject-dossier-btn"
                      onClick={() => handleDecision('rejected')}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 hover:brightness-110 text-white shadow-md shadow-rose-500/30 transition-all whitespace-nowrap cursor-pointer"
                    >
                      {t(lang, 'rejectDossierBtn')}
                    </button>
                    <button
                      type="button"
                      data-testid="approve-dossier-btn"
                      onClick={() => handleDecision('approved')}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:brightness-110 text-white shadow-md shadow-[#10b981]/30 transition-all whitespace-nowrap cursor-pointer"
                    >
                      {t(lang, 'approveDossierBtn')}
                    </button>
                  </div>
                </div>
              </>
            );
          })()}

          <div className="text-[11px] font-mono text-zinc-400 dark:text-[#8a8d98] text-center pt-0.5">
            {lang === 'ar'
              ? 'اختصارات لوحة المفاتيح: [J/K] التنقل · [A] موافقة · [R] رفض · [M] عدسة 4x · [C] شهادة البنك المركزي · [E] شرح الذكاء الاصطناعي'
              : 'Shortcuts: [J/K] Next/Prev · [A] Approve · [R] Reject · [M] 4x Loupe · [C] CBI Certificate · [E] AI Case Brief'}
          </div>
        </div>
      </div>

      {isCertificateModalOpen && (
        <OfficialCbiCertificateModal
          applicant={applicant}
          lang={lang}
          customExplanation={aiCaseBrief}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}
    </div>
  );
};
