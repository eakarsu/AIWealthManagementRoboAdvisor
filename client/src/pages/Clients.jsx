import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  name: '', email: '', phone: '', risk_tolerance: 'moderate',
  investment_horizon: 'medium', net_worth: '', annual_income: '', status: 'active'
};

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const badge = (status) => {
  const colors = { active: 'success', inactive: 'secondary', pending: 'warning' };
  return <span className={`badge badge-${colors[status] || 'secondary'}`}>{status}</span>;
};

const detailFields = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'risk_tolerance', label: 'Risk Tolerance' },
  { key: 'investment_horizon', label: 'Investment Horizon' },
  { key: 'net_worth', label: 'Net Worth', render: (v) => fmt(v) },
  { key: 'annual_income', label: 'Annual Income', render: (v) => fmt(v) },
  { key: 'status', label: 'Status', render: (v) => badge(v) },
];

export default function Clients() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try { setItems(await api.getClients()); } catch (e) { console.error(e); }
  }

  async function handleCreate() {
    try {
      await api.createClient({ ...form, net_worth: parseFloat(form.net_worth) || 0, annual_income: parseFloat(form.annual_income) || 0 });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateClient(editItem.id, { ...form, net_worth: parseFloat(form.net_worth) || 0, annual_income: parseFloat(form.annual_income) || 0 });
      setShowModal(false);
      setEditItem(null);
      resetForm();
      if (selected) setSelected({ ...selected, ...form });
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.deleteClient(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      name: item.name || '', email: item.email || '', phone: item.phone || '',
      risk_tolerance: item.risk_tolerance || 'moderate', investment_horizon: item.investment_horizon || 'medium',
      net_worth: item.net_worth || '', annual_income: item.annual_income || '', status: item.status || 'active'
    });
    setShowModal(true);
  }

  function resetForm() { setForm({ ...initialForm }); setEditItem(null); }

  const filtered = items.filter(i =>
    [i.name, i.email, i.phone, i.risk_tolerance, i.status]
      .filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
  );

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
          <h1>Clients</h1>
          <p>Manage client profiles, risk tolerance, and investment preferences</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Client</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Risk Tolerance</th><th>Net Worth</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.risk_tolerance}</td>
                <td>{fmt(item.net_worth)}</td>
                <td>{badge(item.status)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No clients found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Client' : 'New Client'} onSubmit={editItem ? handleUpdate : handleCreate} submitLabel={editItem ? 'Update' : 'Create'}>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Risk Tolerance</label>
          <select value={form.risk_tolerance} onChange={e => setForm({ ...form, risk_tolerance: e.target.value })}>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        <div className="form-group">
          <label>Investment Horizon</label>
          <select value={form.investment_horizon} onChange={e => setForm({ ...form, investment_horizon: e.target.value })}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
        <div className="form-group">
          <label>Net Worth</label>
          <input type="number" value={form.net_worth} onChange={e => setForm({ ...form, net_worth: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Annual Income</label>
          <input type="number" value={form.annual_income} onChange={e => setForm({ ...form, annual_income: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
