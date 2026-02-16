// app/admin/restaurants/page.tsx - UPDATED WITH LIVE DATA
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    Eye,
    MapPin,
    Clock,
    Star,
    Utensils,
    Loader2,
    CheckCircle,
    XCircle,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    cuisineType: string;
    address: {
        street: string;
        city: string;
        state: string;
    };
    contact: {
        phone: string;
        email: string;
    };
    rating: number;
    deliveryTime: number;
    minimumOrder: number;
    featured: boolean;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export default function AdminRestaurantsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('all');
    const [featuredFilter, setFeaturedFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null);
    const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        featured: 0
    });

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && user && user.role !== 'admin') {
            toast.error('Admin access required');
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    // Fetch restaurants on mount
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchRestaurants();
        }
    }, [user]);

    // Filter restaurants when criteria change
    useEffect(() => {
        filterRestaurants();
    }, [searchQuery, cuisineFilter, featuredFilter, restaurants]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching restaurants from admin API...');

            const response = await fetch('/api/admin/restaurants');
            const data = await response.json();

            console.log('📊 API Response:', data);

            if (data.success) {
                setRestaurants(data.data || []);
                setFilteredRestaurants(data.data || []);
                setStats(data.stats || { total: 0, active: 0, featured: 0 });

                // Extract unique cuisine types
                const uniqueCuisines = Array.from(
                    new Set((data.data || []).map((restaurant: Restaurant) => restaurant.cuisineType))
                ) as string[];
                setCuisineTypes(uniqueCuisines);

                toast.success(`Loaded ${data.data?.length || 0} restaurants`);
            } else {
                console.error('API Error:', data.message);
                toast.error(data.message || 'Failed to load restaurants');
            }
        } catch (error) {
            console.error('Network error:', error);
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const filterRestaurants = () => {
        let results = [...restaurants];

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(restaurant =>
                restaurant.name.toLowerCase().includes(query) ||
                restaurant.description.toLowerCase().includes(query) ||
                restaurant.address.city.toLowerCase().includes(query) ||
                restaurant.contact.email.toLowerCase().includes(query)
            );
        }

        // Filter by cuisine
        if (cuisineFilter !== 'all') {
            results = results.filter(restaurant => restaurant.cuisineType === cuisineFilter);
        }

        // Filter by featured
        if (featuredFilter !== 'all') {
            const isFeatured = featuredFilter === 'featured';
            results = results.filter(restaurant => restaurant.featured === isFeatured);
        }

        setFilteredRestaurants(results);
    };

    const handleDeleteRestaurant = async (restaurantId: string) => {
        try {
            console.log(`🗑️ Deleting restaurant ${restaurantId}...`);

            const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Restaurant deleted successfully');
                // Remove from local state
                setRestaurants(restaurants.filter(r => r._id !== restaurantId));
                setDeleteDialogOpen(false);
                setRestaurantToDelete(null);

                // Refresh stats
                fetchRestaurants();
            } else {
                toast.error(data.message || 'Failed to delete restaurant');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete restaurant');
        }
    };

    const handleToggleFeatured = async (restaurantId: string, currentFeatured: boolean) => {
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !currentFeatured })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Restaurant ${!currentFeatured ? 'featured' : 'unfeatured'}`);
                // Update local state
                setRestaurants(restaurants.map(r =>
                    r._id === restaurantId ? { ...r, featured: !currentFeatured } : r
                ));
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('Failed to update restaurant');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (authLoading || (user && user.role !== 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
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
                            <h1 className="text-3xl font-bold text-gray-900">Restaurants Management</h1>
                            <p className="text-gray-600">Manage all restaurants in real-time</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={fetchRestaurants} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button onClick={() => router.push('/admin/restaurants/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Restaurant
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Restaurants</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Utensils className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold">{stats.active}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Featured</p>
                                    <p className="text-2xl font-bold">{stats.featured}</p>
                                </div>
                                <Star className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        placeholder="Search restaurants by name, city, or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={cuisineFilter}
                                    onChange={(e) => setCuisineFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="all">All Cuisines</option>
                                    {cuisineTypes.map(cuisine => (
                                        <option key={cuisine} value={cuisine} className="capitalize">
                                            {cuisine}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={featuredFilter}
                                    onChange={(e) => setFeaturedFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="all">All</option>
                                    <option value="featured">Featured</option>
                                    <option value="not-featured">Not Featured</option>
                                </select>

                                <Button variant="outline" onClick={() => {
                                    setSearchQuery('');
                                    setCuisineFilter('all');
                                    setFeaturedFilter('all');
                                }}>
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Restaurants Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Restaurants</CardTitle>
                                <CardDescription>
                                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                                    {searchQuery && ` matching "${searchQuery}"`}
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                Showing {filteredRestaurants.length} of {restaurants.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading restaurants...</p>
                            </div>
                        ) : filteredRestaurants.length === 0 ? (
                            <div className="text-center py-12">
                                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
                                <p className="text-gray-500 mb-4">
                                    {searchQuery || cuisineFilter !== 'all' || featuredFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'No restaurants have been added yet'}
                                </p>
                                <Button onClick={() => router.push('/admin/restaurants/new')}>
                                    Add Your First Restaurant
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Restaurant</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Cuisine</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRestaurants.map((restaurant) => (
                                            <TableRow key={restaurant._id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                            {restaurant.images[0] ? (
                                                                <img
                                                                    src={restaurant.images[0]}
                                                                    alt={restaurant.name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = '/images/restaurants/default.jpg';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                                    <Utensils className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{restaurant.name}</div>
                                                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                                                {restaurant.description || 'No description'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span>{restaurant.address.city}, {restaurant.address.state}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {restaurant.cuisineType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 text-yellow-500" />
                                                            <span>{restaurant.rating?.toFixed(1) || '0.0'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 text-blue-500" />
                                                            <span>{restaurant.deliveryTime || 30} min</span>
                                                        </div>
                                                        <div>Min: {formatCurrency(restaurant.minimumOrder || 0)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {restaurant.featured ? (
                                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                                <Star className="h-3 w-3 mr-1" /> Featured
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Regular</Badge>
                                                        )}
                                                        <div className="text-xs text-gray-500">
                                                            Added: {new Date(restaurant.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.push(`/restaurants/${restaurant._id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.push(`/admin/restaurants/${restaurant._id}/edit`)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={restaurant.featured ? "outline" : "default"}
                                                            onClick={() => handleToggleFeatured(restaurant._id, restaurant.featured)}
                                                        >
                                                            {restaurant.featured ? 'Unfeature' : 'Feature'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setRestaurantToDelete(restaurant._id);
                                                                setDeleteDialogOpen(true);
                                                            }}
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

                {/* Delete Confirmation Dialog */}
                {deleteDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="max-w-md w-full">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                    <CardTitle>Delete Restaurant</CardTitle>
                                </div>
                                <CardDescription>
                                    Are you sure you want to delete this restaurant? This action cannot be undone.
                                    All associated food items will also be removed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setDeleteDialogOpen(false);
                                            setRestaurantToDelete(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => restaurantToDelete && handleDeleteRestaurant(restaurantToDelete)}
                                    >
                                        Delete Restaurant
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}