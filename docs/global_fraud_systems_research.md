# Global Anti-Fraud Systems Research & Project Aman Defense Engineering Dossier
**Project:** Aman (أمان) — In-App Anti-Scam Shield for Iraqi Digital Wallets  
**Scope:** Global Regulatory Regimes, Behavioral Science, Telecom Telemetry, Iraqi Jurisprudence & Adversarial AI Defense  
**Date:** September 2026  

---

## 1. Executive Summary

This dossier synthesizes empirical field research across global financial jurisdictions (United Kingdom, Australia, Singapore, United States, India), qualitative community analyses (Reddit communities `r/Scams`, `r/TalesFromYourBank`, `r/AusFinance`, `r/Fintech`), cognitive neuroscience, and Iraqi telecommunications/statutory frameworks.

It establishes:
1. Why traditional static bank warnings fail universally (habituation and cognitive narrowing).
2. How global financial hubs combat Authorized Push Payment (APP) scams and where they stumble (the friction-conversion dilemma).
3. The carrier-grade USSD (`*210#` / `*280#`) and SS7 signaling architecture required for Iraq's 30%+ feature-phone transactors.
4. The statutory defense framework under Iraqi Law No. 78 of 2012, Central Bank of Iraq (CBI) regulations, and the Iraqi Civil Code No. 40 of 1951.
5. Production-grade defenses against adversarial prompt injection attacks in transaction notes.

---

## 2. Global Comparative Benchmark: Regimes, Architectures & Failure Modes

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   GLOBAL ANTI-FRAUD SYSTEMS COMPARISON                                 │
├─────────────┬─────────────────────┬───────────────────────┬──────────────────────┬─────────────────────┤
│ Jurisdiction│ Primary Regime      │ Liability Allocation  │ Latency / Friction   │ Failure Mode / Gap  │
├─────────────┼─────────────────────┼───────────────────────┼──────────────────────┼─────────────────────┤
│ UK          │ PSR APP Mandate     │ 50:50 Sending/Recv PSP│ Real-time (<2s)      │ £85k cap, muling    │
│ Australia   │ CBA NameCheck / ASA │ Voluntary / Shifting  │ 24h holds on >$500   │ Friction fatigue    │
│ Singapore   │ MAS SRF / Money Lock│ Tripartite (Bank/Tel) │ Hardware / In-person │ Accessibility clash │
│ USA         │ Zelle / Reg E 1005  │ 100% Victim Loss      │ Zero Friction (<1s)  │ 90%+ denial rate    │
│ India       │ NPCI UPI Dynamic    │ Friction Guardrails   │ 4h delay on new user │ Volume bottlenecks  │
│ Iraq (Aman) │ Hybrid App + USSD   │ Informed Sovereignty  │ Sub-second / Dialect │ Feature-phone USSD  │
└─────────────┴─────────────────────┴───────────────────────┴──────────────────────┴─────────────────────┘
```

### 2.1 United Kingdom: PSR Mandatory APP Reimbursement & FOS Precedents
* **The Regime:** On October 7, 2024, the UK Payment Systems Regulator (PSR) enacted a mandatory 50:50 reimbursement split between the sending and receiving payment service providers (PSPs) for Authorised Push Payment (APP) scams under Faster Payments and CHAPS.
* **Liability & Cap:** Capped at £85,000 per claim (aligned with FSCS limits). Reimbursement can only be denied if the sending PSP proves the customer acted with "gross negligence" (a legal threshold rarely met).
* **Confirmation of Payee (CoP):** Validates legal names against account numbers via Open Banking APIs.
* **Financial Ombudsman Service (FOS) Legal Doctrine:** In landmark decisions (e.g., DRN-3928192, DRN-4109822), FOS ruled that generic warnings (*"Do you trust this person?"*) do **not** discharge a bank's duty of care. When fraudsters coach victims to lie (e.g., claiming a payment is for "family"), banks remain liable if they possessed anomalous transaction signals (sudden drainage, novel payee) but failed to deliver a **tailored, scam-specific warning**.

### 2.2 Australia: CBA NameCheck, Scam-Safe Accord & The 24-Hour Friction Paradox
* **The Mechanism:** Major banks (CBA, Westpac, ANZ, NAB) deployed NameCheck combined with a mandatory **24-hour hold** on suspicious first-time transfers exceeding AUD $500, with crypto exchange transfers capped at AUD $10,000 monthly.
* **Empirical Outcome:** Scam losses plummeted by 76% (saving >$40M), but created massive customer backlash across `r/AusFinance`:
  - Legitimate peer-to-peer commerce (Facebook Marketplace, emergency trade services) ground to a halt.
  - Call centers were overwhelmed with furious customers demanding holds be lifted immediately.
  - Fraudsters adapted by smurfing transfers below $500 or coaching victims to use credit unions without automated holds.
* **Lesson for Iraq:** A blanket 24-hour delay is unviable for mobile wallets in cash-first economies like Iraq. Friction must be **dynamic, short (120–180 seconds), and cognitively disruptive rather than administratively paralyzing**.

### 2.3 Singapore: MAS Shared Responsibility Framework & "Money Lock"
* **Shared Liability (SRF):** Enacted on December 16, 2024, MAS and IMDA instituted tripartite liability across Banks, Telcos, and Consumers for digital phishing scams. Telcos bear liability if phishing SMS bypasses the SMS Sender ID Registry (SSIR). Banks bear liability if real-time surveillance or cooling-off periods fail.
* **MAS "Money Lock":** Introduced across DBS, OCBC, and UOB, allowing customers to lock away funds that **cannot be transferred digitally under any circumstance**. Unlocking requires in-person biometric authentication at a physical branch or ATM. Over SGD $9 billion was locked across 370,000 accounts.
* **Voluntary Transfer Blindspot:** The Singapore Police Force reported that Money Lock eliminated malware and credential theft, but failed against voluntary social engineering: fraudsters convinced victims to visit physical branches in person to withdraw and hand over cash.
* **Android Accessibility Sideloading Bans:** Singapore banks blocked app launches on Android devices with non-Play-Store apps holding `AccessibilityService` permissions. This triggered intense public backlash from visually impaired users and developers, while scammers simply reverted to voice social engineering (vishing).

### 2.4 United States: Zelle, EFTA Regulation E & The Senate PSI Investigation
* **The Legal Stand-off:** Major banks (JPMorgan Chase, Bank of America, Wells Fargo via Early Warning Services) take the legal position that under EFTA Regulation E (12 CFR Part 1005), scam-induced transfers are "authorized," denying >90% of scam claims.
* **Senate PSI Report (July 2024):** The US Senate Permanent Subcommittee on Investigations revealed that banks reimbursed unauthorized fraud only 38% of the time in 2023, while customers lost $456 million in 2022 on Zelle with negligible recovery.
* **The Failure of Static Banners:** Zelle's static banner (*"Only send to people you trust"*) suffers 100% habituation. When a scammer impersonates bank fraud personnel directing a victim to a "safe holding account," the victim reasons they "trust" their bank, rendering the banner inert.

### 2.5 India: NPCI UPI Dynamic Guardrails
* **Hardware SIM Binding:** UPI requires cryptographically bound SIM-to-device authentication via signed SMS handshakes before app execution.
* **Cooling Off:** New beneficiary transfers are capped at ₹2,000–₹5,000 for the first 24 hours with a 4-hour delay on limit expansion.
* **Decoupled QR Architecture:** Technically and visually separated "Collect" (debit) from "Pay" (credit) requests, eliminating "claim prize by scanning QR" fraud.

---

## 3. Cognitive Neuroscience & Frontline Psychology

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE NEURO-COGNITIVE INTERVENTION MODEL                                    │
│                                                                                                         │
│  [ VISCERAL STATE: PANIC / GREED ]                                                                     │
│  • Amygdala Hijack (System 1)               ┌──────────────────────────────────────────────┐            │
│  • High-Arousal Tunnel Vision               │ 1. VISUAL SHOCK: Dynamic Polymorphic UI      │            │
│  • Scammer = Trusted Authority              │    (Prevents Occipital Suppression)          │            │
│                                             └──────────────────────┬───────────────────────┘            │
│                                                                    ▼                                    │
│                                             ┌──────────────────────────────────────────────┐            │
│                                             │ 2. LINGUISTIC EMBRACE: ar-IQ Warm Dialect    │            │
│                                             │    (Breaks Corporate CYA Psychological Dist) │            │
│                                             └──────────────────────┬───────────────────────┘            │
│                                                                    ▼                                    │
│                                             ┌──────────────────────────────────────────────┐            │
│                                             │ 3. COGNITIVE DISSONANCE: Script Prediction   │            │
│                                             │    (Prebunking Destroys Scammer Trust)       │            │
│                                             └──────────────────────┬───────────────────────┘            │
│                                                                    ▼                                    │
│                                             ┌──────────────────────────────────────────────┐            │
│                                             │ 4. MOTOR SPEED-BUMP: 120s Cooling + Typing   │            │
│                                             │    (Forces System 2 Deliberative Processing) │            │
│                                             └──────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Neurological Habituation (Anderson et al., 2015):** fMRI studies demonstrate that visual processing centers (occipital lobe) suppress static warning dialogs upon the second exposure. Aman resolves this via **Polymorphic UI**: rotating modal themes, layout cards, and icons so procedural muscle memory cannot form.
2. **Loewenstein's Visceral State & Cognitive Narrowing:** When under acute emotional arousal (threats of arrest or lottery euphoria), the amygdala hijacks cognitive bandwidth, suppressing System 2 prefrontal deliberation. Decelerating the victim for **120 seconds** allows physiological cortisol dissipation.
3. **Inoculation Theory & Psychological Prebunking (McGuire):** Post-facto debunking fails due to cognitive dissonance. Inoculation pre-emptively exposes the victim to the scammer's manipulation:
   > *"المتصل هسة راح يلح عليك ويكلك: 'إذا ما تحول خلال 10 دقائق تروح عليك الجائزة'. هذا أسلوب احتيالي معروف."*
   When the scammer repeats that exact line 30 seconds later, the victim realizes they are following a scripted con.
4. **Sociolinguistics of Dialect vs. Modern Standard Arabic (MSA):** Modern Standard Arabic (*الفصحى*) is perceived as cold corporate legal disclaimers. Authentic Iraqi Arabic (`ar-IQ`) with kinship honorifics (*"عيني حبيبي دير بالك"*) bypasses bureaucratic skepticism and is received as well-meaning advice from a respected family elder.

---

## 4. Carrier-Grade USSD (*210# / *280#) & Feature-Phone Defense in Iraq

In Iraq, over 30% of digital wallet transactions originate on 2G/3G feature phones via USSD (`*210#` for ZainCash, `*280#` for Qi Card). In rural governorates (Nineveh, Anbar, Maysan, Dhi Qar), feature phones account for over 45% of agent cash-outs and peer-to-peer transfers.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               USSD TELECOM SIGNALLING ARCHITECTURE                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│ [Feature Phone]  <== 2G/3G Radio (Fast Radio Link) ==>  [Base Station (BTS)]                     │
│                                                               │                                  │
│                                                               ▼                                  │
│                                                      [MSC / VLR / HLR]                           │
│                                                               │                                  │
│                                      SS7 / SIGTRAN (MAP Protocol)                                │
│                                                               ▼                                  │
│                                                     [USSD Gateway (USSDC)]                       │
│                                                               │                                  │
│                                             HTTP REST / XML / SMPP                               │
│                                                               ▼                                  │
│                                                    [Aman Core Risk Engine]                       │
│                                                               │                                  │
│                             ┌─────────────────────────────────┴──────────────────────────────┐   │
│                             ▼                                                                ▼   │
│                   [Layer 1 Heuristics]                                             [SS7 PSI Query]
│                   - Recipient Novelty                                              - Call State  │
│                   - Amount Anomaly                                                 - SIM Swap    │
│                   - Hakikisha KYC Match                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Telecom Technical Constraints
* **Session Inactivity Timers (3GPP TS 23.090 / TS 24.080):** USSD sessions operate via TCAP/MAP dialogs (`PSSR`/`USSR`). The USSD Gateway (USSDC) enforces an **Application Inactivity Timer of 20 to 30 seconds per menu hop**. If the user does not respond within this window, the USSDC aborts the TCAP dialogue (`TC-ABORT`). Multi-turn conversational LLM flows are technically impossible over USSD.
* **Arabic Character Limits (GSM 03.38 / UCS-2):** Arabic USSD strings utilize UCS-2 (16-bit) encoding. The MAP USSD string maximum is 160 octets (80 characters). Accounting for menu index overhead and handset display truncation, interactive menus must be bounded to **$\le 70$ characters**.

### 4.2 Four-Tier Pre-Transaction USSD Defense Strategy
1. **Pre-PIN Hakikisha Recipient Name Resolution:** Before prompting for the wallet PIN, the USSD Gateway queries the core banking engine and renders the recipient's verified KYC legal name:
   ```
   تحويل: 250,000 د.ع
   إلى: كرار علي جاسم
   1- تأكيد
   2- إلغاء
   ```
   If the scammer claimed to be "ZainCash Support", the civilian name immediately unmasks the deception.
2. **Dynamic Dialect Risk-Screen Injection (Inverted Choice Architecture):** For transactions with Risk Score $\ge 70$, inject a 70-character Iraqi dialect decision screen:
   ```
   تحذير أمان: المستلم حساب جديد.
   هل خابرك شخص وكالك ربحت جائزة؟
   1- نعم (إلغاء التحويل)
   2- لا (متابعة)
   ```
   Framing Option 1 as cancellation protects panicked users who instinctively select the first option.
3. **SS7 Signaling Telemetry (Active Call & SIM-Swap Checks):**
   - **Active Voice Call Check (MAP `ProvideSubscriberInfo`):** The Core Gateway queries the MSC/VLR via SS7 MAP PSI. If the VLR returns `camelBusy` or `callState: active` while the user is dialing `*210#`, it proves **the user is currently on an active voice call while transferring money**. Because ZainCash is a direct subsidiary of Zain Iraq, it has internal Diameter/MAP access to the HLR/HSS without third-party aggregator latency.
   - **SIM-Swap Interlock:** Querying HLR IMSI-MSISDN pairing timestamps; any SIM swap within 48 hours halts high-value USSD transfers.
4. **Asynchronous Out-of-Band IVR Callback:** For critical-risk transfers (> 500,000 IQD):
   - The USSD session closes: *"طلبك قيد التدقيق لحمايتك. سنتصل بك هاتفياً خلال دقيقة لتأكيد العملية."*
   - Core engine places the transfer on a 5-minute cooling-off hold.
   - Automated IVR call triggers in Baghdadi dialect: *"أهلاً بك من زين كاش. وردنا طلب تحويل بمبلغ 500 ألف دينار إلى كرار علي. إذا كنت تتعرض لضغط، اضغط 9 لإلغاء التحويل فوراً."*  
   This breaks the 25-second USSD session limit and terminates the fraudster's active phone hold.

---

## 5. Judicial Standing & Central Bank of Iraq (CBI) Regulations

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                IRAQI LEGAL & REGULATORY TRIANGLE                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│                 [Iraqi Electronic Signature & Transactions Law No. 78 of 2012]                   │
│                       (Art. 4 Signature Validity & Art. 13 Evidentiary Weight)                   │
│                                              ▲                                                   │
│                                             ╱ ╲                                                  │
│                                            ╱   ╲                                                 │
│                                           ╱     ╲                                                │
│                                          ▼       ▼                                               │
│    [CBI Payment Regulation No. 2 of 2024] ◄─────► [Iraqi Civil Code No. 40 of 1951]             │
│    - Consumer Protection Directives               - Defect of Will (الغبن والتغرير / Art. 121)   │
│    - Shared Responsibility (المسؤولية المشتركة)   - Third-Party Deceit Defense (Art. 122)        │
│    - Due Diligence (عناية الشخص المعتاد)          - Adhesion Contract Defense (Art. 167)         │
│                                                   - Tort Liability Exoneration (Art. 210)        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Statutory Analysis
1. **Electronic Signature and Transactions Law No. 78 of 2012:**
   - *Article 4 (Validity Criteria):* Requires the electronic signature medium to remain under the sole control of the signatory with detectable alterations.
   - *Article 13 (Evidentiary Weight):* Grants electronic records the exact same binding legal force as physical paper documents, provided they remain immutable, retrievable, and identify their originator.
2. **CBI Payment Services Regulation No. 2 of 2024 & Consumer Protection Guides:**
   - Mandates payment service providers exercise due diligence (عناية الشخص المعتاد).
   - Governed by the CBI Financial Consumer Protection Regulation of 2022 and Banking Consumer Protection Guide, establishing the doctrine of **"المسؤولية المشتركة" (Shared Responsibility)**: Consumers who share OTPs or override specific, unambiguous security warnings bear contributory negligence.
3. **Iraqi Civil Code No. 40 of 1951:**
   - *Third-Party Deceit (Article 122):* Provides that if deceit (*taghreer*) is practiced by a third party, the transaction cannot be voided against the intermediary bank unless the victim proves the bank knew or could easily have known of the deceit. Delivering tailored scam warnings proves the bank discharged its duty.
   - *Adhesion Contracts (Article 167):* Generic disclaimers (*"The bank is never liable"*) are struck down under Article 167(2). Only tailored, informed disclosures create enforceable indemnity.
   - *Tort Liability Exoneration (Article 210):* Mandates that if damage resulted from the victim's own fault (*khata' al-mutadarrir*) or the act of a third party, the defendant is relieved of liability. An informed user override constitutes contributory fault that legally breaks causation.
4. **Supreme Judicial Council Directive No. 127 of 2021:** Certified electronic records bearing cryptographic hashes and server timestamps are admissible as conclusive evidence across all commercial courts in Iraq.

### 5.2 Server-Signed Cryptographic Audit Record Specification
```json
{
  "audit_event_id": "cbi_consent_98a72f1b-5e41",
  "account_msisdn": "+9647801234567",
  "national_id_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "timestamp_utc": "2026-09-22T01:15:23.892Z",
  "risk_score_at_prompt": 82,
  "detected_archetype": "advance_fee_lottery",
  "displayed_warning_text_ar": "عيني حيدر دير بالك! ماكو أي جهة أو شركة رسمية بالعراق تطلب منك تدفع فلوس أو رسوم حتى تستلم جائزة سيارة أو مبالغ نقدية.",
  "warning_text_hash_sha256": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
  "user_override_action": "EXPLICIT_AFFIRMATIVE_SELECTION",
  "user_override_label_selected": "أريد المتابعة - أعرف المستلم وأتحمل المسؤولية",
  "device_telemetry_snapshot": {
    "ip_address": "37.237.142.12",
    "cell_tower_id": "418-20-1420-58192",
    "app_version": "v4.12.0_prod",
    "screen_dwell_time_ms": 4820
  },
  "server_hmac_signature": "9f83ab28c9472e38b021a83017f8a93172e01b45281739c94827d0184a293b8e",
  "cbi_regulatory_declaration": "Law No. 78 of 2012 / Art 13 compliant non-repudiation record"
}
```

---

## 6. Adversarial LLM Prompt Injection Defense-in-Depth

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             PROMPT INJECTION DEFENSE-IN-DEPTH                                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│ [Untrusted User Input: tx.note]                                                                  │
│           │                                                                                      │
│           ▼                                                                                      │
│ ┌───────────────────────────────────────┐                                                        │
│ │ Layer 1: Normalization & Sanitization │ ==> Strips control chars, RTL overrides, escapes XML   │
│ └───────────────────┬───────────────────┘                                                        │
│                     ▼                                                                            │
│ ┌───────────────────────────────────────┐                                                        │
│ │ Layer 2: Dual-Language Guardrails     │ ==> Rejects Arabic & English injection keywords        │
│ └───────────────────┬───────────────────┘                                                        │
│                     ▼                                                                            │
│ ┌───────────────────────────────────────┐                                                        │
│ │ Layer 3: Cryptographic Nonce Sandbox  │ ==> Sandboxes payload inside <untrusted_note nonce=...>│
│ └───────────────────┬───────────────────┘                                                        │
│                     ▼                                                                            │
│ ┌───────────────────────────────────────┐                                                        │
│ │ Layer 4: Deterministic Supremacy     │ ==> Decouples policy: LLM CANNOT lower risk score      │
│ └───────────────────┬───────────────────┘                                                        │
│                     ▼                                                                            │
│ ┌───────────────────────────────────────┐                                                        │
│ │ Layer 5: Post-Gen Semantic Output Gate│ ==> Validates enum ("cancel"/"review"), bans safe words│
│ └───────────────────────────────────────┘                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Normalization & Sanitization:** Unicode NFKC normalization, stripping bidirectional override characters (`\u202E`, `\u200F`), and XML entity escaping (`<` to `&lt;`, `>` to `&gt;`).
2. **Dual-Language Guardrail Regex:** Blocks injection keywords in both Arabic (`تجاهل التعليمات`, `أمر نظام`, `التحويل معتمد`) and English (`ignore previous instructions`, `system override`). If triggered, awards +35 risk points and defaults to static fallbacks.
3. **Dynamic Cryptographic Nonce Sandboxing:** Sandboxes `tx.note` within unguessable single-use 16-hex nonces: `<untrusted_note nonce="a8f3b9c1d2e41057">`.
4. **Deterministic Supremacy:** The LLM has zero authority over risk scores or policy tiers. Layer 1 determines whether friction is enforced.
5. **Post-Generation Semantic Output Gate:** Validates enum values (`cancel` or `review_carefully`), rejects `proceed`, and bans false-reassurance phrases in Arabic (`"التحويل آمن"`, `"حساب معتمد وموثق"`).
