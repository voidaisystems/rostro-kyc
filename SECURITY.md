# Security Policy & Cryptographic Governance

## Supported Versions

The following release lines of **Project Rostro (`روسترو للامتثال`)** receive active security patches and regulatory rule updates:

| Version | Branch | Support Status | Target Regulatory Baseline |
| :--- | :--- | :--- | :--- |
| **`3.0.x`** | `main` | Active Support | CBI Law No. 78 (2012) & AML/CFT Law No. 39 (2015) |
| **`2.1.x`** | `main` | Security Fixes Only | Universal 44-Document Iraqi Registry |
| **`< 2.0`** | Legacy | End of Life | Initial 3-Document Prototype |

---

## Core Security & Anti-Fraud Engineering Invariants

Project Rostro enforces five non-negotiable security invariants across all verification and adjudication endpoints:

1. **Deterministic Mathematical Supremacy:**
   - Vision LLMs (`Gemini 2.5 Flash`) are strictly restricted to structured optical character extraction and bounding-box localization.
   - An LLM is **never** permitted to make unilateral `AUTO_APPROVED` decisions or override deterministic mathematical checks (ICAO Doc 9303 Modulo-10 `[7, 3, 1]` check digits, 23-character Iraqi IBAN `IQ` Modulo-97 validation, or 17-character ISO 3779 VIN validation).

2. **Zero-Hallucination & Missing-Field Quarantine:**
   - When an expected document field is occluded by specular hologram glare, motion blur, or low illumination, the extraction layer must return `null` (`UNCLEAR_OR_MISSING`) rather than guessing or completing Arabic/Kurdish names or numerals.

3. **Dual-Side Physical Card Enforcement:**
   - Two-sided Iraqi identity and residency cards (`IRQ_NATIONAL_ID`, `IRQ_CIVIL_STATUS_ID`, `IRQ_RESIDENCE_CARD`, `IRQ_DRIVING_LICENSE`) require both `FRONT` and `BACK` physical sides. Single-sided submissions are deterministically blocked from automatic approval (`MISSING_BACK_SIDE` / `MISSING_FRONT_SIDE`).

4. **Server-Side Cryptographic Non-Repudiation (CBI Law No. 78 of 2012):**
   - Adjudication endpoints (`/api/kyc/adjudicate` and `/api/v1/kyc/review`) never trust client-supplied risk scores or signatures.
   - Every decision is cryptographically sealed server-side using `HMAC-SHA256` (`HMAC-SHA256-CBI78-*`) and linked to the previous audit block hash (`prev_hash -> entry_hash`).

5. **100% Synthetic PII Isolation:**
   - No real Iraqi citizen PII, National IDs, or bank account numbers are stored in this repository. All specimens in `data/synthetic_kyc/` and `src/utils/seedData.ts` are synthetically generated using `Faker` (`ar_AA`) and explicitly watermarked as `SPECIMEN / عينة تركيبية`.

---

## Secret Management & Environment Hygiene

- **API Keys:** Never commit `.env` files or raw API keys (`GEMINI_API_KEY`, `CBI_LAW78_HMAC_SECRET`) to version control. Always use `.env.example` as a template.
- **HMAC Signing Secret:** In production deployments, set `CBI_LAW78_HMAC_SECRET` via a hardware security module (HSM) or cloud secret manager with a minimum 256-bit entropy key.

---

## Reporting a Vulnerability

Please **do not** report security vulnerabilities through public GitHub issues, discussions, or pull requests.

Instead, please report suspected vulnerabilities privately via GitHub Security Advisories on the repository (`Security` -> `Report a vulnerability`) or directly to the repository maintainers (`@voidaisystems`).

### What to Include in Your Report
- Type of issue (e.g., prompt injection in OCR notes, checksum bypass, audit chain tampering, SSRF).
- Full paths of source file(s) related to the manifestation of the issue.
- Step-by-step reproduction payload or synthetic test image.
- Impact assessment on KYC decision routing (`AUTO_APPROVED` vs. `HUMAN_REVIEW`).

### Response SLA
- **Initial Acknowledgment:** Within **24 hours** of submission.
- **Triage & Severity Assessment:** Within **72 hours**.
- **Patch & Coordinated Disclosure:** Critical bypasses are patched within **7 days** of confirmation.
