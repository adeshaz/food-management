// app/api/admin/restaurants/[id]/food-items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FoodItem from '@/models/FoodItem';
import { getCurrentUserFromRequest } from '@/lib/auth';

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params;

        console.log('🔍 ADMIN GET /api/admin/restaurants/[id]/food-items called:', { id });

        // Check admin authentication
        const user = await getCurrentUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                error: 'Admin access required'
            }, { status: 403 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const available = searchParams.get('available');
        const search = searchParams.get('search');
        const limit = searchParams.get('limit');

        // Build query
        let query: any = { restaurant: id };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (available && available !== 'all') {
            query.isAvailable = available === 'true';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        let queryBuilder = FoodItem.find(query)
            .sort({ category: 1, name: 1 });

        if (limit && !isNaN(parseInt(limit))) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }

        const foodItems = await queryBuilder.lean();

        // Get food item stats
        const stats = {
            total: await FoodItem.countDocuments({ restaurant: id }),
            available: await FoodItem.countDocuments({ restaurant: id, isAvailable: true }),
            byCategory: await FoodItem.aggregate([
                { $match: { restaurant: id } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ])
        };

        console.log(`✅ Admin found ${foodItems.length} food items for restaurant ${id}`);

        return NextResponse.json({
            success: true,
            data: foodItems,
            stats
        });

    } catch (error: any) {
        console.error('🔴 ADMIN GET RESTAURANT FOOD ITEMS ERROR:', error.message);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch food items: ' + error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params;

        console.log('➕ ADMIN POST /api/admin/restaurants/[id]/food-items called:', { id });

        // Check admin authentication
        const user = await getCurrentUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                error: 'Admin access required'
            }, { status: 403 });
        }

        await connectToDatabase();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'price', 'category'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({
                    success: false,
                    error: `${field} is required`
                }, { status: 400 });
            }
        }

        // Check if restaurant exists
        const restaurantExists = await connectToDatabase().then(() =>
            Restaurant.exists({ _id: id })
        );

        if (!restaurantExists) {
            return NextResponse.json({
                success: false,
                error: 'Restaurant not found'
            }, { status: 404 });
        }

        // Set default values
        const foodItemData = {
            ...body,
            restaurant: id,
            restaurantName: body.restaurantName || 'Unknown',
            isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
            images: body.images || ['/images/foods/default.jpg'],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Create food item
        const foodItem = await FoodItem.create(foodItemData);

        console.log(`✅ Admin created food item: ${foodItem.name} for restaurant ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Food item created successfully',
            data: foodItem
        }, { status: 201 });

    } catch (error: any) {
        console.error('🔴 ADMIN CREATE FOOD ITEM ERROR:', error.message);
        return NextResponse.json({
            success: false,
            error: 'Failed to create food item: ' + error.message
        }, { status: 500 });
    }
}