require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 3306;
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASSWORD = process.env.DB_PASSWORD || '';
    const DB_NAME = process.env.DB_NAME || 'dental_clinic';

    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    const newPassword = process.env.ADMIN_RESET_PASSWORD || 'Admin123!';
    const hashed = await bcrypt.hash(newPassword, 10);

    const [result] = await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hashed, 'admin@dentalclinic.com']);
    console.log('Updated rows:', result.affectedRows);
    if (result.affectedRows > 0) {
      console.log('Admin password reset to:', newPassword);
    } else {
      console.log('No admin user found with email admin@dentalclinic.com');
    }

    await connection.end();
  } catch (err) {
    console.error('Error resetting admin password:', err.message || err);
    process.exit(1);
  }
})();
