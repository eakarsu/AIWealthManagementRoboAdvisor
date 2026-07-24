require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') throw new Error('ALLOW_DESTRUCTIVE_SEED=true is required');
if (!process.env.DATABASE_URL || !process.env.SEED_ADMIN_PASSWORD) {
  throw new Error('DATABASE_URL and SEED_ADMIN_PASSWORD are required');
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop tables if exist
    await client.query(`
      DROP TABLE IF EXISTS performance_records CASCADE;
      DROP TABLE IF EXISTS client_messages CASCADE;
      DROP TABLE IF EXISTS model_portfolios CASCADE;
      DROP TABLE IF EXISTS advisor_tasks CASCADE;
      DROP TABLE IF EXISTS insurance_plans CASCADE;
      DROP TABLE IF EXISTS cash_flow_plans CASCADE;
      DROP TABLE IF EXISTS tax_packages CASCADE;
      DROP TABLE IF EXISTS compliance_reviews CASCADE;
      DROP TABLE IF EXISTS meeting_notes CASCADE;
      DROP TABLE IF EXISTS investment_policies CASCADE;
      DROP TABLE IF EXISTS custodian_accounts CASCADE;
      DROP TABLE IF EXISTS trust_beneficiaries CASCADE;
      DROP TABLE IF EXISTS households CASCADE;
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

      CREATE TABLE households (
        id SERIAL PRIMARY KEY,
        household_name VARCHAR(255) NOT NULL,
        primary_client_id INTEGER REFERENCES clients(id),
        relationship_manager VARCHAR(255),
        total_net_worth DECIMAL(15,2) DEFAULT 0,
        annual_income DECIMAL(15,2) DEFAULT 0,
        risk_profile VARCHAR(50) DEFAULT 'moderate',
        planning_stage VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE trust_beneficiaries (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        trust_name VARCHAR(255),
        beneficiary_name VARCHAR(255),
        relationship VARCHAR(100),
        beneficiary_type VARCHAR(100),
        distribution_terms TEXT,
        current_value DECIMAL(15,2) DEFAULT 0,
        next_review_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE custodian_accounts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        custodian_name VARCHAR(255),
        account_number VARCHAR(100),
        account_type VARCHAR(100),
        sync_status VARCHAR(50) DEFAULT 'connected',
        last_sync_at TIMESTAMP,
        market_value DECIMAL(15,2) DEFAULT 0,
        cash_value DECIMAL(15,2) DEFAULT 0,
        external_owner VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE investment_policies (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        portfolio_id INTEGER REFERENCES portfolios(id),
        policy_name VARCHAR(255),
        objective TEXT,
        target_allocation TEXT,
        constraints TEXT,
        review_frequency VARCHAR(100),
        next_review_date DATE,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE meeting_notes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        meeting_date DATE,
        meeting_type VARCHAR(100),
        advisor VARCHAR(255),
        summary TEXT,
        follow_up_items TEXT,
        next_meeting_date DATE,
        sentiment VARCHAR(50),
        status VARCHAR(50) DEFAULT 'open',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE compliance_reviews (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        review_type VARCHAR(120),
        regulation VARCHAR(120),
        reviewer VARCHAR(255),
        due_date DATE,
        completed_date DATE,
        risk_level VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        findings TEXT,
        remediation_plan TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE tax_packages (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        tax_year INTEGER,
        package_type VARCHAR(120),
        forms_included TEXT,
        delivery_method VARCHAR(100),
        prepared_by VARCHAR(255),
        review_status VARCHAR(80),
        delivered_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE cash_flow_plans (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        plan_name VARCHAR(255),
        monthly_income DECIMAL(15,2) DEFAULT 0,
        monthly_expenses DECIMAL(15,2) DEFAULT 0,
        withdrawal_rate DECIMAL(6,3) DEFAULT 0,
        liquidity_months DECIMAL(8,2) DEFAULT 0,
        strategy TEXT,
        next_review_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE insurance_plans (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        policy_type VARCHAR(120),
        carrier VARCHAR(255),
        coverage_amount DECIMAL(15,2) DEFAULT 0,
        premium_amount DECIMAL(15,2) DEFAULT 0,
        beneficiary VARCHAR(255),
        renewal_date DATE,
        gap_assessment TEXT,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE advisor_tasks (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        assigned_to VARCHAR(255),
        task_type VARCHAR(120),
        title VARCHAR(255),
        priority VARCHAR(50),
        due_date DATE,
        completed_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'open',
        description TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE model_portfolios (
        id SERIAL PRIMARY KEY,
        model_name VARCHAR(255),
        risk_level VARCHAR(50),
        objective TEXT,
        target_allocation TEXT,
        minimum_account_size DECIMAL(15,2) DEFAULT 0,
        rebalance_frequency VARCHAR(100),
        benchmark VARCHAR(120),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE client_messages (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        sender VARCHAR(255),
        recipient VARCHAR(255),
        subject VARCHAR(255),
        message_body TEXT,
        channel VARCHAR(100),
        priority VARCHAR(50),
        read_status VARCHAR(50) DEFAULT 'unread',
        sent_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed Users
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role) VALUES
      ('Admin User', $2, $1, 'admin'),
      ('Sarah Johnson', 'sarah@wealthadvisor.com', $1, 'advisor'),
      ('Michael Chen', 'michael@wealthadvisor.com', $1, 'advisor');
    `, [passwordHash, process.env.SEED_ADMIN_EMAIL || 'admin@wealthadvisor.com']);

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

    // Seed feature expansion modules (15 each)
    const clientNames = [
      'James Wilson', 'Emily Thompson', 'Robert Martinez', 'Lisa Anderson', 'David Kim',
      'Jennifer Brown', 'William Taylor', 'Amanda Davis', 'Christopher Lee', 'Jessica White',
      'Daniel Garcia', 'Michelle Robinson', 'Thomas Clark', 'Sarah Mitchell', 'Kevin Wright'
    ];
    const advisors = ['Sarah Johnson', 'Michael Chen', 'Admin User'];
    const custodians = ['Schwab', 'Fidelity', 'Pershing', 'TD Ameritrade', 'Interactive Brokers'];

    for (let i = 0; i < 15; i++) {
      const clientId = i + 1;
      const portfolioId = (i % 16) + 1;
      const advisor = advisors[i % advisors.length];
      const dueDay = String(5 + (i % 20)).padStart(2, '0');
      const month = String(1 + (i % 9)).padStart(2, '0');
      const clientName = clientNames[i];

      await client.query(
        `INSERT INTO households
          (household_name, primary_client_id, relationship_manager, total_net_worth, annual_income, risk_profile, planning_stage, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          `${clientName} Household`,
          clientId,
          advisor,
          650000 + i * 475000,
          90000 + i * 42000,
          ['conservative','moderate','aggressive'][i % 3],
          ['onboarding','planning','implementation','annual_review','next_gen_transfer'][i % 5],
          i === 14 ? 'review' : 'active',
          `Household record links family goals, relationship map, and planning scope for ${clientName}.`
        ]
      );

      await client.query(
        `INSERT INTO trust_beneficiaries
          (client_id, trust_name, beneficiary_name, relationship, beneficiary_type, distribution_terms, current_value, next_review_date, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          `${clientName} Family Trust`,
          [`${clientName} Jr.`, `${clientName} Spouse`, `${clientName} Foundation`][i % 3],
          ['child','spouse','charity','grandchild','sibling'][i % 5],
          ['primary','contingent','charitable','trustee'][i % 4],
          ['HEMS standard', 'Age 30/35 staged distribution', 'Annual discretionary distribution', 'Education and medical only'][i % 4],
          250000 + i * 95000,
          `2026-${month}-${dueDay}`,
          ['active','needs_review','draft','inactive'][i % 4],
          `Beneficiary workflow tracks trust terms, review dates, and estate planning updates.`
        ]
      );

      await client.query(
        `INSERT INTO custodian_accounts
          (client_id, custodian_name, account_number, account_type, sync_status, last_sync_at, market_value, cash_value, external_owner, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          custodians[i % custodians.length],
          `EXT-${String(100000 + i * 137).padStart(6, '0')}`,
          ['taxable','ira','roth_ira','trust','joint','401k'][i % 6],
          ['connected','needs_reauth','syncing','error'][i % 4],
          `2026-${month}-${dueDay} 09:00:00`,
          300000 + i * 225000,
          15000 + i * 5250,
          clientName,
          `External account aggregation record for holdings, balances, and sync status.`
        ]
      );

      await client.query(
        `INSERT INTO investment_policies
          (client_id, portfolio_id, policy_name, objective, target_allocation, constraints, review_frequency, next_review_date, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          portfolioId,
          `${clientName} IPS ${2025 + (i % 2)}`,
          ['Capital preservation with income', 'Balanced growth and downside control', 'Long-term growth with tax efficiency', 'Multi-generational wealth transfer'][i % 4],
          ['60% equity / 35% fixed income / 5% cash', '75% equity / 15% fixed income / 10% alternatives', '40% equity / 50% fixed income / 10% cash'][i % 3],
          ['No private funds', 'ESG preference', 'Municipal bond preference', 'Single-stock concentration cap 15%'][i % 4],
          ['quarterly','semiannual','annual'][i % 3],
          `2026-${month}-${dueDay}`,
          ['draft','approved','review_due','archived'][i % 4],
          `IPS governs suitability, allocation bands, liquidity needs, and restrictions.`
        ]
      );

      await client.query(
        `INSERT INTO meeting_notes
          (client_id, meeting_date, meeting_type, advisor, summary, follow_up_items, next_meeting_date, sentiment, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          `2026-${month}-${dueDay}`,
          ['annual_review','portfolio_review','tax_planning','estate_review','prospect_call'][i % 5],
          advisor,
          `Reviewed portfolio positioning, liquidity needs, tax planning items, and family priorities for ${clientName}.`,
          ['Send IPS update', 'Coordinate CPA package', 'Schedule estate attorney review', 'Prepare proposal deck'][i % 4],
          `2026-${String(2 + (i % 9)).padStart(2, '0')}-${dueDay}`,
          ['positive','neutral','concerned','highly_engaged'][i % 4],
          ['open','completed','waiting_on_client','advisor_follow_up'][i % 4],
          `CRM note preserves client context and next steps.`
        ]
      );

      await client.query(
        `INSERT INTO compliance_reviews
          (client_id, review_type, regulation, reviewer, due_date, completed_date, risk_level, status, findings, remediation_plan)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          ['Reg BI review','ADV delivery','Suitability review','KYC refresh','Marketing review'][i % 5],
          ['Reg BI','Form ADV','FINRA 2111','KYC/AML','SEC Marketing Rule'][i % 5],
          advisor,
          `2026-${month}-${dueDay}`,
          i % 4 === 0 ? `2026-${month}-${String(Number(dueDay) + 2).padStart(2, '0')}` : null,
          ['low','medium','high','critical'][i % 4],
          ['pending','in_review','approved','remediation_required'][i % 4],
          `Review checks disclosure delivery, recommendation rationale, documentation completeness, and suitability evidence.`,
          `Collect missing evidence and document advisor rationale where needed.`
        ]
      );

      await client.query(
        `INSERT INTO tax_packages
          (client_id, tax_year, package_type, forms_included, delivery_method, prepared_by, review_status, delivered_at, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          2025,
          ['annual_tax_packet','1099_package','k1_package','realized_gain_loss','cpa_package'][i % 5],
          ['1099-B, 1099-DIV, realized gain/loss report', 'K-1 package and capital account summary', 'Tax summary, charitable gifts, estimated tax worksheet'][i % 3],
          ['client_portal','secure_email','cpa_delivery'][i % 3],
          advisor,
          ['not_started','prepared','in_review','approved','correction_needed'][i % 5],
          i % 3 === 0 ? `2026-02-${dueDay} 14:00:00` : null,
          ['draft','ready','delivered','corrected'][i % 4],
          `Annual tax document package tracks form inventory, CPA delivery, review status, and corrections.`
        ]
      );

      await client.query(
        `INSERT INTO cash_flow_plans
          (client_id, plan_name, monthly_income, monthly_expenses, withdrawal_rate, liquidity_months, strategy, next_review_date, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          `${clientName} Cash Flow Plan`,
          8500 + i * 1250,
          5200 + i * 900,
          2.5 + (i % 5) * 0.35,
          6 + (i % 18),
          ['Bucket strategy with cash reserve', 'Systematic monthly withdrawal', 'Dividend income priority', 'Tax-sensitive liquidation order'][i % 4],
          `2026-${month}-${dueDay}`,
          ['active','review_due','draft','paused'][i % 4],
          `Cash-flow workflow models income, expenses, withdrawal strategy, and liquidity runway.`
        ]
      );

      await client.query(
        `INSERT INTO insurance_plans
          (client_id, policy_type, carrier, coverage_amount, premium_amount, beneficiary, renewal_date, gap_assessment, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          ['term_life','whole_life','disability','umbrella','long_term_care'][i % 5],
          ['Northwestern Mutual','MassMutual','Guardian','Chubb','New York Life'][i % 5],
          500000 + i * 175000,
          1200 + i * 375,
          [`${clientName} Spouse`, `${clientName} Trust`, `${clientName} Children`][i % 3],
          `2026-${month}-${dueDay}`,
          ['Adequate coverage', 'Coverage gap for income replacement', 'Beneficiary update recommended', 'Premium review due'][i % 4],
          ['active','review_due','lapsed','proposed'][i % 4],
          `Insurance planning record tracks protection needs and policy renewal workflow.`
        ]
      );

      await client.query(
        `INSERT INTO advisor_tasks
          (client_id, assigned_to, task_type, title, priority, due_date, completed_at, status, description, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          advisor,
          ['review','compliance','client_follow_up','proposal','operations'][i % 5],
          ['Prepare annual review', 'Update IPS', 'Send tax package', 'Confirm beneficiary details', 'Rebalance proposal'][i % 5],
          ['low','medium','high','urgent'][i % 4],
          `2026-${month}-${dueDay}`,
          i % 5 === 0 ? `2026-${month}-${String(Number(dueDay) + 1).padStart(2, '0')} 10:30:00` : null,
          ['open','in_progress','completed','blocked'][i % 4],
          `Advisor workflow task for client service and compliance follow-through.`,
          `Task tied to ${clientName}.`
        ]
      );

      await client.query(
        `INSERT INTO client_messages
          (client_id, sender, recipient, subject, message_body, channel, priority, read_status, sent_at, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clientId,
          advisor,
          clientName,
          ['Quarterly review follow-up', 'Tax package ready', 'Portfolio update', 'Action items from meeting', 'Secure document request'][i % 5],
          `Secure portal message for ${clientName} with next steps and requested confirmations.`,
          ['portal','secure_email','sms_notice'][i % 3],
          ['low','normal','high','urgent'][i % 4],
          ['unread','read','responded'][i % 3],
          `2026-${month}-${dueDay} 13:00:00`,
          ['sent','archived','draft'][i % 3]
        ]
      );
    }

    const modelData = [
      ['Conservative Income', 'low', 'Income and capital preservation', '25% equity / 65% fixed income / 10% cash', 100000, 'quarterly', 'Bloomberg US Aggregate', 'active'],
      ['Balanced Core', 'moderate', 'Balanced growth and income', '60% equity / 35% fixed income / 5% cash', 250000, 'quarterly', '60/40 Blend', 'active'],
      ['Growth Plus', 'high', 'Long-term capital appreciation', '85% equity / 10% fixed income / 5% alternatives', 500000, 'monthly', 'MSCI ACWI', 'active'],
      ['Tax Efficient Municipal', 'low-moderate', 'Tax-aware income', '35% equity / 55% municipal bonds / 10% cash', 250000, 'quarterly', 'Muni Bond Blend', 'active'],
      ['ESG Balanced', 'moderate', 'Sustainable balanced allocation', '65% ESG equity / 25% green bonds / 10% alternatives', 250000, 'quarterly', 'MSCI ESG Leaders', 'active'],
      ['Retirement Income', 'low', 'Distribution stability', '30% equity / 55% fixed income / 15% cash', 100000, 'semiannual', 'Retirement Income Blend', 'active'],
      ['Ultra High Net Worth Alternatives', 'high', 'Diversified alternatives and growth', '45% equity / 25% alternatives / 20% fixed income / 10% cash', 2000000, 'quarterly', 'Custom UHNW Blend', 'active'],
      ['Young Accumulator', 'high', 'Aggressive accumulation', '95% equity / 5% cash', 50000, 'quarterly', 'Russell 3000', 'active'],
      ['Foundation Balanced', 'moderate', 'Spending policy support', '55% equity / 35% fixed income / 10% alternatives', 1000000, 'quarterly', 'Foundation Policy Blend', 'active'],
      ['Capital Preservation', 'low', 'Principal protection and liquidity', '10% equity / 70% short fixed income / 20% cash', 50000, 'monthly', 'T-Bill Blend', 'active'],
      ['Global Growth', 'high', 'Global equity exposure', '70% US equity / 25% international equity / 5% cash', 250000, 'quarterly', 'MSCI ACWI', 'active'],
      ['Inflation Hedge', 'moderate-high', 'Real asset protection', '35% equity / 25% TIPS / 25% real assets / 15% commodities', 500000, 'quarterly', 'CPI+ Blend', 'active'],
      ['Options Income', 'moderate', 'Covered-call income strategy', '70% dividend equity / 20% fixed income / 10% cash', 500000, 'monthly', 'CBOE BXM', 'active'],
      ['Cash Reserve Ladder', 'low', 'Liquidity and short-term yield', '80% T-bills / 20% high-yield savings', 25000, 'monthly', '3M T-Bill', 'active'],
      ['Legacy Transfer', 'moderate', 'Multi-generational wealth transfer', '50% equity / 30% fixed income / 20% alternatives', 1000000, 'semiannual', 'Legacy Blend', 'active'],
    ];

    for (const [modelName, riskLevel, objective, allocation, minimum, rebalance, benchmark, status] of modelData) {
      await client.query(
        `INSERT INTO model_portfolios
          (model_name, risk_level, objective, target_allocation, minimum_account_size, rebalance_frequency, benchmark, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [modelName, riskLevel, objective, allocation, minimum, rebalance, benchmark, status, `${modelName} proposal template and model portfolio library entry.`]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
    console.log('Seed users created; credentials were supplied through the environment.');
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
