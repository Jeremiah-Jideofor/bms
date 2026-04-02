const prisma = require('../config/prisma');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id: parseInt(id) } });

    const { logAction } = require('../utils/auditLogger');
    await logAction(req.user?.id, 'DELETE', 'NOTIFICATION', parseInt(id), 'SUCCESS', `Deleted notification ${id}`);

    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications (clear all)
const clearAllNotifications = async (req, res) => {
  try {
    const { count } = await prisma.notification.deleteMany({});

    const { logAction } = require('../utils/auditLogger');
    await logAction(req.user?.id, 'DELETE', 'NOTIFICATION', null, 'SUCCESS', `Cleared all notifications (${count} deleted)`);

    res.json({ success: true, message: `${count} notifications cleared` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification, clearAllNotifications };
