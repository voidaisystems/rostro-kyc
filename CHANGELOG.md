# Changelog

All notable changes to **Project Rostro (`روسترو للامتثال`)** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-10-18

### Added
- **Dual-Side Physical Card Enforcement (`FRONT + BACK`):** Added `getDocumentSideRequirement` and `evaluateDualSideSatisfaction` in [`src/utils/kycEngine.ts`](src/utils/kycEngine.ts) and [`src/components/SecureUploadModal.tsx`](src/components/SecureUploadModal.tsx) to require both physical sides for `IRQ_NATIONAL_ID`, `IRQ_CIVIL_STATUS_ID`, `IRQ_RESIDENCE_CARD`, and `IRQ_DRIVING_LICENSE`.
- **Interactive Front/Back Specimen Flipper:** Added physical card side toggle (`FRONT` / `BACK`) and MRZ Modulo-10 check digit inspection in [`src/components/DocumentSpecimenViewer.tsx`](src/components/DocumentSpecimenViewer.tsx).
- **Server-Side CBI Law No. 78 Cryptographic Signing (`/api/kyc/adjudicate`):** Added server-verified `HMAC-SHA256-CBI78-*` non-repudiation signature generation and SHA-256 hash-chaining (`prevHash -> entryHash`) in [`server.js`](server.js) and [`server.ts`](server.ts).
- **Enterprise Open-Source Repository Governance:** Added `LICENSE` (MIT), `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `ARCHITECTURE.md`, `.editorconfig`, GitHub Actions CI workflow (`.github/workflows/ci.yml`), and structured YAML issue/PR templates.

### Changed
- **Repository Directory Organization:** Consolidated brand mark options under `assets/branding/` and architectural PDF blueprints under `docs/blueprints/` for a clean root workspace.
- **Standardized Source Headers:** Added Microsoft OSPO-compliant copyright, license, `@file`, `@module`, and architectural invariant headers across all TypeScript and JavaScript modules.

---

## [2.2.0] - 2026-10-17

### Added
- **React 19 + Tailwind CSS v4 Compliance Workstation:** Integrated the 4-tab Compliance Console (`Verification Queue`, `Document Vault`, `Workflow Rules`, `Audit Trail`) with full English (`LTR`) and Arabic (`RTL`) localization.
- **Synthetic Iraqi `Faker` Document Generator:** Added [`scripts/generate_faker_iraqi_documents.py`](scripts/generate_faker_iraqi_documents.py) using Python `Faker` (`ar_AA`) and `Pillow` to generate watermarked synthetic specimens (`data/synthetic_kyc/faker_specimens/`).

---

## [2.1.0] - 2026-10-17

### Added
- **Universal Iraqi Document Registry (`44` Document Types across Categories `A–H`):** Implemented [`backend/kyc_app/registry/iraqi_document_registry.js`](backend/kyc_app/registry/iraqi_document_registry.js) covering Identity & Civil Status (`A`), Residence & Address (`B`), Travel & Immigration (`C`), Driving & Vehicle (`D`), Business & Merchant Onboarding (`E`), Education/Employment/Income (`F`), Financial Evidence (`G`), and Legal/Authorizations (`H`).
- **10-Stage Universal KYC Pipeline:** Implemented [`backend/kyc_app/services/universal_pipeline.js`](backend/kyc_app/services/universal_pipeline.js) with unknown-document fallback, multi-script (Arabic, Kurdish Sorani, English) normalization, and 9 separated verification signals.
- **55-Assertion Automated Verification Suite:** Expanded [`backend/tests/test_hybrid_server.js`](backend/tests/test_hybrid_server.js) to validate all 8 categories and 20 `TESTED` document types.
