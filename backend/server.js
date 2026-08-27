// 1. Uvozimo Express i alat za putanje
const express = require('express');
const path = require('path');
const pets = require('./data/pets');

// 2. Pravimo aplikaciju
const app = express();
const PORT = 3000;

// 3. MIDDLEWARE: serviraj sve iz foldera frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 4. Test ruta — provjera da server živi
app.get('/ping', (req, res) => {
  res.send('pong! nodemon radi!');
});
// API: vrati sve ljubimce
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

// 5. Pokrećemo server
app.listen(PORT, () => {
  console.log(`✅ Server radi na http://localhost:${PORT}`);
});