import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  type: 'price_alert',
  title: '',
  message: '',
  severity: 'info',
  symbol: '',
  threshold_value: '',
  status: 'active',
};

const severityBadge = (s) => {
  const map = { info: 'badge-info', warning: 'badge-warning', critical: 'badge-danger' };
  return map[s] || 'badge-info';
};

const severityIcon = (s) => {
  const map = { info: 'ℹ️', warning: '⚠️', critical: '🔴' };
  return map[s] || 'ℹ️';
};

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'severity', label: 'Severity', render: (v) => <span className={`badge ${severityBadge(v)}`}>{severityIcon(v)} {v}</span> },
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'message', label: 'Message' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'threshold_value', label: 'Threshold Value' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : v === 'dismissed' ? 'warning' : 'info'}`}>{v}</span> },
  { key: 'created_at', label: 'Created' },
];

export default function Alerts() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await api.getAlerts();
      setItems(data);
    } catch (e) { console.error(e); }
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditItem(null);
  }

  function openEdit(item) {
    setForm({
      type: item.type || 'price_alert',
      title: item.title || '',
      message: item.message || '',
      severity: item.severity || 'info',
      symbol: item.symbol || '',
      threshold_value: item.threshold_value || '',
      status: item.status || 'active',
    });
    setEditItem(item);
    setShowModal(true);
  }

  async function handleCreate() {
    try {
      await api.createAlert({ ...form, threshold_value: form.threshold_value ? Number(form.threshold_value) : null });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateAlert(editItem.id, { ...form, threshold_value: form.threshold_value ? Number(form.threshold_value) : null });
      setShowModal(false);
      setSelected(null);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await api.deleteAlert(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      (i.title || '').toLowerCase().includes(s) ||
      (i.type || '').toLowerCase().includes(s) ||
      (i.symbol || '').toLowerCase().includes(s) ||
      (i.severity || '').toLowerCase().includes(s) ||
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
          <h1>Alerts & Notifications</h1>
          <p>Price alerts, portfolio drift warnings, and compliance notices</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Alert</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Title</th>
              <th>Type</th>
              <th>Symbol</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td><span className={`badge ${severityBadge(item.severity)}`}>{severityIcon(item.severity)}</span></td>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>{item.symbol || '—'}</td>
                <td><span className={`badge badge-${item.status === 'active' ? 'success' : item.status === 'dismissed' ? 'warning' : 'info'}`}>{item.status}</span></td>
                <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>No alerts found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Alert' : 'New Alert'}
        onSubmit={editItem ? handleUpdate : handleCreate}
        submitLabel={editItem ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="price_alert">Price Alert</option>
            <option value="rebalance">Rebalance</option>
            <option value="dividend">Dividend</option>
            <option value="risk">Risk</option>
            <option value="performance">Performance</option>
            <option value="fee">Fee</option>
            <option value="compliance">Compliance</option>
            <option value="market">Market</option>
          </select>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Severity</label>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="form-group">
          <label>Symbol</label>
          <input type="text" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Threshold Value</label>
          <input type="number" value={form.threshold_value} onChange={(e) => setForm({ ...form, threshold_value: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="dismissed">Dismissed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
