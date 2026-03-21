import mongoose from 'mongoose';

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  var __MONGODB__: any | undefined;
}

const cache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  // Use in-memory MongoDB for development/testing if no MONGODB_URI is set
  // or if it's set to 'memory'
  const useMemory = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'memory';
  
  if (useMemory) {
    // Only import mongodb-memory-server when needed (it's large)
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    
    if (!global.__MONGODB__) {
      console.log('⏳ Starting in-memory MongoDB server...');
      // Increase timeout and use specific MongoDB version for better compatibility
      global.__MONGODB__ = await MongoMemoryServer.create({
        instance: {
          timeout: 30000, // 30 seconds timeout
          args: ['--setParameter', 'ttlMonitorSleepSecs=1'],
        },
        binary: {
          version: '7.0.4', // Use a specific MongoDB version
        },
      });
      console.log('✓ In-memory MongoDB server started');
    }
    
    const mongoServer = global.__MONGODB__;
    const mongoUri = mongoServer.getUri();
    
    console.log('✓ Using in-memory MongoDB for development');
    
    if (!cache.promise) {
      cache.promise = mongoose.connect(mongoUri, {
        bufferCommands: false,
      });
    }

    cache.conn = await cache.promise;
    return cache.conn;
  }

  // Use configured MongoDB URI
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

