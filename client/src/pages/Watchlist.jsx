import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  symbol: '', name: '', current_price: '', target_price: '', sector: '', notes: ''
};

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const upside = (current, target) => {
  const c = parseFloat(current);
  const t = parseFloat(target);
  if (!c || !t) return '—';
  const pct = ((t - c) / c * 100).toFixed(2);
  const color = pct >= 0 ? 'var(--success, green)' : 'var(--danger, red)';
  return <span style={{ color, fontWeight: 600 }}>{pct >= 0 ? '+' : ''}{pct}%</span>;
};

const detailFields = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name' },
  { key: 'current_price', label: 'Current Price', render: (v) => fmt(v) },
  { key: 'target_price', label: 'Target Price', render: (v) => fmt(v) },
  { key: 'upside', label: 'Upside %', render: (_, item) => upside(item.current_price, item.target_price) },
  { key: 'sector', label: 'Sector' },
  { key: 'notes', label: 'Notes' },
];

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try { setItems(await api.getWatchlist()); } catch (e) { console.error(e); }
  }

  async function handleCreate() {
    try {
      await api.createWatchlistItem({
        ...form,
        current_price: parseFloat(form.current_price) || 0,
        target_price: parseFloat(form.target_price) || 0
      });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateWatchlistItem(editItem.id, {
        ...form,
        current_price: parseFloat(form.current_price) || 0,
        target_price: parseFloat(form.target_price) || 0
      });
      setShowModal(false);
      setEditItem(null);
      resetForm();
      if (selected) setSelected({ ...selected, ...form });
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this watchlist item?')) return;
    try {
      await api.deleteWatchlistItem(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      symbol: item.symbol || '', name: item.name || '',
      current_price: item.current_price || '', target_price: item.target_price || '',
      sector: item.sector || '', notes: item.notes || ''
    });
    setShowModal(true);
  }

  function resetForm() { setForm({ ...initialForm }); setEditItem(null); }

  const filtered = items.filter(i =>
    [i.symbol, i.name, i.sector, i.notes]
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
          <h1>Watchlist</h1>
          <p>Track securities and set target prices for potential investments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Item</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search watchlist..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Symbol</th><th>Name</th><th>Current Price</th><th>Target Price</th><th>Sector</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td><strong>{item.symbol}</strong></td>
                <td>{item.name}</td>
                <td>{fmt(item.current_price)}</td>
                <td>{fmt(item.target_price)}</td>
                <td>{item.sector || '—'}</td>
                <td>{item.notes ? (item.notes.length > 40 ? item.notes.substring(0, 40) + '...' : item.notes) : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No watchlist items found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Watchlist Item' : 'New Watchlist Item'} onSubmit={editItem ? handleUpdate : handleCreate} submitLabel={editItem ? 'Update' : 'Create'}>
        <div className="form-group">
          <label>Symbol</label>
          <input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Current Price</label>
          <input type="number" value={form.current_price} onChange={e => setForm({ ...form, current_price: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Target Price</label>
          <input type="number" value={form.target_price} onChange={e => setForm({ ...form, target_price: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Sector</label>
          <input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
        </div>
      </Modal>
    </div>
  );
}
