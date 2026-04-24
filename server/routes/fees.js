const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.name as client_name, p.name as portfolio_name
      FROM fees f
      LEFT JOIN clients c ON f.client_id = c.id
      LEFT JOIN portfolios p ON f.portfolio_id = p.id
      ORDER BY f.billing_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.name as client_name, p.name as portfolio_name
      FROM fees f
      LEFT JOIN clients c ON f.client_id = c.id
      LEFT JOIN portfolios p ON f.portfolio_id = p.id
      WHERE f.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Fee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { client_id, portfolio_id, fee_type, rate, amount, aum_value, billing_date, status } = req.body;
    const result = await pool.query(
      `INSERT INTO fees (client_id, portfolio_id, fee_type, rate, amount, aum_value, billing_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [client_id, portfolio_id, fee_type || 'management', rate, amount, aum_value, billing_date, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { client_id, portfolio_id, fee_type, rate, amount, aum_value, billing_date, status } = req.body;
    const result = await pool.query(
      `UPDATE fees SET client_id=$1, portfolio_id=$2, fee_type=$3, rate=$4, amount=$5, aum_value=$6, billing_date=$7, status=$8
       WHERE id=$9 RETURNING *`,
      [client_id, portfolio_id, fee_type, rate, amount, aum_value, billing_date, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Fee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM fees WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Fee not found' });
    res.json({ message: 'Fee deleted', fee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
