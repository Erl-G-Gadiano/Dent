const { pool } = require('../config/db');

exports.listPatients = async (req, res) => {
  try {
    const [patients] = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.render('patients/index', { user: req.session.user, patients });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Patient listing error', user: req.session.user });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address } = req.body;
    await pool.query(
      'INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, date_of_birth, gender, address, req.session.user.id]
    );
    res.redirect('/patients');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Patient create error', user: req.session.user });
  }
};
