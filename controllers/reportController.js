const { pool } = require('../config/db');

exports.reportsPage = async (req, res) => {
  try {
    const [appointments] = await pool.query('SELECT COUNT(*) AS count FROM appointments');
    const [completed] = await pool.query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Completed'");
    const [patients] = await pool.query('SELECT COUNT(*) AS count FROM patients');
    const [inventory] = await pool.query('SELECT SUM(quantity) AS total FROM inventory');

    res.render('reports/index', {
      user: req.session.user,
      stats: {
        appointments: appointments[0].count,
        completed: completed[0].count,
        patients: patients[0].count,
        inventory: inventory[0].total || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Reports error', user: req.session.user });
  }
};
