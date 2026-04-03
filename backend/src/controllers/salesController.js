const prisma = require("../config/prisma");
const { createNotification } = require("../utils/alertService");

// CREATE SALE (transactional)
const createSale = async (req, res) => {
  try {
    const { items, isCredit = false, dueDate, paymentMethod = 'CASH' } = req.body;

    // Validate payment method
    const validPaymentMethods = ['CASH', 'TRANSFER', 'CARD'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}` });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Sale must have at least one item" });
    }

    if (isCredit && !dueDate) {
      return res
        .status(400)
        .json({ success: false, message: "Due date is required for credit sales" });
    }

    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;
      const resolvedItems = [];

      // Validate products
      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity <= 0) {
          throw new Error("Each item must have a valid productId and quantity");
        }

        const product = await tx.product.findUnique({
          where: { id: parseInt(productId) },
        });

        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        if (product.quantity < quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.quantity}`
          );
        }

        const subtotal = product.price * quantity;
        total += subtotal;

        resolvedItems.push({
          product,
          quantity,
          subtotal,
        });
      }

      // Create sale
      console.log("Creating sale...", { total, isCredit, dueDate, paymentMethod, userId: req.user.id });
      const newSale = await tx.sale.create({
        data: {
          total,
          isCredit,
          dueDate: dueDate ? new Date(dueDate) : null,
          paymentMethod,
          userId: req.user.id,
        },
      });

      // Create sale items + update stock
      console.log("Creating sale items...");
      console.log("Resolved items:", resolvedItems);
      for (const { product, quantity, subtotal } of resolvedItems) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: product.id,
            quantity,
            price: product.price,
            subtotal,
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            quantity: { decrement: quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: "OUT",
            quantity,
          },
        });
      }

      return await tx.sale.findUnique({
        where: { id: newSale.id },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
      });
    });

    // create alerts (fire-and-forget)
    _postSaleAlerts(sale);

    // Log the sale creation
    const { logAction } = require('../utils/auditLogger');
    await logAction(req.user.id, 'CREATE', 'SALE', sale.id, 'SUCCESS', `Created ${paymentMethod} sale worth ₦${sale.total}${isCredit ? ' (Credit)' : ''}`);

    res.json({ success: true, data: sale });
  } catch (error) {
    // Log failed sale creation
    const { logAction } = require('../utils/auditLogger');
    await logAction(req.user?.id, 'CREATE', 'SALE', null, 'FAILED', error.message);

    res.status(400).json({ success: false, message: error.message });
  }
};

// After sale created, check for alerts (low stock, large sale)
async function _postSaleAlerts(sale) {
  try {
    if (!sale) return;

    // Low stock alerts
    for (const item of sale.items || []) {
      const product = item.product;
      if (product && typeof product.quantity === 'number' && product.quantity < 5) {
        await createNotification({
          message: `Low stock: ${product.name} now has ${product.quantity} units left.`,
          type: 'low_stock',
          email: true,
        });
      }
    }

    // Large sale alert
    const LARGE_SALE_THRESHOLD = 50000;
    if (sale.total >= LARGE_SALE_THRESHOLD) {
      await createNotification({
        message: `Large sale recorded: ₦${sale.total.toFixed(2)} (Sale ID: ${sale.id})`,
        type: 'large_sale',
        email: true,
      });
    }
  } catch (err) {
    console.error('Failed to create post-sale alerts:', err.message || err);
  }
}

// GET ALL SALES
const getSales = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = {};
    let includeClause = {
      items: { include: { product: true } },
      user: {
        select: { id: true, name: true, email: true },
      },
    };

    if (userRole === 'STAFF') {
      // Staff can only see their own sales
      whereClause.userId = userId;
    } else if (userRole === 'ADMIN') {
      // Admin can see all sales and include user information
      includeClause.user = {
        select: { id: true, name: true, email: true },
      };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: includeClause,
    });

    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SALE BY ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET CREDIT SALES
const getCreditSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { isCredit: true },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
      },
    });

    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET OVERDUE SALES
const getOverdueSales = async (req, res) => {
  try {
    const now = new Date();

    const sales = await prisma.sale.findMany({
      where: {
        isCredit: true,
        dueDate: { lt: now },
      },
      orderBy: { dueDate: "asc" },
      include: {
        items: { include: { product: true } },
      },
    });

    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Force recent Prisma Client restart
module.exports = {
  createSale,
  getSales,
  getSaleById,
  getCreditSales,
  getOverdueSales,
};