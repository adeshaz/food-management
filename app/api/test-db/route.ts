// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Restaurant from '@/models/Restaurant';

export async function GET() {
    try {
        console.log('🔍 Testing database connection...');

        await connectToDatabase();
        console.log('✅ Database connected');

        const count = await Restaurant.countDocuments();
        console.log(`✅ Restaurant count: ${count}`);

        const restaurants = await Restaurant.find({});
        console.log('✅ Restaurants found:', restaurants.length);

        return NextResponse.json({
            success: true,
            message: 'Database connected successfully',
            count,
            sample: restaurants.length > 0 ? restaurants[0] : 'No restaurants'
        });
    } catch (error: any) {
        console.error('🔴 Database connection error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}