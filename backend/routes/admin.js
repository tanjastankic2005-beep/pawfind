const express = require('express');
const multer  = require('multer');
const pool = require('../database/db');
const { requireAdmin } = require('../middleware/auth');
const { upload, imagePathOf } = require('../middleware/upload');

const router = express.Router();

// Cijeli admin dio traži admin prava
router.use(requireAdmin);

function handleHeroUpload(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Photo must be 5MB or smaller.'
        : error.message;
      return res.status(400).json({ errors: [message] });
    }
    if (error) return next(error);
    next();
  });
}


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


// ---- GET /api/admin/images ----
// Sve slike koje su ikad sačuvane uz nekog ljubimca — odatle admin bira sliku za početnu stranicu.
router.get('/images', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT image, MAX(id) AS latest_id FROM pet_images
       GROUP BY image ORDER BY latest_id DESC LIMIT 200`
    );

    res.json(rows.map(row => row.image));

  } catch (error) {
    console.error('Greška pri čitanju slika:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


async function setHeroImage(image) {
  await pool.query(
    `INSERT INTO settings (setting_key, setting_value) VALUES ('hero_image', ?)
     ON DUPLICATE KEY UPDATE setting_value = ?`,
    [image, image]
  );
}

// ---- PUT /api/admin/settings/hero-image (izbor iz postojećih slika) ----
router.put('/settings/hero-image', async (req, res) => {
  try {
    const image = (req.body.image || '').trim();
    if (!image) return res.status(400).json({ errors: ['No image selected.'] });

    await setHeroImage(image);
    res.json({ message: 'Home page image updated', hero_image: image });

  } catch (error) {
    console.error('Greška pri promjeni slike na početnoj:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- POST /api/admin/settings/hero-image/upload (potpuno nova slika) ----
router.post('/settings/hero-image/upload', handleHeroUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ errors: ['No photo uploaded.'] });

    const image = imagePathOf(req.file);
    await setHeroImage(image);
    res.json({ message: 'Home page image updated', hero_image: image });

  } catch (error) {
    console.error('Greška pri otpremanju slike za početnu:', error.message);
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