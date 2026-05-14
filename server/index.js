require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/portfolios', require('./routes/portfolios'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/custom', require('./routes/customFeatures'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-nonai-aiwealthmanagementroboadvisor', require('./routes/batch09GapNonai')); // // === Batch 09 Gaps & Frontend Mounts ===

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

