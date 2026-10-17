import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskTier,
  evaluateApplicantWithRules,
  runAutomatedBatchWorkflow,
  filterAndSortApplicants,
  computeKpiMetrics,
  type KYCApplicant,
  type AutomationConfig,
} from './kycEngine.ts';

const defaultConfig: AutomationConfig = {
  autoApproveMaxRiskScore: 25,
  minOcrConfidence: 90,
  minBiometricScore: 88,
  autoRejectSanctionsHit: true,
  requireUtilityBillForHighRisk: true,
  strictExpiryCheck: true,
};

const sampleApplicants: KYCApplicant[] = [
  {
    id: 'app-1',
    referenceCode: 'KYC-2026-8841',
    fullNameEn: 'Tariq Al-Mansoor',
    fullNameAr: 'طارق المنصور',
    email: 'tariq.mansoor@emirates-ventures.ae',
    phone: '+971 50 492 1840',
    countryCode: 'AE',
    countryEn: 'United Arab Emirates',
    countryAr: 'الإمارات العربية المتحدة',
    entityType: 'individual',
    submittedAt: '2026-10-17 07:15 UTC',
    updatedAt: '2026-10-17 07:15 UTC',
    status: 'pending',
    riskScore: 14,
    riskTier: 'low',
    sanctionsMatch: false,
    pepMatch: false,
    adverseMediaMatch: false,
    biometricMatchScore: 98,
    assignedReviewerEn: 'Nadia Al-Khaled',
    assignedReviewerAr: 'نادية الخالد',
    documents: [
      {
        id: 'doc-101',
        type: 'passport',
        titleEn: 'UAE Biometric Passport',
        titleAr: 'جواز سفر إماراتي إلكتروني',
        docNumber: 'N84920184',
        issueDate: '2022-04-12',
        expiryDate: '2032-04-11',
        issuingCountryEn: 'United Arab Emirates',
        issuingCountryAr: 'الإمارات العربية المتحدة',
        ocrConfidence: 97,
        livenessScore: 99,
        fileSizeKb: 1420,
        sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        status: 'pending',
        extractedFields: {
          fullName: 'TARIQ AL-MANSOOR',
          dob: '1988-11-23',
          nationality: 'ARE',
          mrzLine1: 'P<AREALMANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<<<',
          mrzLine2: 'N849201844ARE8811234M3204115<<<<<<<<<<<<<<04',
        },
      },
    ],
    auditTrail: [],
  },
  {
    id: 'app-2',
    referenceCode: 'KYC-2026-8842',
    fullNameEn: 'Viktor Kovalenko',
    fullNameAr: 'فيكتور كوفالينكو',
    email: 'v.kovalenko@baltic-trade.io',
    phone: '+372 55 910 221',
    countryCode: 'EE',
    countryEn: 'Estonia',
    countryAr: 'إستونيا',
    entityType: 'corporate',
    submittedAt: '2026-10-17 06:50 UTC',
    updatedAt: '2026-10-17 06:50 UTC',
    status: 'pending',
    riskScore: 84,
    riskTier: 'high',
    sanctionsMatch: true,
    pepMatch: false,
    adverseMediaMatch: true,
    biometricMatchScore: 76,
    assignedReviewerEn: 'Marcus Vance',
    assignedReviewerAr: 'ماركوس فانس',
    documents: [
      {
        id: 'doc-102',
        type: 'passport',
        titleEn: 'Estonian Passport',
        titleAr: 'جواز سفر إستوني',
        docNumber: 'K0928172',
        issueDate: '2019-01-10',
        expiryDate: '2029-01-09',
        issuingCountryEn: 'Estonia',
        issuingCountryAr: 'إستونيا',
        ocrConfidence: 82,
        fileSizeKb: 1850,
        sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        status: 'pending',
        extractedFields: {
          fullName: 'VIKTOR KOVALENKO',
          dob: '1975-03-14',
          nationality: 'EST',
        },
      },
    ],
    auditTrail: [],
  },
];

test('calculateRiskTier classifies low, medium, and high thresholds accurately', () => {
  assert.equal(calculateRiskTier(12), 'low');
  assert.equal(calculateRiskTier(28), 'low');
  assert.equal(calculateRiskTier(29), 'medium');
  assert.equal(calculateRiskTier(64), 'medium');
  assert.equal(calculateRiskTier(65), 'high');
});

test('evaluateApplicantWithRules fast-tracks low-risk high-OCR applicants to approved', () => {
  const result = evaluateApplicantWithRules(sampleApplicants[0], defaultConfig);
  assert.equal(result.nextStatus, 'approved');
  assert.ok(result.reasonEn.includes('Auto-approved'));
});

test('evaluateApplicantWithRules auto-rejects applicants with sanctions matches', () => {
  const result = evaluateApplicantWithRules(sampleApplicants[1], defaultConfig);
  assert.equal(result.nextStatus, 'rejected');
  assert.ok(result.reasonEn.includes('Sanctions'));
});

test('runAutomatedBatchWorkflow processes pending queue and updates statuses and audit logs', () => {
  const { updatedApplicants, summary } = runAutomatedBatchWorkflow(sampleApplicants, defaultConfig);
  assert.equal(summary.processedCount, 2);
  assert.deepEqual(summary.autoApprovedIds, ['app-1']);
  assert.deepEqual(summary.autoRejectedIds, ['app-2']);
  assert.equal(updatedApplicants[0].status, 'approved');
  assert.equal(updatedApplicants[1].status, 'rejected');
  assert.equal(updatedApplicants[0].auditTrail.length, 1);
});

test('filterAndSortApplicants supports bilingual Arabic and English search and risk filtering', () => {
  const arabicSearch = filterAndSortApplicants(sampleApplicants, {
    statusFilter: 'all',
    riskFilter: 'all',
    docTypeFilter: 'all',
    searchQuery: 'طارق',
    sortBy: 'riskScore',
    sortOrder: 'asc',
  });
  assert.equal(arabicSearch.length, 1);
  assert.equal(arabicSearch[0].id, 'app-1');

  const highRiskOnly = filterAndSortApplicants(sampleApplicants, {
    statusFilter: 'all',
    riskFilter: 'high',
    docTypeFilter: 'all',
    searchQuery: '',
    sortBy: 'riskScore',
    sortOrder: 'desc',
  });
  assert.equal(highRiskOnly.length, 1);
  assert.equal(highRiskOnly[0].id, 'app-2');
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
