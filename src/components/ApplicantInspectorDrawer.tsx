/**
 * Copyright (c) 2026 Rostro Compliance Systems (مشروع روسترو للامتثال).
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 * @file src/components/ApplicantInspectorDrawer.tsx
 * @module @rostro/ui/ApplicantInspectorDrawer
 * @description
 * Detailed Case Inspection & Adjudication Drawer for Compliance Officers.
 * Displays the 9 independently inspectable verification signals, dual-side physical card status,
 * OCR spatial bounding-box alignment, multi-script normalization, and cryptographically signed
 * human adjudication controls (`/api/kyc/adjudicate`).
 */

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
} from 'lucide-react';
import type { KYCApplicant, Language, VerificationStatus } from '../utils/kycEngine';
import { t } from '../utils/i18n';
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
        ? 'Escalated to HUMAN_REVIEW for secondary Iraqi document verification.'
        : 'Rejected due to CBI / AML compliance or Modulo-10 check-digit failure.';
    const defaultNoteAr =
      newStatus === 'approved'
        ? 'تم التدقيق والاعتماد بموجب قانون التوقيع الإلكتروني العراقي رقم 78 لسنة 2012.'
        : newStatus === 'flagged'
        ? 'تم التحويل للمراجعة البشرية (HUMAN_REVIEW) لتدقيق الوثائق العراقية.'
        : 'تم الرفض لمخالفة ضوابط البنك المركزي العراقي أو فشل معادلة Modulo-10.';

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
        ? 'bg-blue-50/90 dark:bg-blue-950/50'
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
      labelEn: '04. Multi-Script Normalization (AR / KU Sorani / EN)',
      labelAr: '04. جودة توحيد النصوص والأرقام (عربي / كردي / إنجليزي)',
      value: applicant.nineSignals.normalization_quality,
    },
    {
      key: 'format_validity',
      labelEn: '05. Deterministic Format & ICAO Modulo-10 [7,3,1] Validity',
      labelAr: '05. صحة النسق ومعادلة شريط القراءة الآلي Modulo-10',
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
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-drawer-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full border-s border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {applicant.referenceCode}
              </span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? applicant.governorateAr : applicant.governorateEn}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300">
                {applicant.stage9Outcome}
              </span>
            </div>
            <h2
              id="inspector-drawer-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5"
            >
              {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ms-2">
                ({lang === 'ar' ? applicant.fullNameEn : applicant.fullNameAr})
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {onNavigateApplicant && totalQueueCount > 1 && (
              <div className="flex items-center gap-1 me-2">
                <button
                  type="button"
                  onClick={() => onNavigateApplicant('prev')}
                  aria-label={t(lang, 'prevApplicantLabel')}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'ar' ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
                <span className="text-xs font-mono tabular-nums text-slate-500 px-1">
                  {currentIndex + 1}/{totalQueueCount}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateApplicant('next')}
                  aria-label={t(lang, 'nextApplicantLabel')}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Segmented Sub-Navigation */}
        <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'documents'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t(lang, 'tabDocuments')} ({applicant.documents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('screening')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'screening'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t(lang, 'tabScreening')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t(lang, 'tabAudit')} ({applicant.auditTrail.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRunSingleAutoEval(applicant.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t(lang, 'evalSingleRuleBtn')}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 pb-8 overflow-y-auto flex-1 space-y-6">
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
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                      <span className="font-semibold">UNKNOWN_DOCUMENT Fallback Active:</span>{' '}
                      Officer can promote this unconfigured Iraqi syndicate card to the 44-Type
                      Registry.
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
                highlightedField={highlightedField}
                onHoverField={setHighlightedField}
              />

              {/* Extracted OCR & Multi-Script Normalization Key-Value Grid */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t(lang, 'extractedOcrHeader')}
                  </span>
                  <span className="text-xs font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    {t(lang, 'ocrConfidenceLabel')}: {activeDoc.ocrConfidence}%
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  <div
                    onMouseEnter={() => setHighlightedField('fullName')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('fullName')}
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldFullName')}
                    </span>
                    <span className="col-span-2 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {activeDoc.extractedFields.fullName}
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setHighlightedField('normalizedName')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('normalizedName')}
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldNormalizedName')}
                    </span>
                    <span className="col-span-2 font-semibold text-emerald-700 dark:text-emerald-400">
                      {activeDoc.extractedFields.normalizedName || applicant.normalizedEntityName}
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setHighlightedField('docNumber')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('docNumber')}
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldDocNumber')}
                    </span>
                    <span className="col-span-2 font-mono text-blue-700 dark:text-blue-400 font-semibold">
                      {activeDoc.docNumber}
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setHighlightedField('dob')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('dob')}
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldDob')}
                    </span>
                    <span className="col-span-2 font-mono text-slate-800 dark:text-slate-200">
                      {activeDoc.extractedFields.dob}
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setHighlightedField('nationality')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('nationality')}
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldNationality')}
                    </span>
                    <span className="col-span-2 font-mono text-slate-800 dark:text-slate-200">
                      {activeDoc.extractedFields.nationality} · {activeDoc.issuingAuthorityEn}
                    </span>
                  </div>

                  <div
                    onMouseEnter={() => setHighlightedField('expiryDate')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={getRowHighlightClass('expiryDate')}
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldExpiryDate')}
                    </span>
                    <span className="col-span-2 font-mono text-slate-800 dark:text-slate-200">
                      {activeDoc.issueDate} → {activeDoc.expiryDate}
                    </span>
                  </div>

                  {activeDoc.extractedFields.address && (
                    <div
                      onMouseEnter={() => setHighlightedField('address')}
                      onMouseLeave={() => setHighlightedField(null)}
                      className={getRowHighlightClass('address')}
                    >
                      <span className="text-slate-500 dark:text-slate-400">
                        {t(lang, 'fieldAddress')}
                      </span>
                      <span className="col-span-2 font-mono text-slate-800 dark:text-slate-200">
                        {activeDoc.extractedFields.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'screening' && (
            <div className="space-y-4">
              {/* Honest External Verification Separation Banner */}
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-mono text-[11px]">{t(lang, 'externalVerifBanner')}</span>
              </div>

              {/* The 9 Separated Verification Signals */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {t(lang, 'nineSignalsTitle')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    STAGE 8 CALIBRATED VECTOR
                  </span>
                </div>

                <div className="space-y-2.5">
                  {signalRows.map((sig) => {
                    const pct = Math.round(sig.value * 100);
                    const barColor =
                      sig.value >= 0.85
                        ? 'bg-emerald-600 dark:bg-emerald-500'
                        : sig.value >= 0.6
                        ? 'bg-amber-500'
                        : 'bg-red-600';
                    return (
                      <div key={sig.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300">
                            {lang === 'ar' ? sig.labelAr : sig.labelEn}
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {sig.value.toFixed(2)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      09. External Government Database Status
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {applicant.nineSignals.external_verification_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk & Biometric Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t(lang, 'colRiskScore')}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {applicant.riskScore}/100
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      ({applicant.riskTier})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t(lang, 'biometricMatchLabel')}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {applicant.biometricMatchScore}%
                    </span>
                    <span className="text-xs text-slate-500">ISO/IEC 30107-3 PAD</span>
                  </div>
                </div>
              </div>

              {/* Watchlist Checks */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Central Bank of Iraq (CBI) / OFAC / UN / EU Sanctions
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Normalized Arabic/Kurdish/Latin multi-script entity screening
                    </div>
                  </div>
                  {applicant.sanctionsMatch ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4" />
                      {t(lang, 'sanctionsHit')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
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
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'ar' ? evt.actorAr : evt.actorEn}
                    </span>
                    <span className="font-mono tabular-nums">{evt.timestamp}</span>
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {lang === 'ar' ? evt.actionAr : evt.actionEn}
                  </div>
                  {(evt.noteEn || evt.noteAr) && (
                    <div className="text-slate-600 dark:text-slate-400">
                      {lang === 'ar' ? evt.noteAr : evt.noteEn}
                    </div>
                  )}
                  {evt.cbiLaw78HmacReceipt && (
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>CBI Law No. 78 Receipt: {evt.cbiLaw78HmacReceipt}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Adjudication Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
          <input
            type="text"
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder={t(lang, 'decisionNotePlaceholder')}
            aria-label={t(lang, 'decisionNotePlaceholder')}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t(lang, 'colStatus')}:</span>
              {applicant.status === 'approved' && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t(lang, 'statusApproved')}
                </span>
              )}
              {applicant.status === 'pending' && (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors whitespace-nowrap shrink-0"
              >
                {t(lang, 'rejectDossierBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('flagged')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors whitespace-nowrap shrink-0"
              >
                {t(lang, 'flagDossierBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('approved')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors whitespace-nowrap shrink-0"
              >
                {t(lang, 'approveDossierBtn')}
              </button>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 text-center pt-0.5">
            {t(lang, 'keyboardHintsLabel')}
          </div>
        </div>
      </div>
    </div>
  );
};
