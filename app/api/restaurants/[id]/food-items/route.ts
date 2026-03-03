import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FoodItem from '@/models/FoodItem';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id: restaurantId } = await params; // ✅ await the promise to get the ID

        const foodItems = await FoodItem.find({
            restaurants: restaurantId,
            available: true
        }).select('name description price images category')
            .sort({ category: 1, name: 1 });

        return NextResponse.json({
            success: true,
            data: foodItems
        });

    } catch (error: any) {
        console.error('Error fetching food items:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}