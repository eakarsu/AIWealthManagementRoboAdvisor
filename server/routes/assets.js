const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asset_classes ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asset_classes WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset class not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, category, risk_level, expected_return, description } = req.body;
    const result = await pool.query(
      `INSERT INTO asset_classes (name, category, risk_level, expected_return, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, category, risk_level, expected_return, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, risk_level, expected_return, description } = req.body;
    const result = await pool.query(
      `UPDATE asset_classes SET name=$1, category=$2, risk_level=$3, expected_return=$4, description=$5
       WHERE id=$6 RETURNING *`,
      [name, category, risk_level, expected_return, description, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset class not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM asset_classes WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset class not found' });
    res.json({ message: 'Asset class deleted', asset: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
