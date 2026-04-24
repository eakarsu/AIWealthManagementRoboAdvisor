import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Young Starter (25)', icon: '🌱', data: { current_age: '25', retirement_age: '65', current_savings: '15000', monthly_contribution: '500', risk_tolerance: 'aggressive' } },
  { label: 'Mid-Career (35)', icon: '💼', data: { current_age: '35', retirement_age: '60', current_savings: '150000', monthly_contribution: '2000', risk_tolerance: 'moderate' } },
  { label: 'Late Saver (50)', icon: '⏰', data: { current_age: '50', retirement_age: '67', current_savings: '300000', monthly_contribution: '3500', risk_tolerance: 'moderate' } },
  { label: 'Early Retirement (40)', icon: '🏖', data: { current_age: '40', retirement_age: '50', current_savings: '800000', monthly_contribution: '5000', risk_tolerance: 'aggressive' } },
  { label: 'Conservative (55)', icon: '🛡', data: { current_age: '55', retirement_age: '65', current_savings: '500000', monthly_contribution: '2500', risk_tolerance: 'conservative' } },
];

export default function AIRetirementPlanning() {
  const [form, setForm] = useState({ current_age: '', retirement_age: '', current_savings: '', monthly_contribution: '', risk_tolerance: 'moderate' });
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
      setForm(f => ({
        ...f,
        risk_tolerance: client.risk_tolerance || f.risk_tolerance,
        current_savings: String(client.net_worth || f.current_savings),
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiRetirementPlanning({
        current_age: form.current_age ? Number(form.current_age) : undefined,
        retirement_age: form.retirement_age ? Number(form.retirement_age) : undefined,
        current_savings: form.current_savings ? Number(form.current_savings) : undefined,
        monthly_contribution: form.monthly_contribution ? Number(form.monthly_contribution) : undefined,
        risk_tolerance: form.risk_tolerance
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Retirement Planning</h1>
          <p>AI-powered retirement projections and personalized savings strategies</p>
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
        <div className="card-header"><h3>Configure Analysis</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Load from Client Profile</label>
            <select className="form-control" value={selectedClient} onChange={e => handleClientSelect(e.target.value)}>
              <option value="">-- Select a client to auto-fill --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.risk_tolerance} risk — ${Number(c.net_worth || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Age</label>
              <input type="number" className="form-control" placeholder="30" value={form.current_age} onChange={e => setForm({ ...form, current_age: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Retirement Age</label>
              <input type="number" className="form-control" placeholder="65" value={form.retirement_age} onChange={e => setForm({ ...form, retirement_age: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Savings ($)</label>
              <input type="number" className="form-control" placeholder="50000" value={form.current_savings} onChange={e => setForm({ ...form, current_savings: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Monthly Contribution ($)</label>
              <input type="number" className="form-control" placeholder="1000" value={form.monthly_contribution} onChange={e => setForm({ ...form, monthly_contribution: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Risk Tolerance</label>
            <select className="form-control" value={form.risk_tolerance} onChange={e => setForm({ ...form, risk_tolerance: e.target.value })}>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
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
