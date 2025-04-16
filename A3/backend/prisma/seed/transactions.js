const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function seedTransactions(users, promotions, events) {
  const pointsFromSpent = (spent) => Math.round(spent / 0.25);

  // Purchase by testuser
  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'purchase',
      spent: 20,
      amount: pointsFromSpent(20),
      createdBy: users.cashierUser.utorid,
      remark: 'Initial purchase',
      customerId: users.regularUser.id
    }
  });

  // Redemption request
  const redemption = await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'redemption',
      amount: 50,
      createdBy: users.regularUser.utorid,
      remark: 'Redeeming coffee',
      customerId: users.regularUser.id
    }
  });

  // Adjustment by manager
  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'adjustment',
      amount: -30,
      relatedId: redemption.id,
      createdBy: users.managerUser.utorid,
      remark: 'Fixed overredeem',
      customerId: users.regularUser.id
    }
  });

  // Transfer (gift) from regularUser to eventGuestUser
  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'transfer',
      amount: 25,
      relatedId: users.eventGuestUser.id,
      createdBy: users.regularUser.utorid,
      remark: 'Gift points',
      customerId: users.regularUser.id
    }
  });

  // Transfer (receive) for eventGuestUser
  await prisma.transaction.create({
    data: {
      utorid: users.eventGuestUser.utorid,
      type: 'transfer',
      amount: 25,
      relatedId: users.regularUser.id,
      createdBy: users.regularUser.utorid,
      remark: 'Received points',
      customerId: users.eventGuestUser.id
    }
  });

  // Event award
  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'event',
      amount: 100,
      relatedId: events[0].id,
      createdBy: users.managerUser.utorid,
      remark: 'Attended career fair',
      customerId: users.regularUser.id
    }
  });

  // Additional event award
  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'event',
      amount: 75,
      relatedId: events[1].id,
      createdBy: users.managerUser.utorid,
      remark: 'Workshop participation',
      customerId: users.regularUser.id
    }
  });

  // Additional adjustment
  await prisma.transaction.create({
    data: {
      utorid: users.regularUser.utorid,
      type: 'adjustment',
      amount: 20,
      createdBy: users.managerUser.utorid,
      remark: 'Bonus points adjustment',
      customerId: users.regularUser.id
    }
  });

  // Redemption attempt by user with 0 points
  await prisma.transaction.create({
    data: {
      utorid: users.zeroPointsUser.utorid,
      type: 'redemption',
      amount: 999,
      createdBy: users.zeroPointsUser.utorid,
      remark: 'Exploit attempt',
      customerId: users.zeroPointsUser.id
    }
  });

  // Redemption processing (PATCH-like)
  await prisma.transaction.update({
    where: { id: redemption.id },
    data: {
      processedBy: users.cashierUser.utorid
    }
  });

  // Fill with more transactions for pagination (regularUser)
  for (let i = 1; i <= 25; i++) {
    await prisma.transaction.create({
      data: {
        utorid: users.regularUser.utorid,
        type: 'purchase',
        spent: 5 + i,
        amount: pointsFromSpent(5 + i),
        createdBy: users.cashierUser.utorid,
        remark: `Paginated purchase ${i}`,
        customerId: users.regularUser.id
      }
    });
  }

  // Fill with more transactions for pagination (eventGuestUser)
  for (let i = 1; i <= 10; i++) {
    await prisma.transaction.create({
      data: {
        utorid: users.eventGuestUser.utorid,
        type: 'purchase',
        spent: 3 + i,
        amount: pointsFromSpent(3 + i),
        createdBy: users.cashierUser2.utorid,
        remark: `Paginated guest purchase ${i}`,
        customerId: users.eventGuestUser.id
      }
    });
  }
};