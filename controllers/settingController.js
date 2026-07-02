const { pool } = require('../config/db');

exports.settingsPage = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings ORDER BY setting_key');
    res.render('settings/index', { user: req.session.user, settings });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Settings error', user: req.session.user });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
    }
    res.redirect('/settings');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Settings update error', user: req.session.user });
  }
};
