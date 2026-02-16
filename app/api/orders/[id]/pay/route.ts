// app/api/orders/[id]/pay/route.ts - UPDATED FOR YOUR STRUCTURE
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { sendEmail } from '@/lib/email';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // This is the MongoDB _id
        await connectToDatabase();
        
        const body = await request.json();
        const { paymentStatus, transactionId, paymentMethod } = body;

        console.log(`🔄 Updating payment status for order ID: ${id}`);

        // Find by MongoDB _id
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Update the order
        order.paymentStatus = paymentStatus || 'paid';
        order.status = 'confirmed';
        
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        
        order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(),
            notes: `Payment ${paymentStatus === 'paid' ? 'completed' : 'failed'} via ${paymentMethod}`
        });

        await order.save();

        console.log(`✅ Order ${order.orderNumber} payment status updated to: ${paymentStatus}`);

        // Populate for email
        const populatedOrder = await Order.findById(id)
            .populate('user', 'email name')
            .populate('restaurant', 'name');

       
        if (paymentStatus === 'paid') {
            try {
                // Get populated order again
                const orderWithUser = await Order.findById(id)
                    .populate('user', 'email name')
                    .populate('restaurant', 'name')
                    .lean();

                if (orderWithUser && orderWithUser.user) {
                    const userEmail = (orderWithUser.user as any).email;
                    const userName = (orderWithUser.user as any).name || 'Customer';

                    if (userEmail) {
                        await sendEmail({
                            to: userEmail,
                            subject: `✅ Payment Confirmed - Order #${orderWithUser.orderNumber}`,
                            html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #10b981;">✅ Payment Successful!</h2>
                        <p>Hello ${userName},</p>
                        
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6;">
                            <h3 style="color: #1e40af;">Payment Information</h3>
                            <p><strong>Order:</strong> #${orderWithUser.orderNumber}</p>
                            <p><strong>Amount:</strong> ₦${orderWithUser.totalAmount.toLocaleString()}</p>
                            <p><strong>Payment Method:</strong> ${paymentMethod || 'Card'}</p>
                            <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                            <p><strong>Restaurant:</strong> ${(orderWithUser.restaurant as any)?.name || 'Restaurant'}</p>
                        </div>
                        
                        <p>Your order is now confirmed and being prepared.</p>
                        <p>You will receive another email when your order is on the way.</p>
                    </div>
                    `
                        });
                        console.log(`✅ Payment confirmation email sent to: ${userEmail}`);
                    }
                }
            } catch (emailError: any) {
                console.error('❌ Failed to send payment confirmation email:', emailError.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Payment status updated successfully',
            data: {
                orderId: id,
                orderNumber: populatedOrder?.orderNumber,
                paymentStatus: populatedOrder?.paymentStatus,
                status: populatedOrder?.status
            }
        });

    } catch (error: any) {
        console.error('❌ Error updating payment status:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update payment status' },
            { status: 500 }
        );
    }
}