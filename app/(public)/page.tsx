// app/(public)/page.tsx
import React from 'react';
import Link from 'next/link';
import { getRestaurants } from '@/actions/restaurant.actions';
import RestaurantCard from '@/app/components/restaurant/RestaurantCard';
import { FaUtensils, FaShippingFast, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

export default async function Home() {
    const restaurants = await getRestaurants();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Amazing Food in Osogbo</h1>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        Order from the best restaurants and canteens in Osogbo. Fast delivery, great prices, and delicious food!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/restaurants"
                            className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Order Now
                        </Link>
                        <Link
                            href="/map"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
                        >
                            View Map
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Osogbo Canteen?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUtensils className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Wide Variety</h3>
                            <p className="text-gray-600">Choose from dozens of restaurants and hundreds of dishes</p>
                        </div>

                        <div className="text-center p-6">
                            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaShippingFast className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
                            <p className="text-gray-600">Quick delivery right to your doorstep in Osogbo</p>
                        </div>

                        <div className="text-center p-6">
                            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaStar className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Quality Guaranteed</h3>
                            <p className="text-gray-600">Only the best restaurants with high ratings</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Restaurants */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Featured Restaurants</h2>
                        <Link href="/restaurants" className="text-primary hover:text-orange-600 font-semibold">
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.slice(0, 6).map((restaurant) => (
                            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                        ))}
                    </div>

                    {restaurants.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-4">No restaurants found.</p>
                            <Link href="/admin/restaurants/new" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600">
                                Add First Restaurant
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}