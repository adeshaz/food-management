import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log('📋 Fetching orders for user:', user.email);

        // Fetch ALL user's orders
        const orders = await Order.find({ user: user._id })
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 }) // Newest first
            .lean();

        console.log(`✅ Found ${orders.length} orders for user`);

        // Transform data for frontend
        const formattedOrders = orders.map(order => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            date: new Date(order.createdAt).toLocaleDateString(),
            time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            restaurant: order.restaurant?.name || 'Restaurant',
            restaurantId: order.restaurant?._id || '',
            items: order.items.map((item: any) => ({
                name: item.foodItem?.name || `Item ${item._id}`,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
            deliveryFee: 500, // Default
            total: order.totalAmount || 0,
            status: order.status || 'pending',
            deliveryAddress: order.deliveryAddress || '',
            paymentMethod: order.paymentMethod || 'cash',
            paymentStatus: order.paymentStatus || 'pending',
            estimatedDelivery: '30-45 mins',
            canReorder: true
        }));

        return NextResponse.json({
            success: true,
            data: formattedOrders,
            count: formattedOrders.length
        });

    } catch (error: any) {
        console.error('❌ Error fetching orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to fetch orders'
            },
            { status: 500 }
        );
    }
}