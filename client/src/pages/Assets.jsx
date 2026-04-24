import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  name: '', category: 'Equity', risk_level: 'moderate', expected_return: '', description: ''
};

const badge = (level) => {
  const colors = { low: 'success', 'low-moderate': 'success', moderate: 'warning', 'moderate-high': 'warning', high: 'danger', 'very-high': 'danger' };
  return <span className={`badge badge-${colors[level] || 'secondary'}`}>{level}</span>;
};

const detailFields = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'risk_level', label: 'Risk Level', render: (v) => badge(v) },
  { key: 'expected_return', label: 'Expected Return', render: (v) => v != null ? `${v}%` : '—' },
  { key: 'description', label: 'Description' },
];

export default function Assets() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try { setItems(await api.getAssets()); } catch (e) { console.error(e); }
  }

  async function handleCreate() {
    try {
      await api.createAsset({ ...form, expected_return: parseFloat(form.expected_return) || 0 });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateAsset(editItem.id, { ...form, expected_return: parseFloat(form.expected_return) || 0 });
      setShowModal(false);
      setEditItem(null);
      resetForm();
      if (selected) setSelected({ ...selected, ...form });
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.deleteAsset(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      name: item.name || '', category: item.category || 'Equity', risk_level: item.risk_level || 'moderate',
      expected_return: item.expected_return || '', description: item.description || ''
    });
    setShowModal(true);
  }

  function resetForm() { setForm({ ...initialForm }); setEditItem(null); }

  const filtered = items.filter(i =>
    [i.name, i.category, i.risk_level, i.description]
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
          <h1>Asset Classes</h1>
          <p>Define and manage asset class categories and expected returns</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Asset</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Category</th><th>Risk Level</th><th>Expected Return</th><th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{badge(item.risk_level)}</td>
                <td>{item.expected_return != null ? `${item.expected_return}%` : '—'}</td>
                <td>{item.description || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No assets found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Asset' : 'New Asset'} onSubmit={editItem ? handleUpdate : handleCreate} submitLabel={editItem ? 'Update' : 'Create'}>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="Equity">Equity</option>
            <option value="Fixed Income">Fixed Income</option>
            <option value="Alternative">Alternative</option>
          </select>
        </div>
        <div className="form-group">
          <label>Risk Level</label>
          <select value={form.risk_level} onChange={e => setForm({ ...form, risk_level: e.target.value })}>
            <option value="low">Low</option>
            <option value="low-moderate">Low-Moderate</option>
            <option value="moderate">Moderate</option>
            <option value="moderate-high">Moderate-High</option>
            <option value="high">High</option>
            <option value="very-high">Very High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Expected Return (%)</label>
          <input type="number" value={form.expected_return} onChange={e => setForm({ ...form, expected_return: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
      </Modal>
    </div>
  );
}
