const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { logAction } = require('../utils/auditLogger');

const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const adminId = req.user.id; // Admin creating the staff

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await logAction(adminId, 'CREATE_STAFF', 'USER', null, 'FAILED', `Email ${email} already exists`);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff user
    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STAFF',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Log successful staff creation
    await logAction(adminId, 'CREATE_STAFF', 'USER', staff.id, 'SUCCESS', `Created staff user ${staff.name} (${staff.email})`);

    res.status(201).json({
      message: 'Staff user created successfully',
      user: staff,
    });
  } catch (error) {
    // Log the error
    await logAction(req.user?.id, 'CREATE_STAFF', 'USER', null, 'FAILED', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createStaff };