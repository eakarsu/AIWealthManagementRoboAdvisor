import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIResponse from '../components/AIResponse';

const samples = [
  { label: 'Buy First Home', icon: '🏠', data: { goal_type: 'buy home', target_amount: '500000', timeline: '5 years', current_savings: '80000' } },
  { label: 'Kids College Fund', icon: '🎓', data: { goal_type: 'education', target_amount: '200000', timeline: '15 years', current_savings: '25000' } },
  { label: 'Start a Business', icon: '🚀', data: { goal_type: 'business', target_amount: '150000', timeline: '3 years', current_savings: '40000' } },
  { label: 'Emergency Fund', icon: '🛡', data: { goal_type: 'emergency', target_amount: '50000', timeline: '1 year', current_savings: '10000' } },
  { label: 'Dream Vacation', icon: '✈️', data: { goal_type: 'travel', target_amount: '25000', timeline: '2 years', current_savings: '5000' } },
];

export default function AIGoalPlanning() {
  const [form, setForm] = useState({ goal_type: 'retirement', target_amount: '', timeline: '', current_savings: '' });
  const [goals, setGoals] = useState([]);
  const [clients, setClients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getGoals().then(setGoals).catch(() => {});
    api.getClients().then(setClients).catch(() => {});
  }, []);

  const loadSample = (sample) => {
    setForm({ ...sample.data });
    setResult(null);
  };

  const loadFromGoal = (goalId) => {
    const goal = goals.find(g => String(g.id) === goalId);
    if (goal) {
      setForm({
        goal_type: goal.goal_type || 'investment',
        target_amount: String(goal.target_amount || ''),
        timeline: goal.target_date || goal.timeline || '',
        current_savings: String(goal.current_amount || ''),
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.aiGoalPlanning({
        ...form,
        target_amount: form.target_amount ? Number(form.target_amount) : undefined,
        current_savings: form.current_savings ? Number(form.current_savings) : undefined
      });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Financial Goal Planning</h1>
          <p>AI-crafted roadmaps to achieve your financial milestones on schedule</p>
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
          {goals.length > 0 && (
            <div className="form-group">
              <label>Load from Existing Goal</label>
              <select className="form-control" onChange={e => loadFromGoal(e.target.value)}>
                <option value="">-- Select an existing goal --</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name || g.goal_type} — Target: ${Number(g.target_amount || 0).toLocaleString()} — Current: ${Number(g.current_amount || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Goal Type</label>
              <select className="form-control" value={form.goal_type} onChange={e => setForm({ ...form, goal_type: e.target.value })}>
                <option value="buy home">Buy Home</option>
                <option value="retirement">Retirement</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
                <option value="travel">Travel</option>
                <option value="emergency">Emergency Fund</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target Amount ($)</label>
              <input type="number" className="form-control" placeholder="100000" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Timeline</label>
              <input type="text" className="form-control" placeholder="e.g. 5 years, by 2030" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Current Savings ($)</label>
              <input type="number" className="form-control" placeholder="25000" value={form.current_savings} onChange={e => setForm({ ...form, current_savings: e.target.value })} />
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
