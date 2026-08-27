// OVO MORA BITI PRVI RED
require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Serviraj frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Test ruta
app.get('/ping', (req, res) => {
  res.send('pong 🏓');
});

// API: svi ljubimci — SADA IZ BAZE
app.get('/api/pets', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pets WHERE status = ? ORDER BY created_at DESC',
      ['available']
    );
    res.json(rows);
  } catch (error) {
    console.error('Greška pri čitanju ljubimaca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});
// API: jedan ljubimac po ID-u
app.get('/api/pets/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pets WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Greška pri čitanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});
// Provjeri konekciju, pa pokreni server
pool.getConnection()
  .then(connection => {
    console.log('✅ Povezana na MySQL bazu');
    connection.release();

    app.listen(PORT, () => {
      console.log(`✅ Server radi na http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Ne mogu se spojiti na bazu:', error.message);
  });