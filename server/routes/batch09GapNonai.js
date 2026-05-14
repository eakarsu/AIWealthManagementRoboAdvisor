// // === Batch 09 Gaps & Frontend Mounts ===
// Auto-generated gap-nonai endpoints for AIWealthManagementRoboAdvisor.
// Calls OpenRouter via native fetch (no SDK); lazily creates gap_features table.
const express = require('express');
const router = express.Router();

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function runAI(system, user) {
  if (!process.env.OPENROUTER_API_KEY) {
    const e = new Error('OPENROUTER_API_KEY missing'); e.statusCode = 503; throw e;
  }
  const r = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages: [
      { role: 'system', content: system }, { role: 'user', content: user }
    ], max_tokens: 1500, temperature: 0.4 })
  });
  if (!r.ok) { const e = new Error(`AI ${r.status}`); e.statusCode = 502; throw e; }
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content || '';
  let parsed = null;
  try { const m = content.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); } catch {}
  return { raw: content, parsed, model: data?.model };
}

let _persistInit = false;
async function persist(feature, input, output) {
  // Lazy gap_features table — best-effort, swallow errors so AI still works.
  try {
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    if (!_persistInit) {
      await p.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS gap_features (id SERIAL PRIMARY KEY, feature TEXT, input JSONB, output JSONB, created_at TIMESTAMPTZ DEFAULT NOW())');
      _persistInit = true;
    }
    await p.$executeRawUnsafe('INSERT INTO gap_features(feature, input, output) VALUES ($1, $2::jsonb, $3::jsonb)', feature, JSON.stringify(input || {}), JSON.stringify(output || {}));
  } catch { /* swallow */ }
}

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/regulatory-reporting-form-adv-reg-bi
// Regulatory reporting (Form ADV, Reg BI)
router.post('/regulatory-reporting-form-adv-reg-bi', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Regulatory reporting (Form ADV, Reg BI)\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('regulatory-reporting-form-adv-reg-bi', req.body, ai);
    res.json({ feature: 'regulatory-reporting-form-adv-reg-bi', title: 'Regulatory reporting (Form ADV, Reg BI)', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/compliance-audit-trail-and-reviewer-queue
// Compliance audit trail and reviewer queue
router.post('/compliance-audit-trail-and-reviewer-queue', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Compliance audit trail and reviewer queue\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('compliance-audit-trail-and-reviewer-queue', req.body, ai);
    res.json({ feature: 'compliance-audit-trail-and-reviewer-queue', title: 'Compliance audit trail and reviewer queue', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/beneficiary-and-trust-account-management
// Beneficiary and trust-account management
router.post('/beneficiary-and-trust-account-management', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Beneficiary and trust-account management\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('beneficiary-and-trust-account-management', req.body, ai);
    res.json({ feature: 'beneficiary-and-trust-account-management', title: 'Beneficiary and trust-account management', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/external-brokercustodian-account-aggregation
// External broker/custodian account aggregation
router.post('/external-brokercustodian-account-aggregation', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: External broker/custodian account aggregation\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('external-brokercustodian-account-aggregation', req.body, ai);
    res.json({ feature: 'external-brokercustodian-account-aggregation', title: 'External broker/custodian account aggregation', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/granular-notification-preference-center
// Granular notification preference center
router.post('/granular-notification-preference-center', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Granular notification preference center\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('granular-notification-preference-center', req.body, ai);
    res.json({ feature: 'granular-notification-preference-center', title: 'Granular notification preference center', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/tax-form-generation-1099-k-1-and-downloads
// Tax form generation (1099, K-1) and downloads
router.post('/tax-form-generation-1099-k-1-and-downloads', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Tax form generation (1099, K-1) and downloads\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('tax-form-generation-1099-k-1-and-downloads', req.body, ai);
    res.json({ feature: 'tax-form-generation-1099-k-1-and-downloads', title: 'Tax form generation (1099, K-1) and downloads', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

// POST /api/gap-nonai-aiwealthmanagementroboadvisor/client-meeting-notes-crm-integration
// Client meeting notes / CRM integration
router.post('/client-meeting-notes-crm-integration', async (req, res) => {
  try {
    const ai = await runAI('You are an expert assistant. Reply concisely in JSON.',
      `Feature: Client meeting notes / CRM integration\nContext: ${JSON.stringify(req.body || {})}\nReturn JSON {"summary":"","key_points":[""],"recommendations":[""]}`);
    await persist('client-meeting-notes-crm-integration', req.body, ai);
    res.json({ feature: 'client-meeting-notes-crm-integration', title: 'Client meeting notes / CRM integration', result: ai });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'error' });
  }
});

module.exports = router;
