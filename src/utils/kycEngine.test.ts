import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskTier,
  computeIcaoCheckDigit,
  validateMrzCheckDigit,
  normalizeMultiScriptText,
  getDocumentSideRequirement,
  auditMissingExpectedFields,
  evaluateApplicantWithRules,
  runAutomatedBatchWorkflow,
  filterAndSortApplicants,
  computeKpiMetrics,
  type KYCApplicant,
  type AutomationConfig,
} from './kycEngine.ts';

const defaultConfig: AutomationConfig = {
  autoApproveMaxRiskScore: 26,
  minOcrConfidence: 90,
  minBiometricScore: 88,
  autoRejectSanctionsHit: true,
  requireUtilityBillForHighRisk: true,
  strictExpiryCheck: true,
};

const sampleApplicants: KYCApplicant[] = [
  {
    id: 'app-irq-1',
    referenceCode: 'ROSTRO-2026-9041',
    fullNameEn: 'Abdullah Tariq Al-Dulaimi',
    fullNameAr: 'عبد الله طارق الدليمي',
    normalizedEntityName: 'عبدالله طارق الدليمي',
    email: 'a.aldulaimi@baghdad-commerce.iq',
    phone: '+964 770 492 1840',
    countryCode: 'IQ',
    countryEn: 'Iraq',
    countryAr: 'العراق',
    governorateEn: 'Baghdad (Al-Karkh)',
    governorateAr: 'بغداد (الكرخ)',
    entityType: 'individual',
    submittedAt: '2026-10-17 08:12 UTC',
    updatedAt: '2026-10-17 08:12 UTC',
    status: 'pending',
    stage9Outcome: 'HUMAN_REVIEW',
    riskScore: 12,
    riskTier: 'low',
    sanctionsMatch: false,
    pepMatch: false,
    adverseMediaMatch: false,
    biometricMatchScore: 98,
    assignedReviewerEn: 'Zainab Al-Rubaye',
    assignedReviewerAr: 'زينب الربيعي',
    nineSignals: {
      image_quality: 0.96,
      classification_confidence: 0.99,
      extraction_confidence: 0.97,
      normalization_quality: 1.0,
      format_validity: 1.0,
      document_consistency: 0.98,
      cross_document_consistency: 0.97,
      authenticity_risk_indicators: 0.99,
      external_verification_status: 'EXTERNAL_VERIFICATION_UNAVAILABLE',
    },
    documents: [
      {
        id: 'doc-101',
        type: 'IRQ_NATIONAL_ID',
        categoryCode: 'A_IDENTITY_CIVIL',
        supportStatus: 'TESTED',
        side: 'BOTH',
        detectedLanguages: ['ar', 'ku', 'en'],
        titleEn: 'Unified Iraqi National Card (البطاقة الوطنية)',
        titleAr: 'البطاقة الوطنية الموحدة',
        docNumber: '198849201842',
        issueDate: '2022-04-12',
        expiryDate: '2032-04-11',
        issuingAuthorityEn: 'Directorate of Nationality & Civil Status — Baghdad',
        issuingAuthorityAr: 'مديرية الجنسية والأحوال المدنية — بغداد',
        issuingCountryEn: 'Republic of Iraq',
        issuingCountryAr: 'جمهورية العراق',
        ocrConfidence: 97,
        livenessScore: 99,
        mrzModulo10Valid: true,
        fileSizeKb: 1420,
        sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        status: 'pending',
        extractedFields: {
          fullName: 'ABDULLAH TARIQ AL-DULAIMI',
          normalizedName: 'عبدالله طارق الدليمي',
          dob: '1988-11-23',
          nationality: 'IRQ',
          mrzLine1: 'IDIRQ198849201842<<<<<<<<<<<<<',
          mrzLine2: '8811234M3204115IRQ<<<<<<<<<<<6',
        },
      },
    ],
    auditTrail: [],
  },
  {
    id: 'app-irq-2',
    referenceCode: 'ROSTRO-2026-9011',
    fullNameEn: 'Viktor Kovalenko',
    fullNameAr: 'فيكتور كوفالينكو',
    normalizedEntityName: 'فيكتور كوفالينكو',
    email: 'v.kovalenko@basra-shipping.iq',
    phone: '+964 780 910 2210',
    countryCode: 'IQ',
    countryEn: 'Iraq',
    countryAr: 'العراق',
    governorateEn: 'Basra',
    governorateAr: 'البصرة',
    entityType: 'corporate',
    submittedAt: '2026-10-17 06:50 UTC',
    updatedAt: '2026-10-17 06:50 UTC',
    status: 'pending',
    stage9Outcome: 'HUMAN_REVIEW',
    riskScore: 84,
    riskTier: 'high',
    sanctionsMatch: true,
    pepMatch: false,
    adverseMediaMatch: true,
    biometricMatchScore: 76,
    assignedReviewerEn: 'Mustafa Al-Kadhimi',
    assignedReviewerAr: 'مصطفى الكاظمي',
    nineSignals: {
      image_quality: 0.78,
      classification_confidence: 0.94,
      extraction_confidence: 0.82,
      normalization_quality: 0.95,
      format_validity: 0.0,
      document_consistency: 0.45,
      cross_document_consistency: 0.5,
      authenticity_risk_indicators: 0.15,
      external_verification_status: 'EXTERNAL_VERIFICATION_UNAVAILABLE',
    },
    documents: [
      {
        id: 'doc-102',
        type: 'FOREIGN_PASSPORT',
        categoryCode: 'C_TRAVEL_IMMIGRATION',
        supportStatus: 'TESTED',
        side: 'FRONT',
        detectedLanguages: ['en'],
        titleEn: 'Foreign Passport (Forged MRZ Checksum)',
        titleAr: 'جواز سفر أجنبي (تلاعب في شريط MRZ)',
        docNumber: 'A0928172',
        issueDate: '2019-01-10',
        expiryDate: '2029-01-09',
        issuingAuthorityEn: 'Foreign Ministry',
        issuingAuthorityAr: 'وزارة الخارجية',
        issuingCountryEn: 'Cyprus',
        issuingCountryAr: 'قبرص',
        ocrConfidence: 82,
        mrzModulo10Valid: false,
        fileSizeKb: 1850,
        sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        status: 'pending',
        extractedFields: {
          fullName: 'VIKTOR KOVALENKO',
          dob: '1975-03-14',
          nationality: 'CYP',
        },
      },
    ],
    auditTrail: [],
  },
];

test('normalizeMultiScriptText converts Eastern Arabic-Indic and Kurdish-Indic digits and unifies compound names', () => {
  assert.equal(normalizeMultiScriptText('١٩٨٨/١١/٢٣ - ۰۱۲۳'), '1988/11/23 - 0123');
  assert.equal(normalizeMultiScriptText('عبد الله کريم هەولێر'), 'عبدالله كريم ههولير');
});

test('computeIcaoCheckDigit and validateMrzCheckDigit follow ICAO 9303 Modulo-10 [7, 3, 1] arithmetic', () => {
  const dob = '881123';
  const digit = computeIcaoCheckDigit(dob);
  assert.equal(digit, 7);
  assert.equal(validateMrzCheckDigit(dob, '7'), true);
  assert.equal(validateMrzCheckDigit(dob, '9'), false);
});

test('calculateRiskTier classifies low, medium, and high thresholds accurately', () => {
  assert.equal(calculateRiskTier(12), 'low');
  assert.equal(calculateRiskTier(28), 'low');
  assert.equal(calculateRiskTier(29), 'medium');
  assert.equal(calculateRiskTier(64), 'medium');
  assert.equal(calculateRiskTier(65), 'high');
});

test('evaluateApplicantWithRules fast-tracks tested Iraqi dossiers to AUTO_APPROVED', () => {
  const result = evaluateApplicantWithRules(sampleApplicants[0], defaultConfig);
  assert.equal(result.nextStatus, 'approved');
  assert.equal(result.stage9Outcome, 'AUTO_APPROVED');
});

test('evaluateApplicantWithRules auto-rejects dossiers with tampered MRZ or sanctions hits', () => {
  const result = evaluateApplicantWithRules(sampleApplicants[1], defaultConfig);
  assert.equal(result.nextStatus, 'rejected');
  assert.equal(result.stage9Outcome, 'AUTO_REJECTED');
});

test('auditMissingExpectedFields detects missing expected fields on Iraqi Residence Card (IRQ_RESIDENCE_CARD) and blocks AUTO_APPROVED', () => {
  const missing = auditMissingExpectedFields('IRQ_RESIDENCE_CARD', {
    fullNameEn: 'Hassan Ali Al-Obaidi',
    fullNameAr: 'حسن علي العبيدي',
    docNumber: 'RES-BGD-99102',
    address: '[غير موجود / MISSING]',
    issueDate: '[غير واضح]',
    familyNumber: '[غير موجود / MISSING]',
  });
  assert.equal(missing.some((f) => f.fieldKey === 'address' && f.severity === 'CRITICAL'), true);
  assert.equal(missing.some((f) => f.fieldKey === 'issueDate' && f.severity === 'WARNING'), true);

  const incompleteApplicant: KYCApplicant = {
    ...sampleApplicants[0],
    documents: [
      {
        ...sampleApplicants[0].documents[0],
        type: 'IRQ_RESIDENCE_CARD',
        missingExpectedFields: missing,
      },
    ],
  };
  const evalResult = evaluateApplicantWithRules(incompleteApplicant, defaultConfig);
  assert.equal(evalResult.stage9Outcome, 'INSUFFICIENT_DATA');
  assert.equal(evalResult.nextStatus, 'flagged');
});

test('getDocumentSideRequirement requires BOTH sides for physical cards and only single Bio-Data page for Passports', () => {
  assert.equal(getDocumentSideRequirement('IRQ_NATIONAL_ID').requiresBothSides, true);
  assert.equal(getDocumentSideRequirement('IRQ_RESIDENCE_CARD').requiresBothSides, true);
  assert.equal(getDocumentSideRequirement('IRQ_DRIVING_LICENSE').requiresBothSides, true);
  assert.equal(getDocumentSideRequirement('IRQ_CIVIL_STATUS_ID').requiresBothSides, true);
  assert.equal(getDocumentSideRequirement('IRQ_CHAMBER_OF_COMMERCE').requiresBothSides, true);
  assert.equal(getDocumentSideRequirement('IRQ_PASSPORT').requiresBothSides, false);
  assert.equal(getDocumentSideRequirement('FOREIGN_PASSPORT').requiresBothSides, false);

  // Uploading only FRONT of a National ID flags backSideUpload as CRITICAL
  const frontOnlyCardMissing = auditMissingExpectedFields(
    'IRQ_NATIONAL_ID',
    {
      fullNameEn: 'Kadhem Mohammad Ali Al-Baghdadi',
      fullNameAr: 'كاظم محمد علي البغدادي',
      docNumber: 'A1234567',
      dob: '1988-11-23',
      expiryDate: '2031-10-15',
      issueDate: '2021-10-15',
    },
    [],
    'FRONT'
  );
  assert.equal(
    frontOnlyCardMissing.some((f) => f.fieldKey === 'backSideUpload' && f.severity === 'CRITICAL'),
    true
  );

  // Uploading only FRONT (Bio-Data Page) of an Iraqi Passport does NOT flag backSideUpload
  const passportFrontOnlyMissing = auditMissingExpectedFields(
    'IRQ_PASSPORT',
    {
      fullNameEn: 'Karwan Azad Barzani',
      fullNameAr: 'كاروان آزاد بارزاني',
      docNumber: 'A88492014',
      dob: '1991-04-02',
      expiryDate: '2031-11-02',
      issueDate: '2023-11-03',
    },
    [],
    'FRONT'
  );
  assert.equal(
    passportFrontOnlyMissing.some((f) => f.fieldKey === 'backSideUpload'),
    false
  );
});

test('runAutomatedBatchWorkflow processes pending queue and generates CBI Law No. 78 HMAC receipts', () => {
  const { updatedApplicants, summary } = runAutomatedBatchWorkflow(sampleApplicants, defaultConfig);
  assert.equal(summary.processedCount, 2);
  assert.deepEqual(summary.autoApprovedIds, ['app-irq-1']);
  assert.deepEqual(summary.autoRejectedIds, ['app-irq-2']);
  assert.equal(updatedApplicants[0].status, 'approved');
  assert.ok(updatedApplicants[0].auditTrail[0].cbiLaw78HmacReceipt?.startsWith('HMAC-SHA256-CBI78'));
});

test('filterAndSortApplicants supports normalized Arabic compound name search (عبدالله matches عبد الله)', () => {
  const compoundSearch = filterAndSortApplicants(sampleApplicants, {
    statusFilter: 'all',
    riskFilter: 'all',
    docTypeFilter: 'all',
    searchQuery: 'عبدالله',
    sortBy: 'riskScore',
    sortOrder: 'asc',
  });
  assert.equal(compoundSearch.length, 1);
  assert.equal(compoundSearch[0].id, 'app-irq-1');
});

test('computeKpiMetrics calculates accurate counts and averages', () => {
  const { updatedApplicants } = runAutomatedBatchWorkflow(sampleApplicants, defaultConfig);
  const metrics = computeKpiMetrics(updatedApplicants);
  assert.equal(metrics.total, 2);
  assert.equal(metrics.approved, 1);
  assert.equal(metrics.rejected, 1);
  assert.equal(metrics.approvalRate, 50);
  assert.equal(metrics.avgOcr, 89.5);
});

