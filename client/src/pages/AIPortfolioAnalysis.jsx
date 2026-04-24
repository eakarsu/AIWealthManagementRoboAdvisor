import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Growth Portfolio', icon: '📈', data: { portfolio_id: '' }, desc: 'Analyze a high-growth portfolio' },
  { label: 'Retirement Fund', icon: '🏖', data: { portfolio_id: '' }, desc: 'Conservative retirement analysis' },
  { label: 'Tech Heavy', icon: '💻', data: { portfolio_id: '' }, desc: 'Tech-sector concentrated portfolio' },
];

export default function AIPortfolioAnalysis() {
  const [form, setForm] = useState({ portfolio_id: '' });
  const [portfolios, setPortfolios] = useState([]);
  const [clients, setClients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPortfolios().then(setPortfolios).catch(() => {});
    api.getClients().then(setClients).catch(() => {});
  }, []);

  const loadSample = (sample, idx) => {
    const pid = portfolios[idx % portfolios.length]?.id || '';
    setForm({ portfolio_id: String(pid) });
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiPortfolioAnalysis({
        portfolio_id: form.portfolio_id ? Number(form.portfolio_id) : undefined
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const selectedPortfolio = portfolios.find(p => String(p.id) === form.portfolio_id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Portfolio Analysis</h1>
          <p>Deep AI analysis of portfolio allocation, diversification, and risk</p>
        </div>
      </div>

      <div className="sample-buttons">
        <div className="sample-buttons-label">Quick Samples</div>
        {samples.map((s, i) => (
          <button key={i} className="btn-sample" onClick={() => loadSample(s, i)}>
            <span className="sample-icon">{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>Configure Analysis</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Portfolio</label>
            <select
              className="form-control"
              value={form.portfolio_id}
              onChange={e => setForm({ ...form, portfolio_id: e.target.value })}
            >
              <option value="">-- Select a portfolio (or leave for sample) --</option>
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.client_name || `Client #${p.client_id}`} — ${Number(p.total_value || 0).toLocaleString()} ({p.strategy})
                </option>
              ))}
            </select>
          </div>
          {selectedPortfolio && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              Strategy: <strong>{selectedPortfolio.strategy}</strong> | Risk: <strong>{selectedPortfolio.risk_level}</strong> | Value: <strong>${Number(selectedPortfolio.total_value || 0).toLocaleString()}</strong>
            </div>
          )}
          <button className="btn btn-ai" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
      </div>
      <AIResponse result={result} loading={loading} error={error} />
    </div>
  );
}
