// app/admin/AdminSidebar.tsx - CLIENT COMPONENT
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Package,
    Users,
    Store,
    BarChart3,
    Settings,
    ShoppingBag,
    Utensils,
    MapPin,
    FileText
} from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { href: '/admin/orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { href: '/admin/restaurants', label: 'Restaurants', icon: <Store className="h-4 w-4" /> },
    { href: '/admin/foods', label: 'Food Items', icon: <Utensils className="h-4 w-4" /> },
    { href: '/admin/categories', label: 'Categories', icon: <MapPin className="h-4 w-4" /> },
    { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

interface AdminSidebarProps {
    user: any;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <nav className="p-4">
            <ul className="space-y-1">
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href ||
                                    (item.href !== '/admin' && pathname.startsWith(item.href))
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

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">ADMIN</h3>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
            </div>
        </nav>
    );
}