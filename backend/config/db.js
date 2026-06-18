import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50, 
      wtimeoutMS: 2500,
      serverSelectionTimeoutMS: 5000, // Short timeout for faster fallback
      socketTimeoutMS: 10000, 
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("⚠️ Falling back to Local In-Memory Database (MongoMemoryServer)...");
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Local In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`❌ In-Memory Database failed to start: ${memError.message}`);
    }
  }
};
