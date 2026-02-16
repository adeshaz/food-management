// app/admin/orders/page.tsx - FINAL CORRECTED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
    Package,
    Search,
    Filter,
    Clock,
    CheckCircle,
    Clock3,
    XCircle,
    RefreshCw,
    Eye,
    Check,
    X,
    Loader2,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    AlertCircle,
    FilterX
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { FaNairaSign } from 'react-icons/fa6';

interface Order {
    _id: string;
    orderNumber: string;
    user: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    restaurant: {
        _id: string;
        name: string;
        address?: string;
    };
    items: Array<{
        foodItem: {
            _id: string;
            name: string;
            price: number;
        };
        quantity: number;
        notes?: string;
        price: number;
    }>;
    totalAmount: number;
    deliveryAddress: string;
    contactPhone: string;
    contactName: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentMethod: 'cash' | 'card' | 'transfer';
    paymentNote?: string;
    createdAt: string;
    updatedAt: string;
    estimatedDeliveryTime: string;
    statusNotes?: string;
}

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    pendingPayments: number;
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        pendingPayments: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updateNotes, setUpdateNotes] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Check if user is admin
    useEffect(() => {
        if (!user) {
            router.push('/signin?redirect=/admin/orders');
            return;
        }

        if (user.role !== 'admin') {
            toast.error('Admin access only');
            router.push('/dashboard');
        }
    }, [user, router]);

    // Fetch orders
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchOrders();
        }
    }, [user]);

    // Filter orders when criteria change
    useEffect(() => {
        filterOrders();
    }, [searchQuery, statusFilter, paymentFilter, dateFilter, orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const response = await fetch('/api/orders/admin?populate=all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setOrders(data.data);
                setFilteredOrders(data.data);
                calculateStats(data.data);
            } else {
                toast.error(data.message || 'Failed to load orders');
                setFetchError(data.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load orders';
            toast.error(errorMessage);
            setFetchError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (orderList: Order[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orderList.filter(order =>
            new Date(order.createdAt) >= today
        );

        const totalRevenue = orderList
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        const todayRevenue = todayOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        setStats({
            totalOrders: orderList.length,
            pendingOrders: orderList.filter(o =>
                ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
            ).length,
            totalRevenue,
            todayRevenue,
            pendingPayments: orderList.filter(o => o.paymentStatus === 'pending').length
        });
    };

    const filterOrders = useCallback(() => {
        let results = [...orders];

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(order =>
                order.orderNumber.toLowerCase().includes(query) ||
                (order.user?.email?.toLowerCase() || '').includes(query) ||
                (order.contactName?.toLowerCase() || '').includes(query) ||
                (order.contactPhone?.toLowerCase() || '').includes(query) ||
                order.deliveryAddress.toLowerCase().includes(query)
            );
        }

        // Filter by order status
        if (statusFilter !== 'all') {
            results = results.filter(order => order.status === statusFilter);
        }

        // Filter by payment status
        if (paymentFilter !== 'all') {
            results = results.filter(order => order.paymentStatus === paymentFilter);
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (dateFilter) {
                case 'today':
                    results = results.filter(order => new Date(order.createdAt) >= today);
                    break;
                case 'this-week':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    results = results.filter(order => new Date(order.createdAt) >= weekAgo);
                    break;
                case 'this-month':
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    results = results.filter(order => new Date(order.createdAt) >= monthAgo);
                    break;
                default:
                    break;
            }
        }

        setFilteredOrders(results);
    }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter]);

    // In your AdminOrdersPage, update the updateOrderStatus function:
    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            setUpdating(orderId);

            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    statusNotes: updateNotes || `Status updated to ${newStatus} by admin`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('API Error Response:', data);
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            if (data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                fetchOrders(); // Refresh orders
                setSelectedOrder(null);
                setUpdateNotes('');
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update order');
        } finally {
            setUpdating(null);
        }
    };

    const updatePaymentStatus = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
        try {
            setUpdating(orderId);

            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    paymentStatus: newPaymentStatus,
                    statusNotes: updateNotes || `Payment status updated to ${newPaymentStatus} by admin`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('API Error Response:', data);
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            if (data.success) {
                toast.success(`Payment status updated to ${newPaymentStatus}`);
                fetchOrders();
                setSelectedOrder(null);
                setUpdateNotes('');
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Payment update error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update payment');
        } finally {
            setUpdating(null);
        }
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            setUpdating(orderId);

            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'delivered',
                    paymentStatus: 'paid',
                    statusNotes: updateNotes || 'Order completed by admin'
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Order marked as completed');
                fetchOrders();
                setSelectedOrder(null);
                setUpdateNotes('');
            } else {
                toast.error(data.message || 'Failed to complete order');
            }
        } catch (error) {
            console.error('Complete order error:', error);
            toast.error('Failed to complete order');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'confirmed':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
            case 'preparing':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><Package className="h-3 w-3 mr-1" />Preparing</Badge>;
            case 'ready':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Clock3 className="h-3 w-3 mr-1" />Ready</Badge>;
            case 'delivered':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Check className="h-3 w-3 mr-1" />Delivered</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
        switch (paymentStatus) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><FaNairaSign className="h-3 w-3 mr-1" />Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
            default:
                return <Badge variant="outline">{paymentStatus}</Badge>;
        }
    };

    const getPaymentMethodBadge = (method: Order['paymentMethod']) => {
        switch (method) {
            case 'card':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">💳 Card</Badge>;
            case 'transfer':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">🏦 Transfer</Badge>;
            case 'cash':
                return <Badge variant="outline" className="border-green-200 text-green-700">💰 Cash</Badge>;
            default:
                return <Badge variant="outline">{method}</Badge>;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPaymentFilter('all');
        setDateFilter('all');
    };

    const getNextStatus = (currentStatus: Order['status']): Order['status'] => {
        switch (currentStatus) {
            case 'pending':
                return 'confirmed';
            case 'confirmed':
                return 'preparing';
            case 'preparing':
                return 'ready';
            case 'ready':
                return 'delivered';
            default:
                return currentStatus;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600">Manage and track all customer orders</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                                </div>
                                <ShoppingBag className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Orders</p>
                                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        ₦{stats.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <FaNairaSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Today's Revenue</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        ₦{stats.todayRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Payments</p>
                                    <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        placeholder="Search orders by order #, customer, phone, address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </Button>

                                <Button
                                    onClick={clearFilters}
                                    variant="ghost"
                                    className="flex items-center gap-2"
                                >
                                    <FilterX className="h-4 w-4" />
                                    Clear
                                </Button>

                                <Button onClick={fetchOrders} variant="outline" size="icon" disabled={loading}>
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Order Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="preparing">Preparing</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Payment Status</label>
                                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All payments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Payments</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                                    <Select value={dateFilter} onValueChange={setDateFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="this-week">This Week</SelectItem>
                                            <SelectItem value="this-month">This Month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Orders</CardTitle>
                                <CardDescription>
                                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                Showing {filteredOrders.length} of {orders.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {fetchError ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
                                <p className="text-gray-500 mb-4">{fetchError}</p>
                                <Button onClick={fetchOrders} variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500 mb-4">
                                    {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'No orders have been placed yet'}
                                </p>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Restaurant</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Order Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                            <TableRow key={order._id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{order.orderNumber}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {getPaymentMethodBadge(order.paymentMethod)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{order.contactName}</span>
                                                        <span className="text-sm text-gray-500">{order.contactPhone}</span>
                                                        <span className="text-xs text-gray-400 truncate max-w-[150px]">
                                                            {order.user?.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {order.restaurant?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="font-bold text-green-700">
                                                        ₦{order.totalAmount?.toLocaleString() || '0'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {getStatusBadge(order.status)}
                                                        {order.paymentNote && (
                                                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                                                {order.paymentNote}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {getPaymentBadge(order.paymentStatus)}
                                                        {order.paymentStatus === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-xs"
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setUpdateNotes('Marked as paid by admin');
                                                                    // If you want to mark as paid immediately:
                                                                    updatePaymentStatus(order._id, 'paid'); // Use order._id
                                                                }}
                                                            >
                                                                Mark Paid
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">
                                                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {format(new Date(order.createdAt), 'h:mm a')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedOrder(order)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>

                                                        {/* Quick status update */}
                                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const nextStatus = getNextStatus(order.status);
                                                                    updateOrderStatus(order._id, nextStatus); // Use order._id, not orderNumber
                                                                }}
                                                                disabled={updating === order._id}
                                                            >
                                                                {updating === order._id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}

                                                        {/* Quick delivery */}
                                                        {order.status === 'ready' && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => updateOrderStatus(order._id, 'delivered')} // Use order._id
                                                                disabled={updating === order._id}
                                                            >
                                                                {updating === order._id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    'Deliver'
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">Order #{selectedOrder.orderNumber}</h3>
                                        <p className="text-gray-600">
                                            Placed on {format(new Date(selectedOrder.createdAt), 'PPP')}
                                        </p>
                                    </div>
                                    <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Customer & Order Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Customer Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p><strong>Name:</strong> {selectedOrder.contactName}</p>
                                                <p><strong>Phone:</strong> {selectedOrder.contactPhone}</p>
                                                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                                                <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Order Details</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p><strong>Restaurant:</strong> {selectedOrder.restaurant?.name || 'N/A'}</p>
                                                <p><strong>Total Amount:</strong> ₦{selectedOrder.totalAmount?.toLocaleString()}</p>
                                                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                                                <div className="flex items-center gap-2">
                                                    <strong>Payment Status:</strong> {getPaymentBadge(selectedOrder.paymentStatus)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <strong>Order Status:</strong> {getStatusBadge(selectedOrder.status)}
                                                </div>
                                                <p><strong>Estimated Delivery:</strong> {format(new Date(selectedOrder.estimatedDeliveryTime), 'h:mm a')}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Order Items */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Order Items</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {selectedOrder.items?.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 border-b">
                                                    <div>
                                                        <p className="font-medium">{item.foodItem?.name || `Item ${index + 1}`}</p>
                                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                        {item.notes && (
                                                            <p className="text-sm text-gray-500">Note: {item.notes}</p>
                                                        )}
                                                    </div>
                                                    <p className="font-medium">₦{((item.price || 0) * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                                <span>Total</span>
                                                <span>₦{selectedOrder.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Update Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Update Order</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Status Update */}
                                            <div>
                                                <h4 className="font-semibold mb-2">Order Status</h4>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] as const).map((status) => (
                                                        <Button
                                                            key={status}
                                                            variant={selectedOrder.status === status ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => updateOrderStatus(selectedOrder._id, status)}
                                                            disabled={updating === selectedOrder._id}
                                                        >
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Status Update */}
                                            <div>
                                                <h4 className="font-semibold mb-2">Payment Status</h4>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(['pending', 'paid', 'failed'] as const).map((status) => (
                                                        <Button
                                                            key={status}
                                                            variant={selectedOrder.paymentStatus === status ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => updatePaymentStatus(selectedOrder._id, status)}
                                                            disabled={updating === selectedOrder._id}
                                                        >
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Update Notes</label>
                                                <Textarea
                                                    placeholder="Add notes for this update..."
                                                    value={updateNotes}
                                                    onChange={(e) => setUpdateNotes(e.target.value)}
                                                    className="mb-4"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedOrder(null);
                                                        setUpdateNotes('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => handleCompleteOrder(selectedOrder._id)}
                                                    disabled={updating === selectedOrder._id}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {updating === selectedOrder._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : null}
                                                    Complete Order
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}