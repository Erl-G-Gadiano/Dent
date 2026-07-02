const nodemailer = require('nodemailer');
const twilio = require('twilio');

async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'demo@example.com',
      pass: process.env.SMTP_PASS || 'password'
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER || 'demo@example.com',
    to,
    subject,
    text
  });
}

async function sendSms(to, message) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

module.exports = { sendEmail, sendSms };
