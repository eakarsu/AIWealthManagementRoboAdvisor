const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM watchlist ORDER BY added_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM watchlist WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Watchlist item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { symbol, name, current_price, target_price, sector, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO watchlist (symbol, name, current_price, target_price, sector, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [symbol, name, current_price, target_price, sector, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { symbol, name, current_price, target_price, sector, notes } = req.body;
    const result = await pool.query(
      `UPDATE watchlist SET symbol=$1, name=$2, current_price=$3, target_price=$4, sector=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [symbol, name, current_price, target_price, sector, notes, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Watchlist item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM watchlist WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Watchlist item not found' });
    res.json({ message: 'Watchlist item deleted', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
