const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
} = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// All product routes require authentication
router.use(authenticate);

// Static routes like /low-stock MUST come before dynamic /:id to prevent route shadowing
router.get('/low-stock', getLowStockProducts);

// Standard CRUD routes
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
// Deleting products is an admin-only action
router.delete('/:id', authorizeRoles('ADMIN'), deleteProduct);

// Stock specific route
router.post('/:id/stock', updateStock);

module.exports = router;
