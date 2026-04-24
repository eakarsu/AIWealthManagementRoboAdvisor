const API_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const opts = { method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (body) => request('POST', '/auth/login', body),
  register: (body) => request('POST', '/auth/register', body),

  // Clients
  getClients: () => request('GET', '/clients'),
  getClient: (id) => request('GET', `/clients/${id}`),
  createClient: (body) => request('POST', '/clients', body),
  updateClient: (id, body) => request('PUT', `/clients/${id}`, body),
  deleteClient: (id) => request('DELETE', `/clients/${id}`),

  // Portfolios
  getPortfolios: () => request('GET', '/portfolios'),
  getPortfolio: (id) => request('GET', `/portfolios/${id}`),
  createPortfolio: (body) => request('POST', '/portfolios', body),
  updatePortfolio: (id, body) => request('PUT', `/portfolios/${id}`, body),
  deletePortfolio: (id) => request('DELETE', `/portfolios/${id}`),

  // Transactions
  getTransactions: () => request('GET', '/transactions'),
  getTransaction: (id) => request('GET', `/transactions/${id}`),
  createTransaction: (body) => request('POST', '/transactions', body),
  updateTransaction: (id, body) => request('PUT', `/transactions/${id}`, body),
  deleteTransaction: (id) => request('DELETE', `/transactions/${id}`),

  // Assets
  getAssets: () => request('GET', '/assets'),
  getAsset: (id) => request('GET', `/assets/${id}`),
  createAsset: (body) => request('POST', '/assets', body),
  updateAsset: (id, body) => request('PUT', `/assets/${id}`, body),
  deleteAsset: (id) => request('DELETE', `/assets/${id}`),

  // Watchlist
  getWatchlist: () => request('GET', '/watchlist'),
  getWatchlistItem: (id) => request('GET', `/watchlist/${id}`),
  createWatchlistItem: (body) => request('POST', '/watchlist', body),
  updateWatchlistItem: (id, body) => request('PUT', `/watchlist/${id}`, body),
  deleteWatchlistItem: (id) => request('DELETE', `/watchlist/${id}`),

  // Goals
  getGoals: () => request('GET', '/goals'),
  getGoal: (id) => request('GET', `/goals/${id}`),
  createGoal: (body) => request('POST', '/goals', body),
  updateGoal: (id, body) => request('PUT', `/goals/${id}`, body),
  deleteGoal: (id) => request('DELETE', `/goals/${id}`),

  // Alerts
  getAlerts: () => request('GET', '/alerts'),
  getAlert: (id) => request('GET', `/alerts/${id}`),
  createAlert: (body) => request('POST', '/alerts', body),
  updateAlert: (id, body) => request('PUT', `/alerts/${id}`, body),
  deleteAlert: (id) => request('DELETE', `/alerts/${id}`),

  // Fees
  getFees: () => request('GET', '/fees'),
  getFee: (id) => request('GET', `/fees/${id}`),
  createFee: (body) => request('POST', '/fees', body),
  updateFee: (id, body) => request('PUT', `/fees/${id}`, body),
  deleteFee: (id) => request('DELETE', `/fees/${id}`),

  // Documents
  getDocuments: () => request('GET', '/documents'),
  getDocument: (id) => request('GET', `/documents/${id}`),
  createDocument: (body) => request('POST', '/documents', body),
  updateDocument: (id, body) => request('PUT', `/documents/${id}`, body),
  deleteDocument: (id) => request('DELETE', `/documents/${id}`),

  // Performance
  getPerformance: () => request('GET', '/performance'),
  getPerformanceRecord: (id) => request('GET', `/performance/${id}`),
  createPerformance: (body) => request('POST', '/performance', body),
  updatePerformance: (id, body) => request('PUT', `/performance/${id}`, body),
  deletePerformance: (id) => request('DELETE', `/performance/${id}`),

  // AI Features
  aiPortfolioAnalysis: (body) => request('POST', '/ai/portfolio-analysis', body),
  aiRiskAssessment: (body) => request('POST', '/ai/risk-assessment', body),
  aiInvestmentRecommendations: (body) => request('POST', '/ai/investment-recommendations', body),
  aiMarketSentiment: (body) => request('POST', '/ai/market-sentiment', body),
  aiTaxOptimization: (body) => request('POST', '/ai/tax-optimization', body),
  aiRetirementPlanning: (body) => request('POST', '/ai/retirement-planning', body),
  aiRebalancing: (body) => request('POST', '/ai/rebalancing', body),
  aiGoalPlanning: (body) => request('POST', '/ai/goal-planning', body),
  aiESGAnalysis: (body) => request('POST', '/ai/esg-analysis', body),
  aiEstatePlanning: (body) => request('POST', '/ai/estate-planning', body),
  aiClientAnalysis: (body) => request('POST', '/ai/client-analysis', body),
  aiTransactionAnalysis: (body) => request('POST', '/ai/transaction-analysis', body),
  aiAssetAnalysis: (body) => request('POST', '/ai/asset-analysis', body),
  aiWatchlistAnalysis: (body) => request('POST', '/ai/watchlist-analysis', body),
  aiAlertAnalysis: (body) => request('POST', '/ai/alert-analysis', body),
  aiFeeAnalysis: (body) => request('POST', '/ai/fee-analysis', body),
  aiDocumentAnalysis: (body) => request('POST', '/ai/document-analysis', body),
  aiPerformanceAnalysis: (body) => request('POST', '/ai/performance-analysis', body),
};
