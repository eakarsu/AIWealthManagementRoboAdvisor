import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  client_id: '',
  portfolio_id: '',
  fee_type: 'management',
  rate: '',
  amount: '',
  aum_value: '',
  billing_date: '',
  status: 'pending',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

const fmtPct = (n) => {
  const val = Number(n);
  if (isNaN(val)) return '—';
  return (val * 100).toFixed(2) + '%';
};

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'client_id', label: 'Client ID' },
  { key: 'portfolio_id', label: 'Portfolio ID' },
  { key: 'fee_type', label: 'Fee Type' },
  { key: 'rate', label: 'Rate', render: (v) => fmtPct(v) },
  { key: 'amount', label: 'Amount', render: (v) => fmt(v) },
  { key: 'aum_value', label: 'AUM Value', render: (v) => fmt(v) },
  { key: 'billing_date', label: 'Billing Date' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'paid' ? 'success' : v === 'overdue' ? 'danger' : 'warning'}`}>{v}</span> },
  { key: 'created_at', label: 'Created' },
];

export default function Fees() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await api.getFees();
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
      portfolio_id: item.portfolio_id || '',
      fee_type: item.fee_type || 'management',
      rate: item.rate || '',
      amount: item.amount || '',
      aum_value: item.aum_value || '',
      billing_date: item.billing_date ? item.billing_date.slice(0, 10) : '',
      status: item.status || 'pending',
    });
    setEditItem(item);
    setShowModal(true);
  }

  async function handleCreate() {
    try {
      await api.createFee({
        ...form,
        client_id: Number(form.client_id),
        portfolio_id: Number(form.portfolio_id),
        rate: Number(form.rate),
        amount: Number(form.amount),
        aum_value: Number(form.aum_value),
      });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateFee(editItem.id, {
        ...form,
        client_id: Number(form.client_id),
        portfolio_id: Number(form.portfolio_id),
        rate: Number(form.rate),
        amount: Number(form.amount),
        aum_value: Number(form.aum_value),
      });
      setShowModal(false);
      setSelected(null);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await api.deleteFee(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      (i.fee_type || '').toLowerCase().includes(s) ||
      (i.status || '').toLowerCase().includes(s) ||
      String(i.client_id || '').includes(s) ||
      String(i.portfolio_id || '').includes(s)
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
          <h1>Fee Management</h1>
          <p>AUM-based fee calculation, billing, and revenue tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Fee</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search fees..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Portfolio</th>
              <th>Fee Type</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>AUM Value</th>
              <th>Billing Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{item.client_id}</td>
                <td>{item.portfolio_id}</td>
                <td>{item.fee_type}</td>
                <td>{fmtPct(item.rate)}</td>
                <td>{fmt(item.amount)}</td>
                <td>{fmt(item.aum_value)}</td>
                <td>{item.billing_date ? item.billing_date.slice(0, 10) : '—'}</td>
                <td><span className={`badge badge-${item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'warning'}`}>{item.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>No fees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Fee' : 'New Fee'}
        onSubmit={editItem ? handleUpdate : handleCreate}
        submitLabel={editItem ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label>Client ID</label>
          <input type="number" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Portfolio ID</label>
          <input type="number" value={form.portfolio_id} onChange={(e) => setForm({ ...form, portfolio_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Fee Type</label>
          <select value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })}>
            <option value="management">Management</option>
            <option value="performance">Performance</option>
            <option value="advisory">Advisory</option>
            <option value="planning">Planning</option>
          </select>
        </div>
        <div className="form-group">
          <label>Rate</label>
          <input type="number" step="0.0001" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label>AUM Value</label>
          <input type="number" value={form.aum_value} onChange={(e) => setForm({ ...form, aum_value: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Billing Date</label>
          <input type="date" value={form.billing_date} onChange={(e) => setForm({ ...form, billing_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
