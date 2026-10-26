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
 * Common Iraqi & MENA Name / Term Dictionary for high-accuracy transliteration
 */
const ARABIC_NAME_DICT: Record<string, string> = {
  'تاج الدين': 'Taj Al-Din',
  'تاج': 'Taj',
  'الدين': 'Al-Din',
  'يوسف': 'Yousif',
  'عزالدين': 'Izz Al-Din',
  'عز الدين': 'Izz Al-Din',
  'عز': 'Izz',
  'اورچ': 'Ourch',
  'اورج': 'Ourj',
  'أورج': 'Ourj',
  'أورچ': 'Ourch',
  'ناهدة': 'Nahida',
  'ناهده': 'Nahida',
  'وداد': 'Widad',
  'سليمان': 'Sulaiman',
  'عبدالله': 'Abdullah',
  'عبد الله': 'Abdullah',
  'عبدالرحمن': 'Abdul-Rahman',
  'عبد الرحمن': 'Abdul-Rahman',
  'عبدالكريم': 'Abdul-Kareem',
  'عبد الكريم': 'Abdul-Kareem',
  'أيهم': 'Ayham',
  'ايهم': 'Ayham',
  'شامل': 'Shamil',
  'يونس': 'Younis',
  'إسراء': 'Israa',
  'اسراء': 'Israa',
  'آل قره غولي': 'Al-Qaragholi',
  'ال قره غولي': 'Al-Qaragholi',
  'قره غولي': 'Qaragholi',
  'القره غولي': 'Al-Qaragholi',
  'آل': 'Al',
  'قره': 'Qarah',
  'غولي': 'Gholi',
  'محمد': 'Mohammad',
  'كاظم': 'Kadhem',
  'علي': 'Ali',
  'حسين': 'Hussein',
  'أحمد': 'Ahmed',
  'احمد': 'Ahmed',
  'حسن': 'Hassan',
  'زيد': 'Zaid',
  'طارق': 'Tariq',
  'مصطفى': 'Mustafa',
  'عمر': 'Omar',
  'خالد': 'Khalid',
  'سعيد': 'Saeed',
  'جاسم': 'Jassim',
  'كريم': 'Kareem',
  'قاسم': 'Qasim',
  'فاطمة': 'Fatima',
  'فاطمه': 'Fatima',
  'زينب': 'Zainab',
  'مريم': 'Maryam',
  'هدى': 'Huda',
  'سعاد': 'Suad',
  'نور': 'Noor',
  'سارة': 'Sara',
  'ساره': 'Sara',
  'محمود': 'Mahmoud',
  'إبراهيم': 'Ibrahim',
  'ابراهيم': 'Ibrahim',
  'عباس': 'Abbas',
  'حمزة': 'Hamza',
  'حمزه': 'Hamza',
  'حيدر': 'Haider',
  'عمار': 'Ammar',
  'ياسر': 'Yasser',
  'وسام': 'Wissam',
  'باسم': 'Basim',
  'جمال': 'Jamal',
  'جواد': 'Jawad',
  'طالب': 'Talib',
  'صالح': 'Salih',
  'فلاح': 'Falah',
  'مهدي': 'Mahdi',
  'الربيعي': 'Al-Rubaye',
  'الدليمي': 'Al-Dulaimi',
  'البغدادي': 'Al-Baghdadi',
  'بغداد': 'Baghdad',
  'الكرخ': 'Al-Karkh',
  'الرصافة': 'Al-Rusafa',
  'البصرة': 'Basra',
  'أربيل': 'Erbil',
  'اربيل': 'Erbil',
  'السليمانية': 'Sulaymaniyah',
  'الموصل': 'Mosul',
  'نينوى': 'Nineveh',
  'ذكر': 'Male',
  'أنثى': 'Female',
};

const LATIN_TO_ARABIC_NAME_DICT: Record<string, string> = {
  'ayham': 'أيهم',
  'shamil': 'شامل',
  'younis': 'يونس',
  'yunis': 'يونس',
  'younus': 'يونس',
  'yunus': 'يونس',
  'israa': 'إسراء',
  'isra': 'إسراء',
  'esraa': 'إسراء',
  'muhammad': 'محمد',
  'mohammad': 'محمد',
  'mohammed': 'محمد',
  'mohamed': 'محمد',
  'al-qaragholi': 'آل قره غولي',
  'qaragholi': 'قره غولي',
  'qarah': 'قره',
  'gholi': 'غولي',
  'kadhem': 'كاظم',
  'kadhim': 'كاظم',
  'ali': 'علي',
  'hussein': 'حسين',
  'hussain': 'حسين',
  'ahmed': 'أحمد',
  'ahmad': 'أحمد',
  'hassan': 'حسن',
  'hasan': 'حسن',
  'zaid': 'زيد',
  'zayd': 'زيد',
  'tariq': 'طارق',
  'mustafa': 'مصطفى',
  'omar': 'عمر',
  'umar': 'عمر',
  'khalid': 'خالد',
  'khaled': 'خالد',
  'saeed': 'سعيد',
  'jassim': 'جاسم',
  'jasim': 'جاسم',
  'kareem': 'كريم',
  'karim': 'كريم',
  'qasim': 'قاسم',
  'qassem': 'قاسم',
  'fatima': 'فاطمة',
  'fatimah': 'فاطمة',
  'zainab': 'زينب',
  'zeinab': 'زينب',
  'maryam': 'مريم',
  'mariam': 'مريم',
  'huda': 'هدى',
  'suad': 'سعاد',
  'noor': 'نور',
  'nur': 'نور',
  'sara': 'سارة',
  'sarah': 'سارة',
  'mahmoud': 'محمود',
  'mahmud': 'محمود',
  'ibrahim': 'إبراهيم',
  'abbas': 'عباس',
  'hamza': 'حمزة',
  'haider': 'حيدر',
  'hayder': 'حيدر',
  'ammar': 'عمار',
  'yasser': 'ياسر',
  'yasir': 'ياسر',
  'wissam': 'وسام',
  'basim': 'باسم',
  'bassim': 'باسم',
  'jamal': 'جمال',
  'jawad': 'جواد',
  'talib': 'طالب',
  'salih': 'صالح',
  'saleh': 'صالح',
  'falah': 'فلاح',
  'mahdi': 'مهدي',
  'nahida': 'ناهدة',
  'widad': 'وداد',
  'sulaiman': 'سليمان',
  'sulayman': 'سليمان',
  'abdullah': 'عبد الله',
  'yousif': 'يوسف',
  'yousef': 'يوسف',
  'yusuf': 'يوسف',
  'al-rubaye': 'الربيعي',
  'al-rubaie': 'الربيعي',
  'al-dulaimi': 'الدليمي',
  'al-baghdadi': 'البغدادي',
};

const ARABIC_LETTER_MAP: Record<string, string> = {
  'أ': 'A', 'إ': 'I', 'آ': 'Aa', 'ا': 'A',
  'ب': 'B', 'ت': 'T', 'ث': 'Th', 'ج': 'J',
  'ح': 'H', 'خ': 'Kh', 'د': 'D', 'ذ': 'Dh',
  'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'Sh',
  'ص': 'S', 'ض': 'Dh', 'ط': 'T', 'ظ': 'Dh',
  'ع': 'A', 'غ': 'Gh', 'ف': 'F', 'ق': 'Q',
  'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
  'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'A',
  'ة': 'a', 'ء': '', 'ئ': 'Y', 'ؤ': 'W',
  'چ': 'Ch', 'پ': 'P', 'گ': 'G', 'ژ': 'Zh', 'ڤ': 'V',
};

export function transliterateArabicToLatin(arabicText: string): string {
  if (!arabicText || !arabicText.trim()) return '';
  const trimmed = arabicText.trim();

  // Check whole phrase dictionary first
  if (ARABIC_NAME_DICT[trimmed]) {
    return ARABIC_NAME_DICT[trimmed];
  }

  // Tokenize words
  const words = trimmed.split(/\s+/);
  const resultWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    // Check 3-word combinations e.g. "آل قره غولي"
    if (i + 2 < words.length) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (ARABIC_NAME_DICT[threeWord]) {
        resultWords.push(ARABIC_NAME_DICT[threeWord]);
        i += 2;
        continue;
      }
    }
    // Check 2-word combinations e.g. "عبد الله", "تاج الدين", "عز الدين"
    if (i + 1 < words.length) {
      const twoWord = `${words[i]} ${words[i + 1]}`;
      if (ARABIC_NAME_DICT[twoWord]) {
        resultWords.push(ARABIC_NAME_DICT[twoWord]);
        i++; // skip next word
        continue;
      }
    }

    const w = words[i];
    if (ARABIC_NAME_DICT[w]) {
      resultWords.push(ARABIC_NAME_DICT[w]);
      continue;
    }

    // Letter-by-letter phonetic transliteration
    let wordTrans = '';
    for (let c = 0; c < w.length; c++) {
      const char = w[c];
      const nextChar = w[c + 1] || '';
      // Handle prefix "ال" -> "Al-"
      if (c === 0 && char === 'ا' && nextChar === 'ل' && w.length > 2) {
        wordTrans += 'Al-';
        c++;
        continue;
      }
      wordTrans += ARABIC_LETTER_MAP[char] || char;
    }

    // Clean double characters and capitalize first letter
    wordTrans = wordTrans.replace(/(.)\1{2,}/g, '$1$1');
    if (wordTrans.length > 0) {
      wordTrans = wordTrans.charAt(0).toUpperCase() + wordTrans.slice(1).toLowerCase();
      // Keep Al- capitalized correctly
      if (wordTrans.startsWith('Al-') && wordTrans.length > 3) {
        wordTrans = 'Al-' + wordTrans.charAt(3).toUpperCase() + wordTrans.slice(4);
      }
    }
    resultWords.push(wordTrans);
  }

  return resultWords.filter(Boolean).join(' ');
}

export function transliterateLatinToArabic(latinText: string): string {
  if (!latinText || !latinText.trim()) return '';
  const cleaned = latinText
    .trim()
    .replace(/[/·|()-]+/g, ' ')
    .replace(/\s+/g, ' ');
  const lowerFull = cleaned.toLowerCase();
  if (LATIN_TO_ARABIC_NAME_DICT[lowerFull]) {
    return LATIN_TO_ARABIC_NAME_DICT[lowerFull];
  }

  const words = cleaned.split(/\s+/);
  const outWords: string[] = [];

  for (const rawW of words) {
    const w = rawW.toLowerCase();
    if (!w) continue;
    if (LATIN_TO_ARABIC_NAME_DICT[w]) {
      outWords.push(LATIN_TO_ARABIC_NAME_DICT[w]);
      continue;
    }
    if (w.startsWith('al-') && w.length > 3) {
      const stem = w.slice(3);
      if (LATIN_TO_ARABIC_NAME_DICT[stem]) {
        outWords.push(`ال${LATIN_TO_ARABIC_NAME_DICT[stem]}`);
        continue;
      }
    }
    // Phonetic Latin-to-Arabic fallback for Iraqi names
    let phonetic = w
      .replace(/^al-/, 'ال')
      .replace(/sh/g, 'ش')
      .replace(/kh/g, 'خ')
      .replace(/gh/g, 'غ')
      .replace(/th/g, 'ث')
      .replace(/dh/g, 'ذ')
      .replace(/ch/g, 'چ')
      .replace(/aa/g, 'ا')
      .replace(/ee/g, 'ي')
      .replace(/oo|ou/g, 'و')
      .replace(/a/g, 'ا')
      .replace(/b/g, 'ب')
      .replace(/t/g, 'ت')
      .replace(/j/g, 'ج')
      .replace(/h/g, 'ح')
      .replace(/d/g, 'د')
      .replace(/r/g, 'ر')
      .replace(/z/g, 'ز')
      .replace(/s/g, 'س')
      .replace(/f/g, 'ف')
      .replace(/q/g, 'ق')
      .replace(/k/g, 'ك')
      .replace(/c/g, 'ك')
      .replace(/l/g, 'ل')
      .replace(/m/g, 'م')
      .replace(/n/g, 'ن')
      .replace(/w/g, 'و')
      .replace(/u/g, 'و')
      .replace(/y/g, 'ي')
      .replace(/i/g, 'ي')
      .replace(/e/g, 'ي')
      .replace(/o/g, 'و');
    phonetic = phonetic.replace(/(.)\1+/g, '$1');
    outWords.push(phonetic);
  }

  return outWords.filter(Boolean).join(' ');
}

/**
 * Formats any personal/lineage name (Full Name, First Name, Father's Name, Grandfather's Name,
 * Surname, Mother's Name, Maternal Grandfather's Name) so that BOTH English and Arabic scripts
 * are always displayed side-by-side (e.g. "Israa Muhammad · إسراء محمد" or "Younis · يونس").
 */
export function formatBilingualName(
  rawText?: string,
  explicitAr?: string,
  explicitEn?: string
): string {
  const combinedSource = [rawText, explicitAr, explicitEn]
    .filter((v) => v && !v.includes('MISSING') && !v.includes('غير موجود') && !v.includes('UNCLEAR') && !v.includes('غير واضح'))
    .join(' · ')
    .trim();

  if (!combinedSource) {
    return rawText || '[غير موجود / MISSING]';
  }

  // Extract Arabic script tokens and Latin script tokens
  const arabicMatches = combinedSource.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)*/g);
  const latinMatches = combinedSource.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*(?:\s+[A-Za-z]+(?:[-'][A-Za-z]+)?)*/g);

  // Deduplicate tokens while preserving order
  const uniquePhrases = (arr: string[] | null): string => {
    if (!arr || arr.length === 0) return '';
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of arr) {
      const norm = item.trim().replace(/\s+/g, ' ');
      const key = norm.toLowerCase();
      if (norm && !seen.has(key)) {
        seen.add(key);
        out.push(norm);
      }
    }
    return out.join(' ');
  };

  let arPart = uniquePhrases(arabicMatches);
  let enPart = uniquePhrases(latinMatches);

  // Format English part in clean Title Case if it was ALL CAPS (e.g. "ISRAA MUHAMMAD" -> "Israa Muhammad")
  if (enPart && enPart === enPart.toUpperCase() && enPart.length > 1) {
    enPart = enPart
      .split(/\s+/)
      .map((w) =>
        w
          .split('-')
          .map((sub) => (sub ? sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase() : sub))
          .join('-')
      )
      .join(' ');
  }

  if (arPart && !enPart) {
    enPart = transliterateArabicToLatin(arPart);
  } else if (enPart && !arPart) {
    arPart = transliterateLatinToArabic(enPart);
  }

  if (enPart && arPart) {
    return `${enPart} · ${arPart}`;
  }
  return enPart || arPart || rawText || '[غير موجود / MISSING]';
}

/**
 * Ensures strict single-language text output:
 * - When lang === 'en': removes all Arabic/Kurdish script characters or transliterates Arabic names to English Latin.
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

    // If removing Arabic erased all characters (e.g. an Arabic-only name), transliterate it accurately to Latin
    if (!out) {
      const transliterated = transliterateArabicToLatin(input);
      if (transliterated) return transliterated;
      return input.trim();
    }
    return out;
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

  return out || input.trim();
}
