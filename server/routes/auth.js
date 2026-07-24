const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: String(user.id), email: user.email, role: user.role || 'advisor',
        tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`account:${user.id}`] },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || typeof password !== 'string' || password.length < 12) {
      return res.status(400).json({ error: 'name, email, and a password of at least 12 characters are required' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hash, 'advisor']
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { id: String(user.id), email: user.email, role: user.role,
        tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`account:${user.id}`] },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '8h' }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error('Registration failed:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
