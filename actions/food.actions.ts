// actions/food.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import FoodItem from '../models/FoodItem';
import { revalidatePath } from 'next/cache';
import { CreateFoodItemInput, UpdateFoodItemInput } from '../types/food';

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
        const foodItems = await FoodItem.find({ restaurant: restaurantId }).lean();
        return JSON.parse(JSON.stringify(foodItems));
    } catch (error) {
        console.error('Error fetching restaurant food items:', error);
        return [];
    }
}

export async function createFoodItem(data: CreateFoodItemInput) {
    try {
        await connectDB();

        const foodItem = await FoodItem.create(data);

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

// export async function updateFoodItem(foodItemId: string, data: UpdateFoodItemInput) {
//     try {
//         await connectDB();
//         const foodItem = await FoodItem.findByIdAndUpdate(foodItemId, data, { new: true });

//         if (!foodItem) {
//             return {
//                 success: false,
//                 error: 'Food item not found'
//             };
//         }

//         revalidatePath('/foods');
//         revalidatePath(`/admin/foods/${foodItemId}`);
//         revalidatePath(`/restaurants/${foodItem.restaurant}`);

//         return {
//             success: true,
//             data: JSON.parse(JSON.stringify(foodItem)),
//             message: 'Food item updated successfully'
//         };
//     } catch (error: any) {
//         console.error('Error updating food item:', error);
//         return {
//             success: false,
//             error: error.message || 'Failed to update food item'
//         };
//     }
// }   
// export async function deleteFoodItem(foodItemId: string) {
//     try {
//         await connectDB();
//         const foodItem = await FoodItem.findByIdAndDelete(foodItemId);
//         if (!foodItem) {
//             return {
//                 success: false,
//                 error: 'Food item not found'
//             };
//         }
//         revalidatePath('/foods');
//         revalidatePath('/admin/foods');
//         revalidatePath(`/restaurants/${foodItem.restaurant}`);
//         return {
//             success: true,
//             message: 'Food item deleted successfully'
//         };
//     }
//     catch (error: any) {
//         console.error('Error deleting food item:', error);
//         return {
//             success: false,
//             error: error.message || 'Failed to delete food item'
//         };
//     }
// }