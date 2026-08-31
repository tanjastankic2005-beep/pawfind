const express = require('express');
const pool = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const APPLICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Completed'
];


// ---- GET /api/applications/me ----
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         applications.id,
         applications.status,
         applications.reason,
         applications.created_at,
         pets.id       AS pet_id,
         pets.name     AS pet_name,
         pets.image    AS pet_image,
         pets.species  AS pet_species,
         pets.location AS pet_location
       FROM applications
       JOIN pets ON applications.pet_id = pets.id
       WHERE applications.user_id = ?
       ORDER BY applications.created_at DESC`,
      [req.session.userId]
    );

    res.json(rows);

  } catch (error) {
    console.error('Greška pri čitanju prijava:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- POST /api/applications ----
router.post('/', async (req, res) => {
  try {
    const {
      pet_id, applicant_name, applicant_email, phone, city, housing_type,
      has_yard, has_other_pets, has_children, pet_experience, reason, preferred_contact
    } = req.body;

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

    const [pets] = await pool.query('SELECT id FROM pets WHERE id = ?', [pet_id]);

    if (pets.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    const userId = req.session.userId || null;

    const [result] = await pool.query(
      `INSERT INTO applications
         (user_id, pet_id, applicant_name, applicant_email, phone, city, housing_type,
          has_yard, has_other_pets, has_children, pet_experience, reason, preferred_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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

    res.status(201).json({ message: 'Application received', id: result.insertId });

  } catch (error) {
    console.error('Greška pri slanju prijave:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- PATCH /api/applications/:id/status (admin) ----
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status.',
        allowed: APPLICATION_STATUSES
      });
    }

    const [result] = await pool.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (status === 'Approved') {
      const [[app]] = await pool.query(
        'SELECT pet_id, applicant_name FROM applications WHERE id = ?',
        [req.params.id]
      );

      await pool.query(
        "UPDATE pets SET status = 'adopted', adopted_at = NOW(), adopted_by = ? WHERE id = ?",
        [app.applicant_name, app.pet_id]
      );
    }

    res.json({ message: 'Status updated', status });

  } catch (error) {
    console.error('Greška pri promjeni statusa:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;
