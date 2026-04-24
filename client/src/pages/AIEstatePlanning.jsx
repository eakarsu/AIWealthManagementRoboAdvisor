import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Young Family $1M', icon: '👨‍👩‍👧‍👦', data: { net_worth: '1000000', family_situation: 'Married, 2 young children (ages 3 and 6)', goals: 'Set up trust for children education, life insurance planning, basic estate documents.' } },
  { label: 'High Net Worth $5M', icon: '💎', data: { net_worth: '5000000', family_situation: 'Married, 3 adult children, 2 grandchildren', goals: 'Minimize estate taxes, establish family trust, charitable giving strategy, generation-skipping trusts.' } },
  { label: 'Business Owner $3M', icon: '🏢', data: { net_worth: '3000000', family_situation: 'Married, 1 child, owns family business valued at $2M', goals: 'Business succession planning, buy-sell agreement, key person insurance, wealth transfer.' } },
  { label: 'Single Professional $2M', icon: '👤', data: { net_worth: '2000000', family_situation: 'Single, no children, aging parents', goals: 'Charitable remainder trust, elder care planning for parents, legacy giving to alma mater.' } },
];

export default function AIEstatePlanning() {
  const [form, setForm] = useState({ net_worth: '', family_situation: '', goals: '' });
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
      setForm(f => ({ ...f, net_worth: String(client.net_worth || f.net_worth) }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiEstatePlanning({
        ...form,
        net_worth: form.net_worth ? Number(form.net_worth) : undefined
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Estate Planning</h1>
          <p>AI-guided estate planning strategies for wealth preservation and transfer</p>
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
              <option value="">-- Select a client to auto-fill net worth --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.risk_tolerance} risk — ${Number(c.net_worth || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Net Worth ($)</label>
              <input type="number" className="form-control" placeholder="500000" value={form.net_worth} onChange={e => setForm({ ...form, net_worth: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Family Situation</label>
              <input type="text" className="form-control" placeholder="e.g. Married, 2 children, aging parents" value={form.family_situation} onChange={e => setForm({ ...form, family_situation: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Estate Planning Goals</label>
            <textarea className="form-control" placeholder="Describe your estate planning goals..." rows={4} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} />
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
