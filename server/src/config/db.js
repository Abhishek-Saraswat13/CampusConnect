const mongoose = require('mongoose');

// Cached across calls so repeated invocations reuse the same connection
// instead of opening a new one each time - critical on Vercel, where a
// "warm" serverless instance handles multiple requests and each one calls
// connectDB(). Without this cache, a busy function can rack up dozens of
// simultaneous Mongoose connections and hit MongoDB Atlas's connection
// limit within minutes.
let connectionPromise = null;

/**
 * Connects to MongoDB, or returns the existing connection/in-flight
 * promise if one is already established. Rejects on failure rather than
 * calling process.exit() - a serverless function must not kill its own
 * runtime process, so the caller decides how to react: server.js exits at
 * boot (fail fast for a traditional always-on server), while the Vercel
 * handler returns a 500 for just that one request and lets the next
 * request try again.
 */
function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn.connection;
      })
      .catch((err) => {
        connectionPromise = null; // clear so the next call can retry
        throw err;
      });
  }
  return connectionPromise;
}

module.exports = connectDB;
