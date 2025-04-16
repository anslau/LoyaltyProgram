const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function seedPromotions(users) {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);

  const promotions = await Promise.all([
    prisma.promotion.create({
      data: {
        name: 'Winter Special Discount',
        description: 'Get 2x points for all purchases during winter',
        type: 'automatic',
        startTime: now,
        endTime: nextMonth,
        rate: 0.5,
        points: 0
      }
    }),
    prisma.promotion.create({
      data: {
        name: 'Welcome Bonus',
        description: 'One-time bonus of 100 points for new members',
        type: 'one-time',
        startTime: now,
        endTime: nextMonth,
        points: 100
      }
    })
  ]);

  // Assign to all users
  for (const user of Object.values(users)) {
    for (const promo of promotions) {
      await prisma.userPromotions.create({
        data: {
          userId: user.id,
          promotionId: promo.id,
          used: false
        }
      });
    }
  }

  return promotions;
};
