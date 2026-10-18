## Summary of Changes

<!-- Provide a concise architectural summary of what this PR introduces or fixes. -->

## Affected Pipeline Stages / Modules

- [ ] **Universal Document Registry (`Categories A–H`):** `backend/kyc_app/registry/iraqi_document_registry.js`
- [ ] **10-Stage Universal Pipeline:** `backend/kyc_app/services/universal_pipeline.js`
- [ ] **Deterministic Core & ICAO Checksums:** `src/utils/kycEngine.ts`
- [ ] **Compliance Workstation UI (React 19 / Tailwind v4):** `src/components/*`
- [ ] **API Gateway & CBI Law No. 78 Signing:** `server.js` / `server.ts`
- [ ] **Documentation & Coverage Matrix:** `docs/DOCUMENT_COVERAGE_MATRIX.md` / `ARCHITECTURE.md`

## Engineering & Security Invariant Checklist

- [ ] **Deterministic Supremacy:** Generative OCR output cannot override ICAO Modulo-10 check digits or force `AUTO_APPROVED` on failed deterministic rules.
- [ ] **Dual-Side Card Policy:** 2-sided Iraqi cards (`IRQ_NATIONAL_ID`, `IRQ_CIVIL_STATUS_ID`, `IRQ_RESIDENCE_CARD`, `IRQ_DRIVING_LICENSE`) enforce `FRONT + BACK` presence.
- [ ] **Zero-Hallucination Extraction:** Missing or glare-occluded fields return `null` (`UNCLEAR_OR_MISSING`) without fabricating text.
- [ ] **100% Synthetic Data:** Zero real customer PII or real identity documents are included in this PR.
- [ ] **Automated Verification Suite Passes:** Ran `npm test` (`55/55` assertions passing) and `npm run build` with zero errors.
