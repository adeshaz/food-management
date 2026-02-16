// // app/api/paystack/verify/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { verifyPayment } from '@/lib/paystack';
// import { connectToDatabase } from '@/lib/db';
// import Order from '@/models/Order';
// import User from '@/models/User';
// import { sendEmail } from '@/lib/email';

// export async function GET(request: NextRequest) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const reference = searchParams.get('reference');

//         if (!reference) {
//             return NextResponse.json(
//                 { success: false, error: 'Reference is required' },
//                 { status: 400 }
//             );
//         }

//         // Verify payment with PayStack
//         const result = await verifyPayment(reference);

//         if (result.success && result.data.status === 'success') {
//             await connectToDatabase();

//             const paymentData = result.data;

//             // Update order payment status in database
//             const order = await Order.findOneAndUpdate(
//                 { paymentReference: reference },
//                 {
//                     paymentStatus: 'paid',
//                     status: 'confirmed',
//                     $push: {
//                         statusHistory: {
//                             status: 'confirmed',
//                             timestamp: new Date(),
//                             notes: 'Payment confirmed via PayStack'
//                         }
//                     }
//                 },
//                 { new: true }
//             ).populate('user restaurant');

//             if (order) {
//                 // Send email to customer
//                 await sendOrderPaymentEmail(order, paymentData);

//                 // Send email to admin (optional)
//                 await sendAdminPaymentNotification(order, paymentData);

//                 return NextResponse.json({
//                     success: true,
//                     message: 'Payment verified and order confirmed',
//                     data: {
//                         orderId: order._id,
//                         orderNumber: order.orderNumber,
//                         amount: paymentData.amount / 100, // Convert from kobo
//                         customerEmail: order.user.email,
//                         status: 'paid'
//                     }
//                 });
//             }
//         }

//         return NextResponse.json({
//             success: false,
//             error: 'Payment verification failed'
//         }, { status: 400 });

//     } catch (error: any) {
//         console.error('Payment verification error:', error);
//         return NextResponse.json(
//             { error: 'Payment verification failed' },
//             { status: 500 }
//         );
//     }
// }

// // Email function for customer
// async function sendOrderPaymentEmail(order: any, paymentData: any) {
//     const subject = `Payment Confirmed - Order #${order.orderNumber}`;

//     const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
//         <p>Hello ${order.user.name},</p>
        
//         <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="color: #374151; margin-bottom: 15px;">Payment Details</h3>
//             <p><strong>Order Number:</strong> ${order.orderNumber}</p>
//             <p><strong>Amount Paid:</strong> ₦${(paymentData.amount / 100).toLocaleString()}</p>
//             <p><strong>Payment Method:</strong> ${paymentData.channel}</p>
//             <p><strong>Transaction Reference:</strong> ${paymentData.reference}</p>
//             <p><strong>Payment Date:</strong> ${new Date(paymentData.paid_at).toLocaleString()}</p>
//         </div>
        
//         <p>Your order is now confirmed and will be prepared shortly.</p>
        
//         <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
//             <p style="color: #6b7280; font-size: 14px;">
//                 You can track your order from your dashboard.<br>
//                 Need help? Contact us at support@osogbofoods.com
//             </p>
//         </div>
//     </div>
//     `;

//     await sendEmail({
//         to: order.user.email,
//         subject,
//         html
//     });
// }

// // Email function for admin
// async function sendAdminPaymentNotification(order: any, paymentData: any) {
//     const subject = `💰 New Payment Received - Order #${order.orderNumber}`;

//     const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #10b981;">New Payment Received</h2>
        
//         <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="color: #374151; margin-bottom: 15px;">Payment Details</h3>
//             <p><strong>Order Number:</strong> ${order.orderNumber}</p>
//             <p><strong>Customer:</strong> ${order.user.name} (${order.user.email})</p>
//             <p><strong>Amount:</strong> ₦${(paymentData.amount / 100).toLocaleString()}</p>
//             <p><strong>Payment Method:</strong> ${paymentData.channel}</p>
//             <p><strong>Transaction Reference:</strong> ${paymentData.reference}</p>
//             <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
//         </div>
        
//         <p>Order is now confirmed and ready for processing.</p>
        
//         <div style="margin-top: 20px;">
//             <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order._id}" 
//                style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
//                 View Order in Admin Panel
//             </a>
//         </div>
//     </div>
//     `;

//     // Send to admin email (configure in env)
//     const adminEmail = process.env.ADMIN_EMAIL || 'admin@osogbofoods.com';

//     await sendEmail({
//         to: adminEmail,
//         subject,
//         html
//     });
// }


// app/api/paystack/verify/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/paystack';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { sendEmail, sendPaymentConfirmationEmail } from '@/lib/email'; // ✅ CORRECT IMPORT

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');

        if (!reference) {
            return NextResponse.json(
                { success: false, error: 'Reference is required' },
                { status: 400 }
            );
        }

        console.log('🔍 Verifying PayStack payment for reference:', reference);

        // Verify payment with PayStack
        const result = await verifyPayment(reference);

        if (result.success && result.data.status === 'success') {
            await connectToDatabase();

            const paymentData = result.data;
            console.log('✅ Payment verified:', paymentData);

            // Find order by payment reference
            const order = await Order.findOne({ paymentReference: reference })
                .populate('user')
                .populate('restaurant');

            if (!order) {
                console.error('❌ Order not found for reference:', reference);
                return NextResponse.json({
                    success: false,
                    error: 'Order not found'
                }, { status: 404 });
            }

            // Update order payment status
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            
            // Add to status history
            if (!order.statusHistory) order.statusHistory = [];
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: new Date(),
                notes: 'Payment confirmed via PayStack'
            });

            await order.save();

            // Send email to customer using the correct function
            try {
                await sendPaymentConfirmationEmail(
                    order.user.email,
                    order.orderNumber,
                    order.user.name,
                    order.totalAmount,
                    'Card (PayStack)',
                    reference
                );
                console.log('✅ Payment confirmation email sent to customer');
            } catch (emailError) {
                console.error('❌ Failed to send customer email:', emailError);
                // Continue even if email fails
            }

            // Send email to admin
            try {
                const adminEmail = process.env.ADMIN_EMAIL || 'hafizadegbite@gmail.com';
                await sendEmail({
                    to: adminEmail,
                    subject: `💰 Payment Received - Order #${order.orderNumber}`,
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">New Payment Received</h2>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #374151;">Payment Details</h3>
                            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                            <p><strong>Customer:</strong> ${order.user.name} (${order.user.email})</p>
                            <p><strong>Amount:</strong> ₦${order.totalAmount.toLocaleString()}</p>
                            <p><strong>Payment Method:</strong> Card (PayStack)</p>
                            <p><strong>Transaction Reference:</strong> ${reference}</p>
                            <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
                            <p><strong>Status:</strong> PAID</p>
                        </div>
                    </div>
                    `
                });
                console.log('✅ Admin notification email sent');
            } catch (adminEmailError) {
                console.error('❌ Failed to send admin email:', adminEmailError);
            }

            return NextResponse.json({
                success: true,
                message: 'Payment verified and order confirmed',
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    amount: paymentData.amount / 100,
                    customerEmail: order.user.email,
                    status: 'paid',
                    emailsSent: true
                }
            });
        } else {
            console.error('❌ Payment verification failed:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error || 'Payment verification failed'
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('❌ Payment verification error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Payment verification failed',
                details: error.message 
            },
            { status: 500 }
        );
    }
}