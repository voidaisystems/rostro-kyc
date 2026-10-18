# Contributing to Project Rostro (`روسترو للامتثال`)

Thank you for your interest in contributing to **Project Rostro** — the Universal Iraqi & MENA Document Intelligence and KYC Compliance Platform. This document outlines the engineering standards, workflow conventions, and verification gates required for all contributions.

---

## 1. Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code in all issues, pull requests, and code reviews.

---

## 2. Development Environment Setup

### Prerequisites
- **Node.js:** `>= 20.0.0` (LTS recommended)
- **npm:** `>= 10.0.0`
- **Python:** `>= 3.10` *(optional, required only if regenerating synthetic `Faker` specimen images via `scripts/generate_faker_iraqi_documents.py`)*

### Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/voidaisystems/rostro-kyc.git
cd rostro-kyc

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Optional: Add your GEMINI_API_KEY in .env for live multimodal OCR extraction

# 4. Build the production frontend bundle
npm run build

# 5. Start the unified API & Compliance Workstation server (http://localhost:8080)
npm start
```

---

## 3. Running the Automated Verification Suite

Before opening any pull request, all **55 deterministic assertions** across Categories `A–H` must pass with zero regressions:

```bash
npm test
```

What `npm test` (`node backend/tests/test_hybrid_server.js`) validates:
- Startup validation of all **44 registered Iraqi document types** across Categories `A–H`.
- ICAO Doc 9303 TD1 (`3x30`) and TD3 (`2x44`) Modulo-10 `[7, 3, 1]` check digit verification.
- Multi-script normalization across **Arabic**, **Kurdish Sorani**, and **English** scripts, plus Eastern Arabic-Indic (`٠-٩`) to Western numeral conversion.
- Document-specific preprocessing geometry (`ID_CARD_LANDSCAPE` vs. `A4_PORTRAIT` vs. `PASSPORT_BOOKLET`).
- Unknown-document fallback (`UNSUPPORTED_OR_UNCERTAIN_CLASSIFICATION` -> `HUMAN_REVIEW`).
- Separation of the **9 independent verification signals** and `EXTERNAL_VERIFICATION_UNAVAILABLE` honesty invariant.

---

## 4. How to Add a New Iraqi Document Type

Project Rostro is architected around a centralized **Universal Document Registry** ([`backend/kyc_app/registry/iraqi_document_registry.js`](backend/kyc_app/registry/iraqi_document_registry.js)). **Never scatter document-specific `if/else` branches across UI components.**

To register a new Iraqi or Kurdistan Region (KRG) document type:

1. **Register the Schema:** Add a declarative entry in [`backend/kyc_app/registry/iraqi_document_registry.js`](backend/kyc_app/registry/iraqi_document_registry.js) specifying:
   - `doc_type_id` (e.g., `IRQ_CUSTOMS_DECLARATION`)
   - `category` (`IDENTITY_CIVIL`, `RESIDENCE_ADDRESS`, `TRAVEL_IMMIGRATION`, `DRIVING_VEHICLE`, `BUSINESS_MERCHANT`, `EDUCATION_EMPLOYMENT_INCOME`, `FINANCIAL_EVIDENCE`, or `LEGAL_AUTHORIZATION`)
   - `canonical_name_en`, `canonical_name_ar`, `canonical_name_ku`, and classification `aliases`
   - `required_sides` (`['FRONT']` or `['FRONT', 'BACK']`)
   - `preprocessing_profile` (`ID_CARD_LANDSCAPE`, `A4_PORTRAIT`, or `PASSPORT_BOOKLET`)
   - `expected_fields`, `normalization_rules`, and `deterministic_validators`
2. **Add a Synthetic Fixture:** Add a 100% synthetic test case in [`data/synthetic_kyc/sample_document_sets.json`](data/synthetic_kyc/sample_document_sets.json) (never use real citizen documents).
3. **Update the Coverage Matrix:** Update [`docs/DOCUMENT_COVERAGE_MATRIX.md`](docs/DOCUMENT_COVERAGE_MATRIX.md) and add a corresponding test assertion in [`backend/tests/test_hybrid_server.js`](backend/tests/test_hybrid_server.js).

---

## 5. Commit Message Conventions

We follow the **[Conventional Commits v1.0.0](https://www.conventionalcommits.org/)** specification:

- `feat(registry): add KRG municipal trade permit schema and validator`
- `fix(pipeline): enforce dual-side check on Iraqi residence card`
- `docs(architecture): document 9 verification signals and CBI Law 78 HMAC chain`
- `test(suite): add Modulo-10 check digit tampering assertion`
- `chore(ci): configure GitHub Actions Node.js 20 verification workflow`

---

## 6. Pull Request Checklist

- [ ] Code compiles cleanly with `npm run build`.
- [ ] All 55 automated verification assertions pass via `npm test`.
- [ ] Source files include standard copyright and JSDoc/TSDoc module headers.
- [ ] Strictly zero real PII or secret keys are included in code, fixtures, or commit history.
- [ ] Deterministic risk rules cannot be bypassed or lowered by generative model outputs.
