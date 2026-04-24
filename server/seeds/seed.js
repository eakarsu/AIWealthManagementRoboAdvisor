require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wealth_advisor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop tables if exist
    await client.query(`
      DROP TABLE IF EXISTS performance_records CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS fees CASCADE;
      DROP TABLE IF EXISTS alerts CASCADE;
      DROP TABLE IF EXISTS financial_goals CASCADE;
      DROP TABLE IF EXISTS watchlist CASCADE;
      DROP TABLE IF EXISTS transactions CASCADE;
      DROP TABLE IF EXISTS portfolio_holdings CASCADE;
      DROP TABLE IF EXISTS portfolios CASCADE;
      DROP TABLE IF EXISTS asset_classes CASCADE;
      DROP TABLE IF EXISTS clients CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'advisor',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        risk_tolerance VARCHAR(50) DEFAULT 'moderate',
        investment_horizon VARCHAR(50) DEFAULT 'medium',
        net_worth DECIMAL(15,2) DEFAULT 0,
        annual_income DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE portfolios (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        name VARCHAR(255) NOT NULL,
        strategy VARCHAR(100) DEFAULT 'balanced',
        total_value DECIMAL(15,2) DEFAULT 0,
        cash_balance DECIMAL(15,2) DEFAULT 0,
        risk_level VARCHAR(50) DEFAULT 'moderate',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE portfolio_holdings (
        id SERIAL PRIMARY KEY,
        portfolio_id INTEGER REFERENCES portfolios(id),
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(255),
        shares DECIMAL(15,4) DEFAULT 0,
        avg_cost DECIMAL(15,4) DEFAULT 0,
        current_price DECIMAL(15,4) DEFAULT 0,
        market_value DECIMAL(15,2) DEFAULT 0,
        gain_loss DECIMAL(15,2) DEFAULT 0,
        allocation_pct DECIMAL(5,2) DEFAULT 0
      );

      CREATE TABLE asset_classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        risk_level VARCHAR(50),
        expected_return DECIMAL(5,2),
        description TEXT
      );

      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        portfolio_id INTEGER REFERENCES portfolios(id),
        type VARCHAR(50) NOT NULL,
        symbol VARCHAR(20),
        shares DECIMAL(15,4),
        price DECIMAL(15,4),
        total_amount DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'completed',
        transaction_date TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE watchlist (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(255),
        current_price DECIMAL(15,4),
        target_price DECIMAL(15,4),
        sector VARCHAR(100),
        notes TEXT,
        added_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE financial_goals (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(15,2),
        current_amount DECIMAL(15,2) DEFAULT 0,
        target_date DATE,
        priority VARCHAR(50) DEFAULT 'medium',
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100),
        title VARCHAR(255),
        message TEXT,
        severity VARCHAR(50) DEFAULT 'info',
        symbol VARCHAR(20),
        threshold_value DECIMAL(15,4),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE fees (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        portfolio_id INTEGER REFERENCES portfolios(id),
        fee_type VARCHAR(100) DEFAULT 'management',
        rate DECIMAL(5,4),
        amount DECIMAL(15,2),
        aum_value DECIMAL(15,2),
        billing_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        title VARCHAR(255),
        type VARCHAR(100),
        description TEXT,
        file_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        uploaded_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE performance_records (
        id SERIAL PRIMARY KEY,
        portfolio_id INTEGER REFERENCES portfolios(id),
        record_date DATE,
        total_value DECIMAL(15,2),
        daily_return DECIMAL(8,4),
        cumulative_return DECIMAL(8,4),
        benchmark_return DECIMAL(8,4),
        sharpe_ratio DECIMAL(8,4),
        volatility DECIMAL(8,4)
      );
    `);

    // Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role) VALUES
      ('Admin User', 'admin@wealthadvisor.com', '${passwordHash}', 'admin'),
      ('Sarah Johnson', 'sarah@wealthadvisor.com', '${passwordHash}', 'advisor'),
      ('Michael Chen', 'michael@wealthadvisor.com', '${passwordHash}', 'advisor');
    `);

    // Seed Clients (15+)
    await client.query(`
      INSERT INTO clients (name, email, phone, risk_tolerance, investment_horizon, net_worth, annual_income, status) VALUES
      ('James Wilson', 'james.wilson@email.com', '555-0101', 'aggressive', 'long', 2500000, 350000, 'active'),
      ('Emily Thompson', 'emily.t@email.com', '555-0102', 'moderate', 'medium', 1200000, 180000, 'active'),
      ('Robert Martinez', 'rob.martinez@email.com', '555-0103', 'conservative', 'short', 800000, 120000, 'active'),
      ('Lisa Anderson', 'lisa.a@email.com', '555-0104', 'moderate', 'long', 3500000, 450000, 'active'),
      ('David Kim', 'david.kim@email.com', '555-0105', 'aggressive', 'long', 5000000, 600000, 'active'),
      ('Jennifer Brown', 'jen.brown@email.com', '555-0106', 'moderate', 'medium', 900000, 150000, 'active'),
      ('William Taylor', 'will.taylor@email.com', '555-0107', 'conservative', 'short', 600000, 95000, 'active'),
      ('Amanda Davis', 'amanda.d@email.com', '555-0108', 'aggressive', 'long', 4200000, 520000, 'active'),
      ('Christopher Lee', 'chris.lee@email.com', '555-0109', 'moderate', 'medium', 1800000, 230000, 'active'),
      ('Jessica White', 'jessica.w@email.com', '555-0110', 'moderate', 'long', 1500000, 200000, 'active'),
      ('Daniel Garcia', 'daniel.g@email.com', '555-0111', 'aggressive', 'long', 7500000, 800000, 'active'),
      ('Michelle Robinson', 'michelle.r@email.com', '555-0112', 'conservative', 'medium', 450000, 85000, 'active'),
      ('Thomas Clark', 'thomas.c@email.com', '555-0113', 'moderate', 'long', 2100000, 280000, 'active'),
      ('Sarah Mitchell', 'sarah.m@email.com', '555-0114', 'aggressive', 'medium', 3200000, 400000, 'active'),
      ('Kevin Wright', 'kevin.w@email.com', '555-0115', 'moderate', 'long', 1100000, 160000, 'active'),
      ('Rachel Adams', 'rachel.a@email.com', '555-0116', 'conservative', 'short', 350000, 72000, 'inactive');
    `);

    // Seed Portfolios (15+)
    await client.query(`
      INSERT INTO portfolios (client_id, name, strategy, total_value, cash_balance, risk_level) VALUES
      (1, 'Growth Aggressive Fund', 'aggressive_growth', 1250000, 50000, 'high'),
      (1, 'Retirement Account', 'balanced', 750000, 25000, 'moderate'),
      (2, 'Balanced Growth Portfolio', 'balanced', 600000, 30000, 'moderate'),
      (3, 'Income Conservative Fund', 'income', 500000, 40000, 'low'),
      (4, 'Long-Term Growth', 'growth', 2000000, 100000, 'moderate'),
      (5, 'Ultra Growth Portfolio', 'aggressive_growth', 3000000, 150000, 'high'),
      (5, 'Tax-Advantaged Account', 'tax_efficient', 1200000, 60000, 'moderate'),
      (6, 'Moderate Growth', 'balanced', 450000, 20000, 'moderate'),
      (7, 'Capital Preservation', 'income', 400000, 50000, 'low'),
      (8, 'Aggressive Tech Fund', 'sector', 2500000, 100000, 'high'),
      (9, 'Diversified Core', 'balanced', 900000, 45000, 'moderate'),
      (10, 'ESG Sustainable Fund', 'esg', 800000, 35000, 'moderate'),
      (11, 'Private Equity Blend', 'alternative', 5000000, 250000, 'high'),
      (12, 'Conservative Income', 'income', 300000, 30000, 'low'),
      (13, 'Multi-Strategy Fund', 'balanced', 1200000, 60000, 'moderate'),
      (14, 'High Conviction Growth', 'growth', 1800000, 80000, 'high');
    `);

    // Seed Portfolio Holdings (15+ per portfolio, sampling first few)
    await client.query(`
      INSERT INTO portfolio_holdings (portfolio_id, symbol, name, shares, avg_cost, current_price, market_value, gain_loss, allocation_pct) VALUES
      (1, 'AAPL', 'Apple Inc.', 500, 145.50, 178.25, 89125, 16375, 7.13),
      (1, 'NVDA', 'NVIDIA Corp.', 200, 450.00, 875.50, 175100, 85100, 14.01),
      (1, 'MSFT', 'Microsoft Corp.', 300, 310.00, 378.90, 113670, 20670, 9.09),
      (1, 'AMZN', 'Amazon.com', 150, 135.00, 178.50, 26775, 6525, 2.14),
      (1, 'GOOGL', 'Alphabet Inc.', 400, 120.00, 141.80, 56720, 8720, 4.54),
      (1, 'META', 'Meta Platforms', 250, 280.00, 505.75, 126437.50, 56437.50, 10.11),
      (1, 'TSLA', 'Tesla Inc.', 300, 200.00, 245.30, 73590, 13590, 5.89),
      (1, 'AMD', 'Advanced Micro Devices', 400, 110.00, 158.40, 63360, 19360, 5.07),
      (1, 'CRM', 'Salesforce Inc.', 200, 210.00, 265.80, 53160, 11160, 4.25),
      (1, 'NFLX', 'Netflix Inc.', 150, 400.00, 628.50, 94275, 34275, 7.54),
      (1, 'V', 'Visa Inc.', 250, 230.00, 278.40, 69600, 12100, 5.57),
      (1, 'JPM', 'JPMorgan Chase', 300, 145.00, 198.20, 59460, 15960, 4.76),
      (1, 'UNH', 'UnitedHealth Group', 100, 480.00, 528.90, 52890, 4890, 4.23),
      (1, 'LLY', 'Eli Lilly & Co.', 80, 550.00, 795.50, 63640, 19640, 5.09),
      (1, 'AVGO', 'Broadcom Inc.', 60, 800.00, 1285.00, 77100, 29100, 6.17),
      (3, 'VTI', 'Vanguard Total Stock', 500, 210.00, 238.50, 119250, 14250, 19.88),
      (3, 'BND', 'Vanguard Total Bond', 800, 72.00, 69.80, 55840, -1760, 9.31),
      (3, 'VEA', 'Vanguard FTSE Developed', 600, 45.00, 48.20, 28920, 1920, 4.82),
      (3, 'VWO', 'Vanguard FTSE Emerging', 400, 40.00, 42.50, 17000, 1000, 2.83),
      (3, 'SCHD', 'Schwab US Dividend', 300, 72.00, 78.40, 23520, 1920, 3.92),
      (3, 'QQQ', 'Invesco QQQ Trust', 200, 350.00, 438.50, 87700, 17700, 14.62),
      (3, 'AGG', 'iShares Core US Aggregate', 500, 98.00, 95.20, 47600, -1400, 7.93),
      (3, 'VIG', 'Vanguard Dividend Appreciation', 250, 160.00, 175.30, 43825, 3825, 7.30),
      (3, 'VXUS', 'Vanguard Total International', 400, 55.00, 57.80, 23120, 1120, 3.85),
      (3, 'TIP', 'iShares TIPS Bond', 300, 108.00, 105.50, 31650, -750, 5.28),
      (3, 'IWM', 'iShares Russell 2000', 150, 185.00, 198.60, 29790, 2040, 4.97),
      (3, 'XLF', 'Financial Select SPDR', 200, 36.00, 40.80, 8160, 960, 1.36),
      (3, 'XLV', 'Health Care Select SPDR', 180, 130.00, 142.50, 25650, 2250, 4.28),
      (3, 'GLD', 'SPDR Gold Shares', 100, 180.00, 215.80, 21580, 3580, 3.60),
      (3, 'VNQ', 'Vanguard Real Estate', 200, 82.00, 86.40, 17280, 880, 2.88);
    `);

    // Seed Asset Classes (15+)
    await client.query(`
      INSERT INTO asset_classes (name, category, risk_level, expected_return, description) VALUES
      ('US Large Cap Stocks', 'Equity', 'moderate', 10.50, 'S&P 500 and large-cap domestic equities'),
      ('US Mid Cap Stocks', 'Equity', 'moderate-high', 11.20, 'Mid-capitalization domestic equities'),
      ('US Small Cap Stocks', 'Equity', 'high', 12.00, 'Small-capitalization domestic equities with higher growth potential'),
      ('International Developed', 'Equity', 'moderate', 8.50, 'Developed market international equities'),
      ('Emerging Markets', 'Equity', 'high', 11.00, 'Emerging market equities with higher growth and volatility'),
      ('US Government Bonds', 'Fixed Income', 'low', 3.50, 'US Treasury bonds and government securities'),
      ('Corporate Investment Grade', 'Fixed Income', 'low-moderate', 5.00, 'Investment grade corporate bonds'),
      ('High Yield Bonds', 'Fixed Income', 'moderate', 7.00, 'Below investment grade corporate bonds'),
      ('Municipal Bonds', 'Fixed Income', 'low', 3.80, 'Tax-exempt municipal bonds'),
      ('TIPS', 'Fixed Income', 'low', 4.00, 'Treasury Inflation-Protected Securities'),
      ('Real Estate (REITs)', 'Alternative', 'moderate', 9.00, 'Real Estate Investment Trusts'),
      ('Commodities', 'Alternative', 'high', 7.50, 'Physical commodities and commodity futures'),
      ('Private Equity', 'Alternative', 'very-high', 15.00, 'Private equity and venture capital investments'),
      ('Hedge Funds', 'Alternative', 'high', 8.00, 'Hedge fund strategies and absolute return'),
      ('Gold & Precious Metals', 'Alternative', 'moderate', 5.50, 'Gold, silver, and precious metals as inflation hedge'),
      ('Cryptocurrency', 'Alternative', 'very-high', 20.00, 'Digital assets including Bitcoin and Ethereum'),
      ('Infrastructure', 'Alternative', 'moderate', 8.50, 'Infrastructure investments and funds');
    `);

    // Seed Transactions (15+)
    await client.query(`
      INSERT INTO transactions (portfolio_id, type, symbol, shares, price, total_amount, status, transaction_date) VALUES
      (1, 'buy', 'AAPL', 100, 145.50, 14550.00, 'completed', '2024-01-15'),
      (1, 'buy', 'NVDA', 50, 450.00, 22500.00, 'completed', '2024-01-20'),
      (1, 'sell', 'TSLA', 25, 240.00, 6000.00, 'completed', '2024-02-05'),
      (1, 'buy', 'MSFT', 75, 310.00, 23250.00, 'completed', '2024-02-12'),
      (3, 'buy', 'VTI', 200, 210.00, 42000.00, 'completed', '2024-02-20'),
      (3, 'buy', 'BND', 300, 72.00, 21600.00, 'completed', '2024-03-01'),
      (5, 'buy', 'GOOGL', 150, 140.00, 21000.00, 'completed', '2024-03-10'),
      (6, 'buy', 'AMZN', 100, 175.00, 17500.00, 'completed', '2024-03-15'),
      (1, 'dividend', 'AAPL', 0, 0, 485.00, 'completed', '2024-03-20'),
      (1, 'buy', 'META', 50, 480.00, 24000.00, 'completed', '2024-04-01'),
      (3, 'sell', 'QQQ', 50, 430.00, 21500.00, 'completed', '2024-04-10'),
      (10, 'buy', 'CRM', 80, 260.00, 20800.00, 'completed', '2024-04-15'),
      (5, 'buy', 'LLY', 30, 720.00, 21600.00, 'completed', '2024-04-20'),
      (1, 'sell', 'AMD', 50, 155.00, 7750.00, 'completed', '2024-05-01'),
      (3, 'buy', 'SCHD', 100, 74.00, 7400.00, 'completed', '2024-05-10'),
      (6, 'buy', 'V', 60, 275.00, 16500.00, 'completed', '2024-05-15'),
      (1, 'buy', 'AVGO', 20, 1200.00, 24000.00, 'completed', '2024-05-20');
    `);

    // Seed Watchlist (15+)
    await client.query(`
      INSERT INTO watchlist (symbol, name, current_price, target_price, sector, notes) VALUES
      ('PLTR', 'Palantir Technologies', 24.50, 30.00, 'Technology', 'AI/ML play, government contracts growing'),
      ('SNOW', 'Snowflake Inc.', 165.00, 200.00, 'Technology', 'Cloud data warehouse leader'),
      ('UBER', 'Uber Technologies', 72.50, 85.00, 'Transportation', 'Profitable, ride-share and delivery moat'),
      ('ARM', 'ARM Holdings', 140.00, 180.00, 'Semiconductors', 'AI chip architecture monopoly'),
      ('PANW', 'Palo Alto Networks', 310.00, 380.00, 'Cybersecurity', 'Platform consolidation play'),
      ('COIN', 'Coinbase Global', 225.00, 280.00, 'Fintech', 'Crypto exchange leader, regulatory clarity coming'),
      ('ABNB', 'Airbnb Inc.', 155.00, 185.00, 'Travel', 'Travel recovery, asset-light model'),
      ('DDOG', 'Datadog Inc.', 125.00, 150.00, 'Technology', 'Observability platform, strong growth'),
      ('NET', 'Cloudflare Inc.', 88.00, 110.00, 'Technology', 'CDN and security, expanding TAM'),
      ('CRWD', 'CrowdStrike Holdings', 320.00, 400.00, 'Cybersecurity', 'Endpoint security leader'),
      ('SQ', 'Block Inc.', 72.00, 90.00, 'Fintech', 'Fintech ecosystem, Cash App growth'),
      ('SHOP', 'Shopify Inc.', 68.00, 85.00, 'E-Commerce', 'E-commerce infrastructure leader'),
      ('ZS', 'Zscaler Inc.', 210.00, 260.00, 'Cybersecurity', 'Zero trust security model'),
      ('MDB', 'MongoDB Inc.', 280.00, 340.00, 'Technology', 'NoSQL database leader'),
      ('SOFI', 'SoFi Technologies', 9.50, 15.00, 'Fintech', 'Digital banking + lending + investing'),
      ('RIVN', 'Rivian Automotive', 12.00, 20.00, 'Automotive', 'EV trucks, Amazon partnership');
    `);

    // Seed Financial Goals (15+)
    await client.query(`
      INSERT INTO financial_goals (client_id, name, target_amount, current_amount, target_date, priority, category, status) VALUES
      (1, 'Early Retirement at 55', 5000000, 2500000, '2035-06-01', 'high', 'retirement', 'in_progress'),
      (1, 'Childrens College Fund', 500000, 180000, '2032-09-01', 'high', 'education', 'in_progress'),
      (2, 'Buy Vacation Home', 800000, 200000, '2028-12-01', 'medium', 'real_estate', 'in_progress'),
      (3, 'Emergency Fund', 100000, 85000, '2025-06-01', 'high', 'emergency', 'in_progress'),
      (4, 'Start Foundation', 1000000, 450000, '2030-01-01', 'medium', 'philanthropy', 'in_progress'),
      (5, 'Private Island Purchase', 10000000, 5000000, '2035-01-01', 'low', 'lifestyle', 'in_progress'),
      (6, 'Pay Off Mortgage', 350000, 150000, '2030-06-01', 'high', 'debt', 'in_progress'),
      (7, 'Build Emergency Fund', 50000, 35000, '2025-12-01', 'high', 'emergency', 'in_progress'),
      (8, 'Launch Tech Startup', 2000000, 800000, '2027-03-01', 'medium', 'business', 'in_progress'),
      (9, 'World Travel Fund', 200000, 60000, '2028-01-01', 'low', 'lifestyle', 'in_progress'),
      (10, 'Retire at 60', 3000000, 1500000, '2040-01-01', 'high', 'retirement', 'in_progress'),
      (11, 'Art Collection Fund', 500000, 350000, '2026-06-01', 'low', 'lifestyle', 'in_progress'),
      (12, 'New Car Fund', 60000, 25000, '2025-09-01', 'medium', 'lifestyle', 'in_progress'),
      (13, 'Kids Education Fund', 400000, 120000, '2033-09-01', 'high', 'education', 'in_progress'),
      (14, 'Real Estate Portfolio', 5000000, 3200000, '2030-01-01', 'high', 'real_estate', 'in_progress'),
      (15, 'Wedding Fund', 75000, 30000, '2026-06-01', 'medium', 'lifestyle', 'in_progress');
    `);

    // Seed Alerts (15+)
    await client.query(`
      INSERT INTO alerts (type, title, message, severity, symbol, threshold_value, status) VALUES
      ('price_alert', 'NVDA Price Surge', 'NVIDIA has exceeded $850 target price', 'warning', 'NVDA', 850.00, 'active'),
      ('rebalance', 'Portfolio Drift Detected', 'Portfolio 1 has drifted 5% from target allocation', 'warning', NULL, 5.00, 'active'),
      ('dividend', 'AAPL Dividend Payment', 'Apple quarterly dividend of $0.96/share declared', 'info', 'AAPL', 0.96, 'active'),
      ('risk', 'High Volatility Alert', 'VIX has exceeded 25, indicating increased market volatility', 'critical', 'VIX', 25.00, 'active'),
      ('performance', 'Portfolio Outperformance', 'Portfolio 5 has outperformed S&P 500 by 8% YTD', 'info', 'SPY', 8.00, 'active'),
      ('price_alert', 'TSLA Below Support', 'Tesla has dropped below $200 support level', 'critical', 'TSLA', 200.00, 'active'),
      ('fee', 'Quarterly Fee Due', 'Q2 management fees ready for billing - $12,500', 'info', NULL, 12500.00, 'active'),
      ('compliance', 'KYC Update Required', 'Client James Wilson KYC documents expire in 30 days', 'warning', NULL, 30.00, 'active'),
      ('market', 'Fed Rate Decision', 'Federal Reserve meeting scheduled - potential rate change', 'info', NULL, NULL, 'active'),
      ('price_alert', 'META New High', 'Meta Platforms reached new 52-week high of $510', 'info', 'META', 510.00, 'active'),
      ('risk', 'Concentration Risk', 'Portfolio 10 has >30% in single sector (Technology)', 'warning', NULL, 30.00, 'active'),
      ('rebalance', 'Tax-Loss Harvesting Opportunity', 'AMD position showing $5,000 unrealized loss - harvest opportunity', 'info', 'AMD', -5000.00, 'active'),
      ('performance', 'Benchmark Underperformance', 'Portfolio 4 trailing benchmark by 3% over 6 months', 'warning', NULL, -3.00, 'active'),
      ('dividend', 'Dividend Reinvestment', 'SCHD dividend of $1,840 ready for reinvestment', 'info', 'SCHD', 1840.00, 'active'),
      ('market', 'Earnings Season Alert', 'Major tech earnings this week: AAPL, MSFT, GOOGL, META', 'info', NULL, NULL, 'active'),
      ('compliance', 'Suitability Review', 'Annual suitability review due for 5 client accounts', 'warning', NULL, 5.00, 'active');
    `);

    // Seed Fees (15+)
    await client.query(`
      INSERT INTO fees (client_id, portfolio_id, fee_type, rate, amount, aum_value, billing_date, status) VALUES
      (1, 1, 'management', 0.0075, 9375.00, 1250000, '2024-03-31', 'paid'),
      (1, 2, 'management', 0.0060, 4500.00, 750000, '2024-03-31', 'paid'),
      (2, 3, 'management', 0.0075, 4500.00, 600000, '2024-03-31', 'paid'),
      (3, 4, 'management', 0.0050, 2500.00, 500000, '2024-03-31', 'paid'),
      (4, 5, 'management', 0.0075, 15000.00, 2000000, '2024-03-31', 'paid'),
      (5, 6, 'management', 0.0100, 30000.00, 3000000, '2024-03-31', 'paid'),
      (5, 7, 'management', 0.0060, 7200.00, 1200000, '2024-03-31', 'paid'),
      (1, 1, 'performance', 0.0200, 25000.00, 1250000, '2024-03-31', 'paid'),
      (6, 8, 'management', 0.0075, 3375.00, 450000, '2024-06-30', 'pending'),
      (7, 9, 'management', 0.0050, 2000.00, 400000, '2024-06-30', 'pending'),
      (8, 10, 'management', 0.0100, 25000.00, 2500000, '2024-06-30', 'pending'),
      (9, 11, 'management', 0.0075, 6750.00, 900000, '2024-06-30', 'pending'),
      (10, 12, 'management', 0.0075, 6000.00, 800000, '2024-06-30', 'pending'),
      (11, 13, 'management', 0.0100, 50000.00, 5000000, '2024-06-30', 'pending'),
      (12, 14, 'management', 0.0050, 1500.00, 300000, '2024-06-30', 'pending'),
      (13, 15, 'management', 0.0075, 9000.00, 1200000, '2024-06-30', 'pending');
    `);

    // Seed Documents (15+)
    await client.query(`
      INSERT INTO documents (client_id, title, type, description, file_url, status) VALUES
      (1, 'Investment Policy Statement', 'ips', 'Annual IPS for James Wilson', '/docs/wilson_ips_2024.pdf', 'active'),
      (1, 'KYC Documentation', 'kyc', 'Know Your Customer verification documents', '/docs/wilson_kyc.pdf', 'active'),
      (2, 'Portfolio Review Q1 2024', 'review', 'Quarterly portfolio performance review', '/docs/thompson_q1_review.pdf', 'active'),
      (3, 'Risk Assessment Report', 'assessment', 'Comprehensive risk tolerance assessment', '/docs/martinez_risk.pdf', 'active'),
      (4, 'Tax Planning Report', 'tax', 'Annual tax optimization strategy document', '/docs/anderson_tax_2024.pdf', 'active'),
      (5, 'Estate Planning Summary', 'estate', 'Estate plan overview and beneficiary details', '/docs/kim_estate.pdf', 'active'),
      (6, 'Financial Plan 2024', 'plan', 'Comprehensive financial plan and projections', '/docs/brown_plan_2024.pdf', 'active'),
      (7, 'Insurance Review', 'insurance', 'Life and disability insurance coverage review', '/docs/taylor_insurance.pdf', 'active'),
      (8, 'Business Succession Plan', 'succession', 'Business ownership transition plan', '/docs/davis_succession.pdf', 'active'),
      (9, 'Retirement Projection', 'retirement', 'Monte Carlo retirement projection analysis', '/docs/lee_retirement.pdf', 'active'),
      (10, 'ESG Investment Report', 'esg', 'ESG screening and sustainable investment report', '/docs/white_esg.pdf', 'active'),
      (11, 'Private Equity Agreement', 'agreement', 'PE fund subscription agreement', '/docs/garcia_pe_agreement.pdf', 'active'),
      (12, 'Budget Worksheet', 'budget', 'Monthly income and expense tracking', '/docs/robinson_budget.pdf', 'active'),
      (13, 'Education Savings Plan', 'education', '529 plan details and projections', '/docs/clark_529_plan.pdf', 'active'),
      (14, 'Stock Option Analysis', 'options', 'Employee stock option exercise strategy', '/docs/mitchell_options.pdf', 'active'),
      (15, 'Debt Payoff Plan', 'debt', 'Student loan and mortgage payoff strategy', '/docs/wright_debt_plan.pdf', 'active');
    `);

    // Seed Performance Records (15+)
    await client.query(`
      INSERT INTO performance_records (portfolio_id, record_date, total_value, daily_return, cumulative_return, benchmark_return, sharpe_ratio, volatility) VALUES
      (1, '2024-01-31', 1150000, 0.0125, 0.0850, 0.0720, 1.45, 0.1520),
      (1, '2024-02-29', 1195000, 0.0085, 0.1210, 0.0980, 1.52, 0.1480),
      (1, '2024-03-31', 1250000, 0.0145, 0.1650, 0.1250, 1.58, 0.1450),
      (3, '2024-01-31', 565000, 0.0065, 0.0420, 0.0380, 1.12, 0.0920),
      (3, '2024-02-29', 580000, 0.0055, 0.0680, 0.0580, 1.18, 0.0890),
      (3, '2024-03-31', 600000, 0.0075, 0.0950, 0.0780, 1.25, 0.0870),
      (5, '2024-01-31', 1850000, 0.0095, 0.0650, 0.0720, 1.05, 0.1280),
      (5, '2024-02-29', 1920000, 0.0110, 0.1020, 0.0980, 1.15, 0.1250),
      (5, '2024-03-31', 2000000, 0.0135, 0.1450, 0.1250, 1.28, 0.1220),
      (6, '2024-01-31', 2750000, 0.0180, 0.1200, 0.0720, 1.85, 0.1850),
      (6, '2024-02-29', 2850000, 0.0150, 0.1650, 0.0980, 1.92, 0.1820),
      (6, '2024-03-31', 3000000, 0.0200, 0.2100, 0.1250, 2.05, 0.1800),
      (11, '2024-01-31', 860000, 0.0070, 0.0520, 0.0380, 1.20, 0.0980),
      (11, '2024-02-29', 880000, 0.0060, 0.0780, 0.0580, 1.25, 0.0960),
      (11, '2024-03-31', 900000, 0.0080, 0.1050, 0.0780, 1.32, 0.0940),
      (12, '2024-03-31', 800000, 0.0065, 0.0820, 0.0780, 1.15, 0.0850);
    `);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
    console.log('📧 Login: admin@wealthadvisor.com / password123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
