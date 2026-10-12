import React from 'react';
const scenarios = [
  { label: 'Client review', text: 'Review a fictional household with $420,000 invested, moderate risk tolerance, a 12-year horizon, and a $35,000 cash reserve. Identify assumptions, risks, and recommended next steps.' },
  { label: 'Advisor operations', text: 'Review a fictional advisory team serving 75 households. Two reviewers handle quarterly checks and one approval is pending. Prioritize work, identify missing evidence, and propose owners and timing.' },
  { label: 'Executive briefing', text: 'Prepare an executive briefing for a fictional $1.2 million diversified portfolio with a 10-year horizon. Compare options, constraints, and decisions needed before action.' },
];
export default function PromptPresets({ title, onFill }) {
  return <div className="sample-buttons"><div className="sample-buttons-label">Complete prompt examples</div>{scenarios.map(({ label, text }) => <button key={label} type="button" className="btn-sample" onClick={() => onFill(`${title}: ${text}`)}>{label}</button>)}</div>;
}
