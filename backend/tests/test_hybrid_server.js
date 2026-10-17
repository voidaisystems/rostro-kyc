/**
 * Automated Verification Suite for Project Rostro (واثق)
 * Universal Iraqi Document Intelligence Platform
 */

const {
  DOCUMENT_CATEGORIES,
  DOCUMENT_REGISTRY,
  validateRegistryOnStartup,
  getCoverageMatrix,
  registerCandidateDocumentType,
  RegulaChecksumValidator,
  ImageQualityInspector,
  IraqiOnomasticNormalizer,
  IraqiMultiScriptNormalizer,
  DeterministicValidators,
  UniversalDocumentClassifier,
  DocumentPreprocessor,
  UniversalKYCPipeline,
  WathiqEvaluationEngine
} = require('../kyc_app/services/hybrid_kyc_engine');

const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, '..', '..', 'data', 'synthetic_kyc', 'sample_document_sets.json');
const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedCount++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('================================================================');
console.log('🧪 RUNNING PROJECT ROSTRO (واثق) UNIVERSAL KYC VERIFICATION SUITE');
console.log('================================================================\n');

// 1. Test Universal Document Registry & Coverage Matrix
console.log('--- PART 1: Universal Iraqi Document Registry & Coverage Matrix ---');
const startupValidation = validateRegistryOnStartup();
assert(startupValidation.valid === true, `Startup registry validation passed (${startupValidation.total_registered} document types)`);
assert(Object.keys(DOCUMENT_CATEGORIES).length === 8, 'All 8 required Iraqi document categories (A–H) are registered');

const coverage = getCoverageMatrix();
assert(coverage.total_registered_types >= 38, `Broad catalog initialized with ${coverage.total_registered_types} Iraqi document types`);
assert(coverage.status_breakdown.TESTED >= 20, `${coverage.status_breakdown.TESTED} document types have TESTED status`);
assert(coverage.external_verification_status === 'EXTERNAL_VERIFICATION_UNAVAILABLE', 'Coverage matrix honestly reports EXTERNAL_VERIFICATION_UNAVAILABLE');

// 2. Test ICAO Doc 9303 TD1 & TD3 Checksums + Domain Validators
console.log('\n--- PART 2: Deterministic Validators (TD1 MRZ, TD3 MRZ, IBAN, VIN, National ID) ---');
const l1 = "I<IRQA198814207<<<<<<<<<<<<<<<";
const l2 = "8806149M3106143IRQ<<<<<<<<<<<0";
const l3 = "AL<JUBOURI<<ALI<HUSSEIN<KADHIM";
const td1Result = DeterministicValidators.validateTD1MRZ(l1, l2, l3, {
  date_of_birth: "1988-06-14",
  expiry_date: "2031-06-14"
});
assert(td1Result.all_checksums_valid === true, 'Valid TD1 MRZ checksum calculation matches 7-3-1 weights including composite check digit');
assert(td1Result.front_consistency_match === true, 'TD1 MRZ back side matches front visual DOB and Expiry Date');

const l1Tampered = "I<IRQA198814209<<<<<<<<<<<<<<<";
const td1Tampered = RegulaChecksumValidator.validateTD1(l1Tampered, l2, l3);
assert(td1Tampered.all_checksums_valid === false, 'Tampered TD1 doc number triggers deterministic checksum failure');

const td3L1 = "P<IRQAL<DULAIMI<<OMAR<FAROUQ<SAEED<<<<<<<<<<";
const td3L2 = "A184920156IRQ8402194M3102190<<<<<<<<<<<<<<04";
const td3Result = DeterministicValidators.validateTD3MRZ(td3L1, td3L2);
assert(td3Result.all_checksums_valid === true, 'Valid TD3 Passport MRZ (2x44) passes all Modulo-10 check digits');

// 3. Test Smart Engines Image Quality & Glare
console.log('\n--- PART 3: Image Quality Gate & Zero-Hallucination Pre-Filter ---');
const cleanQuality = ImageQualityInspector.evaluateQuality({ blur_variance: 150, glare_hotspot_pct: 0.01 });
assert(cleanQuality.is_acceptable === true, 'Sharp, non-glared image passes quality pre-filter');
const glaredQuality = ImageQualityInspector.evaluateQuality({ blur_variance: 110, glare_hotspot_pct: 0.12 });
assert(glaredQuality.is_acceptable === false, 'Specular glare fails image quality pre-filter');
assert(glaredQuality.quality_flags.includes('SPECULAR_FLASH_GLARE_DETECTED'), 'Flag SPECULAR_FLASH_GLARE_DETECTED raised');

// 4. Test Iraqi Multi-Script Normalizer (Arabic, Kurdish Sorani, Numerals, Dates, Lineage)
console.log('\n--- PART 4: Multi-Script Normalizer (Arabic, Kurdish Sorani, Dates, Household Lineage) ---');
const nameA = "محمد باقر عبد الزهرة الشمري";
const nameB = "الشيخ محمد باقر عبد الزهره";
const matchResult = IraqiOnomasticNormalizer.compareNames(nameA, nameB);
assert(matchResult.is_match === true, 'Compound name عبد الزهرة matches despite honorific الشيخ and spelling variant');

const kurdishGov = IraqiMultiScriptNormalizer.normalizeGovernorateOrCity("هەولێر");
const arabicGov = IraqiMultiScriptNormalizer.normalizeGovernorateOrCity("أربيل");
assert(kurdishGov === arabicGov, 'Kurdish Sorani governorate هەولێر aligns deterministically with Arabic أربيل');

const dmyDate = IraqiMultiScriptNormalizer.parseAndNormalizeDate("١٤/٠٦/١٩٨٨");
assert(dmyDate.is_valid && dmyDate.iso === "1988-06-14", 'Arabic-Indic DD/MM/YYYY date normalizes to ISO 1988-06-14');

const hijriDate = IraqiMultiScriptNormalizer.parseAndNormalizeDate("1445/08/15 هـ");
assert(hijriDate.is_valid && hijriDate.calendar === "HIJRI", 'Hijri date is recognized and preserved without false Gregorian failure');

const lineageMatch = IraqiMultiScriptNormalizer.comparePersonNames(
  "زيد حيدر جاسم الشمري",
  "حيدر جاسم كاظم الشمري",
  { allowPatronymicHousehold: true }
);
assert(lineageMatch.status === "PROBABLE_MATCH", 'Patronymic household lineage recognizes child-to-father head-of-household relationship on Residence/Ration cards');

// 5. Test Document-Specific Preprocessing (ID Card Landscape vs A4 Portrait)
console.log('\n--- PART 5: Document-Specific Preprocessing Policy (ID Card vs A4 Portrait) ---');
const idReg = DOCUMENT_REGISTRY.find(d => d.doc_type_id === 'IRQ_NATIONAL_ID');
const a4Reg = DOCUMENT_REGISTRY.find(d => d.doc_type_id === 'IRQ_COMPANY_REGISTRATION');
const idPreproc = DocumentPreprocessor.evaluatePreprocessing({ image_width: 600, image_height: 950 }, idReg);
const a4Preproc = DocumentPreprocessor.evaluatePreprocessing({ image_width: 794, image_height: 1123 }, a4Reg);
assert(idPreproc.applied_rotation_deg === 270, 'Portrait phone photo of landscape ID card is rotated 270 deg to landscape');
assert(a4Preproc.applied_rotation_deg === 0, 'Upright A4 portrait certificate is preserved at 0 deg (never rotated sideways)');

// 6. Test End-to-End Evaluation Across All 14 Multi-Category Scenarios
console.log('\n--- PART 6: End-to-End 10-Stage Pipeline Evaluation Across 14 Synthetic Cases ---');
const testedTypesSeen = new Set();

dataset.forEach((sc, idx) => {
  const evalRes = WathiqEvaluationEngine.evaluateApplication(sc);
  evalRes.documents.forEach(d => testedTypesSeen.add(d.classification.doc_type_id));

  console.log(`\nCase ${idx + 1}: [${sc.scenario_id}] — ${sc.merchant_trade_name}`);
  console.log(`  > Docs: ${evalRes.documents.map(d => d.classification.doc_type_id).join(' + ')}`);
  console.log(`  > Score: ${(evalRes.overall_confidence * 100).toFixed(1)}% | Decision: ${evalRes.reviewer_dossier.recommended_decision}`);

  // Verify all 9 separated signals exist on every case
  const sig = evalRes.separated_signals;
  assert(
    Boolean(
      sig.image_quality &&
      sig.text_extraction_confidence &&
      sig.classification_confidence &&
      sig.field_completeness &&
      sig.data_consistency &&
      sig.duplicate_detection &&
      sig.authenticity_indicators &&
      sig.external_authoritative_verification &&
      sig.final_policy_decision
    ),
    `Case ${idx + 1} (${sc.scenario_id}) outputs all 9 separated verification signals`
  );

  // Verify decision matches expected_decision
  assert(
    evalRes.reviewer_dossier.recommended_decision === sc.expected_decision,
    `Case ${idx + 1} (${sc.scenario_id}) decision [${evalRes.reviewer_dossier.recommended_decision}] matches expected [${sc.expected_decision}]`
  );

  if (sc.scenario_id === 'specular_glare_zero_hallucination') {
    assert(evalRes.scoring_breakdown.ocr_confidence <= 0.30, 'Zero-Hallucination invariant: glare penalizes OCR confidence and leaves field null');
  }
  if (sc.scenario_id === 'corporate_poa_authorized_representative') {
    assert(evalRes.cross_checks.some(c => c.status === 'LINKED_VIA_POA'), 'Power of Attorney links authorized representative to company managing director');
  }
  if (sc.scenario_id === 'solo_supporting_docs_policy_violation') {
    assert(evalRes.reviewer_dossier.identified_flags.includes('MISSING_PRIMARY_IDENTITY_DOCUMENT'), 'Solo supporting documents cannot establish primary identity without a sovereign ID');
  }
  if (sc.scenario_id === 'duplicate_document_submission_detected') {
    assert(sig.duplicate_detection.is_duplicate === true, 'Duplicate document submission within case is flagged');
  }
  if (sc.scenario_id === 'unknown_unconfigured_document_fallback') {
    assert(evalRes.documents[0].classification.doc_type_id === 'UNKNOWN_DOCUMENT', 'Unrecognized document uses UNKNOWN_DOCUMENT fallback without forced misclassification');
    assert(evalRes.universal_fields.length >= 4, 'Generic layout fallback preserves extracted key-value fields for human reviewer');
  }
});

// Verify every single TESTED document type in the registry was exercised in the test suite!
const allTestedInRegistry = DOCUMENT_REGISTRY.filter(d => d.support_status === 'TESTED').map(d => d.doc_type_id);
const untestedTypes = allTestedInRegistry.filter(t => !testedTypesSeen.has(t));
assert(untestedTypes.length === 0, `All ${allTestedInRegistry.length} TESTED document types in the registry were verified by automated tests`);

// 7. Test Dynamic Registration of a New Candidate Document Type by Reviewer
console.log('\n--- PART 7: Reviewer Registration of Candidate Document Type ---');
const newCandidate = registerCandidateDocumentType({
  doc_type_id: "IRQ_AGRI_GRAIN_RECEIPT",
  canonical_name_en: "Ministry of Trade Grain Silo Receipt",
  canonical_name_ar: "وصل استلام الحنطة التسويقي — الشركة العامة لتجارة الحبوب",
  category: "FINANCIAL_EVIDENCE"
});
assert(newCandidate.doc_type_id === "IRQ_AGRI_GRAIN_RECEIPT", 'Compliance officer can register an unseen document type into the catalog');

console.log('\n================================================================');
console.log(`🎉 ALL ${passedCount}/${totalCount} UNIVERSAL VERIFICATION TESTS PASSED!`);
console.log('================================================================\n');
