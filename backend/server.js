require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/prisma');

const PORT = process.env.PORT || 5000;

// Start server without connection check (will fail at first DB query if connection is bad)
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log('🔄 Database connection will be tested on first request');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
