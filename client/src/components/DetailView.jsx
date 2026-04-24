export default function DetailView({ item, fields, onClose, onEdit, onDelete }) {
  if (!item) return null;
  return (
    <div>
      <button className="back-btn" onClick={onClose}>← Back to list</button>
      <div className="card">
        <div className="card-header">
          <h3>Details</h3>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(item)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            {fields.map((f) => (
              <div key={f.key} className="detail-field">
                <div className="field-label">{f.label}</div>
                <div className="field-value">{f.render ? f.render(item[f.key], item) : (item[f.key] ?? '—')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
