const express = require('express');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const pool = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();


// ---- Upload slika ----
const uploadsDir = path.join(__dirname, '..', '..', 'frontend', 'images', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

function handleUpload(req, res, next) {
  upload.array('images', 8)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Each photo must be 5MB or smaller.'
        : error.code === 'LIMIT_FILE_COUNT'
          ? 'You can upload up to 8 photos.'
          : error.message;
      return res.status(400).json({ errors: [message] });
    }
    if (error) return next(error);
    next();
  });
}

function imagePathOf(file) {
  return `images/uploads/${file.filename}`;
}

function deleteImageFiles(imagePaths) {
  for (const imagePath of imagePaths) {
    if (!imagePath || !imagePath.startsWith('images/uploads/')) continue;
    fs.unlink(path.join(__dirname, '..', '..', 'frontend', imagePath), () => {});
  }
}


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

    if (rows.length > 0) {
      const [images] = await pool.query(
        'SELECT pet_id, id, image FROM pet_images WHERE pet_id IN (?) ORDER BY sort_order ASC, id ASC',
        [rows.map(pet => pet.id)]
      );

      const imagesByPet = {};
      for (const img of images) {
        (imagesByPet[img.pet_id] ??= []).push({ id: img.id, image: img.image });
      }

      for (const pet of rows) {
        pet.images = imagesByPet[pet.id] || [];
      }
    }

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

    const [images] = await pool.query(
      'SELECT id, image FROM pet_images WHERE pet_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );

    res.json({ ...rows[0], images });

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

function isTrue(value) {
  return value === true || value === 'true' || value === '1' || value === 'on';
}

function petValues(b, image, status) {
  return [
    b.name.trim(), b.species, b.breed || null, Number(b.age), b.gender, b.size, b.location,
    b.description || null, b.description_sr || null, image || 'images/pet-1.jpg', b.personality || null,
    isTrue(b.vaccinated) ? 1 : 0, isTrue(b.neutered) ? 1 : 0,
    isTrue(b.good_with_kids) ? 1 : 0, isTrue(b.good_with_dogs) ? 1 : 0, isTrue(b.good_with_cats) ? 1 : 0,
    status || 'available'
  ];
}

async function insertPet(body, files, status) {
  const uploadedImages = (files || []).map(imagePathOf);
  const coverImage = uploadedImages[0];

  const [result] = await pool.query(
    `INSERT INTO pets
       (name, species, breed, age, gender, size, location, description, description_sr, image, personality,
        vaccinated, neutered, good_with_kids, good_with_dogs, good_with_cats, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    petValues(body, coverImage, status)
  );

  if (uploadedImages.length > 0) {
    await pool.query(
      'INSERT INTO pet_images (pet_id, image, sort_order) VALUES ?',
      [uploadedImages.map((image, index) => [result.insertId, image, index])]
    );
  }

  return result.insertId;
}


// ---- POST /api/pets (admin) ----
router.post('/', requireAdmin, handleUpload, async (req, res) => {
  try {
    const errors = validatePet(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const id = await insertPet(req.body, req.files, req.body.status);
    res.status(201).json({ id, message: 'Pet created' });

  } catch (error) {
    console.error('Greška pri dodavanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- POST /api/pets/submit (bilo koji prijavljeni korisnik) ----
// Ljubimci koje doda običan korisnik idu u status "pending" dok ih admin ne pregleda i objavi.
router.post('/submit', requireAuth, handleUpload, async (req, res) => {
  try {
    const errors = validatePet(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const id = await insertPet(req.body, req.files, 'pending');
    res.status(201).json({ id, message: 'Pet submitted for review' });

  } catch (error) {
    console.error('Greška pri slanju ljubimca na pregled:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- PUT /api/pets/:id (admin) ----
router.put('/:id', requireAdmin, handleUpload, async (req, res) => {
  try {
    const errors = validatePet(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const petId = req.params.id;

    // Ukloni slike koje je admin izbrisao u formi
    let deleteImageIds = [];
    if (req.body.deleteImageIds) {
      try { deleteImageIds = JSON.parse(req.body.deleteImageIds); } catch { deleteImageIds = []; }
    }

    if (deleteImageIds.length > 0) {
      const [toDelete] = await pool.query(
        'SELECT image FROM pet_images WHERE pet_id = ? AND id IN (?)',
        [petId, deleteImageIds]
      );
      await pool.query('DELETE FROM pet_images WHERE pet_id = ? AND id IN (?)', [petId, deleteImageIds]);
      deleteImageFiles(toDelete.map(row => row.image));
    }

    // Dodaj nove slike na kraj redoslijeda
    const uploadedImages = (req.files || []).map(imagePathOf);
    if (uploadedImages.length > 0) {
      const [[{ maxOrder }]] = await pool.query(
        'SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM pet_images WHERE pet_id = ?',
        [petId]
      );
      await pool.query(
        'INSERT INTO pet_images (pet_id, image, sort_order) VALUES ?',
        [uploadedImages.map((image, index) => [petId, image, maxOrder + 1 + index])]
      );
    }

    const [[coverRow]] = await pool.query(
      'SELECT image FROM pet_images WHERE pet_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1',
      [petId]
    );
    const coverImage = coverRow ? coverRow.image : null;

    const [result] = await pool.query(
      `UPDATE pets SET
         name = ?, species = ?, breed = ?, age = ?, gender = ?, size = ?, location = ?,
         description = ?, description_sr = ?, image = ?, personality = ?,
         vaccinated = ?, neutered = ?, good_with_kids = ?, good_with_dogs = ?, good_with_cats = ?,
         status = ?
       WHERE id = ?`,
      [...petValues(req.body, coverImage, req.body.status), petId]
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
    const [images] = await pool.query('SELECT image FROM pet_images WHERE pet_id = ?', [req.params.id]);

    const [result] = await pool.query('DELETE FROM pets WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    deleteImageFiles(images.map(row => row.image));

    res.json({ message: 'Pet deleted' });

  } catch (error) {
    console.error('Greška pri brisanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;
