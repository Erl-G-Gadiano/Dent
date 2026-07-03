const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dental_clinic',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
});
async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        role_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(30),
        date_of_birth DATE,
        gender VARCHAR(20),
        address TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        client_user_id INT,
        title VARCHAR(150) NOT NULL,
        appointment_date DATETIME NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        notes TEXT,
        created_by INT,
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (client_user_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(150) NOT NULL,
        category VARCHAR(100),
        quantity INT NOT NULL DEFAULT 0,
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        supplier VARCHAR(150),
        date_added DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        appointment_id INT,
        type VARCHAR(50) NOT NULL,
        channel VARCHAR(20) NOT NULL,
        message TEXT,
        scheduled_for DATETIME,
        sent_at TIMESTAMP NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_type VARCHAR(50) NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary_json TEXT,
        generated_by INT,
        FOREIGN KEY (generated_by) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const [roleRows] = await connection.query('SELECT COUNT(*) AS count FROM roles');
    if (roleRows[0].count === 0) {
      await connection.query('INSERT INTO roles (name) VALUES (\'Admin\'), (\'Subadmin\'), (\'Client\')');
    }

    const [userRows] = await connection.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, phone, role_id, status) VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = ?), ?)',
        ['System Administrator', 'admin@dentalclinic.com', passwordHash, '+1234567890', 'Admin', 'active']
      );
    }

    const [settingRows] = await connection.query('SELECT COUNT(*) AS count FROM settings');
    if (settingRows[0].count === 0) {
      await connection.query(`
        INSERT INTO settings (setting_key, setting_value, description) VALUES
        ('clinic_name', 'BrightSmile Dental Clinic', 'Clinic display name'),
        ('dark_mode', 'true', 'Enable dark mode by default'),
        ('email_notifications', 'true', 'Enable email reminders'),
        ('sms_notifications', 'true', 'Enable SMS reminders')
      `);
    }

    const [inventoryRows] = await connection.query('SELECT COUNT(*) AS count FROM inventory');
    if (inventoryRows[0].count === 0) {
      await connection.query(`
        INSERT INTO inventory (item_name, category, quantity, unit_price, supplier, date_added) VALUES
        ('Dental Mirror', 'Tools', 4, 15.50, 'MedSupply', '2026-06-01'),
        ('Anesthetic', 'Medication', 20, 45.00, 'PharmaCare', '2026-06-05'),
        ('Gloves', 'Supplies', 100, 7.25, 'MedSupply', '2026-06-10')
      `);
    }
  } finally {
    connection.release();
  }
}

module.exports = { pool, initDatabase };
