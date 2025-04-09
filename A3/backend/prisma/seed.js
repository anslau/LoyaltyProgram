/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // clear existing user with the same UTORid
  await prisma.user.deleteMany({
    where: { utorid: 'testuser' }
  });

  // create user 
  await prisma.user.create({
    data: {
      utorid: 'testuser',
      password: 'Password123!', 
      email: 'testuser@utoronto.ca',
      role: 'regular',
      name: 'Test User'
    }
  });

  console.log('User created: testuser / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });