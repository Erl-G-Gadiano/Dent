const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

exports.listUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.*, r.name AS role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    res.render('users/index', { user: req.session.user, users });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Users listing error', user: req.session.user });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [roleRows] = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
    await pool.query(
      'INSERT INTO users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone, roleRows[0].id]
    );
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'User create error', user: req.session.user });
  }
};
