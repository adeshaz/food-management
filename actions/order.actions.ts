// actions/order.actions.ts
'use server';

import { connectDB } from '../lib/db';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Restaurant from '../models/Restaurant';
import { sendOrderConfirmation } from '../lib/email';
import { getCurrentUser } from './auth.actions';
import { revalidatePath } from 'next/cache';

export async function createOrder(orderData: any) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Authentication required' };
        }

        await connectDB();

        const order = await Order.create({
            ...orderData,
            user: user.id,
            orderNumber: undefined, // default from schema
            totalAmount: orderData.totalAmount,       // ensure this exists
            deliveryAddress: orderData.deliveryAddress // ensure this exists
        });


        // Clear the user's cart
        await Cart.findOneAndDelete({ user: user.id });

        // Send email notification
        const restaurant = await Restaurant.findById(orderData.restaurant);
        if (restaurant) {
            await sendOrderConfirmation(
                user.email,
                order.orderNumber,
                user.name,
                restaurant.name,
                order.totalAmount,
                orderData.deliveryAddress
            );
        }

        revalidatePath('/dashboard/orders');
        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Order placed successfully',
            data: JSON.parse(JSON.stringify(order))
        };
    } catch (error: any) {
        console.error('Create order error:', error);
        return { success: false, error: error.message || 'Failed to place order' };
    }
}

export async function getOrderByNumber(orderNumber: string) {  
    try {
        await connectDB();

        const order = await Order.findOne({ orderNumber })
            .populate('user', 'name email phone')
            .populate('restaurant', 'name image location.address')
            .populate('items.foodItem', 'name image price description')
            .lean();

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(order))
        };
    } catch (error: any) {
        console.error('Get order error:', error);
        return { success: false, error: error.message || 'Failed to fetch order' };
    }
}

export async function getUserOrders() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Authentication required' };
        }

        await connectDB();

        const orders = await Order.find({ user: user.id })
            .populate('restaurant', 'name image')
            .sort({ createdAt: -1 })
            .lean();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(orders))
        };
    } catch (error: any) {
        console.error('Get user orders error:', error);
        return { success: false, error: error.message || 'Failed to fetch orders' };
    }
}

export async function getAllOrders(filters?: {
    status?: string;
    restaurant?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return { success: false, error: 'Admin access required' };
        }

        await connectDB();

        let query: any = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.restaurant) {
            query.restaurant = filters.restaurant;
        }

        if (filters?.dateFrom || filters?.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                query.createdAt.$lte = filters.dateTo;
            }
        }

        if (filters?.search) {
            query.$or = [
                { orderNumber: { $regex: filters.search, $options: 'i' } },
                { 'user.name': { $regex: filters.search, $options: 'i' } },
                { deliveryAddress: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(orders))
        };
    } catch (error: any) {
        console.error('Get all orders error:', error);
        return { success: false, error: error.message || 'Failed to fetch orders' };
    }
}

export async function updateOrderStatus(orderId: string, status: string, adminNotes?: string) {
    try {
        // ✅ ADD THIS VALIDATION
        if (!orderId || orderId === 'undefined' || orderId === 'null') {
            return {
                success: false,
                error: 'Valid order ID is required'
            };
        }

        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return { success: false, error: 'Admin access required' };
        }

        await connectDB();

        // ✅ ADD ObjectId validation
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
        if (!isValidObjectId) {
            return {
                success: false,
                error: 'Invalid order ID format'
            };
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                status,
                ...(adminNotes && { adminNotes })
            },
            { new: true, runValidators: true }
        )
            .populate('user', 'name email')
            .populate('restaurant', 'name')
            .lean();

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        revalidatePath('/dashboard/orders');
        revalidatePath('/admin/orders');
        revalidatePath(`/dashboard/orders/${order.orderNumber}`);

        return {
            success: true,
            message: 'Order status updated',
            data: JSON.parse(JSON.stringify(order))
        };
    } catch (error: any) {
        console.error('Update order status error:', error);

        // ✅ Better error handling
        if (error.name === 'CastError') {
            return {
                success: false,
                error: `Invalid order ID: ${orderId}`
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to update order'
        };
    }
}

export async function cancelOrder(orderId: string, reason?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Authentication required' };
        }

        await connectDB();

        const order = await Order.findOne({ _id: orderId, user: user.id });

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        // Only allow cancellation if order is still pending or confirmed
        if (!['pending', 'confirmed'].includes(order.status)) {
            return {
                success: false,
                error: `Cannot cancel order that is ${order.status}`
            };
        }

        order.status = 'cancelled';
        if (reason) {
            order.cancellationReason = reason;
        }

        await order.save();

        revalidatePath('/dashboard/orders');
        revalidatePath('/admin/orders');

        return {
            success: true,
            message: 'Order cancelled successfully',
            data: JSON.parse(JSON.stringify(order))
        };
    } catch (error: any) {
        console.error('Cancel order error:', error);
        return { success: false, error: error.message || 'Failed to cancel order' };
    }
}

export async function getOrderStats() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return { success: false, error: 'Admin access required' };
        }

        await connectDB();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalOrders,
            pendingOrders,
            totalRevenue,
            recentOrders,
            ordersByStatus,
            revenueByDay
        ] = await Promise.all([
            // Total orders
            Order.countDocuments(),

            // Pending orders
            Order.countDocuments({ status: 'pending' }),

            // Total revenue (sum of all delivered orders)
            Order.aggregate([
                { $match: { status: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),

            // Recent orders (last 30 days)
            Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),

            // Orders by status
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Revenue by day (last 7 days)
            Order.aggregate([
                {
                    $match: {
                        status: 'delivered',
                        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        revenue: { $sum: '$totalAmount' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        return {
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                totalRevenue: totalRevenue[0]?.total || 0, 
                recentOrders,
                ordersByStatus: ordersByStatus.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                revenueByDay
            }
        };
    } catch (error: any) {
        console.error('Get order stats error:', error);
        return { success: false, error: error.message || 'Failed to get stats' };
    }
}