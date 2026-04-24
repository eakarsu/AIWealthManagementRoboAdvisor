const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { queryOpenRouter } = require('../services/openrouter');

// AI Portfolio Analysis
router.post('/portfolio-analysis', auth, async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    let context = '';
    if (portfolio_id) {
      const portfolio = await pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]);
      const holdings = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]);
      context = `Portfolio: ${JSON.stringify(portfolio.rows[0])}\nHoldings: ${JSON.stringify(holdings.rows)}`;
    }
    const result = await queryOpenRouter(
      'You are an expert financial advisor AI. Analyze the given portfolio and provide detailed insights on allocation, diversification, strengths, weaknesses, and recommendations. Format your response with clear sections using markdown headers.',
      context || 'Analyze a typical balanced portfolio with 60% stocks, 30% bonds, 10% alternatives. Provide comprehensive analysis.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Risk Assessment
router.post('/risk-assessment', auth, async (req, res) => {
  try {
    const { client_id, answers } = req.body;
    let context = '';
    if (client_id) {
      const client = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      context = `Client Profile: ${JSON.stringify(client.rows[0])}\n`;
    }
    if (answers) context += `Questionnaire Answers: ${JSON.stringify(answers)}`;
    const result = await queryOpenRouter(
      'You are a risk assessment specialist for wealth management. Evaluate the client risk profile and provide a detailed risk score, risk category, and personalized recommendations. Format with markdown.',
      context || 'Assess risk tolerance for a 45-year-old professional with $500K net worth, moderate investment experience, 15-year horizon, who can tolerate 15% portfolio decline.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Investment Recommendations
router.post('/investment-recommendations', auth, async (req, res) => {
  try {
    const { risk_level, investment_amount, goals } = req.body;
    const result = await queryOpenRouter(
      'You are an investment recommendation engine. Provide specific, actionable investment recommendations with ticker symbols, allocation percentages, and rationale. Format beautifully with markdown.',
      `Risk Level: ${risk_level || 'moderate'}\nInvestment Amount: $${investment_amount || '100,000'}\nGoals: ${goals || 'Long-term growth with moderate risk'}\n\nProvide specific ETF and stock recommendations with allocation percentages.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Market Sentiment Analysis
router.post('/market-sentiment', auth, async (req, res) => {
  try {
    const { symbols, sector } = req.body;
    const result = await queryOpenRouter(
      'You are a market sentiment analysis AI. Analyze current market conditions, sector trends, and provide sentiment scores. Use clear formatting with markdown headers, bullet points, and tables.',
      `Analyze market sentiment for: ${symbols || 'SPY, QQQ, DIA, IWM'}\nSector focus: ${sector || 'Technology, Healthcare, Finance'}\n\nProvide sentiment scores (bullish/neutral/bearish), key drivers, and short-term outlook.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Tax Optimization
router.post('/tax-optimization', auth, async (req, res) => {
  try {
    const { portfolio_id, tax_bracket, state } = req.body;
    let context = '';
    if (portfolio_id) {
      const holdings = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]);
      context = `Holdings: ${JSON.stringify(holdings.rows)}\n`;
    }
    const result = await queryOpenRouter(
      'You are a tax optimization specialist for investment portfolios. Provide tax-loss harvesting opportunities, tax-efficient strategies, and actionable recommendations. Format with markdown.',
      `${context}Tax Bracket: ${tax_bracket || '32%'}\nState: ${state || 'California'}\n\nProvide tax optimization strategies including tax-loss harvesting, asset location, and tax-efficient withdrawal strategies.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Retirement Planning
router.post('/retirement-planning', auth, async (req, res) => {
  try {
    const { current_age, retirement_age, current_savings, monthly_contribution, risk_tolerance } = req.body;
    const result = await queryOpenRouter(
      'You are a retirement planning AI advisor. Create a comprehensive retirement plan with projections, milestones, and actionable steps. Use markdown formatting with sections.',
      `Current Age: ${current_age || 35}\nTarget Retirement Age: ${retirement_age || 65}\nCurrent Savings: $${current_savings || '250,000'}\nMonthly Contribution: $${monthly_contribution || '2,000'}\nRisk Tolerance: ${risk_tolerance || 'moderate'}\n\nCreate a detailed retirement plan with projections and milestones.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Rebalancing Advisor
router.post('/rebalancing', auth, async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    let context = '';
    if (portfolio_id) {
      const portfolio = await pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]);
      const holdings = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [portfolio_id]);
      context = `Portfolio: ${JSON.stringify(portfolio.rows[0])}\nHoldings: ${JSON.stringify(holdings.rows)}`;
    }
    const result = await queryOpenRouter(
      'You are a portfolio rebalancing AI. Analyze the current allocation vs target allocation and recommend specific trades to rebalance. Format with markdown tables and clear sections.',
      context || 'Analyze a portfolio that has drifted: Current allocation is 70% stocks (target 60%), 20% bonds (target 30%), 10% alternatives (target 10%). Portfolio value: $500,000. Recommend specific rebalancing trades.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Financial Goal Planning
router.post('/goal-planning', auth, async (req, res) => {
  try {
    const { goal_type, target_amount, timeline, current_savings } = req.body;
    const result = await queryOpenRouter(
      'You are a financial goal planning AI. Create a detailed step-by-step plan to achieve the financial goal with specific investment strategies and milestones. Use markdown formatting.',
      `Goal: ${goal_type || 'Buy a home'}\nTarget Amount: $${target_amount || '500,000'}\nTimeline: ${timeline || '5 years'}\nCurrent Savings: $${current_savings || '50,000'}\n\nCreate a detailed plan with monthly savings targets, investment strategy, and milestones.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI ESG Analysis
router.post('/esg-analysis', auth, async (req, res) => {
  try {
    const { symbols, preferences } = req.body;
    const result = await queryOpenRouter(
      'You are an ESG (Environmental, Social, Governance) investment analysis AI. Evaluate investments based on ESG criteria and provide scores and recommendations. Format with markdown.',
      `Analyze ESG scores for: ${symbols || 'AAPL, MSFT, GOOGL, AMZN, TSLA'}\nInvestor preferences: ${preferences || 'Focus on climate impact and corporate governance'}\n\nProvide ESG scores, analysis, and sustainable investment alternatives.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Estate Planning
router.post('/estate-planning', auth, async (req, res) => {
  try {
    const { net_worth, family_situation, goals } = req.body;
    const result = await queryOpenRouter(
      'You are an estate planning AI advisor. Provide comprehensive estate planning strategies including trusts, tax implications, and wealth transfer strategies. Format with markdown.',
      `Net Worth: $${net_worth || '2,000,000'}\nFamily Situation: ${family_situation || 'Married with 2 children'}\nGoals: ${goals || 'Minimize estate taxes, ensure smooth wealth transfer'}\n\nProvide a comprehensive estate planning strategy.`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Client Analysis
router.post('/client-analysis', auth, async (req, res) => {
  try {
    const { client_id } = req.body;
    let context = '';
    if (client_id) {
      const client = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]);
      const portfolios = await pool.query('SELECT * FROM portfolios WHERE client_id = $1', [client_id]);
      const goals = await pool.query('SELECT * FROM financial_goals WHERE client_id = $1', [client_id]);
      context = `Client: ${JSON.stringify(client.rows[0])}\nPortfolios: ${JSON.stringify(portfolios.rows)}\nGoals: ${JSON.stringify(goals.rows)}`;
    } else {
      const clients = await pool.query('SELECT * FROM clients LIMIT 5');
      context = `Client roster sample: ${JSON.stringify(clients.rows)}`;
    }
    const result = await queryOpenRouter(
      'You are an AI wealth management client advisor. Analyze the client profile, their portfolios, and goals. Provide insights on client health, engagement recommendations, cross-sell opportunities, and risk alignment. Format with markdown.',
      context
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Transaction Analysis
router.post('/transaction-analysis', auth, async (req, res) => {
  try {
    const { portfolio_id, period } = req.body;
    let context = '';
    if (portfolio_id) {
      const txns = await pool.query('SELECT * FROM transactions WHERE portfolio_id = $1 ORDER BY transaction_date DESC LIMIT 50', [portfolio_id]);
      context = `Transactions: ${JSON.stringify(txns.rows)}`;
    } else {
      const txns = await pool.query('SELECT * FROM transactions ORDER BY transaction_date DESC LIMIT 30');
      context = `Recent transactions across all portfolios: ${JSON.stringify(txns.rows)}`;
    }
    const result = await queryOpenRouter(
      'You are an AI transaction analysis specialist. Analyze trading patterns, identify unusual activity, evaluate transaction costs, assess timing effectiveness, and flag potential compliance concerns. Provide actionable insights. Format with markdown.',
      `${context}\nAnalysis period: ${period || 'Last 30 days'}`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Asset Class Analysis
router.post('/asset-analysis', auth, async (req, res) => {
  try {
    const assets = await pool.query('SELECT * FROM asset_classes');
    const holdings = await pool.query(`
      SELECT ac.name as asset_class, SUM(ph.shares * ph.current_price) as total_value
      FROM portfolio_holdings ph
      LEFT JOIN asset_classes ac ON ph.asset_class_id = ac.id
      GROUP BY ac.name
    `);
    const result = await queryOpenRouter(
      'You are an AI asset allocation strategist. Analyze the asset class universe and current allocation across all portfolios. Identify overweight/underweight positions, correlation risks, recommend tactical shifts based on market conditions, and suggest new asset classes to consider. Format with markdown.',
      `Asset Classes: ${JSON.stringify(assets.rows)}\nCurrent Allocation: ${JSON.stringify(holdings.rows)}`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Watchlist Analysis
router.post('/watchlist-analysis', auth, async (req, res) => {
  try {
    const watchlist = await pool.query('SELECT * FROM watchlist');
    const result = await queryOpenRouter(
      'You are an AI securities research analyst. Analyze the watchlist securities, evaluate entry points relative to target prices, assess sector concentration, provide buy/hold/pass recommendations for each, and identify missing opportunities. Format with markdown tables and sections.',
      `Watchlist: ${JSON.stringify(watchlist.rows)}`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Alert Analysis
router.post('/alert-analysis', auth, async (req, res) => {
  try {
    const alerts = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    const result = await queryOpenRouter(
      'You are an AI alert management specialist. Analyze the alert history and active alerts. Identify patterns, prioritize by urgency, suggest alert threshold adjustments, flag alert fatigue risks, and recommend new alerts that should be set up. Format with markdown.',
      `Alerts: ${JSON.stringify(alerts.rows)}`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Fee Analysis
router.post('/fee-analysis', auth, async (req, res) => {
  try {
    const fees = await pool.query('SELECT * FROM fees');
    const portfolios = await pool.query('SELECT id, name, total_value FROM portfolios');
    const result = await queryOpenRouter(
      'You are an AI fee optimization specialist. Analyze the fee structure, calculate effective fee rates, compare with industry benchmarks, identify revenue optimization opportunities, and flag any fee compression risks. Format with markdown.',
      `Fees: ${JSON.stringify(fees.rows)}\nPortfolios: ${JSON.stringify(portfolios.rows)}`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Document Analysis
router.post('/document-analysis', auth, async (req, res) => {
  try {
    const docs = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');
    const result = await queryOpenRouter(
      'You are an AI compliance and document management specialist. Analyze the document inventory, identify missing required documents, flag expiring agreements, suggest document workflow improvements, and ensure regulatory compliance. Format with markdown.',
      `Documents: ${JSON.stringify(docs.rows)}`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Performance Analysis
router.post('/performance-analysis', auth, async (req, res) => {
  try {
    const { portfolio_id } = req.body;
    let context = '';
    if (portfolio_id) {
      const perf = await pool.query('SELECT * FROM performance_records WHERE portfolio_id = $1 ORDER BY record_date DESC', [portfolio_id]);
      const portfolio = await pool.query('SELECT * FROM portfolios WHERE id = $1', [portfolio_id]);
      context = `Portfolio: ${JSON.stringify(portfolio.rows[0])}\nPerformance Records: ${JSON.stringify(perf.rows)}`;
    } else {
      const perf = await pool.query('SELECT * FROM performance_records ORDER BY record_date DESC LIMIT 30');
      context = `Recent performance records: ${JSON.stringify(perf.rows)}`;
    }
    const result = await queryOpenRouter(
      'You are an AI performance attribution specialist. Analyze portfolio returns, calculate risk-adjusted metrics (Sharpe, Sortino, Alpha, Beta), compare against benchmarks, identify performance drivers and detractors, and provide forward-looking performance expectations. Format with markdown.',
      context
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
