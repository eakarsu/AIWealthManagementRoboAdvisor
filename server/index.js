'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const auth = require('./middleware/auth');
const governanceRouter = require('./governance');

for (const name of ['DATABASE_URL', 'GOVERNANCE_TENANT_ID']) {
  if (!process.env[name]) throw new Error(`${name} is required`);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 4000;
const generatedRoutesEnabled = process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production';

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', generatedRoutesEnabled, timestamp: new Date().toISOString() });
});

app.use('/api', auth);
app.use('/api/governance', governanceRouter);
app.use('/api/feature-pack', require('./routes/featurePack'));

const operationalRoutes = [
  ['/api/clients', './routes/clients'], ['/api/portfolios', './routes/portfolios'],
  ['/api/transactions', './routes/transactions'], ['/api/assets', './routes/assets'],
  ['/api/watchlist', './routes/watchlist'], ['/api/goals', './routes/goals'],
  ['/api/alerts', './routes/alerts'], ['/api/fees', './routes/fees'],
  ['/api/documents', './routes/documents'], ['/api/performance', './routes/performance'],
  ['/api/households', './routes/households'], ['/api/trust-beneficiaries', './routes/trustBeneficiaries'],
  ['/api/custodian-accounts', './routes/custodianAccounts'], ['/api/investment-policies', './routes/investmentPolicies'],
  ['/api/meeting-notes', './routes/meetingNotes'], ['/api/compliance-reviews', './routes/complianceReviews'],
  ['/api/tax-packages', './routes/taxPackages'], ['/api/cash-flow-plans', './routes/cashFlowPlans'],
  ['/api/insurance-plans', './routes/insurancePlans'], ['/api/advisor-tasks', './routes/advisorTasks'],
  ['/api/model-portfolios', './routes/modelPortfolios'], ['/api/client-messages', './routes/clientMessages']
];
operationalRoutes.forEach(([mount, modulePath]) => app.use(mount, require(modulePath)));
app.use('/api/ai', require('./routes/ai'));

if (generatedRoutesEnabled) {
  app.use('/api/custom', require('./routes/customFeatures'));
}


// Advisory AI reports only; native execution and approval routes stay unchanged.
const aiWorkspaceSupport = require("./aiWorkspaceAdapters.cjs");
const aiWorkspaceDatabase = require("./db.js");
app.use('/api/report-workspace', require("./aiWorkspace.cjs").createAIWorkspaceRouter({
  pool: aiWorkspaceDatabase, authenticateToken: require("./middleware/auth.js"),
  aiRateLimiter: aiWorkspaceSupport.createWorkspaceLimiter(), features: require("./aiWorkspaceFeatures.json"),
}));
app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err.message);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
