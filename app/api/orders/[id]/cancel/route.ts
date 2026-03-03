import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params; // ✅ Await the promise to get the ID
        console.log('🟢 CANCEL ORDER API called for:', orderId);

        await connectToDatabase();

        // Get current user
        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const { reason } = await request.json();

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order belongs to user
        if (order.user.toString() !== user._id.toString()) {
            return NextResponse.json(
                { success: false, message: 'Not authorized to cancel this order' },
                { status: 403 }
            );
        }

        // Check if order can be cancelled
        const canCancel = ['pending', 'confirmed', 'preparing', 'on-the-way'].includes(order.status);
        if (!canCancel) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Order cannot be cancelled because it's already ${order.status}`
                },
                { status: 400 }
            );
        }

        // Update order status
        order.status = 'cancelled';
        if (reason) {
            order.notes = order.notes ? `${order.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
        }

        await order.save();

        console.log('✅ Order cancelled successfully:', orderId);

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                newStatus: order.status,
                cancelledAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('❌ Cancel order error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to cancel order'
            },
            { status: 500 }
        );
    }
}