const prisma = require("../config/prisma");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, sku, price, cost, quantity, minStock, description } =
      req.body;

    // Validate required fields and numeric types
    if (
      !name ||
      !sku ||
      price === undefined ||
      cost === undefined ||
      quantity === undefined ||
      minStock === undefined
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Name, sku, price, cost, quantity, and minStock are required",
        });
    }

    // Parse and validate numbers
    const parsedPrice = price !== "" ? parseFloat(price) : NaN;
    const parsedCost = cost !== "" ? parseFloat(cost) : NaN;
    const parsedQuantity = quantity !== "" ? parseInt(quantity) : NaN;
    const parsedMinStock = minStock !== "" ? parseInt(minStock) : NaN;

    if (
      [parsedPrice, parsedCost, parsedQuantity, parsedMinStock].some((n) =>
        isNaN(n),
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Price, cost, quantity, and minStock must be valid numbers",
        });
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        price: parsedPrice,
        cost: parsedCost,
        quantity: parsedQuantity,
        minStock: parsedMinStock,
        description,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Create Product Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET ALL PRODUCTS (with optional search)
const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = {};
    if (search && search.trim()) {
      whereClause = {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { sku: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
        ],
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { stockMovements: true },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, cost, minStock, description } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check SKU if changing
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        return res
          .status(400)
          .json({ success: false, message: "SKU already exists" });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : undefined,
        sku: sku !== undefined ? sku : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete related stock movements first (or let Prisma handle cascade if configured, but doing explicit is safer without cascade set)
    await prisma.stockMovement.deleteMany({
      where: { productId: parseInt(id) },
    });

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    // Log the product deletion
    const { logAction } = require('../utils/auditLogger');
    await logAction(req.user.id, 'DELETE', 'PRODUCT', parseInt(id), 'SUCCESS', `Deleted product ${product.name}`);

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    // Log failed deletion
    const { logAction } = require('../utils/auditLogger');
    await logAction(req.user?.id, 'DELETE', 'PRODUCT', parseInt(req.params.id), 'FAILED', error.message);

    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// STOCK MANAGEMENT: UPDATE STOCK
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type should be 'IN' or 'OUT', quantity is positive

    if (!quantity || !type || (type !== "IN" && type !== "OUT")) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Valid quantity and type (IN/OUT) are required",
        });
    }

    const parsedQuantity = parseInt(quantity);
    if (parsedQuantity <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Quantity must be greater than zero",
        });
    }

    // Use a transaction to ensure data integrity
    const result = await prisma.$transaction(async (prismaTx) => {
      const product = await prismaTx.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (type === "OUT" && product.quantity < parsedQuantity) {
        throw new Error("Insufficient stock, cannot go negative");
      }

      const newQuantity =
        type === "IN"
          ? product.quantity + parsedQuantity
          : product.quantity - parsedQuantity;

      const updatedProduct = await prismaTx.product.update({
        where: { id: parseInt(id) },
        data: { quantity: newQuantity },
      });

      const movement = await prismaTx.stockMovement.create({
        data: {
          productId: parseInt(id),
          type,
          quantity: parsedQuantity,
        },
      });

      return { product: updatedProduct, movement };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    // Determine if it's a known error from transaction
    if (
      error.message === "Product not found" ||
      error.message === "Insufficient stock, cannot go negative"
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// LOW STOCK DETECTION
const getLowStockProducts = async (req, res) => {
  try {
    // RAW SQL equivalent or Prisma specific filtering
    // In Prisma we can query where field value compares to another field value is supported experimentally,
    // Alternatively, we get all and filter, or use raw query.
    // In newer Prisma (5+), comparing fields is supported via relation / filtering

    // Instead of raw query, fetch products where quantity <= minStock using Prisma if possible.
    // However, Prisma doesn't natively support comparing two columns directly in standard findMany without extra config.
    // We can use a raw query which is simpler and reliable for column comparisons.
    const lowStockProducts = await prisma.$queryRaw`
      SELECT * FROM "Product" WHERE quantity <= "minStock"
    `;

    res.json({ success: true, data: lowStockProducts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
};
