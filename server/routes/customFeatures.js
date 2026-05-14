// Custom feature endpoints (batch_09 audit suggestions)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { queryOpenRouter, parseAIJson } = require('../services/openrouter');

router.use(auth);
router.use(aiRateLimiter);

async function ask(system, user, label, res) {
  const r = await queryOpenRouter(system, user);
  if (!r.success) return res.status(r.error?.includes('not configured') ? 503 : 500).json({ error: r.error });
  const content = r.data?.choices?.[0]?.message?.content || '';
  const parsed = parseAIJson(content);
  return res.json({ type: label, result: parsed || { raw: content }, model: r.data?.model });
}

// 1. Multi-generational wealth planning with trust structure optimization
router.post('/multi-gen-wealth', async (req, res) => {
  const { generations, total_estate_usd, jurisdiction } = req.body || {};
  if (!generations || !total_estate_usd) return res.status(400).json({ error: 'generations and total_estate_usd required' });
  return ask(
    'You are a senior wealth strategist designing multi-generational trust structures. JSON only.',
    `GENERATIONS: ${JSON.stringify(generations)}\nESTATE_USD: ${total_estate_usd}\nJURISDICTION: ${jurisdiction || 'US-Federal'}\nReturn JSON {"trust_structures":[{"type":"","beneficiaries":[""],"funding_usd":0,"tax_benefit":""}],"estate_tax_estimate_usd":0,"recommendations":[""],"review_in_months":12}`,
    'multi-gen-wealth', res
  );
});

// 2. Behavioral-finance coaching
router.post('/behavioral-coaching', async (req, res) => {
  const { client_id, recent_trades, market_event } = req.body || {};
  return ask(
    'You are a behavioral-finance coach detecting biases and prescribing interventions. JSON only.',
    `CLIENT: ${client_id || 'anon'}\nRECENT_TRADES: ${JSON.stringify(recent_trades || [])}\nMARKET_EVENT: ${market_event || 'normal'}\nReturn JSON {"biases_detected":[{"name":"","evidence":"","severity":"low|med|high"}],"interventions":[{"type":"","script":""}],"follow_up_in_days":7}`,
    'behavioral-coaching', res
  );
});

// 3. Real-time rebalancing via options strategies (covered calls for income)
router.post('/options-rebalance', async (req, res) => {
  const { portfolio_id, target_income_usd, risk_tolerance } = req.body || {};
  if (!portfolio_id) return res.status(400).json({ error: 'portfolio_id required' });
  return ask(
    'You design covered-call / cash-secured-put income overlays for portfolio rebalancing. JSON only.',
    `PORTFOLIO: ${portfolio_id}\nTARGET_INCOME_USD: ${target_income_usd || 'open'}\nRISK: ${risk_tolerance || 'moderate'}\nReturn JSON {"overlays":[{"underlying":"","strategy":"covered-call|cash-secured-put","strike":0,"expiry":"","contracts":0,"expected_premium_usd":0}],"net_delta_change":0,"caveats":[""]}`,
    'options-rebalance', res
  );
});

// 4. Predictive client churn modeling with retention AI
router.post('/churn-prediction', async (req, res) => {
  const { client_id, signals } = req.body || {};
  if (!client_id) return res.status(400).json({ error: 'client_id required' });
  return ask(
    'You score advisory client churn risk and propose retention actions. JSON only.',
    `CLIENT: ${client_id}\nSIGNALS: ${JSON.stringify(signals || {})}\nReturn JSON {"churn_probability_30d":0,"risk_tier":"low|med|high","drivers":[""],"retention_actions":[{"action":"","urgency":"","expected_impact":""}]}`,
    'churn-prediction', res
  );
});

// 5. Institutional research integration for ETF/stock filtering
// TODO: configure credentials for INST_RESEARCH_API_KEY (Morningstar/Bloomberg).
router.post('/inst-research-filter', async (req, res) => {
  const { universe, criteria } = req.body || {};
  if (!Array.isArray(universe) || universe.length === 0) return res.status(400).json({ error: 'universe array required' });
  return ask(
    `You apply institutional research filters to a security universe. Research feed configured: ${Boolean(process.env.INST_RESEARCH_API_KEY)}. JSON only.`,
    `UNIVERSE: ${JSON.stringify(universe.slice(0,50))}\nCRITERIA: ${JSON.stringify(criteria || {})}\nReturn JSON {"passed":[{"ticker":"","score":0,"thesis":""}],"failed":[{"ticker":"","reason":""}],"top_pick":""}`,
    'inst-research-filter', res
  );
});

// 6. White-label / co-branding configuration
router.post('/white-label', async (req, res) => {
  const { partner_name, primary_color, logo_url, domain } = req.body || {};
  if (!partner_name) return res.status(400).json({ error: 'partner_name required' });
  // Generates a config blob the partner UI can read. No external call needed but we still consult AI for copy.
  return ask(
    'You generate branded onboarding copy for a wealth-advisor white-label deployment. JSON only.',
    `PARTNER: ${partner_name}\nCOLOR: ${primary_color || '#003366'}\nDOMAIN: ${domain || ''}\nReturn JSON {"theme":{"primary":"","secondary":""},"welcome_headline":"","welcome_body":"","cta_label":"","email_footer":""}`,
    'white-label', res
  );
});

// 7. Voice advisory for natural-language goal setting
// TODO: configure credentials for VOICE_TRANSCRIBE_API_KEY (Whisper/Deepgram).
router.post('/voice-goal', async (req, res) => {
  const { transcript, client_id } = req.body || {};
  if (!transcript) return res.status(400).json({ error: 'transcript required' });
  return ask(
    `You parse a spoken financial goal into structured planning. Voice STT configured: ${Boolean(process.env.VOICE_TRANSCRIBE_API_KEY)}. JSON only.`,
    `CLIENT: ${client_id || 'anon'}\nTRANSCRIPT: ${transcript}\nReturn JSON {"goal_type":"","target_amount_usd":0,"horizon_years":0,"monthly_contribution_usd":0,"risk_tolerance":"","follow_up_questions":[""]}`,
    'voice-goal', res
  );
});

// 8. Accountant/tax-preparer collaboration
router.post('/tax-collab', async (req, res) => {
  const { client_id, tax_year, holdings_summary, life_events } = req.body || {};
  if (!client_id) return res.status(400).json({ error: 'client_id required' });
  return ask(
    'You produce a collaboration packet for an external CPA: holdings summary, harvest opportunities, deduction flags. JSON only.',
    `CLIENT: ${client_id}\nYEAR: ${tax_year || new Date().getFullYear()}\nHOLDINGS: ${JSON.stringify(holdings_summary || {})}\nLIFE_EVENTS: ${JSON.stringify(life_events || [])}\nReturn JSON {"harvest_opportunities":[{"ticker":"","est_loss_usd":0}],"deduction_flags":[""],"k1_expected":false,"cpa_questions":[""],"document_checklist":[""]}`,
    'tax-collab', res
  );
});

module.exports = router;
