const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as client_name
      FROM portfolios p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as client_name
      FROM portfolios p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Portfolio not found' });

    const holdings = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = $1', [req.params.id]);
    res.json({ ...result.rows[0], holdings: holdings.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { client_id, name, strategy, total_value, cash_balance, risk_level } = req.body;
    const result = await pool.query(
      `INSERT INTO portfolios (client_id, name, strategy, total_value, cash_balance, risk_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_id, name, strategy || 'balanced', total_value || 0, cash_balance || 0, risk_level || 'moderate']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { client_id, name, strategy, total_value, cash_balance, risk_level } = req.body;
    const result = await pool.query(
      `UPDATE portfolios SET client_id=$1, name=$2, strategy=$3, total_value=$4, cash_balance=$5, risk_level=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [client_id, name, strategy, total_value, cash_balance, risk_level, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Portfolio not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM portfolio_holdings WHERE portfolio_id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM portfolios WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Portfolio not found' });
    res.json({ message: 'Portfolio deleted', portfolio: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
