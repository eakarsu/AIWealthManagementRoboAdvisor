const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { queryOpenRouter, parseAIJson } = require('../services/openrouter');

// Apply AI rate limiter to all AI routes
router.use(auth);
router.use(aiRateLimiter);

// ---------------------------------------------------------------------------
// Ensure ai_results table exists
// ---------------------------------------------------------------------------
async function ensureAiResultsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      endpoint VARCHAR(100) NOT NULL,
      request_params JSONB,
      result_data JSONB,
      model_used VARCHAR(100),
      tokens_used INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
ensureAiResultsTable().catch(console.error);

async function persistAiResult(userId, endpoint, params, resultData, model, tokens) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, request_params, result_data, model_used, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, endpoint, JSON.stringify(params), JSON.stringify(resultData), model, tokens]
    );
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

// Helper: call AI and return parsed JSON
async function callAI(systemPrompt, userPrompt) {
  const result = await queryOpenRouter(systemPrompt, userPrompt);
  if (!result.success) return { success: false, error: result.error, parsed: null, raw: null, model: null, usage: null };
  const parsed = parseAIJson(result.data);
  return { success: true, parsed, raw: result.data, model: result.model, usage: result.usage };
}

// ---------------------------------------------------------------------------
// GET /api/ai/history
// ---------------------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const { endpoint, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT id, endpoint, request_params, result_data, model_used, tokens_used, created_at
                 FROM ai_results WHERE user_id = $1`;
    const params = [req.user.id];
    if (endpoint) {
      params.push(endpoint);
      query += ` AND endpoint = $${params.length}`;
    }
    const countQuery = query.replace('SELECT id, endpoint, request_params, result_data, model_used, tokens_used, created_at', 'SELECT COUNT(*)');
    const [rows, countRows] = await Promise.all([
      pool.query(query + ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(countQuery, params),
    ]);
    const total = parseInt(countRows.rows[0].count);
    res.json({
      data: rows.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Portfolio Analysis
// ---------------------------------------------------------------------------
router.post('/portfolio-analysis', async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    let context = {};
    if (portfolio_id) {
      const [portfolio, holdings] = await Promise.all([
        pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]),
        pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]),
      ]);
      context = { portfolio: portfolio.rows[0], holdings: holdings.rows };
    } else {
      context = { portfolio: { name: 'Sample Balanced Portfolio', strategy: 'balanced', total_value: 500000 }, holdings: [] };
    }

    const result = await callAI(
      'You are an expert financial advisor AI. Analyze the portfolio and return ONLY valid JSON (no markdown). The JSON must have these exact keys: summary (string), allocation_analysis (object with strengths array and weaknesses array), diversification_score (number 1-100), risk_level (string: low/moderate/high), recommendations (array of strings), rebalancing_needed (boolean).',
      `Analyze this portfolio: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { summary: result.raw, recommendations: [], diversification_score: 50, risk_level: 'moderate', rebalancing_needed: false, allocation_analysis: { strengths: [], weaknesses: [] } };
    await persistAiResult(req.user.id, 'portfolio-analysis', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Risk Assessment
// ---------------------------------------------------------------------------
router.post('/risk-assessment', async (req, res) => {
  try {
    const { client_id, answers } = req.body;
    let context = {};
    if (client_id) {
      const client = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      context.client = client.rows[0];
    }
    if (answers) context.questionnaire_answers = answers;

    const result = await callAI(
      'You are a risk assessment specialist. Return ONLY valid JSON with: risk_score (number 1-100), risk_category (string: conservative/moderate/aggressive), risk_tolerance_label (string), key_factors (array of strings), recommended_allocation (object with stocks_pct, bonds_pct, alternatives_pct, cash_pct as numbers summing to 100), action_items (array of strings).',
      `Assess investment risk profile: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { risk_score: 50, risk_category: 'moderate', risk_tolerance_label: 'Moderate Risk Investor', key_factors: [], recommended_allocation: { stocks_pct: 60, bonds_pct: 30, alternatives_pct: 5, cash_pct: 5 }, action_items: [] };
    await persistAiResult(req.user.id, 'risk-assessment', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Investment Recommendations
// ---------------------------------------------------------------------------
router.post('/investment-recommendations', async (req, res) => {
  try {
    const { risk_level, investment_amount, goals } = req.body;

    const result = await callAI(
      'You are an investment recommendation engine. Return ONLY valid JSON with: summary (string), recommendations (array of objects, each with: ticker string, name string, asset_class string, allocation_pct number, rationale string, risk_rating string), total_allocation_pct (number, must equal 100), expected_annual_return_pct (number), notes (string).',
      `Risk Level: ${risk_level || 'moderate'}\nInvestment Amount: $${investment_amount || 100000}\nGoals: ${goals || 'Long-term growth'}\nProvide specific ETF and stock recommendations with allocation percentages summing to 100.`
    );

    const responseData = result.parsed || { summary: result.raw, recommendations: [], total_allocation_pct: 100, expected_annual_return_pct: 7, notes: '' };
    await persistAiResult(req.user.id, 'investment-recommendations', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Market Sentiment Analysis
// ---------------------------------------------------------------------------
router.post('/market-sentiment', async (req, res) => {
  try {
    const { symbols, sector } = req.body;

    const result = await callAI(
      'You are a market sentiment analysis AI. Return ONLY valid JSON with: overall_sentiment (string: bullish/neutral/bearish), overall_score (number -100 to 100), symbols_analysis (array of objects with: symbol string, sentiment string, score number, key_drivers array of strings, short_term_outlook string), sector_analysis (object with sector string, sentiment string, rationale string), key_risks (array of strings), opportunities (array of strings).',
      `Analyze market sentiment for: ${symbols || 'SPY, QQQ, DIA, IWM'}\nSector focus: ${sector || 'Technology, Healthcare, Finance'}`
    );

    const responseData = result.parsed || { overall_sentiment: 'neutral', overall_score: 0, symbols_analysis: [], sector_analysis: {}, key_risks: [], opportunities: [] };
    await persistAiResult(req.user.id, 'market-sentiment', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Tax Optimization
// ---------------------------------------------------------------------------
router.post('/tax-optimization', async (req, res) => {
  try {
    const { portfolio_id, tax_bracket, state } = req.body;
    let holdings = [];
    if (portfolio_id) {
      const res2 = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]);
      holdings = res2.rows;
    }

    const result = await callAI(
      'You are a tax optimization specialist. Return ONLY valid JSON with: estimated_tax_savings_usd (number), strategies (array of objects with: strategy string, description string, estimated_savings_usd number, priority string: high/medium/low), tax_loss_opportunities (array of objects with: position string, unrealized_loss_usd number, suggested_replacement string), asset_location_suggestions (array of strings), compliance_notes (array of strings).',
      `Tax Bracket: ${tax_bracket || '32%'}\nState: ${state || 'California'}\nHoldings: ${JSON.stringify(holdings)}\nProvide tax optimization strategies.`
    );

    const responseData = result.parsed || { estimated_tax_savings_usd: 0, strategies: [], tax_loss_opportunities: [], asset_location_suggestions: [], compliance_notes: [] };
    await persistAiResult(req.user.id, 'tax-optimization', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Retirement Planning
// ---------------------------------------------------------------------------
router.post('/retirement-planning', async (req, res) => {
  try {
    const { current_age, retirement_age, current_savings, monthly_contribution, risk_tolerance } = req.body;

    const result = await callAI(
      'You are a retirement planning AI advisor. Return ONLY valid JSON with: readiness_score (number 1-100), projected_retirement_savings (number), monthly_income_in_retirement (number), funding_gap (number, positive means shortfall), milestones (array of objects with: age number, milestone string, target_savings number), recommended_monthly_contribution (number), key_assumptions (object with inflation_rate number, expected_return_pct number, years_in_retirement number), action_items (array of strings).',
      `Current Age: ${current_age || 35}\nRetirement Age: ${retirement_age || 65}\nCurrent Savings: $${current_savings || 250000}\nMonthly Contribution: $${monthly_contribution || 2000}\nRisk Tolerance: ${risk_tolerance || 'moderate'}`
    );

    const responseData = result.parsed || { readiness_score: 50, projected_retirement_savings: 0, monthly_income_in_retirement: 0, funding_gap: 0, milestones: [], recommended_monthly_contribution: 0, key_assumptions: {}, action_items: [] };
    await persistAiResult(req.user.id, 'retirement-planning', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Rebalancing Advisor
// ---------------------------------------------------------------------------
router.post('/rebalancing', async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    let context = {};
    if (portfolio_id) {
      const [portfolio, holdings] = await Promise.all([
        pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]),
        pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]),
      ]);
      context = { portfolio: portfolio.rows[0], holdings: holdings.rows };
    } else {
      context = { portfolio: { name: 'Sample', total_value: 500000, target_allocation: '60/30/10' }, holdings: [{ symbol: 'VTI', shares: 500, current_price: 210 }, { symbol: 'BND', shares: 200, current_price: 75 }] };
    }

    const result = await callAI(
      'You are a portfolio rebalancing AI. Return ONLY valid JSON with: rebalancing_needed (boolean), current_allocation (object with asset classes as keys and percentages as values), target_allocation (object with asset classes as keys and percentages as values), drift_analysis (array of objects with: asset_class string, current_pct number, target_pct number, drift_pct number), trade_recommendations (array of objects with: action string buy/sell, symbol string, shares number, estimated_value_usd number, rationale string), estimated_transaction_costs (number), after_rebalance_allocation (object).',
      `Portfolio data: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { rebalancing_needed: false, current_allocation: {}, target_allocation: {}, drift_analysis: [], trade_recommendations: [], estimated_transaction_costs: 0, after_rebalance_allocation: {} };
    await persistAiResult(req.user.id, 'rebalancing', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Financial Goal Planning
// ---------------------------------------------------------------------------
router.post('/goal-planning', async (req, res) => {
  try {
    const { goal_type, target_amount, timeline, current_savings } = req.body;

    const result = await callAI(
      'You are a financial goal planning AI. Return ONLY valid JSON with: feasibility_score (number 1-100), feasibility_assessment (string: achievable/challenging/very_challenging), required_monthly_savings (number), suggested_investment_strategy (string), milestones (array of objects with: period string, savings_target number, action string), risk_factors (array of strings), alternative_approaches (array of strings).',
      `Goal: ${goal_type || 'Buy a home'}\nTarget: $${target_amount || 500000}\nTimeline: ${timeline || '5 years'}\nCurrent Savings: $${current_savings || 50000}`
    );

    const responseData = result.parsed || { feasibility_score: 50, feasibility_assessment: 'challenging', required_monthly_savings: 0, suggested_investment_strategy: '', milestones: [], risk_factors: [], alternative_approaches: [] };
    await persistAiResult(req.user.id, 'goal-planning', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI ESG Analysis
// ---------------------------------------------------------------------------
router.post('/esg-analysis', async (req, res) => {
  try {
    const { symbols, preferences } = req.body;

    const result = await callAI(
      'You are an ESG investment analysis AI. Return ONLY valid JSON with: portfolio_esg_score (number 1-100), symbols_analysis (array of objects with: symbol string, esg_score number, environmental_score number, social_score number, governance_score number, rating string: A/B/C/D/F, key_concerns array of strings, key_strengths array of strings), esg_recommendations (array of strings), alternative_investments (array of objects with: symbol string, name string, esg_score number, rationale string).',
      `Analyze ESG for: ${symbols || 'AAPL, MSFT, GOOGL, AMZN, TSLA'}\nPreferences: ${preferences || 'Focus on climate impact and governance'}`
    );

    const responseData = result.parsed || { portfolio_esg_score: 60, symbols_analysis: [], esg_recommendations: [], alternative_investments: [] };
    await persistAiResult(req.user.id, 'esg-analysis', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Estate Planning
// ---------------------------------------------------------------------------
router.post('/estate-planning', async (req, res) => {
  try {
    const { net_worth, family_situation, goals } = req.body;

    const result = await callAI(
      'You are an estate planning AI advisor. Return ONLY valid JSON with: estimated_estate_tax (number), strategies (array of objects with: strategy string, description string, estimated_tax_savings number, priority string: high/medium/low, complexity string: low/medium/high), recommended_vehicles (array of objects with: vehicle string, purpose string, suitability string), action_checklist (array of strings), professional_referrals (array of strings).',
      `Net Worth: $${net_worth || 2000000}\nFamily: ${family_situation || 'Married with 2 children'}\nGoals: ${goals || 'Minimize estate taxes, smooth wealth transfer'}`
    );

    const responseData = result.parsed || { estimated_estate_tax: 0, strategies: [], recommended_vehicles: [], action_checklist: [], professional_referrals: [] };
    await persistAiResult(req.user.id, 'estate-planning', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Client Analysis
// ---------------------------------------------------------------------------
router.post('/client-analysis', async (req, res) => {
  try {
    const { client_id } = req.body;
    let context = {};
    if (client_id) {
      const [client, portfolios, goals] = await Promise.all([
        pool.query('SELECT * FROM clients WHERE id = $1', [client_id]),
        pool.query('SELECT * FROM portfolios WHERE client_id = $1', [client_id]),
        pool.query('SELECT * FROM financial_goals WHERE client_id = $1', [client_id]),
      ]);
      context = { client: client.rows[0], portfolios: portfolios.rows, goals: goals.rows };
    }

    const result = await callAI(
      'You are an AI wealth management client advisor. Return ONLY valid JSON with: health_score (number 1-100), engagement_level (string: high/medium/low), risk_alignment (string: aligned/misaligned/partially_aligned), cross_sell_opportunities (array of objects with: product string, rationale string, estimated_revenue number), retention_risks (array of strings), recommended_actions (array of objects with: action string, priority string: high/medium/low, timeline string).',
      `Client data: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { health_score: 70, engagement_level: 'medium', risk_alignment: 'aligned', cross_sell_opportunities: [], retention_risks: [], recommended_actions: [] };
    await persistAiResult(req.user.id, 'client-analysis', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Transaction Analysis
// ---------------------------------------------------------------------------
router.post('/transaction-analysis', async (req, res) => {
  try {
    const { portfolio_id, period } = req.body;
    let txns = [];
    if (portfolio_id) {
      const r = await pool.query('SELECT * FROM transactions WHERE portfolio_id = $1 ORDER BY transaction_date DESC LIMIT 50', [portfolio_id]);
      txns = r.rows;
    } else {
      const r = await pool.query('SELECT * FROM transactions ORDER BY transaction_date DESC LIMIT 30');
      txns = r.rows;
    }

    const result = await callAI(
      'You are an AI transaction analysis specialist. Return ONLY valid JSON with: transaction_count (number), total_volume_usd (number), patterns (array of strings), unusual_activity (array of objects with: description string, severity string: high/medium/low), cost_analysis (object with total_fees number, avg_fee_pct number, optimization_suggestions array of strings), timing_effectiveness (string: good/average/poor), compliance_flags (array of strings).',
      `Transactions: ${JSON.stringify(txns)}\nPeriod: ${period || 'Last 30 days'}`
    );

    const responseData = result.parsed || { transaction_count: txns.length, total_volume_usd: 0, patterns: [], unusual_activity: [], cost_analysis: { total_fees: 0, avg_fee_pct: 0, optimization_suggestions: [] }, timing_effectiveness: 'average', compliance_flags: [] };
    await persistAiResult(req.user.id, 'transaction-analysis', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Asset Class Analysis
// ---------------------------------------------------------------------------
router.post('/asset-analysis', async (req, res) => {
  try {
    const [assets, holdings] = await Promise.all([
      pool.query('SELECT * FROM asset_classes'),
      pool.query(`SELECT ac.name as asset_class, SUM(ph.shares * ph.current_price) as total_value FROM portfolio_holdings ph LEFT JOIN asset_classes ac ON ph.asset_class_id = ac.id GROUP BY ac.name`),
    ]);

    const result = await callAI(
      'You are an AI asset allocation strategist. Return ONLY valid JSON with: total_aum (number), asset_class_breakdown (array of objects with: asset_class string, total_value number, percentage number, status string: overweight/underweight/on_target), tactical_shifts (array of objects with: from string, to string, rationale string, urgency string), correlation_risks (array of strings), new_asset_classes_to_consider (array of objects with: asset_class string, rationale string, suggested_allocation_pct number).',
      `Asset Classes: ${JSON.stringify(assets.rows)}\nCurrent Allocation: ${JSON.stringify(holdings.rows)}`
    );

    const responseData = result.parsed || { total_aum: 0, asset_class_breakdown: [], tactical_shifts: [], correlation_risks: [], new_asset_classes_to_consider: [] };
    await persistAiResult(req.user.id, 'asset-analysis', {}, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Watchlist Analysis
// ---------------------------------------------------------------------------
router.post('/watchlist-analysis', async (req, res) => {
  try {
    const watchlist = await pool.query('SELECT * FROM watchlist');

    const result = await callAI(
      'You are an AI securities research analyst. Return ONLY valid JSON with: watchlist_count (number), buy_candidates (array of strings), hold_candidates (array of strings), pass_candidates (array of strings), securities_analysis (array of objects with: symbol string, recommendation string: buy/hold/pass, entry_point_assessment string: good/fair/poor, rationale string, confidence_score number 1-100), sector_concentration_risk (string), missing_opportunities (array of strings).',
      `Watchlist: ${JSON.stringify(watchlist.rows)}`
    );

    const responseData = result.parsed || { watchlist_count: watchlist.rows.length, buy_candidates: [], hold_candidates: [], pass_candidates: [], securities_analysis: [], sector_concentration_risk: 'low', missing_opportunities: [] };
    await persistAiResult(req.user.id, 'watchlist-analysis', {}, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Alert Analysis
// ---------------------------------------------------------------------------
router.post('/alert-analysis', async (req, res) => {
  try {
    const alerts = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');

    const result = await callAI(
      'You are an AI alert management specialist. Return ONLY valid JSON with: total_alerts (number), active_alerts (number), alert_fatigue_risk (string: high/medium/low), pattern_summary (array of strings), priority_alerts (array of objects with: id number, description string, urgency string: critical/high/medium/low), threshold_adjustments (array of objects with: alert_type string, current_threshold string, suggested_threshold string, rationale string), new_recommended_alerts (array of objects with: type string, description string, suggested_threshold string).',
      `Alerts: ${JSON.stringify(alerts.rows)}`
    );

    const responseData = result.parsed || { total_alerts: alerts.rows.length, active_alerts: 0, alert_fatigue_risk: 'low', pattern_summary: [], priority_alerts: [], threshold_adjustments: [], new_recommended_alerts: [] };
    await persistAiResult(req.user.id, 'alert-analysis', {}, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Fee Analysis
// ---------------------------------------------------------------------------
router.post('/fee-analysis', async (req, res) => {
  try {
    const [fees, portfolios] = await Promise.all([
      pool.query('SELECT * FROM fees'),
      pool.query('SELECT id, name, total_value FROM portfolios'),
    ]);

    const result = await callAI(
      'You are an AI fee optimization specialist. Return ONLY valid JSON with: total_fee_revenue (number), average_effective_rate_pct (number), industry_benchmark_rate_pct (number), revenue_vs_benchmark (string: above/at/below), fee_structure_analysis (array of objects with: fee_type string, rate string, assessment string), optimization_opportunities (array of objects with: opportunity string, estimated_revenue_impact number, priority string: high/medium/low), compression_risks (array of strings), recommendations (array of strings).',
      `Fees: ${JSON.stringify(fees.rows)}\nPortfolios: ${JSON.stringify(portfolios.rows)}`
    );

    const responseData = result.parsed || { total_fee_revenue: 0, average_effective_rate_pct: 0, industry_benchmark_rate_pct: 0.85, revenue_vs_benchmark: 'at', fee_structure_analysis: [], optimization_opportunities: [], compression_risks: [], recommendations: [] };
    await persistAiResult(req.user.id, 'fee-analysis', {}, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Document Analysis
// ---------------------------------------------------------------------------
router.post('/document-analysis', async (req, res) => {
  try {
    const docs = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');

    const result = await callAI(
      'You are an AI compliance and document management specialist. Return ONLY valid JSON with: total_documents (number), missing_required_documents (array of strings), expiring_soon (array of objects with: document string, expiry_date string, days_remaining number), compliance_status (string: compliant/needs_attention/non_compliant), compliance_gaps (array of strings), workflow_improvements (array of strings), regulatory_notes (array of strings).',
      `Documents: ${JSON.stringify(docs.rows)}`
    );

    const responseData = result.parsed || { total_documents: docs.rows.length, missing_required_documents: [], expiring_soon: [], compliance_status: 'needs_attention', compliance_gaps: [], workflow_improvements: [], regulatory_notes: [] };
    await persistAiResult(req.user.id, 'document-analysis', {}, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Performance Analysis
// ---------------------------------------------------------------------------
router.post('/performance-analysis', async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    let context = {};
    if (portfolio_id) {
      const [perf, portfolio] = await Promise.all([
        pool.query('SELECT * FROM performance_records WHERE portfolio_id = $1 ORDER BY record_date DESC', [portfolio_id]),
        pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]),
      ]);
      context = { portfolio: portfolio.rows[0], performance_records: perf.rows };
    } else {
      const perf = await pool.query('SELECT * FROM performance_records ORDER BY record_date DESC LIMIT 30');
      context = { performance_records: perf.rows };
    }

    const result = await callAI(
      'You are an AI performance attribution specialist. Return ONLY valid JSON with: total_return_pct (number), annualized_return_pct (number), sharpe_ratio (number), sortino_ratio (number), alpha (number), beta (number), benchmark_comparison (object with benchmark string, benchmark_return_pct number, outperformance_pct number), performance_drivers (array of strings), performance_detractors (array of strings), forward_outlook (string), risk_adjusted_rating (string: excellent/good/average/below_average/poor).',
      `Portfolio performance data: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { total_return_pct: 0, annualized_return_pct: 0, sharpe_ratio: 0, sortino_ratio: 0, alpha: 0, beta: 1, benchmark_comparison: {}, performance_drivers: [], performance_detractors: [], forward_outlook: '', risk_adjusted_rating: 'average' };
    await persistAiResult(req.user.id, 'performance-analysis', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 1: AI Portfolio Rebalancer
// ---------------------------------------------------------------------------
router.post('/portfolio-rebalancer', async (req, res) => {
  try {
    const { portfolio_id, target_allocation } = req.body;
    let context = {};
    if (portfolio_id) {
      const [portfolio, holdings] = await Promise.all([
        pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]),
        pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]),
      ]);
      context = { portfolio: portfolio.rows[0], holdings: holdings.rows, target_allocation };
    } else {
      context = {
        portfolio: { name: 'Sample Portfolio', total_value: 500000 },
        holdings: [
          { symbol: 'VTI', shares: 800, current_price: 225, asset_class: 'US Stocks' },
          { symbol: 'VXUS', shares: 200, current_price: 57, asset_class: 'International Stocks' },
          { symbol: 'BND', shares: 300, current_price: 74, asset_class: 'Bonds' },
        ],
        target_allocation: target_allocation || { 'US Stocks': 45, 'International Stocks': 15, 'Bonds': 30, 'Alternatives': 10 },
      };
    }

    const result = await callAI(
      'You are a portfolio rebalancing AI. Generate specific buy/sell trade recommendations. Return ONLY valid JSON with: portfolio_value (number), current_allocation (object mapping asset class to percentage), target_allocation (object mapping asset class to percentage), trades (array of objects with: action string buy/sell, symbol string, shares_to_trade number, estimated_value_usd number, asset_class string, rationale string), summary (string), estimated_transaction_costs (number), after_trade_allocation (object), rebalancing_urgency (string: immediate/soon/low).',
      `Portfolio: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { portfolio_value: 0, current_allocation: {}, target_allocation: {}, trades: [], summary: result.raw || '', estimated_transaction_costs: 0, after_trade_allocation: {}, rebalancing_urgency: 'low' };
    await persistAiResult(req.user.id, 'portfolio-rebalancer', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 2: AI Tax-Loss Harvesting Advisor
// ---------------------------------------------------------------------------
router.post('/tax-loss-harvesting', async (req, res) => {
  try {
    const { portfolio_id, tax_bracket, holding_periods } = req.body;
    let holdings = [];
    if (portfolio_id) {
      const r = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]);
      holdings = r.rows;
    } else {
      holdings = [
        { symbol: 'ARKK', shares: 100, purchase_price: 85, current_price: 42, asset_class: 'Growth ETF' },
        { symbol: 'META', shares: 50, purchase_price: 380, current_price: 320, asset_class: 'Technology' },
        { symbol: 'BNDX', shares: 200, purchase_price: 52, current_price: 48, asset_class: 'International Bonds' },
      ];
    }

    const result = await callAI(
      'You are a tax-loss harvesting specialist. Return ONLY valid JSON with: total_harvestable_losses (number), estimated_tax_savings (number), harvest_candidates (array of objects with: symbol string, unrealized_loss_usd number, loss_percentage number, holding_period string, recommended_replacement string, replacement_rationale string, wash_sale_risk string: high/low, action string: harvest_now/harvest_if_needed/hold), strategy_summary (string), wash_sale_warnings (array of strings), timing_recommendations (array of strings).',
      `Holdings: ${JSON.stringify(holdings)}\nTax Bracket: ${tax_bracket || '32%'}\nHolding Periods: ${JSON.stringify(holding_periods || {})}`
    );

    const responseData = result.parsed || { total_harvestable_losses: 0, estimated_tax_savings: 0, harvest_candidates: [], strategy_summary: '', wash_sale_warnings: [], timing_recommendations: [] };
    await persistAiResult(req.user.id, 'tax-loss-harvesting', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 3: AI Retirement Readiness Scorer
// ---------------------------------------------------------------------------
router.post('/retirement-readiness', async (req, res) => {
  try {
    const { age, income, current_savings, monthly_expenses, expected_retirement_age, social_security_estimate } = req.body;

    const result = await callAI(
      'You are a retirement readiness analyst. Return ONLY valid JSON with: readiness_score (number 1-100), readiness_grade (string: A/B/C/D/F), readiness_label (string), projected_savings_at_retirement (number), required_savings_at_retirement (number), gap_analysis (object with gap_amount number positive_means_shortfall, years_to_close number, monthly_savings_needed_to_close number), income_replacement_rate (number), social_security_impact (object with estimated_monthly_benefit number, impact_on_gap number), top_risks (array of strings), action_plan (array of objects with: priority string: 1/2/3, action string, impact string, timeline string).',
      `Age: ${age || 45}\nAnnual Income: $${income || 120000}\nCurrent Savings: $${current_savings || 300000}\nMonthly Expenses: $${monthly_expenses || 5000}\nExpected Retirement Age: ${expected_retirement_age || 65}\nSocial Security Estimate: $${social_security_estimate || 2000}/month`
    );

    const responseData = result.parsed || { readiness_score: 50, readiness_grade: 'C', readiness_label: 'Needs Improvement', projected_savings_at_retirement: 0, required_savings_at_retirement: 0, gap_analysis: {}, income_replacement_rate: 0, social_security_impact: {}, top_risks: [], action_plan: [] };
    await persistAiResult(req.user.id, 'retirement-readiness', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 4: AI Risk Profile Assessor
// ---------------------------------------------------------------------------
router.post('/risk-profile-assessor', async (req, res) => {
  try {
    const { questionnaire_responses } = req.body;
    // questionnaire_responses: array of { question, answer }

    const result = await callAI(
      'You are an investment risk profile assessor. Return ONLY valid JSON with: risk_score (number 1-100), risk_profile (string: conservative/moderately_conservative/moderate/moderately_aggressive/aggressive), risk_profile_description (string), recommended_allocation (object with stocks_pct number, bonds_pct number, alternatives_pct number, cash_pct number summing to 100), specific_fund_suggestions (array of objects with: fund string, ticker string, allocation_pct number, rationale string), behavioral_biases_detected (array of strings), key_considerations (array of strings), review_frequency (string).',
      `Questionnaire responses: ${JSON.stringify(questionnaire_responses || [{ question: 'Investment experience', answer: 'Moderate' }, { question: 'Time horizon', answer: '10-15 years' }, { question: 'Loss tolerance', answer: 'Can handle 20% decline' }])}`
    );

    const responseData = result.parsed || { risk_score: 50, risk_profile: 'moderate', risk_profile_description: '', recommended_allocation: { stocks_pct: 60, bonds_pct: 30, alternatives_pct: 5, cash_pct: 5 }, specific_fund_suggestions: [], behavioral_biases_detected: [], key_considerations: [], review_frequency: 'annual' };
    await persistAiResult(req.user.id, 'risk-profile-assessor', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 5: AI Market Scenario Simulator
// ---------------------------------------------------------------------------
router.post('/scenario-simulator', async (req, res) => {
  try {
    const { scenario, portfolio_id } = req.body;
    let holdings = [];
    if (portfolio_id) {
      const r = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]);
      holdings = r.rows;
    } else {
      holdings = [
        { symbol: 'VTI', shares: 500, current_price: 225, asset_class: 'US Stocks' },
        { symbol: 'BND', shares: 300, current_price: 74, asset_class: 'Bonds' },
        { symbol: 'GLD', shares: 50, current_price: 185, asset_class: 'Gold' },
      ];
    }

    const result = await callAI(
      'You are a market scenario simulation AI. Return ONLY valid JSON with: scenario_name (string), scenario_description (string), probability_of_occurrence (string: low/medium/high), portfolio_impact (object with estimated_loss_pct number, estimated_loss_usd number, recovery_timeline_months number, worst_case_loss_pct number), asset_class_impacts (array of objects with: asset_class string, expected_change_pct number, rationale string), protective_measures (array of objects with: measure string, effectiveness string: high/medium/low, cost string), hedging_suggestions (array of strings), historical_precedents (array of strings).',
      `Market Scenario: ${scenario || 'Recession with 30% equity market decline'}\nPortfolio Holdings: ${JSON.stringify(holdings)}`
    );

    const responseData = result.parsed || { scenario_name: scenario || 'Market Downturn', scenario_description: '', probability_of_occurrence: 'medium', portfolio_impact: {}, asset_class_impacts: [], protective_measures: [], hedging_suggestions: [], historical_precedents: [] };
    await persistAiResult(req.user.id, 'scenario-simulator', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 6: AI Predictive Client Churn
// ---------------------------------------------------------------------------
router.post('/churn-prediction', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_key_here') {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.' });
    }
    const { client_id } = req.body;
    let context = {};
    if (client_id) {
      const [client, portfolios, performance, alerts] = await Promise.all([
        pool.query('SELECT * FROM clients WHERE id = $1', [client_id]),
        pool.query('SELECT id, name, strategy, total_value, risk_level FROM portfolios WHERE client_id = $1', [client_id]),
        pool.query(
          `SELECT pr.* FROM performance_records pr
           JOIN portfolios p ON p.id = pr.portfolio_id
           WHERE p.client_id = $1
           ORDER BY pr.record_date DESC LIMIT 12`,
          [client_id]
        ),
        pool.query('SELECT * FROM alerts WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10', [client_id]),
      ]);
      context = {
        client: client.rows[0],
        portfolios: portfolios.rows,
        recent_performance: performance.rows,
        recent_alerts: alerts.rows,
      };
    } else {
      context = {
        client: { name: 'Sample Client', risk_tolerance: 'moderate', total_aum: 850000, tenure_years: 4 },
        portfolios: [{ name: 'Core Holdings', strategy: 'balanced', total_value: 850000, risk_level: 'moderate' }],
        recent_performance: [],
        recent_alerts: [],
      };
    }

    const result = await callAI(
      'You are a wealth-management retention analyst. Predict client churn risk. Return ONLY valid JSON with: churn_score (number 0-100, higher = more likely to churn), churn_band (string: low/medium/high/critical), top_drivers (array of objects with: driver string, weight number 0-1, evidence string), retention_signals (array of strings), recommended_actions (array of objects with: action string, owner string, priority string: 1/2/3, expected_impact string), engagement_window_days (number, how many days to act before risk peaks), summary (string).',
      `Client and recent activity: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { churn_score: 30, churn_band: 'low', top_drivers: [], retention_signals: [], recommended_actions: [], engagement_window_days: 60, summary: result.raw || '' };
    await persistAiResult(req.user.id, 'churn-prediction', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NEW FEATURE 7: AI Behavioral Finance Coaching
// ---------------------------------------------------------------------------
router.post('/behavioral-coaching', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_key_here') {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.' });
    }
    const { client_id, recent_decisions, market_context, life_event } = req.body;
    let context = { recent_decisions: recent_decisions || [], market_context: market_context || 'normal volatility', life_event: life_event || 'none' };
    if (client_id) {
      const [client, transactions] = await Promise.all([
        pool.query('SELECT id, name, risk_tolerance, investment_goals, total_aum FROM clients WHERE id = $1', [client_id]),
        pool.query(
          `SELECT t.* FROM transactions t
           JOIN portfolios p ON p.id = t.portfolio_id
           WHERE p.client_id = $1
           ORDER BY t.transaction_date DESC LIMIT 25`,
          [client_id]
        ),
      ]);
      context.client = client.rows[0];
      context.recent_transactions = transactions.rows;
    }

    const result = await callAI(
      'You are a behavioral finance coach. Identify cognitive biases and provide coaching guidance. Return ONLY valid JSON with: biases_detected (array of objects with: bias string e.g. loss_aversion/recency/anchoring/overconfidence/herding/confirmation, severity string: low/medium/high, evidence string), coaching_messages (array of objects with: message string, framing_principle string, conversation_starter string), pre_commitment_devices (array of strings), reframing_examples (array of objects with: instead_of string, try string), recommended_check_ins (array of strings), risk_of_panic_action (string: low/medium/high), summary (string).',
      `Behavioral context: ${JSON.stringify(context)}`
    );

    const responseData = result.parsed || { biases_detected: [], coaching_messages: [], pre_commitment_devices: [], reframing_examples: [], recommended_check_ins: [], risk_of_panic_action: 'low', summary: result.raw || '' };
    await persistAiResult(req.user.id, 'behavioral-coaching', req.body, responseData, result.model, result.usage?.total_tokens);
    res.json({ success: result.success, data: responseData, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
