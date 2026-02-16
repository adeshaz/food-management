// app/api/debug/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // Get all orders with minimal info
        const allOrders = await Order.find()
            .select('orderNumber _id status paymentStatus totalAmount createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        // Count by status
        const pendingCount = await Order.countDocuments({ status: 'pending' });
        const confirmedCount = await Order.countDocuments({ status: 'confirmed' });
        const deliveredCount = await Order.countDocuments({ status: 'delivered' });

        // Find specific order
        const searchOrder = await Order.findOne({ orderNumber: 'ORD-295765' });

        return NextResponse.json({
            success: true,
            data: {
                totalOrders: await Order.countDocuments(),
                recentOrders: allOrders,
                statusCounts: {
                    pending: pendingCount,
                    confirmed: confirmedCount,
                    delivered: deliveredCount
                },
                specificOrder: searchOrder ? {
                    _id: searchOrder._id,
                    orderNumber: searchOrder.orderNumber,
                    status: searchOrder.status,
                    paymentStatus: searchOrder.paymentStatus
                } : null
            }
        });

    } catch (error: any) {
        console.error('Debug error:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}