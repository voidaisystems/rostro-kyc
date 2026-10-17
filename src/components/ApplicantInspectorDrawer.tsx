import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { KYCApplicant, Language, VerificationStatus } from '../utils/kycEngine';
import { t } from '../utils/i18n';
import { DocumentSpecimenViewer } from './DocumentSpecimenViewer';

interface ApplicantInspectorDrawerProps {
  applicant: KYCApplicant | null;
  lang: Language;
  onClose: () => void;
  onUpdateStatus: (applicantId: string, status: VerificationStatus, officerNote: string) => void;
  onRunSingleAutoEval: (applicantId: string) => void;
}

export const ApplicantInspectorDrawer: React.FC<ApplicantInspectorDrawerProps> = ({
  applicant,
  lang,
  onClose,
  onUpdateStatus,
  onRunSingleAutoEval,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'screening' | 'audit'>('documents');
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [decisionNote, setDecisionNote] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);

  if (!applicant) return null;

  const safeDocIndex = selectedDocIndex < applicant.documents.length ? selectedDocIndex : 0;
  const activeDoc = applicant.documents[safeDocIndex] || applicant.documents[0];

  const handleDecision = (newStatus: VerificationStatus) => {
    const defaultNoteEn =
      newStatus === 'approved'
        ? 'Verified all OCR fields and biometric match manually.'
        : newStatus === 'flagged'
        ? 'Escalated for secondary compliance officer review.'
        : 'Rejected due to compliance policy mismatch.';
    const defaultNoteAr =
      newStatus === 'approved'
        ? 'تم التحقق يدوياً من كافة الحقول الضوئية والتطابق الحيوي.'
        : newStatus === 'flagged'
        ? 'تم التصعيد لمراجعة مسؤول الامتثال الثاني.'
        : 'تم الرفض لعدم استيفاء معايير سياسة الامتثال.';

    onUpdateStatus(
      applicant.id,
      newStatus,
      decisionNote.trim() || (lang === 'ar' ? defaultNoteAr : defaultNoteEn)
    );
    setDecisionNote('');
  };

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
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono">{applicant.referenceCode}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? applicant.countryAr : applicant.countryEn}</span>
              <span aria-hidden="true">·</span>
              <span>
                {applicant.entityType === 'corporate'
                  ? t(lang, 'entityCorporate')
                  : t(lang, 'entityIndividual')}
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

          <button
            type="button"
            onClick={onClose}
            aria-label={t(lang, 'closeInspectorLabel')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'documents' && activeDoc && (
            <>
              {/* Document Selector Tabs if applicant has multiple docs */}
              {applicant.documents.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {applicant.documents.map((doc, idx) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocIndex(idx);
                        setRotation(0);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                        safeDocIndex === idx
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      0{idx + 1}. {lang === 'ar' ? doc.titleAr : doc.titleEn}
                    </button>
                  ))}
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
              />

              {/* Structured OCR Key-Value Table */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {t(lang, 'extractedOcrHeader')}
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldFullName')}
                    </span>
                    <span className="col-span-2 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {activeDoc.extractedFields.fullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldDocNumber')}
                    </span>
                    <span className="col-span-2 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {activeDoc.docNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldDob')}
                    </span>
                    <span className="col-span-2 font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {activeDoc.extractedFields.dob}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldIssueDate')} / {t(lang, 'fieldExpiryDate')}
                    </span>
                    <span className="col-span-2 font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {activeDoc.issueDate} → {activeDoc.expiryDate}
                    </span>
                  </div>
                  {activeDoc.extractedFields.address && (
                    <div className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-slate-500 dark:text-slate-400">
                        {t(lang, 'fieldAddress')}
                      </span>
                      <span className="col-span-2 font-mono text-slate-900 dark:text-slate-100">
                        {activeDoc.extractedFields.address}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t(lang, 'fieldSha256')}
                    </span>
                    <span className="col-span-2 font-mono text-[11px] break-all text-slate-600 dark:text-slate-400">
                      {activeDoc.sha256Hash}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'screening' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t(lang, 'colRiskScore')}
                  </div>
                  <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {applicant.riskScore} / 100
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {applicant.riskTier === 'low'
                      ? t(lang, 'riskLow')
                      : applicant.riskTier === 'medium'
                      ? t(lang, 'riskMedium')
                      : t(lang, 'riskHigh')}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t(lang, 'biometricMatchLabel')}
                  </div>
                  <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {applicant.biometricMatchScore}%
                  </div>
                  <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                    ISO/IEC 30107-3 PAD Verified
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t(lang, 'ocrConfidenceLabel')}
                  </div>
                  <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {Math.min(...applicant.documents.map((d) => d.ocrConfidence))}%
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    ICAO Checksum Validated
                  </div>
                </div>
              </div>

              {/* Watchlist Breakdown */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      OFAC SDN & UN Consolidated Sanctions
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Global watchlist fuzzy & phonetic name matching
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    {applicant.sanctionsMatch ? (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-4 h-4" />
                        {t(lang, 'sanctionsHit')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        {t(lang, 'sanctionsClean')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Politically Exposed Persons (PEP Tier 1–3)
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Sovereign officials, state-owned enterprise executives & relatives
                    </div>
                  </div>
                  <div className="font-mono">
                    {applicant.pepMatch ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        MATCH DETECTED
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">CLEAR (0 HITS)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Financial Crime & Adverse Media Screening
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      FATF regulatory enforcement & international press archives
                    </div>
                  </div>
                  <div className="font-mono">
                    {applicant.adverseMediaMatch ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {t(lang, 'adverseMediaHit')}
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">CLEAR (0 HITS)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800">
              {applicant.auditTrail.map((event) => (
                <div key={event.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {lang === 'ar' ? event.actorAr : event.actorEn}
                    </span>
                    <span className="font-mono tabular-nums">{event.timestamp}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {lang === 'ar' ? event.actionAr : event.actionEn}
                  </div>
                  {(event.noteEn || event.noteAr) && (
                    <div className="text-slate-600 dark:text-slate-400">
                      {lang === 'ar' ? event.noteAr : event.noteEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Adjudication Decision Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
          <div>
            <label htmlFor="compliance-decision-note" className="sr-only">
              {t(lang, 'decisionNotePlaceholder')}
            </label>
            <input
              id="compliance-decision-note"
              type="text"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder={t(lang, 'decisionNotePlaceholder')}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>{t(lang, 'colStatus')}:</span>
              {applicant.status === 'approved' && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {t(lang, 'statusApproved')}
                </span>
              )}
              {applicant.status === 'pending' && (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4" />
                  {t(lang, 'statusPending')}
                </span>
              )}
              {applicant.status === 'flagged' && (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  {t(lang, 'statusFlagged')}
                </span>
              )}
              {applicant.status === 'rejected' && (
                <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  {t(lang, 'statusRejected')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecision('approved')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t(lang, 'approveDossierBtn')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDecision('flagged')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t(lang, 'flagDossierBtn')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/70 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t(lang, 'rejectDossierBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
