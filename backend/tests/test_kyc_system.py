import os
import json
import pytest

from backend.kyc_app.services.arabic_normalizer import IraqiArabicNormalizer
from backend.kyc_app.services.calibration_engine import CalibrationEngine
from backend.kyc_app.services.vision_extractor import MultimodalKYCExtractor
from backend.kyc_app.services.cross_doc_reconciler import CrossDocumentReconciler

def test_arabic_name_normalization():
    # Test canonicalization of variations
    assert IraqiArabicNormalizer.normalize_orthography("أحمد") == "احمد"
    assert IraqiArabicNormalizer.normalize_orthography("عليّ") == "علي"
    assert IraqiArabicNormalizer.normalize_orthography("فاطمة") == "فاطمه"
    assert IraqiArabicNormalizer.normalize_orthography("مـحـمـد") == "محمد"

def test_compound_name_and_tribal_title_matching():
    # 4-part name with compound and tribal title vs 3-part without title
    name_a = "محمد باقر عبد الزهرة الشمري"
    name_b = "محمد باقر عبد الزهره"
    score, status = IraqiArabicNormalizer.compare_iraqi_names(name_a, name_b)
    
    assert score >= 0.90
    assert status == "STRONG_MATCH"

def test_completely_different_names_mismatch():
    name_a = "كرار علي جاسم الجميلي"
    name_b = "حيدر حميد كاظم التميمي"
    score, status = IraqiArabicNormalizer.compare_iraqi_names(name_a, name_b)
    
    assert score < 0.50
    assert status == "NAME_MISMATCH"

def test_calibration_engine_zero_hallucination_on_occluded_field():
    conf, flag = CalibrationEngine.compute_field_confidence(
        field_name="expiry_date",
        raw_value=None,
        document_clarity_score=0.30,
        model_prob=0.10,
        is_occluded=True
    )
    assert conf < 0.20
    assert flag == "OCCLUDED_OR_SPECULAR_GLARE"

def test_expected_calibration_error_calculation():
    confidences = [0.90, 0.92, 0.85, 0.40, 0.20]
    accuracies = [True, True, True, False, False]
    ece = CalibrationEngine.calculate_expected_calibration_error(confidences, accuracies)
    
    assert 0.0 <= ece <= 0.20

def test_cross_document_clean_merchant_evaluation():
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "synthetic_kyc", "sample_document_sets.json"
    )
    with open(data_path, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    clean_scenario = next(s for s in scenarios if s["scenario_id"] == "clean_merchant_pass")
    
    doc_set = MultimodalKYCExtractor.assemble_document_set(
        app_id="TEST-CLEAN-01",
        trade_name=clean_scenario["merchant_trade_name"],
        national_card_raw=clean_scenario["national_card"],
        license_raw=clean_scenario["business_license"],
        tax_card_raw=clean_scenario["tax_card"]
    )
    evaluation = CrossDocumentReconciler.evaluate_kyc_application(doc_set)

    assert evaluation.status == "APPROVED_AUTOMATIC"
    assert evaluation.reviewer_dossier.recommended_decision == "AUTO_PASS"
    assert evaluation.overall_confidence >= 0.88

def test_cross_document_expired_license_evaluation():
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "synthetic_kyc", "sample_document_sets.json"
    )
    with open(data_path, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    expired_scenario = next(s for s in scenarios if s["scenario_id"] == "expired_license_temporal_flag")
    
    doc_set = MultimodalKYCExtractor.assemble_document_set(
        app_id="TEST-EXPIRED-02",
        trade_name=expired_scenario["merchant_trade_name"],
        national_card_raw=expired_scenario["national_card"],
        license_raw=expired_scenario["business_license"],
        tax_card_raw=expired_scenario["tax_card"]
    )
    evaluation = CrossDocumentReconciler.evaluate_kyc_application(doc_set)

    assert evaluation.status == "NEEDS_MANUAL_REVIEW"
    assert evaluation.reviewer_dossier.recommended_decision == "MANUAL_REVIEW_REQUIRED"
    assert any("EXPIRED" in flag for flag in evaluation.reviewer_dossier.identified_flags)

def test_cross_document_specular_glare_evaluation():
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "synthetic_kyc", "sample_document_sets.json"
    )
    with open(data_path, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    glare_scenario = next(s for s in scenarios if s["scenario_id"] == "specular_glare_zero_hallucination")
    
    doc_set = MultimodalKYCExtractor.assemble_document_set(
        app_id="TEST-GLARE-03",
        trade_name=glare_scenario["merchant_trade_name"],
        national_card_raw=glare_scenario["national_card"],
        license_raw=glare_scenario["business_license"],
        tax_card_raw=glare_scenario["tax_card"]
    )
    evaluation = CrossDocumentReconciler.evaluate_kyc_application(doc_set)

    assert evaluation.status == "NEEDS_MANUAL_REVIEW"
    # Expiry date field should be occluded with confidence < 0.20
    lic_exp_field = evaluation.field_extractions["business_license"]["expiry_date"]
    assert lic_exp_field["is_occluded"] is True
    assert lic_exp_field["confidence"] < 0.20
