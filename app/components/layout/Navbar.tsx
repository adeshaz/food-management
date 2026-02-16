// components/layout/Navbar.tsx - UPDATED VERSION
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu,
    ShoppingCart,
    MapPin,
    Utensils,
    User,
    LogOut,
    ListOrdered,
    ChefHat,
    Home,
    Building2,
    Pizza,
    MapPinned,
    Bell,
    Settings,
    Tag,
    Truck,
    Loader2,
    Heart,
    CreditCard,
    Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const { user, logout, isLoading: authLoading } = useAuth();
    const { itemCount, loading: cartLoading } = useCart();

    const isActive = (path: string) =>
        pathname === path
            ? 'text-emerald-600 font-semibold'
            : 'text-muted-foreground hover:text-emerald-600 transition-colors';

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Failed to logout');
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Show loading skeleton
    if (authLoading) {
        return (
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="hidden md:block">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div className="hidden md:block">
                        <div className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                            Osogbo<span className="text-emerald-600">Foods</span>
                        </div>
                        <div className="text-xs text-gray-500 -mt-1">Taste the tradition</div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className={`flex items-center gap-1 ${isActive('/')}`}>
                        <Home size={16} />
                        Home
                    </Link>
                    <Link href="/restaurants" className={`flex items-center gap-1 ${isActive('/restaurants')}`}>
                        <Building2 size={16} />
                        Restaurants
                    </Link>
                    <Link href="/foods" className={`flex items-center gap-1 ${isActive('/foods')}`}>
                        <Pizza size={16} />
                        Menu
                    </Link>
                    <Link href="/map" className={`flex items-center gap-1 ${isActive('/map')}`}>
                        <MapPinned size={16} />
                        Food Map
                    </Link>
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Cart */}
                    <Link href="/dashboard/cart" className="relative">
                        <Button size="icon" variant="ghost" className="relative hover:bg-emerald-50">
                            <ShoppingCart className="h-5 w-5" />
                            {!cartLoading && itemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full bg-emerald-600 text-white flex items-center justify-center p-0">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {/* User Dropdown */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 hover:bg-emerald-50">
                                   
                                    <Avatar className="h-8 w-8">
                                        {user?.profileImage && (
                                            <AvatarImage
                                                src={user.profileImage}
                                                alt={user.name}
                                                className="object-cover"
                                            />
                                        )}
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                   
                                    {/* <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar> */}
                                    <span className="hidden md:inline font-medium text-gray-700">
                                        {user.name?.split(' ')[0]}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="text-emerald-700">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-gray-500 truncate">{user.email}</p>
                                        <p className="text-xs leading-none text-emerald-600 capitalize">{user.role}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/profile" className="w-full"> {/* CHANGED FROM /dashboard/profile */}
                                        <User className="mr-2 h-4 w-4" />
                                        My Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/dashboard/orders" className="w-full">
                                        <ListOrdered className="mr-2 h-4 w-4" />
                                        My Orders
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/dashboard/settings" className="w-full">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" asChild size="sm">
                                <Link href="/signin">Sign In</Link>
                            </Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild size="sm">
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="ghost" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col gap-6 py-6">
                                <div className="flex items-center gap-2 pb-4 border-b">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <ChefHat className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">Osogbo<span className="text-emerald-600">Foods</span></div>
                                        <div className="text-xs text-gray-500">Taste the tradition</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Link
                                        href="/"
                                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${pathname === '/' ? 'bg-emerald-50 text-emerald-700' : ''}`}
                                    >
                                        <Home size={18} />
                                        <span className="font-medium">Home</span>
                                    </Link>
                                    <Link
                                        href="/restaurants"
                                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${pathname === '/restaurants' ? 'bg-emerald-50 text-emerald-700' : ''}`}
                                    >
                                        <Building2 size={18} />
                                        <span className="font-medium">Restaurants</span>
                                    </Link>
                                    <Link
                                        href="/foods"
                                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${pathname === '/foods' ? 'bg-emerald-50 text-emerald-700' : ''}`}
                                    >
                                        <Pizza size={18} />
                                        <span className="font-medium">Menu</span>
                                    </Link>
                                    <Link
                                        href="/map"
                                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${pathname === '/map' ? 'bg-emerald-50 text-emerald-700' : ''}`}
                                    >
                                        <MapPinned size={18} />
                                        <span className="font-medium">Food Map</span>
                                    </Link>
                                    <Link
                                        href="/dashboard/cart"
                                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 ${pathname === '/dashboard/cart' ? 'bg-emerald-50 text-emerald-700' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShoppingCart size={18} />
                                            <span className="font-medium">Cart</span>
                                        </div>
                                        {!cartLoading && itemCount > 0 && (
                                            <Badge className="bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {itemCount}
                                            </Badge>
                                        )}
                                    </Link>
                                </div>

                                {user ? (
                                    <>

                                    
                                        
                                        
                                        <div className="pt-4 border-t">
                                            <div className="flex items-center gap-3 p-2">
                                        <Avatar className="h-10 w-10">
                                            {user?.profileImage ? (
                                                <AvatarImage
                                                    src={user.profileImage}
                                                    alt={user.name}
                                                    className="object-cover"
                                                />
                                            ) : null}
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                                </Avatar>
                                                {/* <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold">
                                                        {getUserInitials()}
                                                    </AvatarFallback>
                                                </Avatar> */}
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                    <p className="text-xs text-emerald-600 capitalize">{user.role}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Button asChild variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
                                                <Link href="/profile"> {/* CHANGED FROM /dashboard/profile */}
                                                    <User className="mr-2 h-4 w-4" />
                                                    My Profile
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
                                                <Link href="/dashboard/orders">
                                                    <ListOrdered className="mr-2 h-4 w-4" />
                                                    My Orders
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
                                                <Link href="/dashboard/settings">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Settings
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
                                                <Link href="/dashboard/wallet">
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Wallet
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
                                                <Link href="/dashboard/favorites">
                                                    <Heart className="mr-2 h-4 w-4" />
                                                    Favorites
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pt-4 border-t space-y-3">
                                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                                            <Link href="/signin">Sign In</Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50">
                                            <Link href="/signup">Sign Up</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}