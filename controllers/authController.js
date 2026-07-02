const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

exports.loginPage = (req, res) => {
  res.render('auth/login', { error: null, user: req.session.user || null });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?', [email]);
    if (rows.length === 0) {
      return res.render('auth/login', { error: 'Invalid credentials', user: null });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render('auth/login', { error: 'Invalid credentials', user: null });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      role_id: user.role_id
    };

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Login failed', user: null });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
