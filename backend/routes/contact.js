const express = require('express');
const pool = require('../database/db');

const router = express.Router();


// ---- POST /api/contact ----
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2)  errors.push('Please enter your name.');
    if (!email || !email.includes('@'))   errors.push('Please enter a valid email address.');
    if (!message || message.trim().length < 10) errors.push('Please write at least 10 characters.');

    if (errors.length > 0) return res.status(400).json({ errors });

    const [result] = await pool.query(
      'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    res.status(201).json({ id: result.insertId, message: 'Message sent' });

  } catch (error) {
    console.error('Greška pri slanju poruke:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;
