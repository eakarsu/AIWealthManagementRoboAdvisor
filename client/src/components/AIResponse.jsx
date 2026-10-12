import AIReport from './AIReport';

export default function AIResponse({ result, loading, error }) {
  if (!result && !loading && !error) return null;
  if (result && !result.success) return <div className="ai-error">{result.error || 'AI analysis failed.'}</div>;
  return <AIReport response={result?.data ?? null} model={result?.model} tokens={result?.usage} loading={loading} error={error} title="AI Wealth Advisor" />;
}
