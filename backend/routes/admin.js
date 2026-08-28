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
    const [[pendingApps]]   = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Pending'");
    const [[approvedApps]]  = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Approved'");

    res.json({
      totalPets:            totalPets.total,
      availablePets:        availablePets.total,
      adoptedPets:          adoptedPets.total,
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
    const [rows] = await pool.query('SELECT * FROM pets ORDER BY created_at DESC');
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


module.exports = router;