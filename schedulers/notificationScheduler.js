const { pool } = require('../config/db');
const { sendEmail, sendSms } = require('../config/notifications');

async function processPendingNotifications() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE status = 'pending' AND scheduled_for <= NOW() ORDER BY scheduled_for ASC LIMIT 50"
    );

    for (const note of rows) {
      try {
        if (note.channel === 'email') {
          // determine recipient email
          let [rec] = await pool.query(
            `SELECT u.email AS user_email, p.email AS patient_email
             FROM notifications n
             LEFT JOIN users u ON n.user_id = u.id
             LEFT JOIN appointments a ON n.appointment_id = a.id
             LEFT JOIN patients p ON a.patient_id = p.id
             WHERE n.id = ?`,
            [note.id]
          );
          rec = rec[0] || {};
          const to = rec.user_email || rec.patient_email;
          if (to) {
            await sendEmail(to, 'Appointment Reminder', note.message || 'Appointment reminder');
            await pool.query('UPDATE notifications SET status = ?, sent_at = NOW() WHERE id = ?', ['sent', note.id]);
            await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [note.user_id, 'send_notification', `Sent email notification id=${note.id} to ${to}`]);
          } else {
            await pool.query('UPDATE notifications SET status = ? WHERE id = ?', ['failed', note.id]);
          }
        } else if (note.channel === 'sms') {
          let [rec] = await pool.query(
            `SELECT u.phone AS user_phone, p.phone AS patient_phone
             FROM notifications n
             LEFT JOIN users u ON n.user_id = u.id
             LEFT JOIN appointments a ON n.appointment_id = a.id
             LEFT JOIN patients p ON a.patient_id = p.id
             WHERE n.id = ?`,
            [note.id]
          );
          rec = rec[0] || {};
          const to = rec.user_phone || rec.patient_phone;
          if (to) {
            await sendSms(to, note.message || 'Appointment reminder');
            await pool.query('UPDATE notifications SET status = ?, sent_at = NOW() WHERE id = ?', ['sent', note.id]);
            await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [note.user_id, 'send_notification', `Sent sms notification id=${note.id} to ${to}`]);
          } else {
            await pool.query('UPDATE notifications SET status = ? WHERE id = ?', ['failed', note.id]);
          }
        }
      } catch (err) {
        console.error('Notification send error for id', note.id, err);
        await pool.query('UPDATE notifications SET status = ? WHERE id = ?', ['failed', note.id]);
      }
    }
  } catch (err) {
    console.error('Failed processing notifications', err);
  }
}

let intervalId = null;

function startNotificationProcessor(intervalMs = 60000) {
  if (intervalId) return;
  intervalId = setInterval(processPendingNotifications, intervalMs);
  // run immediately once
  processPendingNotifications();
}

function stopNotificationProcessor() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

module.exports = { startNotificationProcessor, stopNotificationProcessor };
