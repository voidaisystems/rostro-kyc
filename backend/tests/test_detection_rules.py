import pytest
from datetime import datetime
from app.models.transaction import TransactionIntent, UserProfile, UserHistoryStats
from app.services.detection_engine import DeterministicRiskEngine
from app.services.static_fallbacks import get_static_fallback

@pytest.fixture
def risk_engine():
    return DeterministicRiskEngine()

@pytest.fixture
def mock_user():
    return UserProfile(
        user_id="usr_test",
        full_name="حيدر علي",
        current_balance_iqd=500000,
        account_tier="standard",
        history_stats_30d=UserHistoryStats(
            total_transfers_count=10,
            mean_transfer_amount_iqd=30000.0,
            std_dev_amount_iqd=10000.0,
            frequent_recipients=["07701111222"]
        )
    )

def test_advance_fee_lottery_scam(risk_engine, mock_user):
    tx = TransactionIntent(
        sender_id="usr_test",
        recipient_msisdn="07809999888", # novel recipient
        amount_iqd=75000,
        note="رسوم استلام جائزة السيارة"
    )
    report = risk_engine.evaluate(tx, mock_user)
    assert report.is_suspicious is True
    assert report.risk_score >= 60
    assert report.breakdown.detected_archetype == "advance_fee_lottery"
    assert "NOVEL_RECIPIENT_FIRST_TIME_TRANSFER" in report.breakdown.triggered_rules

def test_fake_otp_support_scam(risk_engine, mock_user):
    tx = TransactionIntent(
        sender_id="usr_test",
        recipient_msisdn="07703333444",
        amount_iqd=100000,
        note="تفعيل الحساب رمز التأكيد 5543"
    )
    report = risk_engine.evaluate(tx, mock_user)
    assert report.is_suspicious is True
    assert report.risk_score >= 60
    assert report.breakdown.detected_archetype == "fake_support_otp"

def test_routine_benign_transfer(risk_engine, mock_user):
    tx = TransactionIntent(
        sender_id="usr_test",
        recipient_msisdn="07701111222", # frequent contact
        amount_iqd=25000,
        note="فلوس العشا البارحة"
    )
    report = risk_engine.evaluate(tx, mock_user)
    assert report.is_suspicious is False
    assert report.risk_score < 30
    assert report.severity == "LOW"

def test_keyword_evasion_caught_by_heuristics(risk_engine, mock_user):
    # Scammer tells victim to write 'gift'
    tx = TransactionIntent(
        sender_id="usr_test",
        recipient_msisdn="07809999888", # novel
        amount_iqd=450000,              # 90% balance depletion + huge amount spike
        note="هدية"
    )
    report = risk_engine.evaluate(tx, mock_user)
    assert report.is_suspicious is True
    assert report.risk_score >= 60
    assert report.breakdown.recipient_novelty_score == 25.0
    assert report.breakdown.balance_drainage_score == 20.0

def test_static_fallback_returns_baghdadi_dialect():
    fallback = get_static_fallback("advance_fee_lottery")
    assert fallback.is_fallback is True
    assert "حيدر دير بالك" in fallback.coaching_message
    assert "رسوم" in fallback.coaching_message
    assert fallback.recommended_action == "cancel"
