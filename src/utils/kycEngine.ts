/**
 * Copyright (c) 2026 Rostro Compliance Systems (مشروع روسترو للامتثال).
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 * @file src/utils/kycEngine.ts
 * @module @rostro/core/kycEngine
 * @description
 * Deterministic Core Risk, Checksum, and Multi-Script Normalization Engine for Project Rostro.
 *
 * Implements:
 * - Universal Iraqi Document Taxonomy (Categories A–H, 44 registered document types).
 * - 9 Independently Inspectable Verification Signals (`NineVerificationSignals`).
 * - ICAO Doc 9303 Modulo-10 `[7, 3, 1]` check digit verification (`computeIcaoCheckDigit`).
 * - Dual-Side Physical Card Policy (`getDocumentSideRequirement`, `evaluateDualSideSatisfaction`).
 * - Multi-Script Arabic / Kurdish Sorani / English normalization (`normalizeMultiScriptText`).
 * - Zero-Hallucination Missing/Unclear Field Auditor (`auditMissingExpectedFields`).
 */

export type Language = 'en' | 'ar';
export type VerificationStatus = 'approved' | 'pending' | 'flagged' | 'rejected';
export type PipelineStage9Outcome =
  | 'AUTO_APPROVED'
  | 'HUMAN_REVIEW'
  | 'AUTO_REJECTED'
  | 'INSUFFICIENT_DATA';
export type RiskTier = 'low' | 'medium' | 'high';

export type DocumentCategoryCode =
  | 'A_IDENTITY_CIVIL'
  | 'B_RESIDENCE_ADDRESS'
  | 'C_TRAVEL_IMMIGRATION'
  | 'D_DRIVING_VEHICLE'
  | 'E_BUSINESS_MERCHANT'
  | 'F_EDUCATION_EMPLOYMENT'
  | 'G_FINANCIAL_EVIDENCE'
  | 'H_LEGAL_AUTHORIZATION'
  | 'UNKNOWN_CATEGORY';

export type DocumentSupportStatus =
  | 'TESTED'
  | 'SUPPORTED_PARTIAL'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'REQUIRES_EXTERNAL_VERIFICATION'
  | 'REGISTERED_UNIMPLEMENTED'
  | 'UNKNOWN_DOCUMENT';

export type DocumentType =
  | 'IRQ_NATIONAL_ID'
  | 'IRQ_CIVIL_STATUS_ID'
  | 'IRQ_NATIONALITY_CERT'
  | 'IRQ_RESIDENCE_CARD'
  | 'IRQ_RATION_CARD'
  | 'IRQ_PASSPORT'
  | 'FOREIGN_PASSPORT'
  | 'IRQ_DRIVING_LICENSE'
  | 'IRQ_CHAMBER_OF_COMMERCE'
  | 'IRQ_COMPANY_REG'
  | 'IRQ_TAX_ID_CARD'
  | 'IRQ_POWER_OF_ATTORNEY'
  | 'UNKNOWN_DOCUMENT';

export interface NineVerificationSignals {
  image_quality: number; // 0.00 - 1.00
  classification_confidence: number; // 0.00 - 1.00
  extraction_confidence: number; // 0.00 - 1.00
  normalization_quality: number; // 0.00 - 1.00
  format_validity: number; // 0.00 - 1.00
  document_consistency: number; // 0.00 - 1.00
  cross_document_consistency: number; // 0.00 - 1.00
  authenticity_risk_indicators: number; // 0.00 - 1.00 (1.00 = clean / zero tampering risk)
  external_verification_status: 'EXTERNAL_VERIFICATION_UNAVAILABLE';
}

export interface OcrBoundingBox {
  field: string;
  label: string;
  value?: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  confidence: number;
}

export interface MissingExpectedField {
  fieldKey: string;
  labelEn: string;
  labelAr: string;
  reasonEn: string;
  reasonAr: string;
  severity: 'CRITICAL' | 'WARNING';
}

export interface KYCDocument {
  id: string;
  type: DocumentType;
  categoryCode: DocumentCategoryCode;
  supportStatus: DocumentSupportStatus;
  side: 'FRONT' | 'BACK' | 'BOTH';
  detectedLanguages: ('ar' | 'en' | 'ku')[];
  titleEn: string;
  titleAr: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthorityEn: string;
  issuingAuthorityAr: string;
  issuingCountryEn: string;
  issuingCountryAr: string;
  ocrConfidence: number; // 0-100
  livenessScore?: number; // 0-100
  hasGlare?: boolean;
  hasBlur?: boolean;
  mrzModulo10Valid?: boolean;
  fileSizeKb: number;
  sha256Hash: string;
  status: VerificationStatus;
  extractedFields: {
    fullName: string;
    normalizedName?: string;
    dob: string;
    nationality: string;
    mrzLine1?: string;
    mrzLine2?: string;
    mrzLine3?: string;
    address?: string;
    familyNumber?: string;
  };
  customPreviewUrl?: string;
  customBackPreviewUrl?: string;
  boundingBoxes?: OcrBoundingBox[];
  backBoundingBoxes?: OcrBoundingBox[];
  missingExpectedFields?: MissingExpectedField[];
  engineMode?: 'gemini-vlm-live' | 'deterministic-fallback';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEn: string;
  actorAr: string;
  actionEn: string;
  actionAr: string;
  noteEn?: string;
  noteAr?: string;
  cbiLaw78HmacReceipt?: string;
}

export interface KYCApplicant {
  id: string;
  referenceCode: string;
  fullNameEn: string;
  fullNameAr: string;
  normalizedEntityName: string;
  email: string;
  phone: string;
  countryCode: string;
  countryEn: string;
  countryAr: string;
  governorateEn: string;
  governorateAr: string;
  entityType: 'individual' | 'corporate';
  submittedAt: string;
  updatedAt: string;
  status: VerificationStatus;
  stage9Outcome: PipelineStage9Outcome;
  riskScore: number; // 0-100 (lower is safer)
  riskTier: RiskTier;
  sanctionsMatch: boolean;
  pepMatch: boolean;
  adverseMediaMatch: boolean;
  biometricMatchScore: number; // 0-100
  assignedReviewerEn: string;
  assignedReviewerAr: string;
  nineSignals: NineVerificationSignals;
  documents: KYCDocument[];
  auditTrail: AuditEvent[];
}

export interface AutomationConfig {
  autoApproveMaxRiskScore: number; // e.g., 25
  minOcrConfidence: number; // e.g., 90
  minBiometricScore: number; // e.g., 88
  autoRejectSanctionsHit: boolean;
  requireUtilityBillForHighRisk: boolean;
  strictExpiryCheck: boolean;
}

export interface BatchRunResult {
  processedCount: number;
  autoApprovedIds: string[];
  autoFlaggedIds: string[];
  autoRejectedIds: string[];
  unchangedIds: string[];
}

/**
 * Multi-Script Normalizer (Arabic, Kurdish Sorani, English)
 * Converts Eastern Arabic-Indic (٠-٩) and Persian/Kurdish-Indic (۰-۹) digits to ASCII (0-9),
 * unifies Alef/Yeh/Kaf/Teh-Marbuta/Kurdish-Heh/Reh/Lam variants, and normalizes compound Arabic names.
 */
export function normalizeMultiScriptText(input: string): string {
  if (!input) return '';
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const persianIndic = '۰۱۲۳۴۵۶۷۸۹';

  let out = input;
  for (let i = 0; i < 10; i++) {
    out = out.replaceAll(arabicIndic[i], String(i));
    out = out.replaceAll(persianIndic[i], String(i));
  }

  // Strip tashkeel / diacritics & tatweel
  out = out.replace(/[\u064B-\u065F\u0670\u0640]/g, '');

  // Unify Arabic & Kurdish Sorani characters
  out = out
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ک/g, 'ك')
    .replace(/[یىێ]/g, 'ي')
    .replace(/[ەة]/g, 'ه')
    .replace(/ڕ/g, 'ر')
    .replace(/ڵ/g, 'ل')
    .replace(/ڤ/g, 'ف');

  // Unify compound Arabic names (عبد الله -> عبدالله, ابو بكر -> ابوبكر)
  out = out
    .replace(/عبد\s+ال/g, 'عبدال')
    .replace(/ابو\s+/g, 'ابو')
    .replace(/\s+/g, ' ')
    .trim();

  return out;
}

/**
 * Deterministic ICAO 9303 Modulo-10 [7, 3, 1] check-digit calculator
 */
export function computeIcaoCheckDigit(str: string): number {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i].toUpperCase();
    let val = 0;
    if (ch === '<') {
      val = 0;
    } else if (ch >= '0' && ch <= '9') {
      val = ch.charCodeAt(0) - 48;
    } else if (ch >= 'A' && ch <= 'Z') {
      val = ch.charCodeAt(0) - 55;
    }
    sum += val * weights[i % 3];
  }
  return sum % 10;
}

export function validateMrzCheckDigit(field: string, expectedDigitChar: string): boolean {
  if (!field || !expectedDigitChar) return false;
  const expected = Number(expectedDigitChar);
  if (Number.isNaN(expected)) return false;
  return computeIcaoCheckDigit(field) === expected;
}

export function calculateRiskTier(riskScore: number): RiskTier {
  if (riskScore <= 28) return 'low';
  if (riskScore <= 64) return 'medium';
  return 'high';
}

export function isMissingOrUnclearValue(val?: string | null): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  if (!trimmed) return true;
  return (
    trimmed.includes('غير واضح') ||
    trimmed.includes('غير موجود') ||
    trimmed.toUpperCase().includes('[MISSING') ||
    trimmed.toUpperCase().includes('[UNCLEAR') ||
    trimmed.toUpperCase().includes('NO MRZ') ||
    trimmed.toUpperCase() === 'MISSING' ||
    trimmed.toUpperCase() === 'UNKNOWN'
  );
}

export interface DocumentSideRequirement {
  requiresBothSides: boolean;
  policyBadgeEn: string;
  policyBadgeAr: string;
  frontFieldsSummaryEn: string;
  frontFieldsSummaryAr: string;
  backFieldsSummaryEn: string;
  backFieldsSummaryAr: string;
}

/**
 * Deterministic Card vs. Passport Physical Side Requirement Contract.
 * All physical cards (National ID, Residence Card, Civil Status ID, Driving License,
 * Chamber of Commerce Card, Tax Card) have a Front and a Back and require BOTH sides.
 * Passports (IRQ_PASSPORT, FOREIGN_PASSPORT) and single-page certificates only require
 * the single Bio-Data / Front page.
 */
export function getDocumentSideRequirement(docType: DocumentType): DocumentSideRequirement {
  switch (docType) {
    case 'IRQ_NATIONAL_ID':
      return {
        requiresBothSides: true,
        policyBadgeEn: 'DUAL-SIDED CARD · FRONT + BACK REQUIRED',
        policyBadgeAr: 'بطاقة ذات وجهين · يتطلب الوجه الأمامي والخلفي',
        frontFieldsSummaryEn:
          'Portrait, Holder & Mother/Grandfather Name, 12-Digit National ID No., DOB & Place of Birth',
        frontFieldsSummaryAr: 'الصورة الشخصية، الاسم الكامل واسم الأم والجد، الرقم الوطني، تاريخ ومحل الولادة',
        backFieldsSummaryEn:
          '3-Line ICAO TD1 MRZ, Issue Date, Expiry Date, Family Number (الرقم العائلي), Issuing Authority & QR',
        backFieldsSummaryAr: 'شريط القراءة الآلي MRZ (3 أسطر)، تاريخ الإصدار والنفاذ، الرقم العائلي، جهة الإصدار والباركود',
      };
    case 'IRQ_RESIDENCE_CARD':
      return {
        requiresBothSides: true,
        policyBadgeEn: 'DUAL-SIDED CARD · FRONT + BACK REQUIRED',
        policyBadgeAr: 'بطاقة سكن ذات وجهين · يتطلب الأمام والظهر',
        frontFieldsSummaryEn:
          'Head of Household Name, Information Office, Address (Mahalla / Zukak / Dar), Form Number',
        frontFieldsSummaryAr: 'اسم رب الأسرة، مكتب المعلومات، العنوان (المحلة / الزقاق / الدار)، رقم الاستمارة',
        backFieldsSummaryEn:
          'Information Office Official Stamp, Issue Date (تاريخ التنظيم), Mukhtar Endorsement & Registry Notes',
        backFieldsSummaryAr: 'ختم مكتب المعلومات الرسمي، تاريخ التنظيم، توقيع المختار وملاحظات السجل',
      };
    case 'IRQ_CIVIL_STATUS_ID':
      return {
        requiresBothSides: true,
        policyBadgeEn: 'DUAL-SIDED CARD · FRONT + BACK REQUIRED',
        policyBadgeAr: 'هوية ذات وجهين · يتطلب الأمام والظهر',
        frontFieldsSummaryEn: 'Holder Name, Portrait, ID Serial Number, Date & Place of Birth',
        frontFieldsSummaryAr: 'الاسم الكامل، الصورة، رقم الهوية، تاريخ ومحل الولادة',
        backFieldsSummaryEn:
          'Registry & Page Number (الصحيفة والسجل), Marital Status, Civil Status Directorate & Issue Date',
        backFieldsSummaryAr: 'رقم الصحيفة والسجل، الحالة الزوجية، دائرة الأحوال المدنية وتاريخ الإصدار',
      };
    case 'IRQ_DRIVING_LICENSE':
      return {
        requiresBothSides: true,
        policyBadgeEn: 'DUAL-SIDED CARD · FRONT + BACK REQUIRED',
        policyBadgeAr: 'إجازة سوق ذات وجهين · يتطلب الأمام والظهر',
        frontFieldsSummaryEn: 'Holder Name, License Number, DOB, Issue & Expiry Dates, Portrait',
        frontFieldsSummaryAr: 'الاسم الكامل، رقم الإجازة، تاريخ الولادة والإصدار والنفاذ، الصورة',
        backFieldsSummaryEn: 'Authorized Vehicle Classes, Blood Type, Traffic Directorate Barcode',
        backFieldsSummaryAr: 'فئات المركبات المخولة، فصيلة الدم، باركود مديرية المرور',
      };
    case 'IRQ_CHAMBER_OF_COMMERCE':
    case 'IRQ_TAX_ID_CARD':
      return {
        requiresBothSides: true,
        policyBadgeEn: 'DUAL-SIDED CARD · FRONT + BACK REQUIRED',
        policyBadgeAr: 'بطاقة ذات وجهين · يتطلب الأمام والظهر',
        frontFieldsSummaryEn: 'Merchant / Entity Name, Membership / Tax Number, Issue & Expiry Dates',
        frontFieldsSummaryAr: 'الاسم التجاري / اسم التاجر، رقم العضوية / الرقم الضريبي، تاريخ الإصدار والنفاذ',
        backFieldsSummaryEn: 'Chamber / Tax Authority Stamp, QR Verification Code & Signatory Endorsement',
        backFieldsSummaryAr: 'ختم الغرفة التجارية / الضريبة، رمز الاستجابة السريعة QR وتوقيع المخول',
      };
    case 'IRQ_PASSPORT':
    case 'FOREIGN_PASSPORT':
      return {
        requiresBothSides: false,
        policyBadgeEn: 'SINGLE BIO-DATA PAGE · NO BACK SIDE NEEDED',
        policyBadgeAr: 'صفحة البيانات البيومترية فقط · لا يوجد ظهر مطلوب',
        frontFieldsSummaryEn:
          'Bio-Data Page contains Portrait, Full Name, Passport No., DOB, Expiry & 2-Line TD3 MRZ on one page',
        frontFieldsSummaryAr: 'صفحة البيانات تحتوي على الصورة والاسم ورقم الجواز والصلاحية وشريط MRZ في صفحة واحدة',
        backFieldsSummaryEn: 'Not applicable — Passports only require the single Bio-Data page',
        backFieldsSummaryAr: 'غير مطلوب — جواز السفر يتطلب صفحة البيانات البيومترية فقط',
      };
    default:
      return {
        requiresBothSides: false,
        policyBadgeEn: 'SINGLE-PAGE DOCUMENT · FRONT PAGE ONLY',
        policyBadgeAr: 'وثيقة من صفحة واحدة · الوجه الأمامي فقط',
        frontFieldsSummaryEn: 'Primary document face containing holder details, seals, and signatures',
        frontFieldsSummaryAr: 'الوجه الأساسي للوثيقة المتضمن بيانات الصاحب والأختام والتواقيع',
        backFieldsSummaryEn: 'Optional reverse endorsements if applicable',
        backFieldsSummaryAr: 'تظهيرات خلفية اختيارية إن وجدت',
      };
  }
}

/**
 * Deterministic Schema-Aware & Side-Aware Missing Field Auditor for Iraqi & MENA Document Types.
 * Checks:
 * 1) Whether a dual-sided physical card (National ID, Residence Card, Driving License, etc.) is missing its
 *    mandatory FRONT or BACK side (whereas Passports only need a single Bio-Data page).
 * 2) Which fields are supposed to appear on the given DocumentType and flags any field that is missing or [غير واضح]
 *    without ever inventing or guessing the missing value.
 */
export function auditMissingExpectedFields(
  docType: DocumentType,
  fields: {
    fullNameEn?: string;
    fullNameAr?: string;
    docNumber?: string;
    dob?: string;
    issueDate?: string;
    expiryDate?: string;
    governorateEn?: string;
    address?: string;
    familyNumber?: string;
    mrzLine1?: string;
  },
  aiReportedMissing: MissingExpectedField[] = [],
  uploadedSide?: 'FRONT' | 'BACK' | 'BOTH'
): MissingExpectedField[] {
  const results: MissingExpectedField[] = [];
  const seenKeys = new Set<string>();

  const addMissing = (item: MissingExpectedField) => {
    if (!seenKeys.has(item.fieldKey)) {
      seenKeys.add(item.fieldKey);
      results.push(item);
    }
  };

  // Check Dual-Sided Card Completeness (Front + Back required for cards; Passports exempt)
  const sidePolicy = getDocumentSideRequirement(docType);
  if (sidePolicy.requiresBothSides && uploadedSide && uploadedSide !== 'BOTH') {
    if (uploadedSide === 'FRONT') {
      addMissing({
        fieldKey: 'backSideUpload',
        labelEn: 'Reverse Side of Card (الوجه الخلفي / ظهر البطاقة)',
        labelAr: 'الوجه الخلفي للبطاقة (ظهر البطاقة)',
        reasonEn: `All physical cards (${docType}) have a front and back and require BOTH sides. Only the FRONT side was uploaded; reverse-side fields (${sidePolicy.backFieldsSummaryEn}) cannot be verified without the back side.`,
        reasonAr: `جميع البطاقات (${docType}) تحتوي على وجه أمامي وخلفي ويجب رفعهما معاً. تم رفع الوجه الأمامي فقط؛ حقول الظهر (${sidePolicy.backFieldsSummaryAr}) لا يمكن التحقق منها بدون صورة الظهر.`,
        severity: 'CRITICAL',
      });
    } else if (uploadedSide === 'BACK') {
      addMissing({
        fieldKey: 'frontSideUpload',
        labelEn: 'Front Side of Card (الوجه الأمامي للبطاقة)',
        labelAr: 'الوجه الأمامي للبطاقة',
        reasonEn: `All physical cards (${docType}) require BOTH front and back images. Only the BACK side was uploaded; front-side fields (${sidePolicy.frontFieldsSummaryEn}) are missing.`,
        reasonAr: `جميع البطاقات (${docType}) تتطلب رفع الوجهين الأمامي والخلفي. تم رفع الظهر فقط؛ حقول الوجه الأمامي (${sidePolicy.frontFieldsSummaryAr}) مفقودة.`,
        severity: 'CRITICAL',
      });
    }
  }

  for (const item of aiReportedMissing) {
    if (item && item.fieldKey && item.labelEn) {
      addMissing({
        fieldKey: item.fieldKey,
        labelEn: item.labelEn,
        labelAr: item.labelAr || item.labelEn,
        reasonEn:
          item.reasonEn ||
          'Expected field for this document type is not present or unreadable on the uploaded card.',
        reasonAr:
          item.reasonAr ||
          'هذا الحقل مطلوب حسب نموذج الوثيقة ولكنه غير موجود أو غير واضح في الصورة المرفوعة.',
        severity: item.severity === 'WARNING' ? 'WARNING' : 'CRITICAL',
      });
    }
  }

  // Always check Holder / Head of Household Name
  if (isMissingOrUnclearValue(fields.fullNameEn) && isMissingOrUnclearValue(fields.fullNameAr)) {
    addMissing({
      fieldKey: 'fullName',
      labelEn:
        docType === 'IRQ_RESIDENCE_CARD'
          ? 'Head of Household Name (اسم رب الأسرة)'
          : 'Holder Full Name (الاسم الكامل واللقب)',
      labelAr:
        docType === 'IRQ_RESIDENCE_CARD'
          ? 'اسم رب الأسرة على بطاقة السكن'
          : 'الاسم الكامل واللقب لصاحب الوثيقة',
      reasonEn: `Mandatory holder name field is supposed to appear on ${docType} but is missing or unreadable on the card.`,
      reasonAr: `حقل الاسم الأساسي مفترض وجوده على ${docType} ولكنه مفقود أو غير واضح في البطاقة.`,
      severity: 'CRITICAL',
    });
  }

  // Always check Document / Form / Card Number
  if (isMissingOrUnclearValue(fields.docNumber)) {
    addMissing({
      fieldKey: 'docNumber',
      labelEn:
        docType === 'IRQ_RESIDENCE_CARD'
          ? 'Residence Card / Form Number (رقم استمارة بطاقة السكن)'
          : 'Document / National ID Number (الرقم الوطني / رقم الوثيقة)',
      labelAr:
        docType === 'IRQ_RESIDENCE_CARD'
          ? 'رقم استمارة بطاقة السكن'
          : 'الرقم الوطني أو التسلسلي للوثيقة',
      reasonEn: `Serial / ID number is required on ${docType} but was missing or occluded on the uploaded image.`,
      reasonAr: `رقم البطاقة أو الاستمارة مفترض وجوده على ${docType} ولكنه غير موجود في الصورة.`,
      severity: 'CRITICAL',
    });
  }

  // Document-type-specific schema rules
  if (docType === 'IRQ_RESIDENCE_CARD' || docType === 'IRQ_RATION_CARD') {
    // Iraqi Residence Card (بطاقة السكن) & Ration Card (البطاقة التموينية) require Residential Address (Mahalla / Zukak / Dar)
    if (isMissingOrUnclearValue(fields.address)) {
      addMissing({
        fieldKey: 'address',
        labelEn: 'Residential Address: Mahalla / Zukak / Dar (عنوان السكن: المحلة / الزقاق / الدار)',
        labelAr: 'عنوان السكن الكامل (المحلة / الزقاق / الدار)',
        reasonEn:
          'Iraqi Residence / Ration Card must state Mahalla, Zukak, and Dar (المحلة / الزقاق / الدار), but this field is missing from the card.',
        reasonAr:
          'يجب أن تتضمن بطاقة السكن أو التموينية حقول (المحلة / الزقاق / الدار)، ولكن هذا الحقل مفقود من البطاقة.',
        severity: 'CRITICAL',
      });
    }
    if (isMissingOrUnclearValue(fields.issueDate) || fields.issueDate === 'N/A') {
      addMissing({
        fieldKey: 'issueDate',
        labelEn: 'Residence Card Issue Date (تاريخ تنظيم بطاقة السكن)',
        labelAr: 'تاريخ تنظيم / إصدار بطاقة السكن',
        reasonEn:
          'Issue date is expected on Iraqi Residence Card (بطاقة السكن) (often on reverse side) but was not found on the card.',
        reasonAr: 'تاريخ تنظيم بطاقة السكن مفترض وجوده ولكنه غير موجود على البطاقة.',
        severity: 'WARNING',
      });
    }
    if (isMissingOrUnclearValue(fields.familyNumber)) {
      addMissing({
        fieldKey: 'familyNumber',
        labelEn: 'Information Office / Registry Number (رقم السجل / مكتب المعلومات)',
        labelAr: 'رقم السجل أو العائلة في مكتب المعلومات',
        reasonEn:
          'Registry / Family number is expected on Iraqi Residence Card (بطاقة السكن) but is missing.',
        reasonAr: 'رقم السجل أو العائلة مفترض وجوده على بطاقة السكن ولكنه مفقود.',
        severity: 'WARNING',
      });
    }
  } else if (
    docType === 'IRQ_NATIONAL_ID' ||
    docType === 'IRQ_CIVIL_STATUS_ID' ||
    docType === 'IRQ_PASSPORT' ||
    docType === 'FOREIGN_PASSPORT' ||
    docType === 'IRQ_DRIVING_LICENSE'
  ) {
    // Identity / Passport / Driving License require Date of Birth
    if (isMissingOrUnclearValue(fields.dob) || fields.dob === 'N/A') {
      addMissing({
        fieldKey: 'dob',
        labelEn: 'Date of Birth (تاريخ الولادة)',
        labelAr: 'تاريخ الولادة (YYYY/MM/DD)',
        reasonEn: `Date of Birth (تاريخ الولادة) is mandatory on ${docType} but is missing or unreadable on the uploaded card.`,
        reasonAr: `حقل تاريخ الولادة إلزامي على ${docType} ولكنه غير موجود أو غير واضح على البطاقة.`,
        severity: 'CRITICAL',
      });
    }

    // National ID, Passport, and Driving License require Expiry Date
    if (
      docType !== 'IRQ_CIVIL_STATUS_ID' &&
      (isMissingOrUnclearValue(fields.expiryDate) || fields.expiryDate === 'N/A')
    ) {
      addMissing({
        fieldKey: 'expiryDate',
        labelEn: 'Expiration Date (تاريخ النفاذ / الانتهاء)',
        labelAr: 'تاريخ النفاذ / انتهاء الصلاحية',
        reasonEn: `Expiration Date (تاريخ النفاذ) is supposed to be printed on ${docType} (on the BACK of National ID or Bio-Page of Passport) but is missing.`,
        reasonAr: `حقل تاريخ النفاذ مفترض وجوده على ${docType} ولكنه مفقود من البطاقة.`,
        severity: 'CRITICAL',
      });
    }

    if (isMissingOrUnclearValue(fields.issueDate) || fields.issueDate === 'N/A') {
      addMissing({
        fieldKey: 'issueDate',
        labelEn: 'Issue Date (تاريخ الإصدار)',
        labelAr: 'تاريخ الإصدار',
        reasonEn: `Issue Date (تاريخ الإصدار) is expected on ${docType} (often on reverse side) and was not found.`,
        reasonAr: `تاريخ الإصدار مفترض وجوده على ${docType} ولكنه غير ظاهر في الصورة.`,
        severity: 'WARNING',
      });
    }
  }

  return results;
}

export function evaluateApplicantWithRules(
  applicant: KYCApplicant,
  config: AutomationConfig
): {
  nextStatus: VerificationStatus;
  stage9Outcome: PipelineStage9Outcome;
  reasonEn: string;
  reasonAr: string;
} {
  // 1. Check Sanctions / PEP hits or forged MRZ first
  const hasTamperedMrz = applicant.documents.some((d) => d.mrzModulo10Valid === false);
  if (
    (config.autoRejectSanctionsHit && (applicant.sanctionsMatch || applicant.pepMatch)) ||
    hasTamperedMrz
  ) {
    return {
      nextStatus: 'rejected',
      stage9Outcome: 'AUTO_REJECTED',
      reasonEn: hasTamperedMrz
        ? 'AUTO_REJECTED (Stage 9): Deterministic ICAO 9303 Modulo-10 [7,3,1] MRZ check-digit failure.'
        : 'AUTO_REJECTED (Stage 9): Positive match on CBI / OFAC / UN Sanctions or PEP screening.',
      reasonAr: hasTamperedMrz
        ? 'رفض تلقائي (المرحلة 9): فشل التحقق الرياضي Modulo-10 [7,3,1] لشريط MRZ.'
        : 'رفض تلقائي (المرحلة 9): تطابق إيجابي في قوائم البنك المركزي العراقي أو العقوبات الدولية.',
    };
  }

  // 2. Check Dual-Sided Card Completeness (Front + Back required for cards, except Passports)
  const docMissingSide = applicant.documents.find(
    (doc) => getDocumentSideRequirement(doc.type).requiresBothSides && doc.side !== 'BOTH'
  );
  if (docMissingSide) {
    const missingWhichSideEn = docMissingSide.side === 'FRONT' ? 'BACK side' : 'FRONT side';
    const missingWhichSideAr =
      docMissingSide.side === 'FRONT' ? 'الوجه الخلفي (الظهر)' : 'الوجه الأمامي';
    return {
      nextStatus: 'flagged',
      stage9Outcome: 'INSUFFICIENT_DATA',
      reasonEn: `INSUFFICIENT_DATA (Stage 9 · Dual-Side Card Gate): ${docMissingSide.type} is a dual-sided card and is missing its mandatory ${missingWhichSideEn} (only ${docMissingSide.side} uploaded).`,
      reasonAr: `بيانات غير كافية (المرحلة 9 · بوابة الوجهين للبطاقات): الوثيقة (${docMissingSide.type}) تتطلب رفع الوجهين وينقصها ${missingWhichSideAr}.`,
    };
  }

  // 3. Check Schema-Aware Missing Expected Fields on any submitted card (Zero-Hallucination Invariant)
  const criticalMissingFields = applicant.documents.flatMap((doc) =>
    (doc.missingExpectedFields || []).filter((f) => f.severity === 'CRITICAL')
  );
  const hasUnclearCoreField = applicant.documents.some(
    (doc) =>
      isMissingOrUnclearValue(doc.docNumber) ||
      isMissingOrUnclearValue(doc.extractedFields.fullName)
  );
  if (criticalMissingFields.length > 0 || hasUnclearCoreField) {
    const missingNamesEn = criticalMissingFields.map((f) => f.labelEn).join(', ');
    const missingNamesAr = criticalMissingFields.map((f) => f.labelAr).join('، ');
    return {
      nextStatus: 'flagged',
      stage9Outcome: 'INSUFFICIENT_DATA',
      reasonEn: `INSUFFICIENT_DATA (Stage 9 · Anti-Hallucination Gate): Mandatory card field(s) missing from document (${missingNamesEn || 'Core Identity Field'}). No data was fabricated.`,
      reasonAr: `بيانات غير كافية (المرحلة 9 · بوابة عدم الهلوسة): حقول إلزامية مفقودة من البطاقة (${missingNamesAr || 'حقل أساسي'}). لم يتم اختلاق أي بيانات.`,
    };
  }

  // 3. Check Unknown Document or Mandatory Human Review document categories (e.g., Power of Attorney)
  const hasUnknownOrLegalDoc = applicant.documents.some(
    (d) =>
      d.type === 'UNKNOWN_DOCUMENT' ||
      d.supportStatus === 'UNKNOWN_DOCUMENT' ||
      d.supportStatus === 'REQUIRES_HUMAN_REVIEW'
  );
  if (hasUnknownOrLegalDoc) {
    return {
      nextStatus: 'flagged',
      stage9Outcome: 'HUMAN_REVIEW',
      reasonEn:
        'HUMAN_REVIEW (Stage 9): Dossier contains UNKNOWN_DOCUMENT or Legal Power of Attorney (Category H) requiring officer review.',
      reasonAr:
        'مراجعة بشرية (المرحلة 9): يحتوي الملف على وثيقة غير مصنفة أو وكالة قانونية (الفئة H) تتطلب تدقيق مسؤول الامتثال.',
    };
  }

  // 4. Check Document Expiry if strict check enabled
  if (config.strictExpiryCheck) {
    const now = new Date('2026-10-17T00:00:00Z').getTime();
    const hasExpiredDoc = applicant.documents.some((doc) => {
      if (!doc.expiryDate || doc.expiryDate === 'N/A' || isMissingOrUnclearValue(doc.expiryDate))
        return false;
      const exp = new Date(doc.expiryDate).getTime();
      return !isNaN(exp) && exp < now;
    });
    if (hasExpiredDoc) {
      return {
        nextStatus: 'flagged',
        stage9Outcome: 'HUMAN_REVIEW',
        reasonEn:
          'HUMAN_REVIEW (Stage 9): Primary identity document has passed its expiration date.',
        reasonAr: 'مراجعة بشرية (المرحلة 9): انتهاء صلاحية وثيقة الهوية الأساسية.',
      };
    }
  }

  // 5. Check High Risk Secondary Residence Card requirement
  if (config.requireUtilityBillForHighRisk && applicant.riskScore > 60) {
    const hasResidenceProof = applicant.documents.some(
      (d) => d.type === 'IRQ_RESIDENCE_CARD' || d.type === 'IRQ_RATION_CARD'
    );
    if (!hasResidenceProof) {
      return {
        nextStatus: 'flagged',
        stage9Outcome: 'INSUFFICIENT_DATA',
        reasonEn:
          'INSUFFICIENT_DATA (Stage 9): High-risk profile missing Iraqi Residence Card (بطاقة السكن) or Ration Card.',
        reasonAr:
          'بيانات غير كافية (المرحلة 9): ملف عالي المخاطر يفتقر إلى بطاقة السكن أو البطاقة التموينية.',
      };
    }
  }

  // 5. Calculate minimum OCR confidence across submitted documents
  const minDocOcr =
    applicant.documents.length > 0
      ? Math.min(...applicant.documents.map((d) => d.ocrConfidence))
      : 0;

  // 6. Evaluate Fast-Track Auto-Approval (Stage 9 AUTO_APPROVED)
  if (
    applicant.riskScore <= config.autoApproveMaxRiskScore &&
    minDocOcr >= config.minOcrConfidence &&
    applicant.biometricMatchScore >= config.minBiometricScore &&
    applicant.nineSignals.image_quality >= 0.8 &&
    !applicant.sanctionsMatch &&
    !applicant.pepMatch &&
    !applicant.adverseMediaMatch
  ) {
    return {
      nextStatus: 'approved',
      stage9Outcome: 'AUTO_APPROVED',
      reasonEn: `AUTO_APPROVED (Stage 9): Tested Iraqi document types, Optical Quality ${(
        applicant.nineSignals.image_quality * 100
      ).toFixed(0)}% >= 80%, OCR ${minDocOcr}% >= ${
        config.minOcrConfidence
      }%, Cross-Document Entity Match verified.`,
      reasonAr: `اعتماد تلقائي (المرحلة 9): وثائق عراقية معتمدة، جودة بصرية ${(
        applicant.nineSignals.image_quality * 100
      ).toFixed(0)}%، دقة القراءة ${minDocOcr}%، وتطابق الكيان عبر الوثائق مؤكد.`,
    };
  }

  // 7. Otherwise route to HUMAN_REVIEW
  return {
    nextStatus: 'flagged',
    stage9Outcome: 'HUMAN_REVIEW',
    reasonEn: `HUMAN_REVIEW (Stage 9): Thresholds not met for straight-through processing (Risk: ${applicant.riskScore}, Min OCR: ${minDocOcr}%, Biometric: ${applicant.biometricMatchScore}%).`,
    reasonAr: `مراجعة بشرية (المرحلة 9): لم يتم استيفاء حدود المعالجة المباشرة (المخاطر: ${applicant.riskScore}، دقة القراءة: ${minDocOcr}%، التطابق الحيوي: ${applicant.biometricMatchScore}%).`,
  };
}

export function runAutomatedBatchWorkflow(
  applicants: KYCApplicant[],
  config: AutomationConfig,
  targetStatuses: VerificationStatus[] = ['pending', 'flagged']
): { updatedApplicants: KYCApplicant[]; summary: BatchRunResult } {
  const autoApprovedIds: string[] = [];
  const autoFlaggedIds: string[] = [];
  const autoRejectedIds: string[] = [];
  const unchangedIds: string[] = [];

  const updatedApplicants = applicants.map((applicant) => {
    if (!targetStatuses.includes(applicant.status)) {
      unchangedIds.push(applicant.id);
      return applicant;
    }

    const evaluation = evaluateApplicantWithRules(applicant, config);
    const updatedDocs = applicant.documents.map((doc) => ({
      ...doc,
      status: evaluation.nextStatus,
    }));

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}-${applicant.id}`,
      timestamp: '2026-10-17 08:40 UTC',
      actorEn: 'UniversalKYCPipeline v2.0.0-IRQ',
      actorAr: 'محرك روسترو الشامل v2.0.0-IRQ',
      actionEn: `Stage 9 Outcome: ${evaluation.stage9Outcome} (${evaluation.nextStatus.toUpperCase()})`,
      actionAr: `نتيجة المرحلة 9: ${evaluation.stage9Outcome}`,
      noteEn: evaluation.reasonEn,
      noteAr: evaluation.reasonAr,
      cbiLaw78HmacReceipt: 'HMAC-SHA256-CBI78-9f4e2a10d8c4b712e3019284a761c002',
    };

    if (evaluation.nextStatus === 'approved') autoApprovedIds.push(applicant.id);
    else if (evaluation.nextStatus === 'rejected') autoRejectedIds.push(applicant.id);
    else if (evaluation.nextStatus === 'flagged') autoFlaggedIds.push(applicant.id);

    return {
      ...applicant,
      status: evaluation.nextStatus,
      stage9Outcome: evaluation.stage9Outcome,
      updatedAt: '2026-10-17 08:40 UTC',
      documents: updatedDocs,
      auditTrail: [newAudit, ...applicant.auditTrail],
    };
  });

  return {
    updatedApplicants,
    summary: {
      processedCount: autoApprovedIds.length + autoFlaggedIds.length + autoRejectedIds.length,
      autoApprovedIds,
      autoFlaggedIds,
      autoRejectedIds,
      unchangedIds,
    },
  };
}

export function filterAndSortApplicants(
  applicants: KYCApplicant[],
  options: {
    statusFilter: VerificationStatus | 'all';
    riskFilter: RiskTier | 'all';
    docTypeFilter: DocumentType | 'all';
    searchQuery: string;
    sortBy: 'submittedAt' | 'riskScore' | 'ocrConfidence';
    sortOrder: 'asc' | 'desc';
  }
): KYCApplicant[] {
  const rawQuery = options.searchQuery.trim().toLowerCase();
  const normalizedQuery = normalizeMultiScriptText(rawQuery);

  const filtered = applicants.filter((item) => {
    if (options.statusFilter !== 'all' && item.status !== options.statusFilter) {
      return false;
    }
    if (options.riskFilter !== 'all' && item.riskTier !== options.riskFilter) {
      return false;
    }
    if (options.docTypeFilter !== 'all') {
      const hasDocType = item.documents.some((d) => d.type === options.docTypeFilter);
      if (!hasDocType) return false;
    }
    if (rawQuery.length > 0) {
      const matchesNameEn = item.fullNameEn.toLowerCase().includes(rawQuery);
      const matchesNameAr = normalizeMultiScriptText(item.fullNameAr).includes(normalizedQuery);
      const matchesRef = item.referenceCode.toLowerCase().includes(rawQuery);
      const matchesEmail = item.email.toLowerCase().includes(rawQuery);
      const matchesGovEn = item.governorateEn.toLowerCase().includes(rawQuery);
      const matchesGovAr = normalizeMultiScriptText(item.governorateAr).includes(normalizedQuery);
      const matchesDocNum = item.documents.some((d) =>
        normalizeMultiScriptText(d.docNumber.toLowerCase()).includes(normalizedQuery)
      );
      if (
        !matchesNameEn &&
        !matchesNameAr &&
        !matchesRef &&
        !matchesEmail &&
        !matchesGovEn &&
        !matchesGovAr &&
        !matchesDocNum
      ) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (options.sortBy === 'riskScore') {
      valA = a.riskScore;
      valB = b.riskScore;
    } else if (options.sortBy === 'ocrConfidence') {
      valA = a.documents.length ? Math.min(...a.documents.map((d) => d.ocrConfidence)) : 0;
      valB = b.documents.length ? Math.min(...b.documents.map((d) => d.ocrConfidence)) : 0;
    } else {
      valA = new Date(a.submittedAt.replace(' UTC', 'Z')).getTime() || 0;
      valB = new Date(b.submittedAt.replace(' UTC', 'Z')).getTime() || 0;
    }

    return options.sortOrder === 'asc' ? valA - valB : valB - valA;
  });
}

export function computeKpiMetrics(applicants: KYCApplicant[]) {
  const total = applicants.length;
  const approved = applicants.filter((a) => a.status === 'approved').length;
  const pending = applicants.filter((a) => a.status === 'pending').length;
  const flagged = applicants.filter((a) => a.status === 'flagged').length;
  const rejected = applicants.filter((a) => a.status === 'rejected').length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 1000) / 10 : 0;
  const avgOcr =
    total > 0
      ? Math.round(
          (applicants.reduce((acc, item) => {
            const itemAvg =
              item.documents.reduce((s, d) => s + d.ocrConfidence, 0) /
              Math.max(1, item.documents.length);
            return acc + itemAvg;
          }, 0) /
            total) *
            10
        ) / 10
      : 0;

  const totalDocs = applicants.reduce((sum, a) => sum + a.documents.length, 0);

  return {
    total,
    approved,
    pending,
    flagged,
    rejected,
    actionRequired: pending + flagged,
    approvalRate,
    avgOcr,
    totalDocs,
  };
}
