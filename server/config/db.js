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

const resolveMongoUri = () => {
  const configuredUri = process.env.MONGODB_URI?.trim();

  if (configuredUri) {
    if (process.env.NODE_ENV === 'production') {
      let hostname;

      try {
        hostname = new URL(configuredUri).hostname.toLowerCase().replace(/\.$/, '');
      } catch {
        throw new Error('MONGODB_URI must be a valid MongoDB connection string in production');
      }

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        throw new Error('MONGODB_URI must not point to localhost in production');
      }
    }

    return configuredUri;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is required in production');
  }

  return 'mongodb://127.0.0.1:27017/planetpulse';
};

/**
 * Connects to MongoDB using Mongoose.
 * If local primary URI is unreachable and in development/test, attempts fallback.
 */
const connectDB = async () => {
  const uri = resolveMongoUri();

  if (process.env.MONGODB_URI) {
    console.log('[MongoDB] Using configured database connection');
  } else {
    console.log('[MongoDB] Using local development database');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('[MongoDB] Connected successfully');
  } catch (err) {
    console.warn('[MongoDB] Database connection attempt failed');

    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting fallback in-memory MongoDB instance...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log('[MongoDB] Connected to fallback database');
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

module.exports = { connectDB, disconnectDB, sanitizeUri, resolveMongoUri };
