const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getDashboardStats,
  getRevenueData,
  getTopProductsData,
  getSalesBreakdownData,
  getRecentSales
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(authenticate);

// Main dashboard stats
router.get('/', getDashboardStats);

// Chart data endpoints
router.get('/revenue', getRevenueData);
router.get('/top-products', getTopProductsData);
router.get('/sales-breakdown', getSalesBreakdownData);

// Recent sales
router.get('/recent-sales', getRecentSales);

module.exports = router;
