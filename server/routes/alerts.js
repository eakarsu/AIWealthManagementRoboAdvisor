const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { type, title, message, severity, symbol, threshold_value, status } = req.body;
    const result = await pool.query(
      `INSERT INTO alerts (type, title, message, severity, symbol, threshold_value, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [type, title, message, severity || 'info', symbol, threshold_value, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { type, title, message, severity, symbol, threshold_value, status } = req.body;
    const result = await pool.query(
      `UPDATE alerts SET type=$1, title=$2, message=$3, severity=$4, symbol=$5, threshold_value=$6, status=$7
       WHERE id=$8 RETURNING *`,
      [type, title, message, severity, symbol, threshold_value, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert deleted', alert: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
