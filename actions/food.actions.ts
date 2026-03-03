'use server';

import { connectDB } from '@/lib/db';
import FoodItem from '../models/FoodItem';
import { revalidatePath } from 'next/cache';
import { CreateFoodItemInput, UpdateFoodItemInput } from '../types/food';
import mongoose from 'mongoose';

export async function getFoodItems() {
    try {
        await connectDB();
        const foodItems = await FoodItem.find({})
            .populate('restaurant', 'name')
            .lean();
        return JSON.parse(JSON.stringify(foodItems));
    } catch (error) {
        console.error('Error fetching food items:', error);
        return [];
    }
}

export async function getFoodItemsByRestaurant(restaurantId: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            console.error('Invalid restaurant ID:', restaurantId);
            return [];
        }

        // Cast restaurantId to any to satisfy TypeScript
        const foodItems = await FoodItem.find({
            restaurant: restaurantId as any
        }).lean();

        return JSON.parse(JSON.stringify(foodItems));
    } catch (error) {
        console.error('Error fetching restaurant food items:', error);
        return [];
    }
}

export async function createFoodItem(data: CreateFoodItemInput) {
    try {
        await connectDB();

        // Cast data to any because Mongoose accepts string IDs
        const foodItem = await FoodItem.create(data as any);

        revalidatePath('/foods');
        revalidatePath('/admin/foods');
        revalidatePath(`/restaurants/${data.restaurant}`);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(foodItem)),
            message: 'Food item created successfully'
        };
    } catch (error: any) {
        console.error('Error creating food item:', error);
        return {
            success: false,
            error: error.message || 'Failed to create food item'
        };
    }
}

// The commented functions remain unchanged...