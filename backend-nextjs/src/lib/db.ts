import mongoose from 'mongoose';

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  var __MONGODB__: any | undefined;
}

const cache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cache;

function getMongoUri() {
  return String(
    process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      process.env.mongodb_url ||
      process.env.MONGO_URL ||
      ''
  ).trim();
}

function getMongoDbName() {
  return String(
    process.env.MONGODB_DB ||
      process.env.MONGODB_DATABASE ||
      process.env.mongodb_db ||
      ''
  ).trim();
}

function isPlaceholderMongoUri(value: string) {
  return (
    !value ||
    value === 'memory' ||
    /USERNAME/i.test(value) ||
    /PASSWORD/i.test(value) ||
    /<db_password>/i.test(value)
  );
}

export function hasConfiguredMongoUri() {
  const value = getMongoUri();
  return Boolean(value) && !isPlaceholderMongoUri(value);
}

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  const mongoUri = getMongoUri();
  const mongoDbName = getMongoDbName();

  // Use in-memory MongoDB only in local development when no real URI is configured.
  const useMemory = !hasConfiguredMongoUri() && process.env.NODE_ENV !== 'production';

  if (useMemory) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');

    if (!global.__MONGODB__) {
      console.log('Starting in-memory MongoDB server...');
      global.__MONGODB__ = await MongoMemoryServer.create({
        instance: {
          timeout: 30000,
          args: ['--setParameter', 'ttlMonitorSleepSecs=1'],
        },
        binary: {
          version: '7.0.4',
        },
      });
      console.log('In-memory MongoDB server started');
    }

    const mongoServer = global.__MONGODB__;
    const memoryMongoUri = mongoServer.getUri();

    if (!cache.promise) {
      cache.promise = mongoose.connect(memoryMongoUri, {
        bufferCommands: false,
      });
    }

    cache.conn = await cache.promise;
    return cache.conn;
  }

  if (!hasConfiguredMongoUri()) {
    throw new Error('MongoDB connection string is not configured. Set MONGODB_URI, MONGODB_URL, or mongodb_url.');
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: mongoDbName || undefined,
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
