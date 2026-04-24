import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  client_id: '',
  title: '',
  type: 'ips',
  description: '',
  file_url: '',
  status: 'active',
};

const typeLabels = {
  ips: 'IPS',
  kyc: 'KYC',
  review: 'Review',
  assessment: 'Assessment',
  tax: 'Tax',
  estate: 'Estate',
  plan: 'Plan',
  insurance: 'Insurance',
  succession: 'Succession',
  retirement: 'Retirement',
  esg: 'ESG',
  agreement: 'Agreement',
  budget: 'Budget',
  education: 'Education',
  options: 'Options',
  debt: 'Debt',
};

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'client_id', label: 'Client ID' },
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type', render: (v) => typeLabels[v] || v },
  { key: 'description', label: 'Description' },
  {
    key: 'file_url',
    label: 'File URL',
    render: (v) =>
      v ? (
        <a href={v} target="_blank" rel="noopener noreferrer">{v}</a>
      ) : '—',
  },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : v === 'expired' ? 'danger' : 'warning'}`}>{v}</span> },
  { key: 'created_at', label: 'Uploaded' },
];

export default function Documents() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await api.getDocuments();
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
      title: item.title || '',
      type: item.type || 'ips',
      description: item.description || '',
      file_url: item.file_url || '',
      status: item.status || 'active',
    });
    setEditItem(item);
    setShowModal(true);
  }

  async function handleCreate() {
    try {
      await api.createDocument({ ...form, client_id: Number(form.client_id) });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updateDocument(editItem.id, { ...form, client_id: Number(form.client_id) });
      setShowModal(false);
      setSelected(null);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      (i.title || '').toLowerCase().includes(s) ||
      (i.type || '').toLowerCase().includes(s) ||
      (i.description || '').toLowerCase().includes(s) ||
      (i.status || '').toLowerCase().includes(s) ||
      String(i.client_id || '').includes(s)
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
          <h1>Documents</h1>
          <p>Store and manage client agreements, reports, and compliance docs</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Document</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Client</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{item.title}</td>
                <td>{item.client_id}</td>
                <td>{typeLabels[item.type] || item.type}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description || '—'}</td>
                <td><span className={`badge badge-${item.status === 'active' ? 'success' : item.status === 'expired' ? 'danger' : 'warning'}`}>{item.status}</span></td>
                <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>No documents found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Document' : 'New Document'}
        onSubmit={editItem ? handleUpdate : handleCreate}
        submitLabel={editItem ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label>Client ID</label>
          <input type="number" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(typeLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>File URL</label>
          <input type="text" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
