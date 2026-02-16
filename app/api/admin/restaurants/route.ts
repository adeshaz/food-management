// app/api/admin/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import FoodItem from '@/models/FoodItem';
import { getCurrentUserFromRequest } from '@/lib/auth';

// GET all restaurants (for admin panel)
export async function GET(request: NextRequest) {
    try {
        console.log('🔄 ADMIN: Fetching all restaurants');

        // Check admin authentication
        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Authentication required'
            }, { status: 401 });
        }

        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search');
        const cuisineType = searchParams.get('cuisineType');
        const featured = searchParams.get('featured');
        const skip = (page - 1) * limit;

        // Build query
        let query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
                { 'contact.email': { $regex: search, $options: 'i' } }
            ];
        }

        if (cuisineType && cuisineType !== 'all') {
            query.cuisineType = cuisineType;
        }

        if (featured && featured !== 'all') {
            query.featured = featured === 'true';
        }

        // Get restaurants with pagination
        const restaurants = await Restaurant.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Restaurant.countDocuments(query);

        console.log(`✅ ADMIN: Found ${restaurants.length} restaurants`);

        return NextResponse.json({
            success: true,
            data: restaurants,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            stats: {
                totalRestaurants: await Restaurant.countDocuments(),
                activeRestaurants: await Restaurant.countDocuments(),
                featuredRestaurants: await Restaurant.countDocuments({ featured: true })
            }
        });

    } catch (error: any) {
        console.error('🔴 ADMIN GET RESTAURANTS ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch restaurants: ' + error.message
        }, { status: 500 });
    }
}

// POST create new restaurant
export async function POST(request: NextRequest) {
    try {
        console.log('🔄 ADMIN: Creating new restaurant');

        // Check admin authentication
        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Authentication required'
            }, { status: 401 });
        }

        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }

        await connectToDatabase();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'cuisineType', 'address', 'contact'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({
                    success: false,
                    message: `${field} is required`
                }, { status: 400 });
            }
        }

        // Set default values
        const restaurantData = {
            ...body,
            rating: body.rating || 0,
            deliveryTime: body.deliveryTime || 30,
            minimumOrder: body.minimumOrder || 0,
            featured: body.featured || false,
            images: body.images || ['/images/restaurants/default.jpg'],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: user._id
        };

        // Create restaurant
        const restaurant = await Restaurant.create(restaurantData);

        console.log(`✅ ADMIN: Created restaurant "${restaurant.name}" (ID: ${restaurant._id})`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant created successfully',
            data: restaurant
        }, { status: 201 });

    } catch (error: any) {
        console.error('🔴 ADMIN CREATE RESTAURANT ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to create restaurant: ' + error.message
        }, { status: 500 });
    }
}