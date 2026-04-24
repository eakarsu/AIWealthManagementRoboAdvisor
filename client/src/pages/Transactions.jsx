import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  portfolio_id: '', type: 'buy', symbol: '', shares: '', price: '', total_amount: '', status: 'pending'
};

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString() : '—';

const badge = (status) => {
  const colors = { completed: 'success', pending: 'warning', cancelled: 'danger' };
  return <span className={`badge badge-${colors[status] || 'secondary'}`}>{status}</span>;
};

const typeBadge = (type) => {
  const colors = { buy: 'success', sell: 'danger', dividend: 'info', transfer: 'secondary' };
  return <span className={`badge badge-${colors[type] || 'secondary'}`}>{type}</span>;
};

const detailFields = [
  { key: 'created_at', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'portfolio_id', label: 'Portfolio ID' },
  { key: 'portfolio_name', label: 'Portfolio', render: (v, item) => v || item.portfolio_id || '—' },
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'symbol', label: 'Symbol' },
  { key: 'shares', label: 'Shares' },
  { key: 'price', label: 'Price', render: (v) => fmt(v) },
  { key: 'total_amount', label: 'Total Amount', render: (v) => fmt(v) },
  { key: 'status', label: 'Status', render: (v) => badge(v) },
];

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try { setItems(await api.getTransactions()); } catch (e) { console.error(e); }
  }

  async function handleCreate() {
    try {
      await api.createTransaction({
        ...form,
        portfolio_id: parseInt(form.portfolio_id) || 0,
        shares: parseFloat(form.shares) || 0,
        price: parseFloat(form.price) || 0,
        total_amount: parseFloat(form.total_amount) || 0
      });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateTransaction(editItem.id, {
        ...form,
        portfolio_id: parseInt(form.portfolio_id) || 0,
        shares: parseFloat(form.shares) || 0,
        price: parseFloat(form.price) || 0,
        total_amount: parseFloat(form.total_amount) || 0
      });
      setShowModal(false);
      setEditItem(null);
      resetForm();
      if (selected) setSelected({ ...selected, ...form });
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      portfolio_id: item.portfolio_id || '', type: item.type || 'buy', symbol: item.symbol || '',
      shares: item.shares || '', price: item.price || '', total_amount: item.total_amount || '', status: item.status || 'pending'
    });
    setShowModal(true);
  }

  function resetForm() { setForm({ ...initialForm }); setEditItem(null); }

  const filtered = items.filter(i =>
    [i.symbol, i.type, i.status, i.portfolio_name]
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
          <h1>Transactions</h1>
          <p>Record and monitor all buy, sell, and dividend transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Transaction</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Portfolio</th><th>Symbol</th><th>Type</th><th>Shares</th><th>Price</th><th>Total</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{fmtDate(item.created_at)}</td>
                <td>{item.portfolio_name || item.portfolio_id || '—'}</td>
                <td>{item.symbol}</td>
                <td>{typeBadge(item.type)}</td>
                <td>{item.shares}</td>
                <td>{fmt(item.price)}</td>
                <td>{fmt(item.total_amount)}</td>
                <td>{badge(item.status)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No transactions found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Transaction' : 'New Transaction'} onSubmit={editItem ? handleUpdate : handleCreate} submitLabel={editItem ? 'Update' : 'Create'}>
        <div className="form-group">
          <label>Portfolio ID</label>
          <input type="number" value={form.portfolio_id} onChange={e => setForm({ ...form, portfolio_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="dividend">Dividend</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <div className="form-group">
          <label>Symbol</label>
          <input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Shares</label>
          <input type="number" value={form.shares} onChange={e => setForm({ ...form, shares: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Total Amount</label>
          <input type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
