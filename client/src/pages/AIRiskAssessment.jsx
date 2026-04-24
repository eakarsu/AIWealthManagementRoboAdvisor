import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Young Professional', icon: '👨‍💼', data: { client_id: '', investment_experience: 'beginner', loss_tolerance: '10-20%', time_horizon: '10+ years', income_stability: 'stable' } },
  { label: 'Near Retirement', icon: '🏖', data: { client_id: '', investment_experience: 'advanced', loss_tolerance: '0-5%', time_horizon: '1-3 years', income_stability: 'very stable' } },
  { label: 'Aggressive Trader', icon: '🔥', data: { client_id: '', investment_experience: 'advanced', loss_tolerance: '20%+', time_horizon: '5-10 years', income_stability: 'moderate' } },
  { label: 'Conservative Saver', icon: '🛡', data: { client_id: '', investment_experience: 'none', loss_tolerance: '0-5%', time_horizon: '3-5 years', income_stability: 'unstable' } },
];

export default function AIRiskAssessment() {
  const [form, setForm] = useState({
    client_id: '',
    investment_experience: 'beginner',
    loss_tolerance: '5-10%',
    time_horizon: '5-10 years',
    income_stability: 'stable'
  });
  const [clients, setClients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getClients().then(setClients).catch(() => {});
  }, []);

  const loadSample = (sample, idx) => {
    const cid = clients[idx % clients.length]?.id || '';
    setForm({ ...sample.data, client_id: String(cid) });
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiRiskAssessment({
        client_id: form.client_id ? Number(form.client_id) : undefined,
        answers: {
          investment_experience: form.investment_experience,
          loss_tolerance: form.loss_tolerance,
          time_horizon: form.time_horizon,
          income_stability: form.income_stability
        }
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Risk Assessment</h1>
          <p>Comprehensive AI-driven risk profiling based on your financial situation and preferences</p>
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
        <div className="card-header"><h3>Configure Assessment</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Client</label>
            <select
              className="form-control"
              value={form.client_id}
              onChange={e => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">-- Select a client --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.risk_tolerance} risk — ${Number(c.net_worth || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Investment Experience</label>
              <select className="form-control" value={form.investment_experience} onChange={e => setForm({ ...form, investment_experience: e.target.value })}>
                <option value="none">None</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Loss Tolerance</label>
              <select className="form-control" value={form.loss_tolerance} onChange={e => setForm({ ...form, loss_tolerance: e.target.value })}>
                <option value="0-5%">0-5%</option>
                <option value="5-10%">5-10%</option>
                <option value="10-20%">10-20%</option>
                <option value="20%+">20%+</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Time Horizon</label>
              <select className="form-control" value={form.time_horizon} onChange={e => setForm({ ...form, time_horizon: e.target.value })}>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div className="form-group">
              <label>Income Stability</label>
              <select className="form-control" value={form.income_stability} onChange={e => setForm({ ...form, income_stability: e.target.value })}>
                <option value="unstable">Unstable</option>
                <option value="moderate">Moderate</option>
                <option value="stable">Stable</option>
                <option value="very stable">Very Stable</option>
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
