console.log('Running seed script...');
const runSeed = require('./seed/index.js'); // force direct file import

runSeed().catch((e) => {
  console.error('Seed script failed:', e);
  process.exit(1);
});
