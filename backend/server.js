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

// API: ljubimci sa pretragom, filterima i sortiranjem
app.get('/api/pets', async (req, res) => {
  try {
    const { search, species, gender, size, location, personality, age, sort } = req.query;

    // Osnova upita — samo dostupni ljubimci
    let sql = 'SELECT * FROM pets WHERE status = ?';
    const values = ['available'];

    // Pretraga po imenu
    if (search) {
      sql += ' AND name LIKE ?';
      values.push(`%${search}%`);
    }

    // Filteri koji su jednostavno poređenje
    if (species) {
      sql += ' AND species = ?';
      values.push(species);
    }

    if (gender) {
      sql += ' AND gender = ?';
      values.push(gender);
    }

    if (size) {
      sql += ' AND size = ?';
      values.push(size);
    }

    if (location) {
      sql += ' AND location = ?';
      values.push(location);
    }

    if (personality) {
      sql += ' AND personality = ?';
      values.push(personality);
    }

    // Filter po uzrastu — grupe, ne tačan broj
    if (age === 'baby')   sql += ' AND age < 1';
    if (age === 'young')  sql += ' AND age BETWEEN 1 AND 2';
    if (age === 'adult')  sql += ' AND age BETWEEN 3 AND 7';
    if (age === 'senior') sql += ' AND age >= 8';

    // Sortiranje — SAMO dozvoljene vrijednosti
    const sortOptions = {
      'name-asc':  'name ASC',
      'name-desc': 'name DESC',
      'youngest':  'age ASC',
      'oldest':    'age DESC',
      'newest':    'created_at DESC'
    };

    const orderBy = sortOptions[sort] || 'created_at DESC';
    sql += ` ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, values);
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