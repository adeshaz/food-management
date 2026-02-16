import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FoodItem from '@/models/FoodItem';

export async function GET() {
    try {
        await connectToDatabase();

        // Get count of foods by category
        const categories = await FoodItem.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert to object format
        const categoryCounts: Record<string, number> = {};
        categories.forEach(item => {
            categoryCounts[item._id] = item.count;
        });

        return NextResponse.json(categoryCounts);
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}