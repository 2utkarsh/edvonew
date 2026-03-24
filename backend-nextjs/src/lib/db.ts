import mongoose from 'mongoose';

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  var __MONGODB__: any | undefined;
}

const cache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cache;

const MONGO_URI_ENV_KEYS = [
  'MONGODB_URI',
  'MONGODB_URL',
  'MONGO_URI',
  'MONGO_URL',
  'DATABASE_URL',
  'DATABASE_URI',
  'mongodb_uri',
  'mongodb_url',
  'mongo_uri',
  'mongo_url',
] as const;

const MONGO_DB_ENV_KEYS = [
  'MONGODB_DB',
  'MONGODB_DATABASE',
  'DATABASE_NAME',
  'DB_NAME',
  'mongodb_db',
] as const;

function getFirstConfiguredEnvValue(keys: readonly string[]) {
  for (const key of keys) {
    const value = String(process.env[key] || '').trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function getMongoUri() {
  return getFirstConfiguredEnvValue(MONGO_URI_ENV_KEYS);
}

function getMongoDbName() {
  return getFirstConfiguredEnvValue(MONGO_DB_ENV_KEYS);
}

function isPlaceholderMongoUri(value: string) {
  const normalizedValue = value.trim();

  return (
    !normalizedValue ||
    normalizedValue === 'memory' ||
    /<db_password>/i.test(normalizedValue) ||
    /mongodb(?:\+srv)?:\/\/username:password@/i.test(normalizedValue)
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
    const deploymentHint = process.env.VERCEL
      ? " In Vercel, add MONGODB_URI, MONGO_URI, or DATABASE_URL in the backend project's Project Settings > Environment Variables."
      : '';

    throw new Error(`MongoDB connection string is not configured. Set MONGODB_URI.${deploymentHint}`);
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
