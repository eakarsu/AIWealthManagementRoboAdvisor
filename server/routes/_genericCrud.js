const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

function buildCrud({ table, fields, orderBy = 'created_at DESC' }) {
  const router = express.Router();

  router.get('/', auth, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', auth, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', auth, async (req, res) => {
    try {
      const values = fields.map((field) => req.body[field] ?? null);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', auth, async (req, res) => {
    try {
      const values = fields.map((field) => req.body[field] ?? null);
      values.push(req.params.id);
      const sets = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const result = await pool.query(
        `UPDATE ${table} SET ${sets}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        values
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', auth, async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Record deleted', record: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = buildCrud;
