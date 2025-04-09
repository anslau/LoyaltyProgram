// const seedUsers = require('./users');
// const seedPromotions = require('./promotions');
// const seedEvents = require('./events');
// const seedTransactions = require('./transactions');
// const seedSuspicious = require('./suspicious');

// async function main() {
//   const users = await seedUsers();
//   const promos = await seedPromotions(users);
//   const events = await seedEvents(users);
//   await seedTransactions(users, promos, events);
//   await seedSuspicious(users, promos, events);

//   console.log('All seed data inserted successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('Seed script failed:', e);
//     process.exit(1);
//   });

const seedUsers = require('./users');
const seedPromotions = require('./promotions');
const seedEvents = require('./events');
const seedTransactions = require('./transactions');
const seedSuspicious = require('./suspicious');

async function runSeed() {
    console.log('Running seed/index.js...');
  
    const users = await seedUsers();
    const promos = await seedPromotions(users);
    const events = await seedEvents(users);
    await seedTransactions(users, promos, events);
    await seedSuspicious(users, promos, events);
  
    console.log('All seed data inserted successfully!');
  }
  
  module.exports = runSeed;
  