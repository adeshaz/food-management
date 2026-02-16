// app/api/restaurants/[id]/route.ts - WITH AWAIT
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Restaurant from '@/models/Restaurant';

// Add debug logging at the beginning
interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Context) {
    try {
        // ⬇️ AWAIT params here too
        const { id } = await context.params;

        console.log('🔍 API Params received:', { id });
        console.log('🔍 Full URL:', request.url);

        if (!id || id === 'undefined') {
            return NextResponse.json({
                success: false,
                error: 'Invalid restaurant ID'
            }, { status: 400 });
        }

        await connectToDatabase();

        // Find the restaurant
        const restaurant = await Restaurant.findById(id).lean();

        if (!restaurant) {
            console.log(`❌ Restaurant ${id} not found in database`);
            return NextResponse.json({
                success: false,
                error: `Restaurant ${id} not found`
            }, { status: 404 });
        }

        console.log(`✅ Found restaurant: ${restaurant.name}`);

        // Return formatted data
        return NextResponse.json({
            success: true,
            data: {
                _id: restaurant._id.toString(),
                id: restaurant._id.toString(),
                name: restaurant.name,
                description: restaurant.description,
                cuisineType: restaurant.cuisineType,
                address: restaurant.address || {
                    street: '123 Main Street',
                    city: 'Osogbo',
                    state: 'Osun State'
                },
                contact: restaurant.contact || {
                    phone: '+234 801 234 5678',
                    email: 'info@restaurant.com'
                },
                openingHours: restaurant.openingHours || {
                    general: '8:00 AM - 10:00 PM'
                },
                images: restaurant.images || ['/api/placeholder/400/300'],
                rating: restaurant.rating || 4.0,
                deliveryTime: restaurant.deliveryTime || 30,
                minimumOrder: restaurant.minimumOrder || 1000,
                featured: restaurant.featured || false
            }
        });

    } catch (error: any) {
        console.error('🔴 GET RESTAURANT ERROR:', error.message);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch restaurant'
        }, { status: 500 });
    }
}