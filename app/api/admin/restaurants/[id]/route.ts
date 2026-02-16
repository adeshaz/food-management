// app/api/admin/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import FoodItem from '@/models/FoodItem';
import { getCurrentUserFromRequest } from '@/lib/auth';

interface Context {
    params: Promise<{ id: string }>;
}

// GET single restaurant for admin
export async function GET(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params;
        console.log(`🔄 ADMIN: Fetching restaurant ${id}`);

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

        if (!id || id === 'undefined') {
            return NextResponse.json({
                success: false,
                message: 'Invalid restaurant ID'
            }, { status: 400 });
        }

        await connectToDatabase();

        // Find the restaurant
        const restaurant = await Restaurant.findById(id).lean();

        if (!restaurant) {
            console.log(`❌ Restaurant ${id} not found`);
            return NextResponse.json({
                success: false,
                message: 'Restaurant not found'
            }, { status: 404 });
        }

        // Get associated food items
        const foodItems = await FoodItem.find({ restaurant: id })
            .select('name price category isAvailable images rating')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`✅ ADMIN: Found restaurant "${restaurant.name}" with ${foodItems.length} food items`);

        return NextResponse.json({
            success: true,
            data: {
                restaurant,
                foodItems,
                stats: {
                    totalFoodItems: await FoodItem.countDocuments({ restaurant: id }),
                    availableFoodItems: await FoodItem.countDocuments({
                        restaurant: id,
                        isAvailable: true
                    })
                }
            }
        });

    } catch (error: any) {
        console.error('🔴 ADMIN GET RESTAURANT ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch restaurant: ' + error.message
        }, { status: 500 });
    }
}

// PATCH update restaurant
export async function PATCH(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params;
        console.log(`🔄 ADMIN: Updating restaurant ${id}`);

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

        // Find and update restaurant
        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            {
                ...body,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).lean();

        if (!restaurant) {
            return NextResponse.json({
                success: false,
                message: 'Restaurant not found'
            }, { status: 404 });
        }

        console.log(`✅ ADMIN: Updated restaurant "${restaurant.name}"`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: restaurant
        });

    } catch (error: any) {
        console.error('🔴 ADMIN UPDATE RESTAURANT ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to update restaurant: ' + error.message
        }, { status: 500 });
    }
}

// DELETE restaurant
export async function DELETE(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params;
        console.log(`🔄 ADMIN: Deleting restaurant ${id}`);

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

        // Find restaurant first
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return NextResponse.json({
                success: false,
                message: 'Restaurant not found'
            }, { status: 404 });
        }

        // Delete associated food items
        await FoodItem.deleteMany({ restaurant: id });

        // Delete restaurant
        await Restaurant.findByIdAndDelete(id);

        console.log(`✅ ADMIN: Deleted restaurant "${restaurant.name}" and its food items`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant and associated food items deleted successfully'
        });

    } catch (error: any) {
        console.error('🔴 ADMIN DELETE RESTAURANT ERROR:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete restaurant: ' + error.message
        }, { status: 500 });
    }
}