import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Panic Selling', icon: '😱', data: { recent_decisions: 'Sold 30% of equities after a 12% drawdown', market_context: 'sharp correction last 4 weeks', life_event: 'none' } },
  { label: 'FOMO Buying', icon: '🚀', data: { recent_decisions: 'Doubled down on a single high-flying tech stock', market_context: 'speculative AI rally', life_event: 'none' } },
  { label: 'Inheritance Anxiety', icon: '🏛', data: { recent_decisions: 'Reluctant to deploy cash from inheritance', market_context: 'normal volatility', life_event: 'recent inheritance of $500k' } },
];

export default function AIBehavioralCoaching() {
  const [form, setForm] = useState({ client_id: '', recent_decisions: '', market_context: '', life_event: '' });
  const [clients, setClients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getClients().then(setClients).catch(() => {});
  }, []);

  const loadSample = (sample) => {
    setForm(f => ({ ...f, ...sample.data }));
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiBehavioralCoaching({
        client_id: form.client_id ? Number(form.client_id) : undefined,
        recent_decisions: form.recent_decisions || undefined,
        market_context: form.market_context || undefined,
        life_event: form.life_event || undefined,
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Behavioral Coaching</h1>
          <p>Spot cognitive biases and craft coaching messages, reframes, and pre-commitment devices</p>
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
        <div className="card-header"><h3>Configure Coaching</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Client (optional — pulls last 25 transactions)</label>
            <select
              className="form-control"
              value={form.client_id}
              onChange={e => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">-- Select a client --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.risk_tolerance || 'unknown'} risk
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Recent Decisions / Behavior</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g., Moved 40% to cash after CPI print"
              value={form.recent_decisions}
              onChange={e => setForm({ ...form, recent_decisions: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Market Context</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., elevated VIX, rate-cut anticipation"
                value={form.market_context}
                onChange={e => setForm({ ...form, market_context: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Life Event</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., new baby, job loss, inheritance"
                value={form.life_event}
                onChange={e => setForm({ ...form, life_event: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-ai" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Behavioral Coaching'}
          </button>
        </div>
      </div>
      <AIResponse result={result} loading={loading} error={error} />
    </div>
  );
}
