// lib/models.ts - CREATE THIS FILE
import mongoose from 'mongoose';

// Import all models to register them
import '@/models/FoodItem';
import '@/models/Restaurant';
import '@/models/User';

export function registerModels() {
    console.log('📋 Registered models:', Object.keys(mongoose.models));
    return mongoose.models;
}

export default registerModels;