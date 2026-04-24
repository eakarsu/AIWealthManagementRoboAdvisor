import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const features = [
  { path: '/clients', title: 'Client Management', desc: 'Manage client profiles, risk tolerance, and investment preferences', icon: '👥', color: 'blue', stat: null },
  { path: '/portfolios', title: 'Portfolio Management', desc: 'Track and manage investment portfolios with real-time valuations', icon: '💼', color: 'purple', stat: null },
  { path: '/transactions', title: 'Transactions', desc: 'Record and monitor all buy, sell, and dividend transactions', icon: '💳', color: 'green', stat: null },
  { path: '/assets', title: 'Asset Classes', desc: 'Define and manage asset class categories and expected returns', icon: '📈', color: 'orange', stat: null },
  { path: '/watchlist', title: 'Watchlist', desc: 'Track securities and set target prices for potential investments', icon: '👁', color: 'teal', stat: null },
  { path: '/goals', title: 'Financial Goals', desc: 'Set, track, and achieve client financial milestones', icon: '🎯', color: 'red', stat: null },
  { path: '/alerts', title: 'Alerts & Notifications', desc: 'Price alerts, portfolio drift warnings, and compliance notices', icon: '🔔', color: 'yellow', stat: null },
  { path: '/fees', title: 'Fee Management', desc: 'AUM-based fee calculation, billing, and revenue tracking', icon: '💰', color: 'emerald', stat: null },
  { path: '/documents', title: 'Documents', desc: 'Store and manage client agreements, reports, and compliance docs', icon: '📄', color: 'indigo', stat: null },
  { path: '/performance', title: 'Performance Tracking', desc: 'Portfolio returns, benchmarks, Sharpe ratios, and volatility', icon: '📉', color: 'pink', stat: null },
  { path: '/ai/portfolio-analysis', title: 'AI Portfolio Analysis', desc: 'AI-powered deep analysis of portfolio allocation and risk', icon: '🤖', color: 'blue', ai: true },
  { path: '/ai/risk-assessment', title: 'AI Risk Assessment', desc: 'Intelligent risk profiling and tolerance evaluation', icon: '⚖️', color: 'purple', ai: true },
  { path: '/ai/investment-recommendations', title: 'AI Investment Recs', desc: 'Personalized AI investment recommendations with allocations', icon: '💡', color: 'green', ai: true },
  { path: '/ai/market-sentiment', title: 'AI Market Sentiment', desc: 'Real-time AI market sentiment analysis and outlook', icon: '📰', color: 'orange', ai: true },
  { path: '/ai/tax-optimization', title: 'AI Tax Optimization', desc: 'Tax-loss harvesting and tax-efficient strategies', icon: '🏛', color: 'teal', ai: true },
  { path: '/ai/retirement-planning', title: 'AI Retirement Planning', desc: 'Comprehensive retirement projections and planning', icon: '🏖', color: 'cyan', ai: true },
  { path: '/ai/rebalancing', title: 'AI Rebalancing', desc: 'Smart portfolio rebalancing recommendations', icon: '⚙️', color: 'indigo', ai: true },
  { path: '/ai/goal-planning', title: 'AI Goal Planning', desc: 'AI-driven financial goal strategies and milestones', icon: '🗺', color: 'pink', ai: true },
  { path: '/ai/esg-analysis', title: 'AI ESG Analysis', desc: 'Environmental, Social, and Governance scoring', icon: '🌱', color: 'emerald', ai: true },
  { path: '/ai/estate-planning', title: 'AI Estate Planning', desc: 'Wealth transfer and estate tax optimization strategies', icon: '🏠', color: 'red', ai: true },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, portfolios: 0, totalAUM: 0, alerts: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [clients, portfolios, alerts] = await Promise.all([
          api.getClients(),
          api.getPortfolios(),
          api.getAlerts(),
        ]);
        const totalAUM = portfolios.reduce((sum, p) => sum + parseFloat(p.total_value || 0), 0);
        setStats({
          clients: clients.length,
          portfolios: portfolios.length,
          totalAUM,
          alerts: alerts.filter(a => a.status === 'active').length,
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to your AI-powered wealth management platform</p>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-change positive">Active accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Portfolios</div>
          <div className="stat-value">{stats.portfolios}</div>
          <div className="stat-change positive">Under management</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total AUM</div>
          <div className="stat-value" style={{ fontSize: '24px' }}>{fmt(stats.totalAUM)}</div>
          <div className="stat-change positive">Assets under management</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">{stats.alerts}</div>
          <div className="stat-change negative">Requires attention</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Management Features</h2>
      <div className="dashboard-grid">
        {features.filter(f => !f.ai).map((f) => (
          <div key={f.path} className="feature-card" onClick={() => navigate(f.path)}>
            <div className={`card-icon bg-${f.color}`}>
              <span>{f.icon}</span>
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', marginTop: '12px' }}>AI-Powered Features</h2>
      <div className="dashboard-grid">
        {features.filter(f => f.ai).map((f) => (
          <div key={f.path} className="feature-card" onClick={() => navigate(f.path)} style={{ borderLeft: '3px solid var(--primary)' }}>
            <div className={`card-icon bg-${f.color}`}>
              <span>{f.icon}</span>
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
