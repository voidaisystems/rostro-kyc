/**
 * Copyright (c) 2026 Rostro Compliance Systems (مشروع روسترو للامتثال).
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 * @file src/tests/foreign_id_compliance.test.ts
 * @module @rostro/tests/foreign-id-compliance
 * @description
 * Unit tests for Foreign ID detection and strict non-acceptance protocol,
 * enforcing immediate reversion to HUMAN_REVIEW for non-Iraqi documents.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  inferForeignDocumentMetadata,
  evaluateForeignIdComplianceProtocol,
  evaluateApplicantWithRules,
  isSpecimenZeroIdNumber,
  type KYCApplicant,
  type AutomationConfig,
} from '../utils/kycEngine.ts';

describe('Foreign ID Non-Acceptance & Revert to Human Review Suite', () => {
  it('correctly detects UAE Emirates ID as foreign document', () => {
    const res = inferForeignDocumentMetadata({
      docNumber: '784-1985-1234567-1',
      issuingCountryEn: 'United Arab Emirates',
      issuingCountryCode: 'ARE',
    });
    assert.equal(res.isForeignDocument, true);
    assert.equal(res.issuingCountryCode, 'ARE');
    assert.equal(res.resolvedDocType, 'FOREIGN_NATIONAL_ID');
  });

  it('correctly detects UAE Specimen Zero ID template', () => {
    assert.equal(isSpecimenZeroIdNumber('784-0000-0000000-0'), true);
    assert.equal(isSpecimenZeroIdNumber('784000000000000'), true);
    assert.equal(isSpecimenZeroIdNumber('198845123890'), false); // authentic Iraqi ID
  });

  it('keeps authentic Iraqi National ID as Iraqi (acceptable)', () => {
    const res = inferForeignDocumentMetadata({
      documentType: 'IRQ_NATIONAL_ID',
      docNumber: '198845123890',
      issuingCountryCode: 'IRQ',
      issuingCountryEn: 'Iraq',
    });
    assert.equal(res.isForeignDocument, false);
    assert.equal(res.issuingCountryCode, 'IRQ');
    assert.equal(res.resolvedDocType, 'IRQ_NATIONAL_ID');
  });

  it('detects any other foreign country (USA, Jordan, Turkey, etc.) as foreign', () => {
    const usaRes = inferForeignDocumentMetadata({
      docNumber: 'D12345678',
      issuingCountryCode: 'USA',
      issuingCountryEn: 'United States',
    });
    assert.equal(usaRes.isForeignDocument, true);

    const jorRes = inferForeignDocumentMetadata({
      docNumber: '9881023456',
      issuingCountryCode: 'JOR',
      issuingCountryEn: 'Jordan',
    });
    assert.equal(jorRes.isForeignDocument, true);

    const turRes = inferForeignDocumentMetadata({
      docNumber: '12345678901',
      issuingCountryCode: 'TUR',
      issuingCountryEn: 'Turkey',
    });
    assert.equal(turRes.isForeignDocument, true);
  });

  it('enforces evaluateForeignIdComplianceProtocol returning HUMAN_REVIEW and non-acceptable headline', () => {
    const assessment = evaluateForeignIdComplianceProtocol({
      docType: 'FOREIGN_NATIONAL_ID',
      docNumber: '784-1985-1234567-1',
      issuingCountryCode: 'ARE',
      issuingCountryEn: 'United Arab Emirates',
      issuingCountryAr: 'الإمارات العربية المتحدة',
      uploadedSide: 'BOTH',
    });

    assert.equal(assessment.isForeignDocument, true);
    assert.equal(assessment.recommendedStage9Outcome, 'HUMAN_REVIEW');
    assert.match(assessment.headlineEn, /Foreign Document Detected/);
    assert.match(assessment.headlineEn, /Reverted to Human Review/);
    assert.match(assessment.summaryEn, /CANNOT and WILL NEVER be accepted automatically/);
    assert.match(assessment.summaryEn, /Only official Iraqi documents are acceptable/);
  });

  it('strictly reverts any applicant with a foreign document to HUMAN_REVIEW in evaluateApplicantWithRules', () => {
    const defaultConfig: AutomationConfig = {
      autoApproveMaxRiskScore: 30,
      minOcrConfidence: 85,
      minBiometricScore: 85,
      autoRejectSanctionsHit: true,
      requireUtilityBillForHighRisk: false,
      strictExpiryCheck: true,
    };

    const foreignApplicant: KYCApplicant = {
      id: 'app-foreign-test',
      referenceCode: 'ROSTRO-2026-9999',
      fullNameEn: 'John Doe',
      fullNameAr: 'جون دو',
      normalizedEntityName: 'جون دو',
      email: 'john.doe@emirates.ae',
      phone: '+971 50 123 4567',
      countryCode: 'ARE',
      countryEn: 'United Arab Emirates',
      countryAr: 'الإمارات العربية المتحدة',
      governorateEn: 'United Arab Emirates',
      governorateAr: 'الإمارات العربية المتحدة',
      entityType: 'individual',
      submittedAt: '2026-10-17 08:00 UTC',
      updatedAt: '2026-10-17 08:00 UTC',
      status: 'pending',
      stage9Outcome: 'HUMAN_REVIEW',
      riskScore: 20, // very low risk score, would normally auto-approve if Iraqi
      riskTier: 'low',
      sanctionsMatch: false,
      pepMatch: false,
      adverseMediaMatch: false,
      biometricMatchScore: 99,
      assignedReviewerEn: 'Senior Compliance Officer',
      assignedReviewerAr: 'مسؤول الامتثال الأقدم',
      nineSignals: {
        classification_confidence: 1.0,
        extraction_confidence: 0.99,
        normalization_quality: 0.98,
        format_validity: 0.99,
        document_consistency: 0.99,
        cross_document_consistency: 0.99,
        authenticity_risk_indicators: 0.98,
        image_quality: 0.98,
        external_verification_status: 'EXTERNAL_VERIFICATION_UNAVAILABLE',
      },
      documents: [
        {
          id: 'doc-uae-1',
          type: 'FOREIGN_NATIONAL_ID',
          categoryCode: 'C_TRAVEL_IMMIGRATION',
          supportStatus: 'REQUIRES_HUMAN_REVIEW',
          side: 'BOTH',
          detectedLanguages: ['ar', 'en'],
          titleEn: 'UAE Resident Identity Card',
          titleAr: 'بطاقة هوية مقيم — الإمارات العربية المتحدة',
          docNumber: '784-1985-1234567-1',
          issueDate: '2021-05-15',
          expiryDate: '2031-05-15',
          issuingAuthorityEn: 'ICP UAE',
          issuingAuthorityAr: 'الهيئة الاتحادية للهوية والجنسية',
          issuingCountryCode: 'ARE',
          issuingCountryEn: 'United Arab Emirates',
          issuingCountryAr: 'الإمارات العربية المتحدة',
          isForeignDocument: true,
          ocrConfidence: 99,
          fileSizeKb: 1200,
          sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          status: 'pending',
          extractedFields: {
            fullName: 'John Doe',
            dob: '1985-05-15',
            nationality: 'United States',
          },
        },
      ],
      auditTrail: [],
    };

    const evalResult = evaluateApplicantWithRules(foreignApplicant, defaultConfig);

    // CRITICAL INVARIANT: Foreign document must NEVER be AUTO_APPROVED!
    assert.notEqual(evalResult.stage9Outcome, 'AUTO_APPROVED');
    assert.equal(evalResult.stage9Outcome, 'HUMAN_REVIEW');
    assert.equal(evalResult.nextStatus, 'flagged');
    assert.match(evalResult.reasonEn, /Foreign document detected/);
    assert.match(evalResult.reasonEn, /ONLY official Iraqi documents are acceptable/);
  });
});
