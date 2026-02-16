// app/components/FeaturedRestaurants.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronRight } from 'lucide-react';

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    cuisineType: string;
    images: string[];
    rating: number;
    deliveryTime: number;
    featured: boolean;
}

export default function FeaturedRestaurants() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch('/api/restaurants');
                const data = await response.json();

                if (data.success && data.data) {
                    // Get top 3 restaurants
                    const topRestaurants = data.data
                        .sort((a, b) => b.rating - a.rating)
                        .slice(0, 3);

                    setRestaurants(topRestaurants);
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 text-center">
                    <p>Loading restaurants...</p>
                </div>
            </section>
        );
    }

    if (restaurants.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
                        <Star className="h-4 w-4 mr-2 fill-current" />
                        Top Rated
                    </Badge>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Restaurants</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Top-rated eateries in Osogbo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {restaurants.map((restaurant, index) => (
                        <motion.div
                            key={restaurant._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                        >
                            <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all">
                                {/* Restaurant Image */}
                                <div className="relative h-48">
                                    {restaurant.images && restaurant.images.length > 0 ? (
                                        <img
                                            src={restaurant.images[0]}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                            <div class="text-center">
                              <span class="text-3xl">🏪</span>
                              <p class="text-white text-sm mt-2">${restaurant.name}</p>
                            </div>
                          </div>
                        `;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-3xl">🏪</span>
                                                <p className="text-white text-sm mt-2">{restaurant.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                            Open Now
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <Badge className="bg-amber-500 hover:bg-amber-600">
                                            <Star className="h-3 w-3 mr-1 fill-white" />
                                            {restaurant.rating.toFixed(1)}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                                    </div>
                                    <p className="text-gray-600 mb-4">{restaurant.cuisineType} • {restaurant.deliveryTime} min</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="outline" className="text-xs">
                                            {restaurant.cuisineType}
                                        </Badge>
                                        {restaurant.featured && (
                                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                                                Featured
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                            Delivery
                                        </Badge>
                                    </div>

                                    <Button
                                        asChild
                                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                    >
                                        <Link href={`/restaurants/${restaurant._id}`}>
                                            View Menu & Order
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button
                        asChild
                        variant="outline"
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg"
                    >
                        <Link href="/restaurants">
                            View All Restaurants
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}