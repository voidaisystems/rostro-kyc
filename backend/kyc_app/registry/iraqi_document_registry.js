/**
 * Project Rostro (روسترو) — Universal Iraqi Document Registry
 * ==========================================================
 * Centralized, versioned, and startup-validated registry of Iraqi, KRG,
 * and foreign-submitted onboarding documents across 8 operational categories:
 *   A. IDENTITY_CIVIL              — Identity & Civil Status Documents
 *   B. RESIDENCE_ADDRESS           — Residence, Address & Household Documents
 *   C. TRAVEL_IMMIGRATION          — Travel & Immigration Documents
 *   D. DRIVING_VEHICLE             — Driving, Vehicle & Transport Documents
 *   E. BUSINESS_MERCHANT           — Business & Merchant Onboarding Documents
 *   F. EDUCATION_EMPLOYMENT_INCOME — Education, Employment & Income Documents
 *   G. FINANCIAL_EVIDENCE          — Financial & Supporting Evidence
 *   H. LEGAL_AUTHORIZATION         — Legal, Authorization & Official Documents
 *
 * Adding a new document type requires only adding a declarative registry entry,
 * referencing reusable normalizers/validators, and providing synthetic fixtures.
 */

const REGISTRY_VERSION = "2.1.0";

const DOCUMENT_CATEGORIES = {
  IDENTITY_CIVIL: {
    id: "IDENTITY_CIVIL",
    code: "A",
    name_en: "Identity & Civil Status Documents",
    name_ar: "وثائق الهوية والأحوال المدنية",
    name_ku: "بەڵگەنامەکانی ناسنامە و باری شارستانی",
    description_en: "Primary and secondary civil identity records issued by federal Iraqi and KRG interior authorities."
  },
  RESIDENCE_ADDRESS: {
    id: "RESIDENCE_ADDRESS",
    code: "B",
    name_en: "Residence, Address & Household Documents",
    name_ar: "وثائق السكن والعنوان والأسرة",
    name_ku: "بەڵگەنامەکانی نیشتەجێبوون و ناونیشان و خێزان",
    description_en: "Official residency cards, KRG information cards, ration records, municipal address certificates, and utility bills."
  },
  TRAVEL_IMMIGRATION: {
    id: "TRAVEL_IMMIGRATION",
    code: "C",
    name_en: "Travel & Immigration Documents",
    name_ar: "وثائق السفر والإقامة والهجرة",
    name_ku: "بەڵگەنامەکانی گەشت و نشینگە و کۆچ",
    description_en: "Iraqi and foreign passports, residency permits, entry visas, and border documentation."
  },
  DRIVING_VEHICLE: {
    id: "DRIVING_VEHICLE",
    code: "D",
    name_en: "Driving, Vehicle & Transport Documents",
    name_ar: "وثائق إجازة السوق والمركبات والنقل",
    name_ku: "بەڵگەنامەکانی مۆڵەتی شۆفێری و ئۆتۆمبێل و گواستنەوە",
    description_en: "Driver licenses, vehicle registration (Sanawiya), ownership titles, roadworthiness inspection, and insurance."
  },
  BUSINESS_MERCHANT: {
    id: "BUSINESS_MERCHANT",
    code: "E",
    name_en: "Business & Merchant Onboarding Documents",
    name_ar: "وثائق تسجيل الشركات والتجار وممارسة المهنة",
    name_ku: "بەڵگەنامەکانی بازرگانی و تۆمارکردنی کۆمپانیاکان",
    description_en: "Chamber of Commerce licenses, company incorporation records, tax cards, municipal permits, customs, and shareholder records."
  },
  EDUCATION_EMPLOYMENT_INCOME: {
    id: "EDUCATION_EMPLOYMENT_INCOME",
    code: "F",
    name_en: "Education, Employment & Income Documents",
    name_ar: "وثائق التعليم والوظيفة وإثبات الدخل",
    name_ku: "بەڵگەنامەکانی خوێندن و کار و داهات",
    description_en: "Professional syndicate IDs, employment letters, salary slips, university degrees, and employer IDs."
  },
  FINANCIAL_EVIDENCE: {
    id: "FINANCIAL_EVIDENCE",
    code: "G",
    name_en: "Financial & Supporting Evidence",
    name_ar: "الوثائق المالية وكشوفات الحسابات المؤيدة",
    name_ku: "بەڵگەنامە داراییەکان و پسوولە پشتگیرییەکان",
    description_en: "Bank statements, IBAN confirmation letters, commercial invoices, payment receipts, and proof of funds."
  },
  LEGAL_AUTHORIZATION: {
    id: "LEGAL_AUTHORIZATION",
    code: "H",
    name_en: "Legal, Authorization & Official Documents",
    name_ar: "الوكالات العدلية والوثائق القانونية والرسمية",
    name_ku: "بەڵگەنامە یاساییەکان و بریکارنامە فەرمییەکان",
    description_en: "Notarized powers of attorney, real estate title deeds (Tapu), court decisions, and official authorization letters."
  }
};

const SUPPORT_STATUSES = [
  "REGISTERED",
  "CONFIGURED",
  "TESTED",
  "DEMO_ONLY",
  "PARTIALLY_SUPPORTED",
  "NOT_SUPPORTED",
  "EXTERNAL_VERIFICATION_UNAVAILABLE"
];

const ENTITY_SCOPES = [
  "INDIVIDUAL",
  "BUSINESS_ENTITY",
  "REPRESENTATIVE_LINK",
  "HOUSEHOLD",
  "SUPPORTING_EVIDENCE"
];

const PREPROCESSING_POLICIES = [
  "ID_CARD_LANDSCAPE",
  "A4_PORTRAIT",
  "PASSPORT_BOOKLET",
  "FLEXIBLE_FORM"
];

/**
 * Master Document Catalog (38 Document Types across Categories A–H)
 */
const DOCUMENT_REGISTRY = [
  // ===========================================================================
  // CATEGORY A: IDENTITY AND CIVIL STATUS DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "IRQ_NATIONAL_ID",
    canonical_name_en: "Unified Iraqi National Card",
    canonical_name_ar: "البطاقة الوطنية الموحدة",
    canonical_name_ku: "کارتی نیشتمانیی یەکگرتوو",
    aliases: [
      "البطاقة الوطنية", "بطاقة وطنية", "البطاقه الوطنيه الموحده", "كارتى نيشتمانى",
      "Unified National ID", "National Card Iraq", "مديرية شؤون البطاقة الوطنية"
    ],
    category: "IDENTITY_CIVIL",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: true,
    issuing_authority_ar: "وزارة الداخلية — مديرية شؤون البطاقة الوطنية",
    issuing_authority_en: "Ministry of Interior — Directorate of National Card Affairs",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Federal Governorates", "KRG (Erbil, Sulaymaniyah, Duhok)"],
    supported_generations: ["2015_V1_POLYCARBONATE", "2020_V2_CONTACTLESS"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT", "BACK"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: {
      has_mrz: true,
      format: "TD1",
      side: "BACK",
      lines: 3,
      chars_per_line: 30
    },
    expected_fields: [
      { key: "national_id_number", label_ar: "الرقم الوطني الموحد", label_en: "12-Digit National ID", label_ku: "ژمارەی نیشتمانی", field_type: "NATIONAL_ID_12", required: true, normalizer: "DIGITS_ASCII", validators: ["VALID_NATIONAL_ID_12"] },
      { key: "full_name_ar", label_ar: "الاسم الكامل", label_en: "Full Name (4-Part)", label_ku: "ناوی تەواو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "mother_name_ar", label_ar: "اسم الأم", label_en: "Mother's Name", label_ku: "ناوی دایک", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "date_of_birth", label_ar: "تاريخ الولادة", label_en: "Date of Birth", label_ku: "ڕێکەوتی لەدایکبوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] },
      { key: "document_serial", label_ar: "رقم البطاقة", label_en: "Card Serial Number", label_ku: "ژمارەی کارت", field_type: "DOCUMENT_NUMBER", required: false, normalizer: "ALPHANUM_UPPER", validators: ["VALID_DOC_SERIAL"] },
      { key: "family_number", label_ar: "الرقم العائلي", label_en: "Family Number", label_ku: "ژمارەی خێزانی", field_type: "DOCUMENT_NUMBER", required: false, normalizer: "ALPHANUM_UPPER", validators: [] },
      { key: "mrz_line1", label_ar: "سطر القراءة الآلية 1", label_en: "MRZ Line 1", label_ku: "هێڵی MRZ 1", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: ["TD1_MRZ_CHECKSUM"] },
      { key: "mrz_line2", label_ar: "سطر القراءة الآلية 2", label_en: "MRZ Line 2", label_ku: "هێڵی MRZ 2", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: ["TD1_MRZ_CHECKSUM"] },
      { key: "mrz_line3", label_ar: "سطر القراءة الآلية 3", label_en: "MRZ Line 3", label_ku: "هێڵی MRZ 3", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: [] }
    ],
    deterministic_rules: [
      "RULE_TD1_MRZ_CHECKSUM",
      "RULE_MRZ_FRONT_CONSISTENCY",
      "RULE_NATIONAL_ID_12_DIGITS",
      "RULE_EXPIRY_DATE_FUTURE"
    ],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["PRIMARY_APPLICANT_ID", "BUSINESS_OWNER_ID", "AUTHORIZED_SIGNATORY_ID"],
    human_review_conditions: ["ANY_REQUIRED_FIELD_NULL", "MRZ_CHECKSUM_MISMATCH", "EXPIRED_DOCUMENT", "FIELD_CONFIDENCE_BELOW_THRESHOLD"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "NFC chip cryptographic PKI verification and live Ministry of Interior database queries require hardware/government API access (EXTERNAL_VERIFICATION_UNAVAILABLE).",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_CIVIL_STATUS_ID",
    canonical_name_en: "Iraqi Civil Status ID (Legacy Jinsiya ID)",
    canonical_name_ar: "هوية الأحوال المدنية",
    canonical_name_ku: "ناسنامەی باری شارستانی",
    aliases: ["هوية الاحوال المدنية", "دفتر النفوس", "هوية الأحوال", "Civil Status ID Iraq", "Jinsiya ID"],
    category: "IDENTITY_CIVIL",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: true,
    issuing_authority_ar: "وزارة الداخلية — المديرية العامة للجنسية والأحوال المدنية",
    issuing_authority_en: "Ministry of Interior — General Directorate of Nationality & Civil Status",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates"],
    supported_generations: ["LEGACY_LAMINATED_PAPER"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT", "BACK"],
    preprocessing_policy: "FLEXIBLE_FORM",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "id_serial_number", label_ar: "رقم الهوية", label_en: "ID Serial Number", label_ku: "ژمارەی ناسنامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] },
      { key: "full_name_ar", label_ar: "الاسم الكامل", label_en: "Full Name", label_ku: "ناوی تەواو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "register_number", label_ar: "رقم السجل", label_en: "Register Number (Sijil)", label_ku: "ژمارەی تۆمار", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: [] },
      { key: "page_number", label_ar: "رقم الصحيفة", label_en: "Page Number (Sahifa)", label_ku: "ژمارەی لاپەڕە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: [] },
      { key: "date_of_birth", label_ar: "تاريخ الولادة", label_en: "Date of Birth", label_ku: "ڕێکەوتی لەدایکبوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "governorate", label_ar: "المحافظة / دائرة الأحوال", label_en: "Governorate / Civil Office", label_ku: "پارێزگا", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: ["RULE_LEGACY_ID_DEPRECATION_CHECK", "RULE_HANDWRITING_CONFIDENCE_GATE"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["LEGACY_APPLICANT_ID"],
    human_review_conditions: ["LEGACY_PAPER_WEAR", "HANDWRITING_AMBIGUITY", "CBI_UNIFIED_CARD_UPGRADE_POLICY"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Handwritten ink entries degrade with age; lacks MRZ checksums. Subject to regulatory phase-out in favor of the Unified National Card.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_NATIONALITY_CERT",
    canonical_name_en: "Iraqi Nationality Certificate",
    canonical_name_ar: "شهادة الجنسية العراقية",
    canonical_name_ku: "بڕوانامەی ڕەگەزنامەی عێراقی",
    aliases: ["شهادة الجنسية", "الجنسية العراقية", "Nationality Certificate Iraq"],
    category: "IDENTITY_CIVIL",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الداخلية — مديرية الجنسية العامة",
    issuing_authority_en: "Ministry of Interior — General Directorate of Nationality",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates"],
    supported_generations: ["LEGACY_GREEN_FORM", "LEGACY_WHITE_FORM"],
    supported_languages: ["ar"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "certificate_number", label_ar: "رقم الشهادة", label_en: "Certificate Number", label_ku: "ژمارەی بڕوانامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "full_name_ar", label_ar: "اسم حامل الشهادة", label_en: "Holder Name", label_ku: "ناوی هەڵگر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "issue_date", label_ar: "تاريخ الإصدار", label_en: "Issue Date", label_ku: "ڕێکەوتی دەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_SECONDARY_ID_REQUIRES_PAIRING"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["SUPPORTING_CITIZENSHIP_RECORD"],
    human_review_conditions: ["MUST_PAIR_WITH_CIVIL_OR_NATIONAL_ID"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Legacy document requiring pairing with Civil Status ID if Unified National Card is not presented.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_PASSPORT",
    canonical_name_en: "Iraqi Republic Passport",
    canonical_name_ar: "جواز السفر العراقي",
    canonical_name_ku: "پاسپۆرتی کۆماری عێراق",
    aliases: ["جواز سفر عراقي", "جمهورية العراق جواز سفر", "Republic of Iraq Passport", "پاسپۆرت"],
    category: "IDENTITY_CIVIL",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: true,
    issuing_authority_ar: "وزارة الداخلية — مديرية شؤون الجوازات",
    issuing_authority_en: "Ministry of Interior — Directorate of Passports",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Federal Iraq", "KRG", "Iraqi Embassies Worldwide"],
    supported_generations: ["SERIES_A_PAPER", "SERIES_B_E_PASSPORT_2023"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "PASSPORT_BOOKLET",
    mrz_config: {
      has_mrz: true,
      format: "TD3",
      side: "FRONT",
      lines: 2,
      chars_per_line: 44
    },
    expected_fields: [
      { key: "passport_number", label_ar: "رقم الجواز", label_en: "Passport Number", label_ku: "ژمارەی پاسپۆرت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_IRAQI_PASSPORT_NUM"] },
      { key: "full_name_ar", label_ar: "الاسم الكامل بالعربية", label_en: "Full Name (Arabic)", label_ku: "ناوی تەواو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "full_name_en", label_ar: "الاسم بالإنكليزية", label_en: "Full Name (Latin)", label_ku: "ناو بە ئینگلیزی", field_type: "PERSON_NAME", required: true, normalizer: "LATIN_UPPER", validators: [] },
      { key: "date_of_birth", label_ar: "تاريخ الولادة", label_en: "Date of Birth", label_ku: "ڕێکەوتی لەدایکبوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Date of Expiry", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] },
      { key: "mrz_line1", label_ar: "سطر MRZ الأول", label_en: "TD3 MRZ Line 1", label_ku: "هێڵی MRZ 1", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: ["TD3_MRZ_CHECKSUM"] },
      { key: "mrz_line2", label_ar: "سطر MRZ الثاني", label_en: "TD3 MRZ Line 2", label_ku: "هێڵی MRZ 2", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: ["TD3_MRZ_CHECKSUM"] }
    ],
    deterministic_rules: ["RULE_TD3_MRZ_CHECKSUM", "RULE_IRAQI_ISSUER_CODE_IRQ", "RULE_EXPIRY_DATE_FUTURE"],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.89, escalation_floor: 0.72 },
    accepted_relationships: ["PRIMARY_APPLICANT_ID", "BUSINESS_OWNER_ID"],
    human_review_conditions: ["MRZ_CHECKSUM_FAILURE", "EXPIRED_PASSPORT", "LOW_CLARITY"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Optical TD3 MRZ validated mathematically; ICAO PKD chip active authentication requires NFC reader.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_FAMILY_REGISTRY",
    canonical_name_en: "Family Registration & Civil Status Extract (Surat Qayd)",
    canonical_name_ar: "صورة قيد الأسرة / الأحوال المدنية",
    canonical_name_ku: "وێنەی تۆماری خێزانی",
    aliases: ["صورة قيد", "بيان قيد عائلي", "قيد الأسرة", "Family Registration Extract"],
    category: "IDENTITY_CIVIL",
    entity_scope: "HOUSEHOLD",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الداخلية — مديرية الأحوال المدنية",
    issuing_authority_en: "Ministry of Interior — Civil Status Directorate",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates"],
    supported_generations: ["ELECTRONIC_EXTRACT_2022", "PAPER_LEDGER_EXTRACT"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "family_number", label_ar: "الرقم العائلي / رقم القيد", label_en: "Family Registry Number", label_ku: "ژمارەی خێزانی", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "head_of_family_name", label_ar: "اسم رب الأسرة", label_en: "Head of Family Name", label_ku: "ناوی سەرۆکی خێزان", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "issue_date", label_ar: "تاريخ الإصدار", label_en: "Issue Date", label_ku: "ڕێکەوتی دەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_SUPPORTING_CIVIL_RECORD"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["FAMILY_LINEAGE_PROOF"],
    human_review_conditions: ["ALWAYS_REVIEW_MULTI_ROW_TABLES"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Registered in catalog with header classification; multi-member table row reconciliation routed to human review.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_BIRTH_CERT",
    canonical_name_en: "Iraqi Birth Certificate (Shahadat Al-Wilada)",
    canonical_name_ar: "شهادة الولادة العراقية",
    canonical_name_ku: "بڕوانامەی لەدایکبوون",
    aliases: ["شهادة ولادة", "بيان ولادة", "Birth Certificate Iraq"],
    category: "IDENTITY_CIVIL",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الصحة — قسم الإحصاء الصحي والحياتي",
    issuing_authority_en: "Ministry of Health — Vital Statistics Division",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["STANDARD_MOH_FORM"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "certificate_number", label_ar: "رقم شهادة الولادة", label_en: "Birth Certificate No.", label_ku: "ژمارەی بڕوانامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "child_name_ar", label_ar: "اسم المولود", label_en: "Child Name", label_ku: "ناوی منداڵ", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "father_name_ar", label_ar: "اسم الأب", label_en: "Father Name", label_ku: "ناوی باوک", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "mother_name_ar", label_ar: "اسم الأم", label_en: "Mother Name", label_ku: "ناوی دایک", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "date_of_birth", label_ar: "تاريخ الولادة", label_en: "Date of Birth", label_ku: "ڕێکەوتی لەدایکبوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.92, escalation_floor: 0.75 },
    accepted_relationships: ["MINOR_DEPENDENT_PROOF"],
    human_review_conditions: ["ALWAYS_ESCALATE_VITAL_CERT"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting civil record for dependents; cannot independently open an adult wallet.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_MARRIAGE_CERT",
    canonical_name_en: "Iraqi Marriage Certificate (Aqd Al-Zawaj)",
    canonical_name_ar: "عقد الزواج الرسمي",
    canonical_name_ku: "گرێبەستی هاوسەرگیری",
    aliases: ["عقد زواج", "حجة زواج", "محكمة الأحوال الشخصية عقد زواج", "Marriage Certificate Iraq"],
    category: "IDENTITY_CIVIL",
    entity_scope: "HOUSEHOLD",
    can_establish_primary_identity: false,
    issuing_authority_ar: "مجلس القضاء الأعلى — محكمة الأحوال الشخصية",
    issuing_authority_en: "Supreme Judicial Council — Personal Status Court",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["JUDICIAL_FORM"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "contract_number", label_ar: "رقم السجل / العقد", label_en: "Contract Number", label_ku: "ژمارەی گرێبەست", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "husband_name_ar", label_ar: "اسم الزوج", label_en: "Husband Name", label_ku: "ناوی هاوسەر (پیاو)", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "wife_name_ar", label_ar: "اسم الزوجة", label_en: "Wife Name", label_ku: "ناوی هاوسەر (ژن)", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "court_name", label_ar: "محكمة الأحوال الشخصية", label_en: "Issuing Court", label_ku: "دادگای باری کەسی", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.92, escalation_floor: 0.75 },
    accepted_relationships: ["SPOUSAL_RELATIONSHIP_PROOF"],
    human_review_conditions: ["JUDICIAL_RECORD_MANUAL_CHECK"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Used for spousal relationship verification; routed to compliance review.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_DIVORCE_CERT",
    canonical_name_en: "Iraqi Divorce Record (Hujjat Al-Talaq)",
    canonical_name_ar: "قرار / حجة الطلاق",
    canonical_name_ku: "بڕیاری جیابوونەوە (تەڵاق)",
    aliases: ["حجة طلاق", "قرار طلاق", "تصديق طلاق", "Divorce Certificate Iraq"],
    category: "IDENTITY_CIVIL",
    entity_scope: "HOUSEHOLD",
    can_establish_primary_identity: false,
    issuing_authority_ar: "مجلس القضاء الأعلى — محكمة الأحوال الشخصية",
    issuing_authority_en: "Supreme Judicial Council — Personal Status Court",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["JUDICIAL_FORM"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "decision_number", label_ar: "رقم القرار / العدد", label_en: "Decision Number", label_ku: "ژمارەی بڕیار", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "party_a_name", label_ar: "الطرف الأول", label_en: "First Party Name", label_ku: "لایەنی یەکەم", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "issue_date", label_ar: "تاريخ القرار", label_en: "Decision Date", label_ku: "ڕێکەوتی بڕیار", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.95, escalation_floor: 0.80 },
    accepted_relationships: ["CIVIL_STATUS_UPDATE_PROOF"],
    human_review_conditions: ["JUDICIAL_RECORD_MANUAL_CHECK"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting civil-status update document; requires human compliance review.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_DEATH_CERT",
    canonical_name_en: "Iraqi Death Certificate (Shahadat Al-Wafat)",
    canonical_name_ar: "شهادة الوفاة",
    canonical_name_ku: "بڕوانامەی مردن",
    aliases: ["شهادة وفاة", "بيان وفاة", "Death Certificate Iraq"],
    category: "IDENTITY_CIVIL",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الصحة — الإحصاء الحياتي",
    issuing_authority_en: "Ministry of Health — Vital Statistics",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["STANDARD_MOH_FORM"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "certificate_number", label_ar: "رقم شهادة الوفاة", label_en: "Death Certificate No.", label_ku: "ژمارەی بڕوانامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "deceased_name_ar", label_ar: "اسم المتوفى", label_en: "Deceased Full Name", label_ku: "ناوی کۆچکردوو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "date_of_death", label_ar: "تاريخ الوفاة", label_en: "Date of Death", label_ku: "ڕێکەوتی مردن", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_ESTATE_ACCOUNT_FREEZE_ESCALATION"],
    thresholds: { min_field_confidence: 0.90, auto_pass_composite: 0.99, escalation_floor: 0.85 },
    accepted_relationships: ["ESTATE_SUCCESSION_PROOF"],
    human_review_conditions: ["MANDATORY_LEGAL_ESTATE_REVIEW"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Always escalates to legal/compliance team for estate and inheritance verification.",
    schema_version: "1.0"
  },

  // ===========================================================================
  // CATEGORY B: RESIDENCE, ADDRESS, AND HOUSEHOLD DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "IRQ_RESIDENCE_CARD",
    canonical_name_en: "Iraqi Residence Card (Bitaqat Al-Sakan)",
    canonical_name_ar: "بطاقة السكن",
    canonical_name_ku: "کارتی نیشتەجێبوون",
    aliases: ["بطاقة سكن", "مكتب معلومات", "بطاقه السكن", "Residence Card Iraq", "Information Office Card"],
    category: "RESIDENCE_ADDRESS",
    entity_scope: "HOUSEHOLD",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الداخلية — مديرية شؤون السكن / مكتب المعلومات",
    issuing_authority_en: "Ministry of Interior — Directorate of Residency / Information Office",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Federal Governorates"],
    supported_generations: ["YELLOW_GREEN_PAPER_CARD", "UPDATED_PRINTED_CARD"],
    supported_languages: ["ar"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "head_of_family_name", label_ar: "اسم رب الأسرة", label_en: "Head of Family Name", label_ku: "ناوی سەرۆکی خێزان", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "information_office", label_ar: "مكتب معلومات", label_en: "Information Office", label_ku: "نووسینگەی زانیاری", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "full_address", label_ar: "عنوان السكن (محلة / زقاق / دار)", label_en: "Address (Mahalla/Zukak/Dar)", label_ku: "ناونیشان", field_type: "ADDRESS_IRAQI", required: true, normalizer: "IRAQI_ADDRESS_NORM", validators: ["VALID_IRAQI_ADDRESS"] },
      { key: "form_number", label_ar: "رقم الاستمارة", label_en: "Form Number", label_ku: "ژمارەی فۆڕم", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] },
      { key: "governorate", label_ar: "المحافظة", label_en: "Governorate", label_ku: "پارێزگا", field_type: "TEXT", required: false, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: ["RULE_IRAQI_ADDRESS_STRUCTURE", "RULE_FAMILY_SURNAME_LINEAGE_MATCH"],
    thresholds: { min_field_confidence: 0.82, auto_pass_composite: 0.87, escalation_floor: 0.68 },
    accepted_relationships: ["PRIMARY_ADDRESS_PROOF", "HOUSEHOLD_HEAD_OR_PATRONYMIC_MATCH"],
    human_review_conditions: ["ILLEGIBLE_CURSIVE_HANDWRITING", "ADDRESS_MISSING_MAHALLA_OR_DAR"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Often issued in the father's or spouse's name; requires patronymic lineage matching when applicant is a household member rather than the listed head.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "KRG_INFO_CARD",
    canonical_name_en: "KRG Residency / Information Card (Karti Zanyari)",
    canonical_name_ar: "بطاقة المعلومات — إقليم كوردستان",
    canonical_name_ku: "کارتی زانیاری — هەرێمی کوردستان",
    aliases: ["کارتی زانیاری", "كارتى زانيارى", "بطاقة معلومات اربيل", "بطاقة معلومات السليمانية", "KRG Information Card"],
    category: "RESIDENCE_ADDRESS",
    entity_scope: "HOUSEHOLD",
    can_establish_primary_identity: false,
    issuing_authority_ar: "حكومة إقليم كوردستان — وزارة الداخلية / مكتب المعلومات",
    issuing_authority_en: "Kurdistan Regional Government (KRG) — Ministry of Interior",
    jurisdiction: "KRG",
    supported_regions: ["Erbil (هەولێر)", "Sulaymaniyah (سلێمانی)", "Duhok (دهۆک)", "Halabja (هەڵەبجە)"],
    supported_generations: ["KRG_LAMINATED_CARD", "KRG_SMART_INFO_CARD"],
    supported_languages: ["ku", "ar"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "head_of_family_name", label_ar: "اسم رب الأسرة", label_en: "Head of Household (Kurdish/Arabic)", label_ku: "ناوی سەرۆکی خێزان", field_type: "PERSON_NAME", required: true, normalizer: "KURDISH_ARABIC_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "card_number", label_ar: "رقم البطاقة", label_en: "Information Card No.", label_ku: "ژمارەی کارت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] },
      { key: "neighborhood_address", label_ar: "الحي / المحلة", label_en: "Neighborhood / Sector", label_ku: "گەڕەک / کۆڵان / خانوو", field_type: "ADDRESS_IRAQI", required: true, normalizer: "KURDISH_ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "governorate", label_ar: "المحافظة", label_en: "KRG Governorate", label_ku: "پارێزگا", field_type: "TEXT", required: true, normalizer: "KRG_CITY_ALIGN", validators: [] }
    ],
    deterministic_rules: ["RULE_KRG_SORANI_NORMALIZATION", "RULE_BILINGUAL_NAME_RECONCILIATION"],
    thresholds: { min_field_confidence: 0.82, auto_pass_composite: 0.87, escalation_floor: 0.70 },
    accepted_relationships: ["PRIMARY_ADDRESS_PROOF"],
    human_review_conditions: ["LOW_KURDISH_OCR_CONFIDENCE", "NAME_TRANSLITERATION_DIVERGENCE"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Sorani Kurdish script uses distinct characters (ێ, ۆ, ڕ, ڵ, ڤ); phonetic transliteration to Arabic federal IDs can require human confirmation on rare tribal names.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_RATION_CARD",
    canonical_name_en: "Iraqi Food Ration Card (Al-Bitaqa Al-Tamwiniya)",
    canonical_name_ar: "البطاقة التموينية (الأسرية)",
    canonical_name_ku: "فۆرمی خۆراک (پسوولەی خۆراک)",
    aliases: ["البطاقة التموينية", "بطاقة التموين", "البطاقة التموينية الإلكترونية", "فۆرمی خۆراک", "Ration Card Iraq"],
    category: "RESIDENCE_ADDRESS",
    entity_scope: "HOUSEHOLD",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة التجارة — دائرة التخطيط والمتابعة",
    issuing_authority_en: "Ministry of Trade — Planning & Follow-up Directorate",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["PAPER_RATION_SHEET", "E_TAMKEEN_SMART_CARD_2024"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "FLEXIBLE_FORM",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "head_of_family_name", label_ar: "اسم رب الأسرة", label_en: "Head of Family", label_ku: "ناوی سەرۆکی خێزان", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "ration_center_number", label_ar: "رقم مركز التموين", label_en: "Ration Center No.", label_ku: "ژمارەی بنکەی خۆراک", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] },
      { key: "family_members_count", label_ar: "عدد أفراد الأسرة", label_en: "Family Member Count", label_ku: "ژمارەی ئەندامانی خێزان", field_type: "TEXT", required: false, normalizer: "DIGITS_ASCII", validators: [] },
      { key: "governorate", label_ar: "المحافظة", label_en: "Governorate", label_ku: "پارێزگا", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: ["RULE_SUPPORTING_HOUSEHOLD_RECORD"],
    thresholds: { min_field_confidence: 0.84, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["SECONDARY_ADDRESS_AND_HOUSEHOLD_PROOF"],
    human_review_conditions: ["PAPER_FOLD_OCCLUSION"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting household/address evidence; does not replace a primary civil ID.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_MUKHTAR_CERT",
    canonical_name_en: "Official Residency Confirmation Letter (Ta'yeed Sakan)",
    canonical_name_ar: "تأييد سكن مصدق (المختار / المجلس البلدي)",
    canonical_name_ku: "پشتگیری نیشتەجێبوون (موختار / شارەوانی)",
    aliases: ["تأييد سكن", "كتاب تأييد سكن", "شهادة سكن مختار", "Mukhtar Address Certificate"],
    category: "RESIDENCE_ADDRESS",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "المحافظة / القائمقامية / مختار المحلة",
    issuing_authority_en: "Provincial Council / District Qaimaqamiya / Neighborhood Mukhtar",
    jurisdiction: "MUNICIPAL_SYNDICATE",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["STAMPED_A4_LETTER"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "resident_name_ar", label_ar: "اسم الساكن", label_en: "Resident Full Name", label_ku: "ناوی دانیشتوو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "full_address", label_ar: "العنوان التفصيلي", label_en: "Detailed Address", label_ku: "ناونیشانی تەواو", field_type: "ADDRESS_IRAQI", required: true, normalizer: "IRAQI_ADDRESS_NORM", validators: ["NON_EMPTY_TEXT"] },
      { key: "issue_date", label_ar: "تاريخ الكتاب", label_en: "Letter Issue Date", label_ku: "ڕێکەوتی نووسراو", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "mukhtar_or_council_name", label_ar: "جهة التصديق / المختار", label_en: "Certifying Authority", label_ku: "لایەنی پەسەندکەر", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: ["RULE_RECENT_ISSUE_WITHIN_90_DAYS"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["ALTERNATIVE_ADDRESS_PROOF"],
    human_review_conditions: ["HANDWRITTEN_MUKHTAR_NOTE", "OLDER_THAN_90_DAYS"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Non-standardized municipal templates across neighborhoods; valid for 90 days from issue.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_UTILITY_BILL",
    canonical_name_en: "Electricity or Water Utility Bill",
    canonical_name_ar: "قائمة أجور الكهرباء أو الماء",
    canonical_name_ku: "پسوولەی کارەبا یان ئاو",
    aliases: ["قائمة كهرباء", "قائمة ماء", "وزارة الكهرباء", "فاتورة كهرباء", "Utility Bill Iraq"],
    category: "RESIDENCE_ADDRESS",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الكهرباء / أمانة بغداد / مديريات الماء",
    issuing_authority_en: "Ministry of Electricity / Mayoralty of Baghdad / Water Directorates",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["THERMAL_RECEIPT", "STANDARD_PAPER_BILL"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "FLEXIBLE_FORM",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "subscriber_name", label_ar: "اسم المشترك", label_en: "Subscriber Name", label_ku: "ناوی بەشداربوو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "account_or_meter_number", label_ar: "رقم الاشتراك / المقياس", label_en: "Account / Meter No.", label_ku: "ژمارەی هاوبەش", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "service_address", label_ar: "عنوان العقار", label_en: "Property Address", label_ku: "ناونیشان", field_type: "ADDRESS_IRAQI", required: true, normalizer: "IRAQI_ADDRESS_NORM", validators: ["NON_EMPTY_TEXT"] },
      { key: "billing_date", label_ar: "تاريخ الإصدار", label_en: "Billing Date", label_ku: "ڕێکەوتی پسوولە", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID", "RULE_SUPPORTING_ADDRESS_ONLY"],
    thresholds: { min_field_confidence: 0.80, auto_pass_composite: 0.90, escalation_floor: 0.72 },
    accepted_relationships: ["SUPPORTING_ADDRESS_EVIDENCE"],
    human_review_conditions: ["LANDLORD_NAME_DIFFERS_FROM_TENANT"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Iraqi utility bills frequently remain under a previous property owner's or grandfather's name; supplementary evidence only.",
    schema_version: "2.0"
  },

  // ===========================================================================
  // CATEGORY C: TRAVEL AND IMMIGRATION DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "FOREIGN_PASSPORT",
    canonical_name_en: "Foreign National Passport (Non-Iraqi)",
    canonical_name_ar: "جواز سفر أجنبي (غير عراقي)",
    canonical_name_ku: "پاسپۆرتی بیانی",
    aliases: ["Foreign Passport", "جواز سفر أجنبي", "International Passport"],
    category: "TRAVEL_IMMIGRATION",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: true,
    issuing_authority_ar: "دولة أجنبية — خاضع لضوابط الإقامة العراقية",
    issuing_authority_en: "Foreign Sovereign State (Requires Iraqi Residency/Visa Verification)",
    jurisdiction: "FOREIGN",
    supported_regions: ["International ICAO Doc 9303 States"],
    supported_generations: ["ICAO_TD3_STANDARD"],
    supported_languages: ["en", "ar"],
    required_sides: ["FRONT"],
    preprocessing_policy: "PASSPORT_BOOKLET",
    mrz_config: {
      has_mrz: true,
      format: "TD3",
      side: "FRONT",
      lines: 2,
      chars_per_line: 44
    },
    expected_fields: [
      { key: "passport_number", label_ar: "رقم جواز السفر", label_en: "Passport Number", label_ku: "ژمارەی پاسپۆرت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "issuing_country_code", label_ar: "رمز الدولة المصدرة", label_en: "Issuing State (3-Letter ICAO)", label_ku: "کۆدی وڵات", field_type: "TEXT", required: true, normalizer: "LATIN_UPPER", validators: ["NON_IRQ_COUNTRY_CODE"] },
      { key: "full_name_en", label_ar: "الاسم الكامل (لاتيني)", label_en: "Full Name (Latin)", label_ku: "ناوی تەواو", field_type: "PERSON_NAME", required: true, normalizer: "LATIN_UPPER", validators: ["NON_EMPTY_NAME"] },
      { key: "date_of_birth", label_ar: "تاريخ الولادة", label_en: "Date of Birth", label_ku: "ڕێکەوتی لەدایکبوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] },
      { key: "mrz_line1", label_ar: "سطر MRZ الأول", label_en: "TD3 MRZ Line 1", label_ku: "هێڵی MRZ 1", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: ["TD3_MRZ_CHECKSUM"] },
      { key: "mrz_line2", label_ar: "سطر MRZ الثاني", label_en: "TD3 MRZ Line 2", label_ku: "هێڵی MRZ 2", field_type: "MRZ_LINE", required: false, normalizer: "MRZ_CLEAN", validators: ["TD3_MRZ_CHECKSUM"] }
    ],
    deterministic_rules: [
      "RULE_TD3_MRZ_CHECKSUM",
      "RULE_FOREIGN_ISSUER_DISTINCTION",
      "RULE_FOREIGN_REQUIRES_RESIDENCY_OR_VISA",
      "RULE_EXPIRY_DATE_FUTURE"
    ],
    thresholds: { min_field_confidence: 0.88, auto_pass_composite: 0.95, escalation_floor: 0.78 },
    accepted_relationships: ["FOREIGN_APPLICANT_PRIMARY_ID"],
    human_review_conditions: ["FOREIGN_NATIONAL_EDD_POLICY", "MISSING_IRAQI_RESIDENCY_PERMIT"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Foreign nationals require pairing with valid Iraqi/KRG Residency Permit or Entry Visa under CBI KYC rules.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_RESIDENCE_PERMIT",
    canonical_name_en: "Iraqi / KRG Foreigner Residency Permit (Iqama)",
    canonical_name_ar: "إجازة / هوية الإقامة للأجانب",
    canonical_name_ku: "کارتی نشینگە (ئیقامە)",
    aliases: ["هوية الإقامة", "بطاقة الإقامة", "مديرية شؤون الإقامة", "کارتی نشینگە", "Iraqi Residence Permit"],
    category: "TRAVEL_IMMIGRATION",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الداخلية — مديرية شؤون الإقامة (بغداد / إقليم كوردستان)",
    issuing_authority_en: "Ministry of Interior — Directorate of Residency Affairs",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Governorates", "KRG"],
    supported_generations: ["BIOMETRIC_IQAMA_CARD"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "permit_number", label_ar: "رقم الإقامة", label_en: "Residency Permit No.", label_ku: "ژمارەی نشینگە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "holder_name", label_ar: "الاسم الكامل", label_en: "Holder Name", label_ku: "ناوی تەواو", field_type: "PERSON_NAME", required: true, normalizer: "LATIN_OR_ARABIC_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "passport_reference", label_ar: "رقم جواز السفر", label_en: "Linked Passport No.", label_ku: "ژمارەی پاسپۆرت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "expiry_date", label_ar: "تاريخ انتهاء الإقامة", label_en: "Permit Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_EXPIRY_DATE_FUTURE", "RULE_CROSS_CHECK_PASSPORT_NUMBER"],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.92, escalation_floor: 0.75 },
    accepted_relationships: ["FOREIGN_LEGAL_STAY_EVIDENCE"],
    human_review_conditions: ["EXPIRED_RESIDENCY_PERMIT", "PASSPORT_NUMBER_MISMATCH"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Must be paired with the underlying Foreign Passport; cross-checks passport number reference.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_ENTRY_VISA",
    canonical_name_en: "Iraqi Entry Visa (Simat Dukhul)",
    canonical_name_ar: "سمة دخول إلى جمهورية العراق (فيزا)",
    canonical_name_ku: "ڤیزای هاتنەژوورەوە",
    aliases: ["سمة دخول", "تأشيرة دخول العراق", "Iraq Entry Visa", "E-Visa Iraq"],
    category: "TRAVEL_IMMIGRATION",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الخارجية / وزارة الداخلية — مديرية شؤون الإقامة",
    issuing_authority_en: "Ministry of Foreign Affairs / Ministry of Interior",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Federal Iraq", "KRG E-Visa"],
    supported_generations: ["STICKER_VISA", "E_VISA_PORTRAIT_PDF"],
    supported_languages: ["ar", "en", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "FLEXIBLE_FORM",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "visa_number", label_ar: "رقم السمة / التأشيرة", label_en: "Visa Number", label_ku: "ژمارەی ڤیزا", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "passport_number", label_ar: "رقم الجواز", label_en: "Passport Number", label_ku: "ژمارەی پاسپۆرت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_EXPIRY_DATE_FUTURE"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.95, escalation_floor: 0.78 },
    accepted_relationships: ["TEMPORARY_STAY_EVIDENCE"],
    human_review_conditions: ["ALWAYS_REVIEW_SHORT_TERM_VISA"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Short-term visas restrict wallet tier eligibility under Central Bank regulations.",
    schema_version: "1.0"
  },

  // ===========================================================================
  // CATEGORY D: DRIVING, VEHICLE, AND TRANSPORT DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "IRQ_DRIVING_LICENSE",
    canonical_name_en: "Iraqi Driving License (Ijazat Al-Suq)",
    canonical_name_ar: "إجازة السوق العراقية",
    canonical_name_ku: "مۆڵەتی شۆفێری",
    aliases: ["إجازة السوق", "اجازة سوق", "رخصة قيادة عراقية", "مديرية المرور العامة إجازة سوق", "مۆڵەتی شۆفێری", "Driving License Iraq"],
    category: "DRIVING_VEHICLE",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الداخلية — مديرية المرور العامة",
    issuing_authority_en: "Ministry of Interior — General Directorate of Traffic",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Governorates", "KRG Traffic Directorates"],
    supported_generations: ["POLYCARBONATE_TRAFFIC_CARD"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "license_number", label_ar: "رقم إجازة السوق", label_en: "Driving License No.", label_ku: "ژمارەی مۆڵەت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "full_name_ar", label_ar: "الاسم الكامل", label_en: "Driver Full Name", label_ku: "ناوی شۆفێر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "date_of_birth", label_ar: "تاريخ الولادة", label_en: "Date of Birth", label_ku: "ڕێکەوتی لەدایکبوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "license_class", label_ar: "صنف الإجازة", label_en: "License Class (Private/Public)", label_ku: "جۆری مۆڵەت", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] },
      { key: "blood_group", label_ar: "فصيلة الدم", label_en: "Blood Group", label_ku: "گرووپی خوێن", field_type: "TEXT", required: false, normalizer: "ALPHANUM_UPPER", validators: [] }
    ],
    deterministic_rules: ["RULE_EXPIRY_DATE_FUTURE", "RULE_DRIVER_MINIMUM_AGE"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["DRIVER_QUALIFICATION_PROOF", "SECONDARY_PHOTO_ID"],
    human_review_conditions: ["EXPIRED_DRIVING_LICENSE", "NAME_MISMATCH_WITH_NATIONAL_ID"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Secondary photo ID and courier/transport merchant requirement; must pair with National ID for full banking KYC.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_VEHICLE_REGISTRATION",
    canonical_name_en: "Iraqi Vehicle Registration Card (Sanawiya)",
    canonical_name_ar: "شهادة تسجيل المركبة (السنوية)",
    canonical_name_ku: "ساڵیانەی ئۆتۆمبێل",
    aliases: ["سنوية المركبة", "شهادة تسجيل مركبة", "السنوية", "ساڵیانە", "Vehicle Registration Iraq", "Sanawiya"],
    category: "DRIVING_VEHICLE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة الداخلية — مديرية المرور العامة",
    issuing_authority_en: "Ministry of Interior — General Directorate of Traffic",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["SMART_SANAWIYA_CARD"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT", "BACK"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "owner_name_ar", label_ar: "اسم مالك المركبة", label_en: "Vehicle Owner Name", label_ku: "ناوی خاوەنی ئۆتۆمبێل", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "plate_number", label_ar: "رقم المركبة / اللوحة", label_en: "Plate Number", label_ku: "ژمارەی تابلۆ", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "chassis_vin", label_ar: "رقم الشاصي (VIN)", label_en: "17-Char Chassis VIN", label_ku: "ژمارەی شاسی", field_type: "VIN_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_VIN_17"] },
      { key: "expiry_date", label_ar: "تاريخ انتهاء السنوية", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_VIN_LENGTH_17", "RULE_EXPIRY_DATE_FUTURE", "RULE_OWNER_OR_POA_MATCH"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.72 },
    accepted_relationships: ["FLEET_OR_DELIVERY_ASSET_OWNERSHIP"],
    human_review_conditions: ["EXPIRED_SANAWIYA", "THIRD_PARTY_OWNER_WITHOUT_AUTHORIZATION"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Used for logistics/delivery merchant onboarding; if driver is not the owner on the Sanawiya, requires Power of Attorney or company authorization.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_VEHICLE_INSPECTION",
    canonical_name_en: "Vehicle Roadworthiness & Inspection Certificate (Fahs Al-Matana)",
    canonical_name_ar: "استمارة فحص المتانة والأمان للمركبات",
    canonical_name_ku: "پشکنینی توندوتۆڵی ئۆتۆمبێل",
    aliases: ["فحص المتانة", "شهادة فحص المركبة", "هزة المركبة", "Vehicle Inspection Iraq"],
    category: "DRIVING_VEHICLE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "مديرية المرور العامة — لجان الفحص الإلكتروني",
    issuing_authority_en: "General Directorate of Traffic — Electronic Inspection Stations",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["COMPUTERIZED_INSPECTION_SHEET"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "inspection_cert_number", label_ar: "رقم استمارة الفحص", label_en: "Inspection Form No.", label_ku: "ژمارەی فۆڕمی پشکنین", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "chassis_vin", label_ar: "رقم الشاصي", label_en: "Chassis VIN", label_ku: "ژمارەی شاسی", field_type: "VIN_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_VIN_17"] },
      { key: "inspection_date", label_ar: "تاريخ الفحص", label_en: "Inspection Date", label_ku: "ڕێکەوتی پشکنین", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["TRANSPORT_SAFETY_SUPPORTING_DOC"],
    human_review_conditions: ["VIN_MISMATCH_WITH_SANAWIYA"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting fleet roadworthiness record.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_VEHICLE_INSURANCE",
    canonical_name_en: "Motor Vehicle Insurance Policy",
    canonical_name_ar: "وثيقة التأمين الإلزامي أو الشامل للمركبات",
    canonical_name_ku: "بەڵگەنامەی دڵنیایی ئۆتۆمبێل",
    aliases: ["وثيقة تأمين مركبة", "شركة التأمين الوطنية", "بوليصة تأمين سيارة", "Vehicle Insurance Iraq"],
    category: "DRIVING_VEHICLE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "شركة التأمين الوطنية / شركات التأمين المجازة",
    issuing_authority_en: "National Insurance Company / Licensed Iraqi Insurers",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["A4_POLICY_CERTIFICATE"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "policy_number", label_ar: "رقم وثيقة التأمين", label_en: "Policy Number", label_ku: "ژمارەی دڵنیایی", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "insured_name", label_ar: "اسم المؤمن له", label_en: "Insured Name", label_ku: "ناوی دڵنیاکراو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "expiry_date", label_ar: "تاريخ انتهاء الوثيقة", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_EXPIRY_DATE_FUTURE"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["FLEET_INSURANCE_PROOF"],
    human_review_conditions: ["EXPIRED_INSURANCE_POLICY"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting fleet insurance verification document.",
    schema_version: "1.0"
  },

  // ===========================================================================
  // CATEGORY E: BUSINESS AND MERCHANT ONBOARDING DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "IRQ_CHAMBER_COMMERCE",
    canonical_name_en: "Iraqi Chamber of Commerce Membership & Trade License",
    canonical_name_ar: "هوية غرفة التجارة / إجازة ممارسة المهنة",
    canonical_name_ku: "ناسنامەی ژووری بازرگانی",
    aliases: [
      "غرفة تجارة بغداد", "هوية غرفة التجارة", "إجازة ممارسة المهنة", "اتحاد الغرف التجارية العراقية",
      "Chamber of Commerce Iraq", "Baghdad Chamber of Commerce"
    ],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "اتحاد الغرف التجارية العراقية — غرفة تجارة بغداد / المحافظات",
    issuing_authority_en: "Federation of Iraqi Chambers of Commerce",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "Basra", "Nineveh", "Najaf", "Karbala", "All Federal Governorates"],
    supported_generations: ["CARD_FORMAT", "A4_CERTIFICATE_FORMAT"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "FLEXIBLE_FORM",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "license_number", label_ar: "رقم الإجازة / العضوية", label_en: "Membership / License No.", label_ku: "ژمارەی مۆڵەت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_LICENSE_FORMAT"] },
      { key: "commercial_trade_name", label_ar: "الاسم التجاري", label_en: "Commercial Trade Name", label_ku: "ناوی بازرگانی", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "owner_name", label_ar: "اسم صاحب المجاز / المدير المفوض", label_en: "Owner / Managing Director Name", label_ku: "ناوی خاوەن کار", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "commercial_class", label_ar: "الصنف / الدرجة التجارية", label_en: "Commercial Class/Grade", label_ku: "پلەی بازرگانی", field_type: "TEXT", required: false, normalizer: "ARABIC_TEXT", validators: [] },
      { key: "issue_date", label_ar: "تاريخ الإصدار", label_en: "Issue Date", label_ku: "ڕێکەوتی دەرچوون", field_type: "DATE_GREGORIAN", required: false, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] },
      { key: "governorate", label_ar: "المحافظة", label_en: "Governorate", label_ku: "پارێزگا", field_type: "TEXT", required: false, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: [
      "RULE_EXPIRY_DATE_FUTURE",
      "RULE_OWNER_MATCHES_ID_OR_POA",
      "RULE_DISTINGUISH_ENTITY_FROM_INDIVIDUAL"
    ],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["MERCHANT_TRADE_AUTHORIZATION", "ENTITY_TO_OWNER_LINK"],
    human_review_conditions: ["EXPIRED_TRADE_LICENSE", "OWNER_NAME_CONFLICT_WITHOUT_POA"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Verifies optical document fields and cross-matches owner identity; live Chamber registry API lookup is EXTERNAL_VERIFICATION_UNAVAILABLE.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "KRG_CHAMBER_COMMERCE",
    canonical_name_en: "KRG Chamber of Commerce & Industry Certificate",
    canonical_name_ar: "شهادة غرفة التجارة والصناعة — إقليم كوردستان",
    canonical_name_ku: "بڕوانامەی ژووری بازرگانی و پیشەسازی هەرێمی کوردستان",
    aliases: ["ژووری بازرگانی و پیشەسازی", "غرفة تجارة وصناعة اربيل", "غرفة تجارة السليمانية", "Erbil Chamber of Commerce", "KRG Chamber of Commerce"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "اتحاد غرف التجارة والصناعة في إقليم كوردستان",
    issuing_authority_en: "KRG Federation of Chambers of Commerce & Industry (Erbil/Sulaymaniyah/Duhok)",
    jurisdiction: "KRG",
    supported_regions: ["Erbil", "Sulaymaniyah", "Duhok", "Halabja"],
    supported_generations: ["BILINGUAL_KRG_CERT"],
    supported_languages: ["ku", "ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "license_number", label_ar: "رقم التسجيل", label_en: "Registration Number", label_ku: "ژمارەی تۆمار", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_LICENSE_FORMAT"] },
      { key: "commercial_trade_name", label_ar: "الاسم التجاري", label_en: "Company / Trade Name", label_ku: "ناوی بازرگانی", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "KURDISH_ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "owner_name", label_ar: "اسم المالك / المدير المفوض", label_en: "Owner / Director Name", label_ku: "ناوی خاوەن کار / بەڕێوەبەری ڕێپێدراو", field_type: "PERSON_NAME", required: true, normalizer: "KURDISH_ARABIC_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] },
      { key: "governorate", label_ar: "المحافظة", label_en: "KRG Governorate", label_ku: "پارێزگا", field_type: "TEXT", required: true, normalizer: "KRG_CITY_ALIGN", validators: [] }
    ],
    deterministic_rules: [
      "RULE_KRG_SORANI_NORMALIZATION",
      "RULE_BILINGUAL_NAME_RECONCILIATION",
      "RULE_EXPIRY_DATE_FUTURE"
    ],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["MERCHANT_TRADE_AUTHORIZATION", "ENTITY_TO_OWNER_LINK"],
    human_review_conditions: ["EXPIRED_TRADE_LICENSE", "BILINGUAL_NAME_MISMATCH"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Reconciles Kurdish Sorani owner names against Arabic federal National IDs.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_COMPANY_REGISTRATION",
    canonical_name_en: "Certificate of Company Registration (Shahadat Tasjeel Sharika)",
    canonical_name_ar: "شهادة تأسيس / تسجيل شركة (دائرة مسجل الشركات)",
    canonical_name_ku: "بڕوانامەی تۆمارکردنی کۆمپانیا",
    aliases: ["شهادة تأسيس شركة", "دائرة تسجيل الشركات", "وزارة التجارة دائرة تسجيل الشركات", "Certificate of Incorporation Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة التجارة — دائرة تسجيل الشركات",
    issuing_authority_en: "Ministry of Trade — Registrar of Companies",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["OFFICIAL_REGISTRAR_CERT_A4"],
    supported_languages: ["ar", "en", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "registration_number", label_ar: "رقم التسجيل (العدد)", label_en: "Company Registration No.", label_ku: "ژمارەی تۆمار", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "company_legal_name", label_ar: "اسم الشركة الرسمي", label_en: "Legal Company Name", label_ku: "ناوی یاسایی کۆمپانیا", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "managing_director_name", label_ar: "اسم المدير المفوض", label_en: "Managing Director Name", label_ku: "ناوی بەڕێوەبەری ڕێپێدراو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "capital_iqd", label_ar: "رأس المال (دينار عراقي)", label_en: "Registered Capital (IQD)", label_ku: "سەرمایەی کۆمپانیا", field_type: "MONETARY_AMOUNT", required: false, normalizer: "DIGITS_ASCII", validators: [] },
      { key: "incorporation_date", label_ar: "تاريخ التأسيس", label_en: "Date of Incorporation", label_ku: "ڕێکەوتی دامەزراندن", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_DISTINGUISH_ENTITY_FROM_INDIVIDUAL", "RULE_DIRECTOR_OR_POA_LINK"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.72 },
    accepted_relationships: ["CORPORATE_LEGAL_EXISTENCE", "ENTITY_TO_MANAGING_DIRECTOR"],
    human_review_conditions: ["DIRECTOR_DIFFERS_FROM_APPLICANT_WITHOUT_POA"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Establishes corporate entity existence; managing director or authorized representative must still provide primary personal ID.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_TAX_CARD",
    canonical_name_en: "Iraqi Taxpayer ID & Tax Clearance Certificate",
    canonical_name_ar: "الهوية الضريبية / براءة الذمة الضريبية",
    canonical_name_ku: "ناسنامەی باج / ئەستۆپاکی باج",
    aliases: ["الهوية الضريبية", "براءة الذمة الضريبية", "الهيئة العامة للضرائب", "الرقم الضريبي", "Tax Card Iraq", "TIN Certificate Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة المالية — الهيئة العامة للضرائب",
    issuing_authority_en: "Ministry of Finance — General Commission for Taxes",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Governorates", "KRG Tax Directorate"],
    supported_generations: ["TAX_CARD_V1", "E_TAX_CLEARANCE_QR"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "tax_id_number", label_ar: "الرقم الضريبي (TIN)", label_en: "Tax Identification No. (TIN)", label_ku: "ژمارەی باج", field_type: "TAX_ID", required: true, normalizer: "DIGITS_ASCII", validators: ["VALID_TAX_ID"] },
      { key: "taxpayer_name", label_ar: "اسم المكلف / الشركة", label_en: "Taxpayer / Entity Name", label_ku: "ناوی باجدەر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "national_id_reference", label_ar: "الرقم الوطني للمكلف", label_en: "Linked 12-Digit National ID", label_ku: "ژمارەی نیشتمانی", field_type: "NATIONAL_ID_12", required: false, normalizer: "DIGITS_ASCII", validators: ["VALID_NATIONAL_ID_12"] },
      { key: "tax_branch", label_ar: "فرع الضريبة", label_en: "Tax Branch", label_ku: "لقی باج", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] },
      { key: "tax_year_status", label_ar: "السنة المالية", label_en: "Fiscal Year", label_ku: "ساڵی دارایی", field_type: "TEXT", required: true, normalizer: "DIGITS_ASCII", validators: [] }
    ],
    deterministic_rules: ["RULE_TAX_ID_FORMAT", "RULE_CROSS_CHECK_NATIONAL_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["TAX_COMPLIANCE_PROOF"],
    human_review_conditions: ["NATIONAL_ID_REFERENCE_MISMATCH", "INVALID_TAX_ID_LENGTH"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Validates TIN format and cross-references National ID; live General Commission for Taxes database check is EXTERNAL_VERIFICATION_UNAVAILABLE.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_MUNICIPAL_PERMIT",
    canonical_name_en: "Municipality Business & Health Permit (Ijazat Al-Baladiya)",
    canonical_name_ar: "إجازة البلدية / إجازة صحية لممارسة المهنة",
    canonical_name_ku: "مۆڵەتی شارەوانی و تەندروستی",
    aliases: ["إجازة البلدية", "أمانة بغداد إجازة مهنة", "الإجازة الصحية", "Municipal Permit Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "أمانة بغداد / مديريات البلديات في المحافظات / وزارة الصحة",
    issuing_authority_en: "Mayoralty of Baghdad / Provincial Municipalities",
    jurisdiction: "MUNICIPAL_SYNDICATE",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["MUNICIPAL_A4_PERMIT"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "permit_number", label_ar: "رقم الإجازة البلدية", label_en: "Permit Number", label_ku: "ژمارەی مۆڵەت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "shop_or_trade_name", label_ar: "اسم المحل / النشاط", label_en: "Shop / Business Name", label_ku: "ناوی شوێنکار", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "owner_name", label_ar: "اسم صاحب الإجازة", label_en: "Permit Holder Name", label_ku: "ناوی خاوەن مۆڵەت", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_EXPIRY_DATE_FUTURE", "RULE_OWNER_MATCHES_ID_OR_POA"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.89, escalation_floor: 0.72 },
    accepted_relationships: ["SOLE_PROPRIETOR_SHOP_PERMIT"],
    human_review_conditions: ["EXPIRED_PERMIT"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Used by neighborhood shops, restaurants, and pharmacies.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_AUTHORIZED_SIGNATORY",
    canonical_name_en: "Authorized Signatory Board Resolution / Letter",
    canonical_name_ar: "كتاب تخويل بالتوقيع وإدارة الحساب المصرفي",
    canonical_name_ku: "نووسراوی ڕێپێدان بە واژۆکردن",
    aliases: ["كتاب تخويل بالتوقيع", "قرار مجلس إدارة بالتخويل", "تخويل فتح حساب شركة", "Authorized Signatory Resolution"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "REPRESENTATIVE_LINK",
    can_establish_primary_identity: false,
    issuing_authority_ar: "الشركة المؤسسة / مصدق من مسجل الشركات",
    issuing_authority_en: "Corporate Board of Directors / Certified by Registrar of Companies",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["CORPORATE_LETTERHEAD_A4"],
    supported_languages: ["ar", "en", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "resolution_number", label_ar: "رقم كتاب التخويل", label_en: "Resolution / Ref No.", label_ku: "ژمارەی نووسراو", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "company_legal_name", label_ar: "اسم الشركة المانحة للتخويل", label_en: "Authorizing Company Name", label_ku: "ناوی کۆمپانیا", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "authorized_person_name", label_ar: "اسم الشخص المخول بالتوقيع", label_en: "Authorized Signatory Name", label_ku: "ناوی کەسی ڕێپێدراو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "issue_date", label_ar: "تاريخ التخويل", label_en: "Issue Date", label_ku: "ڕێکەوتی دەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_REPRESENTATIVE_AUTHORIZATION_CHAIN"],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.92, escalation_floor: 0.75 },
    accepted_relationships: ["CORPORATE_TO_SIGNATORY_DELEGATION"],
    human_review_conditions: ["CORPORATE_DELEGATION_LEGAL_REVIEW"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Links an individual signatory to a corporate entity; requires legal compliance confirmation of corporate seal.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_COMMERCIAL_CONTRACT",
    canonical_name_en: "Company Memorandum of Association / Commercial Contract",
    canonical_name_ar: "عقد تأسيس الشركة / عقد تجاري مصدق",
    canonical_name_ku: "گرێبەستی دامەزراندنی کۆمپانیا",
    aliases: ["عقد تأسيس شركة", "بيان تأسيس شركة", "عقد إيجار تجاري", "Memorandum of Association Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة التجارة — دائرة تسجيل الشركات / نقابة المحامين",
    issuing_authority_en: "Ministry of Trade / Iraqi Bar Association",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["MULTI_PAGE_LEGAL_CONTRACT"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "company_legal_name", label_ar: "اسم الشركة", label_en: "Company Name", label_ku: "ناوی کۆمپانیا", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "founder_names", label_ar: "أسماء المؤسسين / المساهمين", label_en: "Founders / Shareholders", label_ku: "ناوی دامەزرێنەران", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "contract_date", label_ar: "تاريخ العقد", label_en: "Contract Date", label_ku: "ڕێکەوتی گرێبەست", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_DISTINGUISH_ENTITY_FROM_INDIVIDUAL"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.92, escalation_floor: 0.75 },
    accepted_relationships: ["CORPORATE_BYLAWS_AND_FOUNDERS"],
    human_review_conditions: ["MULTI_CLAUSE_LEGAL_REVIEW"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Multi-page legal text requires human compliance verification of shareholding clauses.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_SHAREHOLDER_REGISTER",
    canonical_name_en: "Company Shareholder & Beneficial Ownership Record (UBO)",
    canonical_name_ar: "سجل المساهمين والمستفيد الحقيقي (محضر الهيئة العامة)",
    canonical_name_ku: "تۆماری پشکداران و خاوەندارێتی",
    aliases: ["سجل المساهمين", "محضر اجتماع الهيئة العامة", "المستفيد الحقيقي", "Shareholder Register Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة التجارة — دائرة تسجيل الشركات",
    issuing_authority_en: "Ministry of Trade — Registrar of Companies",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["CERTIFIED_MINUTE_RECORD"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "company_legal_name", label_ar: "اسم الشركة", label_en: "Company Name", label_ku: "ناوی کۆمپانیا", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "majority_shareholder_name", label_ar: "المساهم الرئيسي / المالك المستفيد", label_en: "Primary Beneficial Owner", label_ku: "خاوەنی سەرەکی", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "ownership_percentage", label_ar: "نسبة التملك (%)", label_en: "Ownership Share (%)", label_ku: "ڕێژەی خاوەندارێتی", field_type: "TEXT", required: false, normalizer: "DIGITS_ASCII", validators: [] }
    ],
    deterministic_rules: ["RULE_UBO_COMPLIANCE_CHECK"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.94, escalation_floor: 0.78 },
    accepted_relationships: ["UBO_OWNERSHIP_LINK"],
    human_review_conditions: ["MANDATORY_KYB_UBO_REVIEW"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Used for Ultimate Beneficial Owner (UBO) verification on corporate merchant accounts.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_IMPORT_EXPORT_LICENSE",
    canonical_name_en: "Iraqi Import / Export Identity License",
    canonical_name_ar: "هوية مستورد / مصدر (الشركة العامة للمعارض العراقية)",
    canonical_name_ku: "ناسنامەی هاوردەکار و هەناردەکار",
    aliases: ["هوية مستورد", "إجازة استيراد", "الشركة العامة للمعارض والخدمات التجارية", "Import License Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "BUSINESS_ENTITY",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة التجارة — الشركة العامة للمعارض والخدمات التجارية العراقية",
    issuing_authority_en: "Ministry of Trade — State Company for Iraqi Fairs & Commercial Services",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Governorates", "KRG"],
    supported_generations: ["IMPORTER_ID_CARD"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "importer_id_number", label_ar: "رقم هوية المستورد", label_en: "Importer ID No.", label_ku: "ژمارەی هاوردەکار", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "company_or_trader_name", label_ar: "اسم الشركة / التاجر", label_en: "Company / Trader Name", label_ku: "ناوی کۆمپانیا", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "expiry_date", label_ar: "تاريخ النفاذ", label_en: "Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_EXPIRY_DATE_FUTURE"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["CROSS_BORDER_TRADE_PERMIT"],
    human_review_conditions: ["EXPIRED_IMPORTER_ID"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting trade credential for B2B cross-border settlement merchants.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_CUSTOMS_DECLARATION",
    canonical_name_en: "Iraqi Customs Clearance Declaration (Tasriha Kumrukiya)",
    canonical_name_ar: "التصريحة الكمركية (الهيئة العامة للكمارك)",
    canonical_name_ku: "بەیاننامەی گومرگی",
    aliases: ["تصريحة كمركية", "بيان كمركي", "الهيئة العامة للكمارك", "Customs Declaration Iraq"],
    category: "BUSINESS_MERCHANT",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة المالية — الهيئة العامة للكمارك",
    issuing_authority_en: "Ministry of Finance — General Authority of Customs",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Border Crossings & Ports"],
    supported_generations: ["ASYCUDA_CUSTOMS_FORM"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "declaration_number", label_ar: "رقم التصريحة الكمركية", label_en: "Declaration Number", label_ku: "ژمارەی گومرگ", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "importer_name", label_ar: "اسم المستورد", label_en: "Importer Name", label_ku: "ناوی هاوردەکار", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "clearance_date", label_ar: "تاريخ التخليص", label_en: "Clearance Date", label_ku: "ڕێکەوتی گومرگ", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.92, escalation_floor: 0.78 },
    accepted_relationships: ["TRADE_SHIPMENT_EVIDENCE"],
    human_review_conditions: ["ALWAYS_REVIEW_CUSTOMS_MANIFEST"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting commercial shipment verification document.",
    schema_version: "1.0"
  },

  // ===========================================================================
  // CATEGORY F: EDUCATION, EMPLOYMENT, AND INCOME DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "IRQ_SYNDICATE_ID",
    canonical_name_en: "Iraqi Professional Syndicate ID (Doctors, Engineers, Lawyers, Pharmacists)",
    canonical_name_ar: "هوية النقابة المهنية (أطباء / مهندسين / محامين / صيادلة)",
    canonical_name_ku: "ناسنامەی سەندیکای پیشەیی",
    aliases: [
      "نقابة أطباء العراق", "نقابة المهندسين العراقية", "نقابة المحامين العراقيين", "نقابة الصيادلة",
      "هوية نقابة", "Professional Syndicate ID Iraq"
    ],
    category: "EDUCATION_EMPLOYMENT_INCOME",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "النقابات المهنية العراقية (الأطباء / المهندسين / المحامين / الصيادلة)",
    issuing_authority_en: "Iraqi Professional Syndicates (Medical, Engineering, Bar, Pharmacy)",
    jurisdiction: "MUNICIPAL_SYNDICATE",
    supported_regions: ["Baghdad", "All Governorates", "KRG Syndicates"],
    supported_generations: ["PLASTIC_SYNDICATE_CARD"],
    supported_languages: ["ar", "en", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "membership_number", label_ar: "رقم الانتماء / الهوية", label_en: "Syndicate Membership No.", label_ku: "ژمارەی ئەندامێتی", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "member_name_ar", label_ar: "اسم العضو المهني", label_en: "Member Full Name", label_ku: "ناوی ئەندام", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "syndicate_name", label_ar: "اسم النقابة", label_en: "Syndicate Name", label_ku: "ناوی سەندیکا", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "professional_title", label_ar: "المرتبة / الاختصاص", label_en: "Professional Rank / Specialty", label_ku: "پسپۆڕی", field_type: "TEXT", required: false, normalizer: "ARABIC_TEXT", validators: [] },
      { key: "expiry_date", label_ar: "تاريخ التجديد / النفاذ", label_en: "Renewal / Expiry Date", label_ku: "ڕێکەوتی بەسەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_FUTURE_EXPIRY"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID", "RULE_EXPIRY_DATE_FUTURE", "RULE_NAME_MATCHES_PRIMARY_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.88, escalation_floor: 0.70 },
    accepted_relationships: ["PROFESSIONAL_PRACTICE_CREDENTIAL"],
    human_review_conditions: ["EXPIRED_SYNDICATE_ID", "MISSING_PRIMARY_IDENTITY_DOCUMENT"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Establishes professional status for clinics, law offices, and engineering bureaus; must pair with National ID or Passport.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_EMPLOYMENT_LETTER",
    canonical_name_en: "Official Employment & Salary Continuity Letter (Ta'yeed Istimrar bil-Khidma)",
    canonical_name_ar: "كتاب تأييد استمرار بالخدمة ومقدار الراتب",
    canonical_name_ku: "پشتگیری بەردەوامبوون لە کار و مووچە",
    aliases: ["تأييد استمرار بالخدمة", "كتاب تأييد راتب", "معنون إلى زين كاش", "Employment Verification Letter Iraq"],
    category: "EDUCATION_EMPLOYMENT_INCOME",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "الوزارات والدوائر الحكومية / شركات القطاع الخاص",
    issuing_authority_en: "Iraqi Ministries, State Institutions & Private Employers",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["OFFICIAL_MINISTRY_A4_LETTER"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "letter_reference_number", label_ar: "العدد / رقم الكتاب الرسمي", label_en: "Official Outgoing Ref No.", label_ku: "ژمارەی نووسراو", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "employee_name_ar", label_ar: "اسم الموظف", label_en: "Employee Full Name", label_ku: "ناوی فەرمانبەر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "employer_entity", label_ar: "الجهة / الدائرة المصدرة", label_en: "Employer / Ministry Name", label_ku: "فەرمانگە / وەزارەت", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "monthly_salary_iqd", label_ar: "مقدار الراتب الكلي (د.ع)", label_en: "Monthly Salary (IQD)", label_ku: "بڕی مووچە", field_type: "MONETARY_AMOUNT", required: false, normalizer: "DIGITS_ASCII", validators: [] },
      { key: "issue_date", label_ar: "تاريخ الكتاب", label_en: "Letter Date", label_ku: "ڕێکەوتی نووسراو", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID", "RULE_RECENT_ISSUE_WITHIN_60_DAYS"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.72 },
    accepted_relationships: ["INCOME_AND_EMPLOYMENT_EVIDENCE"],
    human_review_conditions: ["MISSING_PRIMARY_IDENTITY_DOCUMENT", "LETTER_OLDER_THAN_60_DAYS"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Cannot independently establish a person's identity; must always be accompanied by a valid primary ID.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_EMPLOYER_ID",
    canonical_name_en: "Ministry or Corporate Employee ID Card (Huwiyat Muwazzaf)",
    canonical_name_ar: "هوية موظف حكومي أو قطاع خاص",
    canonical_name_ku: "ناسنامەی فەرمانبەر",
    aliases: ["هوية موظف", "باج دائرة", "هوية منتسب", "Employee ID Iraq"],
    category: "EDUCATION_EMPLOYMENT_INCOME",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "الوزارات والمؤسسات الحكومية والشركات",
    issuing_authority_en: "Government Ministries & Private Corporations",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["PLASTIC_BADGE_CARD"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "ID_CARD_LANDSCAPE",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "badge_number", label_ar: "الرقم الوظيفي / رقم الهوية", label_en: "Employee Badge No.", label_ku: "ژمارەی ناسنامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "employee_name_ar", label_ar: "اسم الموظف", label_en: "Employee Name", label_ku: "ناوی فەرمانبەر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "employer_name", label_ar: "اسم الوزارة / المؤسسة", label_en: "Ministry / Employer", label_ku: "لایەنی کار", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.72 },
    accepted_relationships: ["SUPPLEMENTARY_EMPLOYMENT_ID"],
    human_review_conditions: ["MISSING_PRIMARY_IDENTITY_DOCUMENT"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting employment credential; does not establish primary civil identity on its own.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_SALARY_SLIP",
    canonical_name_en: "Salary Slip / Payroll Statement (Shareet Al-Ratib)",
    canonical_name_ar: "شريط الراتب / كشف توطين الراتب",
    canonical_name_ku: "پسوولەی مووچە",
    aliases: ["شريط الراتب", "كشف راتب", "توطين الراتب", "Payslip Iraq", "Salary Certificate"],
    category: "EDUCATION_EMPLOYMENT_INCOME",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "الدوائر الحسابية للوزارات / المصارف الموطنة",
    issuing_authority_en: "Ministry Accounting Departments / Payroll Banks",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["PRINTED_PAYSLIP"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "employee_name_ar", label_ar: "اسم الموظف", label_en: "Employee Name", label_ku: "ناوی فەرمانبەر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "net_salary_iqd", label_ar: "صافي الراتب (د.ع)", label_en: "Net Salary (IQD)", label_ku: "مووچەی سافی", field_type: "MONETARY_AMOUNT", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] },
      { key: "salary_month", label_ar: "شهر الراتب", label_en: "Payroll Month", label_ku: "مانگی مووچە", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: [] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["PROOF_OF_INCOME"],
    human_review_conditions: ["MISSING_PRIMARY_IDENTITY_DOCUMENT"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Proof of income for wallet limit upgrades; cannot establish primary identity.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_DEGREE_CERT",
    canonical_name_en: "University Graduation Certificate / Academic Degree (Wathiqat Takharruj)",
    canonical_name_ar: "وثيقة تخرج جامعية / شهادة دراسية",
    canonical_name_ku: "بڕوانامەی دەرچوونی زانکۆ",
    aliases: ["وثيقة تخرج", "شهادة جامعية", "وزارة التعليم العالي والبحث العلمي", "Graduation Certificate Iraq"],
    category: "EDUCATION_EMPLOYMENT_INCOME",
    entity_scope: "INDIVIDUAL",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة التعليم العالي والبحث العلمي — الجامعات العراقية",
    issuing_authority_en: "Ministry of Higher Education & Scientific Research",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG Universities"],
    supported_generations: ["BILINGUAL_DEGREE_A4"],
    supported_languages: ["ar", "en", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "document_number", label_ar: "العدد / رقم الوثيقة", label_en: "Document Ref No.", label_ku: "ژمارەی بڕوانامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "graduate_name_ar", label_ar: "اسم الخريج", label_en: "Graduate Name", label_ku: "ناوی دەرچوو", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "university_and_college", label_ar: "الجامعة / الكلية", label_en: "University & College", label_ku: "زانکۆ و کۆلێژ", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.92, escalation_floor: 0.75 },
    accepted_relationships: ["EDUCATIONAL_QUALIFICATION_PROOF"],
    human_review_conditions: ["MISSING_PRIMARY_IDENTITY_DOCUMENT"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting qualification record; cannot establish identity without primary ID.",
    schema_version: "1.0"
  },

  // ===========================================================================
  // CATEGORY G: FINANCIAL AND SUPPORTING EVIDENCE
  // ===========================================================================
  {
    doc_type_id: "IRQ_BANK_STATEMENT",
    canonical_name_en: "Iraqi Bank Account Statement (Kashf Hisab Masrafi)",
    canonical_name_ar: "كشف حساب مصرفي رسمي",
    canonical_name_ku: "کەشفی هەژماری بانکی",
    aliases: ["كشف حساب مصرفي", "مصرف الرافدين", "مصرف الرشيد", "المصرف العراقي للتجارة", "Bank Statement Iraq", "IBAN Statement"],
    category: "FINANCIAL_EVIDENCE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "المصارف العراقية المجازة من البنك المركزي العراقي",
    issuing_authority_en: "CBI-Licensed Iraqi State & Commercial Banks",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["CORE_BANKING_A4_STATEMENT"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "account_holder_name", label_ar: "اسم صاحب الحساب", label_en: "Account Holder Name", label_ku: "ناوی خاوەن هەژمار", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "iban_number", label_ar: "رقم الحساب الدولي (IBAN)", label_en: "Iraqi IBAN (23 Chars)", label_ku: "ژمارەی IBAN", field_type: "IBAN_IRQ", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_IRAQI_IBAN"] },
      { key: "bank_name", label_ar: "اسم المصرف", label_en: "Issuing Bank Name", label_ku: "ناوی بانک", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "closing_balance_iqd", label_ar: "الرصيد الختامي", label_en: "Closing Balance", label_ku: "باڵانسی کۆتایی", field_type: "MONETARY_AMOUNT", required: false, normalizer: "DIGITS_ASCII", validators: [] },
      { key: "statement_date", label_ar: "تاريخ الكشف", label_en: "Statement Date", label_ku: "ڕێکەوتی کەشف", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_IRAQI_IBAN_23_CHARS", "RULE_CANNOT_SOLO_ESTABLISH_ID", "RULE_HOLDER_MATCHES_APPLICANT_OR_ENTITY"],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["BANK_ACCOUNT_LINKAGE_EVIDENCE", "PROOF_OF_FUNDS"],
    human_review_conditions: ["INVALID_IBAN_FORMAT", "HOLDER_NAME_MISMATCH"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Validates 23-character Iraqi IBAN structure and account holder name; no direct core banking API integration is claimed (EXTERNAL_VERIFICATION_UNAVAILABLE).",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_IBAN_LETTER",
    canonical_name_en: "Bank Account Ownership & IBAN Confirmation Letter",
    canonical_name_ar: "كتاب تأييد ملكية الحساب المصرفي والـ IBAN",
    canonical_name_ku: "پشتگیری خاوەندارێتی هەژماری بانکی و IBAN",
    aliases: ["كتاب تأييد IBAN", "تأييد رقم حساب مصرفي", "شهادة آيبان", "IBAN Confirmation Letter Iraq"],
    category: "FINANCIAL_EVIDENCE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "المصارف العراقية المجازة",
    issuing_authority_en: "CBI-Licensed Iraqi Banks",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["STAMPED_BANK_LETTER"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "account_holder_name", label_ar: "اسم صاحب الحساب", label_en: "Account Holder Name", label_ku: "ناوی خاوەن هەژمار", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "iban_number", label_ar: "رقم الـ IBAN", label_en: "Iraqi IBAN (23 Chars)", label_ku: "ژمارەی IBAN", field_type: "IBAN_IRQ", required: true, normalizer: "ALPHANUM_UPPER", validators: ["VALID_IRAQI_IBAN"] },
      { key: "bank_name", label_ar: "اسم المصرف والفرع", label_en: "Bank & Branch Name", label_ku: "ناوی بانک و لق", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] }
    ],
    deterministic_rules: ["RULE_IRAQI_IBAN_23_CHARS", "RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.90, escalation_floor: 0.75 },
    accepted_relationships: ["MERCHANT_SETTLEMENT_ACCOUNT_PROOF"],
    human_review_conditions: ["INVALID_IBAN_FORMAT"],
    support_status: "CONFIGURED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Optical IBAN format check only; interbank settlement verification requires live switch integration.",
    schema_version: "1.5"
  },

  {
    doc_type_id: "IRQ_COMMERCIAL_INVOICE",
    canonical_name_en: "Commercial Invoice or Payment Receipt (Wasl Tijari / Fatura)",
    canonical_name_ar: "فاتورة تجارية / وصل قبض",
    canonical_name_ku: "پسوولەی بازرگانی / وەسڵ",
    aliases: ["وصل قبض", "فاتورة تجارية", "قائمة بيع", "Commercial Invoice Iraq"],
    category: "FINANCIAL_EVIDENCE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "الشركات والمكاتب التجارية",
    issuing_authority_en: "Commercial Merchants & Suppliers",
    jurisdiction: "MUNICIPAL_SYNDICATE",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["PRINTED_OR_HANDWRITTEN_INVOICE"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "invoice_number", label_ar: "رقم الفاتورة / الوصل", label_en: "Invoice Number", label_ku: "ژمارەی پسوولە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "vendor_name", label_ar: "اسم المجهز / التاجر", label_en: "Vendor Name", label_ku: "ناوی فرۆشیار", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "total_amount", label_ar: "المبلغ الإجمالي", label_en: "Total Amount", label_ku: "کۆی گشتی", field_type: "MONETARY_AMOUNT", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.82, auto_pass_composite: 0.92, escalation_floor: 0.72 },
    accepted_relationships: ["COMMERCIAL_ACTIVITY_EVIDENCE"],
    human_review_conditions: ["HANDWRITTEN_INVOICE_TOTAL_CHECK"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Supporting evidence of commercial transaction volume.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_PROOF_OF_FUNDS",
    canonical_name_en: "Proof of Funds / Financial Solvency Certificate (Kafala / Mala'a Maliya)",
    canonical_name_ar: "شهادة الملاءة المالية / إثبات مصدر الأموال",
    canonical_name_ku: "بڕوانامەی توانای دارایی",
    aliases: ["كفاءة مالية", "ملاءة مالية", "إثبات مصدر الأموال", "Proof of Funds Iraq"],
    category: "FINANCIAL_EVIDENCE",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "المصارف العراقية المجازة",
    issuing_authority_en: "Licensed Iraqi Banks",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["BANK_SOLVENCY_CERT"],
    supported_languages: ["ar", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "certificate_number", label_ar: "رقم كتاب الملاءة", label_en: "Certificate Ref No.", label_ku: "ژمارەی بڕوانامە", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "client_name", label_ar: "اسم الزبون / الشركة", label_en: "Client / Entity Name", label_ku: "ناوی بریکار", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "certified_amount", label_ar: "مبلغ الملاءة المالية", label_en: "Certified Balance", label_ku: "بڕی پارە", field_type: "MONETARY_AMOUNT", required: true, normalizer: "DIGITS_ASCII", validators: ["NON_EMPTY_ID"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.88, auto_pass_composite: 0.95, escalation_floor: 0.80 },
    accepted_relationships: ["HIGH_TIER_EDD_FUNDS_SOURCE"],
    human_review_conditions: ["MANDATORY_EDD_COMPLIANCE_REVIEW"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "High-value Enhanced Due Diligence (EDD) evidence; always routed to senior compliance officer.",
    schema_version: "1.0"
  },

  // ===========================================================================
  // CATEGORY H: LEGAL, AUTHORIZATION, AND OTHER OFFICIAL DOCUMENTS
  // ===========================================================================
  {
    doc_type_id: "IRQ_POWER_OF_ATTORNEY",
    canonical_name_en: "Notarized Iraqi Power of Attorney (Wakala Aama / Khassa)",
    canonical_name_ar: "وكالة عامة أو خاصة مصدقة (دائرة الكاتب العدل)",
    canonical_name_ku: "بریکارنامەی گشتی یان تایبەت (فەرمانگەی دادنووس)",
    aliases: [
      "وكالة عامة", "وكالة خاصة", "دائرة الكاتب العدل", "وزارة العدل الكاتب العدل",
      "بریکارنامە", "Power of Attorney Iraq", "Notary Public Iraq"
    ],
    category: "LEGAL_AUTHORIZATION",
    entity_scope: "REPRESENTATIVE_LINK",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة العدل — دائرة الكتاب العدول",
    issuing_authority_en: "Ministry of Justice — Notary Public Directorate",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Governorates", "KRG Notary Offices"],
    supported_generations: ["BARCODED_NOTARY_DEED", "LEGACY_STAMPED_DEED"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "notary_record_number", label_ar: "رقم السجل / العدد العدلي", label_en: "Notary Record Number", label_ku: "ژمارەی تۆماری دادنووس", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "notary_office_name", label_ar: "دائرة الكاتب العدل", label_en: "Notary Public Office", label_ku: "فەرمانگەی دادنووس", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "grantor_name", label_ar: "اسم الموكِّل (الأصيل)", label_en: "Grantor / Principal Name", label_ku: "ناوی بریکاردرێژ (موەککیل)", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "grantee_name", label_ar: "اسم الوكيل (المفوض)", label_en: "Grantee / Representative Name", label_ku: "ناوی بریکار (وەکیل)", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "poa_scope", label_ar: "نطاق الوكالة والصلاحيات المالية", label_en: "Scope of Financial Authority", label_ku: "بواری دەسەڵات", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "issue_date", label_ar: "تاريخ تنظيم الوكالة", label_en: "Execution Date", label_ku: "ڕێکەوتی دەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: [
      "RULE_POA_GRANTOR_GRANTEE_PRESENT",
      "RULE_REPRESENTATIVE_AUTHORIZATION_CHAIN",
      "RULE_LEGAL_VALIDITY_REQUIRES_HUMAN_CONFIRMATION"
    ],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.95, escalation_floor: 0.78 },
    accepted_relationships: ["PRINCIPAL_TO_AGENT_LEGAL_DELEGATION"],
    human_review_conditions: ["MANDATORY_LEGAL_POA_VERIFICATION"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Extracts Grantor, Grantee, Notary Office, and Scope to reconcile third-party representative submissions. Text extraction alone does not prove active non-revocation at the Ministry of Justice (always escalates for final legal sign-off).",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_PROPERTY_DEED",
    canonical_name_en: "Real Estate Title Deed (Sanad Al-Tasjeel Al-Aqari / Tapu Form 23)",
    canonical_name_ar: "سند التسجيل العقاري (الطابو — نموذج 23)",
    canonical_name_ku: "سەنەدی تۆماری خانوبەرە (تاپۆ)",
    aliases: ["سند التسجيل العقاري", "سند طابو", "نموذج 23 عقاري", "دائرة التسجيل العقاري", "Tapu Deed Iraq"],
    category: "LEGAL_AUTHORIZATION",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: "وزارة العدل — دائرة التسجيل العقاري",
    issuing_authority_en: "Ministry of Justice — Real Estate Registration Directorate",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["Baghdad", "All Governorates", "KRG"],
    supported_generations: ["FORM_23_TAPU"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "plot_and_sector_number", label_ar: "رقم القطعة والمقاطعة", label_en: "Plot & Sector No.", label_ku: "ژمارەی پارچە و کەرت", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "owner_name_ar", label_ar: "اسم المالك الشرعي", label_en: "Property Owner Name", label_ku: "ناوی خاوەن موڵک", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "registry_office", label_ar: "مديرية التسجيل العقاري", label_en: "Land Registry Office", label_ku: "بەڕێوەبەرایەتی تاپۆ", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "issue_date", label_ar: "تاريخ الإصدار", label_en: "Issue Date", label_ku: "ڕێکەوتی دەرچوون", field_type: "DATE_GREGORIAN", required: true, normalizer: "DATE_ISO", validators: ["VALID_PAST_DATE"] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID", "RULE_LEGAL_VALIDITY_REQUIRES_HUMAN_CONFIRMATION"],
    thresholds: { min_field_confidence: 0.86, auto_pass_composite: 0.95, escalation_floor: 0.78 },
    accepted_relationships: ["COLLATERAL_AND_PREMISES_OWNERSHIP"],
    human_review_conditions: ["MANDATORY_REAL_ESTATE_DEED_REVIEW"],
    support_status: "TESTED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: true,
      synthetic_fixtures_available: true,
      automated_tests_passing: true,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Used for premises ownership and high-value merchant verification; requires human officer review as live Tapu registry query is EXTERNAL_VERIFICATION_UNAVAILABLE.",
    schema_version: "2.0"
  },

  {
    doc_type_id: "IRQ_COURT_DECISION",
    canonical_name_en: "Judicial Court Decision or Legal Inheritance Decree (Qassam Shar'i)",
    canonical_name_ar: "قرار محكمة / قسام شرعي أو نظامي",
    canonical_name_ku: "بڕیاری دادگا / قەسامی شەرعی",
    aliases: ["قسام شرعي", "قرار محكمة البداءة", "حجة وصاية", "حجة قيمومة", "Court Decision Iraq"],
    category: "LEGAL_AUTHORIZATION",
    entity_scope: "REPRESENTATIVE_LINK",
    can_establish_primary_identity: false,
    issuing_authority_ar: "مجلس القضاء الأعلى — المحاكم العراقية",
    issuing_authority_en: "Supreme Judicial Council — Iraqi Courts",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["JUDICIAL_DECREE_A4"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "case_or_decree_number", label_ar: "رقم الإضبارة / القرار", label_en: "Case / Decree Number", label_ku: "ژمارەی بڕیار", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "court_name", label_ar: "اسم المحكمة المصدرة", label_en: "Issuing Court", label_ku: "ناوی دادگا", field_type: "TEXT", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] },
      { key: "named_parties", label_ar: "الأطراف / الورثة", label_en: "Named Parties / Heirs", label_ku: "لایەنەکان / میراتگران", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] }
    ],
    deterministic_rules: ["RULE_LEGAL_VALIDITY_REQUIRES_HUMAN_CONFIRMATION"],
    thresholds: { min_field_confidence: 0.88, auto_pass_composite: 0.98, escalation_floor: 0.82 },
    accepted_relationships: ["JUDICIAL_GUARDIANSHIP_OR_INHERITANCE"],
    human_review_conditions: ["MANDATORY_LEGAL_COUNSEL_REVIEW"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Complex judicial syntax always routed to legal compliance officer.",
    schema_version: "1.0"
  },

  {
    doc_type_id: "IRQ_OFFICIAL_AUTH_LETTER",
    canonical_name_en: "Government or Institutional Official Authorization Letter",
    canonical_name_ar: "كتاب تخويل رسمي صادر من جهة حكومية أو نقابية",
    canonical_name_ku: "نووسراوی فەرمی ڕێپێدان",
    aliases: ["كتاب تخويل رسمي", "أمر إداري بالتخويل", "Official Authorization Letter Iraq"],
    category: "LEGAL_AUTHORIZATION",
    entity_scope: "REPRESENTATIVE_LINK",
    can_establish_primary_identity: false,
    issuing_authority_ar: "الوزارات والجهات غير المرتبطة بوزارة",
    issuing_authority_en: "Government Ministries & Official Commissions",
    jurisdiction: "FEDERAL_IRAQ",
    supported_regions: ["All Governorates", "KRG"],
    supported_generations: ["OFFICIAL_LETTERHEAD_A4"],
    supported_languages: ["ar", "ku"],
    required_sides: ["FRONT"],
    preprocessing_policy: "A4_PORTRAIT",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: [
      { key: "outgoing_number", label_ar: "العدد الرسمي", label_en: "Outgoing Ref No.", label_ku: "ژمارەی دەرچوو", field_type: "DOCUMENT_NUMBER", required: true, normalizer: "ALPHANUM_UPPER", validators: ["NON_EMPTY_ID"] },
      { key: "authorized_person_name", label_ar: "اسم المخول", label_en: "Authorized Representative", label_ku: "ناوی نوێنەر", field_type: "PERSON_NAME", required: true, normalizer: "IRAQI_NAME", validators: ["NON_EMPTY_NAME"] },
      { key: "issuing_institution", label_ar: "الجهة المصدرة", label_en: "Issuing Authority", label_ku: "لایەنی دەرچوو", field_type: "LEGAL_ENTITY_NAME", required: true, normalizer: "ARABIC_TEXT", validators: ["NON_EMPTY_TEXT"] }
    ],
    deterministic_rules: ["RULE_LEGAL_VALIDITY_REQUIRES_HUMAN_CONFIRMATION"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.95, escalation_floor: 0.78 },
    accepted_relationships: ["INSTITUTIONAL_REPRESENTATIVE_LINK"],
    human_review_conditions: ["MANDATORY_INSTITUTIONAL_LETTER_REVIEW"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: true,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Requires manual confirmation of institutional outgoing reference number.",
    schema_version: "1.0"
  }
];

// Runtime Registry for dynamically registered candidate types by reviewers
const DYNAMIC_CANDIDATE_TYPES = [];

/**
 * Validates the entire document registry at application startup or test execution.
 * Throws a descriptive error if any configuration is malformed or violates truthfulness invariants.
 */
function validateRegistryOnStartup() {
  const seenIds = new Set();
  const errors = [];

  for (const entry of DOCUMENT_REGISTRY) {
    if (!entry.doc_type_id || typeof entry.doc_type_id !== "string") {
      errors.push(`Entry missing valid doc_type_id: ${JSON.stringify(entry)}`);
      continue;
    }
    if (seenIds.has(entry.doc_type_id)) {
      errors.push(`Duplicate doc_type_id in registry: ${entry.doc_type_id}`);
    }
    seenIds.add(entry.doc_type_id);

    if (!DOCUMENT_CATEGORIES[entry.category]) {
      errors.push(`[${entry.doc_type_id}] Invalid category: ${entry.category}`);
    }
    if (!ENTITY_SCOPES.includes(entry.entity_scope)) {
      errors.push(`[${entry.doc_type_id}] Invalid entity_scope: ${entry.entity_scope}`);
    }
    if (!SUPPORT_STATUSES.includes(entry.support_status)) {
      errors.push(`[${entry.doc_type_id}] Invalid support_status: ${entry.support_status}`);
    }
    if (entry.support_status === "FULLY_SUPPORTED") {
      errors.push(`[${entry.doc_type_id}] Truthfulness invariant violation: Cannot claim FULLY_SUPPORTED without live external government verification.`);
    }
    if (entry.support_status === "TESTED") {
      if (!entry.capabilities?.validation_implemented || !entry.capabilities?.synthetic_fixtures_available || !entry.capabilities?.automated_tests_passing) {
        errors.push(`[${entry.doc_type_id}] Cannot mark TESTED unless validation, synthetic fixtures, and passing automated tests exist.`);
      }
    }
    if (!PREPROCESSING_POLICIES.includes(entry.preprocessing_policy)) {
      errors.push(`[${entry.doc_type_id}] Invalid preprocessing_policy: ${entry.preprocessing_policy}`);
    }
    if (!Array.isArray(entry.expected_fields) || entry.expected_fields.length === 0) {
      errors.push(`[${entry.doc_type_id}] Must define at least one expected_field.`);
    }
    if (entry.category === "EDUCATION_EMPLOYMENT_INCOME" && entry.can_establish_primary_identity === true) {
      errors.push(`[${entry.doc_type_id}] Policy violation: Education/Employment/Income documents cannot independently establish primary identity.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Universal Document Registry Startup Validation Failed:\n- ${errors.join("\n- ")}`);
  }

  return {
    valid: true,
    registry_version: REGISTRY_VERSION,
    total_registered_types: DOCUMENT_REGISTRY.length,
    categories_count: Object.keys(DOCUMENT_CATEGORIES).length
  };
}

function getAllDocumentTypes() {
  return [...DOCUMENT_REGISTRY, ...DYNAMIC_CANDIDATE_TYPES];
}

function getDocumentTypeById(docTypeId) {
  if (!docTypeId) return null;
  const upper = String(docTypeId).trim().toUpperCase();
  return getAllDocumentTypes().find(d => d.doc_type_id === upper) || null;
}

function getCoverageMatrix() {
  const all = getAllDocumentTypes();
  const summary = {
    registry_version: REGISTRY_VERSION,
    total_types: all.length,
    by_status: {},
    by_category: {}
  };

  for (const st of SUPPORT_STATUSES) summary.by_status[st] = 0;
  for (const catKey of Object.keys(DOCUMENT_CATEGORIES)) {
    summary.by_category[catKey] = {
      ...DOCUMENT_CATEGORIES[catKey],
      total: 0,
      tested: 0,
      configured: 0,
      registered: 0
    };
  }

  const matrixRows = all.map(doc => {
    summary.by_status[doc.support_status] = (summary.by_status[doc.support_status] || 0) + 1;
    const catBucket = summary.by_category[doc.category];
    if (catBucket) {
      catBucket.total++;
      if (doc.support_status === "TESTED") catBucket.tested++;
      else if (doc.support_status === "CONFIGURED") catBucket.configured++;
      else catBucket.registered++;
    }

    return {
      doc_type_id: doc.doc_type_id,
      canonical_name_en: doc.canonical_name_en,
      canonical_name_ar: doc.canonical_name_ar,
      canonical_name_ku: doc.canonical_name_ku,
      category: doc.category,
      category_name_en: DOCUMENT_CATEGORIES[doc.category]?.name_en || doc.category,
      category_name_ar: DOCUMENT_CATEGORIES[doc.category]?.name_ar || doc.category,
      entity_scope: doc.entity_scope,
      can_establish_primary_identity: doc.can_establish_primary_identity,
      jurisdiction: doc.jurisdiction,
      issuing_authority_ar: doc.issuing_authority_ar,
      supported_languages: doc.supported_languages,
      required_sides: doc.required_sides,
      has_mrz: Boolean(doc.mrz_config?.has_mrz),
      mrz_format: doc.mrz_config?.format || "NONE",
      preprocessing_policy: doc.preprocessing_policy,
      expected_fields_count: doc.expected_fields.length,
      support_status: doc.support_status,
      external_verification_status: "EXTERNAL_VERIFICATION_UNAVAILABLE",
      capabilities: doc.capabilities,
      known_limitations: doc.known_limitations,
      schema_version: doc.schema_version
    };
  });

  return {
    total_registered_types: summary.total_types,
    status_breakdown: summary.by_status,
    external_verification_status: "EXTERNAL_VERIFICATION_UNAVAILABLE",
    summary,
    categories: DOCUMENT_CATEGORIES,
    matrix: matrixRows
  };
}

function registerCandidateDocumentType(candidateSpec) {
  const newId = (candidateSpec.doc_type_id || `CANDIDATE_${Date.now()}`).toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  const existing = getDocumentTypeById(newId);
  if (existing) return existing;

  const entry = {
    doc_type_id: newId,
    canonical_name_en: candidateSpec.canonical_name_en || "Reviewer-Registered Candidate Document",
    canonical_name_ar: candidateSpec.canonical_name_ar || "وثيقة مسجلة قيد التهيئة",
    canonical_name_ku: candidateSpec.canonical_name_ku || "بەڵگەنامەی نوێ",
    aliases: candidateSpec.aliases || [candidateSpec.canonical_name_ar, candidateSpec.canonical_name_en].filter(Boolean),
    category: DOCUMENT_CATEGORIES[candidateSpec.category] ? candidateSpec.category : "LEGAL_AUTHORIZATION",
    entity_scope: "SUPPORTING_EVIDENCE",
    can_establish_primary_identity: false,
    issuing_authority_ar: candidateSpec.issuing_authority_ar || "جهة إصدار قيد المراجعة",
    issuing_authority_en: candidateSpec.issuing_authority_en || "Issuing Authority Under Review",
    jurisdiction: candidateSpec.jurisdiction || "FEDERAL_IRAQ",
    supported_regions: ["Iraq"],
    supported_generations: ["CANDIDATE_V1"],
    supported_languages: ["ar", "ku", "en"],
    required_sides: ["FRONT"],
    preprocessing_policy: "FLEXIBLE_FORM",
    mrz_config: { has_mrz: false, format: null, side: null },
    expected_fields: candidateSpec.expected_fields || [
      { key: "reference_number", label_ar: "رقم الوثيقة", label_en: "Reference No.", label_ku: "ژمارە", field_type: "DOCUMENT_NUMBER", required: false, normalizer: "ALPHANUM_UPPER", validators: [] },
      { key: "holder_name", label_ar: "الاسم الوارد", label_en: "Holder Name", label_ku: "ناو", field_type: "PERSON_NAME", required: false, normalizer: "IRAQI_NAME", validators: [] }
    ],
    deterministic_rules: ["RULE_CANNOT_SOLO_ESTABLISH_ID"],
    thresholds: { min_field_confidence: 0.85, auto_pass_composite: 0.99, escalation_floor: 0.80 },
    accepted_relationships: ["CANDIDATE_SUPPORTING_EVIDENCE"],
    human_review_conditions: ["CANDIDATE_TYPE_REQUIRES_HUMAN_REVIEW"],
    support_status: "REGISTERED",
    capabilities: {
      registered: true,
      classification_implemented: true,
      extraction_configured: false,
      validation_implemented: false,
      synthetic_fixtures_available: false,
      automated_tests_passing: false,
      live_vision_available: true,
      external_verification_available: false
    },
    known_limitations: "Registered dynamically by compliance reviewer; requires validation policy & test fixtures before promotion to CONFIGURED/TESTED.",
    schema_version: "1.0-candidate"
  };

  DYNAMIC_CANDIDATE_TYPES.push(entry);
  return entry;
}

// Run startup validation immediately when module loads
validateRegistryOnStartup();

module.exports = {
  REGISTRY_VERSION,
  DOCUMENT_CATEGORIES,
  SUPPORT_STATUSES,
  ENTITY_SCOPES,
  PREPROCESSING_POLICIES,
  DOCUMENT_REGISTRY,
  validateRegistryOnStartup,
  getAllDocumentTypes,
  getDocumentTypeById,
  getCoverageMatrix,
  registerCandidateDocumentType
};
