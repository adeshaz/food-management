// app/admin/foods/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Loader2,
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FoodItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    restaurant: {
        _id: string;
        name: string;
    };
    isAvailable: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export default function AdminFoodsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [categories, setCategories] = useState<string[]>([]);

    // Check if user is admin
    useEffect(() => {
        if (!user) {
            router.push('/signin?redirect=/admin/foods');
            return;
        }

        if (user.role !== 'admin') {
            toast.error('Admin access only');
            router.push('/dashboard');
        }
    }, [user, router]);

    // Fetch foods
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchFoods();
        }
    }, [user]);

    // Filter foods when criteria change
    useEffect(() => {
        filterFoods();
    }, [searchQuery, categoryFilter, availabilityFilter, foods]);

    const fetchFoods = async () => {
        try {
            setLoading(true);

            // ✅ API returns {success, data, pagination}
            const response = await fetch('/api/foods/admin');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📋 Foods API response:', data); // Debug log

            if (data.success && data.data) {
                setFoods(data.data);
                setFilteredFoods(data.data);

                // Extract unique categories
                const uniqueCategories = Array.from(
                    new Set(data.data.map((food: FoodItem) => food.category))
                ) as string[];
                setCategories(uniqueCategories);

                toast.success(`Loaded ${data.data.length} food items`);
            } else {
                toast.error(data.message || 'Failed to load foods');
                setFoods([]);
                setFilteredFoods([]);
            }
        } catch (error: any) {
            console.error('Failed to fetch foods:', error);
            toast.error('Failed to load foods: ' + error.message);
            setFoods([]);
            setFilteredFoods([]);
        } finally {
            setLoading(false);
        }
    };

    const filterFoods = () => {
        let results = [...foods];

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(food =>
                food.name.toLowerCase().includes(query) ||
                (food.description && food.description.toLowerCase().includes(query)) ||
                food.restaurant.name.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            results = results.filter(food => food.category === categoryFilter);
        }

        // Filter by availability
        if (availabilityFilter !== 'all') {
            const isAvailable = availabilityFilter === 'available';
            results = results.filter(food => food.isAvailable === isAvailable);
        }

        setFilteredFoods(results);
    };

    const toggleAvailability = async (foodId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/foods/${foodId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isAvailable: !currentStatus,
                    available: !currentStatus // Send both to be safe
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Food item ${!currentStatus ? 'enabled' : 'disabled'}`);
                fetchFoods(); // Refresh list
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('Failed to update food');
        }
    };

    const deleteFood = async (foodId: string) => {
        if (!confirm('Are you sure you want to delete this food item?')) return;

        try {
            const response = await fetch(`/api/foods/${foodId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Food item deleted');
                fetchFoods(); // Refresh list
            } else {
                toast.error(data.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete food');
        }
    };

    // Add categories for the dropdown
    const getCategoryOptions = () => {
        if (categories.length === 0) return [];

        // Your FoodItem model has specific categories, let's map them
        const categoryMap: Record<string, string> = {
            'local-delicacies': 'Local Delicacies',
            'swallow-foods': 'Swallow Foods',
            'grills-and-bbq': 'Grills & BBQ',
            'snacks-and-drinks': 'Snacks & Drinks',
            'rice-dishes': 'Rice Dishes',
            'soups-and-stews': 'Soups & Stews',
            'breakfast': 'Breakfast',
            'desserts': 'Desserts',
            'proteins': 'Proteins',
            'beverages': 'Beverages',
            'appetizers': 'Appetizers',
            'specials': 'Specials'
        };

        return categories.map(cat => ({
            value: cat,
            label: categoryMap[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading food items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Food Items Management</h1>
                            <p className="text-gray-600">Manage all food items across restaurants</p>
                        </div>
                        <Button onClick={() => router.push('/admin/foods/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Food Item
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        placeholder="Search foods by name, description, or restaurant..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md text-sm min-w-[150px]"
                                >
                                    <option value="all">All Categories</option>
                                    {getCategoryOptions().map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={availabilityFilter}
                                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>

                                <Button onClick={fetchFoods} variant="outline" size="icon" title="Refresh">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Foods</p>
                                    <p className="text-2xl font-bold">{foods.length}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Available</p>
                                    <p className="text-2xl font-bold">
                                        {foods.filter(f => f.isAvailable).length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Restaurants</p>
                                    <p className="text-2xl font-bold">
                                        {Array.from(new Set(foods.map(f => f.restaurant._id))).length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Foods Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Food Items</CardTitle>
                                <CardDescription>
                                    {filteredFoods.length} food item{filteredFoods.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                Showing {filteredFoods.length} of {foods.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredFoods.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {foods.length === 0 ? 'No food items found' : 'No matching food items'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {searchQuery || categoryFilter !== 'all' || availabilityFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Click "Add Food Item" to create your first food item'}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={() => {
                                        setSearchQuery('');
                                        setCategoryFilter('all');
                                        setAvailabilityFilter('all');
                                    }}>
                                        Clear Filters
                                    </Button>
                                    {foods.length === 0 && (
                                        <Button onClick={() => router.push('/admin/foods/new')}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Food Item
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Food Item</TableHead>
                                            <TableHead>Restaurant</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFoods.map((food) => (
                                            <TableRow key={food._id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{food.name}</span>
                                                        {food.description && (
                                                            <span className="text-sm text-gray-500 truncate max-w-[200px]">
                                                                {food.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{food.restaurant.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {food.category.replace(/-/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-green-700">
                                                        ₦{food.price?.toLocaleString() || '0'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {food.isAvailable ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Available
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                                            <XCircle className="h-3 w-3 mr-1" /> Unavailable
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.push(`/admin/foods/${food._id}/edit`)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={food.isAvailable ? "outline" : "default"}
                                                            onClick={() => toggleAvailability(food._id, food.isAvailable)}
                                                        >
                                                            {food.isAvailable ? 'Disable' : 'Enable'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => deleteFood(food._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
            </div>
        </div>
    );
}