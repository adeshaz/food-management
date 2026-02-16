// // components/Navigation.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { useCart } from '@/context/CartContext';
// import {
//     Home,
//     ShoppingBag,
//     Utensils,
//     User,
//     LogIn,
//     UserPlus,
//     LogOut,
//     Menu,
//     X,
//     ShoppingCart,
//     ChefHat
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// const navLinks = [
//     { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
//     { href: '/restaurants', label: 'Restaurants', icon: <Utensils className="h-4 w-4" /> },
//     { href: '/foods', label: 'Foods', icon: <ShoppingBag className="h-4 w-4" /> },
// ];

// export default function Navigation() {
//     const pathname = usePathname();
//     const { user, isAuthenticated, logout } = useAuth();
//     const { itemCount } = useCart();
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//     const handleLogout = async () => {
//         try {
//             await logout();
//         } catch (error) {
//             console.error('Logout failed:', error);
//         }
//     };

//     return (
//         <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
//             <div className="container mx-auto px-4">
//                 <div className="flex items-center justify-between h-16">
//                     {/* Logo */}
//                     <Link href="/" className="flex items-center gap-2">
//                         <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
//                             <ChefHat className="h-6 w-6 text-white" />
//                         </div>
//                         <div>
//                             <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent">
//                                 Osogbo<span className="text-emerald-600">Foods</span>
//                             </h1>
//                             <p className="text-xs text-gray-500 -mt-1">Taste the tradition</p>
//                         </div>
//                     </Link>

//                     {/* Desktop Navigation */}
//                     <div className="hidden md:flex items-center gap-6">
//                         {navLinks.map((link) => (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === link.href
//                                         ? 'bg-emerald-50 text-emerald-700 font-medium'
//                                         : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
//                                     }`}
//                             >
//                                 {link.icon}
//                                 {link.label}
//                             </Link>
//                         ))}
//                     </div>

//                     {/* Right Side Actions */}
//                     <div className="flex items-center gap-4">
//                         {/* Cart */}
//                         <Link
//                             href="/cart"
//                             className="relative p-2 text-gray-600 hover:text-emerald-600"
//                         >
//                             <ShoppingCart className="h-6 w-6" />
//                             {itemCount > 0 && (
//                                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
//                                     {itemCount}
//                                 </span>
//                             )}
//                         </Link>

//                         {/* User Actions */}
//                         {isAuthenticated ? (
//                             <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" className="gap-2">
//                                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
//                                             <User className="h-4 w-4 text-white" />
//                                         </div>
//                                         <span className="hidden md:inline">{user?.name?.split(' ')[0]}</span>
//                                     </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end" className="w-56">
//                                     <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem asChild>
//                                         <Link href="/profile" className="cursor-pointer">
//                                             <User className="h-4 w-4 mr-2" />
//                                             Profile
//                                         </Link>
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem asChild>
//                                         <Link href="/orders" className="cursor-pointer">
//                                             <ShoppingBag className="h-4 w-4 mr-2" />
//                                             My Orders
//                                         </Link>
//                                     </DropdownMenuItem>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
//                                         <LogOut className="h-4 w-4 mr-2" />
//                                         Logout
//                                     </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                             </DropdownMenu>
//                         ) : (
//                             <div className="hidden md:flex items-center gap-2">
//                                 <Button asChild variant="ghost" size="sm">
//                                     <Link href="/signin" className="gap-2">
//                                         <LogIn className="h-4 w-4" />
//                                         Sign In
//                                     </Link>
//                                 </Button>
//                                 <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-green-600">
//                                     <Link href="/signup" className="gap-2">
//                                         <UserPlus className="h-4 w-4" />
//                                         Sign Up
//                                     </Link>
//                                 </Button>
//                             </div>
//                         )}

//                         {/* Mobile Menu Button */}
//                         <button
//                             className="md:hidden p-2"
//                             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                         >
//                             {mobileMenuOpen ? (
//                                 <X className="h-6 w-6" />
//                             ) : (
//                                 <Menu className="h-6 w-6" />
//                             )}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Mobile Menu */}
//                 {mobileMenuOpen && (
//                     <div className="md:hidden py-4 border-t border-gray-200">
//                         <div className="flex flex-col gap-2">
//                             {navLinks.map((link) => (
//                                 <Link
//                                     key={link.href}
//                                     href={link.href}
//                                     className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === link.href
//                                             ? 'bg-emerald-50 text-emerald-700 font-medium'
//                                             : 'text-gray-600 hover:bg-gray-50'
//                                         }`}
//                                     onClick={() => setMobileMenuOpen(false)}
//                                 >
//                                     {link.icon}
//                                     {link.label}
//                                 </Link>
//                             ))}

//                             {!isAuthenticated && (
//                                 <>
//                                     <Link
//                                         href="/signin"
//                                         className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
//                                         onClick={() => setMobileMenuOpen(false)}
//                                     >
//                                         <LogIn className="h-4 w-4" />
//                                         Sign In
//                                     </Link>
//                                     <Link
//                                         href="/signup"
//                                         className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
//                                         onClick={() => setMobileMenuOpen(false)}
//                                     >
//                                         <UserPlus className="h-4 w-4" />
//                                         Sign Up
//                                     </Link>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </nav>
//     );
// }