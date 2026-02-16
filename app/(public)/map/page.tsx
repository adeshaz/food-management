// // app/(public)/map/page.tsx
// import React from 'react';
// import { getRestaurants } from '@/actions/restaurant.actions';
// import dynamic from 'next/dynamic';

// const DynamicMap = dynamic(() => import('@/app/components/Map'), {
//     ssr: false,
//     loading: () => (
//         <div className="h-[500px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
//             <p className="text-gray-500">Loading map...</p>
//         </div>
//     )
// });

// export default async function MapPage() {
//     const restaurants = await getRestaurants();

//     return (
//         <div className="min-h-screen bg-gray-50 py-8">
//             <div className="container mx-auto px-4">
//                 <div className="text-center mb-8">
//                     <h1 className="text-4xl font-bold text-gray-800 mb-4">Food Map</h1>
//                     <p className="text-gray-600 max-w-2xl mx-auto">
//                         Find restaurants near you in Osogbo. Click on markers to see restaurant details and menus.
//                     </p>
//                 </div>

//                 <DynamicMap restaurants={restaurants} />

//                 {/* Restaurants List */}
//                 <div className="mt-12">
//                     <h2 className="text-2xl font-bold text-center mb-8">All Restaurants ({restaurants.length})</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {restaurants.map((restaurant) => (
//                             <div key={restaurant._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//                                 <div className="flex items-start justify-between mb-3">
//                                     <h3 className="font-semibold text-lg">{restaurant.name}</h3>
//                                     <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
//                                         {restaurant.rating} ⭐
//                                     </span>
//                                 </div>
//                                 <p className="text-gray-600 text-sm mb-3">{restaurant.location.address}</p>
//                                 <div className="flex justify-between items-center text-sm">
//                                     <span className="text-gray-500">{restaurant.menu.length} items</span>
//                                     <a
//                                         href={`/restaurants/${restaurant._id}`}
//                                         className="text-primary hover:text-orange-600 font-semibold"
//                                     >
//                                         View Menu →
//                                     </a>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {restaurants.length === 0 && (
//                         <div className="text-center py-12">
//                             <p className="text-gray-500 text-lg">No restaurants found. Check back later!</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
// app/(public)/map/page.tsx
// import React from 'react';
// import { getRestaurants } from '@/actions/restaurant.actions';
// import dynamic from 'next/dynamic';

// const DynamicMap = dynamic(() => import('@/app/components/Map'), {
//     ssr: false,
//     loading: () => (
//         <div className="h-[500px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
//             <p className="text-gray-500">Loading map...</p>
//         </div>
//     )
// });

// export default async function MapPage() {
//     // FIX: Convert mongoose docs → JSON
//     const restaurants = JSON.parse(JSON.stringify(await getRestaurants()));

//     return (
//         <div className="min-h-screen bg-gray-50 py-8">
//             <div className="container mx-auto px-4">
//                 <div className="text-center mb-8">
//                     <h1 className="text-4xl font-bold text-gray-800 mb-4">Food Map</h1>
//                     <p className="text-gray-600 max-w-2xl mx-auto">
//                         Find restaurants near you in Osogbo. Click on markers to see restaurant details and menus.
//                     </p>
//                 </div>

//                 <DynamicMap restaurants={restaurants} />

//                 {/* Restaurants List */}
//                 <div className="mt-12">
//                     <h2 className="text-2xl font-bold text-center mb-8">
//                         All Restaurants ({restaurants.length})
//                     </h2>

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {restaurants.map((restaurant: any) => (
//                             <div
//                                 key={restaurant._id}
//                                 className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
//                             >
//                                 <div className="flex items-start justify-between mb-3">
//                                     <h3 className="font-semibold text-lg">{restaurant.name}</h3>
//                                     <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
//                                         {restaurant.rating} ⭐
//                                     </span>
//                                 </div>

//                                 <p className="text-gray-600 text-sm mb-3">
//                                     {restaurant.location.address}
//                                 </p>

//                                 <div className="flex justify-between items-center text-sm">
//                                     <span className="text-gray-500">
//                                         {restaurant.menu?.length ?? 0} items
//                                     </span>
//                                     <a
//                                         href={`/restaurants/${restaurant._id}`}
//                                         className="text-primary hover:text-orange-600 font-semibold"
//                                     >
//                                         View Menu →
//                                     </a>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {restaurants.length === 0 && (
//                         <div className="text-center py-12">
//                             <p className="text-gray-500 text-lg">No restaurants found. Check back later!</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Filter } from 'lucide-react';

export default function MapPage() {
    const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const restaurants = [
        { id: 1, name: 'Amala Sky Restaurant', lat: 7.7703, lng: 4.5549, rating: 4.8, deliveryTime: '25-35 min', open: true },
        { id: 2, name: 'Suya Palace', lat: 7.7710, lng: 4.5555, rating: 4.9, deliveryTime: '20-30 min', open: true },
        { id: 3, name: 'Osogbo Kitchen', lat: 7.7695, lng: 4.5538, rating: 4.7, deliveryTime: '30-40 min', open: false },
    ];

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Osogbo Food Map</h1>
                        <p className="text-gray-600">Discover restaurants near you in Osogbo</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Map Container */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="relative h-[600px] bg-gradient-to-br from-green-50 to-blue-50">
                            {/* Simplified Map Representation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Navigation className="h-10 w-10 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Map</h3>
                                    <p className="text-gray-600 max-w-md">
                                        This is where an interactive map would display restaurant locations in Osogbo.
                                        Integration with Google Maps or Mapbox would go here.
                                    </p>
                                </div>

                                {/* Restaurant Markers */}
                                {restaurants.map((restaurant) => (
                                    <button
                                        key={restaurant.id}
                                        onClick={() => setSelectedRestaurant(restaurant.id)}
                                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${selectedRestaurant === restaurant.id ? 'z-10' : ''
                                            }`}
                                        style={{
                                            left: `${30 + restaurant.id * 20}%`,
                                            top: `${40 + restaurant.id * 10}%`,
                                        }}
                                    >
                                        <div className="relative">
                                            <div className={`w-8 h-8 rounded-full ${selectedRestaurant === restaurant.id
                                                    ? 'bg-green-600 border-4 border-white shadow-lg'
                                                    : 'bg-white border-2 border-green-500 shadow-md'
                                                } flex items-center justify-center`}>
                                                <MapPin className={`w-4 h-4 ${selectedRestaurant === restaurant.id ? 'text-white' : 'text-green-600'
                                                    }`} />
                                            </div>
                                            {selectedRestaurant === restaurant.id && (
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl p-4">
                                                    <h4 className="font-bold text-gray-900">{restaurant.name}</h4>
                                                    <div className="flex items-center mt-2">
                                                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                        <span className="text-sm font-medium">{restaurant.rating}</span>
                                                        <span className="mx-2">•</span>
                                                        <Clock className="w-4 h-4 text-gray-500 mr-1" />
                                                        <span className="text-sm text-gray-600">{restaurant.deliveryTime}</span>
                                                    </div>
                                                    <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                                                        View Menu
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Restaurant List */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Restaurants in Osogbo</h2>
                            <button className="flex items-center text-green-600 hover:text-green-700 font-medium">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {restaurants.map((restaurant) => (
                                <div key={restaurant.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
                                            <div className="flex items-center mt-2">
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                    <span className="font-medium">{restaurant.rating}</span>
                                                </div>
                                                <span className="mx-2 text-gray-400">•</span>
                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {restaurant.deliveryTime}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${restaurant.open
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {restaurant.open ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                    <div className="h-40 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg mb-4"></div>
                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition">
                                        View Menu & Order
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}