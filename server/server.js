require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const ensureAdminAccount = require('./src/utils/ensureAdmin');

const PORT = process.env.PORT || 5000;

// This entry point is for a traditional always-on server (local dev,
// Render, or any other host that runs `npm start` and keeps the process
// alive). For Vercel, see api/index.js instead - serverless functions
// can't call app.listen().
async function start() {
  try {
    await connectDB();
    await ensureAdminAccount();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`CampusConnect API listening on port ${PORT}`);
  });
}

start();

module.exports = app;
