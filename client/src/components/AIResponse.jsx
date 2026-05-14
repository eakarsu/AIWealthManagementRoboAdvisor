import { useMemo } from 'react';

function formatValue(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') {
    if (Math.abs(val) > 999) return val.toLocaleString();
    return val.toString();
  }
  return String(val);
}

function renderStructured(data) {
  if (!data || typeof data !== 'object') return null;
  const entries = Object.entries(data);

  return (
    <div style={{ padding: '16px' }}>
      {entries.map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        if (Array.isArray(value)) {
          if (value.length === 0) return null;
          const isObjectArray = typeof value[0] === 'object' && value[0] !== null;
          return (
            <div key={key} style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</div>
              {isObjectArray ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        {Object.keys(value[0]).map(k => (
                          <th key={k} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--text-secondary)' }}>{k.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {value.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                          {Object.values(row).map((v, j) => (
                            <td key={j} style={{ padding: '6px 8px' }}>{formatValue(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                  {value.map((item, i) => <li key={i} style={{ marginBottom: '4px' }}>{formatValue(item)}</li>)}
                </ul>
              )}
            </div>
          );
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key} style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</div>
              <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(value).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k.replace(/_/g, ' ')}:</span>
                    <span style={{ fontWeight: 600 }}>{formatValue(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={key} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{formatValue(value)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AIResponse({ result, loading, error }) {
  const content = useMemo(() => {
    if (!result?.data) return null;
    return result.data;
  }, [result]);

  if (loading) {
    return (
      <div className="ai-loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>AI is analyzing your request...</p>
      </div>
    );
  }

  if (error) {
    return <div className="ai-error">{error}</div>;
  }

  if (!result) return null;

  if (!result.success) {
    return <div className="ai-error">{result.error || 'AI analysis failed. Please check your OpenRouter API key.'}</div>;
  }

  return (
    <div className="ai-response">
      <div className="ai-response-header">
        <div className="ai-icon">AI</div>
        <div>
          <div className="ai-label">AI Wealth Advisor</div>
          <div className="ai-model">{result.model || 'claude-3-5-sonnet'} {result.usage ? `| ${result.usage.total_tokens} tokens` : ''}</div>
        </div>
      </div>
      {content && typeof content === 'object' ? renderStructured(content) : (
        <div style={{ padding: '16px', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{String(content || '')}</div>
      )}
    </div>
  );
}
