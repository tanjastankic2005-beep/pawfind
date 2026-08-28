const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database/db');

const router = express.Router();


// ---- POST /api/auth/register ----
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Please enter your name.');
    if (!email || !email.includes('@'))  errors.push('Please enter a valid email address.');
    if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash, 'user']
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: 'user'
    });

  } catch (error) {
    console.error('Greška pri registraciji:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- POST /api/auth/login ----
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.userId = user.id;
    req.session.role   = user.role;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Greška pri prijavi:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- GET /api/auth/me ----
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (rows.length === 0) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Not logged in' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- POST /api/auth/logout ----
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});


module.exports = router;