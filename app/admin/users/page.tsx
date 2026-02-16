// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    Calendar,
    UserPlus,
    RefreshCw,
    Loader2,
    Shield,
    ShoppingBag,
    ChefHat
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
    status: string;
    profileImage?: string;
    ordersCount?: number;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();

            if (data.success) {
                setUsers(data.users || []);
            } else {
                toast.error(data.message || 'Failed to load users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users. Using mock data.');
            // Mock data for testing
            setUsers([
                {
                    _id: '1',
                    name: 'Lamidi User',
                    email: 'lamidi@gmail.com',
                    phone: '+2349037272637',
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    ordersCount: 5
                },
                {
                    _id: '2',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    profileImage: 'https://example.com/profile.jpg'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('User deleted successfully');
                fetchUsers();
            } else {
                toast.error(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'restaurant': return 'bg-green-100 text-green-800';
            case 'driver': return 'bg-orange-100 text-orange-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4" />;
            case 'restaurant': return <ChefHat className="h-4 w-4" />;
            case 'user': return <Users className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery));

        const matchesRole = selectedRole === 'all' || user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600">Manage all registered users in the system</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={fetchUsers} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search users by name, email, or phone..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                className="border rounded-lg px-3 py-2 text-sm"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="restaurant">Restaurant Owner</option>
                                <option value="admin">Admin</option>
                                <option value="driver">Driver</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Users ({filteredUsers.length})
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            Total: {users.length}
                        </span>
                    </CardTitle>
                    <CardDescription>
                        View and manage all system users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">User</th>
                                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                                    <th className="text-left py-3 px-4 font-medium">Role</th>
                                    <th className="text-left py-3 px-4 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 font-medium">Orders</th>
                                    <th className="text-left py-3 px-4 font-medium">Joined</th>
                                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        {user.profileImage ? (
                                                            <img
                                                                src={user.profileImage}
                                                                alt={user.name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <Users className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm">{user.email}</span>
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm">{user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge
                                                    className={`${getRoleBadgeColor(user.role)} flex items-center gap-1`}
                                                >
                                                    {getRoleIcon(user.role)}
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            <span className="text-green-600">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                            <span className="text-red-600">Inactive</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{user.ordersCount || 0}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.push(`/admin/users/${user._id}`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        disabled={user._id === currentUser?._id}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && (
                        <div className="flex justify-between items-center mt-6">
                            <div className="text-sm text-gray-500">
                                Showing {filteredUsers.length} of {users.length} users
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm">
                                    1
                                </Button>
                                <Button variant="outline" size="sm">
                                    2
                                </Button>
                                <Button variant="outline" size="sm">
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}