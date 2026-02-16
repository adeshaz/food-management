// // app/components/restaurant/RestaurantCard.tsx - QUICK FIX
// 'use client';
// import React, { useState } from 'react';
// import Link from 'next/link';
// import { Restaurant } from '@/types/restaurant'; // This is OLD type
// import { FaStar, FaMapMarkerAlt, FaClock, FaMotorcycle } from 'react-icons/fa';
// import Loading from '../ui/Loading';

// // Create a NEW interface that matches what your API actually returns
// interface ApiRestaurant {
//     _id: string;
//     name: string;
//     description: string;
//     cuisineType: string;
//     address: {
//         street: string;
//         city: string;
//         state: string;
//     };
//     contact: {
//         phone: string;
//         email?: string;
//     };
//     openingHours: any; // Flexible type
//     images: string[];
//     rating: number;
//     deliveryTime: number;
//     minimumOrder: number;
//     featured: boolean;
// }

// interface RestaurantCardProps {
//     restaurant: ApiRestaurant; // ⬅️ CHANGE TO ApiRestaurant
// }

// const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
//     const [imageLoaded, setImageLoaded] = useState(false);
//     const [imageError, setImageError] = useState(false);

//     // Use images[0] instead of image
//     // const imageUrl = restaurant.images?.[0] || restaurant.image || '/api/placeholder/400/300';
//     const imageUrl =
//         restaurant.images?.[0] || '/images/restaurants/default.jpg';

//     return (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
//             <div className="relative h-48">
//                 {!imageLoaded && !imageError && (
//                     <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
//                         <Loading size="sm" text="" />
//                     </div>
//                 )}
//                 <img
//                     src={imageUrl}
//                     alt={restaurant.name}
//                     className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
//                     onLoad={() => setImageLoaded(true)}
//                     onError={() => setImageError(true)}
//                 />
//                 {imageError && (
//                     <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
//                         <span className="text-gray-500 text-sm">Image not available</span>
//                     </div>
//                 )}
//                 <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded-full text-sm font-semibold">
//                     {restaurant.rating} ⭐
//                 </div>
//             </div>

//             <div className="p-4">
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
//                 <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>

//                 <div className="space-y-2 mb-4">
//                     <div className="flex items-center text-gray-600 text-sm">
//                         <FaMapMarkerAlt className="text-primary mr-2 flex-shrink-0" />
//                         <span className="line-clamp-1">
//                             {/* Use address.street instead of location.address */}
//                             {restaurant.address?.street || 'Address not available'}
//                         </span>
//                     </div>

//                     <div className="flex items-center text-gray-600 text-sm">
//                         <FaClock className="text-primary mr-2 flex-shrink-0" />
//                         <span>
//                             {/* Use openingHours.general or default */}
//                             {restaurant.openingHours?.general || '8:00 AM - 10:00 PM'}
//                         </span>
//                     </div>

//                     {/* Always show delivery time */}
//                     <div className="flex items-center text-green-600 text-sm">
//                         <FaMotorcycle className="mr-2 flex-shrink-0" />
//                         <span>Delivery: {restaurant.deliveryTime || 30} mins</span>
//                     </div>
//                 </div>

//                 <div className="flex justify-between items-center">
//                     <div>
//                         <span className="text-gray-700 font-semibold text-sm block">
//                             {/* Show cuisine type */}
//                             {restaurant.cuisineType || 'Cuisine'}
//                         </span>
//                         <span className="text-primary font-bold text-sm">
//                             {/* Show minimum order */}
//                             {/* Min: ₦{(restaurant.minimumOrder || 0).toLocaleString()} */}
//                             Min: ₦{(restaurant.minimumOrder ?? 1000).toLocaleString()}

//                         </span>
//                     </div>
//                     <Link
//                         href={`/restaurants/${restaurant._id}`}
//                         className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
//                     >
//                         View Menu
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RestaurantCard;




// app/components/restaurant/RestaurantCard.tsx - UPDATED
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar, FaMapMarkerAlt, FaClock, FaMotorcycle } from 'react-icons/fa';
import Loading from '../ui/Loading';

interface ApiRestaurant {
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
        email?: string;
    };
    openingHours: any;
    images: string[];
    rating: number;
    deliveryTime: number;
    minimumOrder: number;
    featured: boolean;
}

interface RestaurantCardProps {
    restaurant: ApiRestaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    // Debug: Log restaurant data
    useEffect(() => {
        console.log('🔄 RestaurantCard mounted:', {
            name: restaurant.name,
            images: restaurant.images,
            firstImage: restaurant.images?.[0]
        });
    }, [restaurant]);

    // Set image URL with proper fallback
    useEffect(() => {
        if (!restaurant.images || !Array.isArray(restaurant.images) || restaurant.images.length === 0) {
            console.log('❌ No images array for:', restaurant.name);
            setImageUrl('/images/restaurants/default.jpg');
            return;
        }

        const firstImage = restaurant.images[0];

        // Handle different URL formats
        if (!firstImage || firstImage.trim() === '') {
            console.log('❌ Empty image URL for:', restaurant.name);
            setImageUrl('/images/restaurants/default.jpg');
            return;
        }

        // If it's already a full URL, use it
        if (firstImage.startsWith('http')) {
            console.log('✅ Using external URL for', restaurant.name, ':', firstImage);
            setImageUrl(firstImage);
            return;
        }

        // If it's a relative path without leading slash
        if (firstImage.startsWith('images/')) {
            const fixedUrl = `/${firstImage}`;
            console.log('🔄 Fixed relative path:', firstImage, '→', fixedUrl);
            setImageUrl(fixedUrl);
            return;
        }

        // If it's a relative path with leading slash
        if (firstImage.startsWith('/')) {
            console.log('✅ Using local path:', firstImage);
            setImageUrl(firstImage);
            return;
        }

        // Fallback
        console.log('⚠️ Unknown image format, using default');
        setImageUrl('/images/restaurants/default.jpg');
    }, [restaurant]);

    const handleImageError = () => {
        console.error('🔥 Image failed to load:', {
            restaurant: restaurant.name,
            attemptedUrl: imageUrl,
            allImages: restaurant.images
        });
        setImageError(true);
        setImageUrl('/images/restaurants/default.jpg');
    };

    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully:', {
            restaurant: restaurant.name,
            url: imageUrl
        });
        setImageLoaded(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48">
                {/* Loading state */}
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <div className="text-center">
                            <Loading size="sm" text="" />
                            <p className="text-green-600 text-sm mt-2">Loading image...</p>
                        </div>
                    </div>
                )}

                {/* Image */}
                <img
                    src={imageUrl}
                    alt={`${restaurant.name} restaurant`}
                    className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    crossOrigin="anonymous" // Important for external images
                />

                {/* Error state */}
                {imageError && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <div className="text-center p-4">
                            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🏪</span>
                            </div>
                            <p className="text-green-600 font-semibold">{restaurant.name}</p>
                            <p className="text-green-400 text-sm mt-1">Restaurant</p>
                        </div>
                    </div>
                )}

                {/* Rating badge */}
                <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded-full text-sm font-semibold">
                    {restaurant.rating} ⭐
                </div>
            </div>

            {/* Card content (same as before) */}
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                        <FaMapMarkerAlt className="text-primary mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">
                            {restaurant.address?.street || 'Address not available'}
                        </span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm">
                        <FaClock className="text-primary mr-2 flex-shrink-0" />
                        <span>
                            {restaurant.openingHours?.general || '8:00 AM - 10:00 PM'}
                        </span>
                    </div>

                    <div className="flex items-center text-green-600 text-sm">
                        <FaMotorcycle className="mr-2 flex-shrink-0" />
                        <span>Delivery: {restaurant.deliveryTime || 30} mins</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-gray-700 font-semibold text-sm block">
                            {restaurant.cuisineType || 'Cuisine'}
                        </span>
                        <span className="text-primary font-bold text-sm">
                            Min: ₦{(restaurant.minimumOrder || 0).toLocaleString()}
                        </span>
                    </div>
                    <Link
                        href={`/restaurants/${restaurant._id}`}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                        View Menu
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;