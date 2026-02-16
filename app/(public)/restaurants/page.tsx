// app/(public)/restaurants/page.tsx - COMPLETE WORKING VERSION
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Star,
    Clock,
    MapPin,
    Phone,
    Globe,
    Filter,
    ChevronRight,
    Home,
    UtensilsCrossed,
    Loader2,
    Sparkles
} from 'lucide-react';

// Define the Restaurant interface matching your API
interface Restaurant {
    _id: string;
    id?: string;
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
        email?: string;
        website?: string;
    };
    openingHours: {
        general?: string;
        [key: string]: string;
    };
    images: string[];
    rating: number;
    deliveryTime: number;
    minimumOrder: number;
    featured: boolean;
    isOpen?: boolean;
}

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<string>('all');

    // Fetch restaurants data
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/restaurants');

                if (!response.ok) {
                    throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('API Response:', data); // Debug log

                if (data.success && Array.isArray(data.data)) {
                    // Ensure each restaurant has _id
                    const restaurantsWithIds = data.data.map((restaurant: any, index: number) => ({
                        ...restaurant,
                        _id: restaurant._id || restaurant.id || `temp-id-${index}`,
                        id: restaurant._id || restaurant.id || `temp-id-${index}`,
                    }));

                    setRestaurants(restaurantsWithIds);
                    setFilteredRestaurants(restaurantsWithIds);
                } else if (Array.isArray(data)) {
                    const restaurantsWithIds = data.map((restaurant: any, index: number) => ({
                        ...restaurant,
                        _id: restaurant._id || restaurant.id || `temp-id-${index}`,
                        id: restaurant._id || restaurant.id || `temp-id-${index}`,
                    }));
                    setRestaurants(restaurantsWithIds);
                    setFilteredRestaurants(restaurantsWithIds);
                } else {
                    console.warn('Unexpected API response format:', data);
                    // Fallback to sample data
                    const sampleRestaurants = getSampleRestaurants();
                    setRestaurants(sampleRestaurants);
                    setFilteredRestaurants(sampleRestaurants);
                }
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError(err instanceof Error ? err.message : 'Failed to load restaurants');

                // Fallback to sample data
                const sampleRestaurants = getSampleRestaurants();
                setRestaurants(sampleRestaurants);
                setFilteredRestaurants(sampleRestaurants);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    // Filter restaurants based on search and cuisine
    useEffect(() => {
        if (!Array.isArray(restaurants)) {
            setFilteredRestaurants([]);
            return;
        }

        let results = restaurants;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            results = results.filter(restaurant =>
                restaurant.name.toLowerCase().includes(query) ||
                restaurant.cuisineType.toLowerCase().includes(query) ||
                restaurant.description.toLowerCase().includes(query) ||
                restaurant.address.city.toLowerCase().includes(query)
            );
        }

        // Filter by cuisine
        if (selectedCuisine !== 'all') {
            results = results.filter(restaurant =>
                restaurant.cuisineType.toLowerCase() === selectedCuisine.toLowerCase()
            );
        }

        setFilteredRestaurants(results);
    }, [searchQuery, selectedCuisine, restaurants]);

    // Get unique cuisines for filter
    const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisineType))].filter(Boolean);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading restaurants...</p>
                </div>
            </div>
        );
    }

    if (error && restaurants.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <UtensilsCrossed className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load restaurants</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles className="h-8 w-8 text-yellow-300" />
                            <h1 className="text-4xl md:text-5xl font-bold">Discover Amazing Restaurants</h1>
                            <Sparkles className="h-8 w-8 text-yellow-300" />
                        </div>
                        <p className="text-xl text-green-100 mb-8">
                            Explore the best local restaurants delivering to your doorstep
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="search"
                                placeholder="Search restaurants by name, cuisine, or location..."
                                className="pl-12 pr-4 py-3 bg-white text-gray-900 border-0 rounded-full focus:ring-2 focus:ring-green-500 shadow-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-green-600 flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium">Restaurants</span>
                </div>

                {/* Header and Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {filteredRestaurants.length} Restaurants Available
                        </h2>
                        <p className="text-gray-600">Order from your favorite local spots</p>
                    </div>

                    {/* Cuisine Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <div className="flex flex-wrap gap-2">
                            {cuisines.map((cuisine) => (
                                <Button
                                    key={cuisine}
                                    variant={selectedCuisine === cuisine ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCuisine(cuisine)}
                                    className={selectedCuisine === cuisine ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    {cuisine === 'all' ? 'All Cuisines' : cuisine}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Restaurant Grid */}
                {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search or filter to find what you're looking for
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCuisine('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRestaurants.map((restaurant, index) => {
                            // Use restaurant ID or fallback to index
                            const restaurantId = restaurant._id || restaurant.id || `restaurant-${index}`;

                            return (
                                <Card key={restaurantId} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                                    {restaurant.featured && (
                                        <div className="absolute top-3 left-3 z-10">
                                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                Featured
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Restaurant Image
                                    <div className="relative h-48 bg-gradient-to-r from-green-400 to-emerald-300">
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <UtensilsCrossed className="h-20 w-20 text-white/30" />
                                        </div>
                                        <div className="absolute bottom-3 right-3">
                                            <Badge variant="secondary" className="bg-white/90 text-green-700">
                                                {restaurant.cuisineType}
                                            </Badge>
                                        </div>
                                    </div> */}


                                    <div className="relative h-48">
                                        {restaurant.images && restaurant.images.length > 0 ? (
                                            <img
                                                src={restaurant.images[0]}
                                                alt={restaurant.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.log('❌ Image failed:', restaurant.images[0]);
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                        <div class="text-center">
                            <span class="text-3xl">🏪</span>
                            <p class="text-white text-sm mt-2">${restaurant.name}</p>
                        </div>
                    </div>
                `;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                                                <div className="text-center">
                                                    <span className="text-3xl">🏪</span>
                                                    <p className="text-white text-sm mt-2">{restaurant.name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>




                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="pr-4">
                                                <CardTitle className="text-xl line-clamp-1">{restaurant.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {restaurant.address.street}, {restaurant.address.city}
                                                    </span>
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                                                <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {restaurant.description}
                                        </p>

                                        {/* Restaurant Details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{restaurant.deliveryTime} min</span>
                                                </div>
                                                <div className="text-gray-700 font-medium">
                                                    Min: ₦{restaurant.minimumOrder.toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <span>{restaurant.contact.phone}</span>
                                            </div>

                                            {restaurant.contact.email && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Globe className="h-4 w-4" />
                                                    <span className="truncate">{restaurant.contact.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-2">
                                        <Link
                                            href={`/restaurants/${restaurantId}`}
                                            className="w-full"
                                            onClick={(e) => {
                                                if (!restaurant._id && !restaurant.id) {
                                                    console.warn('No restaurant ID available for:', restaurant.name);
                                                }
                                            }}
                                        >
                                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                                View Menu & Details
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Stats Section */}
                {restaurants.length > 0 && (
                    <Card className="mt-12 border border-gray-200">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-green-700">{restaurants.length}</p>
                                    <p className="text-gray-600">Total Restaurants</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-amber-600">
                                        {restaurants.filter(r => r.rating >= 4).length}
                                    </p>
                                    <p className="text-gray-600">Highly Rated (4+)</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {restaurants.filter(r => r.featured).length}
                                    </p>
                                    <p className="text-gray-600">Featured</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {cuisines.length - 1} {/* minus 'all' */}
                                    </p>
                                    <p className="text-gray-600">Cuisine Types</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* CTA Section */}
                <div className="mt-12 text-center">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to list your restaurant?</h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join our platform and reach thousands of hungry customers in your area.
                            Increase your sales with our delivery network.
                        </p>
                        <Button size="lg" className="bg-amber-600 hover:bg-amber-700 px-8">
                            Become a Partner Restaurant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sample restaurants fallback function
function getSampleRestaurants(): Restaurant[] {
    return [
        {
            _id: '1',
            name: 'Taste of Naija',
            description: 'Authentic Nigerian cuisine with a modern twist. Serving traditional dishes prepared with love and care.',
            cuisineType: 'Nigerian',
            address: {
                street: '123 Lagos Street',
                city: 'Osogbo',
                state: 'Osun State'
            },
            contact: {
                phone: '+234 801 234 5678',
                email: 'info@tastenaija.com',
                website: 'https://tastenaija.com'
            },
            openingHours: {
                general: '8:00 AM - 10:00 PM',
                monday: '8:00 AM - 10:00 PM',
                tuesday: '8:00 AM - 10:00 PM',
                wednesday: '8:00 AM - 10:00 PM',
                thursday: '8:00 AM - 10:00 PM',
                friday: '8:00 AM - 11:00 PM',
                saturday: '9:00 AM - 11:00 PM',
                sunday: '10:00 AM - 9:00 PM'
            },
            images: ['/api/placeholder/400/300'],
            rating: 4.5,
            deliveryTime: 25,
            minimumOrder: 1500,
            featured: true,
            isOpen: true
        },
        {
            _id: '2',
            name: 'Spice Palace',
            description: 'Best Indian and Nigerian fusion dishes. Experience the perfect blend of spices and flavors.',
            cuisineType: 'Fusion',
            address: {
                street: '456 Oke-Fia Road',
                city: 'Osogbo',
                state: 'Osun State'
            },
            contact: {
                phone: '+234 802 345 6789',
                email: 'hello@spicepalace.com'
            },
            openingHours: {
                general: '10:00 AM - 11:00 PM',
                monday: '10:00 AM - 11:00 PM',
                tuesday: '10:00 AM - 11:00 PM',
                wednesday: '10:00 AM - 11:00 PM',
                thursday: '10:00 AM - 11:00 PM',
                friday: '10:00 AM - 12:00 AM',
                saturday: '11:00 AM - 12:00 AM',
                sunday: '12:00 PM - 10:00 PM'
            },
            images: ['/api/placeholder/400/300'],
            rating: 4.2,
            deliveryTime: 30,
            minimumOrder: 1200,
            featured: false,
            isOpen: true
        },
        {
            _id: '3',
            name: 'Chop House',
            description: 'Traditional Nigerian meals served fresh daily. Your home away from home for authentic Nigerian food.',
            cuisineType: 'Nigerian',
            address: {
                street: '789 Ilesa Garage',
                city: 'Osogbo',
                state: 'Osun State'
            },
            contact: {
                phone: '+234 803 456 7890',
                email: 'contact@chophouse.com'
            },
            openingHours: {
                general: '7:00 AM - 9:00 PM',
                monday: '7:00 AM - 9:00 PM',
                tuesday: '7:00 AM - 9:00 PM',
                wednesday: '7:00 AM - 9:00 PM',
                thursday: '7:00 AM - 9:00 PM',
                friday: '7:00 AM - 10:00 PM',
                saturday: '8:00 AM - 10:00 PM',
                sunday: '8:00 AM - 8:00 PM'
            },
            images: ['/api/placeholder/400/300'],
            rating: 4.0,
            deliveryTime: 35,
            minimumOrder: 1000,
            featured: false,
            isOpen: true
        }
    ];
}