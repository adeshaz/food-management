// app/api/orders/[id]/confirm-payment/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const user = await getCurrentUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { paymentProof, notes } = body;

        const order = await Order.findById(id)
            .populate('user', 'email name')
            .populate('restaurant', 'name');

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Update order status
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(),
            notes: `Bank transfer payment confirmed by admin. ${notes || ''}`
        });

        if (paymentProof) {
            order.paymentProof = paymentProof;
        }

        await order.save();

        // Send confirmation email to customer
        await sendEmail({
            to: (order.user as any).email,
            subject: `✅ Payment Confirmed - Order #${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
                    <p>Hello ${order.contactName},</p>
                    
                    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #065f46;">Order #${order.orderNumber}</h3>
                        <p><strong>Payment Method:</strong> Bank Transfer</p>
                        <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">CONFIRMED ✓</span></p>
                        <p><strong>Amount Paid:</strong> ₦${order.totalAmount?.toLocaleString()}</p>
                        <p><strong>Confirmation Date:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Restaurant:</strong> ${(order.restaurant as any).name}</p>
                    </div>
                    
                    <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
                    <p>Thank you for ordering with Osogbo Foods!</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed successfully',
            data: order
        });

    } catch (error: any) {
        console.error('Payment confirmation error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to confirm payment' },
            { status: 500 }
        );
    }
}