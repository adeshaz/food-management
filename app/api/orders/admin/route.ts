// app/api/orders/admin/route.ts - UPDATED FOR SERVER COMPONENTS
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');
        const search = searchParams.get('search');
        const limit = searchParams.get('limit');

        let query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { deliveryAddress: { $regex: search, $options: 'i' } },
                { contactName: { $regex: search, $options: 'i' } },
                { contactPhone: { $regex: search, $options: 'i' } }
            ];
        }

        let queryBuilder = Order.find(query)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 });

        // Apply limit if provided
        if (limit && !isNaN(parseInt(limit))) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }

        const orders = await queryBuilder.lean();

        // Calculate stats
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({
            status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
        });
        const pendingPayments = await Order.countDocuments({ paymentStatus: 'pending' });

        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data: orders,
            stats: {
                totalOrders,
                pendingOrders,
                pendingPayments,
                totalRevenue
            },
            count: orders.length
        });

    } catch (error: any) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}