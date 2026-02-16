// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/db';
// import Order from '@/models/Order';
// import Restaurant from '@/models/Restaurant';
// import FoodItem from '@/models/FoodItem';
// import mongoose from 'mongoose';
// import { getCurrentUserFromRequest } from '@/lib/auth';
// import { sendEmail, sendBankTransferInstructions } from '@/lib/email';

// export async function POST(request: NextRequest) {
//     console.log('🟢 ORDER API POST called');

//     try {
//         await connectToDatabase();
//         console.log('✅ Database connected');

//         // Get current user from JWT token
//         const user = await getCurrentUserFromRequest(request);
//         console.log('👤 User from token:', user ? `${user._id} (${user.email})` : 'No user');

//         if (!user) {
//             return NextResponse.json(
//                 { success: false, message: 'Authentication required. Please sign in.' },
//                 { status: 401 }
//             );
//         }

//         const body = await request.json();
//         console.log('📦 Order data:', JSON.stringify(body, null, 2));

//         // Validate required fields
//         const requiredFields = ['restaurantId', 'deliveryAddress', 'contactPhone', 'contactName', 'items'];
//         const missingFields = requiredFields.filter(field => !body[field]);

//         if (missingFields.length > 0) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: `Missing required fields: ${missingFields.join(', ')}`
//                 },
//                 { status: 400 }
//             );
//         }

//         // Check if restaurant exists
//         const restaurant = await Restaurant.findById(body.restaurantId);
//         if (!restaurant) {
//             return NextResponse.json(
//                 { success: false, message: 'Restaurant not found' },
//                 { status: 404 }
//             );
//         }
//         console.log('✅ Restaurant found:', restaurant.name);

//         // Process cart items
//         const orderItems = [];

//         for (const cartItem of body.items) {
//             try {
//                 const foodItem = await FoodItem.findById(cartItem.id);

//                 if (foodItem) {
//                     orderItems.push({
//                         foodItem: foodItem._id,
//                         quantity: cartItem.quantity,
//                         price: cartItem.price,
//                         notes: cartItem.notes || ''
//                     });
//                 } else {
//                     orderItems.push({
//                         foodItem: new mongoose.Types.ObjectId(cartItem.id),
//                         quantity: cartItem.quantity,
//                         price: cartItem.price,
//                         notes: cartItem.notes || `From cart: ${cartItem.name}`
//                     });
//                 }
//             } catch (error) {
//                 console.warn(`⚠️ Could not process item ${cartItem.id}:`, error);
//                 orderItems.push({
//                     foodItem: new mongoose.Types.ObjectId(cartItem.id),
//                     quantity: cartItem.quantity,
//                     price: cartItem.price,
//                     notes: `Cart item: ${cartItem.name}`
//                 });
//             }
//         }

//         console.log('📋 Processed order items:', orderItems);

//         // Use the total from checkout
//         const totalAmount = body.total || body.subtotal + body.deliveryFee + (body.tax || 0);

//         // ✅ CORRECTED STATUS LOGIC
//         // Determine initial status based on payment method
//         let initialStatus = 'pending';
//         let paymentStatus = body.paymentStatus || 'pending';
//         let paymentNote = '';

//         if (body.paymentMethod === 'cash') {
//             // Cash on delivery - pending payment
//             initialStatus = 'pending';
//             paymentStatus = 'pending';
//             paymentNote = 'Awaiting cash payment on delivery';
//         }
//         else if (body.paymentMethod === 'card') {
//             // Card payment via PayStack - assume successful for demo
//             initialStatus = 'confirmed';
//             paymentStatus = 'paid';
//             paymentNote = 'PayStack payment confirmed ✓';
//         }
//         else if (body.paymentMethod === 'transfer') {
//             // Bank transfer - use provided status or default to pending
//             initialStatus = paymentStatus === 'paid' ? 'confirmed' : 'pending';
//             paymentStatus = paymentStatus || 'pending';
//             paymentNote = paymentStatus === 'paid' ? 'Transfer payment received ✓' : 'Transfer payment pending confirmation';
//         }

//         // If body has status, use it (for bank transfer confirm)
//         if (body.status) {
//             initialStatus = body.status;
//         }

//         // Create order with corrected status
//         const orderData = {
//             user: user._id,
//             restaurant: restaurant._id,
//             items: orderItems,
//             totalAmount: totalAmount,
//             deliveryAddress: body.deliveryAddress,
//             contactPhone: body.contactPhone,
//             contactName: body.contactName,

//             // ✅ FIXED: Use the status we determined
//             status: initialStatus,
//             paymentMethod: body.paymentMethod || 'cash',
//             paymentStatus: paymentStatus,
//             paymentNote: body.paymentNote || paymentNote,

//             estimatedDeliveryTime: new Date(Date.now() + (restaurant.deliveryTime || 30) * 60000),
//             statusHistory: [{
//                 status: initialStatus,
//                 timestamp: new Date(),
//                 notes: `Order created. ${paymentNote}`
//             }],
//             notes: body.specialInstructions || ''
//         };

//         console.log('📝 Creating order with data:', orderData);

//         // ✅ CREATE ORDER
//         const order = new Order(orderData);
//         await order.save();

//         console.log('✅ Order saved with ID:', order._id, 'Order Number:', order.orderNumber);

//         // ===========================================
//         // ✅ EMAIL SECTION - CORRECTED
//         // ===========================================

//         // 1. Send Customer Email Based on Payment Method
//         try {
//             if (body.paymentMethod === 'transfer') {
//                 // ✅ CHECK: If paymentStatus is 'paid', send "Payment Received" email
//                 if (paymentStatus === 'paid') {
//                     await sendEmail({
//                         to: user.email,
//                         subject: `✅ Payment Received - Order #${order.orderNumber}`,
//                         html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//                     <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
//                     <p>Hello ${body.contactName},</p>
                    
//                     <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
//                         <h3 style="color: #065f46;">Order #${order.orderNumber}</h3>
//                         <p><strong>Payment Method:</strong> Bank Transfer</p>
//                         <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
//                         <p><strong>Amount Paid:</strong> ₦${totalAmount.toLocaleString()}</p>
//                         <p><strong>Transaction Date:</strong> ${new Date().toLocaleString()}</p>
//                         <p><strong>Note:</strong> Your bank transfer has been confirmed</p>
//                     </div>
                    
//                     <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
//                         <h4 style="color: #1e40af;">Order Details</h4>
//                         <p><strong>Restaurant:</strong> ${restaurant.name}</p>
//                         <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
//                         <p><strong>Delivery Address:</strong> ${body.deliveryAddress}</p>
//                     </div>
                    
//                     <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
//                     <p>Thank you for ordering with Osogbo Foods!</p>
//                 </div>
//                 `
//                     });
//                     console.log('✅ Payment received email sent to customer');
//                 } else {
//                     // Regular bank transfer instructions
//                     await sendBankTransferInstructions(
//                         user.email,
//                         body.contactName,
//                         order.orderNumber,
//                         totalAmount,
//                         {
//                             accountNumber: '0123456789',
//                             accountName: 'OSOGBO FOODS DEMO',
//                             bankName: 'Wema Bank'
//                         }
//                     );
//                     console.log('✅ Bank transfer instructions sent to customer');
//                 }
//             } else if (body.paymentMethod === 'card') {
//                 // PAYSTACK CARD PAYMENT
//                 await sendEmail({
//                     to: user.email,
//                     subject: `✅ Payment Received - Order #${order.orderNumber}`,
//                     html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//                 <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
//                 <p>Hello ${body.contactName},</p>
                
//                 <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
//                     <h3 style="color: #065f46;">Order #${order.orderNumber}</h3>
//                     <p><strong>Payment Method:</strong> PayStack (Card)</p>
//                     <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
//                     <p><strong>Amount Paid:</strong> ₦${totalAmount.toLocaleString()}</p>
//                     <p><strong>Transaction Date:</strong> ${new Date().toLocaleString()}</p>
//                 </div>
                
//                 <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
//                     <h4 style="color: #1e40af;">Order Details</h4>
//                     <p><strong>Restaurant:</strong> ${restaurant.name}</p>
//                     <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
//                     <p><strong>Delivery Address:</strong> ${body.deliveryAddress}</p>
//                 </div>
                
//                 <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
//                 <p>Thank you for ordering with Osogbo Foods!</p>
//             </div>
//             `
//                 });
//                 console.log('✅ PayStack payment confirmation sent to customer');
//             } else {
//                 // CASH ON DELIVERY
//                 await sendEmail({
//                     to: user.email,
//                     subject: `📦 Order Confirmation #${order.orderNumber}`,
//                     html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//                 <h2 style="color: #10b981;">Order Confirmed!</h2>
//                 <p>Hello ${body.contactName},</p>
                
//                 <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
//                     <h3 style="color: #1e40af;">Order #${order.orderNumber}</h3>
//                     <p><strong>Payment Method:</strong> Cash on Delivery</p>
//                     <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
//                     <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
//                 </div>
                
//                 <p>Please have cash ready when your order arrives.</p>
//                 <p>Thank you for ordering with Osogbo Foods!</p>
//             </div>
//             `
//                 });
//                 console.log('✅ Cash order confirmation sent to customer');
//             }
//         } catch (emailError: any) {
//             console.error('❌ Failed to send customer email:', emailError.message);
//         }

//         // 2. Send Admin Notification
//         try {
//             const adminEmail = 'hafizadegbite@gmail.com';

//             // Prepare items list
//             const itemsList = body.items.map((item: any, index: number) =>
//                 `${index + 1}. ${item.quantity}x ${item.name} - ₦${item.price?.toLocaleString() || '0'} each`
//             ).join('<br>');

//             // Payment message for admin
//             let adminPaymentMessage = '';
//             if (body.paymentMethod === 'transfer') {
//                 if (paymentStatus === 'paid') {
//                     adminPaymentMessage = `
//             <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 10px 0;">
//                 <strong>✅ BANK TRANSFER RECEIVED</strong><br>
//                 Customer confirmed payment. Order is ready for processing.
//             </div>`;
//                 } else {
//                     adminPaymentMessage = `
//             <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 10px 0;">
//                 <strong>💰 BANK TRANSFER PENDING</strong><br>
//                 Customer has been sent bank details. Awaiting payment proof at payments@osogbofoods.com
//             </div>`;
//                 }
//             } else if (body.paymentMethod === 'card') {
//                 adminPaymentMessage = `
//         <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 10px 0;">
//             <strong>✅ PAYSTACK PAYMENT RECEIVED</strong><br>
//             Payment confirmed via PayStack. Order is ready for processing.
//         </div>`;
//             } else {
//                 adminPaymentMessage = `
//         <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 10px 0;">
//             <strong>💵 CASH ON DELIVERY</strong><br>
//             Collect ₦${totalAmount.toLocaleString()} when delivering.
//         </div>`;
//             }

//             await sendEmail({
//                 to: adminEmail,
//                 subject: `🆕 ${body.paymentMethod?.toUpperCase()} Order #${order.orderNumber} - ${initialStatus.toUpperCase()}`,
//                 html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//             <h2 style="color: #6366f1;">New Order Received</h2>
            
//             ${adminPaymentMessage}
            
//             <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e2e8f0;">
//                 <h3 style="color: #1e293b;">Order #${order.orderNumber}</h3>
                
//                 <p><strong>Customer:</strong> ${body.contactName}</p>
//                 <p><strong>Email:</strong> ${user.email}</p>
//                 <p><strong>Phone:</strong> ${body.contactPhone}</p>
//                 <p><strong>Total:</strong> ₦${totalAmount.toLocaleString()}</p>
//                 <p><strong>Address:</strong> ${body.deliveryAddress}</p>
//                 <p><strong>Restaurant:</strong> ${restaurant.name}</p>
//                 <p><strong>Status:</strong> ${initialStatus.toUpperCase()}</p>
//                 <p><strong>Payment Note:</strong> ${paymentNote}</p>
//             </div>
            
//             <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
//                 <h4 style="color: #475569;">Order Items (${body.items.length}):</h4>
//                 <p>${itemsList}</p>
//             </div>
            
//             <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 6px;">
//                 <p><strong>📋 Order ID:</strong> ${order._id}</p>
//                 <p><strong>🕒 Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
//                 <p><strong>📞 Contact:</strong> ${body.contactPhone}</p>
//             </div>
//         </div>
//         `
//             });
//             console.log('✅ Admin notification sent');
//         } catch (adminEmailError: any) {
//             console.error('❌ Failed to send admin email:', adminEmailError.message);
//         }

//         // ===========================================
//         // ✅ AUTO-DELIVERY LOGIC
//         // ===========================================

//         // Calculate delivery time (2 minutes for demo, 30 minutes for production)
//         const deliveryTimeMinutes = process.env.NODE_ENV === 'development' ? 2 : 30;
//         const deliveryTimeMs = deliveryTimeMinutes * 60 * 1000;

//         setTimeout(async () => {
//             try {
//                 await connectToDatabase();

//                 // Find the order again
//                 const currentOrder = await Order.findById(order._id);

//                 if (currentOrder && currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled') {
//                     // Check if order should be delivered
//                     const shouldDeliver =
//                         currentOrder.paymentStatus === 'paid' ||
//                         currentOrder.paymentMethod === 'cash' ||
//                         (currentOrder.paymentMethod === 'transfer' && currentOrder.status === 'confirmed');

//                     if (shouldDeliver) {
//                         // Update status to delivered
//                         currentOrder.status = 'delivered';
//                         currentOrder.deliveredAt = new Date();
//                         currentOrder.statusHistory.push({
//                             status: 'delivered',
//                             timestamp: new Date(),
//                             notes: `Auto-delivered after ${deliveryTimeMinutes} minutes`
//                         });
//                         await currentOrder.save();

//                         console.log(`✅ Auto-delivered order ${currentOrder.orderNumber} after ${deliveryTimeMinutes} minutes`);

//                         // Send delivery notification to customer
//                         try {
//                             await sendEmail({
//                                 to: user.email,
//                                 subject: `✅ Order Delivered #${currentOrder.orderNumber}`,
//                                 html: `
//                             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//                                 <h2 style="color: #10b981;">Your Order Has Been Delivered! 🎉</h2>
//                                 <p>Hello ${body.contactName},</p>
                                
//                                 <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
//                                     <h3 style="color: #065f46;">Order #${currentOrder.orderNumber}</h3>
//                                     <p><strong>Delivered At:</strong> ${new Date().toLocaleString()}</p>
//                                     <p><strong>Total Amount:</strong> ₦${currentOrder.totalAmount?.toLocaleString()}</p>
//                                     <p><strong>Restaurant:</strong> ${restaurant.name}</p>
//                                     <p><strong>Delivery Time:</strong> ${deliveryTimeMinutes} minutes</p>
//                                     <p><strong>Payment Method:</strong> ${currentOrder.paymentMethod}</p>
//                                     ${currentOrder.paymentMethod === 'transfer' ?
//                                         '<p><strong>Note:</strong> Bank transfer payment confirmed and order delivered</p>' :
//                                         ''}
//                                 </div>
                                
//                                 <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
//                                     <h4 style="color: #d97706;">How was your experience?</h4>
//                                     <p>We hope you enjoyed your meal! Please consider leaving a review to help us improve.</p>
//                                 </div>
                                
//                                 <p>Thank you for ordering with Osogbo Foods!</p>
//                                 <p>We look forward to serving you again soon.</p>
//                             </div>
//                         `
//                             });

//                             console.log('✅ Delivery email sent to customer');
//                         } catch (deliveryEmailError) {
//                             console.error('Failed to send delivery email:', deliveryEmailError);
//                         }
//                     } else {
//                         console.log(`⏳ Order ${currentOrder.orderNumber} not delivered - payment status: ${currentOrder.paymentStatus}, method: ${currentOrder.paymentMethod}`);
//                     }
//                 }
//             } catch (autoError) {
//                 console.error('Auto-delivery error:', autoError);
//             }
//         }, deliveryTimeMs);

//         // ===========================================
//         // ✅ RESPONSE
//         // ===========================================

//         const populatedOrder = await Order.findById(order._id)
//             .populate('restaurant', 'name')
//             .populate('items.foodItem', 'name')
//             .lean();

//         console.log('✅ Order placed successfully');

//         return NextResponse.json({
//             success: true,
//             message: 'Order placed successfully',
//             data: {
//                 orderId: order._id,
//                 orderNumber: order.orderNumber,
//                 totalAmount: order.totalAmount,
//                 estimatedDeliveryTime: order.estimatedDeliveryTime,
//                 paymentMethod: order.paymentMethod,
//                 paymentStatus: order.paymentStatus,
//                 status: order.status,
//                 paymentNote: paymentNote,
//                 emailsSent: true
//             }
//         });

//     } catch (error: any) {
//         console.error('❌ Order creation error:', error);

//         if (error.name === 'ValidationError') {
//             console.error('❌ Validation errors:', error.errors);
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: 'Validation failed',
//                     errors: Object.keys(error.errors).map(key => ({
//                         field: key,
//                         message: error.errors[key].message
//                     }))
//                 },
//                 { status: 400 }
//             );
//         }

//         return NextResponse.json(
//             {
//                 success: false,
//                 message: error.message || 'Failed to place order'
//             },
//             { status: 500 }
//         );
//     }
// }

// // ===========================================
// // ✅ ADMIN GET ORDERS ENDPOINT
// // ===========================================
// export async function GET(request: NextRequest) {
//     try {
//         await connectToDatabase();

//         const user = await getCurrentUserFromRequest(request);
//         if (!user || user.role !== 'admin') {
//             return NextResponse.json(
//                 { success: false, message: 'Admin access required' },
//                 { status: 403 }
//             );
//         }

//         const { searchParams } = new URL(request.url);
//         const status = searchParams.get('status');
//         const search = searchParams.get('search');
//         const page = parseInt(searchParams.get('page') || '1');
//         const limit = parseInt(searchParams.get('limit') || '50');
//         const skip = (page - 1) * limit;

//         let query: any = {};

//         if (status && status !== 'all') {
//             query.status = status;
//         }

//         if (search) {
//             query.$or = [
//                 { orderNumber: { $regex: search, $options: 'i' } },
//                 { contactName: { $regex: search, $options: 'i' } },
//                 { contactPhone: { $regex: search, $options: 'i' } },
//                 { deliveryAddress: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Get total count
//         const total = await Order.countDocuments(query);

//         // Fetch orders with pagination
//         const orders = await Order.find(query)
//             .populate('restaurant', 'name')
//             .populate('user', 'name email phone')
//             .populate('items.foodItem', 'name')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit)
//             .lean();

//         // Format orders
//         const formattedOrders = orders.map(order => ({
//             id: order._id,
//             orderNumber: order.orderNumber,
//             createdAt: order.createdAt,
//             restaurant: order.restaurant?.name || 'Restaurant',
//             contactName: order.contactName,
//             contactPhone: order.contactPhone,
//             total: order.totalAmount,
//             status: order.status,
//             paymentMethod: order.paymentMethod,
//             paymentStatus: order.paymentStatus,
//             deliveryAddress: order.deliveryAddress,
//             user: order.user ? {
//                 id: order.user._id,
//                 name: order.user.name,
//                 email: order.user.email,
//                 phone: order.user.phone
//             } : null,
//             items: order.items?.map((item: any) => ({
//                 name: item.foodItem?.name || 'Food Item',
//                 quantity: item.quantity,
//                 price: item.price,
//                 total: item.price * item.quantity
//             })) || []
//         }));

//         return NextResponse.json({
//             success: true,
//             data: formattedOrders,
//             pagination: {
//                 total,
//                 page,
//                 limit,
//                 pages: Math.ceil(total / limit)
//             }
//         });

//     } catch (error: any) {
//         console.error('Error fetching admin orders:', error);
//         return NextResponse.json(
//             { success: false, message: error.message || 'Failed to fetch orders' },
//             { status: 500 }
//         );
//     }
// }



import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import FoodItem from '@/models/FoodItem';
import mongoose from 'mongoose';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { sendEmail, sendBankTransferInstructions } from '@/lib/email';

export async function POST(request: NextRequest) {
    console.log('🟢 ORDER API POST called');

    try {
        await connectToDatabase();
        console.log('✅ Database connected');

        // Get current user from JWT token
        const user = await getCurrentUserFromRequest(request);
        console.log('👤 User from token:', user ? `${user._id} (${user.email})` : 'No user');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Authentication required. Please sign in.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log('📦 Order data:', JSON.stringify(body, null, 2));

        // Validate required fields
        const requiredFields = ['restaurantId', 'deliveryAddress', 'contactPhone', 'contactName', 'items'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(body.restaurantId);
        if (!restaurant) {
            return NextResponse.json(
                { success: false, message: 'Restaurant not found' },
                { status: 404 }
            );
        }
        console.log('✅ Restaurant found:', restaurant.name);

        // Process cart items
        const orderItems = [];

        for (const cartItem of body.items) {
            try {
                const foodItem = await FoodItem.findById(cartItem.id);

                if (foodItem) {
                    orderItems.push({
                        foodItem: foodItem._id,
                        quantity: cartItem.quantity,
                        price: cartItem.price,
                        notes: cartItem.notes || ''
                    });
                } else {
                    orderItems.push({
                        foodItem: new mongoose.Types.ObjectId(cartItem.id),
                        quantity: cartItem.quantity,
                        price: cartItem.price,
                        notes: cartItem.notes || `From cart: ${cartItem.name}`
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Could not process item ${cartItem.id}:`, error);
                orderItems.push({
                    foodItem: new mongoose.Types.ObjectId(cartItem.id),
                    quantity: cartItem.quantity,
                    price: cartItem.price,
                    notes: `Cart item: ${cartItem.name}`
                });
            }
        }

        console.log('📋 Processed order items:', orderItems);

        // Use the total from checkout
        const totalAmount = body.total || body.subtotal + body.deliveryFee + (body.tax || 0);

        // ✅ FIXED STATUS LOGIC
        let initialStatus = 'pending';
        let paymentStatus = body.paymentStatus || 'pending';
        let paymentNote = '';

        if (body.paymentMethod === 'cash') {
            initialStatus = 'pending';
            paymentStatus = 'pending';
            paymentNote = 'Awaiting cash payment on delivery';
        }
        else if (body.paymentMethod === 'card') {
            initialStatus = 'confirmed';
            paymentStatus = 'paid';
            paymentNote = 'PayStack payment confirmed ✓';
        }
        else if (body.paymentMethod === 'transfer') {
            // For development: auto-confirm bank transfers
            if (process.env.NODE_ENV === 'development') {
                initialStatus = 'confirmed';
                paymentStatus = 'paid';
                paymentNote = 'Bank transfer payment (auto-confirmed for demo)';
            } else {
                initialStatus = paymentStatus === 'paid' ? 'confirmed' : 'pending';
                paymentStatus = paymentStatus || 'pending';
                paymentNote = paymentStatus === 'paid' ? 'Transfer payment received ✓' : 'Transfer payment pending confirmation';
            }
        }

        // If body has status, use it (for bank transfer confirm)
        if (body.status) {
            initialStatus = body.status;
        }

        // Create order with corrected status
        const orderData = {
            user: user._id,
            restaurant: restaurant._id,
            items: orderItems,
            totalAmount: totalAmount,
            deliveryAddress: body.deliveryAddress,
            contactPhone: body.contactPhone,
            contactName: body.contactName,
            status: initialStatus,
            paymentMethod: body.paymentMethod || 'cash',
            paymentStatus: paymentStatus,
            paymentNote: body.paymentNote || paymentNote,
            estimatedDeliveryTime: new Date(Date.now() + (restaurant.deliveryTime || 30) * 60000),
            statusHistory: [{
                status: initialStatus,
                timestamp: new Date(),
                notes: `Order created. ${paymentNote}`
            }],
            notes: body.specialInstructions || ''
        };

        console.log('📝 Creating order with data:', orderData);

        // ✅ CREATE ORDER
        const order = new Order(orderData);
        await order.save();

        console.log('✅ Order saved with ID:', order._id, 'Order Number:', order.orderNumber);

        // ===========================================
        // ✅ EMAIL SECTION
        // ===========================================

        // 1. Send Customer Email Based on Payment Method





        // In app/api/orders/route.ts, update the POST function:

        // Look for the email sending section and update:

        if (body.paymentMethod === 'transfer') {
            // Send bank transfer instructions with user email
            if (paymentStatus === 'pending') {
                // Send bank transfer instructions to customer
                await sendEmail({
                    to: user.email, // ✅ Make sure this is included
                    subject: `💰 Bank Transfer Instructions - Order #${order.orderNumber}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e40af;">Bank Transfer Instructions</h2>
                <p>Hello ${body.contactName},</p>
                
                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e3a8a;">Order #${order.orderNumber}</h3>
                    <p><strong>Amount to Pay:</strong> ₦${totalAmount.toLocaleString()}</p>
                    <p><strong>Bank Details:</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                        <p><strong>Bank:</strong> Wema Bank</p>
                        <p><strong>Account Number:</strong> 0123456789</p>
                        <p><strong>Account Name:</strong> OSOGBO FOOD MANAGEMENT</p>
                    </div>
                    <p><strong>Important:</strong> Please use your order number as payment reference</p>
                </div>
                
                <p>Once payment is made, please send proof to payments@osogbofoods.com</p>
                <p>Your order will be processed after payment confirmation.</p>
                <p>Thank you!</p>
            </div>
            `
                });
            }
        }





        try {
            if (body.paymentMethod === 'transfer') {
                if (paymentStatus === 'paid') {
                    await sendEmail({
                        to: user.email,
                        subject: `✅ Payment Received - Order #${order.orderNumber}`,
                        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
                    <p>Hello ${body.contactName},</p>
                    
                    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #065f46;">Order #${order.orderNumber}</h3>
                        <p><strong>Payment Method:</strong> Bank Transfer</p>
                        <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
                        <p><strong>Amount Paid:</strong> ₦${totalAmount.toLocaleString()}</p>
                        <p><strong>Transaction Date:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Note:</strong> Your bank transfer has been confirmed</p>
                    </div>
                    
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
                        <h4 style="color: #1e40af;">Order Details</h4>
                        <p><strong>Restaurant:</strong> ${restaurant.name}</p>
                        <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
                        <p><strong>Delivery Address:</strong> ${body.deliveryAddress}</p>
                    </div>
                    
                    <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
                    <p>Thank you for ordering with Osogbo Foods!</p>
                </div>
                `
                    });
                    console.log('✅ Payment received email sent to customer');
                } else {
                    await sendBankTransferInstructions(
                        user.email,
                        body.contactName,
                        order.orderNumber,
                        totalAmount,
                        {
                            accountNumber: '0123456789',
                            accountName: 'OSOGBO FOODS DEMO',
                            bankName: 'Wema Bank'
                        }
                    );
                    console.log('✅ Bank transfer instructions sent to customer');
                }
            } else if (body.paymentMethod === 'card') {
                await sendEmail({
                    to: user.email,
                    subject: `✅ Payment Received - Order #${order.orderNumber}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
                <p>Hello ${body.contactName},</p>
                
                <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #065f46;">Order #${order.orderNumber}</h3>
                    <p><strong>Payment Method:</strong> PayStack (Card)</p>
                    <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
                    <p><strong>Amount Paid:</strong> ₦${totalAmount.toLocaleString()}</p>
                    <p><strong>Transaction Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <h4 style="color: #1e40af;">Order Details</h4>
                    <p><strong>Restaurant:</strong> ${restaurant.name}</p>
                    <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
                    <p><strong>Delivery Address:</strong> ${body.deliveryAddress}</p>
                </div>
                
                <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
                <p>Thank you for ordering with Osogbo Foods!</p>
            </div>
            `
                });
                console.log('✅ PayStack payment confirmation sent to customer');
            } else {
                await sendEmail({
                    to: user.email,
                    subject: `📦 Order Confirmation #${order.orderNumber}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">Order Confirmed!</h2>
                <p>Hello ${body.contactName},</p>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e40af;">Order #${order.orderNumber}</h3>
                    <p><strong>Payment Method:</strong> Cash on Delivery</p>
                    <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
                    <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
                </div>
                
                <p>Please have cash ready when your order arrives.</p>
                <p>Thank you for ordering with Osogbo Foods!</p>
            </div>
            `
                });
                console.log('✅ Cash order confirmation sent to customer');
            }
        } catch (emailError: any) {
            console.error('❌ Failed to send customer email:', emailError.message);
        }

        // 2. Send Admin Notification
        try {
            const adminEmail = 'hafizadegbite@gmail.com';

            const itemsList = body.items.map((item: any, index: number) =>
                `${index + 1}. ${item.quantity}x ${item.name} - ₦${item.price?.toLocaleString() || '0'} each`
            ).join('<br>');

            let adminPaymentMessage = '';
            if (body.paymentMethod === 'transfer') {
                if (paymentStatus === 'paid') {
                    adminPaymentMessage = `
            <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <strong>✅ BANK TRANSFER RECEIVED</strong><br>
                Customer confirmed payment. Order is ready for processing.
            </div>`;
                } else {
                    adminPaymentMessage = `
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <strong>💰 BANK TRANSFER PENDING</strong><br>
                Customer has been sent bank details. Awaiting payment proof at payments@osogbofoods.com
            </div>`;
                }
            } else if (body.paymentMethod === 'card') {
                adminPaymentMessage = `
        <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <strong>✅ PAYSTACK PAYMENT RECEIVED</strong><br>
            Payment confirmed via PayStack. Order is ready for processing.
        </div>`;
            } else {
                adminPaymentMessage = `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <strong>💵 CASH ON DELIVERY</strong><br>
            Collect ₦${totalAmount.toLocaleString()} when delivering.
        </div>`;
            }

            await sendEmail({
                to: adminEmail,
                subject: `🆕 ${body.paymentMethod?.toUpperCase()} Order #${order.orderNumber} - ${initialStatus.toUpperCase()}`,
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1;">New Order Received</h2>
            
            ${adminPaymentMessage}
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e2e8f0;">
                <h3 style="color: #1e293b;">Order #${order.orderNumber}</h3>
                
                <p><strong>Customer:</strong> ${body.contactName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${body.contactPhone}</p>
                <p><strong>Total:</strong> ₦${totalAmount.toLocaleString()}</p>
                <p><strong>Address:</strong> ${body.deliveryAddress}</p>
                <p><strong>Restaurant:</strong> ${restaurant.name}</p>
                <p><strong>Status:</strong> ${initialStatus.toUpperCase()}</p>
                <p><strong>Payment Note:</strong> ${paymentNote}</p>
            </div>
            
            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="color: #475569;">Order Items (${body.items.length}):</h4>
                <p>${itemsList}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 6px;">
                <p><strong>📋 Order ID:</strong> ${order._id}</p>
                <p><strong>🕒 Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
                <p><strong>📞 Contact:</strong> ${body.contactPhone}</p>
            </div>
        </div>
        `
            });
            console.log('✅ Admin notification sent');
        } catch (adminEmailError: any) {
            console.error('❌ Failed to send admin email:', adminEmailError.message);
        }

        // ===========================================
        // ✅ AUTO-DELIVERY LOGIC
        // ===========================================

        // Calculate delivery time (2 minutes for demo, 30 minutes for production)
        const deliveryTimeMinutes = process.env.NODE_ENV === 'development' ? 2 : 30;
        const deliveryTimeMs = deliveryTimeMinutes * 60 * 1000;

        setTimeout(async () => {
            try {
                await connectToDatabase();

                // Find the order again
                const currentOrder = await Order.findById(order._id);

                if (currentOrder && currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled') {
                    const shouldDeliver =
                        currentOrder.paymentStatus === 'paid' ||
                        currentOrder.paymentMethod === 'cash' ||
                        (currentOrder.paymentMethod === 'transfer' && currentOrder.status === 'confirmed');

                    if (shouldDeliver) {
                        currentOrder.status = 'delivered';
                        currentOrder.deliveredAt = new Date();
                        currentOrder.statusHistory.push({
                            status: 'delivered',
                            timestamp: new Date(),
                            notes: `Auto-delivered after ${deliveryTimeMinutes} minutes`
                        });
                        await currentOrder.save();

                        console.log(`✅ Auto-delivered order ${currentOrder.orderNumber} after ${deliveryTimeMinutes} minutes`);

                        // Send delivery notification to customer
                        try {
                            await sendEmail({
                                to: user.email,
                                subject: `✅ Order Delivered #${currentOrder.orderNumber}`,
                                html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #10b981;">Your Order Has Been Delivered! 🎉</h2>
                                <p>Hello ${body.contactName},</p>
                                
                                <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="color: #065f46;">Order #${currentOrder.orderNumber}</h3>
                                    <p><strong>Delivered At:</strong> ${new Date().toLocaleString()}</p>
                                    <p><strong>Total Amount:</strong> ₦${currentOrder.totalAmount?.toLocaleString()}</p>
                                    <p><strong>Restaurant:</strong> ${restaurant.name}</p>
                                    <p><strong>Delivery Time:</strong> ${deliveryTimeMinutes} minutes</p>
                                    <p><strong>Payment Method:</strong> ${currentOrder.paymentMethod}</p>
                                    ${currentOrder.paymentMethod === 'transfer' ?
                                        '<p><strong>Note:</strong> Bank transfer payment confirmed and order delivered</p>' :
                                        ''}
                                </div>
                                
                                <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                                    <h4 style="color: #d97706;">How was your experience?</h4>
                                    <p>We hope you enjoyed your meal! Please consider leaving a review to help us improve.</p>
                                </div>
                                
                                <p>Thank you for ordering with Osogbo Foods!</p>
                                <p>We look forward to serving you again soon.</p>
                            </div>
                        `
                            });
                            console.log('✅ Delivery email sent to customer');
                        } catch (deliveryEmailError) {
                            console.error('Failed to send delivery email:', deliveryEmailError);
                        }
                    }
                }
            } catch (autoError) {
                console.error('Auto-delivery error:', autoError);
            }
        }, deliveryTimeMs);

        // ===========================================
        // ✅ RESPONSE
        // ===========================================

        const populatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name')
            .populate('items.foodItem', 'name')
            .lean();

        console.log('✅ Order placed successfully');

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                status: order.status,
                paymentNote: paymentNote,
                emailsSent: true
            }
        });

    } catch (error: any) {
        console.error('❌ Order creation error:', error);

        if (error.name === 'ValidationError') {
            console.error('❌ Validation errors:', error.errors);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: Object.keys(error.errors).map(key => ({
                        field: key,
                        message: error.errors[key].message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to place order'
            },
            { status: 500 }
        );
    }
}

// ===========================================
// ✅ ADMIN GET ORDERS ENDPOINT
// ===========================================
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
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        let query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { contactName: { $regex: search, $options: 'i' } },
                { contactPhone: { $regex: search, $options: 'i' } },
                { deliveryAddress: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .populate('restaurant', 'name')
            .populate('user', 'name email phone')
            .populate('items.foodItem', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            restaurant: order.restaurant?.name || 'Restaurant',
            contactName: order.contactName,
            contactPhone: order.contactPhone,
            totalAmount: order.totalAmount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            deliveryAddress: order.deliveryAddress,
            user: order.user ? {
                id: order.user._id,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone
            } : null,
            items: order.items?.map((item: any) => ({
                name: item.foodItem?.name || 'Food Item',
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })) || []
        }));

        return NextResponse.json({
            success: true,
            data: formattedOrders,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}