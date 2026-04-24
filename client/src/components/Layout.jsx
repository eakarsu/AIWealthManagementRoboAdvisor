import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AISidebar from './AISidebar';

const navItems = [
  { section: 'Overview', items: [
    { path: '/', label: 'Dashboard', icon: '📊' },
  ]},
  { section: 'Management', items: [
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/portfolios', label: 'Portfolios', icon: '💼' },
    { path: '/transactions', label: 'Transactions', icon: '💳' },
    { path: '/assets', label: 'Asset Classes', icon: '📈' },
    { path: '/watchlist', label: 'Watchlist', icon: '👁' },
    { path: '/goals', label: 'Financial Goals', icon: '🎯' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
    { path: '/fees', label: 'Fee Management', icon: '💰' },
    { path: '/documents', label: 'Documents', icon: '📄' },
    { path: '/performance', label: 'Performance', icon: '📉' },
  ]},
  { section: 'AI Advisor', items: [
    { path: '/ai/portfolio-analysis', label: 'Portfolio Analysis', icon: '🤖' },
    { path: '/ai/risk-assessment', label: 'Risk Assessment', icon: '⚖️' },
    { path: '/ai/investment-recommendations', label: 'Invest Recs', icon: '💡' },
    { path: '/ai/market-sentiment', label: 'Market Sentiment', icon: '📰' },
    { path: '/ai/tax-optimization', label: 'Tax Optimization', icon: '🏛' },
    { path: '/ai/retirement-planning', label: 'Retirement Plan', icon: '🏖' },
    { path: '/ai/rebalancing', label: 'Rebalancing', icon: '⚙️' },
    { path: '/ai/goal-planning', label: 'Goal Planning', icon: '🗺' },
    { path: '/ai/esg-analysis', label: 'ESG Analysis', icon: '🌱' },
    { path: '/ai/estate-planning', label: 'Estate Planning', icon: '🏠' },
  ]},
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>
            <span className="logo-icon">W</span>
            WealthAdvisor AI
          </h2>
        </div>

        <div className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map((item) => (
                <div
                  key={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
              <div className="sidebar-user-role">{user?.role || 'admin'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            ↪
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <AISidebar />
    </div>
  );
}
