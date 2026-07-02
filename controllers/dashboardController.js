const { pool } = require('../config/db');

exports.dashboard = async (req, res) => {
  try {
    const [patients] = await pool.query('SELECT COUNT(*) AS count FROM patients');
    const [appointments] = await pool.query('SELECT COUNT(*) AS count FROM appointments');
    const [revenue] = await pool.query('SELECT COALESCE(SUM(unit_price * quantity), 0) AS total FROM inventory');
    const [lowStock] = await pool.query('SELECT COUNT(*) AS count FROM inventory WHERE quantity < 10');
    const [upcoming] = await pool.query('SELECT * FROM appointments WHERE appointment_date >= NOW() ORDER BY appointment_date ASC LIMIT 5');

    res.render('dashboard', {
      user: req.session.user,
      stats: {
        patients: patients[0].count,
        appointments: appointments[0].count,
        revenue: revenue[0].total,
        lowStock: lowStock[0].count,
        upcoming: upcoming
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Dashboard error', user: req.session.user });
  }
};
