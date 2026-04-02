const express = require('express');
const {
  createSale,
  getSales,
  getSaleById,
  getCreditSales,
  getOverdueSales,
} = require('../controllers/salesController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

// IMPORTANT: Static routes MUST come before dynamic /:id
// Otherwise /credit and /overdue would match :id = "credit" / "overdue"
router.get('/credit', getCreditSales);
router.get('/overdue', getOverdueSales);

router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);

module.exports = router;
