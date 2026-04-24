const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, p.name as portfolio_name
      FROM performance_records pr
      LEFT JOIN portfolios p ON pr.portfolio_id = p.id
      ORDER BY pr.record_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, p.name as portfolio_name
      FROM performance_records pr
      LEFT JOIN portfolios p ON pr.portfolio_id = p.id
      WHERE pr.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { portfolio_id, record_date, total_value, daily_return, cumulative_return, benchmark_return, sharpe_ratio, volatility } = req.body;
    const result = await pool.query(
      `INSERT INTO performance_records (portfolio_id, record_date, total_value, daily_return, cumulative_return, benchmark_return, sharpe_ratio, volatility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [portfolio_id, record_date, total_value, daily_return, cumulative_return, benchmark_return, sharpe_ratio, volatility]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { portfolio_id, record_date, total_value, daily_return, cumulative_return, benchmark_return, sharpe_ratio, volatility } = req.body;
    const result = await pool.query(
      `UPDATE performance_records SET portfolio_id=$1, record_date=$2, total_value=$3, daily_return=$4, cumulative_return=$5, benchmark_return=$6, sharpe_ratio=$7, volatility=$8
       WHERE id=$9 RETURNING *`,
      [portfolio_id, record_date, total_value, daily_return, cumulative_return, benchmark_return, sharpe_ratio, volatility, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM performance_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted', record: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
