import uuid
from datetime import datetime
from typing import Dict, Optional, List
from ..models.transaction import UserProfile, UserHistoryStats, TransactionIntent, AuditRecord

class MockWalletService:
    def __init__(self):
        # Seed 3 realistic Iraqi users
        self.users: Dict[str, UserProfile] = {
            "usr_haider": UserProfile(
                user_id="usr_haider",
                full_name="حيدر علي السعدي",
                current_balance_iqd=450000,
                account_tier="gold",
                history_stats_30d=UserHistoryStats(
                    total_transfers_count=18,
                    mean_transfer_amount_iqd=35000.0,
                    std_dev_amount_iqd=12000.0,
                    frequent_recipients=["07701111222", "07802222333", "07703333444"],
                    last_deposit_timestamp=datetime(2026, 9, 21, 12, 0),
                    recent_deposit_amount_iqd=250000
                )
            ),
            "usr_fatima": UserProfile(
                user_id="usr_fatima",
                full_name="فاطمة كريم الشمري",
                current_balance_iqd=1200000,
                account_tier="platinum",
                history_stats_30d=UserHistoryStats(
                    total_transfers_count=32,
                    mean_transfer_amount_iqd=80000.0,
                    std_dev_amount_iqd=30000.0,
                    frequent_recipients=["07715555666", "07826666777"],
                    last_deposit_timestamp=datetime(2026, 9, 20, 10, 30),
                    recent_deposit_amount_iqd=500000
                )
            ),
            "usr_ahmed": UserProfile(
                user_id="usr_ahmed",
                full_name="أحمد حسن البصري",
                current_balance_iqd=180000,
                account_tier="standard",
                history_stats_30d=UserHistoryStats(
                    total_transfers_count=6,
                    mean_transfer_amount_iqd=20000.0,
                    std_dev_amount_iqd=7000.0,
                    frequent_recipients=["07708888999"],
                    last_deposit_timestamp=datetime(2026, 9, 22, 9, 0),
                    recent_deposit_amount_iqd=100000
                )
            )
        }
        self.audit_log: List[AuditRecord] = []

    def get_user(self, user_id: str) -> Optional[UserProfile]:
        return self.users.get(user_id)

    def execute_transfer(self, tx: TransactionIntent) -> bool:
        user = self.get_user(tx.sender_id)
        if not user or user.current_balance_iqd < tx.amount_iqd:
            return False
        
        user.current_balance_iqd -= tx.amount_iqd
        user.history_stats_30d.total_transfers_count += 1
        return True

    def record_audit(self, record: AuditRecord):
        self.audit_log.append(record)
        return record.audit_id

    def list_audits(self) -> List[AuditRecord]:
        return self.audit_log
