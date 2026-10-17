import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from .models.transaction import TransactionIntent, RiskReport, CoachingResponse, AuditRecord
from .services.detection_engine import DeterministicRiskEngine
from .services.coaching_agent import LLMCoachingAgent
from .services.wallet_mock import MockWalletService

app = FastAPI(
    title="Project Aman (أمان) — Real-Time Scam Protection Gateway",
    description="Agentic pre-transaction behavioral scam intervention engine for Iraqi mobile wallets.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = DeterministicRiskEngine()
coaching_agent = LLMCoachingAgent()
wallet_service = MockWalletService()

class EvaluationResult(BaseModel):
    decision: str  # "ALLOW_DIRECT" or "INTERVENE_COACHING"
    risk_report: RiskReport
    coaching: Optional[CoachingResponse] = None

class ConfirmationRequest(BaseModel):
    transaction: TransactionIntent
    action: str  # "CANCEL" or "OVERRIDE"
    consent_acknowledged: bool
    risk_score: int
    scam_archetype: Optional[str] = None
    coaching_delivered: Optional[str] = None

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Aman Scam Protection Agent",
        "version": "1.0.0",
        "dialect": "Iraqi Arabic (Baghdadi)"
    }

@app.get("/api/v1/wallet/{user_id}")
def get_wallet(user_id: str):
    user = wallet_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/v1/transfer/evaluate", response_model=EvaluationResult)
async def evaluate_transfer(tx: TransactionIntent):
    user = wallet_service.get_user(tx.sender_id)
    if not user:
        raise HTTPException(status_code=404, detail="Sender account not found")

    if user.current_balance_iqd < tx.amount_iqd:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # 1. Run Layer 1 Deterministic Risk Engine
    risk_report = risk_engine.evaluate(tx, user)

    # 2. Threshold Check
    if risk_report.risk_score < 30:
        return EvaluationResult(
            decision="ALLOW_DIRECT",
            risk_report=risk_report,
            coaching=None
        )

    # 3. Trigger Layer 2 Agentic Coaching
    coaching = await coaching_agent.coach(tx, user, risk_report)

    return EvaluationResult(
        decision="INTERVENE_COACHING",
        risk_report=risk_report,
        coaching=coaching
    )

@app.post("/api/v1/transfer/confirm")
def confirm_transfer(req: ConfirmationRequest):
    audit_id = f"cbi_audit_{uuid.uuid4().hex[:12]}"
    user = wallet_service.get_user(req.transaction.sender_id)
    
    # Server-Side Re-verification to prevent client-side parameter tampering
    server_risk = risk_engine.evaluate(req.transaction, user)
    verified_risk_score = server_risk.risk_score
    verified_archetype = server_risk.breakdown.detected_archetype
    
    if req.action.upper() == "CANCEL":
        record = AuditRecord(
            audit_id=audit_id,
            sender_id=req.transaction.sender_id,
            recipient_msisdn=req.transaction.recipient_msisdn,
            amount_iqd=req.transaction.amount_iqd,
            note=req.transaction.note,
            risk_score=verified_risk_score,
            scam_archetype=verified_archetype,
            coaching_delivered=req.coaching_delivered,
            user_decision="CANCELLED_BY_USER",
            consent_acknowledged=False
        )
        wallet_service.record_audit(record)
        return {
            "status": "TRANSACTION_ABORTED",
            "message": "تم إلغاء التحويل بنجاح وحماية رصيدك.",
            "audit_id": audit_id
        }

    elif req.action.upper() == "OVERRIDE":
        if not req.consent_acknowledged:
            raise HTTPException(status_code=400, detail="Explicit user consent required to override safety warning")

        success = wallet_service.execute_transfer(req.transaction)
        if not success:
            raise HTTPException(status_code=400, detail="Transfer execution failed")

        record = AuditRecord(
            audit_id=audit_id,
            sender_id=req.transaction.sender_id,
            recipient_msisdn=req.transaction.recipient_msisdn,
            amount_iqd=req.transaction.amount_iqd,
            note=req.transaction.note,
            risk_score=verified_risk_score,
            scam_archetype=verified_archetype,
            coaching_delivered=req.coaching_delivered,
            user_decision="PROCEEDED_WITH_OVERRIDE",
            consent_acknowledged=True
        )
        wallet_service.record_audit(record)
        
        # Core Ledger Kiosk Cash-Out Reservation for Critical Risk Transfers
        has_cash_out_hold = verified_risk_score >= 80
        return {
            "status": "TRANSACTION_COMPLETED_WITH_WARNING",
            "message": "تم إتمام التحويل بناءً على طلبك ومسؤوليتك القانونية بموجب قانون المعاملات الإلكترونية رقم 78 لسنة 2012.",
            "audit_id": audit_id,
            "cash_out_hold_active": has_cash_out_hold,
            "cash_out_cooldown_seconds": 180 if has_cash_out_hold else 0
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid action parameter")

@app.get("/api/v1/audit/logs", response_model=List[AuditRecord])
def get_audit_logs():
    return wallet_service.list_audits()
