import json
import os
import re
from datetime import datetime, time
from typing import Tuple, List, Optional
from ..models.transaction import TransactionIntent, UserProfile, RiskFactorBreakdown, RiskReport

class DeterministicRiskEngine:
    def __init__(self, keywords_path: Optional[str] = None):
        if keywords_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            keywords_path = os.path.join(base_dir, "data", "iraqi_keywords.json")
            
        with open(keywords_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.high_risk_keywords = data.get("high_risk_keywords", [])
            self.medium_risk_keywords = data.get("medium_risk_keywords", [])
            self.benign_phrases = data.get("benign_whitelisted_phrases", [])
            self.archetype_mapping = data.get("archetype_mapping", {})

    def evaluate(self, tx: TransactionIntent, user: UserProfile) -> RiskReport:
        triggered_rules: List[str] = []
        
        # 1. Recipient Novelty Check (Max 25 pts)
        is_novel = tx.recipient_msisdn not in user.history_stats_30d.frequent_recipients
        s_rec = 25.0 if is_novel else 0.0
        if is_novel:
            triggered_rules.append("NOVEL_RECIPIENT_FIRST_TIME_TRANSFER")

        # 2. Amount Anomaly Calculation (Max 25 pts)
        mean_amt = user.history_stats_30d.mean_transfer_amount_iqd
        std_dev = max(1000.0, user.history_stats_30d.std_dev_amount_iqd)
        z_score = (tx.amount_iqd - mean_amt) / std_dev
        
        if z_score >= 2.5:
            s_amt = 25.0
            triggered_rules.append(f"EXTREME_AMOUNT_SPIKE_Z_{z_score:.1f}")
        elif z_score >= 1.5:
            s_amt = 15.0
            triggered_rules.append(f"MODERATE_AMOUNT_SPIKE_Z_{z_score:.1f}")
        else:
            s_amt = 0.0

        # 3. Iraqi Keyword Analysis (Max 35 pts)
        s_kw, matched_archetype, kw_rules = self._analyze_keywords(tx.note)
        triggered_rules.extend(kw_rules)

        # 4. Balance Drainage Velocity (Max 20 pts)
        s_vel = 0.0
        if user.current_balance_iqd > 0:
            drainage_ratio = tx.amount_iqd / float(user.current_balance_iqd)
            if drainage_ratio >= 0.85:
                s_vel = 20.0
                triggered_rules.append(f"RAPID_WALLET_DEPLETION_{int(drainage_ratio*100)}PCT")
            elif drainage_ratio >= 0.65 and is_novel:
                s_vel = 12.0
                triggered_rules.append(f"SUBSTANTIAL_BALANCE_DRAINAGE_{int(drainage_ratio*100)}PCT")

        # 5. Temporal Off-Hours Check (Max 10 pts)
        s_time = 0.0
        tx_time = tx.client_timestamp or datetime.now()
        current_hour = tx_time.hour
        if 0 <= current_hour < 5:
            s_time = 10.0
            triggered_rules.append("OFF_HOURS_TRANSFER_VULNERABILITY")

        # 6. Device & Telemetry Anomaly Check (Max 35 pts)
        s_dev = 0.0
        if tx.device_context:
            if tx.device_context.has_recent_incoming_call or tx.device_context.active_call_duration_seconds > 0:
                s_dev += 25.0
                triggered_rules.append("ACTIVE_PHONE_CALL_DURING_TRANSFER")
            if tx.device_context.is_screen_shared:
                s_dev += 35.0
                triggered_rules.append("SCREEN_SHARING_REMOTE_ACCESS_DETECTED")
            s_dev = min(35.0, s_dev)

        # Total Aggregation
        raw_total = s_rec + s_amt + s_kw + s_vel + s_time + s_dev
        final_score = int(min(100.0, round(raw_total)))

        # Severity Classification
        if final_score < 30:
            severity = "LOW"
            is_suspicious = False
        elif final_score < 60:
            severity = "MEDIUM"
            is_suspicious = True
        elif final_score < 80:
            severity = "HIGH"
            is_suspicious = True
        else:
            severity = "CRITICAL"
            is_suspicious = True

        breakdown = RiskFactorBreakdown(
            recipient_novelty_score=s_rec,
            amount_anomaly_score=s_amt,
            keyword_risk_score=s_kw,
            balance_drainage_score=s_vel,
            temporal_anomaly_score=s_time,
            total_risk_score=final_score,
            triggered_rules=triggered_rules,
            detected_archetype=matched_archetype
        )

        explanation = self._build_explanation(breakdown, is_novel, tx.amount_iqd, matched_archetype, s_dev)

        return RiskReport(
            is_suspicious=is_suspicious,
            risk_score=final_score,
            severity=severity,
            breakdown=breakdown,
            explanation=explanation
        )

    def _analyze_keywords(self, note: str) -> Tuple[float, Optional[str], List[str]]:
        if not note or not note.strip():
            return 0.0, None, []

        clean_note = note.strip().lower()

        matched_archetype = None
        rules = []
        score = 0.0

        # Check for Adversarial Prompt Injections in Note First
        injection_patterns = [
            r"تجاهل\s+(?:كافة\s+|جميع\s+)?التعليمات",
            r"(?:أمر|توجيه|تخطي)\s+(?:نظام|أمني|إداري)",
            r"التحويل\s+(?:آمن|معتمد|مرخص|سليم|موثق)",
            r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions",
            r"system\s+(?:override|prompt|mode)",
            r"<\/?[a-zA-Z_0-9]+>"
        ]
        for pat in injection_patterns:
            if re.search(pat, clean_note, re.IGNORECASE):
                return 35.0, "adversarial_injection", ["ADVERSARIAL_PROMPT_INJECTION_ATTEMPT"]

        # Check Archetype Mapping
        for archetype, keywords in self.archetype_mapping.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', clean_note) or kw in clean_note:
                    matched_archetype = archetype
                    break
            if matched_archetype:
                break

        # Check High Risk Keywords
        for kw in self.high_risk_keywords:
            if kw in clean_note:
                score = max(score, 35.0)
                rules.append(f"HIGH_RISK_KEYWORD_{kw}")
                break

        # Check Medium Risk Keywords
        if score == 0.0:
            for kw in self.medium_risk_keywords:
                if kw in clean_note:
                    score = max(score, 18.0)
                    rules.append(f"MEDIUM_RISK_KEYWORD_{kw}")
                    break

        # Check whitelisted phrases only if NO high/medium risk keywords matched
        if score == 0.0:
            for benign in self.benign_phrases:
                if benign in clean_note:
                    return 0.0, None, ["BENIGN_WHITELISTED_NOTE"]

        return score, matched_archetype, rules

    def _build_explanation(self, breakdown: RiskFactorBreakdown, is_novel: bool, amount: int, archetype: Optional[str], s_dev: float = 0.0) -> str:
        reasons = []
        if is_novel:
            reasons.append("First-time transfer to an unlinked recipient")
        if breakdown.amount_anomaly_score > 0:
            reasons.append(f"Unusually large transfer amount ({amount:,} IQD)")
        if breakdown.keyword_risk_score > 0:
            reasons.append(f"Note triggers known scam vocabulary (Archetype: {archetype or 'General Suspicion'})")
        if breakdown.balance_drainage_score > 0:
            reasons.append("Transfers a critical portion of available account balance")
        if breakdown.temporal_anomaly_score > 0:
            reasons.append("Late-night transaction time")
        if s_dev > 0:
            reasons.append("Active voice call or screen-sharing session detected during payment")

        if not reasons:
            return "Routine transaction with normal behavioral metrics."
        return "; ".join(reasons)
