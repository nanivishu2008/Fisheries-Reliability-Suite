import mongoose from 'mongoose';
import { config } from './env.js';

let mongod = null;

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    // Try connecting to configured MongoDB URI (e.g. MongoDB Atlas or local daemon)
    const options = {
      serverSelectionTimeoutMS: 4000,
    };

    console.log(`Connecting to MongoDB at: ${config.mongodbUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    await mongoose.connect(config.mongodbUri, options);
    console.log('MongoDB connected successfully via URI.');
  } catch (err) {
    console.warn(`Standard MongoDB connection failed (${err.message}). Initializing embedded database fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`Embedded MongoDB Memory Server started at: ${uri}`);
      await mongoose.connect(uri);
      console.log('MongoDB fallback memory server connected successfully.');
    } catch (fallbackErr) {
      console.error('Fatal: Could not connect to MongoDB nor start embedded fallback server:', fallbackErr.message);
      throw fallbackErr;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
