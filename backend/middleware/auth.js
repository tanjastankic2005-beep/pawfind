const pool = require('../database/db');


// Mora biti prijavljen
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  next();
}


// Mora biti admin
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


module.exports = { requireAuth, requireAdmin };