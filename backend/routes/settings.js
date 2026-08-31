const express = require('express');
const pool = require('../database/db');

const router = express.Router();


// ---- GET /api/settings ----
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');

    const settings = {};
    for (const row of rows) settings[row.setting_key] = row.setting_value;

    res.json(settings);

  } catch (error) {
    console.error('Greška pri čitanju podešavanja:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;
