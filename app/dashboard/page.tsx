// import { getCurrentUser } from '@/app/utils/session';
// import LogoutButton from '../components/auth/LogoutButton';

// export default async function DashboardPage() {
//     const user = await getCurrentUser();

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <nav className="bg-white shadow">
//                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//                     <h1 className="text-xl font-bold text-emerald-600">Dashboard</h1>
//                     <div className="flex items-center gap-4">
//                         <span className="text-gray-600">
//                             Welcome, {user?.name} ({user?.email})
//                         </span>
//                         <LogoutButton />
//                     </div>
//                 </div>
//             </nav>

//             <main className="container mx-auto px-4 py-8">
//                 <div className="bg-white rounded-lg shadow p-6">
//                     <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
//                     <p className="text-gray-600">
//                         This is a protected page. The proxy.ts file checked your authentication
//                         before allowing you to see this page.
//                     </p>

//                     <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
//                         <h3 className="font-semibold text-emerald-700 mb-2">User Information</h3>
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                             <div>
//                                 <span className="text-gray-500">Name:</span>
//                                 <span className="ml-2 font-medium">{user?.name}</span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-500">Email:</span>
//                                 <span className="ml-2 font-medium">{user?.email}</span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-500">Role:</span>
//                                 <span className="ml-2 font-medium">{user?.role}</span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-500">Status:</span>
//                                 <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
//                                     Authenticated
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mt-8">
//                         <h3 className="font-semibold text-gray-700 mb-4">How This Works:</h3>
//                         <ol className="list-decimal list-inside space-y-2 text-gray-600">
//                             <li>User visits /dashboard</li>
//                             <li>proxy.ts intercepts the request</li>
//                             <li>Checks if user has valid token cookie</li>
//                             <li>If authenticated, allows access</li>
//                             <li>If not, redirects to /signin with redirect parameter</li>
//                         </ol>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

// app/dashboard/page.tsx
import { getCurrentUser } from '@/actions/auth.actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ShoppingBag, Clock, User, Settings, LogOut } from 'lucide-react';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
                    <p className="text-gray-600 mb-6">Please sign in to access the dashboard</p>
                    <Link href="/signin">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Pending Orders', value: '0', icon: Clock, color: 'bg-amber-500' },
        { label: 'Account Since', value: new Date().toLocaleDateString(), icon: User, color: 'bg-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.name}!</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost">
                                    <Home className="h-4 w-4 mr-2" />
                                    Home
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="outline">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-full`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Welcome Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Welcome to Osogbo Foods Dashboard</CardTitle>
                        <CardDescription>
                            Manage your orders, profile, and preferences from here
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Quick Actions</h3>
                                    <p className="text-sm text-gray-600">Order food or manage your account</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href="/foods">
                                        <Button>Order Food</Button>
                                    </Link>
                                    <Link href="/profile">
                                        <Button variant="outline">View Profile</Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Name:</span>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email:</span>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Phone:</span>
                                        <p className="font-medium">{user.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium capitalize">{user.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Proxy Test Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Proxy System Working!</CardTitle>
                        <CardDescription>
                            This page is protected by the proxy authentication system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <p className="text-emerald-700 font-medium">✓ Authentication Verified</p>
                                <p className="text-emerald-600 text-sm">
                                    The proxy system verified your JWT token before allowing access to this page.
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-blue-700 font-medium">How It Works:</p>
                                <ol className="text-blue-600 text-sm list-decimal list-inside space-y-1">
                                    <li>You requested /dashboard</li>
                                    <li>proxy.ts intercepted the request</li>
                                    <li>Checked your authentication token</li>
                                    <li>Found valid token - allowed access</li>
                                    <li>If no token, would redirect to /signin</li>
                                </ol>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-lg">
                                <p className="text-amber-700 font-medium">Test Protected Routes:</p>
                                <div className="flex gap-2 mt-2">
                                    <Link href="/cart">
                                        <Button size="sm" variant="outline">Test /cart</Button>
                                    </Link>
                                    <Link href="/orders">
                                        <Button size="sm" variant="outline">Test /orders</Button>
                                    </Link>
                                    <Link href="/profile">
                                        <Button size="sm" variant="outline">Test /profile</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}