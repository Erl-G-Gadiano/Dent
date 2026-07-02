const { pool } = require('../config/db');

exports.listAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.query(`
      SELECT a.*, p.first_name, p.last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.appointment_date DESC
    `);
    res.render('appointments/index', { user: req.session.user, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Appointment listing error', user: req.session.user });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, title, appointment_date, notes } = req.body;
    await pool.query(
      'INSERT INTO appointments (patient_id, title, appointment_date, notes, created_by, status) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, title, appointment_date, notes, req.session.user.id, 'Pending']
    );
    res.redirect('/appointments');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Appointment create error', user: req.session.user });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE appointments SET status = ?, approved_by = ? WHERE id = ?', [status, req.session.user.id, id]);
    res.redirect('/appointments');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Appointment update error', user: req.session.user });
  }
};
