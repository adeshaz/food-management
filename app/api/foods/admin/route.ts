// app/api/foods/admin/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FoodItem from '@/models/FoodItem';

export async function GET(request: NextRequest) {
    try {
        console.log('🍽️ ADMIN FOODS API CALLED');

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { restaurantName: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const total = await FoodItem.countDocuments(query);

        // Get foods with pagination
        const foods = await FoodItem.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // ✅ FIXED: Return in the correct structure your page expects
        return NextResponse.json({
            success: true,
            data: foods.map(food => ({
                _id: food._id.toString(),
                name: food.name,
                description: food.description,
                price: food.price,
                category: food.category,
                restaurant: {
                    _id: food.restaurant?.toString(),
                    name: food.restaurantName || 'Unknown Restaurant'
                },
                isAvailable: food.available !== false,
                images: food.images || [],
                createdAt: food.createdAt,
                updatedAt: food.updatedAt
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });

    } catch (error: any) {
        console.error('🔴 ADMIN FOODS API ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch foods: ' + error.message,
            data: [], // Always return empty array on error
            pagination: {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            }
        }, { status: 500 });
    }
}