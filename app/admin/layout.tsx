// // // app/admin/layout.tsx - CREATE THIS FILE
// // 'use client';

// // import { ReactNode } from 'react';
// // import Link from 'next/link';
// // import { usePathname } from 'next/navigation';
// // import { Button } from '@/components/ui/button';
// // import { Card } from '@/components/ui/card';
// // import { useAuth } from '@/context/AuthContext';
// // import {
// //     Home,
// //     Package,
// //     Users,
// //     Store,
// //     BarChart3,
// //     Settings,
// //     LogOut,
// //     Menu,
// //     X
// // } from 'lucide-react';
// // import { useState } from 'react';

// // const navItems = [
// //     { href: '/admin', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
// //     { href: '/admin/orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
// //     { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
// //     { href: '/admin/restaurants', label: 'Restaurants', icon: <Store className="h-4 w-4" /> },
// //     { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
// //     { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
// // ];

// // export default function AdminLayout({ children }: { children: ReactNode }) {
// //     const pathname = usePathname();
// //     const { user, logout } = useAuth();
// //     const [sidebarOpen, setSidebarOpen] = useState(false);

// //     if (!user || user.role !== 'admin') {
// //         return (
// //             <div className="min-h-screen flex items-center justify-center">
// //                 <Card className="p-8 max-w-md">
// //                     <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
// //                     <p className="text-gray-600 mb-6">Admin access required</p>
// //                     <Button asChild>
// //                         <Link href="/signin">Sign In</Link>
// //                     </Button>
// //                 </Card>
// //             </div>
// //         );
// //     }

// //     return (
// //         <div className="min-h-screen bg-gray-50">
// //             {/* Mobile Header */}
// //             <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
// //                 <div className="flex items-center justify-between p-4">
// //                     <div className="flex items-center gap-2">
// //                         <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             onClick={() => setSidebarOpen(!sidebarOpen)}
// //                         >
// //                             {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
// //                         </Button>
// //                         <Link href="/admin" className="font-bold text-lg">
// //                             Admin Panel
// //                         </Link>
// //                     </div>
// //                     <div className="flex items-center gap-2">
// //                         <span className="text-sm font-medium">{user.name}</span>
// //                         <Button variant="ghost" size="sm" onClick={logout}>
// //                             <LogOut className="h-4 w-4" />
// //                         </Button>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Sidebar for Mobile */}
// //             {sidebarOpen && (
// //                 <div className="lg:hidden fixed inset-0 z-40">
// //                     <div
// //                         className="fixed inset-0 bg-black/50"
// //                         onClick={() => setSidebarOpen(false)}
// //                     />
// //                     <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
// //                         <div className="p-6 border-b">
// //                             <h2 className="text-xl font-bold">Admin Panel</h2>
// //                             <p className="text-sm text-gray-500">Management Dashboard</p>
// //                         </div>
// //                         <nav className="p-4">
// //                             <ul className="space-y-1">
// //                                 {navItems.map((item) => (
// //                                     <li key={item.href}>
// //                                         <Link
// //                                             href={item.href}
// //                                             className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
// //                                                     ? 'bg-blue-50 text-blue-700'
// //                                                     : 'text-gray-700 hover:bg-gray-100'
// //                                                 }`}
// //                                             onClick={() => setSidebarOpen(false)}
// //                                         >
// //                                             {item.icon}
// //                                             {item.label}
// //                                         </Link>
// //                                     </li>
// //                                 ))}
// //                             </ul>
// //                         </nav>
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Desktop Layout */}
// //             <div className="lg:flex">
// //                 {/* Sidebar */}
// //                 <div className="hidden lg:block w-64 bg-white border-r min-h-screen fixed left-0 top-0">
// //                     <div className="p-6 border-b">
// //                         <h2 className="text-xl font-bold">Admin Panel</h2>
// //                         <p className="text-sm text-gray-500">Management Dashboard</p>
// //                     </div>
// //                     <nav className="p-4">
// //                         <ul className="space-y-1">
// //                             {navItems.map((item) => (
// //                                 <li key={item.href}>
// //                                     <Link
// //                                         href={item.href}
// //                                         className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
// //                                                 ? 'bg-blue-50 text-blue-700'
// //                                                 : 'text-gray-700 hover:bg-gray-100'
// //                                             }`}
// //                                     >
// //                                         {item.icon}
// //                                         {item.label}
// //                                     </Link>
// //                                 </li>
// //                             ))}
// //                         </ul>
// //                     </nav>
// //                     <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
// //                         <div className="flex items-center justify-between">
// //                             <div>
// //                                 <p className="text-sm font-medium">{user.name}</p>
// //                                 <p className="text-xs text-gray-500">Admin</p>
// //                             </div>
// //                             <Button variant="ghost" size="sm" onClick={logout}>
// //                                 <LogOut className="h-4 w-4" />
// //                             </Button>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Main Content */}
// //                 <div className="lg:ml-64 flex-1 pt-16 lg:pt-0">
// //                     <main className="p-4 md:p-6">
// //                         {children}
// //                     </main>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }




// // app/admin/layout.tsx - UPDATED (Server Component)
// import { ReactNode } from 'react';
// import Link from 'next/link';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import AdminSidebar from './AdminSidebar';
// import AdminHeader from './AdminHeader';

// // Server-side admin check
// async function checkAdminAccess() {
//     try {
//         const cookieStore = cookies();
//         const token = cookieStore.get('token')?.value;

//         if (!token) {
//             return { isAdmin: false, user: null };
//         }

//         const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/auth/me`, {
//             headers: {
//                 'Cookie': `token=${token}`
//             },
//             cache: 'no-store'
//         });

//         if (response.ok) {
//             const data = await response.json();
//             return {
//                 isAdmin: data.user?.role === 'admin',
//                 user: data.user
//             };
//         }
//     } catch (error) {
//         console.error('Admin check error:', error);
//     }

//     return { isAdmin: false, user: null };
// }

// export default async function AdminLayout({ children }: { children: ReactNode }) {
//     const { isAdmin, user } = await checkAdminAccess();

//     if (!isAdmin || !user) {
//         redirect('/signin?redirect=/admin');
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Desktop Layout */}
//             <div className="lg:flex">
//                 {/* Sidebar - Desktop */}
//                 <div className="hidden lg:block w-64 bg-white border-r min-h-screen fixed left-0 top-0">
//                     <div className="p-6 border-b">
//                         <h2 className="text-xl font-bold">Admin Panel</h2>
//                         <p className="text-sm text-gray-500">Management Dashboard</p>
//                     </div>

//                     <AdminSidebar user={user} />

//                     <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm font-medium">{user.name}</p>
//                                 <p className="text-xs text-gray-500">Admin</p>
//                             </div>
//                             <form action="/api/auth/logout" method="POST">
//                                 <button
//                                     type="submit"
//                                     className="text-sm text-gray-500 hover:text-gray-700"
//                                 >
//                                     Logout
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="lg:ml-64 flex-1">
//                     {/* Mobile Header */}
//                     <AdminHeader user={user} />

//                     <main className="p-4 md:p-6">
//                         {children}
//                     </main>
//                 </div>
//             </div>
//         </div>
//     );
// }

// app/admin/layout.tsx - SIMPLE FIX
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
    Home,
    Package,
    Users,
    Store,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Utensils,
    ShoppingBag,
    Shield
} from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { href: '/admin/orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { href: '/admin/restaurants', label: 'Restaurants', icon: <Store className="h-4 w-4" /> },
    { href: '/admin/foods', label: 'Food Items', icon: <Utensils className="h-4 w-4" /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/signin?redirect=' + encodeURIComponent(pathname));
                return;
            }

            // Check if user is admin
            if (user.role !== 'admin') {
                setIsAdmin(false);
                // Optional: Redirect to dashboard if not admin
                router.push('/dashboard');
            } else {
                setIsAdmin(true);
            }
        }
    }, [user, isLoading, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p>Checking admin access...</p>
                </div>
            </div>
        );
    }

    // In app/admin/layout.tsx, replace the access denied check with this:
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <Shield className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
                        <p className="text-gray-600 mb-6">
                            You need administrator privileges to access this area.
                        </p>
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link href="/admin/login">
                                    Admin Login
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/signin">
                                    User Sign In
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
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
                        <Button variant="ghost" size="sm" onClick={logout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar for Mobile */}
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
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Desktop Layout */}
            <div className="lg:flex">
                {/* Sidebar */}
                <div className="hidden lg:block w-64 bg-white border-r min-h-screen fixed left-0 top-0">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                        <p className="text-sm text-gray-500">Management Dashboard</p>
                    </div>
                    <nav className="p-4">
                        <ul className="space-y-1">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={logout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:ml-64 flex-1 pt-16 lg:pt-0">
                    <main className="p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}