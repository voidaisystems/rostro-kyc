import type { Language } from './kycEngine';

export const translations = {
  en: {
    brandName: 'Rostro KYC',
    navQueue: 'Verification Queue',
    navForensics: 'Forensics Lab',
    navChallenge: 'How It Works (Competition)',
    navVault: 'Document Vault',
    navAutomation: 'Approval Policies',
    navAudit: 'Audit Log',
    ctaUpload: 'Verify New Document',
    workspacePath: 'Iraqi Identity & Document Verification Platform · Central Bank of Iraq (CBI) Compliant',
    demoBannerText: 'Supports Unified National ID, Residence Card & Iraqi Passport (Arabic / Kurdish / English)',
    kpiTotal: 'Total Applications',
    kpiApproved: 'Approved Automatically',
    kpiActionRequired: 'Needs Officer Review',
    kpiRejected: 'Rejected / Blocked',
    kpiApprovalRate: 'Instant Approval Rate',
    kpiAvgOcr: 'Average OCR Accuracy',
    runBatchBtn: 'Run Auto-Verification',
    resetDemoBtn: 'Reset Demo',
    searchPlaceholder: 'Search by name, 12-digit National ID, governorate, or reference...',
    filterAll: 'All Statuses',
    filterApproved: 'Approved',
    filterPending: 'Pending Review',
    filterFlagged: 'Human Review',
    filterRejected: 'Rejected',
    riskAll: 'All Risk Tiers',
    riskLow: 'Low Risk (0–28)',
    riskMedium: 'Medium Risk (29–64)',
    riskHigh: 'High Risk (65+)',
    docTypeAll: 'All 44 Iraqi Document Types (Cat A–H)',
    docNationalId: 'Cat A · Unified Iraqi National Card',
    docCivilId: 'Cat A · Legacy Civil Status ID',
    docResidenceCard: 'Cat B · Residence Info Card',
    docRationCard: 'Cat B · Iraqi Ration Card',
    docPassport: 'Cat C · Iraqi e-Passport',
    docForeignNationalId: 'Cat C · Foreign / GCC National ID (UAE / MENA)',
    docForeignPassport: 'Cat C · Foreign Machine-Readable Passport',
    docDrivingLicense: 'Cat D · Iraqi / KRG Driving License',
    docChamberCommerce: 'Cat E · Chamber of Commerce ID',
    docPowerOfAttorney: 'Cat H · Notarized Power of Attorney',
    docUnknown: 'Fallback · Unclassified Document',
    colApplicant: 'Applicant & Reference',
    colJurisdiction: 'Governorate & Entity',
    colDocuments: 'Submitted Documents',
    colRiskScore: 'AML Risk & Screening',
    colOcrScore: 'OCR & Biometrics',
    colSubmitted: 'Submitted (UTC)',
    colStatus: 'Decision Status',
    colActions: 'Review',
    entityIndividual: 'Individual',
    entityCorporate: 'Merchant / Corporate',
    statusApproved: 'Approved',
    statusPending: 'Pending Review',
    statusFlagged: 'Human Review',
    statusRejected: 'Rejected',
    sanctionsClean: 'No CBI / OFAC / PEP Hits',
    sanctionsHit: 'CBI / OFAC / PEP Match',
    adverseMediaHit: 'Adverse Media Alert',
    inspectBtn: 'Inspect Dossier',
    inspectorTitle: 'Applicant Compliance Dossier',
    inspectorSubtitle: '10-Stage Universal Iraqi KYC Pipeline, 9 Separated Signals & CBI Law No. 78 Audit',
    approveDossierBtn: 'Approve Verification',
    flagDossierBtn: 'Escalate / Human Review',
    rejectDossierBtn: 'Reject Applicant',
    evalSingleRuleBtn: 'Run 10-Stage Pipeline',
    registerCandidateBtn: 'Register Candidate Document Type into Catalog',
    candidateRegisteredMsg: 'Candidate document type registered in Document Registry (Status: Supported Partial).',
    decisionNotePlaceholder: 'Add mandatory compliance officer adjudication note (CBI Law No. 78)...',
    tabDocuments: 'Document Specimen & OCR',
    tabScreening: '9 Verification Signals & AML',
    tabAudit: 'CBI Law 78 Audit Log',
    docSpecimenHeader: 'High-Resolution Document Specimen',
    extractedOcrHeader: 'Zero-Hallucination OCR & Multi-Script Normalization',
    fieldFullName: 'Extracted Legal Name',
    fieldNormalizedName: 'Canonical Normalized Name',
    fieldDocNumber: 'Document / 12-Digit ID No.',
    fieldDob: 'Date of Birth (ASCII Normalized)',
    fieldNationality: 'Jurisdiction / Governorate',
    fieldIssueDate: 'Issue Date',
    fieldExpiryDate: 'Expiration Date',
    fieldAddress: 'Registered Mahalla / Zukak / Dar',
    fieldSha256: 'SHA-256 Integrity Digest',
    fieldMrz: 'ICAO 9303 Modulo-10 [7,3,1] MRZ',
    biometricMatchLabel: '3D Liveness & Facial Match',
    ocrConfidenceLabel: 'Optical Character Confidence',
    uploadModalTitle: 'Universal Iraqi & MENA KYC Packet Ingestion',
    uploadModalSubtitle: 'Gemini 2.5 Flash VLM Extraction + MultiScriptNormalizer + ICAO 9303 Modulo-10 Check',
    applicantNameLabel: 'Applicant Full Name (English)',
    applicantNameArLabel: 'Applicant Full Name (Native Script)',
    applicantEmailLabel: 'Official Email Address',
    applicantCountryLabel: 'Governorate (Federal Iraq & KRG)',
    entityTypeLabel: 'Onboarding Track',
    docCategoryLabel: 'Iraqi Document Classification (Cat A–H)',
    docNumberInputLabel: '12-Digit National ID / Serial Number',
    dropzoneTitle: 'Select or Drop Iraqi Identity / Commercial Specimen (JPG, PNG, PDF)',
    dropzoneHint: 'Strict Anti-Hallucination Invariant: occluded fields emit [UNCLEAR]',
    chooseDemoFileBtn: 'Load Sample Iraqi National ID Specimen',
    submitUploadBtn: 'Ingest & Run 10-Stage Pipeline',
    cancelBtn: 'Cancel',
    uploadingStage1: 'Stage 1–3: SHA-256 Digest & SmartEngines Glare/Blur Gate...',
    uploadingStage2: 'Stage 4–6: Gemini 2.5 Flash OCR & MultiScriptNormalizer (Eastern to ASCII Digits)...',
    uploadingStage3: 'Stage 7–10: ICAO 9303 Modulo-10 [7,3,1] & Cross-Document Entity Match...',
    workflowSectionTitle: 'Universal 10-Stage Pipeline & STP Rule Engine',
    workflowSectionSubtitle: 'Configure Stage 9 routing thresholds (Auto-Approved, Human Review, Auto-Rejected, Insufficient Data)',
    ruleMaxRiskLabel: 'Maximum Risk Score for Stage 9 Auto-Approval',
    ruleMinOcrLabel: 'Minimum OCR Extraction Confidence (%)',
    ruleMinBioLabel: 'Minimum Biometric Liveness Match (%)',
    ruleSanctionsToggle: 'Auto-Reject on CBI / OFAC / UN Sanctions or Tampered MRZ Checksum',
    ruleExpiryToggle: 'Route Expired Identity Documents to Human Review',
    ruleHighRiskUtilityToggle: 'Require Iraqi Residence Card when Risk Score > 60',
    batchResultToastTitle: 'Automated Batch Adjudication Complete',
    emptyQueueTitle: 'No Verification Dossiers Match Active Filters',
    emptyQueueSubtitle: 'Clear your search query or reset status filters to inspect all applicant records.',
    clearFiltersBtn: 'Reset Active Filters',
    vaultSectionTitle: 'Universal Iraqi Document Vault & Registry (44 Types · Cat A–H)',
    vaultSectionSubtitle: 'Inspect ingested Iraqi & KRG specimens and review the 44-type coverage matrix',
    auditSectionTitle: 'CBI Law No. 78 of 2012 Non-Repudiation Audit Ledger',
    auditSectionSubtitle: 'Chronological, HMAC-SHA256 signed ledger of 10-stage pipeline outcomes and manual officer decisions',
    validationErrorRequired: 'Please complete Applicant Name, Document Number, and attach or select a specimen file.',
    themeLight: 'Light',
    themeDark: 'Dark',
    langToggleLabel: 'Language: EN',
    dirLabel: 'LTR',
    closeInspectorLabel: 'Close Dossier Inspector',
    zoomInLabel: 'Toggle Magnified View',
    rotateDocLabel: 'Rotate Specimen 90°',
    ocrOverlayLabel: 'OCR Bounding Boxes',
    prevApplicantLabel: 'Previous Dossier',
    nextApplicantLabel: 'Next Dossier',
    exportCsvBtn: 'Export Compliance CSV',
    copyDigestBtn: 'Copy Digest',
    copiedLabel: 'Copied',
    keyboardHintsLabel: 'Shortcuts: ↑/↓ Navigate · A Approve · F Human Review · R Reject · Esc Close',
    vaultSearchPlaceholder: 'Filter vault by Iraqi document type, 12-digit ID, or holder...',
    sanctionsCleanShort: 'Clear · 0 Hits',
    sanctionsHitShort: 'CBI / OFAC Match',
    statusPendingShort: 'Pending',
    statusFlaggedShort: 'Human Review',
    moreDocsSuffix: 'more',
    nineSignalsTitle: 'The 9 Separated Verification Signals (0.00 – 1.00)',
    externalVerifBanner: 'Offline Optical & Mathematical Verification Only (No Live Gov DB Claimed)',
  },
  ar: {
    brandName: 'روسترو للتحقق الرقمي',
    navQueue: 'طلبات التحقق',
    navForensics: 'مختبر الفحص المتقدم',
    navChallenge: 'كيف يعمل النظام (عرض المسابقة)',
    navVault: 'خزينة الوثائق',
    navAutomation: 'سياسات القبول',
    navAudit: 'سجل التدقيق',
    ctaUpload: 'فحص وثيقة جديدة',
    workspacePath: 'منصة التحقق الذكي من الهويات والوثائق العراقية · متوافقة مع متطلبات البنك المركزي العراقي',
    demoBannerText: 'البطاقة الوطنية الموحدة · بطاقة السكن · الجواز العراقي (دعم عربي / كردي / إنجليزي)',
    kpiTotal: 'إجمالي الطلبات',
    kpiApproved: 'مقبول تلقائياً',
    kpiActionRequired: 'بانتظار المراجعة',
    kpiRejected: 'مرفوض',
    kpiApprovalRate: 'نسبة القبول الفوري',
    kpiAvgOcr: 'متوسط دقة القراءة',
    runBatchBtn: 'تشغيل الفحص التلقائي',
    resetDemoBtn: 'إعادة ضبط العرض',
    searchPlaceholder: 'ابحث بالاسم، رقم البطاقة الموحدة (12 رقماً)، أو المحافظة...',
    filterAll: 'جميع الحالات',
    filterApproved: 'معتمد',
    filterPending: 'قيد الانتظار',
    filterFlagged: 'مراجعة بشرية',
    filterRejected: 'مرفوض',
    riskAll: 'جميع مستويات المخاطر',
    riskLow: 'مخاطر منخفضة (0–28)',
    riskMedium: 'مخاطر متوسطة (29–64)',
    riskHigh: 'مخاطر عالية (65+)',
    docTypeAll: 'جميع أنواع الوثائق العراقية والأجنبية (الفئات أ–ح)',
    docNationalId: 'الفئة أ · البطاقة الوطنية الموحدة',
    docCivilId: 'الفئة أ · هوية الأحوال المدنية',
    docResidenceCard: 'الفئة ب · بطاقة السكن العراقية',
    docRationCard: 'الفئة ب · البطاقة التموينية',
    docPassport: 'الفئة ج · جواز السفر العراقي الإلكتروني',
    docForeignNationalId: 'الفئة ج · بطاقة هوية أجنبية / خليجية (مثل الإمارات)',
    docForeignPassport: 'الفئة ج · جواز سفر أجنبي مقروء آلياً',
    docDrivingLicense: 'الفئة د · إجازة السوق العراقية والإقليم',
    docChamberCommerce: 'الفئة هـ · هوية غرفة تجارة بغداد وأربيل',
    docPowerOfAttorney: 'الفئة ح · وكالة عامة أو خاصة مصدقة',
    docUnknown: 'احتياطي · وثيقة غير مصنفة',
    colApplicant: 'مقدم الطلب والمرجع',
    colJurisdiction: 'المحافظة ونوع الكيان',
    colDocuments: 'الوثائق المرفقة',
    colRiskScore: 'مخاطر غسل الأموال والفحص',
    colOcrScore: 'القراءة الضوئية والحيوية',
    colSubmitted: 'تاريخ التقديم',
    colStatus: 'حالة القرار',
    colActions: 'التفاصيل',
    entityIndividual: 'فردي',
    entityCorporate: 'تاجر / شركة',
    statusApproved: 'معتمد',
    statusPending: 'قيد المراجعة',
    statusFlagged: 'مراجعة بشرية',
    statusRejected: 'مرفوض',
    sanctionsClean: 'سليم من قوائم البنك المركزي والعقوبات',
    sanctionsHit: 'تطابق في قوائم العقوبات والرقابة',
    adverseMediaHit: 'تنبيه إعلامي سلبي',
    inspectBtn: 'فحص الملف',
    inspectorTitle: 'ملف امتثال مقدم الطلب — روسترو',
    inspectorSubtitle: 'محرك التحقق الشامل من 10 مراحل، 9 مؤشرات تحقق مفصولة، وتدقيق قانون البنك المركزي رقم 78',
    approveDossierBtn: 'اعتماد التحقق',
    flagDossierBtn: 'تحويل للمراجعة البشرية',
    rejectDossierBtn: 'رفض الطلب',
    evalSingleRuleBtn: 'تشغيل المحرك (10 مراحل)',
    registerCandidateBtn: 'تسجيل نوع الوثيقة الجديدة في سجل النظام',
    candidateRegisteredMsg: 'تم تسجيل الوثيقة المرشحة في سجل الوثائق (الحالة: مدعومة جزئياً).',
    decisionNotePlaceholder: 'أضف ملاحظة قرار مسؤول الامتثال الإلزامية (قانون رقم 78 لسنة 2012)...',
    tabDocuments: 'معاينة الوثيقة والقراءة الضوئية',
    tabScreening: 'مؤشرات التحقق التسعة والفحص',
    tabAudit: 'سجل التدقيق (قانون 78)',
    docSpecimenHeader: 'معاينة الوثيقة العراقية عالية الدقة',
    extractedOcrHeader: 'الاستخراج الضوئي الخالي من الهلوسة وتوحيد النصوص',
    fieldFullName: 'الاسم القانوني المستخرج',
    fieldNormalizedName: 'الاسم القياسي الموحد',
    fieldDocNumber: 'رقم الوثيقة / البطاقة الموحدة (12 رقماً)',
    fieldDob: 'تاريخ الميلاد (أرقام قياسية)',
    fieldNationality: 'الاختصاص / المحافظة',
    fieldIssueDate: 'تاريخ الإصدار',
    fieldExpiryDate: 'تاريخ النفاذ',
    fieldAddress: 'العنوان (محلة / زقاق / دار)',
    fieldSha256: 'بصمة التكامل التشفيرية',
    fieldMrz: 'شريط القراءة الآلي ومعادلة التحقق العشري',
    biometricMatchLabel: 'التطابق الحيوي للوجه ثلاثي الأبعاد',
    ocrConfidenceLabel: 'دقة التعرف الضوئي على الحروف',
    uploadModalTitle: 'إدراج حزمة وثائق عراقية — روسترو',
    uploadModalSubtitle: 'استخراج بالذكاء الاصطناعي مع توحيد الأرقام العربية والكردية وفحص شريط القراءة الآلي',
    applicantNameLabel: 'الاسم الكامل لمقدم الطلب',
    applicantNameArLabel: 'الاسم الكامل (بالعربية أو الكردية السورانية)',
    applicantEmailLabel: 'البريد الإلكتروني الرسمي',
    applicantCountryLabel: 'المحافظة (العراق الاتحادي وإقليم كردستان)',
    entityTypeLabel: 'مسار التسجيل',
    docCategoryLabel: 'تصنيف الوثيقة العراقية (الفئات أ–ح)',
    docNumberInputLabel: 'رقم البطاقة الموحدة (12 رقماً) / التسلسل',
    dropzoneTitle: 'اختر أو اسحب نموذج الوثيقة العراقية',
    dropzoneHint: 'قاعدة عدم الهلوسة: الحقول غير الواضحة تُرجع [غير واضح] بدلاً من التخمين',
    chooseDemoFileBtn: 'تحميل نموذج البطاقة الوطنية العراقية',
    submitUploadBtn: 'تشفير وتشغيل محرك المراحل العشر',
    cancelBtn: 'إلغاء',
    uploadingStage1: 'المرحلة 1–3: حساب البصمة التشفيرية وفحص اللمعان والضبابية...',
    uploadingStage2: 'المرحلة 4–6: استخراج الحقول وتوحيد الأرقام العربية والكردية...',
    uploadingStage3: 'المرحلة 7–10: فحص معادلة شريط القراءة الآلي ومطابقة الكيان عبر الوثائق...',
    workflowSectionTitle: 'محرك المراحل العشر وقواعد المعالجة المباشرة',
    workflowSectionSubtitle: 'ضبط حدود قرارات المرحلة التاسعة (اعتماد تلقائي، مراجعة بشرية، رفض تلقائي، بيانات غير كافية)',
    ruleMaxRiskLabel: 'الحد الأقصى لدرجة المخاطر للاعتماد التلقائي',
    ruleMinOcrLabel: 'الحد الأدنى لدقة القراءة الضوئية (%)',
    ruleMinBioLabel: 'الحد الأدنى للتطابق الحيوي للوجه (%)',
    ruleSanctionsToggle: 'رفض تلقائي عند التطابق مع قوائم العقوبات أو تلاعب شريط القراءة الآلي',
    ruleExpiryToggle: 'تحويل الوثائق منتهية الصلاحية إلى المراجعة البشرية',
    ruleHighRiskUtilityToggle: 'طلب بطاقة السكن العراقية عندما تتجاوز المخاطر 60',
    batchResultToastTitle: 'اكتمل تشغيل الاعتماد التلقائي للدفعة',
    emptyQueueTitle: 'لا توجد ملفات تحقق تطابق عوامل التصفية الحالية',
    emptyQueueSubtitle: 'قم بمسح نص البحث أو إعادة ضبط فلاتر الحالة لعرض كافة السجلات.',
    clearFiltersBtn: 'إعادة ضبط الفلاتر',
    vaultSectionTitle: 'خزينة وسجل الوثائق العراقية الشامل (44 وثيقة · الفئات أ–ح)',
    vaultSectionSubtitle: 'فحص مباشر لنماذج الهوية العراقية وإقليم كردستان ومصفوفة التغطية (مختبر، مدعوم جزئياً، يتطلب مراجعة بشرية)',
    auditSectionTitle: 'سجل التدقيق القانوني (قانون التوقيع الإلكتروني العراقي رقم 78 لسنة 2012)',
    auditSectionSubtitle: 'سجل زمني موقع تشفيرياً لقرارات المحرك التلقائي وتوقيعات مسؤولي الامتثال',
    validationErrorRequired: 'يرجى إدخال اسم مقدم الطلب ورقم الوثيقة وإرفاق ملف أو اختيار نموذج البطاقة الوطنية.',
    themeLight: 'نهاري',
    themeDark: 'ليلي',
    langToggleLabel: 'اللغة: العربية',
    dirLabel: 'من اليمين لليسار',
    closeInspectorLabel: 'إغلاق نافذة الفحص',
    zoomInLabel: 'تكبير / تصغير المعاينة',
    rotateDocLabel: 'تدوير الوثيقة 90 درجة',
    ocrOverlayLabel: 'صناديق القراءة الضوئية',
    prevApplicantLabel: 'الملف السابق',
    nextApplicantLabel: 'الملف التالي',
    exportCsvBtn: 'تصدير سجل الامتثال',
    copyDigestBtn: 'نسخ البصمة',
    copiedLabel: 'تم النسخ',
    keyboardHintsLabel: 'الاختصارات: الأسهم للتنقل · اعتماد · مراجعة بشرية · رفض · إغلاق',
    vaultSearchPlaceholder: 'ابحث في الخزينة بنوع الوثيقة العراقية، الرقم الموحد، أو الاسم...',
    sanctionsCleanShort: 'سليم · 0 تطابق',
    sanctionsHitShort: 'تطابق عقوبات أو تلاعب',
    statusPendingShort: 'قيد المراجعة',
    statusFlaggedShort: 'مراجعة بشرية',
    moreDocsSuffix: 'إضافية',
    nineSignalsTitle: 'مؤشرات التحقق التسعة المفصولة (0.00 – 1.00)',
    externalVerifBanner: 'التحقق الخارجي غير متصل · تحقق بصري ورياضي محلي فقط (دون ادعاء الربط الحي بقاعدة بيانات حكومية)',
  },
} as const;

export type TranslationKeys = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKeys): string {
  return translations[lang][key] || translations.en[key];
}

export function formatStage9Outcome(outcome: string, lang: Language): string {
  if (lang === 'ar') {
    switch (outcome) {
      case 'AUTO_APPROVED':
        return 'اعتماد تلقائي';
      case 'HUMAN_REVIEW':
        return 'مراجعة بشرية';
      case 'AUTO_REJECTED':
        return 'رفض تلقائي';
      case 'INSUFFICIENT_DATA':
        return 'بيانات غير كافية';
      default:
        return 'قيد المعالجة';
    }
  }
  return outcome;
}

export function formatSupportStatus(status: string, lang: Language): string {
  if (lang === 'ar') {
    switch (status) {
      case 'TESTED':
        return 'مختبر ومعتمد';
      case 'SUPPORTED_PARTIAL':
        return 'مدعوم جزئياً';
      case 'REQUIRES_HUMAN_REVIEW':
        return 'يتطلب مراجعة بشرية';
      case 'REQUIRES_EXTERNAL_VERIFICATION':
        return 'يتطلب تحققاً خارجياً';
      case 'REGISTERED_UNIMPLEMENTED':
        return 'مسجل قيد التفعيل';
      case 'UNKNOWN_DOCUMENT':
        return 'وثيقة غير مصنفة';
      default:
        return 'معتمد';
    }
  }
  return status;
}

export function formatDocTypeCode(docType: string, lang: Language): string {
  if (lang === 'ar') {
    switch (docType) {
      case 'IRQ_NATIONAL_ID':
        return 'البطاقة الوطنية الموحدة';
      case 'IRQ_CIVIL_STATUS_ID':
        return 'هوية الأحوال المدنية';
      case 'IRQ_NATIONALITY_CERT':
        return 'شهادة الجنسية العراقية';
      case 'IRQ_RESIDENCE_CARD':
        return 'بطاقة السكن العراقية';
      case 'IRQ_RATION_CARD':
        return 'البطاقة التموينية';
      case 'IRQ_PASSPORT':
        return 'جواز السفر العراقي';
      case 'FOREIGN_PASSPORT':
        return 'جواز سفر أجنبي';
      case 'IRQ_DRIVING_LICENSE':
        return 'إجازة السوق';
      case 'IRQ_CHAMBER_OF_COMMERCE':
        return 'هوية غرفة التجارة';
      case 'IRQ_COMPANY_REG':
        return 'شهادة تأسيس شركة';
      case 'IRQ_TAX_ID_CARD':
        return 'البطاقة الضريبية';
      case 'IRQ_POWER_OF_ATTORNEY':
        return 'وكالة عدلية مصدقة';
      case 'UNKNOWN_DOCUMENT':
        return 'وثيقة غير مصنفة';
      default:
        return 'وثيقة رسمية';
    }
  }
  return docType;
}

export const formatDocumentTypeCode = formatDocTypeCode;

export function formatRiskTier(tier: string, lang: Language): string {
  if (lang === 'ar') {
    switch (tier.toLowerCase()) {
      case 'low':
        return 'منخفضة';
      case 'medium':
        return 'متوسطة';
      case 'high':
        return 'مرتفعة';
      default:
        return 'قياسية';
    }
  }
  return tier.toUpperCase();
}

export function formatSideLabel(side: string, lang: Language): string {
  if (lang === 'ar') {
    switch (side) {
      case 'FRONT':
        return 'الوجه الأمامي';
      case 'BACK':
        return 'الوجه الخلفي';
      case 'BOTH':
        return 'الوجهان الأمامي والخلفي';
      default:
        return 'غير محدد';
    }
  }
  return side;
}

export function formatReferenceCode(ref: string, lang: Language): string {
  if (!ref) return ref;
  if (lang === 'ar') {
    if (ref.trim().toUpperCase() === 'N/A') return 'غير محدد';
    if (ref.includes('MISSING') || ref.includes('غير موجود')) return '[غير موجود]';
    if (ref.includes('UNCLEAR') || ref.includes('غير واضح')) return '[غير واضح]';
    return ref
      .replace(/^ROSTRO-/i, 'ملف-')
      .replace(/^ZC-EDGE-/i, 'زين-')
      .replace(/^RES-BGD-/i, 'سكن-بغداد-')
      .replace(/^RES-/i, 'سكن-')
      .replace(/^ECC-/i, 'غرفة-أربيل-')
      .replace(/^BCC-/i, 'غرفة-بغداد-')
      .replace(/^POA-NJF-/i, 'وكالة-النجف-')
      .replace(/^UNK-/i, 'غير-مصنف-')
      .replace(/-BGD-/gi, '-بغداد-')
      .replace(/-MSL$/i, '-الموصل')
      .replace(/^A(?=\d)/i, 'ج-')
      .replace(/^E(?=\d)/i, 'خ-')
      .replace(/[A-Za-z]+/g, '');
  }
  return ref
    .replace(/\[غير موجود\s*\/\s*MISSING\]/gi, '[MISSING]')
    .replace(/\[غير واضح\s*\/\s*UNCLEAR\]/gi, '[UNCLEAR]')
    .replace(/\[غير موجود\]/g, '[MISSING]')
    .replace(/\[غير واضح\]/g, '[UNCLEAR]');
}

export function formatCryptoDigest(digest: string, lang: Language): string {
  if (!digest) return digest;
  if (lang === 'ar') {
    return digest
      .replace(/^HMAC-SHA256-CBI78-/i, 'توقيع-78-')
      .replace(/[a-fA-F]/g, (ch) => {
        const map: Record<string, string> = {
          a: '1',
          b: '2',
          c: '3',
          d: '4',
          e: '5',
          f: '6',
        };
        return map[ch.toLowerCase()] || '0';
      });
  }
  return digest;
}

export function formatMrzForDisplay(mrz: string, lang: Language): string {
  if (!mrz) return mrz;
  if (lang === 'ar') {
    if (mrz.includes('NO MRZ') || mrz.includes('غير موجود')) {
      return '[غير موجود على الوثيقة]';
    }
    return mrz
      .replace(/^IDIRQ/i, 'هوية-عراق-')
      .replace(/^P<IRQ/i, 'جواز-عراق-')
      .replace(/^P<CYP/i, 'جواز-قبرص-')
      .replace(/IRQ/gi, '-عراق-')
      .replace(/CYP/gi, '-قبرص-')
      .replace(/[A-Za-z]+/g, '');
  }
  if (mrz.includes('NO MRZ') || mrz.includes('غير موجود')) {
    return '[NO MRZ ON CARD]';
  }
  return mrz;
}

export function formatTimestamp(ts: string, lang: Language): string {
  if (lang === 'ar') {
    return ts.replace(/\s*UTC$/i, '');
  }
  return ts;
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

const ENGLISH_TO_ARABIC_TERM_MAP: Array<[RegExp, string]> = [
  [/\bEXTERNAL_VERIFICATION_UNAVAILABLE\b/gi, 'التحقق الخارجي غير متصل'],
  [/\bAUTO_APPROVED\b/gi, 'اعتماد تلقائي'],
  [/\bHUMAN_REVIEW\b/gi, 'مراجعة بشرية'],
  [/\bAUTO_REJECTED\b/gi, 'رفض تلقائي'],
  [/\bINSUFFICIENT_DATA\b/gi, 'بيانات غير كافية'],
  [/\bAUTHENTIC_VERIFIED\b/gi, 'وثيقة أصلية مؤكدة'],
  [/\bBLOCKED_ON_DEVICE_EDGE\b/gi, 'محظور على الهاتف'],
  [/\bFORGERY_OR_SPOOF_REJECTED\b/gi, 'مرفوض للتزوير'],
  [/\bINCOMPLETE_SIDES\b/gi, 'نقص في أوجه الوثيقة'],
  [/\bSUPPORTED_PARTIAL\b/gi, 'مدعوم جزئياً'],
  [/\bREQUIRES_HUMAN_REVIEW\b/gi, 'يتطلب مراجعة بشرية'],
  [/\bREQUIRES_EXTERNAL_VERIFICATION\b/gi, 'يتطلب تحققاً خارجياً'],
  [/\bUNKNOWN_DOCUMENT\b/gi, 'وثيقة غير مصنفة'],
  [/\bTESTED\b/gi, 'مختبر'],
  [/\bIRQ_NATIONAL_ID\b/gi, 'البطاقة الوطنية'],
  [/\bIRQ_RESIDENCE_CARD\b/gi, 'بطاقة السكن'],
  [/\bIRQ_PASSPORT\b/gi, 'جواز السفر العراقي'],
  [/\bFOREIGN_PASSPORT\b/gi, 'جواز سفر أجنبي'],
  [/\bIRQ_CIVIL_STATUS_ID\b/gi, 'هوية الأحوال المدنية'],
  [/\bIRQ_DRIVING_LICENSE\b/gi, 'إجازة السوق'],
  [/\bIRQ_CHAMBER_OF_COMMERCE\b/gi, 'هوية غرفة التجارة'],
  [/\bIRQ_POWER_OF_ATTORNEY\b/gi, 'وكالة مصدقة'],
  [/\bIRQ_RATION_CARD\b/gi, 'البطاقة التموينية'],
  [/\bFRONT\s*\+\s*BACK\b/gi, 'الأمام والظهر'],
  [/\bFRONT\b/gi, 'الأمام'],
  [/\bBACK\b/gi, 'الظهر'],
  [/\bBOTH\b/gi, 'الوجهان'],
  [/\bCRITICAL\b/gi, 'حرج'],
  [/\bWARNING\b/gi, 'تنبيه'],
  [/\bMISSING\b/gi, 'مفقود'],
  [/\bUNCLEAR\b/gi, 'غير واضح'],
  [/\bPASS\b/gi, 'ناجح'],
  [/\bVERIFIED\b/gi, 'مؤكد'],
  [/\bBLOCKED\b/gi, 'محظور'],
  [/\bREJECTED\b/gi, 'مرفوض'],
  [/\bOCR\b/gi, 'القراءة الضوئية'],
  [/\bMRZ\b/gi, 'الشريط الآلي'],
  [/\bKYC\b/gi, 'التحقق من الهوية'],
  [/\bAML\b/gi, 'مكافحة غسل الأموال'],
  [/\bCBI\b/gi, 'البنك المركزي'],
  [/\bOFAC\b/gi, 'قوائم العقوبات'],
  [/\bPEP\b/gi, 'الأشخاص المعرضين سياسياً'],
  [/\bELA\b/gi, 'تحليل تلاعب البكسلات'],
  [/\bSSIM\b/gi, 'التشابه الهيكلي'],
  [/\bCLAHE\b/gi, 'تحسين التباين'],
  [/\bWASM\b/gi, 'المعالج المحلي'],
  [/\bFPS\b/gi, 'إطار/ثانية'],
  [/\bDPI\b/gi, 'نقطة/بوصة'],
  [/\bUTC\b/gi, ''],
  [/\bms\b/g, 'مللي ثانية'],
  [/\bKB\b/gi, 'كيلوبايت'],
  [/\bMB\b/gi, 'ميغابايت'],
  [/\bMahalla\b/gi, 'محلة'],
  [/\bZukak\b/gi, 'زقاق'],
  [/\bZuqaq\b/gi, 'زقاق'],
  [/\bDar\b/gi, 'دار'],
  [/\bAl-Mansour\b/gi, 'المنصور'],
  [/\bBaghdad\b/gi, 'بغداد'],
  [/\bGulan Street\b/gi, 'شارع كولان'],
  [/\bWorld Trade Center\b/gi, 'مركز التجارة العالمي'],
  [/\bFloor\b/gi, 'الطابق'],
  [/\bErbil\b/gi, 'أربيل'],
  [/\bHawler\b/gi, 'أربيل'],
  [/\bKarrada Inner\b/gi, 'الكرادة الشرقية'],
  [/\bKarrada Commercial District\b/gi, 'منطقة الكرادة التجارية'],
  [/\bBuilding\b/gi, 'بناية'],
  [/\bAl-Amir Quarter\b/gi, 'حي الأمير'],
  [/\bNotary Registry Vol\.?\b/gi, 'سجل الكاتب العدل مجلد'],
  [/\bNajaf\b/gi, 'النجف'],
  [/\bPlot\b/gi, 'مقاطعة'],
  [/\bAl-Kufa Agricultural Basin\b/gi, 'حوض الكوفة الزراعي'],
  [/\bAl-Zuhoor District\b/gi, 'حي الزهور'],
  [/\bNineveh Governorate\b/gi, 'محافظة نينوى'],
  [/\bNineveh\b/gi, 'نينوى'],
  [/\bMosul\b/gi, 'الموصل'],
  [/\bSulaymaniyah\b/gi, 'السليمانية'],
  [/\bSalim Street\b/gi, 'شارع سالم'],
  [/\bBasra\b/gi, 'البصرة'],
  [/\bKRG\b/gi, 'إقليم كردستان'],
  [/\bStamp\b/gi, 'الختم'],
  [/\bN\/A\b/gi, 'غير محدد'],
  [/\bMale\b/gi, 'ذكر'],
  [/\bFemale\b/gi, 'أنثى'],
];

/**
 * Ensures strict single-language text output:
 * - When lang === 'en': removes all Arabic/Kurdish script characters.
 * - When lang === 'ar': replaces technical terms with Arabic equivalents and removes all Latin words.
 */
export function sanitizeTextForLanguage(input: string, lang: Language): string {
  if (!input) return input;
  // Do not alter the language switcher button labels themselves
  if (input.trim() === 'العربية' || input.trim() === 'English') {
    return input;
  }

  let out = input;

  if (lang === 'en') {
    if (!ARABIC_CHAR_REGEX.test(out)) return out;
    out = out
      .replace(/\[غير واضح\s*\/\s*UNCLEAR\]/gi, '[UNCLEAR]')
      .replace(/\[غير موجود\s*\/\s*MISSING\]/gi, '[MISSING]')
      .replace(/\[غير واضح\]/g, '[UNCLEAR]')
      .replace(/\[غير موجود\]/g, '[MISSING]')
      .replace(ARABIC_CHAR_REGEX, '')
      .replace(/\(\s*[/·\-،,]*\s*\)/g, '')
      .replace(/\[\s*[/·\-،,]*\s*\]/g, '')
      .replace(/\s*\/\s*(?=$|\s|[)\]])/g, '')
      .replace(/(?:^|\s)\/\s*/g, ' ')
      .replace(/\s*·\s*·\s*/g, ' · ')
      .replace(/\s*·\s*$/g, '')
      .replace(/^\s*·\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return out || 'Verified Record';
  }

  // lang === 'ar'
  if (!/[A-Za-z]/.test(out)) return out;

  out = out
    .replace(/\[غير واضح\s*\/\s*UNCLEAR\]/gi, '[غير واضح]')
    .replace(/\[غير موجود\s*\/\s*MISSING\]/gi, '[غير موجود]');

  for (const [pattern, replacement] of ENGLISH_TO_ARABIC_TERM_MAP) {
    out = out.replace(pattern, replacement);
  }

  // Remove any remaining Latin characters/words and clean empty brackets/separators
  out = out
    .replace(/[A-Za-z]+(?:[-_./@][A-Za-z0-9]+)*/g, '')
    .replace(/\(\s*[/·\-،,:]*\s*\)/g, '')
    .replace(/\[\s*[/·\-،,:]*\s*\]/g, '')
    .replace(/\s*\/\s*(?=$|\s|[)\]])/g, '')
    .replace(/(?:^|\s)\/\s*/g, ' ')
    .replace(/\s*·\s*·\s*/g, ' · ')
    .replace(/\s*·\s*$/g, '')
    .replace(/^\s*·\s*/g, '')
    .replace(/\s*—\s*$/g, '')
    .replace(/^\s*—\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return out;
}
