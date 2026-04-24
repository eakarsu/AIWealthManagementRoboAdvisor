import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  portfolio_id: '',
  record_date: '',
  total_value: '',
  daily_return: '',
  cumulative_return: '',
  benchmark_return: '',
  sharpe_ratio: '',
  volatility: '',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

const fmtPct = (n) => {
  const val = Number(n);
  if (isNaN(val)) return '—';
  return (val * 100).toFixed(2) + '%';
};

const fmtNum = (n) => {
  const val = Number(n);
  if (isNaN(val)) return '—';
  return val.toFixed(4);
};

const returnColor = (n) => {
  const val = Number(n);
  if (isNaN(val) || val === 0) return {};
  return { color: val > 0 ? '#10b981' : '#ef4444', fontWeight: 600 };
};

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'portfolio_id', label: 'Portfolio ID' },
  { key: 'record_date', label: 'Date' },
  { key: 'total_value', label: 'Total Value', render: (v) => fmt(v) },
  {
    key: 'daily_return',
    label: 'Daily Return',
    render: (v) => <span style={returnColor(v)}>{fmtPct(v)}</span>,
  },
  {
    key: 'cumulative_return',
    label: 'Cumulative Return',
    render: (v) => <span style={returnColor(v)}>{fmtPct(v)}</span>,
  },
  {
    key: 'benchmark_return',
    label: 'Benchmark Return',
    render: (v) => <span style={returnColor(v)}>{fmtPct(v)}</span>,
  },
  { key: 'sharpe_ratio', label: 'Sharpe Ratio', render: (v) => fmtNum(v) },
  {
    key: 'volatility',
    label: 'Volatility',
    render: (v) => fmtPct(v),
  },
  { key: 'created_at', label: 'Created' },
];

export default function Performance() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await api.getPerformance();
      setItems(data);
    } catch (e) { console.error(e); }
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditItem(null);
  }

  function openEdit(item) {
    setForm({
      portfolio_id: item.portfolio_id || '',
      record_date: item.record_date ? item.record_date.slice(0, 10) : '',
      total_value: item.total_value || '',
      daily_return: item.daily_return || '',
      cumulative_return: item.cumulative_return || '',
      benchmark_return: item.benchmark_return || '',
      sharpe_ratio: item.sharpe_ratio || '',
      volatility: item.volatility || '',
    });
    setEditItem(item);
    setShowModal(true);
  }

  async function handleCreate() {
    try {
      await api.createPerformance({
        ...form,
        portfolio_id: Number(form.portfolio_id),
        total_value: Number(form.total_value),
        daily_return: Number(form.daily_return),
        cumulative_return: Number(form.cumulative_return),
        benchmark_return: Number(form.benchmark_return),
        sharpe_ratio: Number(form.sharpe_ratio),
        volatility: Number(form.volatility),
      });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updatePerformance(editItem.id, {
        ...form,
        portfolio_id: Number(form.portfolio_id),
        total_value: Number(form.total_value),
        daily_return: Number(form.daily_return),
        cumulative_return: Number(form.cumulative_return),
        benchmark_return: Number(form.benchmark_return),
        sharpe_ratio: Number(form.sharpe_ratio),
        volatility: Number(form.volatility),
      });
      setShowModal(false);
      setSelected(null);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this performance record?')) return;
    try {
      await api.deletePerformance(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      String(i.portfolio_id || '').includes(s) ||
      (i.record_date || '').includes(s)
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
          <h1>Performance Tracking</h1>
          <p>Portfolio returns, benchmarks, Sharpe ratios, and volatility</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Record</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search by portfolio ID or date..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Portfolio</th>
              <th>Date</th>
              <th>Total Value</th>
              <th>Daily Return</th>
              <th>Cumulative Return</th>
              <th>Benchmark</th>
              <th>Sharpe Ratio</th>
              <th>Volatility</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{item.portfolio_id}</td>
                <td>{item.record_date ? item.record_date.slice(0, 10) : '—'}</td>
                <td>{fmt(item.total_value)}</td>
                <td><span style={returnColor(item.daily_return)}>{fmtPct(item.daily_return)}</span></td>
                <td><span style={returnColor(item.cumulative_return)}>{fmtPct(item.cumulative_return)}</span></td>
                <td><span style={returnColor(item.benchmark_return)}>{fmtPct(item.benchmark_return)}</span></td>
                <td>{fmtNum(item.sharpe_ratio)}</td>
                <td>{fmtPct(item.volatility)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>No performance records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Performance Record' : 'New Performance Record'}
        onSubmit={editItem ? handleUpdate : handleCreate}
        submitLabel={editItem ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label>Portfolio ID</label>
          <input type="number" value={form.portfolio_id} onChange={(e) => setForm({ ...form, portfolio_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Record Date</label>
          <input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Total Value</label>
          <input type="number" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Daily Return</label>
          <input type="number" step="0.0001" value={form.daily_return} onChange={(e) => setForm({ ...form, daily_return: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Cumulative Return</label>
          <input type="number" step="0.0001" value={form.cumulative_return} onChange={(e) => setForm({ ...form, cumulative_return: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Benchmark Return</label>
          <input type="number" step="0.0001" value={form.benchmark_return} onChange={(e) => setForm({ ...form, benchmark_return: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Sharpe Ratio</label>
          <input type="number" step="0.0001" value={form.sharpe_ratio} onChange={(e) => setForm({ ...form, sharpe_ratio: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Volatility</label>
          <input type="number" step="0.0001" value={form.volatility} onChange={(e) => setForm({ ...form, volatility: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
