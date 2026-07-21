# Wealth Management Robo-Advisor operations

## Supported boundary

The governed path covers versioned mandates/IPS/consent, reconciled authoritative inputs, deterministic allocation/fee/cash-flow/tax assumptions, explainability, reversible proposals, segregated advisor/compliance review, provider receipts, corrections, and locks. Ledger, custodian, bank, billing, CRM, market-data, document-vault, filing, e-sign, and notification names are typed adapter contracts—not claims that institutions are connected.

This software provides decision support, not a guarantee or individualized financial recommendation without qualified human review. It never automatically trades, moves money, or files documents.

## Deploy and run

Install root and `client/` dependencies explicitly. Configure `.env` from `.env.example` with `DATABASE_URL`, unique `GOVERNANCE_TENANT_ID`, and a random `JWT_SECRET` of at least 32 characters. Keep institutional credentials in a secret manager and use payload references only.

Use `./start.sh check`; after SQL review and backup use `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`; then `./start.sh start`. Startup never changes schema, seeds data, installs packages, or terminates unrelated processes.

## Workflow and recovery

Create a subject-scoped proposal at `/api/governance` with versioned inputs, reconciliation evidence, provenance, and `Idempotency-Key`. Submit it, then obtain separate advisor and compliance/human review as policy requires; creators cannot self-approve. Queue only approved reversible operations. On late/corrected data, currency or boundary mismatch, lock conflict, provider timeout, reconciliation break, or ambiguous receipt, stop execution, preserve the correction chain, and resume the same idempotent proposal or invoke manual review.

Run `node --test server/governance/tests/*.test.js` and `bash -n start.sh`. Golden and historical fixtures cover corrections, late inputs, boundary cases, and deterministic results. Destructive fixtures require explicit opt-in and an environment-supplied password on a disposable database.
