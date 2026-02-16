'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Package,
    Search,
    Filter,
    Calendar,
    Clock,
    MapPin,
    ShoppingBag,
    CheckCircle,
    Clock3,
    Truck,
    XCircle,
    RefreshCw,
    Download,
    Eye,
    Star,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function OrdersPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/signin?redirect=/dashboard/orders');
        }
    }, [user, authLoading, router]);

    // Fetch orders function
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || authLoading) return;

            setLoading(true);
            try {
                console.log('📋 Fetching user orders from API...');
                const response = await fetch('/api/orders/my-orders', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                console.log('📥 Orders API response status:', response.status);

                const data = await response.json();

                console.log('📥 Orders API response:', {
                    success: data.success,
                    count: data.data?.length || 0,
                    message: data.message
                });

                if (data.success && data.data && Array.isArray(data.data)) {
                    // Process orders for consistent status
                    const processedOrders = data.data.map(order => ({
                        ...order,
                        status: (order.status || 'pending').toLowerCase(),
                        date: order.date || new Date(order.createdAt).toLocaleDateString(),
                        time: order.time || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        // Add fallback values
                        orderNumber: order.orderNumber || `ORD-${order.id.slice(-6)}`,
                        restaurant: order.restaurant?.name || 'Restaurant',
                        items: order.items || [],
                        total: order.total || order.totalAmount || 0,
                        deliveryAddress: order.deliveryAddress || 'No address provided'
                    }));

                    setOrders(processedOrders);
                    setFilteredOrders(processedOrders);
                    console.log(`✅ Loaded ${processedOrders.length} real orders`);
                } else {
                    console.error('❌ Failed to fetch orders:', data.message);
                    // Show empty state with helpful message
                    setOrders([]);
                    setFilteredOrders([]);
                    toast.error(data.message || 'Failed to load orders');
                }
            } catch (error) {
                console.error('❌ Error fetching orders:', error);
                setOrders([]);
                setFilteredOrders([]);
                toast.error('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user && !authLoading) {
            fetchOrders();
        }
    }, [user, authLoading]);

    // Filter orders
    useEffect(() => {
        if (orders.length === 0) return;

        let results = [...orders];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(order =>
                order.orderNumber?.toLowerCase().includes(query) ||
                order.restaurant?.toLowerCase().includes(query) ||
                order.items?.some((item: any) =>
                    item.name?.toLowerCase().includes(query)
                )
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            results = results.filter(order => order.status === selectedStatus);
        }

        // Filter by tab
        if (activeTab === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            results = results.filter(order => {
                const orderDate = order.createdAt ? new Date(order.createdAt) : new Date(order.date);
                return orderDate >= thirtyDaysAgo;
            });
        } else if (activeTab === 'pending') {
            results = results.filter(order =>
                order.status === 'preparing' ||
                order.status === 'on-the-way' ||
                order.status === 'pending' ||
                order.status === 'confirmed'
            );
        } else if (activeTab === 'delivered') {
            results = results.filter(order =>
                order.status === 'delivered' ||
                order.status === 'completed'
            );
        }

        setFilteredOrders(results);
    }, [searchQuery, selectedStatus, activeTab, orders]);

    const getStatusConfig = (status: string) => {
        const statusLower = status.toLowerCase();

        switch (statusLower) {
            case 'delivered':
            case 'completed':
                return {
                    icon: CheckCircle,
                    color: 'bg-green-100 text-green-800',
                    label: 'Delivered'
                };
            case 'preparing':
                return {
                    icon: Clock3,
                    color: 'bg-blue-100 text-blue-800',
                    label: 'Preparing'
                };
            case 'on-the-way':
            case 'out-for-delivery':
                return {
                    icon: Truck,
                    color: 'bg-purple-100 text-purple-800',
                    label: 'On the way'
                };
            case 'cancelled':
                return {
                    icon: XCircle,
                    color: 'bg-red-100 text-red-800',
                    label: 'Cancelled'
                };
            case 'pending':
            case 'confirmed':
                return {
                    icon: Clock3,
                    color: 'bg-amber-100 text-amber-800',
                    label: 'Pending'
                };
            default:
                return {
                    icon: Package,
                    color: 'bg-gray-100 text-gray-800',
                    label: 'Processing'
                };
        }
    };

    // Helper functions for stats
    const getTotalOrdersValue = () => {
        return orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
    };

    const getDeliveredCount = () => {
        return orders.filter(order =>
            order.status === 'delivered' || order.status === 'completed'
        ).length;
    };

    const getPendingCount = () => {
        return orders.filter(order =>
            order.status === 'pending' ||
            order.status === 'preparing' ||
            order.status === 'on-the-way' ||
            order.status === 'confirmed'
        ).length;
    };

    // Order actions
    const handleTrackOrder = (orderId: string) => {
        router.push(`/dashboard/tracking/${orderId}`);
    };

    const handleReorder = (order: any) => {
        alert(`Adding ${order.items.length} items from ${order.restaurant} to cart!`);
        router.push('/foods');
    };

    const handleViewOrder = (orderId: string) => {
        router.push(`/dashboard/orders/${orderId}`);
    };

    const handleRateOrder = (orderId: string) => {
        router.push(`/dashboard/orders/${orderId}/review`);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        router.push(`/dashboard/orders/${orderId}`);
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your orders...</p>
                    <p className="text-sm text-gray-500 mt-2">Fetching from database</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
                            <p className="text-green-100">Track and manage all your food orders</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <Link href="/foods">
                                <Button size="sm" className="bg-white text-green-600 hover:bg-green-50">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Order Food
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">{orders.length}</p>
                                </div>
                                <Package className="h-10 w-10 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold">₦{getTotalOrdersValue().toLocaleString()}</p>
                                </div>
                                <Badge className="bg-green-100 text-green-800">₦</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold">{getDeliveredCount()}</p>
                                </div>
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold">{getPendingCount()}</p>
                                </div>
                                <Clock3 className="h-10 w-10 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Order History</h2>
                            <p className="text-gray-600">Showing {filteredOrders.length} of {orders.length} orders</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="search"
                                    placeholder="Search orders..."
                                    className="pl-10 w-full sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="on-the-way">On the way</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All Orders</TabsTrigger>
                            <TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="delivered">Delivered</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            {/* Orders List */}
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {searchQuery ? 'No matching orders found' : 'No orders yet'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchQuery
                                            ? 'Try a different search term'
                                            : 'Place your first order to get started!'}
                                    </p>
                                    <Link href="/foods">
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <ShoppingBag className="h-4 w-4 mr-2" />
                                            Order Food Now
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredOrders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gray-50">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Package className="h-5 w-5" />
                                                                Order #{order.orderNumber}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {order.date} at {order.time}
                                                                <span className="mx-2">•</span>
                                                                <span className="font-medium">{order.restaurant}</span>
                                                            </CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold text-green-700">
                                                                    ₦{(order.total || order.totalAmount || 0).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="pt-6">
                                                    {/* Order Items - CORRECTED SECTION */}
                                                    <div className="mb-6">
                                                        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item: any, index: number) => (
                                                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                                                    <div>
                                                                        {/* Fix: Check if item.name starts with "Item " and format it better */}
                                                                        <p className="font-medium text-gray-900">
                                                                            {item.name?.startsWith('Item ')
                                                                                ? `Order Item ${index + 1}`
                                                                                : item.name || `Item ${index + 1}`}
                                                                        </p>
                                                                        <p className="text-sm text-gray-600">
                                                                            Quantity: {item.quantity} × ₦{item.price?.toLocaleString() || '0'}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-semibold">
                                                                        ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Order Details */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                        <div className="p-4 bg-gray-50 rounded-lg">
                                                            <div className="flex items-start gap-3">
                                                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900 mb-1">Delivery Address</p>
                                                                    <p className="text-gray-600 text-sm">{order.deliveryAddress || 'No address provided'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-gray-50 rounded-lg">
                                                            <div className="flex items-start gap-3">
                                                                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900 mb-1">Delivery Time</p>
                                                                    <p className="text-gray-600 text-sm">
                                                                        Estimated: {order.estimatedDelivery || '30-45 mins'}
                                                                        {order.actualDelivery && (
                                                                            <span className="block">Actual: {order.actualDelivery}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-wrap gap-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewOrder(order.id)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Button>

                                                        {/* Track Order Button */}
                                                        {(order.status === 'preparing' || order.status === 'on-the-way' || order.status === 'pending') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleTrackOrder(order.id)}
                                                            >
                                                                <Truck className="h-4 w-4 mr-2" />
                                                                Track Order
                                                            </Button>
                                                        )}

                                                        {order.status === 'delivered' && !order.rating && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRateOrder(order.id)}
                                                            >
                                                                <Star className="h-4 w-4 mr-2" />
                                                                Rate Order
                                                            </Button>
                                                        )}

                                                        {order.canReorder !== false && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleReorder(order)}
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Reorder
                                                            </Button>
                                                        )}

                                                        {(order.status === 'preparing' || order.status === 'pending' || order.status === 'on-the-way') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                            >
                                                                Cancel Order
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Help Section */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Need Help with Your Orders?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                                    <Clock className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="font-medium mb-1">Delivery Running Late?</h4>
                                <p className="text-sm text-gray-600">Contact our support team for updates</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open('tel:+2349037272637')}
                                >
                                    Call Support
                                </Button>
                            </div>

                            <div className="text-center p-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                                    <RefreshCw className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-medium mb-1">Wrong Order Received?</h4>
                                <p className="text-sm text-gray-600">Report issues within 30 minutes of delivery</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push('/contact?issue=wrong-order')}
                                >
                                    Report Issue
                                </Button>
                            </div>

                            <div className="text-center p-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                                    <Download className="h-6 w-6 text-purple-600" />
                                </div>
                                <h4 className="font-medium mb-1">Need Invoice?</h4>
                                <p className="text-sm text-gray-600">Download invoices for all completed orders</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => alert('Invoice download feature coming soon!')}
                                >
                                    Download Invoice
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}