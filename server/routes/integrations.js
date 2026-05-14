// Apply pass 5 — Backlog integrations for AIWealthManagementRoboAdvisor (additive only)
//
// Backlog items implemented:
//
//   NEEDS-PRODUCT-DECISION — Beneficiary management
//     PRODUCT-DECISION: Self-hosted CRUD on `beneficiaries` table.
//     Each beneficiary belongs to a client_id with relationship,
//     allocation_pct, and contact info. Total allocation per client
//     is not enforced server-side at insert (warning returned in
//     summary endpoint instead) to keep this strictly additive.
//
//   NEEDS-PRODUCT-DECISION — Regulatory reporting / audit trail
//     PRODUCT-DECISION: Read-only endpoints generate per-client
//     regulatory snapshots from existing tables (clients, portfolios,
//     transactions, fees, ai_results). Writes append rows to a
//     new `regulatory_reports` table for retention.
//
//   NEEDS-CREDS — Account linking (Plaid / Yodlee)
//     ENV: PLAID_CLIENT_ID, PLAID_SECRET (or YODLEE_*).
//     We treat PLAID_SECRET as the gating env. 503 + missing if absent.
//     New table: linked_accounts (provider, item_id, mask, account_name).
//
//   NEEDS-CREDS — Tax form generation
//     ENV: TAX_PROVIDER_API_KEY (Avalara / similar).
//     Stub generates a synthetic 1099 / form payload row.
//     New table: tax_forms.
//
//   NEEDS-PRODUCT-DECISION — Multi-generational wealth planning
//     PRODUCT-DECISION: Implements as additive AI text endpoint that
//     uses the existing OpenRouter helper to produce a multi-gen
//     plan stub from a {client_id, generations, goals[]} input.
//     503 on missing OPENROUTER_API_KEY.
//
//   NEEDS-PRODUCT-DECISION — White-label / co-branding API
//     PRODUCT-DECISION: Per-tenant branding stored in a new
//     `tenant_branding` table keyed by tenant_slug. Public read,
//     authenticated write. No multi-tenant request routing logic
//     introduced — clients can fetch their tenant's brand assets.
//
//   NEEDS-PRODUCT-DECISION — Voice advisory
//     PRODUCT-DECISION: Text-only stub: accepts a {transcript}
//     (already STT-converted client side) and routes through
//     OpenRouter for advisory response. No native audio handling.
//     503 on missing OPENROUTER_API_KEY.

const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { queryOpenRouter, parseAIJson } = require('../services/openrouter');

router.use(auth);

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id SERIAL PRIMARY KEY,
      client_id INTEGER,
      full_name VARCHAR(255) NOT NULL,
      relationship VARCHAR(60),
      allocation_pct NUMERIC(5,2),
      contact_email VARCHAR(255),
      contact_phone VARCHAR(60),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS regulatory_reports (
      id SERIAL PRIMARY KEY,
      client_id INTEGER,
      report_type VARCHAR(80),
      period_start DATE,
      period_end DATE,
      payload JSONB,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS linked_accounts (
      id SERIAL PRIMARY KEY,
      client_id INTEGER,
      provider VARCHAR(40),
      item_id VARCHAR(255),
      account_name VARCHAR(255),
      mask VARCHAR(8),
      institution VARCHAR(255),
      linked_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tax_forms (
      id SERIAL PRIMARY KEY,
      client_id INTEGER,
      form_type VARCHAR(40),
      tax_year INTEGER,
      payload JSONB,
      generated_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenant_branding (
      id SERIAL PRIMARY KEY,
      tenant_slug VARCHAR(60) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      primary_color VARCHAR(20),
      logo_url VARCHAR(500),
      support_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
}
ensureTables().catch(() => {});

// ─────────────────────────────────────────────────────────────────
// Beneficiary management (NEEDS-PRODUCT-DECISION)
// ─────────────────────────────────────────────────────────────────
router.get('/beneficiaries', async (req, res) => {
  try {
    const { client_id } = req.query;
    let q = 'SELECT * FROM beneficiaries';
    const params = [];
    if (client_id) { params.push(client_id); q += ` WHERE client_id = $${params.length}`; }
    q += ' ORDER BY id DESC LIMIT 200';
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/beneficiaries', async (req, res) => {
  try {
    const { client_id, full_name, relationship, allocation_pct, contact_email, contact_phone, notes } = req.body || {};
    if (!full_name) return res.status(400).json({ error: 'full_name is required' });
    const r = await pool.query(
      `INSERT INTO beneficiaries (client_id, full_name, relationship, allocation_pct, contact_email, contact_phone, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [client_id || null, full_name, relationship || null, allocation_pct || null, contact_email || null, contact_phone || null, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/beneficiaries/:id', async (req, res) => {
  try {
    const { full_name, relationship, allocation_pct, contact_email, contact_phone, notes } = req.body || {};
    const r = await pool.query(
      `UPDATE beneficiaries SET full_name=COALESCE($1, full_name),
       relationship=COALESCE($2, relationship), allocation_pct=COALESCE($3, allocation_pct),
       contact_email=COALESCE($4, contact_email), contact_phone=COALESCE($5, contact_phone),
       notes=COALESCE($6, notes) WHERE id=$7 RETURNING *`,
      [full_name || null, relationship || null, allocation_pct || null, contact_email || null, contact_phone || null, notes || null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/beneficiaries/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM beneficiaries WHERE id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/beneficiaries/summary/:client_id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(allocation_pct),0) AS total_pct
       FROM beneficiaries WHERE client_id = $1`,
      [req.params.client_id]
    );
    const total = parseFloat(r.rows[0].total_pct || 0);
    res.json({
      client_id: parseInt(req.params.client_id),
      count: parseInt(r.rows[0].count || 0),
      total_pct: total,
      warning: total > 100 ? 'Allocation exceeds 100%' : (total < 100 ? 'Allocation under 100%' : null)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────────
// Regulatory reporting (NEEDS-PRODUCT-DECISION)
// ─────────────────────────────────────────────────────────────────
router.post('/regulatory/report', async (req, res) => {
  try {
    const { client_id, report_type, period_start, period_end } = req.body || {};
    if (!client_id || !report_type) return res.status(400).json({ error: 'client_id and report_type required' });
    // Build a stub snapshot from existing tables.
    let portfolios = [], transactions = [], fees = [];
    try {
      const p = await pool.query('SELECT id, name, total_value FROM portfolios WHERE client_id = $1', [client_id]);
      portfolios = p.rows;
    } catch (_) {}
    try {
      const t = await pool.query(
        `SELECT id, type, amount, transaction_date FROM transactions
         WHERE client_id = $1 AND ($2::date IS NULL OR transaction_date >= $2)
           AND ($3::date IS NULL OR transaction_date <= $3) ORDER BY transaction_date DESC LIMIT 500`,
        [client_id, period_start || null, period_end || null]
      );
      transactions = t.rows;
    } catch (_) {}
    try {
      const f = await pool.query('SELECT id, fee_type, amount FROM fees WHERE client_id = $1 LIMIT 200', [client_id]);
      fees = f.rows;
    } catch (_) {}
    const payload = {
      generated_at: new Date().toISOString(),
      summary: {
        portfolio_count: portfolios.length,
        transaction_count: transactions.length,
        total_fees: fees.reduce((s, f) => s + parseFloat(f.amount || 0), 0)
      },
      portfolios, transactions, fees
    };
    const ins = await pool.query(
      `INSERT INTO regulatory_reports (client_id, report_type, period_start, period_end, payload, created_by)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6) RETURNING *`,
      [client_id, report_type, period_start || null, period_end || null, JSON.stringify(payload), req.user?.id || null]
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/regulatory/reports', async (req, res) => {
  try {
    const { client_id } = req.query;
    let q = 'SELECT id, client_id, report_type, period_start, period_end, created_by, created_at FROM regulatory_reports';
    const params = [];
    if (client_id) { params.push(client_id); q += ` WHERE client_id = $${params.length}`; }
    q += ' ORDER BY id DESC LIMIT 200';
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/regulatory/reports/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM regulatory_reports WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────────
// Account linking (NEEDS-CREDS: PLAID_SECRET)
// ─────────────────────────────────────────────────────────────────
router.post('/linked-accounts/link', async (req, res) => {
  if (!process.env.PLAID_SECRET) {
    return res.status(503).json({ error: 'Account linking provider not configured', missing: 'PLAID_SECRET' });
  }
  try {
    const { client_id, public_token, account_name, institution } = req.body || {};
    if (!client_id) return res.status(400).json({ error: 'client_id is required' });
    // Stub: would exchange public_token via Plaid; we synthesize an item_id.
    const itemId = `ITEM-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const mask = (public_token || '').slice(-4) || '0000';
    const r = await pool.query(
      `INSERT INTO linked_accounts (client_id, provider, item_id, account_name, mask, institution)
       VALUES ($1, 'plaid', $2, $3, $4, $5) RETURNING *`,
      [client_id, itemId, account_name || 'External Account', mask, institution || null]
    );
    res.status(201).json({ success: true, account: r.rows[0], source: 'stub:PLAID_SECRET-present' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/linked-accounts', async (req, res) => {
  if (!process.env.PLAID_SECRET) {
    return res.status(503).json({ error: 'Account linking provider not configured', missing: 'PLAID_SECRET' });
  }
  try {
    const { client_id } = req.query;
    let q = 'SELECT * FROM linked_accounts';
    const params = [];
    if (client_id) { params.push(client_id); q += ` WHERE client_id = $${params.length}`; }
    q += ' ORDER BY id DESC LIMIT 200';
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────────
// Tax form generation (NEEDS-CREDS: TAX_PROVIDER_API_KEY)
// ─────────────────────────────────────────────────────────────────
router.post('/tax/forms/generate', async (req, res) => {
  if (!process.env.TAX_PROVIDER_API_KEY) {
    return res.status(503).json({ error: 'Tax provider not configured', missing: 'TAX_PROVIDER_API_KEY' });
  }
  try {
    const { client_id, form_type, tax_year } = req.body || {};
    if (!client_id || !form_type || !tax_year) return res.status(400).json({ error: 'client_id, form_type, tax_year required' });
    let totals = { dividends: 0, interest: 0, capital_gains: 0 };
    try {
      const r = await pool.query(
        `SELECT type, COALESCE(SUM(amount),0) AS amt FROM transactions
         WHERE client_id = $1 AND EXTRACT(YEAR FROM transaction_date) = $2 GROUP BY type`,
        [client_id, tax_year]
      );
      r.rows.forEach(row => {
        if (/dividend/i.test(row.type)) totals.dividends += parseFloat(row.amt);
        else if (/interest/i.test(row.type)) totals.interest += parseFloat(row.amt);
        else if (/sell|sale|capital/i.test(row.type)) totals.capital_gains += parseFloat(row.amt);
      });
    } catch (_) {}
    const payload = { form_type, tax_year, totals, generated: new Date().toISOString(), source: 'stub:TAX_PROVIDER_API_KEY-present' };
    const ins = await pool.query(
      `INSERT INTO tax_forms (client_id, form_type, tax_year, payload)
       VALUES ($1,$2,$3,$4::jsonb) RETURNING *`,
      [client_id, form_type, tax_year, JSON.stringify(payload)]
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tax/forms', async (req, res) => {
  if (!process.env.TAX_PROVIDER_API_KEY) {
    return res.status(503).json({ error: 'Tax provider not configured', missing: 'TAX_PROVIDER_API_KEY' });
  }
  try {
    const { client_id, tax_year } = req.query;
    let q = 'SELECT * FROM tax_forms WHERE 1=1';
    const params = [];
    if (client_id) { params.push(client_id); q += ` AND client_id = $${params.length}`; }
    if (tax_year) { params.push(tax_year); q += ` AND tax_year = $${params.length}`; }
    q += ' ORDER BY id DESC LIMIT 200';
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────────
// Multi-generational wealth planning (NEEDS-PRODUCT-DECISION → AI)
// ─────────────────────────────────────────────────────────────────
router.post('/multi-gen/plan', async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    return res.status(503).json({ error: 'AI provider not configured', missing: 'OPENROUTER_API_KEY' });
  }
  try {
    const { client_id, generations, goals, total_wealth } = req.body || {};
    if (!client_id) return res.status(400).json({ error: 'client_id is required' });
    const sysPrompt = `You are a multi-generational wealth planner. Given a client and goals, produce a multi-generation plan as JSON ONLY:
{
  "generations":[{"name":"...","horizon_years":<n>,"allocation_pct":<n>,"vehicles":["..."],"objectives":["..."]}],
  "trust_recommendations":["..."],
  "estate_actions":["..."],
  "tax_strategies":["..."],
  "summary":"..."
}`;
    const userPrompt = `Client ID: ${client_id}
Generations: ${(generations || []).join(', ') || 'G1, G2, G3'}
Goals: ${(goals || []).join('; ') || 'wealth preservation, education, philanthropy'}
Total wealth: ${total_wealth || 'unspecified'}`;
    const r = await queryOpenRouter(sysPrompt, userPrompt);
    if (!r.success) return res.status(502).json({ error: r.error || 'AI error' });
    const parsed = parseAIJson(r.data);
    res.json({ success: true, plan: parsed, model: r.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────────
// White-label / co-branding API (NEEDS-PRODUCT-DECISION)
// ─────────────────────────────────────────────────────────────────
router.get('/white-label/:tenant_slug', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM tenant_branding WHERE tenant_slug = $1', [req.params.tenant_slug]);
    if (!r.rows.length) return res.status(404).json({ error: 'Tenant not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/white-label/:tenant_slug', async (req, res) => {
  try {
    const { display_name, primary_color, logo_url, support_email } = req.body || {};
    const r = await pool.query(
      `INSERT INTO tenant_branding (tenant_slug, display_name, primary_color, logo_url, support_email)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (tenant_slug) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         primary_color = EXCLUDED.primary_color,
         logo_url = EXCLUDED.logo_url,
         support_email = EXCLUDED.support_email,
         updated_at = NOW()
       RETURNING *`,
      [req.params.tenant_slug, display_name || null, primary_color || null, logo_url || null, support_email || null]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────────
// Voice advisory (NEEDS-PRODUCT-DECISION → text-only stub)
// ─────────────────────────────────────────────────────────────────
router.post('/voice/advise', async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    return res.status(503).json({ error: 'AI provider not configured', missing: 'OPENROUTER_API_KEY' });
  }
  try {
    const { transcript, client_id } = req.body || {};
    if (!transcript) return res.status(400).json({ error: 'transcript is required' });
    const sysPrompt = `You are an automated wealth advisor. Listen to the (already-transcribed) client question and produce a concise spoken-style response. Respond ONLY with JSON:
{
  "response_text":"...",
  "follow_up_questions":["..."],
  "suggested_actions":["..."],
  "disclaimer":"..."
}`;
    const userPrompt = `Client ID: ${client_id || 'unspecified'}
Transcript: ${transcript}`;
    const r = await queryOpenRouter(sysPrompt, userPrompt);
    if (!r.success) return res.status(502).json({ error: r.error || 'AI error' });
    const parsed = parseAIJson(r.data);
    res.json({ success: true, ...parsed, model: r.model, note: 'text-only inference; no native audio handling' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
