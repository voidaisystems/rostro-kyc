from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class DeviceContext(BaseModel):
    ip_city: Optional[str] = "Baghdad"
    has_recent_incoming_call: bool = False
    active_call_duration_seconds: int = 0
    is_screen_shared: bool = False

class TransactionIntent(BaseModel):
    sender_id: str
    recipient_msisdn: str
    amount_iqd: int = Field(gt=0, description="Transfer amount in Iraqi Dinars")
    note: str = ""
    client_timestamp: Optional[datetime] = None
    device_context: Optional[DeviceContext] = None

class UserHistoryStats(BaseModel):
    total_transfers_count: int = 0
    mean_transfer_amount_iqd: float = 25000.0
    std_dev_amount_iqd: float = 10000.0
    frequent_recipients: List[str] = []
    last_deposit_timestamp: Optional[datetime] = None
    recent_deposit_amount_iqd: int = 0

class UserProfile(BaseModel):
    user_id: str
    full_name: str
    current_balance_iqd: int
    account_tier: str = "standard"
    history_stats_30d: UserHistoryStats

class RiskFactorBreakdown(BaseModel):
    recipient_novelty_score: float = 0.0  # max 25
    amount_anomaly_score: float = 0.0     # max 25
    keyword_risk_score: float = 0.0       # max 35
    balance_drainage_score: float = 0.0   # max 20
    temporal_anomaly_score: float = 0.0   # max 10
    total_risk_score: int                 # 0 to 100
    triggered_rules: List[str] = []
    detected_archetype: Optional[str] = None

class RiskReport(BaseModel):
    is_suspicious: bool
    risk_score: int
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    breakdown: RiskFactorBreakdown
    explanation: str

class CoachingResponse(BaseModel):
    coaching_message: str
    scam_archetype_detected: str
    scammer_next_move_warning: str
    urgency_level: str
    recommended_action: str  # "cancel" or "review_carefully"
    is_fallback: bool = False

class AuditRecord(BaseModel):
    audit_id: str
    sender_id: str
    recipient_msisdn: str
    amount_iqd: int
    note: str
    risk_score: int
    scam_archetype: Optional[str]
    coaching_delivered: Optional[str]
    user_decision: str  # "CANCELLED_BY_USER", "PROCEEDED_WITH_OVERRIDE", "BYPASS_APPROVED"
    consent_acknowledged: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
