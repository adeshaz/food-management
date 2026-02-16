import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Restaurant from '@/models/Restaurant';

export async function GET() {
    try {
        await connectToDatabase();

        const restaurants = await Restaurant.find({}, 'name _id cuisineType featured').lean();

        return NextResponse.json({
            success: true,
            count: restaurants.length,
            restaurants: restaurants.map(r => ({
                id: r._id.toString(),
                name: r.name,
                cuisineType: r.cuisineType,
                featured: r.featured
            }))
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}