// app/api/cart/put/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromToken(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        await connectToDatabase();
        const user = await User.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
}

export async function PUT(request: NextRequest) {
    console.log('🔄 PUT Cart Sync API called');

    try {
        await connectToDatabase();

        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }

        const body = await request.json();
        const { items } = body;

        console.log(`🔄 Syncing cart for ${user.email} with ${items?.length || 0} items`);

        if (!Array.isArray(items)) {
            return NextResponse.json({
                success: false,
                error: 'Items must be an array'
            }, { status: 400 });
        }

        // Transform to database format
        const dbItems = items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            notes: item.notes
        }));

        // Update user's cart
        user.cart = dbItems;
        await user.save();

        console.log(`✅ Cart synced for ${user.email}. New item count: ${user.cart.length}`);

        return NextResponse.json({
            success: true,
            message: 'Cart synced successfully',
            cart: {
                items: user.cart,
                total: user.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                itemCount: user.cart.length
            }
        });

    } catch (error: any) {
        console.error('Cart sync error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to sync cart'
        }, { status: 500 });
    }
}