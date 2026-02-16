// app/(public)/restaurants/[id]/page.tsx - UPDATED VERSION
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Star,
    Clock,
    MapPin,
    Phone,
    ChefHat,
    Bike,
    ArrowLeft,
    Sparkles,
    UtensilsCrossed,
    ShoppingBag,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Props {
    params: Promise<{ id: string }>;
}

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    rating: number;
    featured: boolean;
    cuisineType: string;
    address: {
        street: string;
        city: string;
        state: string;
    };
    contact: {
        phone: string;
        email?: string;
    };
    deliveryTime: number;
    minimumOrder: number;
    openingHours: any;
    images: string[];
}

async function getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
        const response = await fetch(`http://localhost:3001/api/restaurants/${id}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        console.log('📋 Restaurant API Response:', data);
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
}

export default function RestaurantPage({ params }: Props) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);

    // Load restaurant data
    const loadRestaurant = async () => {
        try {
            const data = await getRestaurantById(id);
            if (!data) {
                console.log(`❌ Restaurant not found for ID: ${id}`);
                notFound();
            }
            console.log('📋 Restaurant data loaded:', data);
            console.log('📋 Opening hours structure:', data.openingHours);
            setRestaurant(data);
        } catch (error) {
            console.error('Error loading restaurant:', error);
            notFound();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(`✅ Loading restaurant page for ID: ${id}`);

        if (!id || id === 'undefined') {
            console.log(`❌ Invalid ID: ${id}`);
            notFound();
        }

        loadRestaurant();
    }, [id]);

    // Handle View Menu - FIXED to work with your foods page
    const handleViewMenu = () => {
        if (!restaurant) return;

        // Navigate to foods page with restaurant filter
        // Your foods page uses 'restaurant' query parameter
        router.push(`/foods?restaurant=${restaurant._id}`);
    };

    // Handle Call Restaurant
    const handleCallRestaurant = () => {
        if (!restaurant) return;
        window.location.href = `tel:${restaurant.contact.phone}`;
    };

    // Format opening hours for display
    const formatOpeningHours = (openingHours: any): string => {
        if (!openingHours) return 'Hours not specified';

        if (typeof openingHours === 'string') return openingHours;

        if (openingHours.general) return openingHours.general;

        if (openingHours.monday && typeof openingHours.monday === 'object') {
            return `${openingHours.monday.open} - ${openingHours.monday.close}`;
        }

        return 'Check with restaurant for hours';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading restaurant details...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        notFound();
    }

    const openingHoursDisplay = formatOpeningHours(restaurant.openingHours);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/restaurants">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Restaurants
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
                            <p className="text-green-100 mt-1">{restaurant.description}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <Star className="h-5 w-5 text-amber-300 fill-current" />
                            <span className="font-bold text-lg">{restaurant.rating}</span>
                            {restaurant.featured && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Featured
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <UtensilsCrossed className="h-5 w-5 text-green-600" />
                                    Restaurant Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-green-600" />
                                            Location
                                        </h3>
                                        <p className="text-gray-800 font-medium">
                                            {restaurant.address?.street || 'Address not specified'}
                                        </p>
                                        <p className="text-gray-600">
                                            {restaurant.address?.city || 'City'}, {restaurant.address?.state || 'State'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Phone className="h-5 w-5 text-green-600" />
                                            Contact
                                        </h3>
                                        <p className="text-gray-800 font-medium">
                                            {restaurant.contact?.phone || 'Phone not available'}
                                        </p>
                                        {restaurant.contact?.email && (
                                            <p className="text-gray-600">{restaurant.contact.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Bike className="h-5 w-5 text-green-600" />
                                            Delivery Info
                                        </h3>
                                        <p className="text-gray-800 font-medium">{restaurant.deliveryTime} minutes</p>
                                        <p className="text-gray-600">
                                            Minimum order: ₦{restaurant.minimumOrder.toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-green-600" />
                                            Opening Hours
                                        </h3>
                                        <p className="text-gray-800 font-medium">{openingHoursDisplay}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Menu Preview Card */}
                        <Card className="border-2 border-green-200">
                            <CardContent className="p-8 text-center">
                                <ShoppingBag className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Explore Our Menu</h2>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Discover delicious dishes from {restaurant.name}. From traditional favorites to modern creations, we have something for everyone!
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={handleViewMenu}
                                    >
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        View Full Menu
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/restaurants')}
                                    >
                                        Browse Other Restaurants
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Quick Facts</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Cuisine Type</span>
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 capitalize">
                                            {restaurant.cuisineType}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Minimum Order</span>
                                        <span className="font-semibold">₦{restaurant.minimumOrder.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Time</span>
                                        <span className="font-semibold">{restaurant.deliveryTime} mins</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Customer Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                                            <span className="font-semibold">{restaurant.rating}</span>
                                            <span className="text-gray-400 text-sm">/5</span>
                                        </div>
                                    </div>
                                    {restaurant.featured && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Status</span>
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                Featured
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                                onClick={handleViewMenu}
                            >
                                <ShoppingBag className="h-5 w-5 mr-2" />
                                View Menu
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full py-6"
                                onClick={handleCallRestaurant}
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                Call Restaurant
                            </Button>

                            <Link href="/restaurants" className="block">
                                <Button variant="outline" className="w-full py-6">
                                    ← Back to All Restaurants
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}