import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskTier,
  computeIcaoCheckDigit,
  validateMrzCheckDigit,
  normalizeMultiScriptText,
  getDocumentSideRequirement,
  auditMissingExpectedFields,
  validateUploadedCardPair,
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

test('validateUploadedCardPair detects two different FRONT ID images (duplicate FRONT sides + mismatched cardholders/ID numbers) and blocks BOTH status', () => {
  const slot1 = {
    slotIndex: 1 as const,
    detectedSide: 'FRONT' as const,
    documentType: 'IRQ_NATIONAL_ID' as const,
    fullNameEn: 'Zaid Kareem Qasim Al-Rubaie',
    fullNameAr: 'زيد كريم قاسم الربيعي',
    docNumber: '199254829100',
    dob: '1992-05-12',
    issueDate: '[غير موجود / MISSING]',
    expiryDate: '[غير موجود / MISSING]',
    governorateEn: 'Baghdad (Al-Karkh)',
    governorateAr: 'بغداد (الكرخ)',
    address: 'N/A',
    familyNumber: '[غير موجود / MISSING]',
    mrzLine1: '[غير موجود / MISSING]',
    mrzLine2: '[غير موجود / MISSING]',
    ocrConfidence: 97,
    boundingBoxes: [],
    missingExpectedFields: [],
  };
  const slot2 = {
    slotIndex: 2 as const,
    detectedSide: 'FRONT' as const,
    documentType: 'IRQ_NATIONAL_ID' as const,
    fullNameEn: 'Kadhem Mohammad Ali Al-Baghdadi',
    fullNameAr: 'كاظم محمد علي البغدادي',
    docNumber: 'A1234567',
    dob: '1980-01-01',
    issueDate: '[غير موجود / MISSING]',
    expiryDate: '[غير موجود / MISSING]',
    governorateEn: 'Baghdad (Al-Karkh)',
    governorateAr: 'بغداد (الكرخ)',
    address: 'N/A',
    familyNumber: '[غير موجود / MISSING]',
    mrzLine1: '[غير موجود / MISSING]',
    mrzLine2: '[غير موجود / MISSING]',
    ocrConfidence: 96,
    boundingBoxes: [],
    missingExpectedFields: [],
  };

  const pairValidation = validateUploadedCardPair(slot1, slot2);
  assert.equal(pairValidation.isValidPair, false);
  assert.equal(pairValidation.effectiveSide, 'FRONT');
  assert.equal(pairValidation.issues.some((i) => i.code === 'DUPLICATE_FRONT_SIDES'), true);
  assert.equal(pairValidation.issues.some((i) => i.code === 'DIFFERENT_HOLDER_NAMES'), true);
  assert.equal(pairValidation.issues.some((i) => i.code === 'DIFFERENT_DOC_NUMBERS'), true);
  assert.equal(pairValidation.issues.some((i) => i.code === 'DIFFERENT_DOB'), true);

  // Verify auditMissingExpectedFields records the cross-card conflicts and missing back side
  const missing = auditMissingExpectedFields(
    'IRQ_NATIONAL_ID',
    {
      fullNameEn: slot1.fullNameEn,
      fullNameAr: slot1.fullNameAr,
      docNumber: slot1.docNumber,
      dob: slot1.dob,
    },
    [],
    pairValidation.effectiveSide,
    pairValidation
  );
  assert.equal(missing.some((f) => f.fieldKey.startsWith('pairConflict_')), true);
  assert.equal(missing.some((f) => f.fieldKey === 'backSideUpload'), true);
});

test('validateUploadedCardPair accepts matching FRONT + BACK pair of the same Iraqi National ID', () => {
  const slot1 = {
    slotIndex: 1 as const,
    detectedSide: 'FRONT' as const,
    documentType: 'IRQ_NATIONAL_ID' as const,
    fullNameEn: 'Zaid Kareem Qasim Al-Rubaie',
    fullNameAr: 'زيد كريم قاسم الربيعي',
    docNumber: '199254829100',
    dob: '1992-05-12',
    issueDate: '[غير موجود / MISSING]',
    expiryDate: '[غير موجود / MISSING]',
    governorateEn: 'Baghdad (Al-Karkh)',
    governorateAr: 'بغداد (الكرخ)',
    address: 'N/A',
    familyNumber: '[غير موجود / MISSING]',
    mrzLine1: '[غير موجود / MISSING]',
    mrzLine2: '[غير موجود / MISSING]',
    ocrConfidence: 97,
    boundingBoxes: [],
    missingExpectedFields: [],
  };
  const slot2 = {
    slotIndex: 2 as const,
    detectedSide: 'BACK' as const,
    documentType: 'IRQ_NATIONAL_ID' as const,
    fullNameEn: '[غير موجود / MISSING]',
    fullNameAr: '[غير موجود / MISSING]',
    docNumber: '199254829100',
    dob: '1992-05-12',
    issueDate: '2021-10-15',
    expiryDate: '2031-10-15',
    governorateEn: 'Baghdad (Al-Karkh)',
    governorateAr: 'بغداد (الكرخ)',
    address: 'N/A',
    familyNumber: '089241299102',
    mrzLine1: 'IDIRQ199254829100<<<<<<<<<<<<<',
    mrzLine2: '9205128M3110152IRQ<<<<<<<<<<<4',
    ocrConfidence: 96,
    boundingBoxes: [],
    missingExpectedFields: [],
  };

  const pairValidation = validateUploadedCardPair(slot1, slot2);
  assert.equal(pairValidation.isValidPair, true);
  assert.equal(pairValidation.effectiveSide, 'BOTH');
  assert.equal(pairValidation.issues.filter((i) => i.severity === 'CRITICAL').length, 0);
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

test('Edge & Forensics Engine: Laplacian Blur, HSV Glare, 2D FFT Moiré, CLAHE, 4-Digit ICAO MRZ, Ghost SSIM & 512-D ArcFace', async () => {
  const {
    computeLaplacianBlurVariance,
    detectHsvSpecularGlare,
    detectFftMoireScreenSpoof,
    checkAndNormalizeOrientation,
    applyClaheAndSealEnhancementToPixels,
    validateFullIcao9303Mrz,
    computeGhostPortraitSsimFromCard,
    computeArcFaceBiometricMatch,
    createDeterministic512DEmbedding,
  } = await import('./edgeForensicsEngine.ts');

  const width = 40;
  const height = 30;
  // 1. Uniform flat buffer -> blurry (sigma^2 = 0 < 120)
  const blurryPixels = new Uint8ClampedArray(width * height * 4).fill(128);
  const blurRes = computeLaplacianBlurVariance(blurryPixels, width, height, 120);
  assert.equal(blurRes.passed, false);
  assert.equal(blurRes.variance < 120, true);

  // Sharp high-contrast edge buffer -> sharp (sigma^2 >= 120)
  const sharpPixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const val = (x % 4 < 2) !== (y % 4 < 2) ? 235 : 25;
      sharpPixels[idx] = val;
      sharpPixels[idx + 1] = val;
      sharpPixels[idx + 2] = val;
      sharpPixels[idx + 3] = 255;
    }
  }
  const sharpRes = computeLaplacianBlurVariance(sharpPixels, width, height, 120);
  assert.equal(sharpRes.passed, true);
  assert.equal(sharpRes.variance >= 120, true);

  // 2. HSV Specular Glare Detector (V >= 245, S <= 30 over > 5%)
  const glarePixels = new Uint8ClampedArray(width * height * 4).fill(100);
  // Set central card interior region (y: 15..45, x: 15..45) to blinding white flash (V=255, S=0)
  for (let y = 15; y < 45; y++) {
    for (let x = 15; x < 45; x++) {
      const idx = (y * width + x) * 4;
      glarePixels[idx] = 254;
      glarePixels[idx + 1] = 254;
      glarePixels[idx + 2] = 255;
      glarePixels[idx + 3] = 255;
    }
  }
  const glareRes = detectHsvSpecularGlare(glarePixels, width, height, 5.0);
  assert.equal(glareRes.passed, false);
  assert.equal(glareRes.glareAreaPercent > 15, true);

  // 3. 2D FFT Moiré Screen-Replay Detector
  const moirePixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alt = (x + y) % 2 === 0 ? 250 : 15;
      moirePixels[idx] = alt;
      moirePixels[idx + 1] = 255 - alt;
      moirePixels[idx + 2] = alt;
      moirePixels[idx + 3] = 255;
    }
  }
  const moireRes = detectFftMoireScreenSpoof(moirePixels, width, height, 38);
  assert.equal(moireRes.isScreenReplaySpoof, true);

  // 4. 30ms Hardware Auto-Orientation Normalizer (768x1024 portrait -> 1024x768 landscape)
  const orientRes = checkAndNormalizeOrientation(768, 1024, 'IRQ_NATIONAL_ID');
  assert.equal(orientRes.wasSidewaysPortrait, true);
  assert.equal(orientRes.appliedRotationDeg, 90);
  assert.equal(orientRes.normalizedWidth, 1024);
  assert.equal(orientRes.normalizedHeight, 768);

  // 5. CLAHE & Seal Contrast Enhancer
  const claheRes = applyClaheAndSealEnhancementToPixels(sharpPixels, width, height);
  assert.equal(claheRes.enhancedPixels.length, sharpPixels.length);
  assert.equal(claheRes.contrastGainPercent > 0, true);

  // 6. Full 4-Check-Digit ICAO Doc 9303 Modulo-10 Validator + Front/Back Cross-Match
  const validMrz = validateFullIcao9303Mrz(
    'IDIRQ1988492014<<<<<<<<<<<<<<<',
    '8811237M3204119IRQ<<<<<<<<<<<6',
    { docNumber: '198849201', dob: '1988-11-23', expiryDate: '2032-04-11' }
  );
  assert.equal(validMrz.checkDigits[0].passed, true); // Doc number check digit (198849201 -> 4)
  assert.equal(validMrz.checkDigits[1].passed, true); // DOB check digit (881123 -> 7)
  assert.equal(validMrz.checkDigits[2].passed, true); // Expiry check digit (320411 -> 9)
  assert.equal(validMrz.frontToBackCrossMatchValid, true);

  // 7. Ghost Portrait SSIM Metric (SSIM >= 0.68 vs Photo Substitution)
  const patchOriginal = new Float32Array(64);
  const patchGhostMatch = new Float32Array(64);
  const patchSwappedFace = new Float32Array(64);
  for (let i = 0; i < 64; i++) {
    patchOriginal[i] = 60 + (i % 8) * 20;
    patchGhostMatch[i] = 62 + (i % 8) * 19; // High structural match
    patchSwappedFace[i] = 220 - (i % 8) * 22; // Inverted/different person
  }
  const ssimAuthentic = computeGhostPortraitSsimFromCard(patchOriginal, patchGhostMatch, 0.68);
  assert.equal(ssimAuthentic.passed, true);
  assert.equal(ssimAuthentic.ssimScore >= 0.68, true);

  const ssimTampered = computeGhostPortraitSsimFromCard(patchOriginal, patchSwappedFace, 0.68);
  assert.equal(ssimTampered.passed, false);
  assert.equal(ssimTampered.isPhotoSubstituted, true);

  // 8. 512-D ArcFace Biometric Matching
  const idEmbed = createDeterministic512DEmbedding(42, 0.02);
  const selfieSamePerson = createDeterministic512DEmbedding(42, 0.08);
  const selfieImpostor = createDeterministic512DEmbedding(999, 0.05);

  const bioMatch = computeArcFaceBiometricMatch(idEmbed, selfieSamePerson, 98.2);
  assert.equal(bioMatch.passed, true);
  assert.equal(bioMatch.cosineSimilarity > 0.85, true);

  const bioImpostor = computeArcFaceBiometricMatch(idEmbed, selfieImpostor, 98.2);
  assert.equal(bioImpostor.passed, false);
});

test('Robotics Spatial Understanding: normalizeBoxPercentages and getSpatialEntityColors handle 0-1000, 0-100, and 0-1 coordinates', async () => {
  const { normalizeBoxPercentages, getSpatialEntityColors } = await import(
    './edgeForensicsEngine.ts'
  );

  // Standard 0..1000 Gemini 2D box [ymin=100, xmin=200, ymax=300, xmax=700]
  const box1000 = normalizeBoxPercentages([100, 200, 300, 700]);
  assert.equal(box1000.topPct, 10);
  assert.equal(box1000.leftPct, 20);
  assert.equal(box1000.heightPct, 20);
  assert.equal(box1000.widthPct, 50);

  // Normalized 0..1 coordinates [0.15, 0.25, 0.45, 0.85]
  const boxUnit = normalizeBoxPercentages([0.15, 0.25, 0.45, 0.85]);
  assert.equal(Math.round(boxUnit.topPct), 15);
  assert.equal(Math.round(boxUnit.leftPct), 25);
  assert.equal(Math.round(boxUnit.heightPct), 30);
  assert.equal(Math.round(boxUnit.widthPct), 60);

  // Spatial entity color categories
  const portraitColors = getSpatialEntityColors('BIOMETRIC_PORTRAIT');
  const sealColors = getSpatialEntityColors('OFFICIAL_SEAL_STAMP');
  const mrzColors = getSpatialEntityColors('MACHINE_READABLE_ZONE');
  assert.equal(portraitColors.border.includes('rose'), true);
  assert.equal(sealColors.border.includes('purple'), true);
  assert.equal(mrzColors.border.includes('cyan'), true);
});

test('Document Suitability & Retake-Photo Evaluator: detects Blur, Full-Flash Washout, Low Resolution, and 180° Upside-Down Orientation', async () => {
  const {
    detectImageResolutionQuality,
    detectUpsideDownOrientation,
    evaluateDocumentSuitability,
  } = await import('./edgeForensicsEngine.ts');

  // 1. Resolution detector
  const lowRes = detectImageResolutionQuality(260, 160);
  assert.equal(lowRes.passed, false);
  const hdRes = detectImageResolutionQuality(720, 440);
  assert.equal(hdRes.passed, true);

  // 2. Upside-down 180° detector (dark blue header at bottom instead of top)
  const w = 40;
  const h = 30;
  const invertedPixels = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (y >= h - 6) {
        // Dark blue Republic of Iraq header at the bottom (inverted 180°)
        invertedPixels[idx] = 15;
        invertedPixels[idx + 1] = 40;
        invertedPixels[idx + 2] = 75;
        invertedPixels[idx + 3] = 255;
      } else {
        // Light card substrate at top + high-frequency edges so it's sharp
        const v = (x + y) % 2 === 0 ? 225 : 145;
        invertedPixels[idx] = v;
        invertedPixels[idx + 1] = v;
        invertedPixels[idx + 2] = v;
        invertedPixels[idx + 3] = 255;
      }
    }
  }
  const upsideDown = detectUpsideDownOrientation(invertedPixels, w, h);
  assert.equal(upsideDown.isUpsideDown, true);
  assert.equal(upsideDown.suggestedRotationDeg, 180);

  // 3. Full-Flash Washout + Low Resolution + Blur combined verdict
  const flashBleachedPixels = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < flashBleachedPixels.length; i += 4) {
    // Pure white flash over-exposure (V=255, S=0) across 100% of frame
    flashBleachedPixels[i] = 255;
    flashBleachedPixels[i + 1] = 255;
    flashBleachedPixels[i + 2] = 255;
    flashBleachedPixels[i + 3] = 255;
  }

  const unsuitableVerdict = evaluateDocumentSuitability({
    pixels: flashBleachedPixels,
    analysisWidth: w,
    analysisHeight: h,
    originalWidth: 260,
    originalHeight: 160,
    docType: 'IRQ_NATIONAL_ID',
  });

  assert.equal(unsuitableVerdict.isSuitable, false);
  assert.equal(unsuitableVerdict.requiresRetakePhoto, true);
  assert.equal(
    unsuitableVerdict.defects.some((d) => d.code === 'BLUR_DETECTED'),
    true
  );
  assert.equal(
    unsuitableVerdict.defects.some((d) => d.code === 'FULL_FLASH_WASHOUT'),
    true
  );
  assert.equal(
    unsuitableVerdict.defects.some((d) => d.code === 'LOW_RESOLUTION'),
    true
  );

  // 4. Vertical portrait photo with Iraqi National ID header on the RIGHT edge (like user photo 2026-09-24)
  // Must rotate 270° (-90° CCW) so the right edge moves to the TOP (upright), NOT 90° (which would put it upside-down at bottom)!
  const { detectOptimalCardRotation } = await import('./edgeForensicsEngine.ts');
  const vertW = 36;
  const vertH = 54; // portrait (height > width * 1.12)
  const rightHeaderPixels = new Uint8ClampedArray(vertW * vertH * 4);
  for (let y = 0; y < vertH; y++) {
    for (let x = 0; x < vertW; x++) {
      const idx = (y * vertW + x) * 4;
      // Outer wooden table margin (warm brown)
      if (x < 4 || x >= vertW - 4 || y < 5 || y >= vertH - 5) {
        rightHeaderPixels[idx] = 160;
        rightHeaderPixels[idx + 1] = 110;
        rightHeaderPixels[idx + 2] = 65;
        rightHeaderPixels[idx + 3] = 255;
      } else if (x >= vertW - 11) {
        // Right edge of card interior has Teal Republic of Iraq Header + Green Octagon + Gold Eagle
        if (y < vertH / 2) {
          // Teal / Cyan-Blue Header (B > R + 12, G > R + 8)
          rightHeaderPixels[idx] = 60;
          rightHeaderPixels[idx + 1] = 145;
          rightHeaderPixels[idx + 2] = 165;
        } else {
          // Green Octagon security patch (G > R + 18, G > B + 10)
          rightHeaderPixels[idx] = 45;
          rightHeaderPixels[idx + 1] = 155;
          rightHeaderPixels[idx + 2] = 95;
        }
        rightHeaderPixels[idx + 3] = 255;
      } else {
        // Left & center of card interior has neutral white/grey background & black text
        rightHeaderPixels[idx] = 220;
        rightHeaderPixels[idx + 1] = 220;
        rightHeaderPixels[idx + 2] = 222;
        rightHeaderPixels[idx + 3] = 255;
      }
    }
  }

  const rightHeaderRot = detectOptimalCardRotation(
    rightHeaderPixels,
    vertW,
    vertH,
    'IRQ_NATIONAL_ID'
  );
  assert.equal(rightHeaderRot, 270);
});

test('5-Layer Camera & Math Anti-Forgery Scanner catches Photoshop ELA splices, paper photocopies, and MRZ tampering', async () => {
  const { runCounterfeitAndForgeryScanner } = await import('./edgeForensicsEngine.ts');

  const w = 120;
  const h = 80;

  // 1. Authentic Original Iraqi National ID pixel buffer (navy/gold/emerald header + guilloche micro-waves)
  const authenticPixels = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (y < 16) {
        // Header band with gold eagle & emerald octagon security ink
        if (x > 45 && x < 65) {
          authenticPixels[idx] = 225;
          authenticPixels[idx + 1] = 175;
          authenticPixels[idx + 2] = 35;
        } else if (x > 90) {
          authenticPixels[idx] = 20;
          authenticPixels[idx + 1] = 165;
          authenticPixels[idx + 2] = 115;
        } else {
          authenticPixels[idx] = 15;
          authenticPixels[idx + 1] = 42;
          authenticPixels[idx + 2] = 75;
        }
      } else {
        // Polycarbonate guilloche wave texture (gentle sinusoidal modulation)
        const wave = ((x * 7 + y * 5) % 3 === 0) ? 14 : 0;
        authenticPixels[idx] = 218 - wave;
        authenticPixels[idx + 1] = 224 - wave;
        authenticPixels[idx + 2] = 232 - wave;
      }
      authenticPixels[idx + 3] = 255;
    }
  }

  const authenticReport = runCounterfeitAndForgeryScanner({
    pixels: authenticPixels,
    width: w,
    height: h,
    docType: 'IRQ_NATIONAL_ID',
  });
  assert.equal(authenticReport.isForgedOrCounterfeit, false);
  assert.equal(authenticReport.verdictStatus, 'AUTHENTIC_ORIGINAL');
  assert.equal(authenticReport.elaTamper.isTampered, false);
  assert.equal(authenticReport.securityLandmarks.passed, true);

  // 2. Photoshopped / Tampered ID (synthetic whiteout patch & crimson splice seam over text + portrait cutout)
  const photoshoppedPixels = new Uint8ClampedArray(authenticPixels);
  for (let y = 22; y < 52; y++) {
    for (let x = 38; x < 105; x++) {
      const idx = (y * w + x) * 4;
      if (y === 22 || y === 51 || x === 38 || x === 104) {
        // Crimson splice artifact border
        photoshoppedPixels[idx] = 239;
        photoshoppedPixels[idx + 1] = 45;
        photoshoppedPixels[idx + 2] = 45;
      } else {
        // Pure flat whiteout paste rectangle
        photoshoppedPixels[idx] = 255;
        photoshoppedPixels[idx + 1] = 255;
        photoshoppedPixels[idx + 2] = 255;
      }
    }
  }

  const forgedReport = runCounterfeitAndForgeryScanner({
    pixels: photoshoppedPixels,
    width: w,
    height: h,
    docType: 'IRQ_NATIONAL_ID',
  });
  assert.equal(forgedReport.isForgedOrCounterfeit, true);
  assert.equal(forgedReport.elaTamper.isTampered, true);
  assert.equal(forgedReport.elaTamper.tamperedZones.length >= 1, true);
  assert.equal(
    forgedReport.forgeryAlerts.some((a) => a.code === 'ELA_PHOTOSHOP_SPLICE'),
    true
  );

  // 3. Flat Bleached Paper Photocopy Fake (missing security landmarks & guilloche micro-grid)
  const photocopyPixels = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < photocopyPixels.length; i += 4) {
    photocopyPixels[i] = 252;
    photocopyPixels[i + 1] = 252;
    photocopyPixels[i + 2] = 253;
    photocopyPixels[i + 3] = 255;
  }

  const photocopyReport = runCounterfeitAndForgeryScanner({
    pixels: photocopyPixels,
    width: w,
    height: h,
    docType: 'IRQ_NATIONAL_ID',
  });
  assert.equal(photocopyReport.isForgedOrCounterfeit, true);
  assert.equal(photocopyReport.securityLandmarks.isPlainPaperPhotocopy, true);
  assert.equal(
    photocopyReport.forgeryAlerts.some((a) => a.code === 'PLAIN_PAPER_PHOTOCOPY'),
    true
  );
});

test('Strict Single-Language Enforcement: translations.en has zero Arabic characters and translations.ar has zero English characters', async () => {
  const {
    translations,
    sanitizeTextForLanguage,
    formatReferenceCode,
    formatMrzForDisplay,
    formatCryptoDigest,
  } = await import('./i18n.ts');

  const arabicScriptRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const latinScriptRegex = /[A-Za-z]/;

  for (const [key, val] of Object.entries(translations.en)) {
    assert.equal(
      arabicScriptRegex.test(val),
      false,
      `translations.en.${key} should not contain any Arabic characters, found: "${val}"`
    );
  }

  for (const [key, val] of Object.entries(translations.ar)) {
    assert.equal(
      latinScriptRegex.test(val),
      false,
      `translations.ar.${key} should not contain any Latin/English characters, found: "${val}"`
    );
  }

  // Verify sanitizeTextForLanguage strips opposite script
  const mixed = 'ID / الرقم الوطني: 198845123890 [غير موجود / MISSING]';
  const enOnly = sanitizeTextForLanguage(mixed, 'en');
  const arOnly = sanitizeTextForLanguage(mixed, 'ar');

  assert.equal(arabicScriptRegex.test(enOnly), false, `enOnly had Arabic: ${enOnly}`);
  assert.equal(latinScriptRegex.test(arOnly), false, `arOnly had Latin: ${arOnly}`);

  // Verify formatReferenceCode, formatMrzForDisplay, and formatCryptoDigest in Arabic have zero Latin letters
  assert.equal(latinScriptRegex.test(formatReferenceCode('ROSTRO-2026-9041', 'ar')), false);
  assert.equal(latinScriptRegex.test(formatReferenceCode('RES-BGD-992018', 'ar')), false);
  assert.equal(
    latinScriptRegex.test(formatMrzForDisplay('IDIRQ198749201841<<<<<<<<<<<<<', 'ar')),
    false
  );
  assert.equal(
    latinScriptRegex.test(formatCryptoDigest('HMAC-SHA256-CBI78-3a7bd3e2360a3d29', 'ar')),
    false
  );
});

test('Headless Camera Gate SDK: evaluateCameraFrameHeadless detects low light, light spot glare, face/room without card, hand motion, low resolution, blur, and auto-snap', async () => {
  const { evaluateCameraFrameHeadless } = await import('./rostroHeadlessSdk.ts');
  const w = 64;
  const h = 40;

  // 0. Dark low-light buffer -> LOW_LIGHT
  const darkPixels = new Uint8ClampedArray(w * h * 4).fill(18);
  const resDark = evaluateCameraFrameHeadless(darkPixels, w, h, 0, true, 1280, 720);
  assert.equal(resDark.status, 'LOW_LIGHT');
  assert.equal(resDark.readyToSnap, false);

  // 1. Uniform medium-brightness blurry buffer -> TOO_BLURRY
  const blurry = new Uint8ClampedArray(w * h * 4).fill(120);
  const resBlur = evaluateCameraFrameHeadless(blurry, w, h, 0, true, 1280, 720);
  assert.equal(resBlur.status, 'TOO_BLURRY');
  assert.equal(resBlur.readyToSnap, false);

  // 2. Concentrated light spot / flash reflection -> LIGHT_SPOT_GLARE with hotspotBox
  const glareBuf = new Uint8ClampedArray(w * h * 4).fill(115);
  for (let y = 12; y < 28; y++) {
    for (let x = 16; x < 36; x++) {
      const idx = (y * w + x) * 4;
      glareBuf[idx] = 255;
      glareBuf[idx + 1] = 255;
      glareBuf[idx + 2] = 255;
      glareBuf[idx + 3] = 255;
    }
  }
  const resGlare = evaluateCameraFrameHeadless(glareBuf, w, h, 0, true, 1280, 720);
  assert.equal(resGlare.status, 'LIGHT_SPOT_GLARE');
  assert.equal(resGlare.glareHotspotBox !== null, true);

  // 2b. Simulated webcam face + warm indoor room background (sharp edges in room, no white card substrate) -> WRONG_OR_NO_DOCUMENT
  const faceRoomBuf = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const isEdge = (x + y) % 3 === 0;
      faceRoomBuf[idx] = isEdge ? 165 : 85; // warm R
      faceRoomBuf[idx + 1] = isEdge ? 120 : 65; // warm G
      faceRoomBuf[idx + 2] = isEdge ? 95 : 50; // warm B
      faceRoomBuf[idx + 3] = 255;
    }
  }
  const resFaceRoom = evaluateCameraFrameHeadless(faceRoomBuf, w, h, 5, true, 1280, 720);
  assert.equal(resFaceRoom.status, 'WRONG_OR_NO_DOCUMENT');
  assert.equal(resFaceRoom.readyToSnap, false);
  assert.equal(resFaceRoom.steadyFramesCount, 0);

  // 3. Sharp textured non-glare card buffer -> READY_AUTO_SNAP & 100% progress after 10 steady frames
  const sharp = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const val = (x % 4 < 2) !== (y % 4 < 2) ? 210 : 40;
      sharp[idx] = val;
      sharp[idx + 1] = val;
      sharp[idx + 2] = val;
      sharp[idx + 3] = 255;
    }
  }
  // If user's hand is moving (frameMotionDiff = 9.2 > 5.5), it blocks snap and resets steadyFramesCount to 0
  const resMoving = evaluateCameraFrameHeadless(sharp, w, h, 8, true, 1280, 720, 9.2);
  assert.equal(resMoving.status, 'HOLD_STILL');
  assert.equal(resMoving.readyToSnap, false);
  assert.equal(resMoving.steadyFramesCount, 0);

  // When held still (frameMotionDiff = 1.0 <= 5.5) at frame 9 -> reaches 10/10 (100%)
  const resReady = evaluateCameraFrameHeadless(sharp, w, h, 9, true, 1280, 720, 1.0);
  assert.equal(resReady.status, 'READY_AUTO_SNAP');
  assert.equal(resReady.readyToSnap, true);
  assert.equal(resReady.autoSnapProgressPct, 100);
  assert.equal(resReady.steadyFramesCount, 10);

  // 4. Low resolution stream check -> LOW_RESOLUTION
  const resLowRes = evaluateCameraFrameHeadless(sharp, w, h, 0, true, 320, 200);
  assert.equal(resLowRes.status, 'LOW_RESOLUTION');
  assert.equal(resLowRes.readyToSnap, false);
});

test('validateUploadedCardPair and formatBilingualName handle Iraqi National ID Front (derived 4-digit birth year) + Back (full YYYY-MM-DD DOB) without false conflict and output bilingual Arabic+English names', async () => {
  const { validateUploadedCardPair } = await import('./kycEngine.ts');
  const { formatBilingualName } = await import('./i18n.ts');

  // 1. Validate Front + Back of Iraqi Unified National Card (ID: 200646431589, Holder: Ayham Shamil Younis)
  // Front has 4-digit birth year derived from National ID ("2006 (مستنتج من الرقم الوطني / Derived from National ID)")
  // Back has full Date of Birth ("2006-06-21") and Issue Date ("2023-10-25")
  const pairRes = validateUploadedCardPair(
    {
      slotIndex: 1,
      detectedSide: 'FRONT',
      documentType: 'IRQ_NATIONAL_ID',
      fullNameEn: 'Ayham Shamil Younis Al-Qaragholi',
      fullNameAr: 'أيهم شامل يونس آل قره غولي',
      docNumber: '200646431589',
      dob: '2006 (مستنتج من الرقم الوطني / Derived from National ID)',
      issueDate: '[غير موجود / MISSING]',
      expiryDate: '[غير موجود / MISSING]',
      governorateEn: 'Baghdad',
      governorateAr: 'بغداد',
      address: '[غير موجود / MISSING]',
      familyNumber: 'AA9792984',
      mrzLine1: '[غير موجود على الوثيقة / NO MRZ ON CARD]',
      mrzLine2: '[غير موجود على الوثيقة / NO MRZ ON CARD]',
      ocrConfidence: 98,
      boundingBoxes: [],
      missingExpectedFields: [],
      motherName: 'Israa Muhammad · إسراء محمد',
      bloodType: 'O+',
    },
    {
      slotIndex: 2,
      detectedSide: 'BACK',
      documentType: 'IRQ_NATIONAL_ID',
      fullNameEn: 'AYHAM SHAMIL YOUNIS',
      fullNameAr: '[غير موجود / MISSING]',
      docNumber: '[غير موجود / MISSING]',
      dob: '2006-06-21',
      issueDate: '2023-10-25',
      expiryDate: '2033-10-24',
      governorateEn: 'Baghdad',
      governorateAr: 'بغداد',
      address: '[غير موجود / MISSING]',
      familyNumber: '200105382001251149',
      mrzLine1: 'I<IRQ001988451<<<<<<<<<<<<<<<<',
      mrzLine2: '0606217M3310248IRQ<<<<<<<<<<<4',
      ocrConfidence: 97,
      boundingBoxes: [],
      missingExpectedFields: [],
    }
  );

  assert.equal(pairRes.hasCrossCardConflict, false);
  assert.equal(pairRes.hasWrongSideConflict, false);
  assert.equal(pairRes.effectiveSide, 'BOTH');
  assert.equal(pairRes.isValidPair, true);
  assert.equal(pairRes.issues.length, 0);

  // 2. Verify formatBilingualName always outputs BOTH English and Arabic for Mother, Grandfather, and Quad names
  assert.equal(formatBilingualName('ISRAA MUHAMMAD'), 'Israa Muhammad · إسراء محمد');
  assert.equal(formatBilingualName('YUNIS'), 'Yunis · يونس');
  assert.equal(formatBilingualName('أيهم'), 'Ayham · أيهم');
  assert.equal(formatBilingualName('شامل'), 'Shamil · شامل');
  assert.equal(formatBilingualName('آل قره غولي'), 'Al-Qaragholi · آل قره غولي');
});

test('verifyIraqiAccountPacket verifies Self, Father Lineage, Grandfather Lineage, and catches Unrelated Household Mismatch on Iraqi Residence Card (بطاقة السكن)', async () => {
  const { verifyIraqiAccountPacket, evaluateApplicantWithRules } = await import('./kycEngine.ts');
  const { initialApplicants, initialAutomationConfig } = await import('./seedData.ts');

  const applicantDoc = {
    ...initialApplicants[0].documents[0],
    extractedFields: {
      ...initialApplicants[0].documents[0].extractedFields,
      fullName: 'ABDULLAH TARIQ KAREEM AL-DULAIMI',
      fullNameArabic: 'عبدالله طارق كريم الدليمي',
      firstName: 'عبدالله',
      fatherName: 'طارق',
      grandfatherName: 'كريم',
      surname: 'الدليمي',
      address: 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
    },
  };

  // 1. Direct Holder Match (Applicant is Head of Household)
  const selfResidenceDoc = {
    ...initialApplicants[0].documents[1],
    extractedFields: {
      ...initialApplicants[0].documents[1].extractedFields,
      fullName: 'ABDULLAH TARIQ KAREEM AL-DULAIMI',
      fullNameArabic: 'عبدالله طارق كريم الدليمي',
      address: 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
    },
  };
  const selfRes = verifyIraqiAccountPacket(applicantDoc, selfResidenceDoc);
  assert.equal(selfRes.packetStatus, 'COMPLETE_VERIFIED_SELF');
  assert.equal(selfRes.isLineageVerified, true);
  assert.equal(selfRes.relationshipType, 'SELF');
  assert.equal(selfRes.structuredAddress.mahalla, '609');
  assert.equal(selfRes.structuredAddress.zukak, '14');
  assert.equal(selfRes.structuredAddress.dar, '22');

  // 2. Father's Residence Card (Father Tariq Kareem Qasim Al-Dulaimi is Head of Household رب الأسرة)
  const fatherResidenceDoc = {
    ...initialApplicants[0].documents[1],
    docNumber: 'RES-BGD-771042',
    extractedFields: {
      ...initialApplicants[0].documents[1].extractedFields,
      fullName: 'TARIQ KAREEM QASIM AL-DULAIMI',
      fullNameArabic: 'طارق كريم قاسم الدليمي',
      firstName: 'طارق',
      fatherName: 'كريم',
      grandfatherName: 'قاسم',
      surname: 'الدليمي',
      address: 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
    },
  };
  const fatherRes = verifyIraqiAccountPacket(applicantDoc, fatherResidenceDoc);
  assert.equal(fatherRes.packetStatus, 'COMPLETE_VERIFIED_FATHER_LINEAGE');
  assert.equal(fatherRes.isLineageVerified, true);
  assert.equal(fatherRes.relationshipType, 'FATHER');
  assert.equal(fatherRes.lineageConfidence >= 95, true);

  // 3. Unrelated Stranger's Residence Card -> REJECTED_HOUSEHOLD_MISMATCH + Stage 9 AUTO_REJECTED
  const strangerResidenceDoc = {
    ...initialApplicants[0].documents[1],
    docNumber: 'RES-BSR-00912',
    extractedFields: {
      ...initialApplicants[0].documents[1].extractedFields,
      fullName: 'MUSTAFA HASSAN JABBAR AL-MALIKI',
      fullNameArabic: 'مصطفى حسن جبار المالكي',
      firstName: 'مصطفى',
      fatherName: 'حسن',
      grandfatherName: 'جبار',
      surname: 'المالكي',
      address: 'Mahalla 102, Zukak 5, Dar 8, Basra',
    },
  };
  const mismatchRes = verifyIraqiAccountPacket(applicantDoc, strangerResidenceDoc);
  assert.equal(mismatchRes.packetStatus, 'REJECTED_HOUSEHOLD_MISMATCH');
  assert.equal(mismatchRes.isLineageVerified, false);
  assert.equal(mismatchRes.relationshipType, 'UNLINKED_MISMATCH');

  const stage9Mismatch = evaluateApplicantWithRules(
    {
      ...initialApplicants[0],
      documents: [applicantDoc, strangerResidenceDoc],
    },
    initialAutomationConfig
  );
  assert.equal(stage9Mismatch.stage9Outcome, 'AUTO_REJECTED');
  assert.equal(stage9Mismatch.nextStatus, 'rejected');
});

test('analyzeDocumentAntiSpoofing evaluates 5 forensic vectors and triggers Stage 9 AUTO_REJECTED on Screen Replay, Paper Photocopy, and Digital Tamper', async () => {
  const { analyzeDocumentAntiSpoofing, evaluateApplicantWithRules } = await import('./kycEngine.ts');
  const { initialApplicants, initialAutomationConfig } = await import('./seedData.ts');

  const cleanDoc = initialApplicants[0].documents[0];

  // 1. Authentic Physical Card
  const authReport = analyzeDocumentAntiSpoofing(cleanDoc, 'AUTHENTIC_PHYSICAL');
  assert.equal(authReport.overallVerdict, 'AUTHENTIC_PHYSICAL_CARD');
  assert.equal(authReport.authenticityScore >= 90, true);
  assert.equal(authReport.vectors.length, 5);
  assert.equal(authReport.vectors.every((v) => v.status === 'PASS'), true);

  // 2. Screen Replay / Moiré Attack
  const moireReport = analyzeDocumentAntiSpoofing(cleanDoc, 'SCREEN_REPLAY_MOIRE');
  assert.equal(moireReport.overallVerdict, 'SPOOF_OR_FORGERY_REJECTED');
  assert.equal(moireReport.authenticityScore < 30, true);
  assert.equal(moireReport.vectors[0].status, 'FAIL');

  // 3. Paper Photocopy Attack
  const paperReport = analyzeDocumentAntiSpoofing(cleanDoc, 'PAPER_PHOTOCOPY');
  assert.equal(paperReport.overallVerdict, 'SPOOF_OR_FORGERY_REJECTED');
  assert.equal(paperReport.vectors[1].status, 'FAIL');

  // 4. Digital Font & Photo Tamper Attack + Stage 9 Auto-Rejection
  const tamperDoc = {
    ...cleanDoc,
    antiSpoofPreset: 'DIGITAL_FONT_AND_PHOTO_TAMPER' as const,
  };
  const tamperReport = analyzeDocumentAntiSpoofing(tamperDoc);
  assert.equal(tamperReport.overallVerdict, 'SPOOF_OR_FORGERY_REJECTED');

  const stage9Spoof = evaluateApplicantWithRules(
    {
      ...initialApplicants[0],
      documents: [tamperDoc, initialApplicants[0].documents[1]],
    },
    initialAutomationConfig
  );
  assert.equal(stage9Spoof.stage9Outcome, 'AUTO_REJECTED');
  assert.equal(stage9Spoof.nextStatus, 'rejected');
});




