const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const deliveryPassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: {
      phone: "8010734901",
    },
    update: {
      password: deliveryPassword,
      role: "DELIVERY",
    },
    create: {
      phone: "8010734901",
      password: deliveryPassword,
      role: "DELIVERY",
    },
  });

  console.log("✅ Delivery user created/updated successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });