// // app/api/cart/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';
// import { connectToDatabase } from '@/lib/db';
// import Cart from '@/models/Cart';
// import FoodItem from '@/models/FoodItem';

// export async function GET(request: NextRequest) {
//     try {
//         await connectToDatabase();

//         console.log('=== CART GET ENDPOINT CALLED ===');

//         // Get token from cookies
//         const cookieStore = await cookies();
//         const token = cookieStore.get('token')?.value;

//         console.log('Token exists:', !!token);

//         if (!token) {
//             console.log('No token found, returning empty cart');
//             // Return empty cart structure instead of 401
//             return NextResponse.json({
//                 success: true,
//                 cart: null,
//                 message: 'No authenticated user'
//             });
//         }

//         try {
//             // Verify token
//             const decoded = jwt.verify(
//                 token,
//                 process.env.JWT_SECRET || 'your-secret-key-change-in-production'
//             ) as any;

//             console.log('User ID from token:', decoded.id);

//             // Get user's cart
//             let cart = await Cart.findOne({ user: decoded.id })
//                 .populate({
//                     path: 'items.foodItem',
//                     model: FoodItem,
//                     select: 'name description price category images'
//                 });

//             if (!cart) {
//                 // Create empty cart if it doesn't exist
//                 cart = await Cart.create({
//                     user: decoded.id,
//                     items: [],
//                     totalAmount: 0
//                 });

//                 console.log('Created new empty cart');
//             }

//             console.log('Cart found/created:', cart._id);

//             return NextResponse.json({
//                 success: true,
//                 cart
//             });

//         } catch (jwtError) {
//             console.error('JWT error in cart:', jwtError);
//             // Return empty cart instead of error
//             return NextResponse.json({
//                 success: true,
//                 cart: null,
//                 message: 'Invalid token'
//             });
//         }

//     } catch (error) {
//         console.error('Cart GET error:', error);
//         return NextResponse.json({
//             success: false,
//             message: 'Internal server error',
//             cart: null
//         }, { status: 500 });
//     }
// }

// export async function POST(request: NextRequest) {
//     try {
//         await connectToDatabase();

//         console.log('=== CART POST ENDPOINT CALLED ===');

//         // Check authentication
//         const cookieStore = await cookies();
//         const token = cookieStore.get('token')?.value;

//         console.log('Token for POST:', !!token);

//         if (!token) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: 'Please sign in to add items to cart'
//                 },
//                 { status: 401 }
//             );
//         }

//         // Verify token
//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET || 'your-secret-key-change-in-production'
//         ) as any;

//         const body = await request.json();
//         const { foodItemId, quantity = 1 } = body;

//         console.log('Adding to cart:', { foodItemId, quantity, userId: decoded.id });

//         // Find the food item to get price
//         const foodItem = await FoodItem.findById(foodItemId);

//         if (!foodItem) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: 'Food item not found'
//                 },
//                 { status: 404 }
//             );
//         }

//         console.log('Food item found:', foodItem.name, 'Price:', foodItem.price);

//         // Find or create cart for user
//         let cart = await Cart.findOne({ user: decoded.id });

//         if (!cart) {
//             cart = await Cart.create({
//                 user: decoded.id,
//                 items: [],
//                 totalAmount: 0
//             });
//             console.log('Created new cart');
//         }

//         // Check if item already exists in cart
//         const existingItemIndex = cart.items.findIndex(
//             (item: any) => item.foodItem.toString() === foodItemId
//         );

//         if (existingItemIndex > -1) {
//             // Update quantity if item exists
//             cart.items[existingItemIndex].quantity += quantity;
//             console.log('Updated existing item quantity');
//         } else {
//             // Add new item
//             cart.items.push({
//                 foodItem: foodItemId,
//                 quantity,
//                 price: foodItem.price
//             });
//             console.log('Added new item to cart');
//         }

//         // Save cart
//         await cart.save();

//         // Populate food item details
//         await cart.populate({
//             path: 'items.foodItem',
//             model: FoodItem,
//             select: 'name description price category images'
//         });

//         console.log('Cart saved successfully, total items:', cart.items.length);

//         return NextResponse.json({
//             success: true,
//             cart,
//             message: 'Item added to cart'
//         });

//     } catch (error: any) {
//         console.error('Cart POST error:', error);

//         if (error.name === 'JsonWebTokenError') {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: 'Please sign in again'
//                 },
//                 { status: 401 }
//             );
//         }

//         return NextResponse.json(
//             {
//                 success: false,
//                 message: 'Internal server error'
//             },
//             { status: 500 }
//         );
//     }
// }



// app/api/cart/route.ts - COMPLETELY REWRITTEN
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to get user from token
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

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
    console.log('🛒 GET Cart API called');

    try {
        await connectToDatabase();

        const user = await getUserFromToken(request);

        if (!user) {
            console.log('❌ No user found - returning empty cart');
            return NextResponse.json({
                success: true,
                message: 'User not logged in',
                cart: {
                    items: [],
                    total: 0,
                    itemCount: 0
                }
            });
        }

        console.log(`✅ Found user: ${user.email}, cart items: ${user.cart?.length || 0}`);

        // Calculate total from user's cart
        const total = user.cart?.reduce((sum, item) =>
            sum + (item.price * (item.quantity || 1)), 0) || 0;

        // Transform cart items to frontend format
        const items = user.cart?.map(item => ({
            id: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            notes: item.notes
        })) || [];

        return NextResponse.json({
            success: true,
            message: 'Cart fetched successfully',
            cart: {
                items: items,
                total: total,
                itemCount: items.length
            }
        });

    } catch (error: any) {
        console.error('Cart GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch cart',
            cart: {
                items: [],
                total: 0,
                itemCount: 0
            }
        }, { status: 500 });
    }
}

// POST /api/cart - Update user's cart
export async function POST(request: NextRequest) {
    console.log('🛒 POST Cart API called');

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
        const { productId, name, price, quantity = 1, image, restaurantId, restaurantName, notes } = body;

        console.log('📦 Cart update data:', {
            productId,
            name,
            price,
            quantity,
            userEmail: user.email
        });

        if (!productId || !name || !price) {
            return NextResponse.json({
                success: false,
                error: 'Product ID, name, and price are required'
            }, { status: 400 });
        }

        // Initialize user.cart if it doesn't exist
        if (!user.cart) {
            user.cart = [];
        }

        // Check if item already exists in cart
        const existingItemIndex = user.cart.findIndex(
            (item: any) => item.productId === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            user.cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            user.cart.push({
                productId,
                name,
                price,
                quantity,
                image,
                restaurantId,
                restaurantName,
                notes
            });
        }

        // Save user with updated cart
        await user.save();

        console.log(`✅ Cart updated for ${user.email}. Total items: ${user.cart.length}`);

        return NextResponse.json({
            success: true,
            message: 'Item added to cart',
            cart: {
                items: user.cart,
                total: user.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                itemCount: user.cart.length
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

// PUT /api/cart - Update entire cart (sync)
export async function PUT(request: NextRequest) {
    console.log('🛒 PUT Cart API called - Full cart sync');

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

        // Update entire cart
        user.cart = items.map(item => ({
            productId: item.id || item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            notes: item.notes
        }));

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
        console.error('Cart PUT error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to sync cart'
        }, { status: 500 });
    }
}

// DELETE /api/cart - Clear user's cart
export async function DELETE(request: NextRequest) {
    console.log('🛒 DELETE Cart API called');

    try {
        await connectToDatabase();

        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }

        // Clear user's cart
        user.cart = [];
        await user.save();

        console.log(`✅ Cart cleared for ${user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Cart cleared successfully',
            cart: {
                items: [],
                total: 0,
                itemCount: 0
            }
        });

    } catch (error: any) {
        console.error('Cart DELETE error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to clear cart'
        }, { status: 500 });
    }
}