const express = require('express');
const pool = require('../database/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Cijeli admin dio traži admin prava
router.use(requireAdmin);


// ---- GET /api/admin/stats ----
router.get('/stats', async (req, res) => {
  try {
    const [[totalPets]]     = await pool.query('SELECT COUNT(*) AS total FROM pets');
    const [[availablePets]] = await pool.query("SELECT COUNT(*) AS total FROM pets WHERE status = 'available'");
    const [[adoptedPets]]   = await pool.query("SELECT COUNT(*) AS total FROM pets WHERE status = 'adopted'");
    const [[pendingPets]]   = await pool.query("SELECT COUNT(*) AS total FROM pets WHERE status = 'pending'");
    const [[pendingApps]]   = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Pending'");
    const [[approvedApps]]  = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Approved'");

    res.json({
      totalPets:            totalPets.total,
      availablePets:        availablePets.total,
      adoptedPets:          adoptedPets.total,
      pendingPets:          pendingPets.total,
      pendingApplications:  pendingApps.total,
      approvedApplications: approvedApps.total
    });

  } catch (error) {
    console.error('Greška pri statistici:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- GET /api/admin/pets ----
router.get('/pets', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pets ORDER BY (status = 'pending') DESC, created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- GET /api/admin/applications ----
router.get('/applications', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         applications.id,
         applications.status,
         applications.reason,
         applications.phone,
         applications.city,
         applications.housing_type,
         applications.created_at,
         applications.applicant_name,
         applications.applicant_email,
         users.name  AS user_name,
         users.email AS user_email,
         pets.id     AS pet_id,
         pets.name   AS pet_name,
         pets.image  AS pet_image
       FROM applications
       JOIN pets ON applications.pet_id = pets.id
       LEFT JOIN users ON applications.user_id = users.id
       ORDER BY applications.created_at DESC`
    );

    res.json(rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- GET /api/admin/messages ----
router.get('/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages ORDER BY (reply IS NULL) DESC, created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- PATCH /api/admin/messages/:id/reply ----
router.patch('/messages/:id/reply', async (req, res) => {
  try {
    const reply = (req.body.reply || '').trim();
    if (!reply) return res.status(400).json({ errors: ['Reply cannot be empty.'] });

    const [result] = await pool.query(
      'UPDATE messages SET reply = ?, replied_at = NOW() WHERE id = ?',
      [reply, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Reply saved' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- DELETE /api/admin/messages/:id ----
router.delete('/messages/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;