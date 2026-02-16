// app/api/foods/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FoodItem from '@/models/FoodItem';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        console.log('🍽️ FOODS API CALLED');

        await connectToDatabase();
        console.log('✅ Database connected');

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurant');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const spicy = searchParams.get('spicy');
        const vegetarian = searchParams.get('vegetarian');
        const popular = searchParams.get('popular');
        const sortBy = searchParams.get('sortBy') || 'rating';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const limit = parseInt(searchParams.get('limit') || '12');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // Build query
        let query: any = { available: true };

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
            console.log(`🔍 API: Filtering by category: "${category}"`);
        }

        // ✅ FIXED: Restaurant filter - Convert string ID to ObjectId
        if (restaurantId) {
            // Check if it's a valid MongoDB ObjectId
            if (mongoose.Types.ObjectId.isValid(restaurantId)) {
                query.restaurant = new mongoose.Types.ObjectId(restaurantId);
                console.log(`🔍 Filtering by restaurant ID: ${restaurantId}`);
            } else {
                // Fallback to restaurantName if not a valid ObjectId
                query.restaurantName = restaurantId;
                console.log(`🔍 Filtering by restaurant name: ${restaurantId}`);
            }
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Spicy filter
        if (spicy === 'true') {
            query.spicyLevel = { $gt: 0 };
        }

        // Vegetarian filter
        if (vegetarian === 'true') {
            query.isVegetarian = true;
        }

        // Popular filter
        if (popular === 'true') {
            query.isPopular = true;
        }

        // Build sort object
        const sort: any = {};
        switch (sortBy) {
            case 'rating':
                sort.rating = sortOrder === 'asc' ? 1 : -1;
                break;
            case 'price':
                sort.price = sortOrder === 'asc' ? 1 : -1;
                break;
            case 'popular':
                sort.isPopular = -1;
                sort.rating = -1;
                break;
            case 'prepTime':
                sort.preparationTime = sortOrder === 'asc' ? 1 : -1;
                break;
            case 'newest':
                sort.createdAt = sortOrder === 'asc' ? 1 : -1;
                break;
            default:
                sort.rating = -1;
        }

        console.log('🔍 Query:', JSON.stringify(query));

        // ✅ FIXED: Execute query WITHOUT POPULATION (since we have restaurantName field)
        const foods = await FoodItem.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await FoodItem.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        console.log(`✅ Found ${foods.length} foods out of ${total}`);

        // Transform data
        const transformedFoods = foods.map((food: any) => ({
            id: food._id.toString(),
            _id: food._id.toString(),
            name: food.name,
            description: food.description,
            price: food.price,
            originalPrice: food.originalPrice || null,
            discount: food.discount || 0,
            category: food.category,
            restaurant: food.restaurant?.toString(), // Keep as string
            restaurantId: food.restaurant?.toString(),
            restaurantName: food.restaurantName || 'Unknown Restaurant',
            images: food.images || [],
            ingredients: food.ingredients || [],
            preparationTime: food.preparationTime,
            spicyLevel: food.spicyLevel,
            isVegetarian: food.isVegetarian,
            isPopular: food.isPopular,
            rating: food.rating,
            ratingCount: food.ratingCount,
            calories: food.calories,
            tags: food.tags || [],
            available: food.available,
            createdAt: food.createdAt,
            updatedAt: food.updatedAt
        }));

        return NextResponse.json({
            success: true,
            foods: transformedFoods,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                category,
                search,
                minPrice,
                maxPrice,
                spicy,
                vegetarian,
                popular
            }
        });

    } catch (error: any) {
        console.error('🔴 FOODS API ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch foods: ' + error.message,
            foods: [] // Always return empty array on error
        }, { status: 500 });
    }
}


// In the POST method of the same file, add restaurantName:
export async function POST(request: NextRequest) {
    try {
        console.log('🍽️ CREATE FOOD API CALLED');

        await connectToDatabase();

        const body = await request.json();

        // Basic validation
        if (!body.name || !body.price || !body.category || !body.restaurantId) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }

        // Import Restaurant model
        const Restaurant = (await import('@/models/Restaurant')).default;

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(body.restaurantId);
        if (!restaurant) {
            return NextResponse.json({
                success: false,
                message: 'Restaurant not found'
            }, { status: 404 });
        }

        // ✅ FIXED: Create food item WITH restaurantName
        const foodItem = new FoodItem({
            name: body.name,
            description: body.description,
            price: body.price,
            originalPrice: body.originalPrice || body.price,
            discount: body.discount || 0,
            category: body.category,
            restaurant: body.restaurantId, // ObjectId
            restaurantName: restaurant.name, // ✅ ADD THIS: String name
            images: body.images || [],
            ingredients: body.ingredients || [],
            preparationTime: body.preparationTime || 20,
            spicyLevel: body.spicyLevel || 0,
            calories: body.calories,
            isVegetarian: body.isVegetarian || false,
            isPopular: body.isPopular || false,
            tags: body.tags || []
        });

        await foodItem.save();

        console.log('✅ Food item created:', foodItem._id);

        return NextResponse.json({
            success: true,
            message: 'Food item created successfully',
            food: {
                id: foodItem._id.toString(),
                name: foodItem.name,
                price: foodItem.price,
                restaurantName: restaurant.name
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('🔴 CREATE FOOD ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to create food item: ' + error.message
        }, { status: 500 });
    }
}