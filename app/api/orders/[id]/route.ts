

// app/api/orders/[id]/route.ts - UPDATED FOR NEXT.JS 16
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';


// In /api/orders/[id]/route.ts - Update the GET method
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Next.js 16: params is a Promise, must await it
        const { id } = await params;

        console.log('🔍 GET Order request for ID:', id);

        await connectToDatabase();

        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            console.log('❌ No authenticated user');
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log('👤 Authenticated user:', {
            email: user.email,
            id: user._id,
            role: user.role
        });

        let order;

        // Check if the id is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id)
                .populate({
                    path: 'user',
                    select: 'name email phone',
                    transform: (doc) => {
                        return {
                            ...doc.toObject(),
                            _id: doc._id?.toString()
                        };
                    }
                })
                .populate('restaurant', 'name address')
                .populate('items.foodItem', 'name price');
        } else {
            // If not a valid ObjectId, treat it as an order number
            order = await Order.findOne({ orderNumber: id })
                .populate({
                    path: 'user',
                    select: 'name email phone',
                    transform: (doc) => {
                        return {
                            ...doc.toObject(),
                            _id: doc._id?.toString()
                        };
                    }
                })
                .populate('restaurant', 'name address')
                .populate('items.foodItem', 'name price');
        }

        if (!order) {
            console.log('❌ Order not found');
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        console.log('📦 Order found:', {
            orderNumber: order.orderNumber,
            orderUserId: order.user?._id?.toString(),
            currentUserId: user._id?.toString()
        });

        // ✅ FIX: Get both IDs as strings for comparison
        const orderUserId = order.user?._id?.toString();
        const currentUserId = user._id?.toString();

        console.log('🔍 User comparison:', {
            orderUserId,
            currentUserId,
            isAdmin: user.role === 'admin',
            idsMatch: orderUserId === currentUserId
        });

        // Check if the user is the owner of the order or an admin
        const isAdmin = user.role === 'admin';
        const isOwner = currentUserId && orderUserId && currentUserId === orderUserId;

        if (!isAdmin && !isOwner) {
            console.log('❌ Access denied: Not admin and not owner');
            return NextResponse.json(
                { success: false, message: 'Not authorized to view this order' },
                { status: 403 }
            );
        }

        console.log('✅ Access granted');

        // Transform order to ensure IDs are strings
        const transformedOrder = {
            ...order.toObject(),
            _id: order._id?.toString(),
            user: order.user ? {
                ...order.user,
                _id: order.user._id?.toString()
            } : null,
            items: order.items?.map((item: any) => ({
                ...item.toObject(),
                _id: item._id?.toString(),
                foodItem: item.foodItem ? {
                    ...item.foodItem.toObject(),
                    _id: item.foodItem._id?.toString()
                } : null
            }))
        };

        return NextResponse.json({
            success: true,
            data: transformedOrder
        });

    } catch (error: any) {
        console.error('❌ Error fetching order:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// export async function GET(
//     request: NextRequest,
//     { params }: { params: Promise<{ id: string }> }
// ) {
//     try {
//         // Next.js 16: params is a Promise, must await it
//         const { id } = await params;

//         await connectToDatabase();

//         const user = await getCurrentUserFromRequest(request);
//         if (!user) {
//             return NextResponse.json(
//                 { success: false, message: 'Authentication required' },
//                 { status: 401 }
//             );
//         }

//         let order;

//         // Check if the id is a valid MongoDB ObjectId
//         if (mongoose.Types.ObjectId.isValid(id)) {
//             order = await Order.findById(id)
//                 .populate('restaurant', 'name address')
//                 .populate('items.foodItem', 'name price')
//                 .populate('user', 'name email phone');
//         } else {
//             // If not a valid ObjectId, treat it as an order number
//             order = await Order.findOne({ orderNumber: id })
//                 .populate('restaurant', 'name address')
//                 .populate('items.foodItem', 'name price')
//                 .populate('user', 'name email phone');
//         }

//         if (!order) {
//             return NextResponse.json(
//                 { success: false, message: 'Order not found' },
//                 { status: 404 }
//             );
//         }

//         // Check if the user is the owner of the order or an admin
//         if (user.role !== 'admin' && order.user.toString() !== user._id.toString()) {
//             return NextResponse.json(
//                 { success: false, message: 'Not authorized to view this order' },
//                 { status: 403 }
//             );
//         }

//         return NextResponse.json({
//             success: true,
//             data: order 
//         });

//     } catch (error: any) {
//         console.error('Error fetching order:', error);
//         return NextResponse.json(
//             { success: false, message: error.message || 'Failed to fetch order' },
//             { status: 500 }
//         );
//     }
// }

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Next.js 16: params is a Promise, must await it
        const { id } = await params;

        console.log('🔄 Updating order with ID:', id);

        await connectToDatabase();

        const user = await getCurrentUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            console.log('❌ User is not admin or not authenticated');
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status, paymentStatus, notes, statusNotes } = body;

        console.log('📦 Update data:', { status, paymentStatus, notes, statusNotes });

        let query;
        // Check if the id is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: new mongoose.Types.ObjectId(id) };
            console.log('🔍 Searching by MongoDB ObjectId:', id);
        } else {
            // If not a valid ObjectId, treat it as an order number
            query = { orderNumber: id };
            console.log('🔍 Searching by orderNumber:', id);
        }

        const updateData: any = {
            updatedAt: new Date()
        };

        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (notes) updateData.notes = notes;
        if (statusNotes) {
            updateData.statusNotes = statusNotes;
            updateData.adminNotes = statusNotes;
        }

        console.log('📝 Update query:', query);
        console.log('📝 Update data:', updateData);

        // First, let's check if the order exists
        const existingOrder = await Order.findOne(query);
        if (!existingOrder) {
            console.log('❌ Order not found with query:', query);

            // Let's try to find any order with similar order number
            if (!mongoose.Types.ObjectId.isValid(id)) {
                const similarOrders = await Order.find({
                    orderNumber: { $regex: id, $options: 'i' }
                }).limit(5);
                console.log('🔍 Similar orders found:', similarOrders.map(o => o.orderNumber));
            }

            return NextResponse.json(
                { success: false, message: `Order not found: ${id}` },
                { status: 404 }
            );
        }

        console.log('✅ Order found:', existingOrder.orderNumber);

        const order = await Order.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true }
        )
            .populate('user', 'email name')
            .populate('restaurant', 'name');

        console.log('✅ Order updated successfully:', order?.orderNumber);

        // Send email notification if status changed to delivered or payment is confirmed
        if (order && (status === 'delivered' || paymentStatus === 'paid') && order.user?.email) {
            try {
                const emailData = {
                    to: (order.user as any).email,
                    subject: `✅ Order ${status === 'delivered' ? 'Delivered' : 'Payment Confirmed'} - #${order.orderNumber}`,
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #10b981;">${status === 'delivered' ? '🎉 Order Delivered!' : '✅ Payment Confirmed!'}</h2>
                        <p>Hello ${order.contactName},</p>
                        
                        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #065f46;">Order #${order.orderNumber}</h3>
                            ${status === 'delivered' ?
                            `<p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">DELIVERED ✓</span></p>
                             <p><strong>Delivered At:</strong> ${new Date().toLocaleString()}</p>` :
                            `<p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">PAID ✓</span></p>
                             <p><strong>Confirmed At:</strong> ${new Date().toLocaleString()}</p>`
                        }
                            <p><strong>Total Amount:</strong> ₦${order.totalAmount?.toLocaleString()}</p>
                            <p><strong>Restaurant:</strong> ${(order.restaurant as any).name}</p>
                        </div>
                        
                        <p>Thank you for ordering with us!</p>
                    </div>
                    `
                };

                if (sendEmail) {
                    await sendEmail(emailData);
                    console.log('📧 Email notification sent');
                }
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });

    } catch (error: any) {
        console.error('❌ Error updating order:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update order' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Next.js 16: params is a Promise, must await it
        const { id } = await params;

        await connectToDatabase();

        const user = await getCurrentUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        let query;
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: new mongoose.Types.ObjectId(id) };
        } else {
            query = { orderNumber: id };
        }

        const order = await Order.findOneAndDelete(query);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete order' },
            { status: 500 }
        );
    }
}