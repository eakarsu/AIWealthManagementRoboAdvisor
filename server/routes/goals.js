const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, c.name as client_name
      FROM financial_goals g
      LEFT JOIN clients c ON g.client_id = c.id
      ORDER BY g.target_date
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, c.name as client_name
      FROM financial_goals g
      LEFT JOIN clients c ON g.client_id = c.id
      WHERE g.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Goal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { client_id, name, target_amount, current_amount, target_date, priority, category, status } = req.body;
    const result = await pool.query(
      `INSERT INTO financial_goals (client_id, name, target_amount, current_amount, target_date, priority, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [client_id, name, target_amount, current_amount || 0, target_date, priority || 'medium', category, status || 'in_progress']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { client_id, name, target_amount, current_amount, target_date, priority, category, status } = req.body;
    const result = await pool.query(
      `UPDATE financial_goals SET client_id=$1, name=$2, target_amount=$3, current_amount=$4, target_date=$5, priority=$6, category=$7, status=$8
       WHERE id=$9 RETURNING *`,
      [client_id, name, target_amount, current_amount, target_date, priority, category, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Goal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM financial_goals WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted', goal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
