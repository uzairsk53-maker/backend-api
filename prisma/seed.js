const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

 await prisma.user.upsert({
  where: {
    phone: "7385826947",
  },
  update: {
    password: hashedPassword,
    role: "ADMIN",
  },
  create: {
    phone: "7385826947",
    password: hashedPassword,
    role: "ADMIN",
  },
});

  console.log("✅ Admin created/updated successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });