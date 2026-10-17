---
name: fintech-fraud-invariants
description: Enforces mandatory security, regulatory, and architectural invariants when developing financial fraud detection and agentic coaching systems.
trigger: always_on
---

# Fintech Fraud & Anti-Scam Engineering Invariants

When developing or reviewing transaction risk engines, fraud detection pipelines, or LLM coaching agents:

1. **Deterministic Supremacy:**
   - Never allow an LLM to make unilateral allow/block decisions or lower a calculated risk score.
   - Policy tiers and security friction must be governed strictly by deterministic mathematical heuristics.

2. **Adversarial Input Isolation:**
   - Any user-supplied text (notes, references, beneficiary descriptions) passed to an LLM must be:
     a) Scanned for dual-language prompt injection patterns (Arabic & English).
     b) Sandboxed inside unguessable cryptographic nonces (`<untrusted_note nonce="...">`).
     c) Subjected to post-generation semantic audits verifying that output enums and recommendations match verified safe states.

3. **Keyword Ordering & Telemetry Integrity:**
   - High-risk fraud vocabulary must always take precedence over benign whitelists.
   - Detection engines must incorporate passive environmental signals (active voice calls, screen sharing, app-switching velocity) to catch silent, empty-note transfers.

4. **Pre-Transaction Physical Cash-Out Defense:**
   - For high-velocity cash-out ecosystems, enforce temporary core ledger withdrawal reservations on critical overrides to defeat physical kiosk drainage.

5. **Server-Side Audit Non-Repudiation:**
   - Never trust client-reported risk scores or archetype strings in confirmation/override endpoints.
   - Always re-verify and cryptographically sign transaction audit records for judicial and central bank admissibility.
