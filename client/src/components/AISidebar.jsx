import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AIResponse from './AIResponse';

const aiFeatures = [
  {
    section: 'Page Intelligence',
    contextual: true,
    items: [
      { id: 'client-analysis', label: 'Client Insights', icon: '👥', pages: ['/clients'], apiFn: 'aiClientAnalysis', description: 'AI analysis of client profiles, engagement & opportunities' },
      { id: 'portfolio-analysis', label: 'Portfolio Analysis', icon: '💼', pages: ['/portfolios'], apiFn: 'aiPortfolioAnalysis', path: '/ai/portfolio-analysis', description: 'Deep analysis of allocation, diversification & risk' },
      { id: 'transaction-analysis', label: 'Transaction Insights', icon: '💳', pages: ['/transactions'], apiFn: 'aiTransactionAnalysis', description: 'Trading patterns, cost analysis & compliance' },
      { id: 'asset-analysis', label: 'Asset Strategy', icon: '📈', pages: ['/assets'], apiFn: 'aiAssetAnalysis', description: 'Asset allocation strategy & tactical shifts' },
      { id: 'watchlist-analysis', label: 'Watchlist Intel', icon: '👁', pages: ['/watchlist'], apiFn: 'aiWatchlistAnalysis', description: 'Entry points, recommendations & opportunities' },
      { id: 'goal-analysis', label: 'Goal Planning', icon: '🎯', pages: ['/goals'], apiFn: 'aiGoalPlanning', path: '/ai/goal-planning', description: 'AI-driven goal strategies & milestones' },
      { id: 'alert-analysis', label: 'Alert Intelligence', icon: '🔔', pages: ['/alerts'], apiFn: 'aiAlertAnalysis', description: 'Alert patterns, priority & threshold optimization' },
      { id: 'fee-analysis', label: 'Fee Optimization', icon: '💰', pages: ['/fees'], apiFn: 'aiFeeAnalysis', description: 'Fee benchmarking & revenue optimization' },
      { id: 'document-analysis', label: 'Document Review', icon: '📄', pages: ['/documents'], apiFn: 'aiDocumentAnalysis', description: 'Compliance gaps & document workflow' },
      { id: 'performance-analysis', label: 'Performance Deep Dive', icon: '📉', pages: ['/performance'], apiFn: 'aiPerformanceAnalysis', description: 'Risk-adjusted returns & attribution analysis' },
    ],
  },
  {
    section: 'AI Advisory',
    contextual: false,
    items: [
      { id: 'risk-assessment', label: 'Risk Assessment', icon: '⚖️', path: '/ai/risk-assessment', description: 'Intelligent risk profiling & tolerance evaluation' },
      { id: 'investment-recs', label: 'Investment Recs', icon: '💡', path: '/ai/investment-recommendations', description: 'Personalized AI investment recommendations' },
      { id: 'market-sentiment', label: 'Market Sentiment', icon: '📰', path: '/ai/market-sentiment', description: 'Real-time market sentiment & outlook' },
      { id: 'tax-optimization', label: 'Tax Optimization', icon: '🏛', path: '/ai/tax-optimization', description: 'Tax-loss harvesting & efficient strategies' },
      { id: 'retirement-planning', label: 'Retirement Planning', icon: '🏖', path: '/ai/retirement-planning', description: 'Comprehensive retirement projections' },
      { id: 'rebalancing', label: 'Rebalancing', icon: '⚙️', path: '/ai/rebalancing', description: 'Smart portfolio rebalancing recommendations' },
      { id: 'esg-analysis', label: 'ESG Analysis', icon: '🌱', path: '/ai/esg-analysis', description: 'Environmental, Social & Governance scoring' },
      { id: 'estate-planning', label: 'Estate Planning', icon: '🏠', path: '/ai/estate-planning', description: 'Wealth transfer & estate tax optimization' },
    ],
  },
];

export default function AISidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Reset result when switching features
  useEffect(() => {
    setResult(null);
    setError('');
  }, [activeFeature]);

  const currentPath = location.pathname;

  // Find contextual features for current page
  const getContextualFeatures = () => {
    return aiFeatures[0].items.filter(item =>
      item.pages.some(p => currentPath === p || currentPath.startsWith(p + '/'))
    );
  };

  const contextualFeatures = getContextualFeatures();

  const handleRunAI = async (feature) => {
    if (feature.path && !feature.apiFn) {
      navigate(feature.path);
      setIsOpen(false);
      return;
    }

    setActiveFeature(feature.id);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiFn = api[feature.apiFn];
      if (!apiFn) {
        // Navigate to the dedicated page if no inline API
        if (feature.path) {
          navigate(feature.path);
          setIsOpen(false);
          return;
        }
        throw new Error('AI feature not available');
      }
      const data = await apiFn({});
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (feature) => {
    if (feature.path) {
      navigate(feature.path);
      setIsOpen(false);
    } else {
      handleRunAI(feature);
    }
  };

  const getPageName = () => {
    const map = {
      '/': 'Dashboard',
      '/clients': 'Clients',
      '/portfolios': 'Portfolios',
      '/transactions': 'Transactions',
      '/assets': 'Assets',
      '/watchlist': 'Watchlist',
      '/goals': 'Goals',
      '/alerts': 'Alerts',
      '/fees': 'Fees',
      '/documents': 'Documents',
      '/performance': 'Performance',
    };
    return map[currentPath] || '';
  };

  return (
    <>
      {/* AI Toggle Button */}
      <button
        className={`ai-sidebar-toggle ${isOpen ? 'open' : ''} ${contextualFeatures.length > 0 ? 'has-context' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        <span className="ai-toggle-icon">{isOpen ? '✕' : '🤖'}</span>
        {contextualFeatures.length > 0 && !isOpen && (
          <span className="ai-toggle-badge">{contextualFeatures.length}</span>
        )}
      </button>

      {/* AI Sidebar Panel */}
      <div className={`ai-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="ai-sidebar-header">
          <div className="ai-sidebar-title">
            <span className="ai-sidebar-logo">🤖</span>
            <div>
              <h3>AI Assistant</h3>
              <span className="ai-sidebar-subtitle">Wealth Management AI</span>
            </div>
          </div>
        </div>

        <div className="ai-sidebar-content">
          {/* Contextual AI for current page */}
          {contextualFeatures.length > 0 && (
            <div className="ai-sidebar-section">
              <div className="ai-sidebar-section-title">
                <span className="ai-pulse"></span>
                AI for {getPageName()}
              </div>
              {contextualFeatures.map(feature => (
                <div
                  key={feature.id}
                  className={`ai-sidebar-feature highlighted ${activeFeature === feature.id ? 'active' : ''}`}
                  onClick={() => handleRunAI(feature)}
                >
                  <div className="ai-feature-icon">{feature.icon}</div>
                  <div className="ai-feature-info">
                    <div className="ai-feature-label">{feature.label}</div>
                    <div className="ai-feature-desc">{feature.description}</div>
                  </div>
                  <div className="ai-feature-action">
                    {loading && activeFeature === feature.id ? (
                      <div className="ai-mini-spinner"></div>
                    ) : (
                      '▶'
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline AI Result */}
          {(result || loading || error) && (
            <div className="ai-sidebar-result">
              <AIResponse result={result} loading={loading} error={error} />
              {result && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px', width: '100%' }} onClick={() => { setResult(null); setActiveFeature(null); }}>
                  Clear Result
                </button>
              )}
            </div>
          )}

          {/* All AI Features */}
          {aiFeatures.map(section => {
            // Skip contextual section header if showing inline
            if (section.contextual && contextualFeatures.length > 0) return null;
            return (
              <div key={section.section} className="ai-sidebar-section">
                <div className="ai-sidebar-section-title">{section.section}</div>
                {section.items.map(feature => (
                  <div
                    key={feature.id}
                    className={`ai-sidebar-feature ${activeFeature === feature.id ? 'active' : ''}`}
                    onClick={() => section.contextual ? handleRunAI(feature) : handleNavigate(feature)}
                  >
                    <div className="ai-feature-icon">{feature.icon}</div>
                    <div className="ai-feature-info">
                      <div className="ai-feature-label">{feature.label}</div>
                      <div className="ai-feature-desc">{feature.description}</div>
                    </div>
                    <div className="ai-feature-action">
                      {loading && activeFeature === feature.id ? (
                        <div className="ai-mini-spinner"></div>
                      ) : section.contextual ? '▶' : '→'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Page Intelligence section when no context */}
          {contextualFeatures.length === 0 && (
            <div className="ai-sidebar-section">
              <div className="ai-sidebar-section-title">Page Intelligence</div>
              {aiFeatures[0].items.map(feature => (
                <div
                  key={feature.id}
                  className={`ai-sidebar-feature ${activeFeature === feature.id ? 'active' : ''}`}
                  onClick={() => handleRunAI(feature)}
                >
                  <div className="ai-feature-icon">{feature.icon}</div>
                  <div className="ai-feature-info">
                    <div className="ai-feature-label">{feature.label}</div>
                    <div className="ai-feature-desc">{feature.description}</div>
                  </div>
                  <div className="ai-feature-action">
                    {loading && activeFeature === feature.id ? (
                      <div className="ai-mini-spinner"></div>
                    ) : '▶'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="ai-sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
