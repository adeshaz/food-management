// lib/db.ts - UPDATED VERSION
import mongoose, { ConnectOptions } from 'mongoose';

// ✅ ADD THESE MODEL IMPORTS
import '@/models/FoodItem';
import '@/models/Restaurant';
import '@/models/User';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
    console.log('🔗 Connecting to MongoDB...');

    if (cached.conn && mongoose.connection.readyState === 1) {
        console.log('✅ Using existing MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts: ConnectOptions = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        console.log('📋 Connecting with URI:', MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

        cached.promise = mongoose.connect(MONGODB_URI!, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB Connected Successfully');

                // ✅ Log registered models
                console.log('📋 Registered models:', Object.keys(mongoose.models));

                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB Connection Error:', error.message);
                cached.promise = null;
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }

    return cached.conn;
}

// Export with both names for compatibility
export { connectToDatabase };
export const connectDB = connectToDatabase; // Add this alias

export default connectToDatabase;