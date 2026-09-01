// =========================================
//  PAWFIND — glavni server
// =========================================
require('dotenv').config();

const express = require('express');
const path    = require('path');
const session = require('express-session');

const pool = require('./database/db');

const petsRoutes         = require('./routes/pets');
const authRoutes         = require('./routes/auth');
const applicationsRoutes = require('./routes/applications');
const favoritesRoutes    = require('./routes/favorites');
const adminRoutes        = require('./routes/admin');
const contactRoutes      = require('./routes/contact');
const settingsRoutes     = require('./routes/settings');
const successStoriesRoutes = require('./routes/success-stories');

const app  = express();
const PORT = process.env.PORT || 3000;


// ---------- MIDDLEWARE ----------
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7   // 7 dana
  }
}));

app.use(express.static(path.join(__dirname, '..', 'frontend')));


// ---------- RUTE ----------
app.get('/ping', (req, res) => res.send('pong 🏓'));

app.use('/api/pets',         petsRoutes);
app.use('/api/auth',         authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/favorites',    favoritesRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/success-stories', successStoriesRoutes);


// ---------- 404 za nepostojeće API rute ----------
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl
  });
});


// ---------- GLOBALNI ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error('💥 Neuhvaćena greška');
  console.error('   Ruta: ', req.method, req.originalUrl);
  console.error('   Poruka:', err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: 'Something went wrong on the server.'
  });
});


// ---------- POKRETANJE ----------
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