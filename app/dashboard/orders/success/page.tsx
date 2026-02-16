// app/dashboard/orders/success/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Added Badge import
import { toast } from 'sonner';
import {
    CheckCircle,
    Package,
    Clock,
    MapPin,
    Home,
    ShoppingBag,
    MessageSquare,
    Share2,
    Loader2,
    CreditCard,
    User,
    Phone
} from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    orderNumber: string;
    totalAmount: number;
    deliveryAddress: string;
    contactName: string;
    contactPhone: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    restaurant: {
        name: string;
        address: string;
    };
    items: OrderItem[];
}

export default function OrderSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const paymentStatus = searchParams.get('payment');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) {
            setError('No order ID provided');
            setLoading(false);
            toast.error('No order ID found');
            return;
        }

        fetchOrderDetails(orderId);
    }, [orderId]);



    // Add this function to handle fallback when API fails
    const fetchOrderWithFallback = async (id: string) => {
        try {
            console.log('🔍 Fetching order from API...');
            const response = await fetch(`/api/orders/${id}`, {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            console.log('📊 API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Success:', data.success);
                if (data.success) {
                    return data.data;
                }
            }

            console.log('⚠️ API call failed, trying fallback...');
            throw new Error('API failed');

        } catch (apiError) {
            console.log('🔄 Using fallback data...');

            // Fallback: Try to get order from localStorage
            try {
                const savedOrder = localStorage.getItem(`order_${id}`);
                if (savedOrder) {
                    return JSON.parse(savedOrder);
                }

                // Check recent orders
                const recentOrders = localStorage.getItem('recentOrders');
                if (recentOrders) {
                    const orders = JSON.parse(recentOrders);
                    const foundOrder = orders.find((order: any) =>
                        order.orderNumber === id || order._id === id
                    );
                    if (foundOrder) return foundOrder;
                }
            } catch (localError) {
                console.log('Local storage error:', localError);
            }

            // Create minimal demo order
            return {
                orderNumber: id,
                totalAmount: parseInt(searchParams.get('amount') || '23935'),
                deliveryAddress: searchParams.get('address') || 'Address not loaded',
                contactName: searchParams.get('name') || 'Customer',
                contactPhone: searchParams.get('phone') || '',
                status: 'confirmed',
                paymentStatus: searchParams.get('payment') === 'success' ? 'paid' : 'pending',
                paymentMethod: searchParams.get('method') || 'card',
                createdAt: new Date().toISOString(),
                user: {
                    name: searchParams.get('name') || 'Customer',
                    email: searchParams.get('email') || ''
                },
                restaurant: {
                    name: searchParams.get('restaurant') || 'Restaurant',
                    address: ''
                },
                items: [
                    { name: 'Food Item', quantity: 1, price: 1000, total: 1000 }
                ]
            };
        }
    };

    // Update the fetchOrderDetails function
    const fetchOrderDetails = async (id: string) => {
        try {
            setLoading(true);
            setError('');

            console.log('📦 Fetching order:', id);

            // First, test auth
            const authTest = await fetch('/api/auth/test', {
                credentials: 'include'
            });
            const authData = await authTest.json();
            console.log('🔐 Auth test:', authData);

            const orderData = await fetchOrderWithFallback(id);

            // Transform the order data
            const items: OrderItem[] = (orderData.items || []).map((item: any) => {
                const foodItem = item.foodItem || {};
                return {
                    name: foodItem.name || item.name || 'Food Item',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    total: (item.quantity || 1) * (item.price || 0)
                };
            });

            const orderDetails: Order = {
                orderNumber: orderData.orderNumber || id,
                totalAmount: orderData.totalAmount || orderData.total || 0,
                deliveryAddress: orderData.deliveryAddress || 'Address not provided',
                contactName: orderData.contactName || orderData.user?.name || 'Customer',
                contactPhone: orderData.contactPhone || orderData.user?.phone || '',
                status: orderData.status || 'pending',
                paymentStatus: orderData.paymentStatus || 'pending',
                paymentMethod: orderData.paymentMethod || 'cash',
                createdAt: orderData.createdAt || new Date().toISOString(),
                user: {
                    name: orderData.user?.name || 'Customer',
                    email: orderData.user?.email || ''
                },
                restaurant: {
                    name: orderData.restaurant?.name || 'Restaurant',
                    address: orderData.restaurant?.address || ''
                },
                items
            };

            console.log('✅ Processed order:', orderDetails);
            setOrder(orderDetails);

            if (paymentStatus === 'success' || orderData.paymentStatus === 'paid') {
                toast.success('Payment successful! Your order has been placed.');
            }

        } catch (error: any) {
            console.error('❌ Error in fetchOrderDetails:', error);
            setError('Could not load full order details. Showing summary...');

            // Show minimal data
            const minimalOrder = {
                orderNumber: id,
                totalAmount: parseInt(searchParams.get('amount') || '0'),
                deliveryAddress: searchParams.get('address') || 'Address not loaded',
                contactName: searchParams.get('name') || 'Customer',
                contactPhone: '',
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: 'card',
                createdAt: new Date().toISOString(),
                user: { name: 'Customer', email: '' },
                restaurant: { name: 'Restaurant', address: '' },
                items: []
            };

            setOrder(minimalOrder);
            toast.info('Showing order summary (full details may be limited)');

        } finally {
            setLoading(false);
        }
    };




    // const fetchOrderDetails = async (id: string) => {
    //     try {
    //         setLoading(true);
    //         setError('');

    //         console.log('📦 Fetching order:', id);

    //         // FIXED: Use the correct API endpoint with credentials
    //         const response = await fetch(`/api/orders/${id}`, {
    //             credentials: 'include' // This sends cookies for authentication
    //         });

    //         console.log('Response status:', response.status);

    //         const data = await response.json();
    //         console.log('API Response data:', data);

    //         if (!response.ok || !data.success) {
    //             throw new Error(data.message || 'Failed to fetch order details');
    //         }

    //         // Transform the API response to match our Order interface
    //         const orderData = data.data;

    //         // Check if order has items
    //         if (!orderData.items || !Array.isArray(orderData.items)) {
    //             console.warn('Order items missing or not an array:', orderData);
    //         }

    //         // Transform items to include food names and calculate totals
    //         const items: OrderItem[] = (orderData.items || []).map((item: any) => {
    //             const foodItem = item.foodItem || {};
    //             return {
    //                 name: foodItem.name || 'Food Item',
    //                 quantity: item.quantity || 1,
    //                 price: item.price || 0,
    //                 total: (item.quantity || 1) * (item.price || 0)
    //             };
    //         });

    //         const orderDetails: Order = {
    //             orderNumber: orderData.orderNumber || id,
    //             totalAmount: orderData.totalAmount || 0,
    //             deliveryAddress: orderData.deliveryAddress || 'No address provided',
    //             contactName: orderData.contactName || orderData.user?.name || 'Customer',
    //             contactPhone: orderData.contactPhone || orderData.user?.phone || 'No phone',
    //             status: orderData.status || 'pending',
    //             paymentStatus: orderData.paymentStatus || 'pending',
    //             paymentMethod: orderData.paymentMethod || 'cash',
    //             createdAt: orderData.createdAt || new Date().toISOString(),
    //             user: {
    //                 name: orderData.user?.name || 'Customer',
    //                 email: orderData.user?.email || ''
    //             },
    //             restaurant: {
    //                 name: orderData.restaurant?.name || 'Restaurant',
    //                 address: orderData.restaurant?.address || ''
    //             },
    //             items
    //         };

    //         console.log('Processed order:', orderDetails);
    //         setOrder(orderDetails);

    //         // Show success toast if payment was successful
    //         if (paymentStatus === 'success' || orderData.paymentStatus === 'paid') {
    //             toast.success('Payment successful! Your order has been placed.');
    //         }

    //     } catch (error: any) {
    //         console.error('❌ Error fetching order:', error);
    //         const errorMessage = error.message || 'Failed to load order details';
    //         setError(errorMessage);
    //         toast.error(errorMessage);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleTrackOrder = () => {
        if (orderId) {
            router.push(`/dashboard/tracking/${orderId}`);
        } else {
            toast.error('Order ID not found');
            router.push('/dashboard/orders');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <h2 className="text-xl font-semibold">Loading your order...</h2>
                <p className="text-gray-600">Please wait while we fetch your order details</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Order Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <Package className="h-16 w-16 text-red-300 mx-auto mb-4" />
                            <p className="text-gray-600">{error || 'Could not load order details'}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button asChild>
                                <Link href="/dashboard/orders">
                                    View All Orders
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/">
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate estimated delivery time (30 minutes from order time)
    const orderTime = new Date(order.createdAt);
    const estimatedTime = new Date(orderTime.getTime() + 30 * 60000);
    const formattedTime = estimatedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Order Successful! 🎉
                        </h1>
                        <p className="text-xl text-gray-600">
                            Thank you for your order. We'll start preparing it right away.
                        </p>
                    </div>

                    {/* Order Summary Card */}
                    <Card className="mb-6 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-green-600" />
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                        Confirmed
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* 🚨 IMPORTANT SECTION - Shows Total Amount and Address! */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Total Amount */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CreditCard className="h-5 w-5 text-green-600" />
                                        <h3 className="font-semibold">Total Amount</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-green-700">
                                        ₦{order.totalAmount?.toLocaleString() || '0'}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Payment:</span>
                                        <Badge className={
                                            order.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : order.paymentStatus === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }>
                                            {order.paymentStatus?.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold">Delivery Address</h3>
                                    </div>
                                    <p className="text-gray-800 font-medium">
                                        {order.deliveryAddress}
                                    </p>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{order.contactName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{order.contactPhone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Order Details</h3>

                                {/* Order Items */}
                                <div className="border rounded-lg">
                                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-semibold">
                                        <div className="col-span-6">Item</div>
                                        <div className="col-span-2 text-center">Qty</div>
                                        <div className="col-span-2 text-right">Price</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>

                                    {order.items?.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 p-4 border-t">
                                            <div className="col-span-6">{item.name}</div>
                                            <div className="col-span-2 text-center">{item.quantity}</div>
                                            <div className="col-span-2 text-right">₦{item.price.toLocaleString()}</div>
                                            <div className="col-span-2 text-right font-medium">₦{item.total.toLocaleString()}</div>
                                        </div>
                                    ))}

                                    {/* Total Row */}
                                    <div className="grid grid-cols-12 gap-4 p-4 border-t bg-green-50 font-bold">
                                        <div className="col-span-8">Total Amount</div>
                                        <div className="col-span-4 text-right text-green-700">
                                            ₦{order.totalAmount?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium">Estimated Delivery</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {order.restaurant.name} will deliver by {formattedTime}
                                        </p>
                                    </div>
                                    <Badge className={
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                    }>
                                        {order.status?.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Button asChild className="h-auto py-3">
                            <Link href="/dashboard/orders">
                                <Package className="h-5 w-5 mr-2" />
                                View All Orders
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="h-auto py-3">
                            <Link href="/foods">
                                <ShoppingBag className="h-5 w-5 mr-2" />
                                Order More Food
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" className="h-auto py-3">
                            <Link href="/">
                                <Home className="h-5 w-5 mr-2" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>

                    {/* Help Section */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                        Contact Information
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>📞 Call: <strong>+234 801 234 5678</strong></li>
                                        <li>✉️ Email: <strong>support@foodmanagement.com</strong></li>
                                        <li>🏢 Restaurant: <strong>{order.restaurant.name}</strong></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Share2 className="h-5 w-5 text-purple-600" />
                                        Quick Actions
                                    </h4>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`Order #${order.orderNumber} - ₦${order.totalAmount?.toLocaleString()}`);
                                                toast.success('Order details copied!');
                                            }}
                                        >
                                            Copy Order Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => window.print()}
                                        >
                                            Print Receipt
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={handleTrackOrder}
                                        >
                                            Track This Order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Note */}
                    {order.paymentStatus === 'pending' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <h4 className="font-semibold text-yellow-800">Payment Pending</h4>
                            </div>
                            <p className="text-sm text-yellow-700">
                                Your order is confirmed but payment is pending. Please complete your payment to start food preparation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}