# Aman (أمان) - Multi-Signal Agentic Architecture & Mechanism
*(Production-Hardened & Regulatory-Compliant Specification)*

## 1. System Overview & Philosophy
"Aman" is a context-aware, proactive anti-scam agent designed for Iraqi digital wallets (ZainCash, Qi Card). Unlike traditional post-transaction systems that react after funds have already been cashed out at physical kiosks, Aman operates **pre-transaction** at the point of intent.

It balances two vital requirements:
1. **Strict Banking Compliance & Explainability**: Zero black-box ML freezing of user funds; preserves digital wallet sovereignty.
2. **Deep Behavioral Intelligence & Enterprise Realism**: Multi-signal perception, hypothesis testing, psychological scam prediction in Iraqi Arabic (`ar-IQ`), and a protected Human-in-the-Loop (HITL) learning cycle.

---

## 2. The 4-Stage Mechanism

```
┌─────────────────────────────────────────────────────────┐
│                 1. THE SENSOR CORTEX                    │
│   (App Lifecycle Telemetry + Pre-computed Mule Graph)   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │        2. THE AGENTIC BRAIN         │
        │  (Reasoning & Hypothesis Testing)   │
        └──────────────────┬──────────────────┘
                           │
 ┌─────────────────────────┴─────────────────────────┐
 ▼                                                   ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     3. DYNAMIC INTERVENTION   │   │     4. HITL CONTINUOUS        │
│ (Adaptive Dialect Coaching &  │   │        LEARNING LOOP          │
│   Business-Calibrated Friction│   │ (Anti-Poisoning & Validation) │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

### Stage 1: The Multi-Signal Sensor Cortex
Before the user taps "Confirm Transfer", Aman aggregates 4 telemetry vectors without requiring privacy-invasive OS permissions:

1. **In-App Lifecycle & Environmental Telemetry (Store-Compliant)**:
   - *App-Switch Velocity*: Detects rapid switching between external messaging apps (WhatsApp/Telegram) and ZainCash within a 30-second window.
   - *Clipboard Insertion Speed*: Flags if recipient wallet was pasted within 500ms of screen launch (indicates copy-pasting from external instructions).
   - *Interaction Hesitation*: Analyzes typing cadence and screen dwell time (panic vs. normal deliberate entry).
   - *(Note: Avoids invasive telephony/call-recording permissions to guarantee smooth Apple App Store & Google Play approval).*

2. **Customer Behavioral DNA (Baseline Profiling)**:
   - Historical baseline of user transaction patterns (usual time of day, average remittance size, known recipients).
   - Anomaly multiplier calculated against a rolling 90-day baseline.

3. **Pre-Computed Recipient Network Graph (Mule Detection)**:
   - Pre-calculated asynchronously via stream workers to prevent database choke during high-volume Iraqi salary payout days:
     - Account age $< 72\text{ hours}$.
     - Velocity spike: In-degree velocity across $> 3$ governorates in under 4 hours.
     - Cash-out pattern: Historical immediate cash-out ratio at physical neighborhood kiosks.

4. **Live Threat Intelligence (RAG Vector Database)**:
   - Continuously updated vector database indexing active Iraqi fraud campaigns (e.g., Minha Grant, fake lottery SMS, unauthorized forex schemes).

---

### Stage 2: The Agentic Brain (Reasoning Loop)
The agent executes a structured cognitive reasoning loop:

1. **Perception**: Synthesizes inputs from the Sensor Cortex via low-latency Redis lookups.
2. **Hypothesis Testing**: Formulates and weighs competing hypotheses:
   - *Hypothesis A*: Legitimate urgent remittance (e.g., family emergency, verified vendor).
   - *Hypothesis B*: Socially engineered urgency / impersonation / lottery fraud.
3. **Policy Selection**: Determines friction tier based on a business-calibrated risk threshold:
   - *Tier 0 (Score 0–34)*: Silent pass-through (Zero friction).
   - *Tier 1 (Score 35–69)*: Subtle inline dialect check (Non-blocking).
   - *Tier 2 (Score 70–84)*: Bottom-sheet dialect intervention with script prediction.
   - *Tier 3 (Score 85–100)*: High-friction cooling-off countdown with mandatory confirmation phrase.
4. **Adaptive Dialect Coaching**:
   - Generates natural Iraqi Arabic (`ar-IQ`) interventions.
   - Applies **Predictive Psychology**: Explicitly states the scammer's next steps to break the victim's emotional panic.

---

### Stage 3: Dynamic Intervention & User Sovereignty

| Risk Level | Score | UX Action | Business & Psychological Impact |
| :--- | :--- | :--- | :--- |
| **Low** | 0–34 | Silent Pass | Zero impact on conversion; 90%+ of transactions pass instantly. |
| **Medium** | 35–69 | Inline Dialect Nudge | Friendly reminder verifying recipient identity without blocking checkout. |
| **High** | 70–84 | Dialect Bottom-Sheet + Script Prediction | Dismantles scammer trust by predicting their next words. |
| **Critical**| 85–100 | 3-Min Cooling Off + Confirmation Phrase | Reserved strictly for confirmed mule matches; breaks panic trance. |

*User Sovereignty Guarantee: Aman does not freeze customer funds. It provides informed psychological protection while keeping an auditable log.*

---

### Stage 4: Human-in-the-Loop (HITL) Continuous Learning
To prevent **Adversarial Poisoning** (scammers sending fake disputes to mislead automated retraining), the system enforces human-supervised adaptation:

```
               ┌──────────────────────────────────────────────┐
               │    Dispute Reported or Overridden Event      │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │         AI Pattern Clustering Engine         │
               │   (Extracts new keywords, scripts & mules)   │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │     ZainCash Fraud Analyst Workbench         │
               │    (Human reviews suggested rule updates)    │
               └──────────────────────┬───────────────────────┘
                                      │
                         [Analyst Clicks "Approve"]
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │       Production RAG & Rules Updated         │
               └──────────────────────────────────────────────┘
```

1. **AI Synthesis**: When fraud reports arrive, the AI clusters emerging patterns and drafts new threat vectors and prompt examples.
2. **Analyst Review**: A bank fraud analyst reviews proposed updates on an internal dashboard with 1 click.
3. **Safe Vector Deployment**: Validated patterns update the production RAG index safely without downtime or poisoning risk.
4. **False-Positive Pruning**: Repeated overrides with zero customer disputes automatically reduce heuristic weights for verified merchants.

---

## 5. Ecosystem Realities: Kiosk Interlocks, USSD & Legal Enforceability

### A. Pre-Transaction Physical Cash-Out Defense (180s Kiosk Hold)
In Iraq, scammers cash out funds into physical banknotes at local agent kiosks within 3–5 minutes. If a victim overrides a Tier 3 Critical alert, Aman permits the ledger transfer but attaches a temporary core-ledger withdrawal reservation:
- Flag: `HOLD_CASH_OUT_EXPIRY = NOW() + 180s`
- Agent POS Terminal Response: *"الرصيد قيد التدقيق الأمني المؤقت - يرجى الانتظار 3 دقائق لإتمام السحب النقدي"*
- Impact: Preserves sender autonomy while completely neutralizing the scammer's physical cash-out speed advantage.

### B. Feature Phone Telecom Signaling (`*210#` / `*280#`)
For Iraq's 30%+ feature-phone transactors where 25-second USSD session timeouts (3GPP TS 23.090) and 70-character UCS-2 Arabic limits apply:
- **SS7 MAP `ProvideSubscriberInfo` (PSI):** Queries the serving MSC/VLR via Zain Iraq's core signaling backbone to detect if the user is currently on an active voice call while dialing `*210#` (+25 risk points).
- **Hakikisha KYC Name Resolution:** Renders the recipient's verified legal civilian name before prompting for the wallet PIN, immediately unmasking fake "ZainCash Support" or "Ministry" impersonations.
- **Out-of-Band IVR Callback:** For transfers >500,000 IQD, closes the USSD session and triggers an automated outbound call in Baghdadi dialect with a 1-tap cancellation option, breaking the scammer's active phone hold.

### C. Legal Non-Repudiation (Central Bank & Iraqi Civil Code)
- **Law No. 78 of 2012 (Art. 13):** Grants server-signed electronic consent records the full evidentiary force of notarized paper documents.
- **Iraqi Civil Code No. 40 of 1951 (Art. 210 & Art. 122):** Provides statutory tort exoneration: damage resulting from the victim's informed fault (*khata' al-mutadarrir*) after specific, unambiguous scam disclosure legally breaks causation, shielding the financial institution from civil liability.
