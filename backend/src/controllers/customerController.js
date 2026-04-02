const prisma = require('../config/prisma');
const { logAction } = require('../utils/auditLogger');

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { sales: true } } },
    });

    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, total: true, isCredit: true, createdAt: true, paymentMethod: true },
        },
      },
    });
    if (!customer)
      return res.status(404).json({ success: false, message: 'Customer not found' });

    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Name is required' });

    const customer = await prisma.customer.create({
      data: { name: name.trim(), phone: phone?.trim() || null, email: email?.trim() || null, address: address?.trim() || null },
    });

    await logAction(req.user.id, 'CREATE', 'CUSTOMER', customer.id, 'SUCCESS', `Created customer: ${customer.name}`);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ success: false, message: 'A customer with this email already exists' });
    await logAction(req.user?.id, 'CREATE', 'CUSTOMER', null, 'FAILED', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Name is required' });

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { name: name.trim(), phone: phone?.trim() || null, email: email?.trim() || null, address: address?.trim() || null },
    });

    await logAction(req.user.id, 'UPDATE', 'CUSTOMER', customer.id, 'SUCCESS', `Updated customer: ${customer.name}`);
    res.json({ success: true, data: customer });
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ success: false, message: 'A customer with this email already exists' });
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Customer not found' });
    await logAction(req.user?.id, 'UPDATE', 'CUSTOMER', parseInt(req.params.id), 'FAILED', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/customers/:id  (Admin only)
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.delete({ where: { id: parseInt(id) } });
    await logAction(req.user.id, 'DELETE', 'CUSTOMER', parseInt(id), 'SUCCESS', `Deleted customer: ${customer.name}`);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Customer not found' });
    await logAction(req.user?.id, 'DELETE', 'CUSTOMER', parseInt(req.params.id), 'FAILED', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
