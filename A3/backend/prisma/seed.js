/*
 * Database initialization script with sample data for testing
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.eventGuest.deleteMany({});
  await prisma.eventOrganizer.deleteMany({});
  await prisma.userPromotions.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

// Create users with different roles and edge cases
const userData = [
    {
      utorid: 'testuser',
      password: 'Password123!',
      email: 'testuser@utoronto.ca',
      role: 'regular',
      name: 'Test User',
      verified: true
    },
    {
      utorid: 'cashier1',
      password: 'Cashier123!',
      email: 'cashier@utoronto.ca',
      role: 'cashier',
      name: 'Test Cashier',
      verified: true
    },
    {
      utorid: 'manager1',
      password: 'Manager123!',
      email: 'manager@utoronto.ca',
      role: 'manager',
      name: 'Test Manager',
      verified: true
    },
    {
      utorid: 'superuser',
      password: 'Super123!',
      email: 'super@utoronto.ca',
      role: 'superuser',
      name: 'Super User',
      verified: true
    },
    {
      utorid: 'unverified1',
      password: 'Test123!',
      email: 'unverified1@utoronto.ca',
      role: 'regular',
      name: 'Unverified User',
      verified: false
    },
    {
      utorid: 'minimal1',
      password: 'Test123!',
      email: 'minimal1@utoronto.ca',
      role: 'regular',
      name: '',
      verified: true
    },
    {
      utorid: 'redemptionzero',
      password: 'Test123!',
      email: 'redemptionzero@utoronto.ca',
      role: 'regular',
      name: 'No Points',
      verified: true
    },
    {
      utorid: 'eventguest1',
      password: 'Test123!',
      email: 'guest1@utoronto.ca',
      role: 'regular',
      name: 'Event Guest',
      verified: true
    },
    {
      utorid: 'cashier2',
      password: 'Test123!',
      email: 'cashier2@utoronto.ca',
      role: 'cashier',
      name: 'Cashier Two',
      verified: true
    },
    {
      utorid: 'manager2',
      password: 'Test123!',
      email: 'manager2@utoronto.ca',
      role: 'manager',
      name: 'Manager Two',
      verified: true
    }
  ];
  
  const [
    regularUser,
    cashierUser,
    managerUser,
    superUser,
    unverifiedUser,
    minimalUser,
    zeroPointsUser,
    eventGuestUser,
    cashierUser2,
    managerUser2
  ] = await Promise.all(userData.map((u) => prisma.user.create({ data: u })));
  
  console.log('Users created:');
  console.log('- Regular: testuser / Password123!');
  console.log('- Cashier: cashier1 / Cashier123!');
  console.log('- Manager: manager1 / Manager123!');
  console.log('- Superuser: superuser / Super123!');
  console.log('- + 6 additional users for testing.');


  // Create promotions
  const nowDate = new Date();
  
  // Set start time to now and end time to 1 month from now
  const startDate = new Date(nowDate);
  const endDate = new Date(nowDate);
  endDate.setMonth(endDate.getMonth() + 1);
  
  const promotion1 = await prisma.promotion.create({
    data: {
      name: 'Winter Special Discount',
      description: 'Get 2x points for all purchases during winter',
      type: 'automatic',
      startTime: startDate,
      endTime: endDate,
      rate: 0.5, // 50% bonus points
      points: 0
    }
  });

  const promotion2 = await prisma.promotion.create({
    data: {
      name: 'Welcome Bonus',
      description: 'One-time bonus of 100 points for new members',
      type: 'one-time',
      startTime: startDate,
      endTime: endDate,
      points: 100
    }
  });

  console.log('Promotions created:');
  console.log(`- ${promotion1.name}`);
  console.log(`- ${promotion2.name}`);

  // Assign promotions to all users
  const users = [regularUser, cashierUser, managerUser, superUser];
  const promotions = [promotion1, promotion2];
  
  for (const user of users) {
    for (const promotion of promotions) {
      await prisma.userPromotions.create({
        data: {
          userId: user.id,
          promotionId: promotion.id,
          used: false
        }
      });
    }
  }

  // Create events
  // First event starts tomorrow, ends 3 days after
  const tomorrowDate = new Date(nowDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  
  const threeDaysLater = new Date(tomorrowDate);
  threeDaysLater.setDate(threeDaysLater.getDate() + 2);
  
  // Second event a week from now
  const nextWeek = new Date(nowDate);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 1);

  const event1 = await prisma.event.create({
    data: {
      name: 'CS Career Fair',
      description: 'Annual career fair with top tech companies',
      location: 'Bahen Centre',
      startTime: tomorrowDate,
      endTime: threeDaysLater,
      capacity: 100,
      pointsRemain: 1000,
      pointsAwarded: 0,
      published: true
    }
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Coding Competition',
      description: 'Compete with fellow students on coding challenges',
      location: 'Myhal Centre',
      startTime: nextWeek,
      endTime: nextWeekEnd,
      capacity: 50,
      pointsRemain: 500,
      pointsAwarded: 0,
      published: true
    }
  });

  console.log('Events created:');
  console.log(`- ${event1.name}`);
  console.log(`- ${event2.name}`);

  // Add organizers to events
  await prisma.eventOrganizer.create({
    data: {
      eventId: event1.id,
      userId: managerUser.id
    }
  });

  await prisma.eventOrganizer.create({
    data: {
      eventId: event2.id,
      userId: managerUser.id
    }
  });

  // Add guests to events
  await prisma.eventGuest.create({
    data: {
      eventId: event1.id,
      userId: regularUser.id
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  /*
  Users:
  A regular user (testuser)
  A cashier (cashier1)
  A manager (manager1)
  A superuser (superuser)

  Promotions:
  An automatic promotion that doubles points
  A one-time promotion that gives a welcome bonus

  Events:
  A CS Career Fair starting tomorrow
  A Coding Competition starting next week

  All users are assigned both promotions
  The manager is set as the organizer for both events
  The regular user is registered as a guest for the first event.
  */