/**
 * Automated Verification Suite for Wathiq Hybrid Engine & Local Server
 */

const {
  RegulaChecksumValidator,
  ImageQualityInspector,
  IraqiOnomasticNormalizer,
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
console.log('🧪 RUNNING WATHIQ HYBRID KYC VERIFICATION SUITE');
console.log('================================================================\n');

// 1. Test Regula ICAO Doc 9303 TD1 Checksums
console.log('--- PART 1: Regula ICAO Doc 9303 TD1 Checksum Engine ---');
const l1 = "I<IRQ1992488106<<<<<<<<<<<<<<";
const l2 = "9205141M3005143IRQ<<<<<<<<<<<2";
const l3 = "AL<<ZEID<HAIDAR<ABDUL<ZAHRA<<<";
const td1Result = RegulaChecksumValidator.validateTD1(l1, l2, l3);
assert(td1Result.all_checksums_valid === true, 'Valid TD1 MRZ checksum calculation matches 7-3-1 weights');
assert(td1Result.authenticity_confidence === 0.99, 'Authentic TD1 yields 0.99 confidence');

// Tampered line test
const l1Tampered = "I<IRQ199248810999<<<<<<<<<<<<<";
const td1Tampered = RegulaChecksumValidator.validateTD1(l1Tampered, l2, l3);
assert(td1Tampered.all_checksums_valid === false, 'Tampered doc number triggers checksum failure');

// 2. Test Smart Engines Image Quality & Glare
console.log('\n--- PART 2: Smart Engines & Mitek Image Quality Pre-Filter ---');
const cleanQuality = ImageQualityInspector.evaluateQuality({ blur_variance: 150, glare_hotspot_pct: 0.01 });
assert(cleanQuality.is_acceptable === true, 'Sharp, non-glared image passes quality pre-filter');
assert(cleanQuality.quality_score >= 0.90, 'High quality score for clean capture');

const glaredQuality = ImageQualityInspector.evaluateQuality({ blur_variance: 110, glare_hotspot_pct: 0.12 });
assert(glaredQuality.is_acceptable === false, 'Specular glare fails image quality pre-filter');
assert(glaredQuality.quality_flags.includes('SPECULAR_FLASH_GLARE_DETECTED'), 'Flag SPECULAR_FLASH_GLARE_DETECTED raised');

// 3. Test Iraqi Onomastic Normalizer & Compound Names
console.log('\n--- PART 3: Iraqi Onomastics & Kurdish Sorani Normalization ---');
const nameA = "محمد باقر عبد الزهرة الشمري";
const nameB = "الشيخ محمد باقر عبد الزهره";
const matchResult = IraqiOnomasticNormalizer.compareNames(nameA, nameB);
assert(matchResult.is_match === true, 'Compound name عبد الزهرة matches despite honorific الشيخ and spelling variant');
assert(matchResult.score >= 0.90, `Score is high: ${matchResult.score}`);

const mismatchResult = IraqiOnomasticNormalizer.compareNames("زيد حيدر جاسم", "مصطفى قاسم علي");
assert(mismatchResult.is_match === false, 'Different identities trigger mismatch');

// Test Arabic-Indic Digits Normalization
const arabicIndicStr = "١٩٩٢٤٨٨١٠٢٣٤";
const normDigits = IraqiOnomasticNormalizer.normalizeText(arabicIndicStr);
assert(normDigits === "199248810234", 'Arabic-Indic digits ٠-٩ accurately mapped to ASCII 0-9');

// 4. Test Scenario Evaluations Across All 5 Benchmark Document Sets
console.log('\n--- PART 4: End-to-End Synthetic Scenarios Evaluation ---');
dataset.forEach((sc, idx) => {
  const evalRes = WathiqEvaluationEngine.evaluateApplication(sc);
  console.log(`\nEvaluating Scenario ${idx + 1}: [${sc.scenario_id}] - ${sc.merchant_trade_name}`);
  console.log(`  > Overall Score: ${(evalRes.overall_confidence * 100).toFixed(1)}% | Status: ${evalRes.status}`);
  console.log(`  > Recommendation: ${evalRes.reviewer_dossier.recommended_decision}`);
  console.log(`  > Rationale: ${evalRes.reviewer_dossier.rationale_ar.substring(0, 75)}...`);
  console.log(`  > CBI Law 78 Hash: ${evalRes.cbi_audit.hmac_sha256_digest.substring(0, 16)}...`);

  if (sc.scenario_id === 'clean_merchant_pass') {
    assert(evalRes.status === 'APPROVED_AUTOMATIC', 'Clean merchant auto-approved');
    assert(evalRes.overall_confidence >= 0.88, 'Confidence exceeds auto-approval threshold');
  } else if (sc.scenario_id === 'expired_license_temporal_flag') {
    assert(evalRes.reviewer_dossier.identified_flags.some(f => f.includes('EXPIRED_TRADE_LICENSE')), 'Expired license detected and flagged');
  } else if (sc.scenario_id === 'specular_glare_zero_hallucination') {
    assert(evalRes.reviewer_dossier.recommended_decision === 'RETAKE_REQUESTED', 'Glare triggers instant retake request');
    assert(evalRes.scoring_breakdown.ocr_confidence <= 0.30, 'Zero hallucination invariant: confidence heavily penalized for obscured field');
  } else if (sc.scenario_id === 'identity_mismatch_fraud_attempt') {
    assert(evalRes.status === 'REJECTED', 'Identity mismatch rejected as potential fraud');
  }
});

console.log('\n================================================================');
console.log(`🎉 ALL ${passedCount} VERIFICATION TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================\n');
