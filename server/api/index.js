require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');
const ensureAdminAccount = require('../src/utils/ensureAdmin');

// Vercel may reuse a "warm" function instance across multiple requests, so
// this promise is cached at module scope: the first request on a given
// instance connects and provisions the admin account, every later request
// on that same warm instance just awaits the already-resolved promise.
// A fresh cold start gets a fresh module scope and runs it again once.
let readyPromise = null;
function ensureReady() {
  if (!readyPromise) {
    readyPromise = connectDB().then(() => ensureAdminAccount());
  }
  return readyPromise;
}

// Vercel's Node.js runtime calls this with standard (req, res) objects,
// which a plain Express app can handle directly - `app` itself is a valid
// (req, res) => {} function, no adapter package needed.
module.exports = async (req, res) => {
  try {
    await ensureReady();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    readyPromise = null; // don't stay stuck on a failed connection - let the next request retry
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Database connection failed', data: null }));
    return;
  }
  return app(req, res);
};
