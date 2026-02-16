// actions/restaurant.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import Restaurant from '../models/Restaurant';
import { revalidatePath } from 'next/cache';
import { CreateRestaurantInput, UpdateRestaurantInput } from '../types/restaurant';

export async function getRestaurants() {
    try {
        await connectDB();
        const restaurants = await Restaurant.find({}).lean();
        return JSON.parse(JSON.stringify(restaurants));
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
}

export async function getRestaurantById(id: string) {
    try {
        await connectDB();
        const restaurant = await Restaurant.findById(id).lean();
        return restaurant ? JSON.parse(JSON.stringify(restaurant)) : null;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
}

export async function createRestaurant(data: CreateRestaurantInput) {
    try {
        await connectDB();

        const restaurant = await Restaurant.create(data);

        revalidatePath('/restaurants');
        revalidatePath('/admin/restaurants');

        return {
            success: true,
            data: JSON.parse(JSON.stringify(restaurant)),
            message: 'Restaurant created successfully'
        };
    } catch (error: any) {
        console.error('Error creating restaurant:', error);
        return {
            success: false,
            error: error.message || 'Failed to create restaurant'
        };
    }
}

export async function updateRestaurant(id: string, data: UpdateRestaurantInput) {
    try {
        await connectDB();

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        ).lean();

        if (!restaurant) {
            return {
                success: false,
                error: 'Restaurant not found'
            };
        }

        revalidatePath('/restaurants');
        revalidatePath('/admin/restaurants');
        revalidatePath(`/restaurants/${id}`);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(restaurant)),
            message: 'Restaurant updated successfully'
        };
    } catch (error: any) {
        console.error('Error updating restaurant:', error);
        return {
            success: false,
            error: error.message || 'Failed to update restaurant'
        };
    }
}

export async function deleteRestaurant(id: string) {
    try {
        await connectDB();

        const restaurant = await Restaurant.findByIdAndDelete(id);

        if (!restaurant) {
            return {
                success: false,
                error: 'Restaurant not found'
            };
        }

        revalidatePath('/restaurants');
        revalidatePath('/admin/restaurants');

        return {
            success: true,
            message: 'Restaurant deleted successfully'
        };
    } catch (error: any) {
        console.error('Error deleting restaurant:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete restaurant'
        };
    }
}