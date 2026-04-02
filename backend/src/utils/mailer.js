require('dotenv').config();
const nodemailer = require('nodemailer');

// Create transport: if SMTP env provided, use it; otherwise use a console/json transport for dev
function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development fallback: jsonTransport so messages are returned as JSON objects
  return nodemailer.createTransport({ jsonTransport: true });
}

const transport = createTransport();

async function sendEmailAlert(subject, text, to) {
  try {
    const from = process.env.SMTP_FROM || 'no-reply@bms.local';
    const mail = {
      from,
      to: to || process.env.ADMIN_EMAIL || 'admin@bms.com',
      subject,
      text,
    };

    const info = await transport.sendMail(mail);
    // If using jsonTransport, the message will be in `info.message` or `info` object
    console.log('Email alert sent (development):', info);
    return info;
  } catch (err) {
    console.error('Failed to send email alert:', err.message || err);
    throw err;
  }
}

module.exports = { sendEmailAlert };
