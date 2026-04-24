import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  client_id: '',
  name: '',
  target_amount: '',
  current_amount: '',
  target_date: '',
  priority: 'medium',
  category: 'retirement',
  status: 'in_progress',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

const pct = (current, target) => {
  const t = Number(target);
  if (!t) return 0;
  return Math.min(100, Math.round((Number(current) / t) * 100));
};

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'client_id', label: 'Client ID' },
  { key: 'name', label: 'Name' },
  { key: 'target_amount', label: 'Target Amount', render: (v) => fmt(v) },
  { key: 'current_amount', label: 'Current Amount', render: (v) => fmt(v) },
  {
    key: 'current_amount',
    label: 'Progress',
    render: (v, item) => {
      const p = pct(v, item.target_amount);
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="progress-bar" style={{ flex: 1, height: 10, background: '#e5e7eb', borderRadius: 5 }}>
            <div style={{ width: `${p}%`, height: '100%', background: p >= 100 ? '#10b981' : '#6366f1', borderRadius: 5 }} />
          </div>
          <span>{p}%</span>
        </div>
      );
    },
  },
  { key: 'target_date', label: 'Target Date' },
  { key: 'priority', label: 'Priority', render: (v) => <span className={`badge badge-${v === 'high' ? 'danger' : v === 'medium' ? 'warning' : 'info'}`}>{v}</span> },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'achieved' ? 'success' : v === 'cancelled' ? 'danger' : 'info'}`}>{v}</span> },
  { key: 'created_at', label: 'Created' },
];

export default function Goals() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await api.getGoals();
      setItems(data);
    } catch (e) { console.error(e); }
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditItem(null);
  }

  function openEdit(item) {
    setForm({
      client_id: item.client_id || '',
      name: item.name || '',
      target_amount: item.target_amount || '',
      current_amount: item.current_amount || '',
      target_date: item.target_date ? item.target_date.slice(0, 10) : '',
      priority: item.priority || 'medium',
      category: item.category || 'retirement',
      status: item.status || 'in_progress',
    });
    setEditItem(item);
    setShowModal(true);
  }

  async function handleCreate() {
    try {
      await api.createGoal({ ...form, client_id: Number(form.client_id), target_amount: Number(form.target_amount), current_amount: Number(form.current_amount) });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateGoal(editItem.id, { ...form, client_id: Number(form.client_id), target_amount: Number(form.target_amount), current_amount: Number(form.current_amount) });
      setShowModal(false);
      setSelected(null);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.deleteGoal(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      (i.name || '').toLowerCase().includes(s) ||
      (i.category || '').toLowerCase().includes(s) ||
      (i.priority || '').toLowerCase().includes(s) ||
      (i.status || '').toLowerCase().includes(s)
    );
  });

  if (selected) {
    return (
      <DetailView
        item={selected}
        fields={detailFields}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Financial Goals</h1>
          <p>Set, track, and achieve client financial milestones</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Goal</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search goals..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Client</th>
              <th>Target Amount</th>
              <th>Current Amount</th>
              <th>Progress %</th>
              <th>Target Date</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const p = pct(item.current_amount, item.target_amount);
              return (
                <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                  <td>{item.name}</td>
                  <td>{item.client_id}</td>
                  <td>{fmt(item.target_amount)}</td>
                  <td>{fmt(item.current_amount)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, minWidth: 60 }}>
                        <div style={{ width: `${p}%`, height: '100%', background: p >= 100 ? '#10b981' : '#6366f1', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12 }}>{p}%</span>
                    </div>
                  </td>
                  <td>{item.target_date ? item.target_date.slice(0, 10) : '—'}</td>
                  <td><span className={`badge badge-${item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'info'}`}>{item.priority}</span></td>
                  <td><span className={`badge badge-${item.status === 'achieved' ? 'success' : item.status === 'cancelled' ? 'danger' : 'info'}`}>{item.status}</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>No goals found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Goal' : 'New Goal'}
        onSubmit={editItem ? handleUpdate : handleCreate}
        submitLabel={editItem ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label>Client ID</label>
          <input type="number" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Target Amount</label>
          <input type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Current Amount</label>
          <input type="number" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Target Date</label>
          <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="retirement">Retirement</option>
            <option value="education">Education</option>
            <option value="real_estate">Real Estate</option>
            <option value="emergency">Emergency</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="business">Business</option>
            <option value="debt">Debt</option>
            <option value="philanthropy">Philanthropy</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="in_progress">In Progress</option>
            <option value="achieved">Achieved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
