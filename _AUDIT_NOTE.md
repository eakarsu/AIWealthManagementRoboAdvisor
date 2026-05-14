# Audit Recommendations & Status — AIWealthManagementRoboAdvisor

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_09.md

Verdict per audit: partial-build, exceptional AI depth (24 AI endpoints, 12 non-AI routes — highest AI ratio in batch). "Coverage is comprehensive."

## Original audit recommendations

Missing AI counterparts: none apparent.

Missing non-AI:
- Regulatory reporting
- Compliance audit trail
- Beneficiary management
- Account linking (external brokers)
- Notification preferences
- Tax form generation

Custom feature ideas:
- Multi-generational wealth planning
- Behavioral finance coaching
- Real-time options-based rebalancing
- Predictive client churn
- Institutional research integration
- White-label / co-branding API
- Voice advisory
- Tax preparer integration

## Implemented in this pass

None. The audit explicitly states AI coverage is comprehensive. Remaining items are all NEEDS-PRODUCT-DECISION (multi-gen planning is a substantial new capability, white-label needs API design) or NEEDS-CREDS (broker linking via Plaid/Yodlee, tax-form providers).

## Backlog (priority order)

1. Predictive client churn endpoint (`/api/ai/churn-prediction`) — text-only AI add-on, mechanical next step.
2. Behavioral finance coaching (`/api/ai/behavioral-coaching`) — text-only AI add-on.
3. Beneficiary management — schema additions.
4. Regulatory reporting / audit trail — substantial product feature.
5. Account linking (Plaid/Yodlee) — credentials decision.
6. Tax form generation — vendor decision (Avalara, etc.).

## Apply pass 3 (frontend)

- **Action:** LEFT-AS-IS (FE already wired)
- **Why:** All 23 backend AI endpoints in `server/routes/ai.js` are reachable from the Vite/React FE. Ten dedicated AI pages exist under `client/src/pages/AI*.jsx` and are routed in `client/src/App.jsx` (lines 48-57). The remaining thirteen (eight entity-scoped analyses + five pass-2 advanced tools) are exposed via the contextual `client/src/components/AISidebar.jsx`, with helper methods wired in `client/src/services/api.js` lines 106-119. Authentication is JWT-bearer via the shared axios `request()` wrapper. Idempotence rule applied — no FE work required.

## Apply pass 4 (mechanical backlog)

- **Action:** UPDATED-BE-AND-FE
- **Mechanical items implemented (top 2 of backlog):**

| # | Item | File | Endpoint |
|---|------|------|----------|
| 1 | AI Predictive Client Churn | `server/routes/ai.js` | `POST /api/ai/churn-prediction` |
| 2 | AI Behavioral Finance Coaching | `server/routes/ai.js` | `POST /api/ai/behavioral-coaching` |

- **Pattern:** Reuses existing `callAI` -> `queryOpenRouter` + `parseAIJson` helpers and `persistAiResult` audit trail; auth + rate-limiting inherited via `router.use(auth)` / `router.use(aiRateLimiter)`. Both endpoints `return res.status(503)` when `OPENROUTER_API_KEY` is missing or set to the placeholder value.
- **FE:** New `client/src/pages/AIChurnPrediction.jsx` (client-picker pattern, mirrors `AIPortfolioAnalysis.jsx`) and `client/src/pages/AIBehavioralCoaching.jsx` (sample buttons + free-text form, mirrors `AIRetirementPlanning.jsx`). `client/src/services/api.js` exports `aiChurnPrediction` and `aiBehavioralCoaching` via the shared JWT-bearer `request()` wrapper. `client/src/App.jsx` adds 2 protected routes. `client/src/components/Layout.jsx` adds 2 sidebar entries under "AI Advisor".
- **Smoke test (port 49401):** register -> 200; `POST /api/ai/churn-prediction {}` -> 200 with structured JSON (`churn_score`, `churn_band`, `summary`); `POST /api/ai/behavioral-coaching` with body -> 200 with detected biases (recency, loss_aversion, herding, anchoring) — full LLM round-trip succeeded. Cleanup OK.
- **Syntax:** `node --check` PASS for `server/routes/ai.js`. Bracket balance PASS for `App.jsx`, `Layout.jsx`, `AIChurnPrediction.jsx`, `AIBehavioralCoaching.jsx`, `services/api.js`.

## Backlog remaining after pass 4

| Item | Tag |
|---|---|
| Beneficiary management | NEEDS-PRODUCT-DECISION (schema additions) |
| Regulatory reporting / audit trail | NEEDS-PRODUCT-DECISION |
| Account linking (Plaid/Yodlee) | NEEDS-CREDS |
| Tax form generation (Avalara etc.) | NEEDS-CREDS |
| Multi-generational wealth planning | NEEDS-PRODUCT-DECISION |
| White-label / co-branding API | NEEDS-PRODUCT-DECISION |
| Voice advisory | NEEDS-PRODUCT-DECISION |
