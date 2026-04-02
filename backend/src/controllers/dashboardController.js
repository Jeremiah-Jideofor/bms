const prisma = require("../config/prisma");

const getDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const now = new Date();
    const userRole = req.user.role;
    const userId = req.user.id;

    // Base where clauses for sales filtering
    const salesWhereClause = userRole === 'STAFF' ? { userId } : {};

    const [totalProducts, todaySales, lowStockItems, overdueCredits] =
      await Promise.all([
        prisma.product.count(),

        prisma.sale.aggregate({
          _sum: { total: true },
          where: {
            ...salesWhereClause,
            createdAt: {
              gte: startOfDay,
            },
          },
        }),

        prisma.product.count({
          where: {
            quantity: {
              lte: 5,
            },
          },
        }),

        prisma.sale.count({
          where: {
            ...salesWhereClause,
            isCredit: true,
            dueDate: {
              lt: now,
            },
          },
        }),
      ]);

    res.json({
      totalProducts,
      salesToday: todaySales._sum.total || 0,
      lowStockItems,
      overdueCredits,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

const getRevenueData = async (req, res) => {
  try {
    console.log("Fetching revenue data from Sales...");
    
    const data = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt")::date as month,
        CAST(SUM("total") AS FLOAT) as revenue
      FROM "Sale"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;
    
    console.log("Revenue data fetched successfully:", data);
    
    // Ensure numeric conversion
    const formattedData = data.map(row => ({
      month: row.month ? row.month.toISOString().split('T')[0] : null,
      revenue: parseFloat(row.revenue) || 0,
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error("Revenue Data Error:", error.message, error);
    res.status(500).json({ 
      message: "Failed to fetch revenue data",
      error: error.message 
    });
  }
};

const getTopProductsData = async (req, res) => {
  try {
    console.log("Fetching top products data...");
    
    const data = await prisma.$queryRaw`
      SELECT 
        p."name",
        CAST(SUM(si."quantity") AS INTEGER) as "totalSold"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      GROUP BY p.id, p."name"
      ORDER BY "totalSold" DESC
      LIMIT 5
    `;
    
    console.log("Top products data fetched successfully:", data);
    
    // Ensure numeric conversion
    const formattedData = data.map(row => ({
      name: row.name || 'Unknown',
      totalSold: parseInt(row.totalSold) || 0,
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error("Top Products Data Error:", error.message, error);
    res.status(500).json({ 
      message: "Failed to fetch top products data",
      error: error.message 
    });
  }
};

const getSalesBreakdownData = async (req, res) => {
  try {
    console.log("Fetching sales breakdown data...");
    
    const data = await prisma.$queryRaw`
      SELECT 
        CASE WHEN "isCredit" = true THEN 'Credit' ELSE 'Cash' END as type,
        CAST(COUNT(*) AS INTEGER) as count,
        CAST(SUM("total") AS FLOAT) as total
      FROM "Sale"
      GROUP BY "isCredit"
      ORDER BY "isCredit" ASC
    `;
    
    console.log("Sales breakdown data fetched successfully:", data);
    
    // Ensure numeric conversion
    const formattedData = data.map(row => ({
      type: row.type || 'Unknown',
      count: parseInt(row.count) || 0,
      total: parseFloat(row.total) || 0,
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error("Sales Breakdown Data Error:", error.message, error);
    res.status(500).json({ 
      message: "Failed to fetch sales breakdown data",
      error: error.message 
    });
  }
};

const getRecentSales = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    // Staff can only see their own sales
    const whereClause = userRole === 'STAFF' ? { userId } : {};

    const limit = parseInt(req.query.limit) || 10;

    const recentSales = await prisma.sale.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        total: true,
        createdAt: true,
        isCredit: true,
        user: { select: { name: true } },
        customer: { select: { name: true } },
      },
    });

    res.json({ success: true, data: recentSales });
  } catch (error) {
    console.error("Recent Sales Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch recent sales",
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueData,
  getTopProductsData,
  getSalesBreakdownData,
  getRecentSales,
};
