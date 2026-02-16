import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/models/Cart';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await User.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getUserFromToken(request);

        if (!user) {
            // Return empty cart for non-logged in users
            return NextResponse.json({
                success: true,
                cart: {
                    items: [],
                    total: 0,
                    itemCount: 0
                },
                message: 'User not logged in, returning empty cart'
            });
        }

        // Get or create cart for user
        let cart = await Cart.findOne({ userId: user._id });

        if (!cart) {
            cart = await Cart.create({
                userId: user._id,
                items: [],
                total: 0
            });
        }

        return NextResponse.json({
            success: true,
            cart: {
                id: cart._id,
                items: cart.items,
                total: cart.total,
                itemCount: cart.items.length
            }
        });

    } catch (error: any) {
        console.error('Cart GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch cart'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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
        const { productId, name, price, quantity = 1, image } = body;

        if (!productId || !name || !price) {
            return NextResponse.json({
                success: false,
                error: 'Product ID, name, and price are required'
            }, { status: 400 });
        }

        let cart = await Cart.findOne({ userId: user._id });

        if (!cart) {
            cart = await Cart.create({
                userId: user._id,
                items: [],
                total: 0
            });
        }

        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(
            (item: any) => item.productId === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                name,
                price,
                quantity,
                image
            });
        }

        // Recalculate total
        cart.total = cart.items.reduce(
            (sum: number, item: any) => sum + (item.price * item.quantity),
            0
        );

        await cart.save();

        return NextResponse.json({
            success: true,
            message: 'Item added to cart',
            cart: {
                id: cart._id,
                items: cart.items,
                total: cart.total,
                itemCount: cart.items.length
            }
        });

    } catch (error: any) {
        console.error('Cart POST error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to add item to cart'
        }, { status: 500 });
    }
}