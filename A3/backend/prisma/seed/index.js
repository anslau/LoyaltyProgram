const seedUsers = require('./users');
const seedPromotions = require('./promotions');
const seedEvents = require('./events');
const seedTransactions = require('./transactions');
const seedSuspicious = require('./suspicious');
const cleanupDatabase = require('./cleanup');

async function runSeed() {
    console.log('Running seed/index.js...');
    await cleanupDatabase(); 
    const users = await seedUsers();
    const promos = await seedPromotions(users);
    const events = await seedEvents(users);
    await seedTransactions(users, promos, events);
    await seedSuspicious(users, promos, events);
  
    console.log('All seed data inserted successfully!');
  }
  
  module.exports = runSeed;
  