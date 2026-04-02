const prisma = require('../config/prisma');
const { sendEmailAlert } = require('./mailer');

async function createNotification({ message, type = 'info', email = false, emailTo }) {
  const note = await prisma.notification.create({
    data: {
      message,
      type,
    },
  });

  if (email) {
    try {
      await sendEmailAlert(`Alert: ${type}`, message, emailTo);
    } catch (err) {
      console.error('Email send failed for notification:', err.message || err);
    }
  }

  return note;
}

module.exports = { createNotification };
