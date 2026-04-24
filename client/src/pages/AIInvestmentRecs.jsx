import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Conservative $50K', icon: '🛡', data: { risk_level: 'conservative', investment_amount: '50000', goals: 'Capital preservation with steady income. Focus on bonds and dividend stocks.' } },
  { label: 'Growth $100K', icon: '📈', data: { risk_level: 'moderate', investment_amount: '100000', goals: 'Long-term growth with balanced risk. Mix of growth stocks and index funds.' } },
  { label: 'Aggressive $250K', icon: '🔥', data: { risk_level: 'aggressive', investment_amount: '250000', goals: 'Maximum growth potential. Willing to accept high volatility for higher returns. Interested in tech and emerging markets.' } },
  { label: 'Retirement Income', icon: '🏖', data: { risk_level: 'conservative', investment_amount: '500000', goals: 'Generate $3,000/month passive income for retirement. Prioritize dividend-paying investments.' } },
];

export default function AIInvestmentRecs() {
  const [form, setForm] = useState({ risk_level: 'moderate', investment_amount: '', goals: '' });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getClients().then(setClients).catch(() => {});
  }, []);

  const loadSample = (sample) => {
    setForm({ ...sample.data });
    setResult(null);
  };

  const handleClientSelect = (clientId) => {
    setSelectedClient(clientId);
    const client = clients.find(c => String(c.id) === clientId);
    if (client) {
      setForm(f => ({ ...f, risk_level: client.risk_tolerance || f.risk_level }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiInvestmentRecommendations({
        ...form,
        investment_amount: form.investment_amount ? Number(form.investment_amount) : undefined
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Investment Recommendations</h1>
          <p>Personalized AI-powered investment suggestions based on your risk profile and goals</p>
        </div>
      </div>

      <div className="sample-buttons">
        <div className="sample-buttons-label">Quick Samples</div>
        {samples.map((s, i) => (
          <button key={i} className="btn-sample" onClick={() => loadSample(s)}>
            <span className="sample-icon">{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>Configure Recommendations</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Load from Client Profile</label>
            <select className="form-control" value={selectedClient} onChange={e => handleClientSelect(e.target.value)}>
              <option value="">-- Select a client to auto-fill risk level --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.risk_tolerance} risk — ${Number(c.net_worth || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Risk Level</label>
              <select className="form-control" value={form.risk_level} onChange={e => setForm({ ...form, risk_level: e.target.value })}>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div className="form-group">
              <label>Investment Amount ($)</label>
              <input type="number" className="form-control" placeholder="10000" value={form.investment_amount} onChange={e => setForm({ ...form, investment_amount: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Investment Goals</label>
            <textarea className="form-control" placeholder="Describe your investment goals..." rows={4} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} />
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
