import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'High Earner CA', icon: '☀️', data: { portfolio_id: '', tax_bracket: '37%', state: 'California' } },
  { label: 'Mid Bracket NY', icon: '🗽', data: { portfolio_id: '', tax_bracket: '24%', state: 'New York' } },
  { label: 'Low Bracket TX', icon: '🤠', data: { portfolio_id: '', tax_bracket: '12%', state: 'Texas' } },
  { label: 'Retiree FL', icon: '🌴', data: { portfolio_id: '', tax_bracket: '22%', state: 'Florida' } },
];

export default function AITaxOptimization() {
  const [form, setForm] = useState({ portfolio_id: '', tax_bracket: '22%', state: '' });
  const [portfolios, setPortfolios] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPortfolios().then(setPortfolios).catch(() => {});
  }, []);

  const loadSample = (sample, idx) => {
    const pid = portfolios[idx % portfolios.length]?.id || '';
    setForm({ ...sample.data, portfolio_id: String(pid) });
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiTaxOptimization({
        ...form,
        portfolio_id: form.portfolio_id ? Number(form.portfolio_id) : undefined
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Tax Optimization</h1>
          <p>AI-driven strategies to minimize tax liability and maximize after-tax returns</p>
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
            <select className="form-control" value={form.portfolio_id} onChange={e => setForm({ ...form, portfolio_id: e.target.value })}>
              <option value="">-- Select a portfolio --</option>
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.client_name || `Client #${p.client_id}`} — ${Number(p.total_value || 0).toLocaleString()} ({p.strategy})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Federal Tax Bracket</label>
              <select className="form-control" value={form.tax_bracket} onChange={e => setForm({ ...form, tax_bracket: e.target.value })}>
                <option value="10%">10%</option>
                <option value="12%">12%</option>
                <option value="22%">22%</option>
                <option value="24%">24%</option>
                <option value="32%">32%</option>
                <option value="35%">35%</option>
                <option value="37%">37%</option>
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" className="form-control" placeholder="e.g. California, New York" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
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
