const express = require('express');
const { createStaff } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// All user management routes require authentication
router.use(authenticate);

// Create staff user - Admin only
router.post('/staff', authorizeRoles('ADMIN'), createStaff);

module.exports = router;