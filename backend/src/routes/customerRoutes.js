const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(authenticate);

// Both admin and staff can view customers
router.get('/', getCustomers);
router.get('/:id', getCustomerById);

// Staff can create customers; only admin can update/delete
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', authorizeRoles('ADMIN'), deleteCustomer);

module.exports = router;
