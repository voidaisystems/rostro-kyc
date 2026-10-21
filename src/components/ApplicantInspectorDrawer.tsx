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
} from 'lucide-react';
import {
  evaluateForeignIdComplianceProtocol,
  type KYCApplicant,
  type Language,
  type VerificationStatus,
} from '../utils/kycEngine';
import {
  formatCryptoDigest,
  formatMrzForDisplay,
  formatReferenceCode,
  formatRiskTier,
  formatStage9Outcome,
  formatTimestamp,
  sanitizeTextForLanguage,
  t,
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
            <h2
              id="inspector-drawer-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1"
            >
              {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
            </h2>
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

                <div className="divide-y divide-zinc-200 dark:divide-[#1f1f23] text-xs">
                  <div
                    onMouseEnter={() => setHighlightedField('fullName')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('fullName')}
                  >
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {t(lang, 'fieldFullName')}
                    </span>
                    <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {lang === 'ar'
                        ? applicant.fullNameAr || sanitizeTextForLanguage(activeDoc.extractedFields.fullNameArabic || activeDoc.extractedFields.fullName, 'ar')
                        : applicant.fullNameEn || sanitizeTextForLanguage(activeDoc.extractedFields.fullName, 'en')}
                    </span>
                  </div>

                  {(activeDoc.extractedFields.givenName || activeDoc.slot1Summary?.givenName) && (
                    <div
                      onMouseEnter={() => setHighlightedField('givenName')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('givenName')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {t(lang, 'fieldGivenName')}
                      </span>
                      <span className="col-span-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {sanitizeTextForLanguage(
                          activeDoc.extractedFields.givenName || activeDoc.slot1Summary?.givenName || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

                  {(activeDoc.extractedFields.fatherName || activeDoc.slot1Summary?.fatherName) && (
                    <div
                      onMouseEnter={() => setHighlightedField('fatherName')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('fatherName')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {t(lang, 'fieldFatherName')}
                      </span>
                      <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                        {sanitizeTextForLanguage(
                          activeDoc.extractedFields.fatherName || activeDoc.slot1Summary?.fatherName || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

                  {(activeDoc.extractedFields.grandfatherName || activeDoc.slot1Summary?.grandfatherName) && (
                    <div
                      onMouseEnter={() => setHighlightedField('grandfatherName')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('grandfatherName')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {t(lang, 'fieldGrandfatherName')}
                      </span>
                      <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                        {sanitizeTextForLanguage(
                          activeDoc.extractedFields.grandfatherName || activeDoc.slot1Summary?.grandfatherName || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

                  {(activeDoc.extractedFields.surname || activeDoc.slot1Summary?.surname) && (
                    <div
                      onMouseEnter={() => setHighlightedField('surname')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('surname')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {t(lang, 'fieldSurname')}
                      </span>
                      <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                        {sanitizeTextForLanguage(
                          activeDoc.extractedFields.surname || activeDoc.slot1Summary?.surname || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

                  <div
                    onMouseEnter={() => setHighlightedField('normalizedName')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('normalizedName')}
                  >
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {t(lang, 'fieldNormalizedName')}
                    </span>
                    <span className="col-span-2 font-semibold text-emerald-700 dark:text-[#10b981]">
                      {lang === 'ar'
                        ? applicant.fullNameAr
                        : sanitizeTextForLanguage(
                            activeDoc.extractedFields.normalizedName || applicant.normalizedEntityName,
                            'en'
                          )}
                    </span>
                  </div>

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

                  {(activeDoc.extractedFields.motherName || activeDoc.slot1Summary?.motherName) && (
                    <div
                      onMouseEnter={() => setHighlightedField('motherName')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('motherName')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'اسم الأم' : "Mother's Name"}
                      </span>
                      <span className="col-span-2 font-semibold text-zinc-800 dark:text-zinc-200">
                        {sanitizeTextForLanguage(
                          activeDoc.extractedFields.motherName || activeDoc.slot1Summary?.motherName || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

                  <div
                    onMouseEnter={() => setHighlightedField('dob')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('dob')}
                  >
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {t(lang, 'fieldDob')}
                    </span>
                    <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                      {activeDoc.extractedFields.dob}
                    </span>
                  </div>

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

                  <div
                    onMouseEnter={() => setHighlightedField('expiryDate')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('expiryDate')}
                  >
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'تاريخ الإصدار والنفاذ' : 'Issue & Expiry Date'}
                    </span>
                    <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                      {activeDoc.issueDate} → {activeDoc.expiryDate}
                    </span>
                  </div>

                  {(activeDoc.extractedFields.familyNumber || activeDoc.slot1Summary?.familyNumber || activeDoc.slot2Summary?.familyNumber) && (
                    <div
                      onMouseEnter={() => setHighlightedField('familyNumber')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('familyNumber')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {t(lang, 'fieldCardSerialBottomLeft')}
                      </span>
                      <span className="col-span-2 font-mono font-bold text-emerald-700 dark:text-[#10b981]">
                        {formatReferenceCode(
                          activeDoc.extractedFields.familyNumber || activeDoc.slot1Summary?.familyNumber || activeDoc.slot2Summary?.familyNumber || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

                  {(activeDoc.extractedFields.edgeNumber || activeDoc.slot1Summary?.edgeNumber) && (
                    <div
                      onMouseEnter={() => setHighlightedField('edgeNumber')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('edgeNumber')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {t(lang, 'fieldEdgeNumber')}
                      </span>
                      <span className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">
                        {formatReferenceCode(
                          activeDoc.extractedFields.edgeNumber || activeDoc.slot1Summary?.edgeNumber || '',
                          lang
                        )}
                      </span>
                    </div>
                  )}

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

                  {(activeDoc.extractedFields.mrzLine1 || activeDoc.slot2Summary?.mrzLine1) && (
                    <div
                      onMouseEnter={() => setHighlightedField('mrz')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('mrz')}
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'شريط القراءة الآلي' : 'Machine Readable Zone'}
                      </span>
                      <div className="col-span-2 font-mono text-[10px] space-y-0.5 text-emerald-700 dark:text-emerald-300 bg-zinc-100 dark:bg-[#111113] p-1.5 rounded border border-zinc-200 dark:border-[#222225]">
                        <div>
                          {formatMrzForDisplay(
                            activeDoc.extractedFields.mrzLine1 || activeDoc.slot2Summary?.mrzLine1 || '',
                            lang
                          )}
                        </div>
                        {(activeDoc.extractedFields.mrzLine2 || activeDoc.slot2Summary?.mrzLine2) && (
                          <div>
                            {formatMrzForDisplay(
                              activeDoc.extractedFields.mrzLine2 || activeDoc.slot2Summary?.mrzLine2 || '',
                              lang
                            )}
                          </div>
                        )}
                        {(activeDoc.extractedFields.mrzLine3 || activeDoc.slot2Summary?.mrzLine3) && (
                          <div>
                            {formatMrzForDisplay(
                              activeDoc.extractedFields.mrzLine3 || activeDoc.slot2Summary?.mrzLine3 || '',
                              lang
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
