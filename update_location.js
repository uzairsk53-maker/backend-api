const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLocations() {
  try {
    await prisma.deliveryBoy.updateMany({
      data: {
        latitude: 21.0100, // Near Jalgaon
        longitude: 75.5600
      }
    });
    console.log("Updated delivery boys with initial real locations!");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
updateLocations();
