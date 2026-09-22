const mongoose = require('mongoose');

let mongod = null;

/**
 * Safely sanitizes MongoDB connection string by masking user credentials.
 * @param {string} uri
 * @returns {string}
 */
const sanitizeUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/(:\/\/)([^:@]+):([^@]+)@/, '$1$2:****@');
};

/**
 * Connects to MongoDB using Mongoose.
 * If local primary URI is unreachable and in development/test, attempts fallback.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/planetpulse';
  const cleanUri = sanitizeUri(uri);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.host || cleanUri}`);
  } catch (err) {
    console.warn(`[MongoDB] Primary connection failed for ${cleanUri}: ${err.message}`);

    // If local test/development environment without standalone mongod, fallback to in-memory server
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting fallback in-memory MongoDB instance...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected to fallback database at ${sanitizeUri(memUri)}`);
      } catch (memErr) {
        console.error('[MongoDB] Critical: Failed to establish database connection:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[MongoDB] Critical: Failed to connect to production database');
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection disconnected');
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB, sanitizeUri };
