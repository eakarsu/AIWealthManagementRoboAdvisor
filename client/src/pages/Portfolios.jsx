import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import DetailView from '../components/DetailView';

const initialForm = {
  client_id: '', name: '', strategy: 'balanced', total_value: '', cash_balance: '', risk_level: 'moderate'
};

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const badge = (level) => {
  const colors = { low: 'success', moderate: 'warning', high: 'danger' };
  return <span className={`badge badge-${colors[level] || 'secondary'}`}>{level}</span>;
};

const detailFields = [
  { key: 'name', label: 'Name' },
  { key: 'client_name', label: 'Client Name', render: (v, item) => v || item.client_id || '—' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'total_value', label: 'Total Value', render: (v) => fmt(v) },
  { key: 'cash_balance', label: 'Cash Balance', render: (v) => fmt(v) },
  { key: 'risk_level', label: 'Risk Level', render: (v) => badge(v) },
];

export default function Portfolios() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try { setItems(await api.getPortfolios()); } catch (e) { console.error(e); }
  }

  async function handleCreate() {
    try {
      await api.createPortfolio({ ...form, client_id: parseInt(form.client_id) || 0, total_value: parseFloat(form.total_value) || 0, cash_balance: parseFloat(form.cash_balance) || 0 });
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate() {
    try {
      await api.updatePortfolio(editItem.id, { ...form, client_id: parseInt(form.client_id) || 0, total_value: parseFloat(form.total_value) || 0, cash_balance: parseFloat(form.cash_balance) || 0 });
      setShowModal(false);
      setEditItem(null);
      resetForm();
      if (selected) setSelected({ ...selected, ...form });
      loadItems();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) return;
    try {
      await api.deletePortfolio(id);
      setSelected(null);
      loadItems();
    } catch (e) { console.error(e); }
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      client_id: item.client_id || '', name: item.name || '', strategy: item.strategy || 'balanced',
      total_value: item.total_value || '', cash_balance: item.cash_balance || '', risk_level: item.risk_level || 'moderate'
    });
    setShowModal(true);
  }

  function resetForm() { setForm({ ...initialForm }); setEditItem(null); }

  const filtered = items.filter(i =>
    [i.name, i.client_name, i.strategy, i.risk_level]
      .filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div>
        <DetailView
          item={selected}
          fields={detailFields}
          onClose={() => setSelected(null)}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
        {selected.holdings && selected.holdings.length > 0 && (
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-header"><h3>Holdings</h3></div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th><th>Name</th><th>Shares</th><th>Avg Cost</th><th>Current Price</th><th>Value</th><th>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.holdings.map((h, idx) => {
                    const value = (h.shares || 0) * (h.current_price || 0);
                    const cost = (h.shares || 0) * (h.avg_cost || 0);
                    const gl = value - cost;
                    return (
                      <tr key={idx}>
                        <td>{h.symbol}</td>
                        <td>{h.name || '—'}</td>
                        <td>{h.shares}</td>
                        <td>{fmt(h.avg_cost)}</td>
                        <td>{fmt(h.current_price)}</td>
                        <td>{fmt(value)}</td>
                        <td style={{ color: gl >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(gl)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Portfolio' : 'New Portfolio'} onSubmit={editItem ? handleUpdate : handleCreate} submitLabel={editItem ? 'Update' : 'Create'}>
          {renderForm()}
        </Modal>
      </div>
    );
  }

  function renderForm() {
    return (
      <>
        <div className="form-group">
          <label>Client ID</label>
          <input type="number" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Strategy</label>
          <select value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })}>
            <option value="balanced">Balanced</option>
            <option value="growth">Growth</option>
            <option value="income">Income</option>
            <option value="aggressive_growth">Aggressive Growth</option>
            <option value="sector">Sector</option>
            <option value="esg">ESG</option>
            <option value="tax_efficient">Tax Efficient</option>
            <option value="alternative">Alternative</option>
          </select>
        </div>
        <div className="form-group">
          <label>Total Value</label>
          <input type="number" value={form.total_value} onChange={e => setForm({ ...form, total_value: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Cash Balance</label>
          <input type="number" value={form.cash_balance} onChange={e => setForm({ ...form, cash_balance: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Risk Level</label>
          <select value={form.risk_level} onChange={e => setForm({ ...form, risk_level: e.target.value })}>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Portfolios</h1>
          <p>Track and manage investment portfolios with real-time valuations</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ New Portfolio</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search portfolios..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Client Name</th><th>Strategy</th><th>Total Value</th><th>Cash Balance</th><th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                <td>{item.name}</td>
                <td>{item.client_name || item.client_id || '—'}</td>
                <td>{item.strategy}</td>
                <td>{fmt(item.total_value)}</td>
                <td>{fmt(item.cash_balance)}</td>
                <td>{badge(item.risk_level)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No portfolios found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Portfolio' : 'New Portfolio'} onSubmit={editItem ? handleUpdate : handleCreate} submitLabel={editItem ? 'Update' : 'Create'}>
        {renderForm()}
      </Modal>
    </div>
  );
}
