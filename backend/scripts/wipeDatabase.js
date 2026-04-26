/**
 * Deletes every document in all registered Mongoose collections (users, profiles,
 * bookings, orders, etc.). Irreversible.
 *
 * Usage (from backend/):
 *   node scripts/wipeDatabase.js --yes
 *   npm run wipe:database -- --yes
 *   npm run wipe:db -- --yes
 *
 * From project parent folder:
 *   cd backend && npm run wipe:db -- --yes
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

if (!process.argv.includes('--yes')) {
  console.error(
    'Refusing to wipe the database without --yes.\n' +
      'Run:  node scripts/wipeDatabase.js --yes\n' +
      '  or:  npm run wipe:db -- --yes\n' +
      '  or:  npm run wipe:database -- --yes\n' +
      '  (run these from the backend/ folder where package.json is)'
  );
  process.exit(1);
}

require('../models/AttendanceRecord');
require('../models/BusinessProfile');
require('../models/CoachFeedback');
require('../models/CoachPartnershipRequest');
require('../models/CoachProfile');
require('../models/Complaint');
require('../models/GroundBooking');
require('../models/IndoorGround');
require('../models/Notification');
require('../models/Order');
require('../models/Payment');
require('../models/PerformanceEvaluation');
require('../models/PlayerProfile');
require('../models/Product');
require('../models/SportCategory');
require('../models/SystemSettings');
require('../models/TrainingPlan');
require('../models/TrainingRequest');
require('../models/TrainingSession');
require('../models/User');
require('../models/VerificationDocument');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const names = Object.keys(mongoose.models).sort();
  let total = 0;
  for (const name of names) {
    const Model = mongoose.model(name);
    const res = await Model.deleteMany({});
    total += res.deletedCount;
    console.log(`${name}: ${res.deletedCount} document(s) removed`);
  }
  console.log(`\nDone. ${total} document(s) deleted across ${names.length} collection(s).`);
  console.log('Restart the API to re-seed empty SportCategory / IndoorGround if needed.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
