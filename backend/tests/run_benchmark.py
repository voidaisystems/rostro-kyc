import json
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from app.models.transaction import TransactionIntent, UserProfile, UserHistoryStats
from app.services.detection_engine import DeterministicRiskEngine

def run_evaluation_benchmark():
    data_path = os.path.join(os.path.dirname(backend_dir), "data", "synthetic_test_set.json")
    if not os.path.exists(data_path):
        print(f"Error: Test set not found at {data_path}")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    engine = DeterministicRiskEngine()

    tp = 0
    fp = 0
    tn = 0
    fn = 0
    
    results = []

    for item in scenarios:
        # Construct synthetic user matching scenario
        user = UserProfile(
            user_id=item["sender_phone"],
            full_name="المستخدم التجريبي",
            current_balance_iqd=500000,
            account_tier="standard",
            history_stats_30d=UserHistoryStats(
                total_transfers_count=12,
                mean_transfer_amount_iqd=item["user_avg_transfer_iqd"],
                std_dev_amount_iqd=max(5000.0, item["user_avg_transfer_iqd"] * 0.35),
                frequent_recipients=[] if item["is_novel_recipient"] else [item["recipient_phone"]]
            )
        )

        tx = TransactionIntent(
            sender_id=item["sender_phone"],
            recipient_msisdn=item["recipient_phone"],
            amount_iqd=item["amount_iqd"],
            note=item["note"]
        )

        report = engine.evaluate(tx, user)
        is_predicted_scam = report.is_suspicious
        ground_truth = item["is_scam"]

        if is_predicted_scam and ground_truth:
            tp += 1
            verdict = "✅ True Positive"
        elif is_predicted_scam and not ground_truth:
            fp += 1
            verdict = "⚠️ False Positive"
        elif not is_predicted_scam and not ground_truth:
            tn += 1
            verdict = "✅ True Negative"
        else:
            fn += 1
            verdict = "❌ False Negative"

        results.append({
            "id": item["id"],
            "archetype": item["archetype"],
            "score": report.risk_score,
            "ground_truth": ground_truth,
            "predicted": is_predicted_scam,
            "verdict": verdict,
            "rules": report.breakdown.triggered_rules
        })

    total = len(scenarios)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / total if total > 0 else 0.0

    print("=" * 70)
    print(" 🛡️  PROJECT AMAN (أمان) — EVALUATION BENCHMARK REPORT")
    print("=" * 70)
    print(f"Total Scenarios Evaluated: {total}")
    print(f"True Positives (Scams Blocked):  {tp}")
    print(f"True Negatives (Legit Passed):   {tn}")
    print(f"False Positives (False Alarms):  {fp}")
    print(f"False Negatives (Scams Missed):  {fn}")
    print("-" * 70)
    print(f"🎯 Precision: {precision * 100:.1f}%")
    print(f"🔍 Recall:    {recall * 100:.1f}%")
    print(f"⚖️ F1 Score:  {f1 * 100:.1f}%")
    print(f"📊 Accuracy:  {accuracy * 100:.1f}%")
    print("=" * 70)
    print("\nDetailed Scenario Breakdown:")
    for r in results:
        flag = "[SCAM]" if r["ground_truth"] else "[NORM]"
        print(f"  {r['id']} {flag:6} | Score: {r['score']:2}/100 | {r['verdict']} | Archetype: {r['archetype']}")

if __name__ == "__main__":
    run_evaluation_benchmark()
