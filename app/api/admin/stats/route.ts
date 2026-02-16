// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import FoodItem from '@/models/FoodItem';
import User from '@/models/User';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getCurrentUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        // Get counts in parallel
        const [
            totalRestaurants,
            totalFoodItems,
            totalOrders,
            pendingOrders,
            totalUsers,
            revenueResult
        ] = await Promise.all([
            Restaurant.countDocuments(),
            FoodItem.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({
                status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
            }),
            User.countDocuments(),
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data: {
                totalRestaurants,
                totalFoodItems,
                totalOrders,
                pendingOrders,
                totalUsers,
                totalRevenue
            }
        });

    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}