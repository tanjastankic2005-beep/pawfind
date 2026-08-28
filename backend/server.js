// OVO MORA BITI PRVI RED
require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Raspakuj JSON iz tijela requesta u req.body
app.use(express.json());

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

// API: nova prijava za udomljavanje
app.post('/api/applications', async (req, res) => {
  try {
    const {
      pet_id,
      applicant_name,
      applicant_email,
      phone,
      city,
      housing_type,
      has_yard,
      has_other_pets,
      has_children,
      pet_experience,
      reason,
      preferred_contact
    } = req.body;

    // ---- VALIDACIJA ----
    const errors = [];

    if (!applicant_name || applicant_name.trim().length < 2) {
      errors.push('Please enter your full name.');
    }

    if (!applicant_email || !applicant_email.includes('@')) {
      errors.push('Please enter a valid email address.');
    }

    if (!pet_id) {
      errors.push('No pet selected.');
    }

    if (!reason || reason.trim().length < 10) {
      errors.push('Please tell us why you want to adopt (at least 10 characters).');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // ---- Postoji li taj ljubimac? ----
    const [pets] = await pool.query(
      'SELECT id FROM pets WHERE id = ?',
      [pet_id]
    );

    if (pets.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // ---- UPIS U BAZU ----
    const [result] = await pool.query(
      `INSERT INTO applications
         (pet_id, applicant_name, applicant_email, phone, city, housing_type,
          has_yard, has_other_pets, has_children, pet_experience, reason, preferred_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pet_id,
        applicant_name.trim(),
        applicant_email.trim(),
        phone || null,
        city || null,
        housing_type || null,
        has_yard ? 1 : 0,
        has_other_pets ? 1 : 0,
        has_children ? 1 : 0,
        pet_experience || null,
        reason.trim(),
        preferred_contact || null
      ]
    );

    res.status(201).json({
      message: 'Application received',
      id: result.insertId
    });

  } catch (error) {
    console.error('Greška pri slanju prijave:', error.message);
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