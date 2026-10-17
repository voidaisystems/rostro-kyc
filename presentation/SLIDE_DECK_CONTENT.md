# Slide Deck Blueprint: Project "Aman" (أمان)
**Competition:** Agentic AI Challenge Iraq — Phase Two  
**Format:** 2 Slides (Strict Limit)  
**Target Audience:** Expert Judges (The Leaders of AI Intelligence, Young Arab Leaders, Fintech Executives)  
**Presentation Duration:** ~3 Minutes (~90 seconds per slide)

---

## 🎨 Visual Design System & Branding Guidelines

* **Primary Palette:** 
  * Background: Pure Dark Slate `#0F172A` or Clean Crisp White `#FFFFFF` (High contrast, modern fintech style).
  * Brand Accent 1 (ZainCash Signature): Rich Burgundy / Deep Red `#9E1B32` or `#8B0000`.
  * Brand Accent 2 (Safety / Trust): Emerald Green `#10B981` (for safe / verified states).
  * Brand Accent 3 (Warning / Alert): Amber Gold `#F59E0B` (for detected scam interventions).
* **Typography:**
  * English Headings: Clean sans-serif (Inter, Montserrat, or SF Pro Display), Bold.
  * Arabic Callouts & Quotes: Modern clean Arabic font (Almarai, Cairo, or IBM Plex Arabic).
* **Visual Density:** Clean 2-column or 3-column card layouts. **Avoid dense walls of plain text.** Use bullet points, bold keywords, badges, and visual flowcharts.

---

# 📽️ SLIDE 1: SYSTEM OVERVIEW, VALUE PROPOSITION & IMPACT

### Visual Layout:
* **Top Header Bar:** 
  * Left: Project Logo: **Aman (أمان) — In-App Scam Shield**
  * Right: *Topic 01: Fraud & Scam Protection Agent | Agentic AI Challenge Iraq*
* **Left Card (40% width): "The Iraqi Problem — The Instant Cash-Out Gap"**
  * Visual: Graphic of a ticking clock (3–5 minutes) $\rightarrow$ Physical agent cash-out kiosk.
  * Content bullets:
    * **Social Engineering Epidemic:** Fraudsters exploit trust, urgency, and fear (fake OTP verification, fake prize fees, emergency impersonation).
    * **The 3-Minute Cash-Out Reality:** Victims are manipulated into peer-to-peer transfers. Scammers withdraw 100% of cash at neighborhood kiosks within 3–5 minutes.
    * **Why Post-Transaction Alerts Fail:** Standard banking notifications arrive hours too late. In Iraq, **intervention must happen at the point of intent—before the user hits Send**.
* **Right Card (60% width): "The Solution — Aman Dual-Layer Shield"**
  * **Core Concept:** A proactive, context-aware pre-transaction guardian embedded inside ZainCash / Qi Card checkout.
  * **The 4 Key Pillars (2x2 Grid):**
    1. 🛡️ **Pre-Transaction Interception:** Triggers during checkout before the wallet balance changes. Money never leaves without informed clarity.
    2. 🧠 **Deterministic Precision + Dialect Coaching:** Central Bank compliant, auditable math paired with psychological counter-coaching in native Iraqi Arabic (`ar-IQ`).
    3. ⚖️ **User Sovereignty & Business Calibration:** Never locks wallets unilaterally; 90%+ of normal transfers experience zero friction. Preserves wallet transaction volume.
    4. 🔒 **Store-Compliant & Regulatory Safe:** Zero privacy-invasive OS permissions (100% App Store & Google Play approved); full immutable audit trails.

---

### 🎙️ Slide 1 Spoken Pitch Script (Speaker: ~90 Seconds)

> *"Good afternoon, respected judges and organizers.*
> 
> *In Iraq today, the greatest barrier to digital wallet adoption isn't technical hacking—it’s social engineering. Every single day, ordinary Iraqi families receive calls from fraudsters claiming to be ZainCash support asking for an OTP, or WhatsApp messages claiming they won a car draw and just need to pay an upfront processing fee.*
> 
> *Here is the harsh reality of our local market: in Iraq, once a victim presses 'Send', that money is gone forever. Within three to five minutes, the fraudster has already cashed it out at a neighborhood agent in Baghdad, Basra, or Erbil. Standard banking alerts that arrive after the fact are completely useless.*
> 
> *This is why we built **Aman (أمان)**.*
> 
> *Aman is an in-app behavioral scam protection agent that intervenes at the exact moment of decision—before the transaction completes. Built with production realism, Aman respects mobile privacy standards: it requires zero invasive OS permissions, using in-app interaction dynamics like rapid app-switching and clipboard speed.*
> 
> *Instead of frustrating users by freezing their money, Aman combines deterministic, auditable risk scoring with an intelligent coaching agent that speaks authentic, empathetic Iraqi Arabic. It dismantles the scammer’s psychological trick in real time, protects life savings, and preserves trust in Iraq's digital economy."*

---

# 📽️ SLIDE 2: HOW IT WORKS — ARCHITECTURE, FLOW & FAIL-SAFES

### Visual Layout:
* **Top Header Bar:** 
  * Left: **How It Works — Multi-Signal Sensing, Dialect Reasoning & Safe Adaptation**
  * Right: *Architecture, Performance SLA & Safeguards*
* **Top Section: The End-to-End System Pipeline (Horizontal 4-Step Diagram)**
  ```
  [1. Sensor Cortex]       ──►  [2. Layer 1: Risk Engine]  ──►  [3. Layer 2: Dialect Coach]  ──►  [4. Resolution & HITL]
  • In-App Dwell & Paste        • 90-Day Baseline Delta          • Qdrant Iraqi Threat RAG        • 🛑 User Cancels (Funds Saved)
  • App-Switch Velocity         • Pre-computed Mule Graph        • Dialect Psychological Nudge    • ⚠️ Informed Proceed (Logged)
  • Zero Invasive Permissions   • Score: 0 - 100 (< 50ms)        • Predicts Scammer Next Move     • 🛡️ Analyst Sign-off on Updates
  ```
* **Bottom Left Card (50% width): "Production Engineering & Scale"**
  * **Peak-Load Protection:** Mule graph relationships are pre-calculated asynchronously via stream workers into **Redis**, delivering $< 4\text{ms}$ lookups during peak Iraqi government salary payout surges.
  * **1,200ms Latency Circuit Breaker:** If poor mobile connectivity delays LLM inference, the system seamlessly falls back to verified static Arabic warnings. The app **never freezes**.
  * **Calibrated Business Friction:** High-friction cooling-off timers ($3\text{ min}$) are strictly isolated to critical mule matches ($Score > 85$), ensuring ordinary payments remain frictionless.
* **Bottom Right Card (50% width): "Safeguards, Failure Modes & HITL Learning"**
  * **Adversarial Poisoning Defense:** Continuous learning uses a **Human-in-the-Loop (HITL) Fraud Analyst Workbench**. AI clusters emerging scam scripts from customer disputes, but rule/vector updates require 1-click analyst approval.
  * **Emergency False-Positive Defense:** 1-tap informed override with clear risk acknowledgement; critical emergencies (e.g., hospital payments) are never blocked.
  * **Held-out Benchmark:** 100 synthetic scenarios across 5 Iraqi fraud archetypes achieving **>90% precision** and **>94% recall**.

---

### 🎙️ Slide 2 Spoken Pitch Script (Speaker: ~90 Seconds)

> *"Now, let's look at how Aman operates under the hood.*
> 
> *Our architecture is engineered for real-world banking constraints, separating deterministic detection from generative coaching.*
> 
> *In **Stage 1**, when a user prepares a transfer, our Sensor Cortex checks store-compliant behavioral signals: did they switch between WhatsApp and ZainCash multiple times in 30 seconds? Did they paste the wallet number in under 500 milliseconds? In parallel, it queries Redis in under 4 milliseconds to retrieve the recipient's pre-computed mule network score—ensuring our system never slows down even during peak government salary payout days.*
> 
> *In **Stage 2**, our deterministic risk engine calculates an auditable score. If risk is low, the transfer completes instantly. If a scam pattern is flagged, **Stage 3** triggers: our Iraqi dialect coach appears via an in-app bottom sheet. It speaks natural Baghdadi Arabic: 'حبيبي دير بالك، ماكو مسابقة رسمية تطلب رسوم قبل لا تستلم الجائزة'. It uses predictive psychology to name the scammer's exact next manipulation, breaking the victim's emotional panic.*
> 
> *Finally, in **Stage 4**, we address continuous adaptation safely. To prevent scammers from poisoning the AI with fake disputes, we enforce a Human-in-the-Loop workflow: the AI identifies emerging patterns, but a ZainCash fraud analyst must approve updates with one click before they go live.*
> 
> *With a 1,200-millisecond hard circuit breaker and an evaluation benchmark demonstrating over 90% precision and 94% recall, Aman is not just a concept—it is an enterprise-ready shield for Iraqi digital finance. Thank you, and we look forward to your questions."*
