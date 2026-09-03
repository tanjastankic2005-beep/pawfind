require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// Test nalozi za lokalni razvoj — promeni ili obriši pre produkcije.
const TEST_USERS = [
  { name: 'Admin', email: 'admin@pawfind.local', password: 'admin1234', role: 'admin' },
  { name: 'Test korisnik', email: 'user@pawfind.local', password: 'test1234', role: 'user' },
];

async function seedUsers(connection) {
  for (const user of TEST_USERS) {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [user.email]);
    if (existing.length > 0) {
      console.log(`   korisnik ${user.email} već postoji, preskačem`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [user.name, user.email, passwordHash, user.role]
    );
    console.log(`   dodat: ${user.email} / ${user.password}  (${user.role})`);
  }
}

async function seedPets(connection) {
  const [existing] = await connection.query('SELECT COUNT(*) AS count FROM pets');
  if (existing[0].count > 0) {
    console.log('   ljubimci već postoje u bazi, preskačem seed.sql');
    return;
  }

  const sql = fs
    .readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
    .split('\n')
    .filter(line => !/^USE\s/i.test(line.trim()))
    .join('\n');

  await connection.query(sql);
  console.log('   dodato 6 primera ljubimaca iz seed.sql');
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('==> Useri');
  await seedUsers(connection);

  console.log('==> Ljubimci');
  await seedPets(connection);

  await connection.end();
  console.log('\nSeed završen.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
