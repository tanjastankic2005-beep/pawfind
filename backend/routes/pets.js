const express = require('express');
const pool = require('../database/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();


// ---- GET /api/pets ----
router.get('/', async (req, res) => {
  try {
    const { search, species, gender, size, location, personality, age, sort } = req.query;

    let sql = 'SELECT * FROM pets WHERE status = ?';
    const values = ['available'];

    if (search)      { sql += ' AND name LIKE ?';    values.push(`%${search}%`); }
    if (species)     { sql += ' AND species = ?';     values.push(species); }
    if (gender)      { sql += ' AND gender = ?';      values.push(gender); }
    if (size)        { sql += ' AND size = ?';        values.push(size); }
    if (location)    { sql += ' AND location = ?';    values.push(location); }
    if (personality) { sql += ' AND personality = ?'; values.push(personality); }

    if (age === 'baby')   sql += ' AND age < 1';
    if (age === 'young')  sql += ' AND age BETWEEN 1 AND 2';
    if (age === 'adult')  sql += ' AND age BETWEEN 3 AND 7';
    if (age === 'senior') sql += ' AND age >= 8';

    const sortOptions = {
      'name-asc':  'name ASC',
      'name-desc': 'name DESC',
      'youngest':  'age ASC',
      'oldest':    'age DESC',
      'newest':    'created_at DESC'
    };

    sql += ` ORDER BY ${sortOptions[sort] || 'created_at DESC'}`;

    const [rows] = await pool.query(sql, values);
    res.json(rows);

  } catch (error) {
    console.error('Greška pri čitanju ljubimaca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- GET /api/pets/:id ----
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Greška pri čitanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- Validacija za POST i PUT ----
function validatePet(body) {
  const errors = [];

  if (!body.name || body.name.trim().length < 1)   errors.push('Name is required.');
  if (!['dog', 'cat'].includes(body.species))      errors.push('Species must be dog or cat.');
  if (body.age === '' || body.age === undefined || isNaN(Number(body.age))) {
    errors.push('Age must be a number.');
  }
  if (!body.gender)   errors.push('Gender is required.');
  if (!body.size)     errors.push('Size is required.');
  if (!body.location) errors.push('Location is required.');

  return errors;
}

function petValues(b) {
  return [
    b.name.trim(), b.species, b.breed || null, Number(b.age), b.gender, b.size, b.location,
    b.description || null, b.image || 'images/pet-1.jpg', b.personality || null,
    b.vaccinated ? 1 : 0, b.neutered ? 1 : 0,
    b.good_with_kids ? 1 : 0, b.good_with_dogs ? 1 : 0, b.good_with_cats ? 1 : 0,
    b.status || 'available'
  ];
}


// ---- POST /api/pets (admin) ----
router.post('/', requireAdmin, async (req, res) => {
  try {
    const errors = validatePet(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const [result] = await pool.query(
      `INSERT INTO pets
         (name, species, breed, age, gender, size, location, description, image, personality,
          vaccinated, neutered, good_with_kids, good_with_dogs, good_with_cats, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      petValues(req.body)
    );

    res.status(201).json({ id: result.insertId, message: 'Pet created' });

  } catch (error) {
    console.error('Greška pri dodavanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- PUT /api/pets/:id (admin) ----
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const errors = validatePet(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const [result] = await pool.query(
      `UPDATE pets SET
         name = ?, species = ?, breed = ?, age = ?, gender = ?, size = ?, location = ?,
         description = ?, image = ?, personality = ?,
         vaccinated = ?, neutered = ?, good_with_kids = ?, good_with_dogs = ?, good_with_cats = ?,
         status = ?
       WHERE id = ?`,
      [...petValues(req.body), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet updated' });

  } catch (error) {
    console.error('Greška pri izmjeni ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- DELETE /api/pets/:id (admin) ----
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pets WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted' });

  } catch (error) {
    console.error('Greška pri brisanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;