const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification, clearAllNotifications } = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

// Notifications are available to authenticated users (Admin + Staff)
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

module.exports = router;
