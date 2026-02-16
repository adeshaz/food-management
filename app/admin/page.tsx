// app/admin/page.tsx - SIMPLE DASHBOARD
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Package,
    Users,
    DollarSign,
    ShoppingBag,
    Clock,
    Store,
    Utensils,
    BarChart3,
    RefreshCw,
    Loader2,
    TrendingUp,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        totalUsers: 0,
        totalRestaurants: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            router.push('/admin/login');
            return;
        }

        // Fetch dashboard data
        fetchDashboardData();
    }, [user, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();

            if (data.success) {
                setStats({
                    totalOrders: data.data.overview.totalOrders || 0,
                    pendingOrders: data.data.overview.pendingOrders || 0,
                    totalRevenue: data.data.revenue.total || 0,
                    todayRevenue: data.data.revenue.today || 0,
                    totalUsers: data.data.overview.totalUsers || 0,
                    totalRestaurants: data.data.overview.totalRestaurants || 0,
                    pendingPayments: data.data.overview.pendingPayments || 0
                });
            } else {
                toast.error(data.message || 'Failed to load dashboard');
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user?.name}!</p>
                        </div>
                        <Button variant="outline" onClick={fetchDashboardData} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                                </div>
                                <ShoppingBag className="h-10 w-10 text-blue-600" />
                            </div>
                            <div className="mt-4">
                                <Link href="/admin/orders">
                                    <Button variant="outline" size="sm" className="w-full">
                                        View Orders
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Orders</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                                </div>
                                <Clock className="h-10 w-10 text-amber-600" />
                            </div>
                            <div className="mt-4">
                                <Link href="/admin/orders?status=pending">
                                    <Button variant="outline" size="sm" className="w-full">
                                        View Pending
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        ₦{stats.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <DollarSign className="h-10 w-10 text-green-600" />
                            </div>
                            <div className="mt-4">
                                <Link href="/admin/orders?paymentStatus=paid">
                                    <Button variant="outline" size="sm" className="w-full">
                                        View Revenue
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Restaurants</p>
                                    <p className="text-2xl font-bold">{stats.totalRestaurants}</p>
                                </div>
                                <Store className="h-10 w-10 text-purple-600" />
                            </div>
                            <div className="mt-4">
                                <Link href="/admin/restaurants">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Manage
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used admin actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/admin/orders">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                        <h3 className="font-medium">Manage Orders</h3>
                                        <p className="text-sm text-gray-600">View & update orders</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/admin/restaurants/new">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <Store className="h-8 w-8 text-green-600 mx-auto mb-3" />
                                        <h3 className="font-medium">Add Restaurant</h3>
                                        <p className="text-sm text-gray-600">Create new restaurant</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/admin/restaurants">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <Utensils className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                                        <h3 className="font-medium">Manage Restaurants</h3>
                                        <p className="text-sm text-gray-600">View all restaurants</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/admin/users">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <Users className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                                        <h3 className="font-medium">Manage Users</h3>
                                        <p className="text-sm text-gray-600">View all users</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* More Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Today's Revenue</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        ₦{stats.todayRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Payments</p>
                                    <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}