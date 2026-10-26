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
  History,
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
} from 'lucide-react';
import {
  computeKpiMetrics,
  evaluateApplicantWithRules,
  filterAndSortApplicants,
  runAutomatedBatchWorkflow,
  type AntiSpoofSimulationPreset,
  type AutomationConfig,
  type DocumentType,
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
import { PartnerAppSdkSimulator } from './components/PartnerAppSdkSimulator';

type ActiveSection =
  | 'dashboard'
  | 'queue'
  | 'forensics'
  | 'challenge'
  | 'vault'
  | 'automation'
  | 'audit';

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
  const [isPartnerSdkOpen, setIsPartnerSdkOpen] = useState<boolean>(false);

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

  // Percentages for the Order/Verification Status horizontal bar (Image 1 top-right card)
  const totalCount = Math.max(1, kpi.total);
  const approvedPct = ((kpi.approved / totalCount) * 100).toFixed(1);
  const reviewPct = ((kpi.actionRequired / totalCount) * 100).toFixed(1);
  const rejectedPct = ((kpi.rejected / totalCount) * 100).toFixed(1);

  // Primary CTA button styling
  const primaryBtnClass =
    'bg-[#059669] hover:bg-[#10b981] text-white border border-emerald-500/30 shadow-xs';

  const sectionTitleMap: Record<ActiveSection, { en: string; ar: string }> = {
    dashboard: { en: 'Overview Dashboard', ar: 'لوحة التحكم الرئيسية' },
    queue: { en: 'Applicant Dossiers', ar: 'سجل ملفات المتقدمين' },
    forensics: { en: 'Anti-Forgery & Edge Lab', ar: 'مختبر كشف التزوير والجودة' },
    challenge: { en: 'How the System Works', ar: 'كيف يعمل النظام · المسابقة' },
    vault: { en: 'Document Vault (44 Types)', ar: 'خزنة الوثائق العراقية' },
    automation: { en: 'Automation Rules', ar: 'قواعد الأتمتة والمخاطر' },
    audit: { en: 'Cryptographic Audit', ar: 'سجل التدقيق التشفيري' },
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

  // Shared High-Density Dossier Table (Matches Image 2's Products Table with thumbnails, SKU codes, category pills & green/red progress bars)
  const renderDossiersCatalogTable = (compactLimit?: number) => {
    const rowsToRender = compactLimit
      ? filteredApplicants.slice(0, compactLimit)
      : filteredApplicants;

    return (
      <div className="space-y-4">
        {/* Underline Tabs + Filter Bar (Matches Image 2) */}
        <div className="space-y-3">
          {/* Underline Status Tabs */}
          <div
            role="tablist"
            aria-label="Filter by verification status"
            className="flex items-center gap-6 border-b border-zinc-200 dark:border-[#222225] overflow-x-auto"
          >
            {(
              [
                { id: 'all', label: isAr ? 'جميع الملفات' : 'All dossiers', count: kpi.total },
                { id: 'pending', label: isAr ? 'قيد الانتظار' : 'Pending', count: kpi.pending },
                { id: 'flagged', label: isAr ? 'مراجعة بشرية' : 'Flagged', count: kpi.flagged },
                { id: 'approved', label: isAr ? 'معتمد' : 'Approved', count: kpi.approved },
                { id: 'rejected', label: isAr ? 'مرفوض / مزور' : 'Rejected', count: kpi.rejected },
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
                  className={`pb-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2 -mb-px flex items-center gap-1.5 ${
                    active
                      ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Inputs Row (Matches Image 2: Search input + Category/Supplier/Stock dropdowns + Manage Table button) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute top-2.5 start-3 pointer-events-none" />
                <input
                  type="search"
                  aria-label={t(lang, 'searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث بالاسم أو الرقم المرجعي...' : 'Search dossiers...'}
                  className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
              </div>

              <select
                aria-label="Filter by Document Type"
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value as DocumentType | 'all')}
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#0c0c0e] text-zinc-700 dark:text-zinc-200"
              >
                <option value="all">{isAr ? 'نوع الوثيقة: الكل' : 'Category'}</option>
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
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#0c0c0e] text-zinc-700 dark:text-zinc-200"
              >
                <option value="all">{isAr ? 'مستوى المخاطر: الكل' : 'Risk level'}</option>
                <option value="low">{t(lang, 'riskLow')}</option>
                <option value="medium">{t(lang, 'riskMedium')}</option>
                <option value="high">{t(lang, 'riskHigh')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRunAutomatedBatch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-[#222225] hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t(lang, 'runBatchBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t(lang, 'resetDemoBtn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* High-Density Data Table (Matches Image 2) */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] overflow-hidden">
          {rowsToRender.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t(lang, 'emptyQueueTitle')}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
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
                className={`px-4 py-2 text-xs rounded-lg transition-colors ${primaryBtnClass}`}
              >
                {t(lang, 'clearFiltersBtn')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-[#222225] bg-zinc-50/70 dark:bg-[#141417] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    <th className="py-3 ps-4 pe-3 text-start">
                      {isAr ? 'المتقدم والوثيقة' : 'Applicant & Specimen'}
                    </th>
                    <th className="py-3 px-3 text-start">
                      {isAr ? 'الرمز المرجعي' : 'Reference SKU'}
                    </th>
                    <th className="py-3 px-3 text-start">
                      {isAr ? 'الفئة' : 'Category'}
                    </th>
                    <th className="py-3 px-3 text-start">
                      {isAr ? 'المحافظة والمسار' : 'Governorate · Pipeline'}
                    </th>
                    <th className="py-3 px-3 text-start">
                      <button
                        type="button"
                        onClick={() => toggleSort('ocrConfidence')}
                        className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        <span>{isAr ? 'دقة القراءة والأصالة' : 'Authenticity & OCR'}</span>
                        <ArrowUpDown className="w-3 h-3 shrink-0" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-start">
                      <button
                        type="button"
                        onClick={() => toggleSort('riskScore')}
                        className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        <span>{isAr ? 'المخاطر والحالة' : 'Risk & Status'}</span>
                        <ArrowUpDown className="w-3 h-3 shrink-0" />
                      </button>
                    </th>
                    <th className="py-3 ps-3 pe-4 text-end">
                      {isAr ? 'إجراء' : 'Inspect'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-[#1f1f23] text-xs">
                  {rowsToRender.map((applicant) => {
                    const minOcr = Math.min(
                      ...applicant.documents.map((d) => d.ocrConfidence)
                    );
                    const primaryDoc = applicant.documents[0];
                    const isHighConfidence =
                      minOcr >= 85 &&
                      applicant.status !== 'rejected' &&
                      applicant.riskTier !== 'high';

                    return (
                      <tr
                        key={applicant.id}
                        onClick={() => setSelectedApplicantId(applicant.id)}
                        className="hover:bg-zinc-50/90 dark:hover:bg-[#18181b] transition-colors cursor-pointer"
                      >
                        {/* 1. Thumbnail + Applicant Name (Matches Image 2 Product Name + square image) */}
                        <td className="py-3 ps-4 pe-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                              {primaryDoc?.customImageUrl ? (
                                <img
                                  src={primaryDoc.customImageUrl}
                                  alt={applicant.fullNameEn}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center text-[9px] font-mono text-emerald-400 border border-emerald-900/40">
                                  <span>{isAr ? 'عراق' : 'IRQ'}</span>
                                  <span className="text-[7px] text-zinc-400">
                                    {isAr ? 'هوية' : 'ID'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {isAr ? applicant.fullNameAr : applicant.fullNameEn}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[180px]">
                                {primaryDoc
                                  ? isAr
                                    ? primaryDoc.titleAr
                                    : primaryDoc.titleEn
                                  : isAr
                                    ? applicant.normalizedEntityName
                                    : applicant.fullNameEn}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Reference SKU (Matches Image 2 SKU-TREAT-6612) */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                          <div>{formatReferenceCode(applicant.referenceCode, lang)}</div>
                          <div className="text-[11px] text-zinc-500">
                            {primaryDoc ? formatReferenceCode(primaryDoc.docNumber, lang) : '—'}
                          </div>
                        </td>

                        {/* 3. Category Badge (Matches Image 2 subtle dark rounded pill) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-[#1f1f23] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                            {getDocCategoryBadge(primaryDoc?.type)}
                          </span>
                        </td>

                        {/* 4. Governorate & Stage 9 (Matches Image 2 Supplier column) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-medium text-zinc-800 dark:text-zinc-200">
                            {isAr ? applicant.governorateAr : applicant.governorateEn}
                            <span className="text-zinc-500 font-normal">
                              {' '}
                              ·{' '}
                              {applicant.entityType === 'corporate'
                                ? t(lang, 'entityCorporate')
                                : t(lang, 'entityIndividual')}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                            {formatStage9Outcome(applicant.stage9Outcome, lang)}
                          </div>
                        </td>

                        {/* 5. Authenticity & OCR Progress Bar (Exact match to Image 2's "96 units · High" green/red bar) */}
                        <td className="py-3 px-3 whitespace-nowrap min-w-[165px]">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-mono tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
                              {minOcr}% {isAr ? 'دقة القراءة' : 'OCR'}
                            </span>
                            <span className="text-zinc-500">·</span>
                            <span
                              className={`font-medium ${
                                isHighConfidence
                                  ? 'text-emerald-600 dark:text-[#10b981]'
                                  : 'text-red-600 dark:text-[#ef4444]'
                              }`}
                            >
                              {isHighConfidence
                                ? isAr
                                  ? 'أصلي مرتفع'
                                  : 'High'
                                : isAr
                                  ? 'منخفض / مريب'
                                  : 'Low'}
                            </span>
                          </div>
                          <div className="mt-1.5 w-32 h-1.5 rounded-full bg-zinc-200 dark:bg-[#222225] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHighConfidence ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                              }`}
                              style={{ width: `${Math.max(12, Math.min(100, minOcr))}%` }}
                            />
                          </div>
                        </td>

                        {/* 6. Risk Score & Status Badge (Matches Image 1 & 2) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                              {applicant.riskScore}/100
                            </span>
                            {applicant.status === 'approved' && (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                {t(lang, 'statusApproved')}
                              </span>
                            )}
                            {applicant.status === 'pending' && (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                                {t(lang, 'statusPendingShort')}
                              </span>
                            )}
                            {applicant.status === 'flagged' && (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {t(lang, 'statusFlaggedShort')}
                              </span>
                            )}
                            {applicant.status === 'rejected' && (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
                                {t(lang, 'statusRejected')}
                              </span>
                            )}
                            {applicant.documents.some(
                              (d) =>
                                d.isForeignDocument ||
                                d.type === 'FOREIGN_NATIONAL_ID' ||
                                d.type === 'FOREIGN_PASSPORT' ||
                                (d.issuingCountryCode && d.issuingCountryCode !== 'IRQ')
                            ) && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                {isAr ? 'وثيقة أجنبية · محال للبشري' : 'FOREIGN DOC · REVERTED'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 7. Action Button */}
                        <td
                          className="py-3 ps-3 pe-4 text-end whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedApplicantId(applicant.id)}
                            aria-label={`${t(lang, 'inspectBtn')} ${applicant.fullNameEn}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors"
                          >
                            <span>{t(lang, 'inspectBtn')}</span>
                            <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
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
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f8f8f9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* =====================================================================
          LEFT / RIGHT (RTL-AWARE) ADMIN SIDEBAR (EXACT MATCH TO SCREENSHOTS)
          ===================================================================== */}
      {/* =====================================================================
          LEFT / RIGHT (RTL-AWARE) ADMIN SIDEBAR
          Expanded (w-60) or Collapsed Rail (w-16) - Exact match to user screenshot
          ===================================================================== */}
      {sidebarOpen ? (
        <aside
          aria-label="Primary Sidebar Navigation (Expanded)"
          className="w-60 shrink-0 border-e border-zinc-200 dark:border-[#1f1f23] bg-white dark:bg-[#0c0c0e] flex flex-col justify-between select-none transition-all duration-200"
        >
          {/* Top Brand Header + Sidebar Collapse Icon */}
          <div>
            <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-[#1f1f23]">
              <button
                type="button"
                onClick={() => setActiveSection('dashboard')}
                className="flex items-center gap-2.5 text-start min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  {isAr ? 'ر' : 'R'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {isAr ? 'روسترو للامتثال' : 'Rostro Admin'}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">
                    {isAr ? 'البنك المركزي العراقي · التحقق' : 'CBI Law 78 + Forensics'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse Sidebar to Rail"
                title={isAr ? 'تصغير إلى الشريط المدمج' : 'Collapse to rail'}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Grouped Navigation Menus */}
            <div className="p-3 space-y-5 text-xs">
              {/* Group 1: Verification & Forensics */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {isAr ? 'التحقق والفحص الجنائي' : 'Verification & Queue'}
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
                      id: 'queue' as ActiveSection,
                      icon: Users,
                      labelEn: 'Applicant Dossiers',
                      labelAr: 'ملفات المتقدمين',
                    },
                    {
                      id: 'forensics' as ActiveSection,
                      icon: ShieldCheck,
                      labelEn: 'Anti-Forgery Lab',
                      labelAr: 'فاحص كشف التزوير',
                    },
                    {
                      id: 'vault' as ActiveSection,
                      icon: FolderClosed,
                      labelEn: 'Document Vault',
                      labelAr: 'خزنة الوثائق',
                    },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${
                        active
                          ? 'bg-zinc-100 dark:bg-[#1c1c20] text-zinc-900 dark:text-zinc-100 font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#141417] hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="truncate">{isAr ? item.labelAr : item.labelEn}</span>
                      </span>
                      <ChevronIcon className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Group 2: Competition & Architecture */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {isAr ? 'عرض المسابقة والنظام' : 'Competition Showcase'}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection('challenge')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${
                    activeSection === 'challenge'
                      ? 'bg-zinc-100 dark:bg-[#1c1c20] text-zinc-900 dark:text-zinc-100 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#141417] hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Layers className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="truncate">{t(lang, 'navChallenge')}</span>
                  </span>
                  <ChevronIcon className="w-3.5 h-3.5 opacity-50 shrink-0" />
                </button>
              </div>

              {/* Group 3: Compliance & Governance */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {isAr ? 'الامتثال والحوكمة' : 'Compliance Processor'}
                </div>

                {(
                  [
                    {
                      id: 'automation' as ActiveSection,
                      icon: Sliders,
                      labelEn: 'Automation Rules',
                      labelAr: 'قواعد الأتمتة',
                    },
                    {
                      id: 'audit' as ActiveSection,
                      icon: History,
                      labelEn: 'Cryptographic Audit',
                      labelAr: 'سجل التدقيق التشفيري',
                    },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${
                        active
                          ? 'bg-zinc-100 dark:bg-[#1c1c20] text-zinc-900 dark:text-zinc-100 font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#141417] hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="truncate">{isAr ? item.labelAr : item.labelEn}</span>
                      </span>
                      <ChevronIcon className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom User Profile Card in Sidebar (Matches ausrobdev footer in Screenshots) */}
          <div className="p-3 border-t border-zinc-200 dark:border-[#1f1f23]">
            <button
              type="button"
              onClick={() => setActiveSection('audit')}
              className="w-full flex items-center justify-between gap-2.5 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#141417] transition-colors text-start"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                  {isAr ? 'م.ا' : 'CO'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {isAr ? 'مسؤول الامتثال' : 'Compliance Officer'}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {isAr ? 'وحدة التدقيق والرقابة المصرفية' : 'cbi-audit@rostro.iq'}
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </button>
          </div>
        </aside>
      ) : (
        /* =====================================================================
           COLLAPSED ICON RAIL (STRICTLY THE APP'S 7 ACTUAL NAVIGATION SECTIONS)
           ===================================================================== */
        <aside
          aria-label="Primary Sidebar Rail (Collapsed)"
          className="w-16 shrink-0 border-e border-zinc-200 dark:border-[#1f1f23] bg-white dark:bg-[#0c0c0e] flex flex-col justify-between py-3 select-none transition-all duration-200 z-30"
        >
          {/* Top Section: Toggle Button & Navigation Items */}
          <div className="flex flex-col items-center w-full px-2">
            {/* Top Sidebar Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={isAr ? 'توسيع القائمة الجانبية' : 'Expand sidebar'}
              title={isAr ? 'توسيع القائمة الجانبية' : 'Expand sidebar'}
              className="w-10 h-10 mb-3 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group relative"
            >
              <PanelLeft className="w-5 h-5" />
              <div className="absolute start-full ms-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 dark:bg-[#141416] border border-zinc-700/80 text-zinc-100 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                {isAr ? 'توسيع القائمة' : 'Expand sidebar'}
              </div>
            </button>

            {/* Group 1: Verification & Queue */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {[
                {
                  id: 'dashboard' as ActiveSection,
                  icon: LayoutGrid,
                  labelEn: 'Dashboard',
                  labelAr: 'لوحة التحكم',
                },
                {
                  id: 'queue' as ActiveSection,
                  icon: Users,
                  labelEn: 'Applicant Dossiers',
                  labelAr: 'ملفات المتقدمين',
                },
                {
                  id: 'forensics' as ActiveSection,
                  icon: ShieldCheck,
                  labelEn: 'Anti-Forgery Lab',
                  labelAr: 'فاحص كشف التزوير',
                },
                {
                  id: 'vault' as ActiveSection,
                  icon: FolderClosed,
                  labelEn: 'Document Vault',
                  labelAr: 'خزنة الوثائق',
                },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    aria-label={isAr ? item.labelAr : item.labelEn}
                    title={isAr ? item.labelAr : item.labelEn}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                      active
                        ? 'bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    {/* Active vertical emerald green indicator pill on outer edge */}
                    {active && (
                      <span className="w-[3.5px] h-5 rounded-full bg-[#22c55e] absolute -end-[1.5px] top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                    )}

                    {/* Popout Tooltip */}
                    <div className="absolute start-full ms-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 dark:bg-[#141416] border border-zinc-700/80 text-zinc-100 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      {isAr ? item.labelAr : item.labelEn}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-6 h-px bg-zinc-200 dark:bg-[#222226] my-2" />

            {/* Group 2: Competition Showcase */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {(() => {
                const active = activeSection === 'challenge';
                return (
                  <button
                    type="button"
                    onClick={() => setActiveSection('challenge')}
                    aria-label={t(lang, 'navChallenge')}
                    title={t(lang, 'navChallenge')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                      active
                        ? 'bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-transparent'
                    }`}
                  >
                    <Layers
                      className={`w-5 h-5 shrink-0 ${
                        active
                          ? 'text-emerald-500'
                          : 'text-zinc-400 group-hover:text-emerald-400'
                      }`}
                    />

                    {active && (
                      <span className="w-[3.5px] h-5 rounded-full bg-[#22c55e] absolute -end-[1.5px] top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                    )}

                    <div className="absolute start-full ms-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 dark:bg-[#141416] border border-zinc-700/80 text-zinc-100 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      {t(lang, 'navChallenge')}
                    </div>
                  </button>
                );
              })()}
            </div>

            {/* Divider */}
            <div className="w-6 h-px bg-zinc-200 dark:bg-[#222226] my-2" />

            {/* Group 3: Compliance Processor */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {[
                {
                  id: 'automation' as ActiveSection,
                  icon: Sliders,
                  labelEn: 'Automation Rules',
                  labelAr: 'قواعد الأتمتة',
                },
                {
                  id: 'audit' as ActiveSection,
                  icon: History,
                  labelEn: 'Cryptographic Audit',
                  labelAr: 'سجل التدقيق التشفيري',
                },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    aria-label={isAr ? item.labelAr : item.labelEn}
                    title={isAr ? item.labelAr : item.labelEn}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                      active
                        ? 'bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    {active && (
                      <span className="w-[3.5px] h-5 rounded-full bg-[#22c55e] absolute -end-[1.5px] top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                    )}

                    <div className="absolute start-full ms-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 dark:bg-[#141416] border border-zinc-700/80 text-zinc-100 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      {isAr ? item.labelAr : item.labelEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Compliance Officer Profile Pill */}
          <div className="flex flex-col items-center w-full px-2 pt-2 border-t border-zinc-200 dark:border-[#1f1f23]">
            <button
              type="button"
              onClick={() => setActiveSection('audit')}
              aria-label={isAr ? 'مسؤول الامتثال' : 'Compliance Officer'}
              title={
                isAr
                  ? 'مسؤول الامتثال · وحدة التدقيق والرقابة المصرفية'
                  : 'Compliance Officer · cbi-audit@rostro.iq'
              }
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group relative"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono text-xs font-semibold">
                {isAr ? 'م.ا' : 'CO'}
              </div>
              <div className="absolute start-full ms-3 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 dark:bg-[#141416] border border-zinc-700/80 text-zinc-100 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                <div className="font-semibold text-zinc-100">
                  {isAr ? 'مسؤول الامتثال' : 'Compliance Officer'}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {isAr ? 'وحدة التدقيق والرقابة' : 'cbi-audit@rostro.iq'}
                </div>
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* =====================================================================
          MAIN RIGHT WORKSPACE COLUMN
          ===================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOP ADMIN BAR (Matches Screenshot 1 & 2 Top Header) */}
        <header className="h-14 px-4 sm:px-6 border-b border-zinc-200 dark:border-[#1f1f23] bg-white dark:bg-[#09090b] flex items-center justify-between gap-4">
          {/* Left: Sidebar Trigger (if collapsed) + Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-xs min-w-0">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open Sidebar"
                className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline truncate">
              {isAr ? 'نظام روسترو الرقابي' : 'Rostro Admin Kit'}
            </span>
            <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">/</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {isAr
                ? sectionTitleMap[activeSection].ar
                : sectionTitleMap[activeSection].en}
            </span>
          </div>

          {/* Center: Command Search Input (Matches Screenshot 2 "Search pages or run commands ⌘K") */}
          <div className="hidden lg:flex items-center w-80">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute top-2.5 start-3 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeSection !== 'dashboard' && activeSection !== 'queue') {
                    setActiveSection('queue');
                  }
                }}
                placeholder={
                  isAr
                    ? 'ابحث عن متقدم أو رقم وثيقة...'
                    : 'Search dossiers or run commands...'
                }
                className="w-full ps-8 pe-12 py-1.5 text-xs rounded-full border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
              />
              <span className="absolute top-1.5 end-2.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 pointer-events-none">
                {isAr ? 'بحث' : '⌘K'}
              </span>
            </div>
          </div>

          {/* Right: Language Toggle, Notification Bell, Dark/Light & Theme Preset Switcher (Supabase / Default) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Single-Script Language Toggle */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              aria-label={lang === 'en' ? 'Switch interface language' : 'تغيير لغة الواجهة'}
              title={lang === 'en' ? 'Switch interface language' : 'تغيير لغة الواجهة'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-[#141417] border border-zinc-200 dark:border-[#222225] rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'en' ? 'Language: EN' : 'اللغة: العربية'}</span>
            </button>

            {/* Flagged Notifications Counter (Matches Bell with Red Badge in Screenshots) */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('flagged');
                setActiveSection('queue');
              }}
              aria-label="View Flagged Dossiers"
              className="relative p-2 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-100 dark:bg-[#141417] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {kpi.flagged > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {kpi.flagged}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Button */}
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle Dark or Light Theme"
              className="p-2 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-100 dark:bg-[#141417] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Mobile Quick Navigation Bar */}
        <div className="flex md:hidden items-center gap-1.5 px-4 py-2 border-b border-zinc-200 dark:border-[#1f1f23] bg-white dark:bg-[#0c0c0e] overflow-x-auto">
          {(
            ['dashboard', 'queue', 'challenge', 'forensics', 'vault', 'automation', 'audit'] as ActiveSection[]
          ).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap shrink-0 ${
                activeSection === sec
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {isAr ? sectionTitleMap[sec].ar : sectionTitleMap[sec].en}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Live Feedback Toast Banner after Batch Run or Upload */}
          {batchBannerMessage && (
            <div
              role="status"
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300"
            >
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{batchBannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setBatchBannerMessage(null)}
                className="text-xs font-semibold underline hover:no-underline whitespace-nowrap shrink-0"
              >
                {isAr ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}

          {/* =================================================================
              VIEW 0: OVERVIEW DASHBOARD (EXACT MATCH TO SCREENSHOT 1)
              ================================================================= */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Welcome Header + Export & Primary CTA Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {isAr
                      ? 'مرحباً بعودتك، مسؤول الامتثال!'
                      : 'Welcome Back, Compliance Officer!'}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {isAr ? (
                      <>
                        لديك اليوم{' '}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {kpi.pending} ملفات قيد الفحص
                        </span>{' '}
                        و{' '}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {kpi.flagged} تنبيهات تزوير أو نقص
                        </span>{' '}
                        بانتظار القرار
                      </>
                    ) : (
                      <>
                        Today you have{' '}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {kpi.pending} dossiers
                        </span>{' '}
                        to fulfill,{' '}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {kpi.flagged} flagged reviews
                        </span>{' '}
                        pending
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPartnerSdkOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? 'تجربة الكاميرا داخل تطبيقات الهواتف (SDK)'
                        : 'Try In-App Camera SDK (Laptop Webcam)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#141417] border border-zinc-200 dark:border-[#222225] hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t(lang, 'exportCsvBtn')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${primaryBtnClass}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t(lang, 'ctaUpload')}</span>
                  </button>
                </div>
              </div>

              {/* 4-Column Divided KPI Strip (Matches Screenshot 1 Top Card Row) */}
              <section
                aria-label="Compliance Key Performance Indicators"
                className="rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-[#222225]"
              >
                {/* KPI 1 */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t(lang, 'kpiTotal')}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                    {kpi.total}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span className="text-[#10b981] font-mono">
                      {isAr ? `+18.4% (${kpi.totalDocs} وثيقة)` : `+18.4% (${kpi.totalDocs} docs)`}
                    </span>
                    <span>•</span>
                    <span>{isAr ? 'مقارنة بالدفعة السابقة' : 'vs Last Cycle'}</span>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t(lang, 'kpiApproved')}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                    {kpi.approved}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span className="text-[#10b981] font-mono">
                      +{kpi.approvalRate}% ({t(lang, 'kpiApprovalRate')})
                    </span>
                    <span>•</span>
                    <span>{isAr ? 'وثائق أصلية مؤكدة' : 'Authentic Verified'}</span>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t(lang, 'kpiActionRequired')}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                    {kpi.actionRequired}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span className="text-[#10b981] font-mono">
                      {kpi.pending} {t(lang, 'filterPending')}
                    </span>
                    <span>•</span>
                    <span>
                      {kpi.flagged} {t(lang, 'filterFlagged')}
                    </span>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t(lang, 'kpiRejected')}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                    {kpi.rejected}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span className="text-[#ef4444] font-mono">
                      -13.7% ({t(lang, 'kpiAvgOcr')} {kpi.avgOcr}%)
                    </span>
                    <span>•</span>
                    <span>{isAr ? 'كشف التزوير والرفض' : 'ELA / MRZ Blocked'}</span>
                  </div>
                </div>
              </section>

              {/* Middle Analytics Grid: 8-Col Area Telemetry Chart + 4-Col Status & Category Donut (Exact Match to Screenshot 1) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 8 Columns: Smooth Dual-Curve Emerald Area Chart */}
                <div className="lg:col-span-8 rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] p-6 flex flex-col justify-between">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-2xl font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                        {kpi.avgOcr}.0% {isAr ? 'متوسط الثقة' : 'Mean Authenticity'}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {isAr
                          ? 'معدل فحص الوثائق العراقية وكشف التزوير (آخر 6 أشهر)'
                          : 'Total Verification & Anti-Forgery Throughput (Last 6 Months)'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <span>{isAr ? 'الوثائق الأصلية' : 'Authentic Pass'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#065f46]" />
                        <span>{isAr ? 'الدفعة السابقة' : 'Prev Cycle'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Clean Financial/Telemetry Area Chart SVG */}
                  <div className="mt-6 pt-2">
                    <svg
                      viewBox="0 0 720 220"
                      className="w-full h-52 overflow-visible"
                      role="img"
                      aria-label="Verification throughput chart over 6 months"
                    >
                      <defs>
                        <linearGradient id="supabaseEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="supabaseDeepGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Reference Grid Lines */}
                      {[
                        { y: 20, label: '100%' },
                        { y: 65, label: '75%' },
                        { y: 110, label: '50%' },
                        { y: 155, label: '25%' },
                        { y: 195, label: '0%' },
                      ].map((row) => (
                        <g key={row.y}>
                          <text
                            x="0"
                            y={row.y + 3}
                            fill="#71717a"
                            fontSize="10"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {row.label}
                          </text>
                          <line
                            x1="42"
                            y1={row.y}
                            x2="705"
                            y2={row.y}
                            stroke="#222225"
                            strokeWidth="1"
                          />
                        </g>
                      ))}

                      {/* Secondary Curve Fill & Stroke */}
                      <path
                        d="M 42 125 C 110 105, 140 100, 175 105 C 230 112, 260 118, 308 112 C 365 104, 395 88, 440 92 C 495 97, 525 108, 572 100 C 625 90, 665 82, 705 74 L 705 195 L 42 195 Z"
                        fill="url(#supabaseDeepGrad)"
                      />
                      <path
                        d="M 42 125 C 110 105, 140 100, 175 105 C 230 112, 260 118, 308 112 C 365 104, 395 88, 440 92 C 495 97, 525 108, 572 100 C 625 90, 665 82, 705 74"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2"
                      />

                      {/* Primary Curve Fill & Stroke */}
                      <path
                        d="M 42 115 C 100 122, 135 128, 175 118 C 230 102, 260 65, 308 68 C 365 72, 395 105, 440 96 C 495 85, 525 42, 572 44 C 625 46, 665 78, 705 90 L 705 195 L 42 195 Z"
                        fill="url(#supabaseEmeraldGrad)"
                      />
                      <path
                        d="M 42 115 C 100 122, 135 128, 175 118 C 230 102, 260 65, 308 68 C 365 72, 395 105, 440 96 C 495 85, 525 42, 572 44 C 625 46, 665 78, 705 90"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.2"
                      />

                      {/* Month Labels */}
                      {[
                        { x: 48, labelEn: 'Jan', labelAr: 'كانون ٢' },
                        { x: 175, labelEn: 'Feb', labelAr: 'شباط' },
                        { x: 308, labelEn: 'Mar', labelAr: 'آذار' },
                        { x: 440, labelEn: 'Apr', labelAr: 'نيسان' },
                        { x: 572, labelEn: 'May', labelAr: 'أيار' },
                        { x: 690, labelEn: 'Jun', labelAr: 'حزيران' },
                      ].map((m) => (
                        <text
                          key={m.labelEn}
                          x={m.x}
                          y="214"
                          fill="#71717a"
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {isAr ? m.labelAr : m.labelEn}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Right 4 Columns: Stacked Verification Status Bar + Documents by Category Donut */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  {/* Top Right Card: Verification Status (Matches "Order Status" in Screenshot 1) */}
                  <div className="rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#141417] flex items-center justify-center text-zinc-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {isAr ? 'حالة مسار التحقق' : 'Verification Status'}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {kpi.total} {isAr ? 'ملفات في الدفعة الحالية' : 'Dossiers This Cycle'}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                    </div>

                    {/* Segmented Emerald Bar */}
                    <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-[#1c1c20] overflow-hidden flex">
                      <div
                        style={{ width: `${approvedPct}%` }}
                        className="bg-[#10b981] h-full transition-all"
                      />
                      <div
                        style={{ width: `${reviewPct}%` }}
                        className="bg-[#059669] h-full transition-all"
                      />
                      <div
                        style={{ width: `${rejectedPct}%` }}
                        className="bg-[#064e3b] h-full transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono tabular-nums text-zinc-400">
                      <span>{approvedPct}%</span>
                      <span>{reviewPct}%</span>
                      <span>{rejectedPct}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <span>{t(lang, 'filterApproved')}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                        <span>{t(lang, 'filterFlagged')}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#064e3b]" />
                        <span>{t(lang, 'filterRejected')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Right Card: Documents by Category (Matches "Sales by Category" in Screenshot 1) */}
                  <div className="rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#141417] flex items-center justify-center text-zinc-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {isAr ? 'توزيع الوثائق العراقية' : 'Documents by Category'}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            <span className="text-[#10b981] font-mono">+12.4%</span>{' '}
                            {isAr ? 'مقارنة بالشهر الماضي' : 'vs last cycle'}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      {/* Donut Chart SVG */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#1f1f23"
                            strokeWidth="12"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="12"
                            strokeDasharray="135 240"
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#059669"
                            strokeWidth="12"
                            strokeDasharray="60 240"
                            strokeDashoffset="-138"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#064e3b"
                            strokeWidth="12"
                            strokeDasharray="40 240"
                            strokeDashoffset="-200"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                            {kpi.totalDocs}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {isAr ? 'وثيقة' : 'Total'}
                          </span>
                        </div>
                      </div>

                      {/* Category Legend List */}
                      <div className="flex-1 space-y-2 text-xs">
                        {categoryBreakdown.map((cat) => (
                          <div
                            key={cat.labelEn}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 truncate">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="truncate">
                                {isAr ? cat.labelAr : cat.labelEn}
                              </span>
                            </span>
                            <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100 shrink-0">
                              {cat.count}{' '}
                              <span className="text-zinc-500 text-[11px]">{cat.pct}%</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Full Interactive Dossiers Table + Recent Audit Activity (Combines Screenshot 1 Bottom & Screenshot 2 Catalog) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-8 rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#141417] flex items-center justify-center text-zinc-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {isAr ? 'سجل ملفات التحقق والوثائق' : 'Verification Dossiers'}
                      </h2>
                      <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-100 dark:bg-[#1f1f23] text-zinc-600 dark:text-zinc-300">
                        {filteredApplicants.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection('queue')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#141417] border border-zinc-200 dark:border-[#222225] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{isAr ? 'عرض الجدول الكامل' : 'Full Catalog View'}</span>
                    </button>
                  </div>

                  {renderDossiersCatalogTable()}
                </div>

                {/* Right 4 Columns: Recent Activity Feed (Matches "Recent Activity" in Screenshot 1) */}
                <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#141417] flex items-center justify-center text-zinc-400">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {isAr ? 'أحدث حركات التدقيق' : 'Recent Activity'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('audit')}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {isAr ? 'الكل' : 'View all'}
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-200 dark:divide-[#1f1f23]">
                    {allAuditEvents.slice(0, 6).map(({ evt, applicant }) => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedApplicantId(applicant.id)}
                        className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3 cursor-pointer hover:opacity-90"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {isAr ? evt.actionAr : evt.actionEn}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            {isAr ? applicant.fullNameAr : applicant.fullNameEn} ·{' '}
                            <span className="font-mono">
                              {formatReferenceCode(applicant.referenceCode, lang)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-zinc-500 shrink-0">
                          {formatTimestamp(evt.timestamp.replace('2026-10-17 ', ''), lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 1: FULL APPLICANT DOSSIERS CATALOG (EXACT MATCH TO SCREENSHOT 2)
              ================================================================= */}
          {activeSection === 'queue' && (
            <section className="space-y-5" aria-label={t(lang, 'navQueue')}>
              {/* Page Title + Subtitle + Primary "+ Verify Document" Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {isAr ? 'سجل ملفات المتقدمين والوثائق' : 'Applicant Dossiers'}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {isAr
                      ? 'تصفح وفلتر وافحص ملفات التحقق من الهوية العراقية وتقارير كشف التزوير.'
                      : 'Browse, filter, and adjudicate Iraqi KYC dossiers and 5-layer anti-forgery reports.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#141417] border border-zinc-200 dark:border-[#222225] hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t(lang, 'exportCsvBtn')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${primaryBtnClass}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t(lang, 'ctaUpload')}</span>
                  </button>
                </div>
              </div>

              {renderDossiersCatalogTable()}
            </section>
          )}

          {/* =================================================================
              VIEW 1B: ZAINCASH MOBILE EDGE & DOCUMENT FORENSICS LAB
              ================================================================= */}
          {activeSection === 'forensics' && (
            <section aria-label={t(lang, 'navForensics')}>
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

          {/* =================================================================
              VIEW 1C: COMPETITION SHOWCASE — HOW THE SYSTEM WORKS
              ================================================================= */}
          {activeSection === 'challenge' && (
            <section aria-label={t(lang, 'navChallenge')}>
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

          {/* =================================================================
              VIEW 2: DOCUMENT VAULT & 44-TYPE IRAQI REGISTRY
              ================================================================= */}
          {activeSection === 'vault' && (
            <section className="space-y-6" aria-label={t(lang, 'navVault')}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222225]">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {t(lang, 'vaultSectionTitle')}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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
                      className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${primaryBtnClass}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t(lang, 'ctaUpload')}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Document Index List */}
                <div className="lg:col-span-5 border border-zinc-200 dark:border-[#222225] rounded-xl bg-white dark:bg-[#111113] divide-y divide-zinc-200 dark:divide-[#1f1f23]">
                  {allDocuments.map(({ doc, applicant }) => {
                    const isSelected = activeVaultItem?.doc.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/10'
                            : 'hover:bg-zinc-50 dark:hover:bg-[#18181b]'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">
                              {lang === 'ar' ? doc.titleAr : doc.titleEn}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
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
                          className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors whitespace-nowrap shrink-0"
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
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#111113] flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'المتقدم المرتبط: ' : 'Associated Applicant: '}
                          </span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {lang === 'ar'
                              ? activeVaultItem.applicant.fullNameAr
                              : activeVaultItem.applicant.fullNameEn}
                          </span>
                          <span className="mx-1.5 text-zinc-400">·</span>
                          <span className="font-mono text-zinc-500">
                            {formatReferenceCode(activeVaultItem.applicant.referenceCode, lang)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedApplicantId(activeVaultItem.applicant.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
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

              {/* 44-Type Iraqi & MENA Document Registry Matrix (Categories A–H) */}
              <div className="border border-zinc-200 dark:border-[#222225] rounded-xl bg-white dark:bg-[#111113] overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-[#222225] bg-zinc-50 dark:bg-[#141417] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {lang === 'ar'
                      ? 'مصفوفة تغطية سجل الوثائق (44 نوع وثيقة عراقية وكردستانية · الفئات أ–ح)'
                      : 'DOCUMENT_REGISTRY Coverage Matrix (44 Registered Iraqi & KRG Types · Categories A–H)'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {lang === 'ar'
                      ? 'فصل شفاف لحالة الدعم'
                      : 'HONEST SUPPORT STATUS SEPARATION'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-[#222225] text-xs">
                  {iraqiDocumentRegistrySummary.map((cat) => (
                    <div key={cat.code} className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {lang === 'ar' ? cat.titleAr : cat.titleEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {cat.testedTypes}/{cat.totalTypes}{' '}
                          {lang === 'ar' ? 'مختبرة' : 'TESTED'}
                        </span>
                        <span>·</span>
                        <span className="text-zinc-500">
                          {formatSupportStatus(cat.defaultStatus, lang)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {lang === 'ar' ? cat.examplesAr : cat.examplesEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* =================================================================
              VIEW 3: AUTOMATED WORKFLOW RULES
              ================================================================= */}
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

          {/* =================================================================
              VIEW 4: SYSTEM AUDIT TRAIL
              ================================================================= */}
          {activeSection === 'audit' && (
            <section className="space-y-4" aria-label={t(lang, 'navAudit')}>
              <div className="pb-4 border-b border-zinc-200 dark:border-[#222225]">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {t(lang, 'auditSectionTitle')}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t(lang, 'auditSectionSubtitle')}
                </p>
              </div>

              <div className="border border-zinc-200 dark:border-[#222225] rounded-xl bg-white dark:bg-[#111113] divide-y divide-zinc-200 dark:divide-[#1f1f23]">
                {allAuditEvents.map(({ evt, applicant }) => (
                  <div
                    key={evt.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 flex-wrap">
                        <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          {formatReferenceCode(applicant.referenceCode, lang)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{lang === 'ar' ? evt.actorAr : evt.actorEn}</span>
                      </div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {lang === 'ar' ? evt.actionAr : evt.actionEn}
                      </div>
                      {(evt.noteEn || evt.noteAr) && (
                        <div className="text-zinc-600 dark:text-zinc-400">
                          {lang === 'ar' ? evt.noteAr : evt.noteEn}
                        </div>
                      )}
                      {evt.cbiLaw78HmacReceipt && (
                        <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          {lang === 'ar'
                            ? `توقيع قانون البنك المركزي رقم 78: ${formatCryptoDigest(evt.cbiLaw78HmacReceipt, 'ar')}`
                            : `CBI Law No. 78 HMAC Signature: ${formatCryptoDigest(evt.cbiLaw78HmacReceipt, 'en')}`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono tabular-nums text-zinc-500">
                        {formatTimestamp(evt.timestamp, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedApplicantId(applicant.id)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
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
        <footer className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-5 mt-8 border-t border-zinc-200 dark:border-[#1f1f23] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            {isAr
              ? 'منصة روسترو للامتثال · قانون التوقيع الإلكتروني للبنك المركزي العراقي رقم 78 لسنة 2012 ونظام التحقق من الوثائق العراقية'
              : 'Project Rostro · Central Bank of Iraq (CBI) Law No. 78 of 2012 & Universal Iraqi/KRG KYC Platform'}
          </div>
          <div className="flex items-center gap-4">
            <span>
              {isAr
                ? 'دعم كامل للغات العربية والكردية والإنجليزية'
                : 'Multi-Script AR / KU / EN Ready'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {isAr
                ? 'فحص معادلة التحقق الرقمي [7,3,1] مفعل'
                : 'ICAO 9303 Modulo-10 [7,3,1] Verified'}
            </span>
          </div>
        </footer>
      </div>

      {/* Slide-over Dossier Inspector */}
      <ApplicantInspectorDrawer
        applicant={selectedApplicant}
        lang={lang}
        onClose={() => setSelectedApplicantId(null)}
        onUpdateStatus={handleUpdateApplicantStatus}
        onRunSingleAutoEval={handleRunSingleAutoEval}
        onRegisterCandidateDoc={handleRegisterCandidateDoc}
        onAttachOrUpdatePacketResidenceCard={handleAttachOrUpdatePacketResidenceCard}
        onApplyAntiSpoofPreset={handleApplyAntiSpoofPreset}
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

      {/* Partner App Headless Camera SDK Simulator Modal */}
      {isPartnerSdkOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={
            isAr
              ? 'محاكي دمج الكاميرا الخفي داخل تطبيقات الهواتف'
              : 'Partner App Headless Camera SDK Simulator'
          }
        >
          <div className="w-full max-w-6xl rounded-2xl bg-[#f8f8f9] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#0d0d10]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {isAr
                    ? 'دمج نظام Rostro الخفي داخل كاميرا تطبيقات الهواتف (ZainCash / SuperQi / Baly)'
                    : 'Headless In-App Camera Integration (ZainCash / SuperQi / Baly Native UI)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerSdkOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <PartnerAppSdkSimulator lang={lang} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

