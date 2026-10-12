import React from 'react';

export function fillEveryField(values, variant = 0, choices = {}) {
  const names = ['Retirement review', 'Portfolio risk review', 'Tax planning review'];
  return Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (['id', 'created_at', 'updated_at', 'user_id'].includes(key) || /(^|_)(client|portfolio|account|goal|document|file)_?id$/.test(key) || /(^|_)(file|upload|attachment)(_|$)/.test(key)) return [key, value];
    if (key === 'ai_suggestions') return [key, value];
    if (choices[key]) return [key, choices[key][variant % choices[key].length]];
    if (Array.isArray(value)) return [key, [`${names[variant]} example`, 'Confirm client instructions and account data']];
    if (value && typeof value === 'object') return [key, value];
    if (typeof value === 'boolean') return [key, true];
    if (/date|deadline|valid_until/.test(key)) return [key, new Date(Date.now() + (variant + 7) * 86400000).toISOString().slice(0, key === 'scheduled_date' ? 16 : 10)];
    if (/email/.test(key)) return [key, `client${variant + 1}@example.com`];
    if (/photo_name|filename/.test(key)) return [key, value];
    if (/budget|price|cost|amount/.test(key)) return [key, [2400, 650, 4200][variant]];
    if (/duration/.test(key)) return [key, [6, 2, 8][variant]];
    if (/household_size/.test(key)) return [key, [3, 2, 5][variant]];
    if (/horizon/.test(key)) return [key, [12, 5, 20][variant]];
    if (typeof value === 'number') return [key, [3, 2, 5][variant]];
    if (/location|address|market/.test(key)) return [key, ['New York, NY', 'Boston, MA', 'Chicago, IL'][variant]];
    if (/status/.test(key)) return [key, 'Pending'];
    if (/tone/.test(key)) return [key, ['Professional', 'Friendly', 'Executive'][variant]];
    if (/type/.test(key)) return [key, ['Retirement', 'Risk review', 'Tax planning'][variant]];
    if (/title|name/.test(key)) return [key, names[variant]];
    return [key, `${names[variant]} example: review the client's stated objectives, risk tolerance, cash needs, account constraints, and decision timeline. Flag assumptions and verify holdings before making recommendations.`];
  }));
}

export default function FullFieldPresets({ value, onChange, choices = {}, presets, disabled = false }) {
  const labels = presets ? presets.map((preset) => preset.label) : ['Retirement example', 'Portfolio example', 'Tax planning example'];
  return <div className="ai-preset-bar"><div><strong>Fill every field</strong><p>Each example fills required and optional fields. Review and edit before generating.</p></div><div className="ai-actions">{labels.map((label, index) => <button type="button" className="btn btn-secondary" key={label} disabled={disabled} onClick={() => onChange(presets ? { ...value, ...presets[index].values } : fillEveryField(value, index, choices))}>{label}</button>)}</div></div>;
}
