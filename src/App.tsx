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
  LayoutGrid,
  Users,
  FolderClosed,
  Layers,
  Sliders,
  ChevronRight,
  ChevronLeft,
  PanelLeft,
  Bell,
  Plus,
  MoreHorizontal,
  ChevronsUpDown,
  Filter,
  TrendingUp,
  Camera,
  Smartphone,
  Settings,
  LogOut,
  Mail,
  Sparkles,
  Activity,
  UserCheck,
} from 'lucide-react';
import {
  buildKurdishDialectSimulationFields,
  computeKpiMetrics,
  evaluateApplicantWithRules,
  filterAndSortApplicants,
  runAutomatedBatchWorkflow,
  type AntiSpoofSimulationPreset,
  type AutomationConfig,
  type DocumentType,
  type KurdishRegionalSimulationPreset,
  type KYCApplicant,
  type KYCDocument,
  type Language,
  type RiskTier,
  type VerificationStatus,
} from './utils/kycEngine';
import {
  initialApplicants,
  initialAutomationConfig,
  iraqiDocumentRegistrySummary,
} from './utils/seedData';
import {
  formatCryptoDigest,
  formatReferenceCode,
  formatStage9Outcome,
  formatSupportStatus,
  formatTimestamp,
  sanitizeTextForLanguage,
  t,
} from './utils/i18n';
import { ApplicantInspectorDrawer } from './components/ApplicantInspectorDrawer';
import { SecureUploadModal } from './components/SecureUploadModal';
import { AutomationRulesPanel } from './components/AutomationRulesPanel';
import { DocumentSpecimenViewer } from './components/DocumentSpecimenViewer';
import { ZainCashEdgeForensicsLab } from './components/ZainCashEdgeForensicsLab';
import { CompetitionShowcaseTab } from './components/CompetitionShowcaseTab';
import { ErrorBoundary } from './components/ErrorBoundary';

type ActiveSection =
  | 'dashboard'
  | 'queue'
  | 'forensics'
  | 'challenge'
  | 'vault'
  | 'automation';

export default function App() {
  // Default to English or Arabic seamlessly; let's start in English to match the reference screenshot labels while keeping 1-click Arabic RTL switch in the top header
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

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
  const [focusedQueueIndex, setFocusedQueueIndex] = useState<number>(0);

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

  // Document category breakdown for the Donut Chart (Image 1 bottom-right card)
  const categoryBreakdown = useMemo(() => {
    const docs = applicants.flatMap((a) => a.documents);
    const total = Math.max(1, docs.length);
    const natId = docs.filter((d) => d.type === 'IRQ_NATIONAL_ID' || d.type === 'IRQ_CIVIL_STATUS_ID').length;
    const residence = docs.filter((d) => d.type === 'IRQ_RESIDENCE_CARD').length;
    const passport = docs.filter((d) => d.type === 'IRQ_PASSPORT').length;
    const corporate = Math.max(0, docs.length - natId - residence - passport);
    return [
      {
        labelEn: 'National & Civil ID',
        labelAr: 'البطاقة الوطنية والأحوال',
        count: natId,
        pct: Math.round((natId / total) * 100),
        color: '#10b981',
      },
      {
        labelEn: 'Residence Card',
        labelAr: 'بطاقة السكن العراقية',
        count: residence,
        pct: Math.round((residence / total) * 100),
        color: '#059669',
      },
      {
        labelEn: 'Iraqi e-Passport',
        labelAr: 'جواز السفر الإلكتروني',
        count: passport,
        pct: Math.round((passport / total) * 100),
        color: '#047857',
      },
      {
        labelEn: 'Corporate & Syndicate',
        labelAr: 'وثائق الشركات والنقابات',
        count: corporate,
        pct: Math.max(4, Math.round((corporate / total) * 100)),
        color: '#064e3b',
      },
    ];
  }, [applicants]);

  const handleNavigateApplicant = (direction: 'prev' | 'next') => {
    if (filteredApplicants.length === 0) return;
    const currentIdx = selectedApplicantIndex >= 0 ? selectedApplicantIndex : focusedQueueIndex;
    const nextIdx =
      direction === 'next'
        ? (currentIdx + 1) % filteredApplicants.length
        : (currentIdx - 1 + filteredApplicants.length) % filteredApplicants.length;
    setFocusedQueueIndex(nextIdx);
    setSelectedApplicantId(filteredApplicants[nextIdx].id);
  };

  // Upgrade 2.4: Global Rapid Compliance Officer Keyboard Shortcuts (when Drawer & Modals are closed)
  useEffect(() => {
    if (selectedApplicantId || isUploadModalOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const safeLen = filteredApplicants.length;
      const safeIdx = safeLen > 0 ? Math.min(focusedQueueIndex, safeLen - 1) : 0;
      const focusedApp = filteredApplicants[safeIdx];

      if (e.key.toLowerCase() === 'j' || e.key === 'ArrowDown') {
        if (safeLen === 0) return;
        e.preventDefault();
        setFocusedQueueIndex((prev) => (prev + 1) % safeLen);
      } else if (e.key.toLowerCase() === 'k' || e.key === 'ArrowUp') {
        if (safeLen === 0) return;
        e.preventDefault();
        setFocusedQueueIndex((prev) => (prev - 1 + safeLen) % safeLen);
      } else if (e.key === 'Enter' && focusedApp) {
        e.preventDefault();
        setSelectedApplicantId(focusedApp.id);
      } else if (e.key.toLowerCase() === 'a' && focusedApp) {
        e.preventDefault();
        handleUpdateApplicantStatus(
          focusedApp.id,
          'approved',
          lang === 'ar'
            ? 'مصادقة سريعة عبر اختصار لوحة المفاتيح [A] — مستوفٍ لضوابط البنك المركزي العراقي'
            : 'Rapid Keyboard Triage [A]: Approved under CBI Law No. 39 of 2015'
        );
      } else if (
        e.key.toLowerCase() === 'r' &&
        focusedApp &&
        focusedApp.status !== 'approved' &&
        focusedApp.stage9Outcome !== 'AUTO_APPROVED'
      ) {
        e.preventDefault();
        handleUpdateApplicantStatus(
          focusedApp.id,
          'rejected',
          lang === 'ar'
            ? 'رفض عبر اختصار لوحة المفاتيح [R]'
            : 'Rapid Keyboard Triage [R]: Rejected due to compliance exception'
        );
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    selectedApplicantId,
    isUploadModalOpen,
    filteredApplicants,
    focusedQueueIndex,
    lang,
  ]);

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
        ? `تم تصدير ${filteredApplicants.length} سجلات امتثال بنجاح.`
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
          noteEn:
            sanitizeTextForLanguage(officerNote, 'en') ||
            'Adjudicated by compliance officer.',
          noteAr:
            sanitizeTextForLanguage(officerNote, 'ar') ||
            'تم الفصل في الملف من قبل مسؤول الامتثال.',
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
          actorAr: 'محرك روسترو الشامل للتحقق',
          actionEn: `Stage 9 Outcome: ${evalRes.stage9Outcome} (${evalRes.nextStatus.toUpperCase()})`,
          actionAr: `نتيجة المرحلة التاسعة: ${formatStage9Outcome(evalRes.stage9Outcome, 'ar')}`,
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
                titleAr: 'هوية نقابة أطباء الأسنان (مسجلة في السجل · الفئة السادسة)',
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
          actionAr: 'تم تسجيل الوثيقة المرشحة في سجل الوثائق الرسمي (الفئة السادسة · مدعومة جزئياً)',
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

  const handleAttachOrUpdatePacketResidenceCard = (
    applicantId: string,
    mode: 'SELF' | 'FATHER' | 'MISMATCH' | 'CUSTOM',
    customDoc?: KYCDocument
  ) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const natDoc =
          app.documents.find(
            (d) => d.type === 'IRQ_NATIONAL_ID' || d.type === 'IRQ_CIVIL_STATUS_ID'
          ) || app.documents[0];

        const enParts = (app.fullNameEn || 'Abdullah Tariq Kareem Al-Dulaimi')
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        const arParts = (app.fullNameAr || 'عبدالله طارق كريم الدليمي')
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        const aFatherEn =
          natDoc?.extractedFields.fatherName || enParts[1] || 'Tariq';
        const aGrandEn =
          natDoc?.extractedFields.grandfatherName ||
          (enParts.length >= 4 ? enParts[2] : 'Kareem');
        const aSurnameEn =
          natDoc?.extractedFields.surname ||
          enParts[enParts.length - 1] ||
          'Al-Dulaimi';

        const aFatherAr =
          natDoc?.slot1Summary?.fatherName || arParts[1] || 'طارق';
        const aGrandAr =
          natDoc?.slot1Summary?.grandfatherName ||
          (arParts.length >= 4 ? arParts[2] : 'كريم');
        const aSurnameAr =
          natDoc?.slot1Summary?.surname ||
          arParts[arParts.length - 1] ||
          'الدليمي';

        let nextResidenceDoc: KYCDocument;
        if (mode === 'CUSTOM' && customDoc) {
          nextResidenceDoc = customDoc;
        } else if (mode === 'FATHER') {
          const fatherFullEn = `${aFatherEn} ${aGrandEn} Qasim ${aSurnameEn}`.toUpperCase();
          const fatherFullAr = `${aFatherAr} ${aGrandAr} قاسم ${aSurnameAr}`;
          nextResidenceDoc = {
            id: `doc-res-father-${app.id}`,
            type: 'IRQ_RESIDENCE_CARD',
            categoryCode: 'B_RESIDENCE_ADDRESS',
            supportStatus: 'TESTED',
            side: 'BOTH',
            detectedLanguages: ['ar'],
            titleEn: "Iraqi Residence Card (Father's Household · رب الأسرة الأب)",
            titleAr: 'بطاقة السكن العراقية (باسم الأب رب الأسرة)',
            docNumber: 'RES-BGD-771042',
            issueDate: '2022-11-14',
            expiryDate: 'N/A',
            issuingAuthorityEn: 'Al-Mansour Information Office — Baghdad',
            issuingAuthorityAr: 'مكتب معلومات المنصور — بغداد',
            issuingCountryEn: 'Republic of Iraq',
            issuingCountryAr: 'جمهورية العراق',
            ocrConfidence: 97,
            fileSizeKb: 940,
            sha256Hash: '8a11c3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f99',
            status: 'approved',
            extractedFields: {
              fullName: fatherFullEn,
              fullNameArabic: fatherFullAr,
              normalizedName: fatherFullAr,
              firstName: aFatherAr,
              fatherName: aGrandAr,
              grandfatherName: 'قاسم',
              surname: aSurnameAr,
              dob: '1961-04-12',
              nationality: 'IRQ · Baghdad',
              governorate: app.governorateAr || 'بغداد',
              address: 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
            },
          };
        } else if (mode === 'MISMATCH') {
          nextResidenceDoc = {
            id: `doc-res-mismatch-${app.id}`,
            type: 'IRQ_RESIDENCE_CARD',
            categoryCode: 'B_RESIDENCE_ADDRESS',
            supportStatus: 'TESTED',
            side: 'BOTH',
            detectedLanguages: ['ar'],
            titleEn: 'Iraqi Residence Card (Unlinked Household Mismatch)',
            titleAr: 'بطاقة السكن العراقية (تضارب نسب رب الأسرة)',
            docNumber: 'RES-BSR-00918',
            issueDate: '2021-03-19',
            expiryDate: 'N/A',
            issuingAuthorityEn: 'Al-Ashar Information Office — Basra',
            issuingAuthorityAr: 'مكتب معلومات العشار — البصرة',
            issuingCountryEn: 'Republic of Iraq',
            issuingCountryAr: 'جمهورية العراق',
            ocrConfidence: 95,
            fileSizeKb: 910,
            sha256Hash: '1c99a081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00e11',
            status: 'rejected',
            extractedFields: {
              fullName: 'MUSTAFA HASSAN JABBAR AL-MALIKI',
              fullNameArabic: 'مصطفى حسن جبار المالكي',
              normalizedName: 'مصطفى حسن جبار المالكي',
              firstName: 'مصطفى',
              fatherName: 'حسن',
              grandfatherName: 'جبار',
              surname: 'المالكي',
              dob: '1979-08-01',
              nationality: 'IRQ · Basra',
              governorate: 'البصرة',
              address: 'Mahalla 102, Zukak 5, Dar 8, Basra',
            },
          };
        } else {
          // SELF
          nextResidenceDoc = {
            id: `doc-res-self-${app.id}`,
            type: 'IRQ_RESIDENCE_CARD',
            categoryCode: 'B_RESIDENCE_ADDRESS',
            supportStatus: 'TESTED',
            side: 'BOTH',
            detectedLanguages: ['ar'],
            titleEn: 'Iraqi Residence Information Card',
            titleAr: 'بطاقة السكن العراقية',
            docNumber: 'RES-BGD-992018',
            issueDate: '2023-01-10',
            expiryDate: 'N/A',
            issuingAuthorityEn: 'Al-Mansour Information Office — Baghdad',
            issuingAuthorityAr: 'مكتب معلومات المنصور — بغداد',
            issuingCountryEn: 'Republic of Iraq',
            issuingCountryAr: 'جمهورية العراق',
            ocrConfidence: 96,
            fileSizeKb: 980,
            sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            status: 'approved',
            extractedFields: {
              fullName: app.fullNameEn.toUpperCase(),
              fullNameArabic: app.fullNameAr,
              normalizedName: app.normalizedEntityName,
              dob: natDoc?.extractedFields.dob || '1987-09-18',
              nationality: 'IRQ · Baghdad',
              governorate: app.governorateAr || 'بغداد',
              address: 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
            },
          };
        }

        const otherDocs = app.documents.filter((d) => d.type !== 'IRQ_RESIDENCE_CARD');
        const nextDocs = [...otherDocs, nextResidenceDoc];
        const candidateApp: KYCApplicant = {
          ...app,
          documents: nextDocs,
          nineSignals: {
            ...app.nineSignals,
            cross_document_consistency: mode === 'MISMATCH' ? 0.14 : 0.98,
          },
        };
        const evalRes = evaluateApplicantWithRules(candidateApp, automationConfig);
        return {
          ...candidateApp,
          status: evalRes.nextStatus,
          stage9Outcome: evalRes.stage9Outcome,
          riskScore: mode === 'MISMATCH' ? 88 : Math.min(app.riskScore, 14),
          riskTier: mode === 'MISMATCH' ? 'high' : 'low',
        };
      })
    );
  };

  const handleApplyAntiSpoofPreset = (
    applicantId: string,
    docId: string,
    preset: AntiSpoofSimulationPreset
  ) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const isSpoof = preset !== 'AUTHENTIC_PHYSICAL' && preset !== 'LIVE_AUTO';
        const updatedDocs = app.documents.map((d) =>
          d.id === docId ? { ...d, antiSpoofPreset: preset } : d
        );
        const candidateApp: KYCApplicant = {
          ...app,
          documents: updatedDocs,
          nineSignals: {
            ...app.nineSignals,
            authenticity_risk_indicators: isSpoof ? 0.18 : 0.98,
          },
        };
        const evalRes = evaluateApplicantWithRules(candidateApp, automationConfig);
        return {
          ...candidateApp,
          status: evalRes.nextStatus,
          stage9Outcome: evalRes.stage9Outcome,
          riskScore: isSpoof ? 92 : 12,
          riskTier: isSpoof ? 'high' : 'low',
        };
      })
    );
  };

  const handleApplyKurdishDialectTranslation = (
    applicantId: string,
    docId: string,
    preset: KurdishRegionalSimulationPreset
  ) => {
    const sim = buildKurdishDialectSimulationFields(preset);
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const updatedDocs = app.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                detectedLanguages: ['ku', 'ar', 'en'] as ('ar' | 'en' | 'ku')[],
                titleEn: sim.titleEn,
                titleAr: sim.titleAr,
                issuingAuthorityEn: sim.issuingAuthorityEn,
                issuingAuthorityAr: sim.issuingAuthorityAr,
                kurdishDialectPreset: preset,
                extractedFields: {
                  ...d.extractedFields,
                  fullName: sim.fullNameEn.toUpperCase(),
                  fullNameArabic: sim.fullNameAr,
                  normalizedName: sim.fullNameAr,
                  fullNameKurdish: sim.fullNameKurdish,
                  motherName: sim.motherNameKurdish,
                  motherNameKurdish: sim.motherNameKurdish,
                  governorate: sim.governorateAr,
                  governorateKurdish: sim.governorateKurdish,
                  address: sim.translatedAddressAr,
                  addressKurdish: sim.addressKurdish,
                  issuingAuthorityKurdish: sim.issuingAuthorityKurdish,
                },
              }
            : d
        );

        const newAudit = {
          id: `aud-ku-${Date.now()}`,
          timestamp: '2026-10-17 09:15 UTC',
          actorEn: 'Kurdish Multi-Dialect Translation Engine v2.0',
          actorAr: 'محرك ترجمة اللهجات الكردية المعتمد',
          actionEn: `Translated Kurdish (${preset}) fields to Official CBI Arabic: ${sim.fullNameAr} (${sim.governorateEn})`,
          actionAr: `تمت ترجمة الحقول الكردية (${preset}) إلى العربية الرسمية المعتمدة: ${sim.fullNameAr} (${sim.governorateAr})`,
          cbiLaw78HmacReceipt: `HMAC-SHA256-CBI78-${Date.now().toString(16).slice(0, 16)}`,
        };

        return {
          ...app,
          fullNameEn: sim.fullNameEn,
          fullNameAr: sim.fullNameAr,
          normalizedEntityName: sim.fullNameAr,
          governorateEn: sim.governorateEn,
          governorateAr: sim.governorateAr,
          documents: updatedDocs,
          auditTrail: [newAudit, ...app.auditTrail],
        };
      })
    );
  };

  const handleIngestApplicant = (newApplicant: KYCApplicant) => {
    setApplicants((prev) => [newApplicant, ...prev]);
    setSelectedApplicantId(newApplicant.id);
    setBatchBannerMessage(
      lang === 'ar'
        ? `تم إدراج ملف التحقق ${formatReferenceCode(newApplicant.referenceCode, 'ar')} وتوحيد النصوص بنجاح.`
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

  const isAr = lang === 'ar';
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  // Percentages for the Order/Verification Status & Donut charts
  const totalCount = Math.max(1, kpi.total);
  const approvedPct = ((kpi.approved / totalCount) * 100).toFixed(1);
  const reviewPct = ((kpi.actionRequired / totalCount) * 100).toFixed(1);
  const rejectedPct = ((kpi.rejected / totalCount) * 100).toFixed(1);

  // Interactive day selection for the Figma Spline Throughput Chart ("Monday, 28 December..." style card)
  const [activeSplineDayIdx, setActiveSplineDayIdx] = useState<number>(4); // Default 'Fri' (matches Figma callout position)
  const splineWeekData = useMemo(
    () => [
      { dayEn: 'Mon', dayAr: 'الإثنين', x: 52, y: 175, value: `${kpi.total * 340}`, subEn: 'Baghdad Intake', subAr: 'دفعة بغداد' },
      { dayEn: 'Tue', dayAr: 'الثلاثاء', x: 112, y: 118, value: `${kpi.total * 410}`, subEn: 'Basra & Najaf', subAr: 'البصرة والنجف' },
      { dayEn: 'Wed', dayAr: 'الأربعاء', x: 172, y: 96, value: `${kpi.total * 465}`, subEn: 'Erbil Sorani OCR', subAr: 'أربيل - السورانية' },
      { dayEn: 'Thu', dayAr: 'الخميس', x: 232, y: 115, value: `${kpi.total * 430}`, subEn: 'Sulaymaniyah KYC', subAr: 'السليمانية' },
      { dayEn: 'Fri', dayAr: 'الجمعة', x: 292, y: 132, value: `$${(kpi.approved * 492 + 497).toLocaleString()}`, subEn: 'Duhok Badini → AR', subAr: 'دهوك - البادينية' },
      { dayEn: 'Sat', dayAr: 'السبت', x: 352, y: 112, value: `${kpi.total * 490}`, subEn: 'Nineveh & Kirkuk', subAr: 'نينوى وكركوك' },
      { dayEn: 'Sun', dayAr: 'الأحد', x: 412, y: 54, value: `${kpi.total * 560}`, subEn: 'CBI Law 78 Batch', subAr: 'توقيع البنك المركزي' },
    ],
    [kpi.total, kpi.approved]
  );
  const activeSplinePoint = splineWeekData[activeSplineDayIdx] || splineWeekData[4];

  // Primary CTA button styling (Vivid emerald green accent)
  const primaryBtnClass =
    'bg-[#10b981] hover:bg-[#059669] text-white border border-[#34d399]/40 shadow-md shadow-[#10b981]/20';

  const sectionTitleMap: Record<ActiveSection, { en: string; ar: string }> = {
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
    queue: { en: 'Dossiers Queue', ar: 'ملفات المتقدمين' },
    forensics: { en: 'Documents & Forensics', ar: 'مختبر الوثائق والتزوير' },
    challenge: { en: 'System Architecture', ar: 'هيكلة النظام والمسابقة' },
    vault: { en: 'Document Vault (44)', ar: 'خزنة الوثائق العراقية' },
    automation: { en: 'Automation & Rules', ar: 'قواعد الأتمتة والمخاطر' },
  };

  const getDocCategoryBadge = (docType?: DocumentType) => {
    if (!docType) return isAr ? 'وثيقة عامة' : 'General';
    switch (docType) {
      case 'IRQ_NATIONAL_ID':
        return isAr ? 'البطاقة الوطنية' : 'National ID';
      case 'IRQ_PASSPORT':
        return isAr ? 'جواز سفر' : 'e-Passport';
      case 'IRQ_RESIDENCE_CARD':
        return isAr ? 'بطاقة السكن' : 'Residence Card';
      case 'IRQ_CIVIL_STATUS_ID':
        return isAr ? 'هوية الأحوال' : 'Civil ID';
      case 'IRQ_CHAMBER_OF_COMMERCE':
        return isAr ? 'هوية تجارية/نقابية' : 'Corporate ID';
      case 'IRQ_POWER_OF_ATTORNEY':
        return isAr ? 'وكالة رسمية' : 'Legal Proxy';
      case 'FOREIGN_NATIONAL_ID':
        return isAr ? 'هوية أجنبية (محال للبشري)' : 'Foreign ID (Reverted)';
      case 'FOREIGN_PASSPORT':
        return isAr ? 'جواز أجنبي (محال للبشري)' : 'Foreign Passport (Reverted)';
      default:
        return isAr ? 'قيد التصنيف' : 'Candidate Doc';
    }
  };

  // Shared Dossiers Table styled after the Figma "Projects Finance" table (Name, Progress, Achieved, Status with colored dot, View all / •••)
  const renderDossiersCatalogTable = (compactLimit?: number, fillFlexHeight = false) => {
    const rowsToRender = compactLimit
      ? filteredApplicants.slice(0, compactLimit)
      : filteredApplicants;

    return (
      <div
        className={
          fillFlexHeight
            ? 'flex-1 min-h-0 flex flex-col gap-2 overflow-hidden'
            : 'space-y-3'
        }
      >
        {/* Compact Single-Row Filter Bar so Table Rows Appear Immediately */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-1">
          <div
            role="tablist"
            aria-label="Filter by verification status"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {(
              [
                { id: 'all', label: isAr ? 'الكل' : 'All', count: kpi.total },
                { id: 'pending', label: isAr ? 'انتظار' : 'Pending', count: kpi.pending },
                { id: 'flagged', label: isAr ? 'مراجعة' : 'Flagged', count: kpi.flagged },
                { id: 'approved', label: isAr ? 'معتمد' : 'Approved', count: kpi.approved },
                { id: 'rejected', label: isAr ? 'مرفوض' : 'Rejected', count: kpi.rejected },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-[#10b981] text-white shadow-xs shadow-[#10b981]/30'
                      : 'bg-zinc-100 dark:bg-[#14151b] text-zinc-600 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[9px] tabular-nums px-1 rounded ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-200/70 dark:bg-[#1f2128] text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <select
              aria-label="Filter by Document Type"
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value as DocumentType | 'all')}
              className="px-1.5 py-0.5 text-[10px] rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#14151b] text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-[#10b981] max-w-[118px]"
            >
              <option value="all">{isAr ? 'الوثيقة: الكل' : 'Doc: All'}</option>
              <option value="IRQ_NATIONAL_ID">{t(lang, 'docNationalId')}</option>
              <option value="IRQ_CIVIL_STATUS_ID">{t(lang, 'docCivilId')}</option>
              <option value="IRQ_RESIDENCE_CARD">{t(lang, 'docResidenceCard')}</option>
              <option value="IRQ_PASSPORT">{t(lang, 'docPassport')}</option>
              <option value="IRQ_CHAMBER_OF_COMMERCE">{t(lang, 'docChamberCommerce')}</option>
              <option value="IRQ_POWER_OF_ATTORNEY">{t(lang, 'docPowerOfAttorney')}</option>
              <option value="UNKNOWN_DOCUMENT">{t(lang, 'docUnknown')}</option>
            </select>

            <select
              aria-label="Filter by Risk Tier"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskTier | 'all')}
              className="px-1.5 py-0.5 text-[10px] rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#14151b] text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-[#10b981]"
            >
              <option value="all">{isAr ? 'المخاطر: الكل' : 'Risk: All'}</option>
              <option value="low">{t(lang, 'riskLow')}</option>
              <option value="medium">{t(lang, 'riskMedium')}</option>
              <option value="high">{t(lang, 'riskHigh')}</option>
            </select>

            <button
              type="button"
              onClick={handleRunAutomatedBatch}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-white bg-[#10b981] hover:bg-[#059669] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sliders className="w-2.5 h-2.5" />
              <span>{t(lang, 'runBatchBtn')}</span>
            </button>
          </div>
        </div>

        {/* Figma "Projects Finance" Styled Table */}
        <div
          className={
            fillFlexHeight
              ? 'flex-1 min-h-0 overflow-y-auto overflow-x-auto pe-0.5'
              : 'overflow-x-auto'
          }
        >
          {rowsToRender.length === 0 ? (
            <div className="p-6 text-center space-y-2 rounded-2xl bg-zinc-50 dark:bg-[#14151b] border border-zinc-200 dark:border-white/5">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {t(lang, 'emptyQueueTitle')}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-[#8a8d98] max-w-md mx-auto">
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
                className={`px-3 py-1.5 text-xs rounded-xl transition-colors ${primaryBtnClass}`}
              >
                {t(lang, 'clearFiltersBtn')}
              </button>
            </div>
          ) : (
            <table className="w-full text-start border-collapse">
              <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#1f2128]">
                <tr className="text-[11px] font-medium text-zinc-400 dark:text-[#7e8290] border-b border-zinc-200/70 dark:border-white/[0.06] whitespace-nowrap">
                  <th className="py-1 ps-1 pe-1.5 text-start font-normal">
                    {isAr ? 'الاسم والوثيقة' : 'Name'}
                  </th>
                  <th className="py-1 px-1.5 text-start font-normal">
                    {isAr ? 'مسار التقدم' : 'Progress'}
                  </th>
                  <th className="py-1 px-1.5 text-start font-normal">
                    <button
                      type="button"
                      onClick={() => toggleSort('ocrConfidence')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <span>{isAr ? 'الأصالة' : 'Achieved'}</span>
                      <ArrowUpDown className="w-3 h-3 shrink-0" />
                    </button>
                  </th>
                  <th className="py-1 px-1.5 text-start font-normal">
                    <button
                      type="button"
                      onClick={() => toggleSort('riskScore')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <span>{isAr ? 'الحالة' : 'Status'}</span>
                      <ArrowUpDown className="w-3 h-3 shrink-0" />
                    </button>
                  </th>
                  <th className="py-1 ps-1.5 pe-1 text-end font-normal">
                    {isAr ? 'عرض' : 'View'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-white/[0.04] text-[11px] xl:text-xs">
                {rowsToRender.map((applicant, rowIdx) => {
                  const minOcr = Math.min(
                    ...applicant.documents.map((d) => d.ocrConfidence)
                  );
                  const primaryDoc = applicant.documents[0];
                  const isKeyboardFocused =
                    focusedQueueIndex === rowIdx || selectedApplicantId === applicant.id;
                  const hasKurdishDoc = applicant.documents.some(
                    (d) =>
                      Boolean(d.kurdishDialectPreset) ||
                      Boolean(d.extractedFields.fullNameKurdish) ||
                      Boolean(d.extractedFields.addressKurdish) ||
                      Boolean(d.extractedFields.governorateKurdish) ||
                      Boolean(d.extractedFields.issuingAuthorityKurdish) ||
                      Boolean(d.extractedFields.motherNameKurdish)
                  );
                  const hasForeignDoc = applicant.documents.some(
                    (d) =>
                      d.isForeignDocument ||
                      d.type === 'FOREIGN_NATIONAL_ID' ||
                      d.type === 'FOREIGN_PASSPORT' ||
                      (d.issuingCountryCode && d.issuingCountryCode !== 'IRQ')
                  );

                  // Status dot color matching green/teal/amber/red aesthetic
                  const statusDotColor =
                    applicant.status === 'approved'
                      ? 'bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.7)]'
                      : applicant.status === 'pending'
                        ? 'bg-[#2dd4bf] shadow-[0_0_8px_rgba(45,212,191,0.7)]'
                        : applicant.status === 'flagged'
                          ? 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                          : 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.7)]';

                  return (
                    <tr
                      key={applicant.id}
                      onClick={() => {
                        setFocusedQueueIndex(rowIdx);
                        setSelectedApplicantId(applicant.id);
                      }}
                      className={`transition-colors cursor-pointer group ${
                        isKeyboardFocused
                          ? 'bg-[#10b981]/12 dark:bg-[#10b981]/15 rounded-xl'
                          : 'hover:bg-zinc-100/70 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* 1. Circular Avatar + Name + Reference SKU */}
                      <td className="py-1.5 ps-1 pe-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full border-2 border-[#10b981]/50 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            {primaryDoc?.customImageUrl ? (
                              <img
                                src={primaryDoc.customImageUrl}
                                alt={applicant.fullNameEn}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#047857] flex items-center justify-center text-[10px] font-bold text-white">
                                {(isAr ? applicant.fullNameAr : applicant.fullNameEn)
                                  .trim()
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                              <span className="truncate max-w-[125px] xl:max-w-[165px]">
                                {isAr ? applicant.fullNameAr : applicant.fullNameEn}
                              </span>
                              {hasKurdishDoc && (
                                <span className="px-1 py-0.5 text-[8px] font-mono rounded bg-[#10b981]/20 text-[#059669] dark:text-[#6ee7b7] border border-[#10b981]/40 shrink-0">
                                  {isAr ? 'كردي←عربي' : 'KU→AR'}
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] xl:text-[10px] text-zinc-500 dark:text-[#8a8d98] font-mono truncate max-w-[145px] xl:max-w-[205px]">
                              {formatReferenceCode(applicant.referenceCode, lang)} ·{' '}
                              {getDocCategoryBadge(primaryDoc?.type)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Progress / Stage 9 Outcome ("Meet the target" / "On Going" column in Figma) */}
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {applicant.status === 'approved'
                            ? isAr
                              ? 'حقق المستهدف'
                              : 'Meet the target'
                            : applicant.status === 'pending'
                              ? isAr
                                ? 'جاري الفحص'
                                : 'On Going'
                              : applicant.status === 'flagged'
                                ? isAr
                                  ? 'مراجعة الامتثال'
                                  : 'Officer Review'
                                : isAr
                                  ? 'مرفوض · تلاعب'
                                  : 'Forgery Alert'}
                        </div>
                        <div className="text-[9px] xl:text-[10px] font-mono text-zinc-500 dark:text-[#7e8290]">
                          {formatStage9Outcome(applicant.stage9Outcome, lang)}
                        </div>
                      </td>

                      {/* 3. Achieved / OCR & Risk Score */}
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <div className="font-semibold font-mono tabular-nums text-zinc-900 dark:text-white">
                          {minOcr}% {isAr ? 'أصالة' : 'OCR'} ·{' '}
                          <span className="text-zinc-500 dark:text-[#8a8d98] font-normal">
                            {isAr ? 'مخاطر' : 'Risk'} {applicant.riskScore}
                          </span>
                        </div>
                        <div className="mt-0.5 w-16 xl:w-20 h-1.5 rounded-full bg-zinc-200 dark:bg-[#14151b] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              applicant.status === 'rejected'
                                ? 'bg-[#ef4444]'
                                : applicant.status === 'flagged'
                                  ? 'bg-[#f59e0b]'
                                  : 'bg-gradient-to-r from-[#10b981] to-[#84cc16]'
                            }`}
                            style={{ width: `${Math.max(15, Math.min(100, minOcr))}%` }}
                          />
                        </div>
                      </td>

                      {/* 4. Status with Colored Dot (Matches Figma "● Financial Officer" / "● Project Manager") */}
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor}`} />
                          <div>
                            <div className="font-medium text-zinc-800 dark:text-zinc-200">
                              {applicant.status === 'approved'
                                ? t(lang, 'statusApproved')
                                : applicant.status === 'pending'
                                  ? t(lang, 'statusPendingShort')
                                  : applicant.status === 'flagged'
                                    ? t(lang, 'statusFlaggedShort')
                                    : t(lang, 'statusRejected')}
                            </div>
                            <div className="text-[9px] xl:text-[10px] text-zinc-500 dark:text-[#8a8d98] truncate max-w-[95px] xl:max-w-[115px]">
                              {isAr ? applicant.governorateAr : applicant.governorateEn}
                            </div>
                          </div>
                          {hasForeignDoc && (
                            <span className="px-1 py-0.5 text-[8px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {isAr ? 'أجنبية' : 'INTL'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Three-dots / Inspect Action (Matches Figma "•••" column) */}
                      <td
                        className="py-1.5 ps-1.5 pe-1 text-end whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedApplicantId(applicant.id)}
                          aria-label={`${t(lang, 'inspectBtn')} ${applicant.fullNameEn}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-white bg-zinc-100 dark:bg-[#14151b] hover:bg-[#10b981] dark:hover:bg-[#10b981] rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // Note: `sidebarOpen` is used here as `isSidebarCollapsed` toggle (false = expanded sidebar, true = collapsed compact icon rail)
  const isSidebarCollapsed = sidebarOpen;

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-[#14151b] text-zinc-900 dark:text-white transition-colors flex flex-col p-2.5 sm:p-3.5 select-none">
      {/* =====================================================================
          FULL-VIEWPORT 1-PAGE DASHBOARD LAYOUT (NO OUTER CORNER BASE MARGIN,
          NO PAGE VERTICAL SCROLLING, PERSISTENT COLLAPSIBLE LEFT SIDEBAR)
          ===================================================================== */}
      <div className="flex-1 min-h-0 flex flex-row gap-3 lg:gap-4 items-stretch overflow-hidden">
        {/* =================================================================
            COLUMN 1: PERSISTENT COLLAPSIBLE LEFT NAVIGATION SIDEBAR
            ================================================================= */}
        <aside
          aria-label="Primary Sidebar Navigation"
          data-collapsed={isSidebarCollapsed ? 'true' : 'false'}
          className={`shrink-0 h-full min-h-0 flex flex-col justify-between gap-2.5 transition-all duration-200 ${
            isSidebarCollapsed ? 'w-[68px]' : 'w-[208px] xl:w-[220px]'
          }`}
        >
          {/* Top Rounded Navigation Card (#1f2128 in dark mode) */}
          <div
            className={`flex-1 min-h-0 rounded-[20px] bg-zinc-100/90 dark:bg-[#1f2128] py-3.5 ${
              isSidebarCollapsed ? 'px-2' : 'px-3.5'
            } flex flex-col justify-between border border-zinc-200/60 dark:border-white/[0.03] overflow-y-auto`}
          >
            {/* Top Brand + Collapse/Expand Toggle Button + Primary KYC Tabs */}
            <div className="space-y-1">
              <div
                className={`pb-2.5 mb-1.5 border-b border-zinc-200/70 dark:border-[#2d3039] flex items-center ${
                  isSidebarCollapsed ? 'flex-col gap-2 justify-center px-0' : 'justify-between px-1.5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#10b981] to-[#047857] text-white flex items-center justify-center font-mono text-xs font-bold shadow-md shadow-[#10b981]/30 shrink-0">
                    {isAr ? 'ر' : 'VT'}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                        {isAr ? 'فيري ترست' : 'VeriTrust KYC'}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-[#8a8d98] truncate">
                        {isAr ? 'البنك المركزي العراقي' : 'CBI Law 78 Console'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapse / Expand Sidebar Toggle Button */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  title={
                    isSidebarCollapsed
                      ? isAr
                        ? 'توسيع القائمة الجانبية'
                        : 'Expand Sidebar'
                      : isAr
                        ? 'طي القائمة الجانبية'
                        : 'Collapse Sidebar'
                  }
                  className="w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-white/[0.05] hover:bg-[#10b981] hover:text-white text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  {isSidebarCollapsed ? (
                    isAr ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )
                  ) : isAr ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>

              {(
                [
                  {
                    id: 'dashboard' as ActiveSection,
                    icon: LayoutGrid,
                    labelEn: 'Dashboard',
                    labelAr: 'لوحة التحكم',
                  },
                  {
                    id: 'forensics' as ActiveSection,
                    icon: FileText,
                    labelEn: 'Documents Lab',
                    labelAr: 'مختبر الوثائق',
                  },
                  {
                    id: 'automation' as ActiveSection,
                    icon: Sliders,
                    labelEn: 'Rules & AML',
                    labelAr: 'قواعد الأتمتة',
                  },
                  {
                    id: 'vault' as ActiveSection,
                    icon: FolderClosed,
                    labelEn: 'Registry (44)',
                    labelAr: 'خزنة الوثائق',
                  },
                  {
                    id: 'queue' as ActiveSection,
                    icon: Users,
                    labelEn: 'Dossiers Queue',
                    labelAr: 'ملفات المتقدمين',
                  },
                  {
                    id: 'challenge' as ActiveSection,
                    icon: Layers,
                    labelEn: 'Architecture',
                    labelAr: 'هيكلة النظام',
                  },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                const label = isAr ? item.labelAr : item.labelEn;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    title={label}
                    aria-label={label}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-3 py-1.5'
                    } rounded-xl text-xs transition-all cursor-pointer ${
                      active
                        ? 'text-zinc-900 dark:text-white font-semibold bg-white/80 dark:bg-white/[0.05]'
                        : 'text-zinc-500 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
                    }`}
                  >
                    {/* Active Emerald Green Left Edge Pill Indicator */}
                    {active && (
                      <span
                        className={`w-1.5 h-5 rounded-e-full bg-[#10b981] absolute ${
                          isSidebarCollapsed ? '-start-2' : '-start-3.5'
                        } top-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(16,185,129,0.9)]`}
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#10b981] dark:text-[#34d399]' : 'text-zinc-400 dark:text-[#8a8d98]'
                      }`}
                    />
                    {!isSidebarCollapsed && <span className="truncate">{label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Middle Divider + Secondary Controls (Matches Figma Darkmode / Settings / Logout section) */}
            <div className="pt-2">
              <div className="w-full h-px bg-zinc-200 dark:bg-[#2d3039] mb-2" />
              <div className="space-y-0.5">
                {/* 1. Darkmode Toggle */}
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  aria-label="Toggle Dark or Light Theme"
                  title={isAr ? 'الوضع الداكن' : 'Darkmode'}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-0 py-1.5' : 'gap-2.5 px-3 py-1.5'
                  } rounded-xl text-xs font-medium text-zinc-500 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer`}
                >
                  <div className="w-6 h-3.5 rounded-full border border-zinc-400 dark:border-[#8a8d98] flex items-center px-0.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full transition-transform ${
                        darkMode
                          ? 'bg-[#10b981] translate-x-2 rtl:-translate-x-2'
                          : 'bg-zinc-500'
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && <span>{isAr ? 'الوضع الداكن' : 'Darkmode'}</span>}
                </button>

                {/* 2. Language / Settings Switcher */}
                <button
                  type="button"
                  onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
                  aria-label={lang === 'en' ? 'Switch interface language' : 'تغيير لغة الواجهة'}
                  title={lang === 'en' ? 'Language: EN' : 'اللغة: العربية'}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-0 py-1.5' : 'gap-2.5 px-3 py-1.5'
                  } rounded-xl text-xs font-medium text-zinc-500 dark:text-[#8a8d98] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span>{lang === 'en' ? 'Language: EN' : 'اللغة: العربية'}</span>
                  )}
                </button>

                {/* 3. Reset Demo (Coral Red like Figma's Logout button) */}
                <button
                  type="button"
                  onClick={handleResetDemo}
                  title={isAr ? 'إعادة ضبط النظام' : 'Reset Demo'}
                  aria-label={isAr ? 'إعادة ضبط النظام' : 'Reset Demo'}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-0 py-1.5' : 'gap-2.5 px-3 py-1.5'
                  } rounded-xl text-xs font-medium text-[#f06449] hover:bg-[#f06449]/10 transition-colors cursor-pointer`}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span>{isAr ? 'إعادة ضبط النظام' : 'Reset Demo'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Card: Matches Figma "Upgrade to Pro" Card -> Opens Live Document Intake */}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            role="button"
            tabIndex={0}
            title={isAr ? 'فحص وثيقة جديدة' : 'Live KYC Intake'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsUploadModalOpen(true);
              }
            }}
            className={`shrink-0 rounded-[20px] bg-zinc-100/90 dark:bg-[#1f2128] ${
              isSidebarCollapsed ? 'p-2.5' : 'p-3.5'
            } text-center flex flex-col items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-white/[0.03] hover:border-[#10b981]/50 transition-all cursor-pointer group`}
          >
            <div className="relative w-10 h-10 rounded-full bg-[#162a22] border border-[#10b981]/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <span className="absolute -top-0.5 -start-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-[8px] font-bold shadow-xs">
                ✓
              </span>
              <Sparkles className="w-4 h-4 text-[#34d399]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">
                  {isAr ? 'فحص وثيقة جديدة' : 'Live KYC Intake'}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-[#8a8d98] leading-tight">
                  {isAr
                    ? 'افحص الهويات العراقية والكردستانية'
                    : 'Scan Iraqi & KRG IDs on AI Engine'}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* =================================================================
            COLUMN 2: CENTER MAIN WORKSPACE (FITS 100% IN SINGLE VIEWPORT)
            ================================================================= */}
        <main className="flex-1 min-w-0 h-full min-h-0 flex flex-col gap-2.5 overflow-hidden">
          {/* Top Search Bar + 2 Notification/Action Badge Buttons (Exact match to Figma top row) */}
          <div className="shrink-0 flex items-center gap-2.5">
            {/* Wide Rounded Search Input */}
            <div className="flex-1 h-10 rounded-[14px] bg-zinc-100/90 dark:bg-[#1f2128] px-3.5 flex items-center gap-2.5 border border-zinc-200/60 dark:border-white/[0.03] focus-within:border-[#10b981]/60 transition-colors">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-300 shrink-0" />
              <input
                type="search"
                aria-label={t(lang, 'searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder={
                  isAr
                    ? 'اضغط هنا للبحث عن متقدم، رقم وثيقة، أو اسم كردي/عربي...'
                    : 'Tap here to search dossiers, MRZ, or Kurdish/Arabic names...'
                }
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#8a8d98] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>

            {/* Square Action Button 1: Pending Queue / Auto-Batch Evaluator with Emerald Badge */}
            <button
              type="button"
              onClick={handleRunAutomatedBatch}
              title={t(lang, 'runBatchBtn')}
              aria-label={t(lang, 'runBatchBtn')}
              className="w-10 h-10 rounded-[14px] bg-zinc-100/90 dark:bg-[#1f2128] hover:bg-zinc-200 dark:hover:bg-[#282b34] border border-zinc-200/60 dark:border-white/[0.03] flex items-center justify-center relative shrink-0 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
              <span className="absolute top-1.5 end-1.5 w-3.5 h-3.5 rounded-full bg-[#10b981] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                {kpi.pending}
              </span>
            </button>

            {/* Square Action Button 2: Flagged Alerts Bell with Emerald Badge */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('flagged');
                setActiveSection('queue');
              }}
              title={isAr ? 'عرض التنبيهات المعلقة' : 'View Flagged Dossiers'}
              aria-label="View Flagged Dossiers"
              className="w-10 h-10 rounded-[14px] bg-zinc-100/90 dark:bg-[#1f2128] hover:bg-zinc-200 dark:hover:bg-[#282b34] border border-zinc-200/60 dark:border-white/[0.03] flex items-center justify-center relative shrink-0 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
              <span className="absolute top-1.5 end-1.5 w-3.5 h-3.5 rounded-full bg-[#059669] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                {kpi.flagged}
              </span>
            </button>
          </div>

          {/* Live Feedback Toast Banner after Batch Run or Upload */}
          {batchBannerMessage && (
            <div
              role="status"
              className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 rounded-[14px] border border-[#10b981]/40 bg-[#10b981]/15 text-xs text-zinc-900 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2 font-medium truncate">
                <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                <span className="truncate">{batchBannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setBatchBannerMessage(null)}
                className="text-xs font-semibold underline hover:no-underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}

          {/* ===============================================================
              VIEW 0: FIGMA FINANCE DASHBOARD OVERVIEW (LOCKED 1-PAGE FIT)
              =============================================================== */}
          {activeSection === 'dashboard' && (
            <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
              {/* ROW 1: Two Multi-Tone Emerald & Deep Forest-Green Gradient Hero KPI Cards with Circular Donut Rings */}
              <section
                aria-label="Compliance Key Performance Indicators"
                className="shrink-0 grid grid-cols-2 gap-3"
              >
                {/* Left Gradient Card: Vibrant Emerald to Forest Green (#10b981 -> #059669 -> #065f46) */}
                <div
                  onClick={() => {
                    setStatusFilter('approved');
                  }}
                  className="rounded-[18px] bg-gradient-to-br from-[#10b981] via-[#059669] to-[#065f46] py-3 px-4 text-white shadow-lg shadow-[#059669]/20 flex items-center justify-between gap-3 cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[11px] font-medium text-white/85 truncate">
                      {isAr ? 'إجمالي الملفات والوثائق المعتمدة' : 'Total Verified Dossiers'}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight">
                      {kpi.approved}/{kpi.total}{' '}
                      <span className="text-xs font-normal text-white/80">
                        ({kpi.totalDocs} {isAr ? 'وثيقة' : 'Docs'})
                      </span>
                    </div>
                    <div className="text-[10px] text-white/75 flex items-center gap-1.5 truncate">
                      <span>
                        {t(lang, 'kpiTotal')}: {kpi.total}
                      </span>
                      <span>•</span>
                      <span>{isAr ? 'قانون البنك المركزي 78' : 'CBI Law 78 Ready'}</span>
                    </div>
                  </div>

                  {/* Right Circular Progress Ring (+70% style) */}
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#a7f3d0"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.round((kpi.approvalRate / 100) * 238)} 238`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono tabular-nums text-white">
                      +{kpi.approvalRate}%
                    </span>
                  </div>
                </div>

                {/* Right Gradient Card: Darker Rich Jade-Green to Deep Pine (#0d9488 -> #047857 -> #064e3b) */}
                <div
                  onClick={() => {
                    setStatusFilter('flagged');
                  }}
                  className="rounded-[18px] bg-gradient-to-br from-[#0d9488] via-[#047857] to-[#064e3b] py-3 px-4 text-white shadow-lg shadow-[#047857]/20 flex items-center justify-between gap-3 cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[11px] font-medium text-white/85 truncate">
                      {isAr ? 'متوسط الأصالة وفحص التزوير' : 'Authenticity & OCR Confidence'}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight">
                      {kpi.avgOcr}%
                    </div>
                    <div className="text-[10px] text-white/75 flex items-center gap-1.5 truncate">
                      <span>
                        {kpi.actionRequired} {t(lang, 'kpiActionRequired')}
                      </span>
                      <span>•</span>
                      <span>
                        {kpi.rejected} {t(lang, 'kpiRejected')}
                      </span>
                    </div>
                  </div>

                  {/* Right Circular Progress Ring (+80% style) */}
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#6ee7b7"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.round((kpi.avgOcr / 100) * 238)} 238`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono tabular-nums text-white">
                      +{kpi.avgOcr}%
                    </span>
                  </div>
                </div>
              </section>

              {/* ROW 2: Two Middle Analytics Cards (Left Spline Curve Card + Right Target Donut Card) */}
              <div className="shrink-0 grid grid-cols-2 gap-3">
                {/* Left Card: Smooth Spline Curve with Highlighted Node & Callout Pill */}
                <div className="rounded-[18px] bg-zinc-100/90 dark:bg-[#1f2128] py-2.5 px-3.5 border border-zinc-200/60 dark:border-white/[0.03] flex flex-col justify-between">
                  <div className="text-center">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {isAr
                        ? 'الأربعاء، ٢٨ تشرين الأول ٢٠٢٦ · مسار التحقق'
                        : 'Wednesday, 28 October 2026'}
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-[#8a8d98]">
                      {isAr ? activeSplinePoint.subAr : activeSplinePoint.subEn}
                    </p>
                  </div>

                  {/* Spline SVG */}
                  <div>
                    <svg
                      viewBox="0 0 450 205"
                      className="w-full h-28 overflow-visible"
                      role="img"
                      aria-label="Weekly KYC verification spline throughput"
                    >
                      {/* Y-Axis Labels (350, 300, 250, 200 matching Figma) */}
                      {[
                        { y: 40, label: '350' },
                        { y: 82, label: '300' },
                        { y: 125, label: '250' },
                        { y: 168, label: '200' },
                      ].map((tick) => (
                        <text
                          key={tick.label}
                          x="6"
                          y={tick.y}
                          fill="#7e8290"
                          fontSize="11"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {tick.label}
                        </text>
                      ))}

                      {/* Smooth Cubic-Bezier Spline Path */}
                      <path
                        d="M 52 165 C 95 90, 145 80, 195 97 C 235 111, 265 130, 292 127 C 335 123, 378 95, 412 50"
                        fill="none"
                        stroke="#8a8d98"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Floating Emerald Callout Pill Above Active Node */}
                      <g
                        transform={`translate(${activeSplinePoint.x}, ${activeSplinePoint.y - 40})`}
                      >
                        <rect
                          x="-36"
                          y="-14"
                          width="72"
                          height="24"
                          rx="10"
                          fill="#10b981"
                        />
                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {activeSplinePoint.value}
                        </text>
                      </g>

                      {/* Glowing Active Node Circle on the Curve */}
                      <circle
                        cx={activeSplinePoint.x}
                        cy={activeSplinePoint.y - 5}
                        r="8"
                        fill="#10b981"
                        fillOpacity="0.35"
                      />
                      <circle
                        cx={activeSplinePoint.x}
                        cy={activeSplinePoint.y - 5}
                        r="5"
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth="3"
                      />

                      {/* Clickable Day Labels on X-Axis (Mon Tue Wed Thu Fri Sat Sun) */}
                      {splineWeekData.map((d, idx) => {
                        const isSelected = idx === activeSplineDayIdx;
                        return (
                          <g
                            key={d.dayEn}
                            onClick={() => setActiveSplineDayIdx(idx)}
                            className="cursor-pointer"
                          >
                            <text
                              x={d.x}
                              y="196"
                              textAnchor="middle"
                              fill={isSelected ? '#10b981' : '#7e8290'}
                              fontWeight={isSelected ? '700' : '500'}
                              fontSize="11"
                            >
                              {isAr ? d.dayAr : d.dayEn}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Right Card: "Your Finance Target" -> "CBI Compliance Target" Donut Card */}
                <div className="rounded-[18px] bg-zinc-100/90 dark:bg-[#1f2128] py-2.5 px-3.5 border border-zinc-200/60 dark:border-white/[0.03] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-5" />
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white text-center">
                      {isAr ? 'مؤشر امتثال البنك المركزي' : 'CBI Compliance Target'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection('automation')}
                      aria-label="Configure Automation Rules"
                      className="p-0.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Central Gradient Donut Chart */}
                  <div className="relative w-20 h-20 mx-auto my-1 flex items-center justify-center">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <defs>
                        <linearGradient id="figmaTargetDonutGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="transparent"
                        stroke="rgba(161,161,170,0.25)"
                        strokeWidth="13"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="transparent"
                        stroke="url(#figmaTargetDonutGrad)"
                        strokeWidth="13"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.max(195, Math.round((kpi.avgOcr / 100) * 289))} 289`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
                        {kpi.avgOcr}%
                      </span>
                    </div>
                  </div>

                  {/* Bottom 2-Column Legend (Result Achieved vs In The Process) */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                        <span className="truncate">
                          {isAr ? 'تم التحقق والاعتماد' : 'Result Achieved'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-[#8a8d98] ps-3.5 leading-tight truncate">
                        {isAr
                          ? `${kpi.approved} ملفات (${approvedPct}%)`
                          : `Smoothly (${kpi.approved} verified)`}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
                        <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white shrink-0" />
                        <span className="truncate">
                          {isAr ? 'قيد الفحص والمراجعة' : 'In The Process'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-[#8a8d98] ps-3.5 leading-tight truncate">
                        {isAr
                          ? `${kpi.actionRequired} بانتظار القرار (${reviewPct}%)`
                          : `Waiting (${kpi.actionRequired} active)`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 3: Bottom Table Card ("Projects & KYC Dossiers" — flex-1 min-h-0 so bottom is never cut off!) */}
              <div className="flex-1 min-h-0 rounded-[18px] bg-zinc-100/90 dark:bg-[#1f2128] p-3 border border-zinc-200/60 dark:border-white/[0.03] flex flex-col gap-2 overflow-hidden">
                <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                      {isAr ? 'سجل ملفات التحقق والامتثال' : 'Projects & KYC Dossiers'}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                      {filteredApplicants.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#14151b] border border-zinc-200 dark:border-white/10 hover:border-[#10b981] rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>{t(lang, 'exportCsvBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${primaryBtnClass}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t(lang, 'ctaUpload')}</span>
                    </button>
                  </div>
                </div>

                {renderDossiersCatalogTable(undefined, true)}
              </div>
            </div>
          )}

          {/* ===============================================================
              SECONDARY VIEWS (SCROLL CLEANLY INSIDE CENTER WORKSPACE)
              =============================================================== */}
          {activeSection !== 'dashboard' && (
            <div className="flex-1 min-h-0 overflow-y-auto pe-1 space-y-4">
              {/* VIEW 1: FULL APPLICANT DOSSIERS CATALOG */}
              {activeSection === 'queue' && (
                <section
                  className="rounded-[20px] bg-zinc-100/90 dark:bg-[#1f2128] p-5 border border-zinc-200/60 dark:border-white/[0.03] space-y-4"
                  aria-label={t(lang, 'navQueue')}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                        {isAr ? 'سجل ملفات المتقدمين والوثائق' : 'Applicant Dossiers Queue'}
                      </h1>
                      <p className="text-xs text-zinc-500 dark:text-[#8a8d98] mt-0.5">
                        {isAr
                          ? 'تصفح وفلتر وافحص ملفات التحقق من الهوية العراقية والكردستانية وتقارير كشف التزوير.'
                          : 'Browse, filter, and adjudicate Iraqi & KRG KYC dossiers and 9-stage anti-forgery reports.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#14151b] border border-zinc-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t(lang, 'exportCsvBtn')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${primaryBtnClass}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t(lang, 'ctaUpload')}</span>
                      </button>
                    </div>
                  </div>

                  {renderDossiersCatalogTable()}
                </section>
              )}

              {/* VIEW 1B: ZAINCASH MOBILE EDGE & DOCUMENT FORENSICS LAB */}
              {activeSection === 'forensics' && (
                <section
                  className="space-y-4"
                  aria-label={t(lang, 'navForensics')}
                >
                  <ZainCashEdgeForensicsLab
                    lang={lang}
                    onOpenUploadModal={() => setIsUploadModalOpen(true)}
                    onIngestTestedScenario={(newApp) => {
                      handleIngestApplicant(newApp);
                      setActiveSection('queue');
                    }}
                  />
                </section>
              )}

              {/* VIEW 1C: COMPETITION SHOWCASE — HOW THE SYSTEM WORKS */}
              {activeSection === 'challenge' && (
                <section
                  className="rounded-[20px] bg-zinc-100/90 dark:bg-[#1f2128] p-5 border border-zinc-200/60 dark:border-white/[0.03]"
                  aria-label={t(lang, 'navChallenge')}
                >
                  <CompetitionShowcaseTab
                    lang={lang}
                    onOpenUploadModal={() => setIsUploadModalOpen(true)}
                    onNavigateToQueue={() => setActiveSection('queue')}
                    onIngestTestedScenario={(newApp) => {
                      handleIngestApplicant(newApp);
                      setActiveSection('queue');
                    }}
                  />
                </section>
              )}

              {/* VIEW 2: DOCUMENT VAULT & 44-TYPE IRAQI REGISTRY */}
              {activeSection === 'vault' && (
                <section
                  className="rounded-[20px] bg-zinc-100/90 dark:bg-[#1f2128] p-5 border border-zinc-200/60 dark:border-white/[0.03] space-y-5"
                  aria-label={t(lang, 'navVault')}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-white/10">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {t(lang, 'vaultSectionTitle')}
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-[#8a8d98] mt-0.5">
                        {t(lang, 'vaultSectionSubtitle')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute top-2.5 start-3 pointer-events-none" />
                        <input
                          type="search"
                          value={vaultSearchQuery}
                          onChange={(e) => setVaultSearchQuery(e.target.value)}
                          placeholder={t(lang, 'vaultSearchPlaceholder')}
                          className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#14151b] text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${primaryBtnClass}`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t(lang, 'ctaUpload')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-5 border border-zinc-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#14151b] divide-y divide-zinc-200 dark:divide-white/5 overflow-hidden">
                      {allDocuments.map(({ doc, applicant }) => {
                        const isSelected = activeVaultItem?.doc.id === doc.id;
                        return (
                          <div
                            key={doc.id}
                            className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                              isSelected
                                ? 'bg-[#10b981]/15'
                                : 'hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                <FileText className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                                <span className="truncate">
                                  {lang === 'ar' ? doc.titleAr : doc.titleEn}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-[#8a8d98]">
                                <span>
                                  {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
                                </span>
                                <span className="mx-1" aria-hidden="true">
                                  ·
                                </span>
                                <span className="font-mono">
                                  {formatReferenceCode(doc.docNumber, lang)}
                                </span>
                                <span className="mx-1" aria-hidden="true">
                                  ·
                                </span>
                                <span className="font-mono">
                                  {formatSupportStatus(doc.supportStatus, lang)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVaultDocId(doc.id);
                                setVaultRotation(0);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-[#1f2128] border border-zinc-200 dark:border-white/10 hover:bg-[#10b981] hover:text-white rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              {t(lang, 'inspectBtn')}
                            </button>
                          </div>
                        );
                      })}
                    </div>

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
                          <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#14151b] flex items-center justify-between">
                            <div className="text-xs">
                              <span className="text-zinc-500 dark:text-[#8a8d98]">
                                {lang === 'ar' ? 'المتقدم المرتبط: ' : 'Associated Applicant: '}
                              </span>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {lang === 'ar'
                                  ? activeVaultItem.applicant.fullNameAr
                                  : activeVaultItem.applicant.fullNameEn}
                              </span>
                              <span className="mx-1.5 text-zinc-400">·</span>
                              <span className="font-mono text-zinc-500">
                                {formatReferenceCode(
                                  activeVaultItem.applicant.referenceCode,
                                  lang
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedApplicantId(activeVaultItem.applicant.id)
                              }
                              className="px-3 py-1 text-xs font-semibold text-[#34d399] hover:underline cursor-pointer"
                            >
                              {lang === 'ar'
                                ? 'فتح ملف الامتثال الكامل ←'
                                : 'Open Full Compliance Dossier →'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border border-zinc-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#14151b] overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a1c23] flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {lang === 'ar'
                          ? 'مصفوفة تغطية سجل الوثائق (44 نوع وثيقة عراقية وكردستانية · الفئات أ–ح)'
                          : 'DOCUMENT_REGISTRY Coverage Matrix (44 Registered Iraqi & KRG Types · Categories A–H)'}
                      </span>
                      <span className="text-[11px] font-mono text-[#34d399]">
                        {lang === 'ar'
                          ? 'فصل شفاف لحالة الدعم'
                          : 'HONEST SUPPORT STATUS SEPARATION'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-white/10 text-xs">
                      {iraqiDocumentRegistrySummary.map((cat) => (
                        <div key={cat.code} className="p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {lang === 'ar' ? cat.titleAr : cat.titleEn}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-[#34d399] font-semibold">
                              {cat.testedTypes}/{cat.totalTypes}{' '}
                              {lang === 'ar' ? 'مختبرة' : 'TESTED'}
                            </span>
                            <span>·</span>
                            <span className="text-zinc-500">
                              {formatSupportStatus(cat.defaultStatus, lang)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-[#8a8d98] leading-relaxed">
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
                <section
                  className="rounded-[20px] bg-zinc-100/90 dark:bg-[#1f2128] p-5 border border-zinc-200/60 dark:border-white/[0.03]"
                  aria-label={t(lang, 'navAutomation')}
                >
                  <AutomationRulesPanel
                    config={automationConfig}
                    applicants={applicants}
                    lang={lang}
                    onChangeConfig={setAutomationConfig}
                    onRunBatch={handleRunAutomatedBatch}
                  />
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Ultra-Sleek Single-Line Officer Hotkey Bar at Bottom of 1-Page Shell */}
      <div className="shrink-0 mt-2 pt-1.5 border-t border-zinc-200/70 dark:border-white/[0.05] flex items-center justify-between gap-2 text-[10px] overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#059669] dark:text-[#6ee7b7] font-mono font-bold">
            {isAr ? 'اختصارات الفرز السريع' : 'RAPID OFFICER TRIAGE HOTKEYS'}
          </span>
          {filteredApplicants[focusedQueueIndex] && (
            <span className="text-zinc-600 dark:text-[#8a8d98] font-mono">
              {isAr ? 'المحدد:' : 'Focused:'}{' '}
              <strong className="text-zinc-900 dark:text-white">
                {isAr
                  ? filteredApplicants[focusedQueueIndex].fullNameAr
                  : filteredApplicants[focusedQueueIndex].fullNameEn}
              </strong>{' '}
              ({filteredApplicants[focusedQueueIndex].referenceCode})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 dark:text-[#8a8d98] shrink-0">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#1f2128] text-zinc-800 dark:text-zinc-200">
              J/K
            </kbd>{' '}
            {isAr ? 'تنقل' : 'Nav'}
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#1f2128] text-zinc-800 dark:text-zinc-200">
              Enter
            </kbd>{' '}
            {isAr ? 'فحص' : 'Inspect'}
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
              A
            </kbd>{' '}
            {isAr ? 'موافقة' : 'Approve'}
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-500 dark:text-rose-400">
              R
            </kbd>{' '}
            {isAr ? 'رفض' : 'Reject'}
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-[#10b981]/25 text-[#059669] dark:text-[#6ee7b7]">
              M
            </kbd>{' '}
            {isAr ? 'عدسة 4x' : '4x Loupe'}
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#1f2128] text-zinc-800 dark:text-zinc-200">
              L
            </kbd>{' '}
            {isAr ? 'اللغة' : 'AR/EN'}
          </span>
        </div>
      </div>

      {/* Slide-over Dossier Inspector */}
      <ErrorBoundary
        sectionName="Dossier Inspector"
        fallbackTitleEn="An error occurred while inspecting this KYC dossier"
        fallbackTitleAr="حدث خطأ أثناء فحص ملف التحقق هذا"
        onReset={() => setSelectedApplicantId(null)}
      >
        <ApplicantInspectorDrawer
          applicant={selectedApplicant}
          lang={lang}
          onClose={() => setSelectedApplicantId(null)}
          onUpdateStatus={handleUpdateApplicantStatus}
          onRunSingleAutoEval={handleRunSingleAutoEval}
          onRegisterCandidateDoc={handleRegisterCandidateDoc}
          onAttachOrUpdatePacketResidenceCard={handleAttachOrUpdatePacketResidenceCard}
          onApplyAntiSpoofPreset={handleApplyAntiSpoofPreset}
          onApplyKurdishDialectTranslation={handleApplyKurdishDialectTranslation}
          onNavigateApplicant={handleNavigateApplicant}
          currentIndex={selectedApplicantIndex >= 0 ? selectedApplicantIndex : 0}
          totalQueueCount={filteredApplicants.length}
        />
      </ErrorBoundary>

      {/* Secure KYC Packet Upload Modal */}
      <ErrorBoundary
        sectionName="KYC Packet Ingestion Modal"
        fallbackTitleEn="An error occurred in the upload & ingestion modal"
        fallbackTitleAr="حدث خطأ أثناء تحميل وتدقيق حزمة الوثائق"
        onReset={() => setIsUploadModalOpen(false)}
      >
        <SecureUploadModal
          isOpen={isUploadModalOpen}
          lang={lang}
          onClose={() => setIsUploadModalOpen(false)}
          onIngestApplicant={handleIngestApplicant}
        />
      </ErrorBoundary>
    </div>
  );
}

