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
    const client_user_id = req.session.user && req.session.user.role === 'Client' ? req.session.user.id : null;
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, client_user_id, title, appointment_date, notes, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, client_user_id, title, appointment_date, notes, req.session.user.id, 'Pending']
    );

    const appointmentId = result.insertId;

    // determine recipient contact: prefer linked user, fallback to patient contact
    const [rows] = await pool.query(
      `SELECT p.email AS patient_email, p.phone AS patient_phone, u.email AS user_email, u.phone AS user_phone
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.client_user_id = u.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    const contact = rows[0] || {};
    const recipientEmail = contact.user_email || contact.patient_email;
    const recipientPhone = contact.user_phone || contact.patient_phone;

    const message = `Reminder: Your appointment '${title}' is scheduled on ${appointment_date}`;

    // schedule email reminder 24 hours before appointment
    if (recipientEmail) {
      const scheduledFor = new Date(Date.parse(appointment_date) - 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO notifications (user_id, appointment_id, type, channel, message, scheduled_for, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [client_user_id || null, appointmentId, 'appointment_reminder', 'email', message, scheduledFor, 'pending']
      );
    }

    // schedule SMS reminder 24 hours before appointment if phone exists
    if (recipientPhone) {
      const scheduledFor = new Date(Date.parse(appointment_date) - 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO notifications (user_id, appointment_id, type, channel, message, scheduled_for, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [client_user_id || null, appointmentId, 'appointment_reminder', 'sms', message, scheduledFor, 'pending']
      );
    }

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
