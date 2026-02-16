// app/api/restaurants/route.ts - UPDATED FOR YOUR SCHEMA
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Restaurant from '@/models/Restaurant';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 GET /api/restaurants called');

        await connectToDatabase();

        console.log('📊 Fetching restaurants...');
        const restaurants = await Restaurant.find({})
            .sort({ featured: -1, rating: -1 })
            .lean();

        console.log(`✅ Found ${restaurants.length} restaurants`);

        // Transform data for frontend - match YOUR schema
        const transformedRestaurants = restaurants.map(restaurant => {
            // Format opening hours for display
            const openingHours = restaurant.openingHours || {};
            const generalHours = openingHours.monday || { open: '08:00', close: '22:00' };

            return {
                _id: restaurant._id.toString(),
                id: restaurant._id.toString(),
                name: restaurant.name,
                description: restaurant.description,
                cuisineType: restaurant.cuisineType,
                deliveryTime: restaurant.deliveryTime || 30,
                minimumOrder: restaurant.minimumOrder || 1000,
                address: restaurant.address || {
                    street: 'Address not specified',
                    city: 'Osogbo',
                    state: 'Osun State'
                },
                contact: restaurant.contact || {
                    phone: 'Phone not available',
                    email: ''
                },
                openingHours: {
                    // Format for display
                    general: `${generalHours.open} - ${generalHours.close}`,
                    // Keep detailed hours
                    detailed: openingHours
                },
                images: restaurant.images || [],
                rating: restaurant.rating || 4.0,
                featured: restaurant.featured || false,
                isOpen: true // You can add logic to check if open based on current time
            };
        });

        return NextResponse.json({
            success: true,
            data: transformedRestaurants,
            count: transformedRestaurants.length
        });

    } catch (error: any) {
        console.error('🔴 GET RESTAURANTS ERROR:', error.message);

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch restaurants: ' + error.message
        }, { status: 500 });
    }
}