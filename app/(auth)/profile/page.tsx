// app/(auth)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, LogOut, Package, Clock, Shield, Settings, Edit, } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser, logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authUser) {
            router.push('/signin');
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/auth/profile');
                const data = await response.json();

                if (response.ok) {
                    setProfile(data.user);
                } else {
                    toast.error(data.message || 'Failed to load profile');
                    router.push('/signin');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authUser, router]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const getUserInitials = () => {
        if (!profile?.name) return 'U';
        return profile.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (!authUser || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                            <p className="text-gray-600">Manage your account, orders, and preferences</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                              asChild
                             className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Link href="/profile/edit">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                                </Link>
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left Column - Profile Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-emerald-600" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Your account details and contact information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Profile Header */}
                                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
                                        <Avatar className="h-16 w-16">
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xl font-bold">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{profile?.name || authUser.name}</h3>
                                            <Badge variant="outline" className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                                                {profile?.role || 'Customer'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3 p-4 bg-white rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Mail className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Email Address</p>
                                                    <p className="font-medium">{profile?.email || authUser.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 bg-white rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Phone className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone Number</p>
                                                    <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-3 p-4 bg-white rounded-lg border">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                                    <MapPin className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                                                    <p className="font-medium">{profile?.address || 'No address provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Account Info */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Account Information</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">Member Since</p>
                                                <p className="font-medium">
                                                    {profile?.createdAt
                                                        ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : 'Recently'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">Account Status</p>
                                                <p className="font-medium text-emerald-600">Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Orders Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-emerald-600" />
                                        Recent Orders
                                    </CardTitle>
                                    <CardDescription>Your recent food orders and deliveries</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                        <p className="text-gray-500 mb-6">Start ordering delicious Osogbo cuisine!</p>
                                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                            <Link href="/foods">Browse Menu</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Quick Actions & Stats */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button asChild variant="outline" className="w-full justify-start hover:bg-emerald-50">
                                        <Link href="/foods">
                                            <Package className="h-4 w-4 mr-2" />
                                            Order Food
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start hover:bg-emerald-50">
                                        <Link href="/restaurants">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Browse Restaurants
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start hover:bg-emerald-50">
                                        <Link href="/settings">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Settings
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Security Card */}
                            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-8 w-8 mt-1" />
                                        <div>
                                            <h4 className="font-bold mb-2">Account Security</h4>
                                            <p className="text-emerald-100 text-sm">
                                                Your account is protected with bank-level security and encryption.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Orders</span>
                                            <span className="font-bold">0</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Spent</span>
                                            <span className="font-bold text-emerald-600">₦0.00</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Favorites</span>
                                            <span className="font-bold">0</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}