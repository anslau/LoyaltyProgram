const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function seedSuspicious(users, promotions) {
  const pointsFromSpent = (spent) => Math.round(spent / 0.25);

  // Flag cashier2 as suspicious
  await prisma.user.update({
    where: { id: users.cashierUser2.id },
    data: { suspicious: true }
  });

  // Transaction by suspicious cashier
  const flaggedTx = await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'purchase',
      spent: 15,
      amount: pointsFromSpent(15),
      createBy: users.cashierUser2.utorid,
      remark: 'Suspicious purchase',
      customerId: users.regularUser.id  
    }
  });

  await prisma.transaction.update({
    where: { id: flaggedTx.id },
    data: { suspicious: true }
  });

  // Suspicious cashier tries to apply a one-time promotion
  const susPromo = await prisma.promotion.create({
    data: {
      name: 'Sus Check Bonus',
      description: 'Suspicious usage test',
      type: 'one-time',
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000),
      points: 100
    }
  });

  await prisma.userPromotions.create({
    data: {
      userId: users.regularUser.id,
      promotionId: susPromo.id,
      used: false
    }
  });

  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'purchase',
      spent: 30,
      amount: pointsFromSpent(30),
      createBy: users.cashierUser2.utorid,
      remark: 'Suspicious use of promo',
      promotions: {
        create: [
          { promotionId: susPromo.id }
        ]
      },
      suspicious: true,
      customerId: users.regularUser.id
    }
  });

  // Expired + Future promos for visibility testing
  const expired = await prisma.promotion.create({
    data: {
      name: 'Expired Deal',
      type: 'automatic',
      description: 'Already ended',
      startTime: new Date(Date.now() - 2 * 86400000),
      endTime: new Date(Date.now() - 86400000),
      rate: 0.5,
      points: 0
    }
  });

  const future = await prisma.promotion.create({
    data: {
      name: 'Future Launch',
      type: 'automatic',
      description: 'Starts tomorrow',
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 2 * 86400000),
      rate: 0.5,
      points: 0
    }
  });

  await prisma.userPromotions.createMany({
    data: [
      { userId: users.regularUser.id, promotionId: expired.id, used: false },
      { userId: users.regularUser.id, promotionId: future.id, used: false }
    ]
  });

  // Unverified user attempts redemption (should 403 if API enforced)
  await prisma.transaction.create({
    data: {
      utorid: users.unverifiedUser.utorid,
      type: 'redemption',
      amount: 100,
      createBy: users.unverifiedUser.utorid,
      remark: 'Redemption by unverified',
      customerId: users.unverifiedUser.id  
    }
  });
};
