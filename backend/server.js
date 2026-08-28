// OVO MORA BITI PRVI RED
require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./database/db');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Raspakuj JSON iz tijela requesta u req.body
app.use(express.json());
// Sesije — server pamti ko je prijavljen
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7   // 7 dana
  }
}));

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
    // ---- UPIS U BAZU ----
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

    res.status(201).json({
      message: 'Application received',
      id: result.insertId
    });

  } catch (error) {
    console.error('Greška pri slanju prijave:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});
// API: registracija novog korisnika
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ---- VALIDACIJA ----
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push('Please enter your name.');
    }

    if (!email || !email.includes('@')) {
      errors.push('Please enter a valid email address.');
    }

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ---- Postoji li već nalog sa tim emailom? ----
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    // ---- HASHIRAJ LOZINKU ----
    const passwordHash = await bcrypt.hash(password, 10);

    // ---- UPIS U BAZU ----
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash, 'user']
    );

    // ---- ODGOVOR BEZ LOZINKE ----
    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: 'user'
    });

  } catch (error) {
    console.error('Greška pri registraciji:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});
// ---- PRIJAVA ----
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Zapamti korisnika u sesiji
    req.session.userId = user.id;
    req.session.role   = user.role;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Greška pri prijavi:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- KO SAM JA ----
app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (rows.length === 0) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Not logged in' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// ---- ODJAVA ----
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// =========================================
//  MIDDLEWARE: mora biti prijavljen
// =========================================
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  next();
}
// =========================================
//  MIDDLEWARE: mora biti admin
// =========================================
async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    next();

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
}


// =========================================
//  FAVORITI
// =========================================

// Moji favoriti — puni podaci o ljubimcima
app.get('/api/favorites', requireAuth, async (req, res) => {
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


// Samo ID-evi — da znamo koja srca obojiti
app.get('/api/favorites/ids', requireAuth, async (req, res) => {
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


// Dodaj u favorite
app.post('/api/favorites', requireAuth, async (req, res) => {
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


// Ukloni iz favorita
app.delete('/api/favorites/:petId', requireAuth, async (req, res) => {
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
  // ---- MOJE PRIJAVE ----
app.get('/api/applications/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         applications.id,
         applications.status,
         applications.reason,
         applications.created_at,
         pets.id      AS pet_id,
         pets.name    AS pet_name,
         pets.image   AS pet_image,
         pets.species AS pet_species,
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
// =========================================
//  ADMIN: STATISTIKA
// =========================================
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
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


// =========================================
//  ADMIN: SVI LJUBIMCI (i udomljeni)
// =========================================
app.get('/api/admin/pets', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pets ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// =========================================
//  ADMIN: SVE PRIJAVE (tri tabele)
// =========================================
app.get('/api/admin/applications', requireAdmin, async (req, res) => {
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
         users.name   AS user_name,
         users.email  AS user_email,
         pets.id      AS pet_id,
         pets.name    AS pet_name,
         pets.image   AS pet_image
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


// =========================================
//  ADMIN: DODAJ LJUBIMCA
// =========================================
app.post('/api/pets', requireAdmin, async (req, res) => {
  try {
    const {
      name, species, breed, age, gender, size, location,
      description, image, personality, vaccinated, neutered,
      good_with_kids, good_with_dogs, good_with_cats, status
    } = req.body;

    const errors = [];

    if (!name || name.trim().length < 1)          errors.push('Name is required.');
    if (!['dog', 'cat'].includes(species))        errors.push('Species must be dog or cat.');
    if (age === '' || age === undefined || isNaN(Number(age))) errors.push('Age must be a number.');
    if (!gender)                                  errors.push('Gender is required.');
    if (!size)                                    errors.push('Size is required.');
    if (!location)                                errors.push('Location is required.');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const [result] = await pool.query(
      `INSERT INTO pets
         (name, species, breed, age, gender, size, location, description, image, personality,
          vaccinated, neutered, good_with_kids, good_with_dogs, good_with_cats, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(), species, breed || null, Number(age), gender, size, location,
        description || null, image || 'images/pet-1.jpg', personality || null,
        vaccinated ? 1 : 0, neutered ? 1 : 0,
        good_with_kids ? 1 : 0, good_with_dogs ? 1 : 0, good_with_cats ? 1 : 0,
        status || 'available'
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Pet created' });

  } catch (error) {
    console.error('Greška pri dodavanju ljubimca:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// =========================================
//  ADMIN: IZMIJENI LJUBIMCA
// =========================================
app.put('/api/pets/:id', requireAdmin, async (req, res) => {
  try {
    const {
      name, species, breed, age, gender, size, location,
      description, image, personality, vaccinated, neutered,
      good_with_kids, good_with_dogs, good_with_cats, status
    } = req.body;

    const errors = [];

    if (!name || name.trim().length < 1)          errors.push('Name is required.');
    if (!['dog', 'cat'].includes(species))        errors.push('Species must be dog or cat.');
    if (age === '' || age === undefined || isNaN(Number(age))) errors.push('Age must be a number.');
    if (!gender)                                  errors.push('Gender is required.');
    if (!size)                                    errors.push('Size is required.');
    if (!location)                                errors.push('Location is required.');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const [result] = await pool.query(
      `UPDATE pets SET
         name = ?, species = ?, breed = ?, age = ?, gender = ?, size = ?, location = ?,
         description = ?, image = ?, personality = ?,
         vaccinated = ?, neutered = ?, good_with_kids = ?, good_with_dogs = ?, good_with_cats = ?,
         status = ?
       WHERE id = ?`,
      [
        name.trim(), species, breed || null, Number(age), gender, size, location,
        description || null, image || 'images/pet-1.jpg', personality || null,
        vaccinated ? 1 : 0, neutered ? 1 : 0,
        good_with_kids ? 1 : 0, good_with_dogs ? 1 : 0, good_with_cats ? 1 : 0,
        status || 'available',
        req.params.id
      ]
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


// =========================================
//  ADMIN: OBRIŠI LJUBIMCA
// =========================================
app.delete('/api/pets/:id', requireAdmin, async (req, res) => {
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
// =========================================
//  ADMIN: PROMJENA STATUSA PRIJAVE
// =========================================
const APPLICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Completed'
];

app.patch('/api/applications/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    // Samo dozvoljene vrijednosti
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

    // Poslovno pravilo: odobrena prijava → ljubimac je udomljen
    if (status === 'Approved') {
      const [[app]] = await pool.query(
        'SELECT pet_id FROM applications WHERE id = ?',
        [req.params.id]
      );

      await pool.query(
        "UPDATE pets SET status = 'adopted' WHERE id = ?",
        [app.pet_id]
      );
    }

    res.json({ message: 'Status updated', status });

  } catch (error) {
    console.error('Greška pri promjeni statusa:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});


// =========================================
//  404 — API ruta koja ne postoji
// =========================================
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl
  });
});


// =========================================
//  GLOBALNI ERROR HANDLER
//  Mora imati TAČNO četiri argumenta
// =========================================
app.use((err, req, res, next) => {
  console.error('💥 Neuhvaćena greška');
  console.error('   Ruta: ', req.method, req.originalUrl);
  console.error('   Poruka:', err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: 'Something went wrong on the server.'
  });
});