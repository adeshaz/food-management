// actions/cart.actions.ts
'use server';
import type { CartItem } from '../types/cart';
import { connectDB } from '../lib/db';
import Cart from '../models/Cart';
import FoodItem from '../models/FoodItem';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth.actions';

export async function getCart() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        await connectDB();
        const cart = await Cart.findOne({ user: user.id })
            .populate('items.foodItem')
            .populate('restaurant', 'name image')
            .lean();  

        return {
            success: true,
            data: cart ? JSON.parse(JSON.stringify(cart)) : null
        };
    } catch (error: any) {
        console.error('Get cart error:', error);
        return { success: false, error: error.message };
    }
}

export async function addToCart(foodItemId: string, quantity: number = 1, notes?: string) {  
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Please login to add items to cart' };

        await connectDB();

        // Get food item details
        const foodItem = await FoodItem.findById(foodItemId);
        if (!foodItem) {
            return { success: false, error: 'Food item not found' };
        }

        if (!foodItem.available) {
            return { success: false, error: 'This item is currently unavailable' };
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: user.id });

        if (!cart) {
            cart = await Cart.create({
                user: user.id,
                items: [],
                restaurant: foodItem.restaurant
            });
        } else {
            // Check if cart is from same restaurant
            if (cart.restaurant && cart.restaurant.toString() !== foodItem.restaurant.toString()) {
                return {
                    success: false,
                    error: 'Your cart contains items from another restaurant. Clear cart to add items from this restaurant.'
                };
            }
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (item: CartItem) => item.foodItem.toString() === foodItemId
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].notes = notes || cart.items[existingItemIndex].notes;
        } else {
            // Add new item
            cart.items.push({
                foodItem: foodItem._id,
                quantity,
                price: foodItem.price,
                notes
            });
        }

        // Update restaurant if not set
        if (!cart.restaurant) {
            cart.restaurant = foodItem.restaurant;
        }

        await cart.save();

        revalidatePath('/cart');

        return {
            success: true,
            message: 'Item added to cart',
            data: JSON.parse(JSON.stringify(cart))
        };
    } catch (error: any) {
        console.error('Add to cart error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateCartItem(foodItemId: string, quantity: number, notes?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        await connectDB();

        const cart = await Cart.findOne({ user: user.id });
        if (!cart) {
            return { success: false, error: 'Cart not found' };
        }

        const itemIndex = cart.items.findIndex(
            (item: CartItem) => item.foodItem.toString() === foodItemId
        );

        if (itemIndex === -1) {
            return { success: false, error: 'Item not found in cart' };
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity and notes
            cart.items[itemIndex].quantity = quantity;
            if (notes !== undefined) {
                cart.items[itemIndex].notes = notes; 
            }
        }

        await cart.save();

        revalidatePath('/cart');

        return {
            success: true,
            message: 'Cart updated',
            data: JSON.parse(JSON.stringify(cart))
        };
    } catch (error: any) {
        console.error('Update cart error:', error);
        return { success: false, error: error.message };
    }
}

export async function clearCart() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        await connectDB();

        const cart = await Cart.findOne({ user: user.id });
        if (!cart) {
            return { success: false, error: 'Cart not found' };
        }

        cart.items = [];
        await cart.save();

        revalidatePath('/cart');

        return {
            success: true,
            message: 'Cart cleared'
        };
    } catch (error: any) {
        console.error('Clear cart error:', error);
        return { success: false, error: error.message };
    }
}