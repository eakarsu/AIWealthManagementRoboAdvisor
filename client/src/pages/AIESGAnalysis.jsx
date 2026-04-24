import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'FAANG ESG', icon: '💻', data: { symbols: 'AAPL, AMZN, META, GOOGL, NFLX', preferences: 'Evaluate carbon footprint, data privacy practices, and board diversity.' } },
  { label: 'Clean Energy', icon: '🌱', data: { symbols: 'ENPH, SEDG, FSLR, NEE, BEP', preferences: 'Focus on renewable energy impact, sustainability metrics, and green revenue percentage.' } },
  { label: 'Socially Responsible', icon: '🤝', data: { symbols: 'MSFT, CRM, ADBE, COST, PG', preferences: 'Prioritize employee welfare, community impact, supply chain ethics, and diversity metrics.' } },
  { label: 'Oil vs Green', icon: '⚡', data: { symbols: 'XOM, CVX, TSLA, ENPH, NEE', preferences: 'Compare traditional energy ESG scores vs renewable energy companies. Highlight transition risks.' } },
];

export default function AIESGAnalysis() {
  const [form, setForm] = useState({ symbols: '', preferences: '' });
  const [watchlist, setWatchlist] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getWatchlist().then(setWatchlist).catch(() => {});
    api.getPortfolios().then(setPortfolios).catch(() => {});
  }, []);

  const loadSample = (sample) => {
    setForm({ ...sample.data });
    setResult(null);
  };

  const loadFromWatchlist = () => {
    const symbols = watchlist.map(w => w.symbol).filter(Boolean).join(', ');
    setForm(f => ({ ...f, symbols: symbols || f.symbols }));
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiESGAnalysis(form);
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI ESG Analysis</h1>
          <p>AI evaluation of Environmental, Social, and Governance factors for sustainable investing</p>
        </div>
      </div>

      <div className="sample-buttons">
        <div className="sample-buttons-label">Quick Samples</div>
        {samples.map((s, i) => (
          <button key={i} className="btn-sample" onClick={() => loadSample(s)}>
            <span className="sample-icon">{s.icon}</span> {s.label}
          </button>
        ))}
        {watchlist.length > 0 && (
          <button className="btn-sample" onClick={loadFromWatchlist}>
            <span className="sample-icon">👁</span> My Watchlist ({watchlist.length})
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h3>Configure Analysis</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Symbols</label>
            <input type="text" className="form-control" placeholder="AAPL, MSFT, TSLA" value={form.symbols} onChange={e => setForm({ ...form, symbols: e.target.value })} />
          </div>
          <div className="form-group">
            <label>ESG Preferences</label>
            <textarea className="form-control" placeholder="Describe your ESG preferences..." rows={4} value={form.preferences} onChange={e => setForm({ ...form, preferences: e.target.value })} />
          </div>
          <button className="btn btn-ai" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
      </div>
      <AIResponse result={result} loading={loading} error={error} />
    </div>
  );
}
