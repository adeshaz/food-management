// app/dashboard/cart/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // ADD THIS IMPORT
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ShoppingCart,
    Loader2,
    Package,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';

// ADD THIS COMPONENT - FIXES IMAGE ISSUES
function CartItemImage({ src, alt }: { src: string; alt: string }) {
    const [imgSrc, setImgSrc] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Normalize image path - FIX FOR INCORRECT PATHS
    useEffect(() => {
        if (!src) {
            setImgSrc('/images/placeholder-food.jpg');
            return;
        }

        let normalizedSrc = src;

        // FIX: If it's a local path without leading slash, add it
        // This fixes the "/dashboard/images/foods/..." error
        if (src.startsWith('images/')) {
            normalizedSrc = '/' + src;
        }
        // If it doesn't start with http or /, add /
        else if (!src.startsWith('http') && !src.startsWith('/')) {
            normalizedSrc = '/' + src;
        }
        // Already correct
        else {
            normalizedSrc = src;
        }

        setImgSrc(normalizedSrc);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        setHasError(true);
        setImgSrc('/images/placeholder-food.jpg');
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    // Show package icon if no image or error
    if (!src || hasError) {
        return (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-8 w-8 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
            )}

            {/* Use Image component for optimization */}
            <Image
                src={imgSrc}
                alt={alt}
                fill
                sizes="64px"
                className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleLoad}
                onError={handleError}
                quality={75}
                priority={false}
            />
        </div>
    );
}

export default function CartPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const {
        items,
        loading: cartLoading,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getItemCount
    } = useCart();

    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please sign in to view your cart');
            router.push('/signin?redirect=/dashboard/cart');
        }
    }, [user, authLoading, router]);

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please sign in to checkout');
            router.push('/signin?redirect=/dashboard/cart');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setCheckoutLoading(true);

        try {
            // Group items by restaurant
            const restaurantGroups = items.reduce((groups: any, item) => {
                const restaurantId = item.restaurantId || 'unknown';
                if (!groups[restaurantId]) {
                    groups[restaurantId] = {
                        restaurantId: restaurantId,
                        restaurantName: item.restaurantName || 'Restaurant',
                        items: []
                    };
                }
                groups[restaurantId].items.push(item);
                return groups;
            }, {});

            // For now, take the first restaurant (you can improve this later)
            const firstRestaurant = Object.values(restaurantGroups)[0] as any;

            if (!firstRestaurant) {
                toast.error('No restaurant found for cart items');
                return;
            }

            const subtotal = getSubtotal();
            const tax = Math.round(subtotal * 0.075);
            const deliveryFee = 500;
            const total = subtotal + deliveryFee + tax;

            const checkoutData = {
                restaurantId: firstRestaurant.restaurantId,
                restaurantName: firstRestaurant.restaurantName,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.notes
                })),
                subtotal,
                deliveryFee,
                tax,
                total
            };

            // Save to localStorage for checkout page
            localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

            // Navigate to checkout
            router.push('/dashboard/checkout');

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to proceed to checkout');
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Show loading state
    if (authLoading || cartLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading cart...</p>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link href="/foods">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Continue Shopping
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-lg">
                                {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
                            </Badge>
                            {items.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        clearCart();
                                        toast.success('Cart cleared');
                                    }}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add some delicious foods to get started!</p>
                        <Link href="/foods">
                            <Button size="lg">
                                <ShoppingBag className="h-5 w-5 mr-2" />
                                Browse Foods
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cart Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center gap-4 flex-1">
                                                    {/* USE THE NEW IMAGE COMPONENT */}
                                                    <CartItemImage
                                                        src={item.image || ''}
                                                        alt={item.name}
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold truncate">{item.name}</h3>
                                                        <p className="text-sm text-gray-600">₦{item.price.toLocaleString()} each</p>
                                                        {item.restaurantName && (
                                                            <p className="text-xs text-gray-500">From: {item.restaurantName}</p>
                                                        )}
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 truncate">Note: {item.notes}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="h-8 w-8"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="text-right min-w-24">
                                                        <p className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            removeFromCart(item.id);
                                                            toast.success('Item removed from cart');
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">₦{getSubtotal().toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Delivery Fee</span>
                                                <span className="font-medium">₦500</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tax (7.5%)</span>
                                                <span className="font-medium">₦{Math.round(getSubtotal() * 0.075).toLocaleString()}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-green-700">
                                                    ₦{(getSubtotal() + 500 + Math.round(getSubtotal() * 0.075)).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full mt-6 bg-green-600 hover:bg-green-700 py-6 text-lg"
                                            onClick={handleCheckout}
                                            disabled={checkoutLoading || items.length === 0}
                                        >
                                            {checkoutLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            ) : (
                                                <CreditCard className="h-5 w-5 mr-2" />
                                            )}
                                            Proceed to Checkout
                                        </Button>

                                        <p className="text-center text-sm text-gray-500 mt-4">
                                            By proceeding, you agree to our Terms of Service
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}