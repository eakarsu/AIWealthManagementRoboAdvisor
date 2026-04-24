import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Major Indices', icon: '📊', data: { symbols: 'SPY, QQQ, DIA, IWM', sector: '' } },
  { label: 'Tech Giants', icon: '💻', data: { symbols: 'AAPL, MSFT, GOOGL, AMZN, NVDA, META', sector: 'Technology' } },
  { label: 'Healthcare', icon: '🏥', data: { symbols: 'JNJ, UNH, PFE, ABBV, MRK', sector: 'Healthcare' } },
  { label: 'Energy & Commodities', icon: '⛽', data: { symbols: 'XOM, CVX, COP, GLD, USO', sector: 'Energy' } },
  { label: 'Financials', icon: '🏦', data: { symbols: 'JPM, BAC, GS, MS, BRK.B', sector: 'Financials' } },
];

export default function AIMarketSentiment() {
  const [form, setForm] = useState({ symbols: '', sector: '' });
  const [watchlist, setWatchlist] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getWatchlist().then(setWatchlist).catch(() => {});
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
      const data = await api.aiMarketSentiment(form);
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Market Sentiment Analysis</h1>
          <p>Real-time AI analysis of market sentiment, trends, and momentum indicators</p>
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
          <div className="form-row">
            <div className="form-group">
              <label>Symbols</label>
              <input type="text" className="form-control" placeholder="SPY, QQQ, DIA" value={form.symbols} onChange={e => setForm({ ...form, symbols: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Sector</label>
              <select className="form-control" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}>
                <option value="">-- Any sector --</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financials">Financials</option>
                <option value="Energy">Energy</option>
                <option value="Consumer Discretionary">Consumer Discretionary</option>
                <option value="Industrials">Industrials</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Utilities">Utilities</option>
                <option value="Materials">Materials</option>
              </select>
            </div>
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
