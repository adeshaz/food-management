// app/api/admin/dashboard/route.ts - ADD THIS FILE
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Restaurant from '@/models/Restaurant';
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);

        const thisMonth = new Date();
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        // Run all queries in parallel
        const [
            totalOrders,
            todayOrders,
            thisWeekOrders,
            thisMonthOrders,
            pendingOrders,
            pendingPayments,
            totalUsers,
            totalRestaurants,
            revenueStats,
            ordersByStatus,
            ordersByPaymentMethod,
            recentOrders
        ] = await Promise.all([
            // Total orders
            Order.countDocuments(),

            // Today's orders
            Order.countDocuments({ createdAt: { $gte: today } }),

            // This week's orders
            Order.countDocuments({ createdAt: { $gte: thisWeek } }),

            // This month's orders
            Order.countDocuments({ createdAt: { $gte: thisMonth } }),

            // Pending orders (active)
            Order.countDocuments({
                status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
            }),

            // Pending payments
            Order.countDocuments({ paymentStatus: 'pending' }),

            // Total users
            User.countDocuments(),

            // Total restaurants
            Restaurant.countDocuments(),

            // Revenue stats
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalAmount' },
                        todayRevenue: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$createdAt', today] },
                                    '$totalAmount',
                                    0
                                ]
                            }
                        },
                        avgOrderValue: { $avg: '$totalAmount' }
                    }
                }
            ]),

            // Orders by status
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Orders by payment method
            Order.aggregate([
                { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
            ]),

            // Recent orders (last 10)
            Order.find()
                .populate('user', 'name email')
                .populate('restaurant', 'name')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        ]);

        // Process revenue stats
        const revenue = revenueStats[0] || {
            totalRevenue: 0,
            todayRevenue: 0,
            avgOrderValue: 0
        };

        // Process orders by status
        const statusData = ordersByStatus.reduce((acc: any, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Process orders by payment method
        const paymentMethodData = ordersByPaymentMethod.reduce((acc: any, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalOrders,
                    todayOrders,
                    thisWeekOrders,
                    thisMonthOrders,
                    pendingOrders,
                    pendingPayments,
                    totalUsers,
                    totalRestaurants
                },
                revenue: {
                    total: revenue.totalRevenue,
                    today: revenue.todayRevenue,
                    average: revenue.avgOrderValue
                },
                analytics: {
                    byStatus: statusData,
                    byPaymentMethod: paymentMethodData
                },
                recentOrders
            }
        });

    } catch (error: any) {
        console.error('Error fetching admin dashboard:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}