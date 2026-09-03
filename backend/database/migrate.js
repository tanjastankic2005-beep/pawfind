require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Redosled je bitan — kasnije migracije zavise od tabela/kolona koje prave ranije
// (npr. migrate-success-stories.sql menja tabelu koju pravi migrate-success-story-images.sql,
// koji opet čita iz tabele settings koju pravi migrate-settings.sql).
const MIGRATIONS = [
  'migrate-messages.sql',
  'migrate-message-replies.sql',
  'migrate-adopted-info.sql',
  'migrate-description-sr.sql',
  'migrate-pet-images.sql',
  'migrate-settings.sql',
  'migrate-success-story-images.sql',
  'migrate-success-stories.sql',
];

// Greške koje znače "migracija je već primenjena ranije" — bezopasno je preskočiti.
const BENIGN_CODES = new Set(['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_TABLE_EXISTS_ERROR']);

function splitStatements(sql) {
  return (sql + '\n')
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  for (const file of MIGRATIONS) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`\n==> ${file} (fajl ne postoji, preskačem)`);
      continue;
    }

    console.log(`\n==> ${file}`);
    const statements = splitStatements(fs.readFileSync(filePath, 'utf8'));

    for (const statement of statements) {
      if (/^USE\s/i.test(statement)) continue;

      try {
        await connection.query(statement);
        console.log('   OK');
      } catch (err) {
        if (BENIGN_CODES.has(err.code)) {
          console.log(`   preskočeno, već primenjeno (${err.code})`);
        } else {
          console.error(`   GREŠKA: ${err.message}`);
          await connection.end();
          process.exit(1);
        }
      }
    }
  }

  await connection.end();
  console.log('\nSve migracije završene.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
