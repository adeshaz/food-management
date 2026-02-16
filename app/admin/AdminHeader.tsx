// app/admin/AdminHeader.tsx - CLIENT COMPONENT
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
    user: any;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <Link href="/admin" className="font-bold text-lg">
                            Admin Panel
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user.name}</span>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Admin Panel</h2>
                            <p className="text-sm text-gray-500">Management Dashboard</p>
                        </div>
                        <nav className="p-4">
                            <ul className="space-y-1">
                                <li>
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Home className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/orders"
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Package className="h-4 w-4" />
                                        Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/restaurants"
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Store className="h-4 w-4" />
                                        Restaurants
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Desktop Header */}
            <div className="hidden lg:block bg-white border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.name}!</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <Bell className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}