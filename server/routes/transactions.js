const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as portfolio_name, c.name as client_name
      FROM transactions t
      LEFT JOIN portfolios p ON t.portfolio_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY t.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as portfolio_name
      FROM transactions t
      LEFT JOIN portfolios p ON t.portfolio_id = p.id
      WHERE t.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { portfolio_id, type, symbol, shares, price, total_amount, status } = req.body;
    const result = await pool.query(
      `INSERT INTO transactions (portfolio_id, type, symbol, shares, price, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [portfolio_id, type, symbol, shares, price, total_amount || shares * price, status || 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { portfolio_id, type, symbol, shares, price, total_amount, status } = req.body;
    const result = await pool.query(
      `UPDATE transactions SET portfolio_id=$1, type=$2, symbol=$3, shares=$4, price=$5, total_amount=$6, status=$7
       WHERE id=$8 RETURNING *`,
      [portfolio_id, type, symbol, shares, price, total_amount, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted', transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
