require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/prisma');

const PORT = process.env.PORT || 5000;

// Test database connection on startup
const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\nEnsure DATABASE_URL and DIRECT_URL are configured correctly');
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
