import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

const humanize = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const badge = (status) => {
  const value = status || 'unknown';
  const colors = {
    active: 'success',
    approved: 'success',
    completed: 'success',
    delivered: 'success',
    connected: 'success',
    read: 'success',
    pending: 'warning',
    open: 'warning',
    in_progress: 'warning',
    review_due: 'warning',
    needs_review: 'warning',
    remediation_required: 'danger',
    error: 'danger',
    lapsed: 'danger',
    inactive: 'secondary',
    archived: 'secondary',
    draft: 'secondary',
  };
  return <span className={`badge badge-${colors[value] || 'secondary'}`}>{humanize(value)}</span>;
};

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);

function initialDraft(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? '']));
}

function parseValue(field, value) {
  if (field.type === 'number') return value === '' ? 0 : Number(value);
  if (field.type === 'datetime-local') return value ? value.replace('T', ' ') : null;
  return value === '' ? null : value;
}

export default function FeatureManagementPage({
  title,
  subtitle,
  apiClient,
  fields,
  tableColumns,
  statusKey = 'status',
  recordLabel = title,
  createLabel = `New ${recordLabel}`,
}) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(() => initialDraft(fields));
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    loadItems();
    if (fields.some((field) => field.optionsFrom === 'clients')) {
      api.getClients().then(setClients).catch(console.error);
    }
    if (fields.some((field) => field.optionsFrom === 'portfolios')) {
      api.getPortfolios().then(setPortfolios).catch(console.error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadItems() {
    try {
      setItems(await apiClient.list());
    } catch (e) {
      console.error(e);
    }
  }

  function resetForm() {
    setForm(initialDraft(fields));
    setEditItem(null);
  }

  function openEdit(item) {
    const next = {};
    fields.forEach((field) => {
      let value = item[field.key] ?? field.defaultValue ?? '';
      if (field.type === 'datetime-local' && value) value = String(value).slice(0, 16);
      if (field.type === 'date' && value) value = String(value).slice(0, 10);
      next[field.key] = value;
    });
    setForm(next);
    setEditItem(item);
    setShowModal(true);
  }

  async function save() {
    try {
      const payload = Object.fromEntries(fields.map((field) => [field.key, parseValue(field, form[field.key])]));
      if (editItem) await apiClient.update(editItem.id, payload);
      else await apiClient.create(payload);
      setShowModal(false);
      setSelected(null);
      resetForm();
      loadItems();
    } catch (e) {
      console.error(e);
    }
  }

  async function remove(id) {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record?`)) return;
    try {
      await apiClient.remove(id);
      setSelected(null);
      loadItems();
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      fields.some((field) => String(item[field.key] ?? '').toLowerCase().includes(q))
    );
  }, [items, fields, search]);

  const detailFields = fields.map((field) => ({
    key: field.key,
    label: field.label,
    render: (value) => {
      if (field.key === statusKey) return badge(value);
      if (field.type === 'number' && field.money) return money(value);
      return value ?? '—';
    },
  }));

  const renderInput = (field) => {
    const value = form[field.key] ?? '';
    if (field.optionsFrom === 'clients') {
      return (
        <select className="form-control" value={value} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>
          <option value="">Select client</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name} · #{client.id}</option>)}
        </select>
      );
    }
    if (field.optionsFrom === 'portfolios') {
      return (
        <select className="form-control" value={value} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>
          <option value="">Select portfolio</option>
          {portfolios.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name} · #{portfolio.id}</option>)}
        </select>
      );
    }
    if (field.options) {
      return (
        <select className="form-control" value={value} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>
          <option value="">Select</option>
          {field.options.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return <textarea className="form-control" rows={3} value={value} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />;
    }
    return (
      <input
        className="form-control"
        type={field.type || 'text'}
        value={value}
        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
      />
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button className="btn btn-primary btn-create" onClick={() => { resetForm(); setShowModal(true); }}>
          <span className="btn-icon" aria-hidden="true">+</span>
          <span>{createLabel}</span>
        </button>
      </div>

      <div className="search-bar">
        <input placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {tableColumns.map((column) => <th key={column.key}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                {tableColumns.map((column) => {
                  const field = fields.find((candidate) => candidate.key === column.key) || column;
                  const value = item[column.key];
                  return (
                    <td key={column.key}>
                      {column.key === statusKey ? badge(value) : field.money ? money(value) : (value ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={tableColumns.length} style={{ textAlign: 'center', padding: 24 }}>No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? `Edit ${recordLabel}` : createLabel}
        onSubmit={save}
        submitLabel={editItem ? 'Update' : 'Create'}
      >
        <div className="feature-form">
          {fields.map((field) => (
            <div className={`form-group ${field.type === 'textarea' ? 'form-group-wide' : ''}`} key={field.key}>
              <label>{field.label}</label>
              {renderInput(field)}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`${recordLabel} Details`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => openEdit(selected)}>Edit</button>
            <button className="btn btn-danger" onClick={() => remove(selected.id)}>Delete</button>
          </>
        }
      >
        <div className="detail-grid">
          {selected && detailFields.map((field) => (
            <div key={field.key} className="detail-field">
              <div className="field-label">{field.label}</div>
              <div className="field-value">{field.render ? field.render(selected[field.key], selected) : (selected[field.key] ?? '—')}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
