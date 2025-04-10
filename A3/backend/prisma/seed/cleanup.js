const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function cleanupDatabase() {
  console.log('Cleaning up existing data...');

  await prisma.eventGuest.deleteMany({});
  await prisma.eventOrganizer.deleteMany({});
  await prisma.userPromotions.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
};
