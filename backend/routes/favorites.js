const express = require('express');
const pool = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Sve rute u ovom fajlu traže prijavu
router.use(requireAuth);


// ---- GET /api/favorites/ids ----
router.get('/ids', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT pet_id FROM favorites WHERE user_id = ?',
      [req.session.userId]
    );

    res.json(rows.map(row => row.pet_id));

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- GET /api/favorites ----
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pets.*, favorites.created_at AS favorited_at
       FROM favorites
       JOIN pets ON favorites.pet_id = pets.id
       WHERE favorites.user_id = ?
       ORDER BY favorites.created_at DESC`,
      [req.session.userId]
    );

    res.json(rows);

  } catch (error) {
    console.error('Greška pri čitanju favorita:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- POST /api/favorites ----
router.post('/', async (req, res) => {
  try {
    const { pet_id } = req.body;

    if (!pet_id) {
      return res.status(400).json({ error: 'pet_id is required.' });
    }

    const [pets] = await pool.query('SELECT id FROM pets WHERE id = ?', [pet_id]);

    if (pets.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, pet_id) VALUES (?, ?)',
      [req.session.userId, pet_id]
    );

    res.status(201).json({ message: 'Added to favorites' });

  } catch (error) {
    console.error('Greška pri dodavanju favorita:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- DELETE /api/favorites/:petId ----
router.delete('/:petId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND pet_id = ?',
      [req.session.userId, req.params.petId]
    );

    res.json({ message: 'Removed from favorites' });

  } catch (error) {
    console.error('Greška pri brisanju favorita:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;