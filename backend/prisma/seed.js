require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bms.com" },
    update: {
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@bms.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@bms.com" },
    update: {
      password: staffPassword,
      role: "STAFF",
    },
    create: {
      email: "staff@bms.com",
      name: "Staff User",
      password: staffPassword,
      role: "STAFF",
    },
  });

  console.log({ admin, staff });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });