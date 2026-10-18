/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  RotateCcw,
  Sun,
  Moon,
  Languages,
  Eye,
  ArrowUpDown,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Download,
} from 'lucide-react';
import {
  computeKpiMetrics,
  evaluateApplicantWithRules,
  filterAndSortApplicants,
  runAutomatedBatchWorkflow,
  type AutomationConfig,
  type DocumentType,
  type KYCApplicant,
  type Language,
  type RiskTier,
  type VerificationStatus,
} from './utils/kycEngine';
import {
  initialApplicants,
  initialAutomationConfig,
  iraqiDocumentRegistrySummary,
} from './utils/seedData';
import { t } from './utils/i18n';
import { ApplicantInspectorDrawer } from './components/ApplicantInspectorDrawer';
import { SecureUploadModal } from './components/SecureUploadModal';
import { AutomationRulesPanel } from './components/AutomationRulesPanel';
import { DocumentSpecimenViewer } from './components/DocumentSpecimenViewer';

type ActiveSection = 'queue' | 'vault' | 'automation' | 'audit';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('queue');

  const [applicants, setApplicants] = useState<KYCApplicant[]>(initialApplicants);
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>(
    initialAutomationConfig
  );

  // Filter & Sort states
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskTier | 'all'>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'submittedAt' | 'riskScore' | 'ocrConfidence'>(
    'submittedAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals & Drawers
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Batch Execution Notification Banner
  const [batchBannerMessage, setBatchBannerMessage] = useState<string | null>(null);

  // Vault preview selection & search
  const [selectedVaultDocId, setSelectedVaultDocId] = useState<string>('doc-901');
  const [vaultSearchQuery, setVaultSearchQuery] = useState<string>('');
  const [vaultZoomed, setVaultZoomed] = useState<boolean>(false);
  const [vaultRotation, setVaultRotation] = useState<number>(0);

  // Sync HTML dir, lang, and dark mode class
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    htmlEl.setAttribute('lang', lang);
    if (darkMode) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
  }, [lang, darkMode]);

  const kpi = useMemo(() => computeKpiMetrics(applicants), [applicants]);

  const filteredApplicants = useMemo(
    () =>
      filterAndSortApplicants(applicants, {
        statusFilter,
        riskFilter,
        docTypeFilter,
        searchQuery,
        sortBy,
        sortOrder,
      }),
    [applicants, statusFilter, riskFilter, docTypeFilter, searchQuery, sortBy, sortOrder]
  );

  const selectedApplicantIndex = useMemo(
    () => filteredApplicants.findIndex((a) => a.id === selectedApplicantId),
    [filteredApplicants, selectedApplicantId]
  );

  const selectedApplicant = useMemo(
    () => applicants.find((a) => a.id === selectedApplicantId) || null,
    [applicants, selectedApplicantId]
  );

  const allDocuments = useMemo(() => {
    const list = applicants.flatMap((applicant) =>
      applicant.documents.map((doc) => ({
        doc,
        applicant,
      }))
    );
    const q = vaultSearchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      ({ doc, applicant }) =>
        doc.titleEn.toLowerCase().includes(q) ||
        doc.titleAr.toLowerCase().includes(q) ||
        doc.docNumber.toLowerCase().includes(q) ||
        applicant.fullNameEn.toLowerCase().includes(q) ||
        applicant.fullNameAr.toLowerCase().includes(q)
    );
  }, [applicants, vaultSearchQuery]);

  const allAuditEvents = useMemo(() => {
    return applicants.flatMap((applicant) =>
      applicant.auditTrail.map((evt) => ({
        evt,
        applicant,
      }))
    );
  }, [applicants]);

  const handleNavigateApplicant = (direction: 'prev' | 'next') => {
    if (filteredApplicants.length === 0) return;
    const currentIdx = selectedApplicantIndex >= 0 ? selectedApplicantIndex : 0;
    const nextIdx =
      direction === 'next'
        ? (currentIdx + 1) % filteredApplicants.length
        : (currentIdx - 1 + filteredApplicants.length) % filteredApplicants.length;
    setSelectedApplicantId(filteredApplicants[nextIdx].id);
  };

  const handleExportCsv = () => {
    const headers = [
      'ReferenceCode',
      'FullNameEn',
      'FullNameAr',
      'NormalizedEntityName',
      'Governorate',
      'EntityType',
      'RiskScore',
      'Stage9Outcome',
      'Status',
      'SubmittedAt',
    ];
    const rows = filteredApplicants.map((a) => [
      a.referenceCode,
      `"${a.fullNameEn}"`,
      `"${a.fullNameAr}"`,
      `"${a.normalizedEntityName}"`,
      `"${a.governorateEn}"`,
      a.entityType,
      a.riskScore,
      a.stage9Outcome,
      a.status.toUpperCase(),
      a.submittedAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rostro-cbi-kyc-compliance-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBatchBannerMessage(
      lang === 'ar'
        ? `تم تصدير ${filteredApplicants.length} سجلات امتثال بصيغة CSV بنجاح.`
        : `Exported ${filteredApplicants.length} Rostro compliance dossiers to CSV report.`
    );
  };

  const handleRunAutomatedBatch = () => {
    const { updatedApplicants, summary } = runAutomatedBatchWorkflow(
      applicants,
      automationConfig
    );
    setApplicants(updatedApplicants);
    const msgEn = `10-Stage Pipeline Batch Complete (${summary.processedCount} dossiers): ${summary.autoApprovedIds.length} AUTO_APPROVED, ${summary.autoFlaggedIds.length} HUMAN_REVIEW, ${summary.autoRejectedIds.length} AUTO_REJECTED.`;
    const msgAr = `اكتمل تشغيل المحرك لـ ${summary.processedCount} ملفات: ${summary.autoApprovedIds.length} اعتماد تلقائي، ${summary.autoFlaggedIds.length} مراجعة بشرية، ${summary.autoRejectedIds.length} رفض تلقائي.`;
    setBatchBannerMessage(lang === 'ar' ? msgAr : msgEn);
  };

  const handleResetDemo = () => {
    setApplicants(initialApplicants);
    setAutomationConfig(initialAutomationConfig);
    setStatusFilter('all');
    setRiskFilter('all');
    setDocTypeFilter('all');
    setSearchQuery('');
    setBatchBannerMessage(null);
  };

  const handleUpdateApplicantStatus = async (
    applicantId: string,
    nextStatus: VerificationStatus,
    officerNote: string
  ) => {
    let serverReceipt = `HMAC-SHA256-CBI78-${Date.now().toString(16)}`;
    let serverTimestamp = '2026-10-17 08:45 UTC';
    try {
      const targetApp = applicants.find((a) => a.id === applicantId);
      const res = await fetch('/api/kyc/adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId,
          referenceCode: targetApp?.referenceCode || applicantId,
          status: nextStatus,
          note: officerNote,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cbiLaw78HmacReceipt) serverReceipt = data.cbiLaw78HmacReceipt;
        if (data.timestamp) serverTimestamp = data.timestamp;
      }
    } catch {
      // Fallback to local receipt if offline
    }

    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const nextStage9 =
          nextStatus === 'approved'
            ? 'AUTO_APPROVED'
            : nextStatus === 'rejected'
            ? 'AUTO_REJECTED'
            : 'HUMAN_REVIEW';
        const newAudit = {
          id: `aud-${Date.now()}`,
          timestamp: serverTimestamp,
          actorEn: 'Compliance Officer (CBI Law No. 78 Signed)',
          actorAr: 'مسؤول الامتثال (توقيع إلكتروني قانون 78)',
          actionEn: `Manual Adjudication: ${nextStatus.toUpperCase()}`,
          actionAr: `قرار مسؤول الامتثال: ${
            nextStatus === 'approved'
              ? 'معتمد'
              : nextStatus === 'rejected'
              ? 'مرفوض'
              : 'مراجعة بشرية'
          }`,
          noteEn: officerNote,
          noteAr: officerNote,
          cbiLaw78HmacReceipt: serverReceipt,
        };
        return {
          ...app,
          status: nextStatus,
          stage9Outcome: nextStage9,
          updatedAt: serverTimestamp,
          documents: app.documents.map((d) => ({ ...d, status: nextStatus })),
          auditTrail: [newAudit, ...app.auditTrail],
        };
      })
    );
  };

  const handleRunSingleAutoEval = (applicantId: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const evalRes = evaluateApplicantWithRules(app, automationConfig);
        const newAudit = {
          id: `aud-${Date.now()}`,
          timestamp: '2026-10-17 08:44 UTC',
          actorEn: 'UniversalKYCPipeline v2.0.0-IRQ',
          actorAr: 'محرك روسترو الشامل v2.0.0-IRQ',
          actionEn: `Stage 9 Outcome: ${evalRes.stage9Outcome} (${evalRes.nextStatus.toUpperCase()})`,
          actionAr: `نتيجة المرحلة 9: ${evalRes.stage9Outcome}`,
          noteEn: evalRes.reasonEn,
          noteAr: evalRes.reasonAr,
          cbiLaw78HmacReceipt: `HMAC-SHA256-CBI78-${Date.now().toString(16)}`,
        };
        return {
          ...app,
          status: evalRes.nextStatus,
          stage9Outcome: evalRes.stage9Outcome,
          updatedAt: '2026-10-17 08:44 UTC',
          documents: app.documents.map((d) => ({ ...d, status: evalRes.nextStatus })),
          auditTrail: [newAudit, ...app.auditTrail],
        };
      })
    );
  };

  const handleRegisterCandidateDoc = (applicantId: string, docId: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const updatedDocs = app.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                type: 'IRQ_CHAMBER_OF_COMMERCE' as DocumentType,
                categoryCode: 'F_EDUCATION_EMPLOYMENT' as const,
                supportStatus: 'SUPPORTED_PARTIAL' as const,
                titleEn: 'Iraqi Dental Syndicate ID (Registered Candidate · Cat F)',
                titleAr: 'هوية نقابة أطباء الأسنان (مسجلة في السجل · الفئة F)',
              }
            : d
        );
        const newAudit = {
          id: `aud-${Date.now()}`,
          timestamp: '2026-10-17 08:46 UTC',
          actorEn: 'Compliance Schema Officer',
          actorAr: 'مسؤول سجل الوثائق',
          actionEn:
            'Promoted UNKNOWN_DOCUMENT to DOCUMENT_REGISTRY (Category F · SUPPORTED_PARTIAL)',
          actionAr: 'تم تسجيل الوثيقة المرشحة في سجل الوثائق (الفئة F · SUPPORTED_PARTIAL)',
          cbiLaw78HmacReceipt: `HMAC-SHA256-CBI78-${Date.now().toString(16)}`,
        };
        return {
          ...app,
          documents: updatedDocs,
          auditTrail: [newAudit, ...app.auditTrail],
        };
      })
    );
    setBatchBannerMessage(t(lang, 'candidateRegisteredMsg'));
  };

  const handleIngestApplicant = (newApplicant: KYCApplicant) => {
    setApplicants((prev) => [newApplicant, ...prev]);
    setSelectedApplicantId(newApplicant.id);
    setBatchBannerMessage(
      lang === 'ar'
        ? `تم إدراج ملف التحقق ${newApplicant.referenceCode} وتوحيد النصوص بنجاح.`
        : `Dossier ${newApplicant.referenceCode} (${newApplicant.fullNameEn}) ingested through 10-Stage Universal Pipeline.`
    );
  };

  const toggleSort = (field: 'submittedAt' | 'riskScore' | 'ocrConfidence') => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const activeVaultItem =
    allDocuments.find((item) => item.doc.id === selectedVaultDocId) || allDocuments[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-3 sm:gap-8 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#queue"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('queue');
          }}
          className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
        >
          {t(lang, 'brandName')}
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          <a
            href="#queue"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('queue');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'queue'
                ? 'border-blue-600 dark:border-blue-400 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            {t(lang, 'navQueue')}
          </a>
          <a
            href="#vault"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('vault');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'vault'
                ? 'border-blue-600 dark:border-blue-400 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            {t(lang, 'navVault')}
          </a>
          <a
            href="#automation"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('automation');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'automation'
                ? 'border-blue-600 dark:border-blue-400 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            {t(lang, 'navAutomation')}
          </a>
          <a
            href="#audit"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('audit');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'audit'
                ? 'border-blue-600 dark:border-blue-400 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            {t(lang, 'navAudit')}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t(lang, 'ctaUpload')}</span>
          </button>
        </div>
      </header>

      {/* Secondary Workspace Context & Accessibility Toolbar (Language EN/AR + Dark Mode + Batch Workflow) */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 px-4 sm:px-6 py-2.5">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb & Demo Context */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {t(lang, 'workspacePath')}
            </span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
              {t(lang, 'demoBannerText')}
            </span>
          </div>

          {/* Interactive Accessibility Controls (EN/AR + Dark Mode) & Mobile Section Switcher */}
          <div className="flex items-center gap-2 flex-wrap max-w-full">
            {/* Mobile Section Switcher */}
            <div className="flex md:hidden items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg flex-wrap max-w-full">
              {(['queue', 'vault', 'automation', 'audit'] as ActiveSection[]).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    activeSection === sec
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sec === 'queue' && t(lang, 'navQueue')}
                  {sec === 'vault' && t(lang, 'navVault')}
                  {sec === 'automation' && t(lang, 'navAutomation')}
                  {sec === 'audit' && t(lang, 'navAudit')}
                </button>
              ))}
            </div>

            {/* Bilingual Language Toggle (EN <-> AR RTL) */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              aria-label="Toggle Language English / Arabic"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t(lang, 'langToggleLabel')}</span>
              <span className="font-mono text-[10px] text-slate-400">
                ({lang === 'en' ? 'AR/RTL' : 'EN/LTR'})
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle Dark or Light Theme"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t(lang, 'themeLight')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t(lang, 'themeDark')}</span>
                </>
              )}
            </button>

            {/* Reset Demo Data */}
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t(lang, 'resetDemoBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Strip (Full-Width 4-Column Row) */}
        <section aria-label="Compliance Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t(lang, 'kpiTotal')}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {kpi.total}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="font-mono font-semibold">{kpi.totalDocs}</span>{' '}
                  <span>{t(lang, 'colDocuments')}</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t(lang, 'kpiApproved')}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {kpi.approved}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>{t(lang, 'kpiApprovalRate')}: </span>
                  <span className="font-mono font-semibold">{kpi.approvalRate}%</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t(lang, 'kpiActionRequired')}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {kpi.actionRequired}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="font-mono font-semibold">{kpi.pending}</span>{' '}
                  <span>{t(lang, 'filterPending')}</span> ·{' '}
                  <span className="font-mono font-semibold">{kpi.flagged}</span>{' '}
                  <span>{t(lang, 'filterFlagged')}</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t(lang, 'kpiRejected')}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400">
                  {kpi.rejected}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>{t(lang, 'kpiAvgOcr')}: </span>
                  <span className="font-mono font-semibold">{kpi.avgOcr}%</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Feedback Banner after Batch Run or Upload */}
        {batchBannerMessage && (
          <div
            role="status"
            className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/50 text-xs text-emerald-900 dark:text-emerald-200"
          >
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{batchBannerMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setBatchBannerMessage(null)}
              className="text-xs font-semibold underline hover:no-underline whitespace-nowrap shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW 1: VERIFICATION QUEUE */}
        {activeSection === 'queue' && (
          <section className="space-y-4" aria-label={t(lang, 'navQueue')}>
            {/* Filter & Automated Workflow Action Bar */}
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Segmented Status Filter Controls */}
                <div
                  role="group"
                  aria-label="Filter by verification status"
                  className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex-wrap"
                >
                  {(
                    [
                      { id: 'all', label: t(lang, 'filterAll'), count: kpi.total },
                      { id: 'pending', label: t(lang, 'filterPending'), count: kpi.pending },
                      { id: 'flagged', label: t(lang, 'filterFlagged'), count: kpi.flagged },
                      { id: 'approved', label: t(lang, 'filterApproved'), count: kpi.approved },
                      { id: 'rejected', label: t(lang, 'filterRejected'), count: kpi.rejected },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        statusFilter === tab.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="ms-1.5 font-mono tabular-nums text-[11px] opacity-75">
                        ({tab.count})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Automated Batch Workflow & CSV Export Triggers */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t(lang, 'exportCsvBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRunAutomatedBatch}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/70 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{t(lang, 'runBatchBtn')}</span>
                  </button>
                </div>
              </div>

              {/* Search Input & Secondary Dropdown Filters */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="md:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute top-2.5 start-3 pointer-events-none" />
                  <input
                    type="search"
                    aria-label={t(lang, 'searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t(lang, 'searchPlaceholder')}
                    className="w-full ps-9 pe-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    aria-label={t(lang, 'riskAll')}
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value as RiskTier | 'all')}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">{t(lang, 'riskAll')}</option>
                    <option value="low">{t(lang, 'riskLow')}</option>
                    <option value="medium">{t(lang, 'riskMedium')}</option>
                    <option value="high">{t(lang, 'riskHigh')}</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <select
                    aria-label={t(lang, 'docTypeAll')}
                    value={docTypeFilter}
                    onChange={(e) => setDocTypeFilter(e.target.value as DocumentType | 'all')}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">{t(lang, 'docTypeAll')}</option>
                    <option value="IRQ_NATIONAL_ID">{t(lang, 'docNationalId')}</option>
                    <option value="IRQ_CIVIL_STATUS_ID">{t(lang, 'docCivilId')}</option>
                    <option value="IRQ_RESIDENCE_CARD">{t(lang, 'docResidenceCard')}</option>
                    <option value="IRQ_PASSPORT">{t(lang, 'docPassport')}</option>
                    <option value="IRQ_CHAMBER_OF_COMMERCE">{t(lang, 'docChamberCommerce')}</option>
                    <option value="IRQ_POWER_OF_ATTORNEY">{t(lang, 'docPowerOfAttorney')}</option>
                    <option value="UNKNOWN_DOCUMENT">{t(lang, 'docUnknown')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* High-Density Verification Data Grid */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
              {filteredApplicants.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t(lang, 'emptyQueueTitle')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {t(lang, 'emptyQueueSubtitle')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setRiskFilter('all');
                      setDocTypeFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {t(lang, 'clearFiltersBtn')}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <th className="py-3 ps-4 pe-3 text-start">{t(lang, 'colApplicant')}</th>
                        <th className="py-3 px-3 text-start">{t(lang, 'colJurisdiction')}</th>
                        <th className="py-3 px-3 text-start">{t(lang, 'colDocuments')}</th>
                        <th className="py-3 px-3 text-start">
                          <button
                            type="button"
                            onClick={() => toggleSort('riskScore')}
                            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                          >
                            <span>{t(lang, 'colRiskScore')}</span>
                            <ArrowUpDown className="w-3 h-3 shrink-0" />
                          </button>
                        </th>
                        <th className="py-3 px-3 text-start">
                          <button
                            type="button"
                            onClick={() => toggleSort('ocrConfidence')}
                            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                          >
                            <span>{t(lang, 'colOcrScore')}</span>
                            <ArrowUpDown className="w-3 h-3 shrink-0" />
                          </button>
                        </th>
                        <th className="py-3 px-3 text-start">
                          <button
                            type="button"
                            onClick={() => toggleSort('submittedAt')}
                            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                          >
                            <span>{t(lang, 'colSubmitted')}</span>
                            <ArrowUpDown className="w-3 h-3 shrink-0" />
                          </button>
                        </th>
                        <th className="py-3 px-3 text-start">{t(lang, 'colStatus')}</th>
                        <th className="py-3 ps-3 pe-4 text-end">{t(lang, 'colActions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      {filteredApplicants.map((applicant) => {
                        const minOcr = Math.min(
                          ...applicant.documents.map((d) => d.ocrConfidence)
                        );
                        const primaryDoc = applicant.documents[0];
                        const extraDocCount = Math.max(0, applicant.documents.length - 1);
                        const [subDate, subTime] = applicant.submittedAt
                          .replace(' UTC', '')
                          .split(' ');

                        return (
                          <tr
                            key={applicant.id}
                            className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            {/* 1. Applicant & Ref (Strict 2-line) */}
                            <td className="py-3.5 ps-4 pe-3 whitespace-nowrap">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="font-mono tabular-nums">
                                  {applicant.referenceCode}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate max-w-[130px]">
                                  {applicant.normalizedEntityName}
                                </span>
                              </div>
                            </td>

                            {/* 2. Governorate & Entity (Strict 2-line, Zero-Pill) */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {lang === 'ar' ? applicant.governorateAr : applicant.governorateEn}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="font-mono">{applicant.countryCode}</span>
                                <span className="mx-1" aria-hidden="true">
                                  ·
                                </span>
                                <span>
                                  {applicant.entityType === 'corporate'
                                    ? t(lang, 'entityCorporate')
                                    : t(lang, 'entityIndividual')}
                                </span>
                              </div>
                            </td>

                            {/* 3. Submitted Documents (Primary Doc + Overflow Count on Line 1, Serial on Line 2) */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                <span className="truncate max-w-[175px]">
                                  {primaryDoc
                                    ? lang === 'ar'
                                      ? primaryDoc.titleAr
                                      : primaryDoc.titleEn
                                    : '—'}
                                </span>
                                {extraDocCount > 0 && (
                                  <span className="text-[11px] text-blue-600 dark:text-blue-400 shrink-0">
                                    · <span className="font-mono">+{extraDocCount}</span>{' '}
                                    <span>{t(lang, 'moreDocsSuffix')}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                                {primaryDoc ? primaryDoc.docNumber : '—'}
                                {extraDocCount > 0 && applicant.documents[1]
                                  ? ` · ${applicant.documents[1].docNumber}`
                                  : ''}
                              </div>
                            </td>

                            {/* 4. AML Risk & Screening (Strict 2-line) */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                                <span
                                  className={
                                    applicant.riskTier === 'low'
                                      ? 'text-emerald-700 dark:text-emerald-400'
                                      : applicant.riskTier === 'medium'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }
                                >
                                  {applicant.riskScore}/100
                                </span>
                                <span className="text-slate-400" aria-hidden="true">
                                  ·
                                </span>
                                <span className="text-[11px] font-sans font-normal text-slate-600 dark:text-slate-400">
                                  {applicant.riskTier.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-[11px] mt-0.5 flex items-center gap-1">
                                {applicant.sanctionsMatch || applicant.pepMatch ? (
                                  <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                                    <ShieldAlert className="w-3 h-3 shrink-0" />
                                    <span>{t(lang, 'sanctionsHitShort')}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{t(lang, 'sanctionsCleanShort')}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 5. OCR & Biometrics (Strict 2-line) */}
                            <td className="py-3.5 px-3 font-mono tabular-nums whitespace-nowrap">
                              <div className="text-slate-900 dark:text-slate-100 font-medium">
                                OCR {minOcr}%
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                BIO {applicant.biometricMatchScore}%
                              </div>
                            </td>

                            {/* 6. Submitted Timestamp (Date on Line 1, Time UTC on Line 2) */}
                            <td className="py-3.5 px-3 font-mono tabular-nums whitespace-nowrap">
                              <div className="text-slate-800 dark:text-slate-200 font-medium">
                                {subDate}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {subTime} UTC
                              </div>
                            </td>

                            {/* 7. Stage 9 Status (2-line with Stage 9 Outcome code) */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div>
                                {applicant.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{t(lang, 'statusApproved')}</span>
                                  </span>
                                )}
                                {applicant.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span>{t(lang, 'statusPendingShort')}</span>
                                  </span>
                                )}
                                {applicant.status === 'flagged' && (
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{t(lang, 'statusFlaggedShort')}</span>
                                  </span>
                                )}
                                {applicant.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{t(lang, 'statusRejected')}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                {applicant.stage9Outcome}
                              </div>
                            </td>

                            {/* 8. Action Button */}
                            <td className="py-3.5 ps-3 pe-4 text-end whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedApplicantId(applicant.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t(lang, 'inspectBtn')}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW 2: DOCUMENT VAULT & 44-TYPE IRAQI REGISTRY */}
        {activeSection === 'vault' && (
          <section className="space-y-6" aria-label={t(lang, 'navVault')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t(lang, 'vaultSectionTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(lang, 'vaultSectionSubtitle')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 start-3 pointer-events-none" />
                  <input
                    type="search"
                    value={vaultSearchQuery}
                    onChange={(e) => setVaultSearchQuery(e.target.value)}
                    placeholder={t(lang, 'vaultSearchPlaceholder')}
                    className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t(lang, 'ctaUpload')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Document Index List */}
              <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {allDocuments.map(({ doc, applicant }) => {
                  const isSelected = activeVaultItem?.doc.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="truncate">
                            {lang === 'ar' ? doc.titleAr : doc.titleEn}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
                          </span>
                          <span className="mx-1" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono">{doc.docNumber}</span>
                          <span className="mx-1" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono">{doc.supportStatus}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVaultDocId(doc.id);
                          setVaultRotation(0);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        {t(lang, 'inspectBtn')}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right Column Specimen Preview */}
              <div className="lg:col-span-7 space-y-4">
                {activeVaultItem && (
                  <>
                    <DocumentSpecimenViewer
                      document={activeVaultItem.doc}
                      lang={lang}
                      zoomed={vaultZoomed}
                      rotation={vaultRotation}
                      onToggleZoom={() => setVaultZoomed((z) => !z)}
                      onRotate={() => setVaultRotation((r) => (r + 90) % 360)}
                    />
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Associated Applicant:{' '}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {lang === 'ar'
                            ? activeVaultItem.applicant.fullNameAr
                            : activeVaultItem.applicant.fullNameEn}
                        </span>
                        <span className="mx-1.5 text-slate-400">·</span>
                        <span className="font-mono text-slate-500">
                          {activeVaultItem.applicant.referenceCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedApplicantId(activeVaultItem.applicant.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Open Full Compliance Dossier →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 44-Type Iraqi & MENA Document Registry Matrix (Categories A–H) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  DOCUMENT_REGISTRY Coverage Matrix (44 Registered Iraqi & KRG Types · Categories A–H)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  HONEST SUPPORT STATUS SEPARATION
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 text-xs">
                {iraqiDocumentRegistrySummary.map((cat) => (
                  <div key={cat.code} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {lang === 'ar' ? cat.titleAr : cat.titleEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {cat.testedTypes}/{cat.totalTypes} TESTED
                      </span>
                      <span>·</span>
                      <span className="text-slate-500">{cat.defaultStatus}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {lang === 'ar' ? cat.examplesAr : cat.examplesEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VIEW 3: AUTOMATED WORKFLOW RULES */}
        {activeSection === 'automation' && (
          <section aria-label={t(lang, 'navAutomation')}>
            <AutomationRulesPanel
              config={automationConfig}
              applicants={applicants}
              lang={lang}
              onChangeConfig={setAutomationConfig}
              onRunBatch={handleRunAutomatedBatch}
            />
          </section>
        )}

        {/* VIEW 4: SYSTEM AUDIT TRAIL */}
        {activeSection === 'audit' && (
          <section className="space-y-4" aria-label={t(lang, 'navAudit')}>
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t(lang, 'auditSectionTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(lang, 'auditSectionSubtitle')}
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {allAuditEvents.map(({ evt, applicant }) => (
                <div
                  key={evt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {applicant.referenceCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lang === 'ar' ? evt.actorAr : evt.actorEn}</span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {lang === 'ar' ? evt.actionAr : evt.actionEn}
                    </div>
                    {(evt.noteEn || evt.noteAr) && (
                      <div className="text-slate-600 dark:text-slate-400">
                        {lang === 'ar' ? evt.noteAr : evt.noteEn}
                      </div>
                    )}
                    {evt.cbiLaw78HmacReceipt && (
                      <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                        CBI Law No. 78 HMAC Signature: {evt.cbiLaw78HmacReceipt}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono tabular-nums text-slate-500">
                      {evt.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedApplicantId(applicant.id)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
                    >
                      {t(lang, 'inspectBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Quiet Compliance Footer */}
      <footer className="max-w-[1400px] mx-auto px-6 py-6 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Project Rostro (روسترو للامتثال) · Central Bank of Iraq (CBI) Law No. 78 of 2012 &
          Universal Iraqi/KRG KYC Platform
        </div>
        <div className="flex items-center gap-4">
          <span>Multi-Script AR / KU / EN Ready</span>
          <span aria-hidden="true">·</span>
          <span>ICAO 9303 Modulo-10 [7,3,1] Verified</span>
        </div>
      </footer>

      {/* Slide-over Dossier Inspector */}
      <ApplicantInspectorDrawer
        applicant={selectedApplicant}
        lang={lang}
        onClose={() => setSelectedApplicantId(null)}
        onUpdateStatus={handleUpdateApplicantStatus}
        onRunSingleAutoEval={handleRunSingleAutoEval}
        onRegisterCandidateDoc={handleRegisterCandidateDoc}
        onNavigateApplicant={handleNavigateApplicant}
        currentIndex={selectedApplicantIndex >= 0 ? selectedApplicantIndex : 0}
        totalQueueCount={filteredApplicants.length}
      />

      {/* Secure KYC Packet Upload Modal */}
      <SecureUploadModal
        isOpen={isUploadModalOpen}
        lang={lang}
        onClose={() => setIsUploadModalOpen(false)}
        onIngestApplicant={handleIngestApplicant}
      />
    </div>
  );
}
