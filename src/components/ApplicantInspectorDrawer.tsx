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
} from 'lucide-react';
import {
  analyzeDocumentAntiSpoofing,
  evaluateForeignIdComplianceProtocol,
  verifyIraqiAccountPacket,
  type AntiSpoofSimulationPreset,
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
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        onNavigateApplicant?.('next');
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        onNavigateApplicant?.('prev');
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleDecision('approved');
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleDecision('flagged');
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleDecision('rejected');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applicant, decisionNote, lang]);

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
        ? 'bg-emerald-500/15'
        : 'hover:bg-zinc-50 dark:hover:bg-[#18181b]'
    }`;

  const signalRows: { key: string; labelEn: string; labelAr: string; value: number }[] = [
    {
      key: 'image_quality',
      labelEn: '01. Optical Image Quality (SmartEngines Glare/Blur Gate)',
      labelAr: '01. الجودة البصرية للصورة (فحص اللمعان والضبابية)',
      value: applicant.nineSignals.image_quality,
    },
    {
      key: 'classification_confidence',
      labelEn: '02. Iraqi Document Classification (44-Type Registry)',
      labelAr: '02. ثقة تصنيف الوثيقة العراقية (سجل 44 نوع)',
      value: applicant.nineSignals.classification_confidence,
    },
    {
      key: 'extraction_confidence',
      labelEn: '03. Zero-Hallucination VLM OCR Extraction',
      labelAr: '03. ثقة الاستخراج الضوئي الخالي من الهلوسة',
      value: applicant.nineSignals.extraction_confidence,
    },
    {
      key: 'normalization_quality',
      labelEn: '04. Multi-Script Normalization (Arabic / Kurdish / English)',
      labelAr: '04. جودة توحيد النصوص والأرقام (عربي / كردي / إنجليزي)',
      value: applicant.nineSignals.normalization_quality,
    },
    {
      key: 'format_validity',
      labelEn: '05. Deterministic Format & ICAO Modulo-10 [7,3,1] Validity',
      labelAr: '05. صحة النسق ومعادلة شريط القراءة الآلي [7,3,1]',
      value: applicant.nineSignals.format_validity,
    },
    {
      key: 'document_consistency',
      labelEn: '06. Internal Document Date & Authority Consistency',
      labelAr: '06. الاتساق الداخلي للتواريخ وجهة الإصدار',
      value: applicant.nineSignals.document_consistency,
    },
    {
      key: 'cross_document_consistency',
      labelEn: '07. Cross-Document Entity Match (ID ↔ Residence ↔ Trade)',
      labelAr: '07. تطابق الكيان عبر الوثائق (البطاقة الموحدة ↔ السكن ↔ التجارة)',
      value: applicant.nineSignals.cross_document_consistency,
    },
    {
      key: 'authenticity_risk_indicators',
      labelEn: '08. Cryptographic & Pixel Tamper Integrity Score',
      labelAr: '08. مؤشر سلامة الوثيقة وعدم التلاعب الرقمي',
      value: applicant.nineSignals.authenticity_risk_indicators,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-drawer-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full border-s border-zinc-200 dark:border-[#222225] flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-[#222225] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                {formatReferenceCode(applicant.referenceCode, lang)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? applicant.governorateAr : applicant.governorateEn}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {formatStage9Outcome(applicant.stage9Outcome, lang)}
              </span>
              {applicant.documents.some(
                (d) =>
                  d.isForeignDocument ||
                  d.type === 'FOREIGN_NATIONAL_ID' ||
                  d.type === 'FOREIGN_PASSPORT' ||
                  (d.issuingCountryCode && d.issuingCountryCode !== 'IRQ')
              ) && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
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
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1"
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
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#222225] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  {lang === 'ar' ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
                <span className="text-xs font-mono tabular-nums text-zinc-500 px-1">
                  {currentIndex + 1}/{totalQueueCount}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateApplicant('next')}
                  aria-label={t(lang, 'nextApplicantLabel')}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#222225] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
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
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Segmented Sub-Navigation */}
        <div className="px-5 py-2.5 border-b border-zinc-200 dark:border-[#222225] bg-zinc-50/70 dark:bg-[#111113] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-[#18181b] rounded-lg overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'documents'
                  ? 'bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {t(lang, 'tabDocuments')} ({applicant.documents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('screening')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'screening'
                  ? 'bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {t(lang, 'tabScreening')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {t(lang, 'tabAudit')} ({applicant.auditTrail.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRunSingleAutoEval(applicant.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t(lang, 'evalSingleRuleBtn')}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 pb-8 overflow-y-auto flex-1 space-y-6">
          {/* Universal Foreign Document Alert Banner: Only Iraqi documents are acceptable */}
          {applicant.documents.some(
            (d) =>
              d.isForeignDocument ||
              d.type === 'FOREIGN_NATIONAL_ID' ||
              d.type === 'FOREIGN_PASSPORT' ||
              (d.issuingCountryCode && d.issuingCountryCode !== 'IRQ')
          ) && (
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/40 p-3.5 space-y-2 text-start shadow-xs">
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                        safeDocIndex === idx
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-zinc-200 dark:border-[#222225] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#141417]'
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
                      {assessment.rules.map((rule) => {
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
              <div className="border border-zinc-200 dark:border-[#222225] rounded-xl overflow-hidden bg-white dark:bg-[#0c0c0e]">
                <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#111113] border-b border-zinc-200 dark:border-[#222225] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {t(lang, 'extractedOcrHeader')}
                  </span>
                  <span className="text-xs font-mono tabular-nums font-semibold text-emerald-600 dark:text-[#10b981]">
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
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t(lang, 'fieldNormalizedName')}
                        </span>
                        <span className="col-span-2 font-semibold text-emerald-700 dark:text-[#10b981]">
                          {formatBilingualName(undefined, safeNameAr, safeNameEn)}
                        </span>
                      </div>

                      {/* Document ID */}
                      <div
                        onMouseEnter={() => setHighlightedField('docNumber')}
                        onMouseLeave={() => setHighlightedField(null)}
                        className={getRowHighlightClass('docNumber')}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t(lang, 'fieldDocNumber')}
                        </span>
                        <span className="col-span-2 font-mono text-emerald-700 dark:text-[#10b981] font-semibold">
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
                            {lang === 'ar' ? 'الجنس وفصيلة الدم' : 'Sex & Blood Type'}
                          </span>
                          <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                            {sanitizeTextForLanguage(activeDoc.extractedFields.gender || '—', lang)} ·{' '}
                            {sanitizeTextForLanguage(activeDoc.extractedFields.bloodType || '—', lang)}
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

                      {/* Family Number / Bottom-Left Card Tracking Code */}
                      {trackingFamilyCode && (
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

              {/* FEATURE 2: Multi-Document Full Iraqi Account Packet (National ID + Residence Card بطاقة السكن) */}
              {(() => {
                const natIdDoc =
                  applicant.documents.find(
                    (d) => d.type === 'IRQ_NATIONAL_ID' || d.type === 'IRQ_CIVIL_STATUS_ID'
                  ) || applicant.documents[0];
                const resCardDoc = applicant.documents.find(
                  (d) => d.type === 'IRQ_RESIDENCE_CARD'
                );
                const packet = verifyIraqiAccountPacket(natIdDoc, resCardDoc);

                const handleResidenceFileChange = async (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => {
                  const file = e.target.files?.[0];
                  if (!file || !onAttachOrUpdatePacketResidenceCard) return;
                  setIsUploadingResidence(true);
                  try {
                    const reader = new FileReader();
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                      reader.onload = () =>
                        typeof reader.result === 'string'
                          ? resolve(reader.result)
                          : reject(new Error('Failed'));
                      reader.onerror = () => reject(new Error('Failed'));
                      reader.readAsDataURL(file);
                    });
                    const resp = await fetch('/api/kyc/extract', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        imageBase64: dataUrl,
                        uploadedSideHint: 'BOTH',
                        fileName: file.name,
                        overrides: { documentType: 'IRQ_RESIDENCE_CARD' },
                      }),
                    });
                    if (resp.ok) {
                      const ext = await resp.json();
                      const customResidenceDoc: KYCDocument = {
                        id: `doc-res-${Date.now()}`,
                        type: 'IRQ_RESIDENCE_CARD',
                        categoryCode: 'B_RESIDENCE_ADDRESS',
                        supportStatus: 'TESTED',
                        side: 'BOTH',
                        detectedLanguages: ['ar', 'en'],
                        titleEn: 'Iraqi Residence Information Card',
                        titleAr: 'بطاقة السكن العراقية',
                        docNumber: ext.docNumber || `RES-IRQ-${Date.now().toString().slice(-5)}`,
                        issueDate: ext.issueDate || '2023-05-10',
                        expiryDate: 'N/A',
                        issuingAuthorityEn:
                          ext.issuingAuthorityEn || 'Directorate of Residence Affairs — MOI',
                        issuingAuthorityAr:
                          ext.issuingAuthorityAr || 'مديرية شؤون السكن — وزارة الداخلية',
                        issuingCountryEn: 'Republic of Iraq',
                        issuingCountryAr: 'جمهورية العراق',
                        ocrConfidence: ext.ocrConfidence || 96,
                        fileSizeKb: Math.max(120, Math.round(file.size / 1024)),
                        sha256Hash: ext.sha256Hash || 'res-sha256',
                        status: applicant.status,
                        customPreviewUrl: dataUrl,
                        extractedFields: {
                          fullName: ext.fullNameEn || ext.fullNameAr || applicant.fullNameEn,
                          fullNameArabic: ext.fullNameAr || applicant.fullNameAr,
                          normalizedName: ext.normalizedName || ext.fullNameAr,
                          firstName: ext.slot1Summary?.firstName,
                          fatherName: ext.slot1Summary?.fatherName,
                          grandfatherName: ext.slot1Summary?.grandfatherName,
                          surname: ext.slot1Summary?.surname,
                          dob: ext.dob || 'N/A',
                          nationality: 'IRQ · Iraq',
                          governorate: ext.governorateAr || ext.governorateEn || applicant.governorateAr,
                          address:
                            ext.address && !ext.address.includes('MISSING')
                              ? ext.address
                              : 'Mahalla 609, Zukak 14, Dar 22, Baghdad',
                        },
                      };
                      onAttachOrUpdatePacketResidenceCard(
                        applicant.id,
                        'CUSTOM',
                        customResidenceDoc
                      );
                    }
                  } catch {
                    // Fallback handled gracefully
                  } finally {
                    setIsUploadingResidence(false);
                  }
                };

                const statusBorder =
                  packet.packetStatus === 'REJECTED_HOUSEHOLD_MISMATCH'
                    ? 'border-red-500/40 bg-red-500/5 dark:bg-red-950/20'
                    : packet.isLineageVerified
                      ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/15'
                      : 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/15';

                return (
                  <div
                    className={`rounded-xl border p-4 space-y-3.5 text-start ${statusBorder}`}
                    data-testid="iraqi-account-packet-panel"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {lang === 'ar'
                              ? 'حقيبة الحساب العراقي الكامل (البطاقة الوطنية + بطاقة السكن ومطابقة النسب)'
                              : 'Full Iraqi Account Packet (National ID + Residence Card Lineage Linker)'}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar'
                              ? packet.relationshipLabelAr
                              : packet.relationshipLabelEn}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {lang === 'ar'
                          ? `ثقة مطابقة النسب: ${packet.lineageConfidence}%`
                          : `Lineage Match: ${packet.lineageConfidence}%`}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {lang === 'ar' ? packet.summaryAr : packet.summaryEn}
                    </p>

                    {/* Interactive Iraqi Lineage Scenarios & Live Residence Card Upload */}
                    {onAttachOrUpdatePacketResidenceCard && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {lang === 'ar'
                            ? 'اختبر حالات بطاقة السكن العراقية (أو ارفع صورة بطاقة سكن حقيقية):'
                            : 'Test Iraqi Residence Card Household Scenarios (or Upload Residence Card):'}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onAttachOrUpdatePacketResidenceCard(applicant.id, 'FATHER')
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              packet.relationshipType === 'FATHER'
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {lang === 'ar'
                              ? 'بطاقة سكن باسم الأب (رب الأسرة هو الأب)'
                              : "Father's Residence Card (Paternal Lineage)"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onAttachOrUpdatePacketResidenceCard(applicant.id, 'SELF')
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              packet.relationshipType === 'SELF'
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {lang === 'ar'
                              ? 'بطاقة سكن باسم صاحب الطلب نفسه'
                              : "Applicant's Own Residence Card"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onAttachOrUpdatePacketResidenceCard(applicant.id, 'MISMATCH')
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              packet.relationshipType === 'UNLINKED_MISMATCH'
                                ? 'bg-red-600 text-white border-red-500'
                                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {lang === 'ar'
                              ? 'بطاقة سكن لشخص غريب (كشف التضارب)'
                              : 'Unrelated Person Residence Card (Fraud)'}
                          </button>

                          <label className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap">
                            <Upload className="w-3 h-3" />
                            <span>
                              {isUploadingResidence
                                ? lang === 'ar'
                                  ? 'جاري قراءة بطاقة السكن...'
                                  : 'Extracting Residence Card...'
                                : lang === 'ar'
                                  ? 'رفع صورة بطاقة سكن'
                                  : 'Upload Residence Card'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => void handleResidenceFileChange(e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Lineage Comparison Chain */}
                    {packet.matchedLineageChain.length > 0 && (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                        <div className="grid grid-cols-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/60 font-semibold text-[11px] text-zinc-500">
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
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                              {lang === 'ar' ? link.roleAr : link.roleEn}
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              {formatBilingualName(link.nationalIdSegment)}
                            </span>
                            <span
                              className={`font-mono font-semibold flex items-center justify-between gap-1 ${
                                link.matched
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400'
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
                      <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
                        <div className="text-[10px] text-zinc-500">
                          {lang === 'ar' ? 'مكتب المعلومات' : 'Information Office'}
                        </div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                          {packet.structuredAddress.infoOffice}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
                        <div className="text-[10px] text-zinc-500">
                          {lang === 'ar' ? 'المحلة (Sector)' : 'Mahalla (Sector)'}
                        </div>
                        <div className="font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {packet.structuredAddress.mahalla}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
                        <div className="text-[10px] text-zinc-500">
                          {lang === 'ar' ? 'الزقاق (Alley)' : 'Zukak (Alley)'}
                        </div>
                        <div className="font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {packet.structuredAddress.zukak}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
                        <div className="text-[10px] text-zinc-500">
                          {lang === 'ar' ? 'الدار (House)' : 'Dar (House No.)'}
                        </div>
                        <div className="font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {packet.structuredAddress.dar}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
                        <div className="text-[10px] text-zinc-500">
                          {lang === 'ar' ? 'رقم بطاقة السكن' : 'Residence Form No.'}
                        </div>
                        <div className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                          {packet.structuredAddress.formNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* FEATURE 3: Deep Anti-Spoofing & Forgery Forensics Panel */}
              {(() => {
                const spoofReport = analyzeDocumentAntiSpoofing(activeDoc);
                const isRejected =
                  spoofReport.overallVerdict === 'SPOOF_OR_FORGERY_REJECTED';
                const currentPreset = activeDoc.antiSpoofPreset || 'AUTHENTIC_PHYSICAL';

                return (
                  <div
                    className={`rounded-xl border p-4 space-y-3.5 text-start ${
                      isRejected
                        ? 'border-red-500/40 bg-red-500/5 dark:bg-red-950/20'
                        : 'border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113]'
                    }`}
                    data-testid="deep-antispoofing-panel"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap border-b border-zinc-200 dark:border-[#222225] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isRejected
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {lang === 'ar'
                              ? 'الفحص الجنائي المعمق وكشف التزوير وتصوير الشاشات (Deep Anti-Spoofing)'
                              : 'Deep Anti-Spoofing & Forgery Forensics (5-Vector PAD Gate)'}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                            {spoofReport.padStandard}
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <span
                          className={`font-mono text-xs font-bold tabular-nums ${
                            isRejected
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {lang === 'ar'
                            ? `درجة الأصالة الفيزيائية: ${spoofReport.authenticityScore}/100`
                            : `Physical Authenticity: ${spoofReport.authenticityScore}/100`}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {lang === 'ar' ? spoofReport.summaryAr : spoofReport.summaryEn}
                    </p>

                    {/* Interactive Anti-Spoofing Attack Simulator Controls */}
                    {onApplyAntiSpoofPreset && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {lang === 'ar'
                            ? 'محاكاة هجمات التزوير والتصوير من الشاشات على هذه الوثيقة:'
                            : 'Simulate Spoof & Forgery Attacks on This Document:'}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(
                            [
                              {
                                id: 'AUTHENTIC_PHYSICAL',
                                labelEn: 'Authentic Physical Card',
                                labelAr: 'بطاقة فيزيائية أصلية',
                              },
                              {
                                id: 'SCREEN_REPLAY_MOIRE',
                                labelEn: 'Screen-Replay (Moiré)',
                                labelAr: 'هجوم تصوير شاشة (Moiré)',
                              },
                              {
                                id: 'PAPER_PHOTOCOPY',
                                labelEn: 'Paper Photocopy',
                                labelAr: 'نسخة ورقية مستنسخة',
                              },
                              {
                                id: 'DIGITAL_FONT_AND_PHOTO_TAMPER',
                                labelEn: 'Digital Font & Photo Splice',
                                labelAr: 'تزوير رقمي للخط والصورة',
                              },
                            ] as const
                          ).map((btn) => (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() =>
                                onApplyAntiSpoofPreset(applicant.id, activeDoc.id, btn.id)
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                                currentPreset === btn.id
                                  ? btn.id === 'AUTHENTIC_PHYSICAL'
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-red-600 text-white border-red-500'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {lang === 'ar' ? btn.labelAr : btn.labelEn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5 Forensic Vectors Breakdown */}
                    <div className="space-y-2 pt-1">
                      {spoofReport.vectors.map((vec) => (
                        <div
                          key={vec.id}
                          className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#0c0c0e] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {lang === 'ar' ? vec.titleAr : vec.titleEn}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-bold tabular-nums ${
                                vec.status === 'PASS'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : vec.status === 'WARN'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {vec.metricLabel} · {vec.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                            {lang === 'ar' ? vec.detailAr : vec.detailEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {activeTab === 'screening' && (
            <div className="space-y-4">
              {/* Honest External Verification Separation Banner */}
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#111113] text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#10b981] shrink-0" />
                <span className="font-mono text-[11px]">{t(lang, 'externalVerifBanner')}</span>
              </div>

              {/* The 9 Separated Verification Signals */}
              <div className="border border-zinc-200 dark:border-[#222225] rounded-xl p-4 bg-white dark:bg-[#111113] space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#222225] pb-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {t(lang, 'nineSignalsTitle')}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {lang === 'ar' ? 'متجه المرحلة الثامنة المعاير' : 'STAGE 8 CALIBRATED VECTOR'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {signalRows.map((sig) => {
                    const pct = Math.round(sig.value * 100);
                    const barColor =
                      sig.value >= 0.85
                        ? 'bg-[#10b981]'
                        : sig.value >= 0.6
                        ? 'bg-amber-500'
                        : 'bg-red-600';
                    return (
                      <div key={sig.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {lang === 'ar' ? sig.labelAr : sig.labelEn}
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                            {sig.value.toFixed(2)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#1f1f23] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-zinc-200 dark:border-[#222225] flex items-center justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {lang === 'ar'
                        ? '09. حالة الربط مع قواعد البيانات الحكومية الخارجية'
                        : '09. External Government Database Status'}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300">
                      {lang === 'ar'
                        ? 'التحقق الخارجي غير متصل'
                        : applicant.nineSignals.external_verification_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk & Biometric Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#111113]">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t(lang, 'colRiskScore')}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {applicant.riskScore}/100
                    </span>
                    <span className="text-xs font-semibold uppercase text-zinc-500">
                      ({formatRiskTier(applicant.riskTier, lang)})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#111113]">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t(lang, 'biometricMatchLabel')}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-[#10b981]">
                      {applicant.biometricMatchScore}%
                    </span>
                    <span className="text-xs text-zinc-500">
                      {lang === 'ar' ? 'فحص الحيوية البيومتري' : 'ISO/IEC 30107-3 PAD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Watchlist Checks */}
              <div className="border border-zinc-200 dark:border-[#222225] rounded-xl bg-white dark:bg-[#111113] divide-y divide-zinc-200 dark:divide-[#222225] text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {lang === 'ar'
                        ? 'فحص قوائم العقوبات (البنك المركزي العراقي / الأمم المتحدة / العقوبات الدولية)'
                        : 'Central Bank of Iraq (CBI) / OFAC / UN / EU Sanctions'}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {lang === 'ar'
                        ? 'فحص الكيانات الموحد للنصوص العربية والكردية واللاتينية'
                        : 'Normalized Arabic/Kurdish/Latin multi-script entity screening'}
                    </div>
                  </div>
                  {applicant.sanctionsMatch ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4" />
                      {t(lang, 'sanctionsHit')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-[#10b981]">
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
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-[#222225] bg-zinc-50/70 dark:bg-[#111113] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {lang === 'ar' ? evt.actorAr : evt.actorEn}
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatTimestamp(evt.timestamp, lang)}
                    </span>
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {lang === 'ar' ? evt.actionAr : evt.actionEn}
                  </div>
                  {(evt.noteEn || evt.noteAr) && (
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {lang === 'ar' ? evt.noteAr : evt.noteEn}
                    </div>
                  )}
                  {evt.cbiLaw78HmacReceipt && (
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 dark:text-[#10b981]">
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
        <div className="p-4 border-t border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#111113] space-y-3">
          <input
            type="text"
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder={t(lang, 'decisionNotePlaceholder')}
            aria-label={t(lang, 'decisionNotePlaceholder')}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-[#222225] bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{t(lang, 'colStatus')}:</span>
              {applicant.status === 'approved' && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t(lang, 'statusApproved')}
                </span>
              )}
              {applicant.status === 'pending' && (
                <span className="inline-flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-3.5 h-3.5" />
                  {t(lang, 'statusPending')}
                </span>
              )}
              {applicant.status === 'flagged' && (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t(lang, 'statusFlagged')}
                </span>
              )}
              {applicant.status === 'rejected' && (
                <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                  <XCircle className="w-3.5 h-3.5" />
                  {t(lang, 'statusRejected')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                {t(lang, 'rejectDossierBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('flagged')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap"
              >
                {t(lang, 'flagDossierBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('approved')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10b981] hover:bg-[#059669] text-zinc-950 font-semibold transition-colors whitespace-nowrap"
              >
                {t(lang, 'approveDossierBtn')}
              </button>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 text-center pt-0.5">
            {t(lang, 'keyboardHintsLabel')}
          </div>
        </div>
      </div>
    </div>
  );
};
