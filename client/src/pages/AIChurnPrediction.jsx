import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

export default function AIChurnPrediction() {
  const [form, setForm] = useState({ client_id: '' });
  const [clients, setClients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getClients().then(setClients).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiChurnPrediction({
        client_id: form.client_id ? Number(form.client_id) : undefined,
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const selectedClient = clients.find(c => String(c.id) === form.client_id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Churn Prediction</h1>
          <p>Predict client churn risk from portfolio activity, performance, and recent alerts</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Select Client</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Client</label>
            <select
              className="form-control"
              value={form.client_id}
              onChange={e => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">-- Select a client (or leave for sample) --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.risk_tolerance || 'unknown'} risk — ${Number(c.net_worth || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          {selectedClient && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              Tenure: <strong>{selectedClient.tenure_years || 'n/a'}</strong> | AUM: <strong>${Number(selectedClient.net_worth || 0).toLocaleString()}</strong>
            </div>
          )}
          <button className="btn btn-ai" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Churn Prediction'}
          </button>
        </div>
      </div>
      <AIResponse result={result} loading={loading} error={error} />
    </div>
  );
}
