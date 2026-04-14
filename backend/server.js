const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const { isStripeEnabled } = require('./utils/stripePayments');
const { connectDatabase } = require('./config/database');
const SportCategory = require('./models/SportCategory');
const IndoorGround = require('./models/IndoorGround');

async function seedMinimal() {
  const count = await SportCategory.countDocuments();
  if (count === 0) {
    await SportCategory.insertMany([
      { name: 'Cricket', slug: 'cricket', description: 'Indoor / training cricket' },
      { name: 'Badminton', slug: 'badminton', description: 'Indoor badminton' },
    ]);
    console.log('Seeded sport categories');
  }
  const grounds = await IndoorGround.countDocuments();
  if (grounds === 0) {
    await IndoorGround.insertMany([
      {
        name: 'Central Indoor Cricket Arena',
        sportType: 'cricket',
        city: 'Lahore',
        address: 'Demo address',
        isActive: true,
      },
      {
        name: 'Feather Court Badminton',
        sportType: 'badminton',
        city: 'Lahore',
        address: 'Demo address',
        isActive: true,
      },
    ]);
    console.log('Seeded sample indoor grounds');
  }
}

const PORT = process.env.PORT || 5000;

connectDatabase()
  .then(async () => {
    await seedMinimal();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
      if (!isStripeEnabled()) {
        console.warn(
          '[stripe] STRIPE_SECRET_KEY missing or invalid — set sk_test_... / sk_live_... in backend/.env and restart'
        );
      } else {
        console.log('[stripe] Payments enabled');
      }
    });
  })
  .catch((err) => {
    console.error('Failed to start', err);
    process.exit(1);
  });
