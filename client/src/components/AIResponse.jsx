import { useMemo } from 'react';

function parseMarkdown(text) {
  if (!text) return '';
  let html = text;
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  // Blockquote
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr/>');
  // Tables
  html = html.replace(/\n\|(.+)\|\n\|[-| :]+\|\n((\|.+\|\n?)+)/g, (match, header, body) => {
    const headers = header.split('|').filter(h => h.trim()).map(h => `<th>${h.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  // Unordered lists
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');
  html = '<p>' + html + '</p>';
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-3]>)/g, '$1');
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr\/>)/g, '$1');
  return html;
}

export default function AIResponse({ result, loading, error }) {
  const renderedHtml = useMemo(() => {
    if (result?.data) return parseMarkdown(result.data);
    return '';
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
          <div className="ai-model">{result.model || 'claude-haiku-4.5'} {result.usage ? `| ${result.usage.total_tokens} tokens` : ''}</div>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
    </div>
  );
}
