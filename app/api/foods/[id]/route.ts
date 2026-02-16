import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FoodItem from '@/models/FoodItem';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const food = await FoodItem.findById(params.id).lean();

        if (!food) {
            return NextResponse.json({
                success: false,
                message: 'Food item not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: food._id.toString(),
                name: food.name,
                description: food.description,
                price: food.price,
                originalPrice: food.originalPrice,
                discount: food.discount,
                category: food.category,
                restaurantId: food.restaurant?.toString(),
                restaurantName: food.restaurantName,
                images: food.images,
                ingredients: food.ingredients,
                preparationTime: food.preparationTime,
                spicyLevel: food.spicyLevel,
                isVegetarian: food.isVegetarian,
                isPopular: food.isPopular,
                rating: food.rating,
                ratingCount: food.ratingCount,
                tags: food.tags,
                available: food.available
            }
        });

    } catch (error: any) {
        console.error('Error fetching food:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch food: ' + error.message
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const body = await request.json();

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid food ID'
            }, { status: 400 });
        }

        const updatedFood = await FoodItem.findByIdAndUpdate(
            params.id,
            {
                ...body,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedFood) {
            return NextResponse.json({
                success: false,
                message: 'Food item not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Food updated successfully',
            data: updatedFood
        });

    } catch (error: any) {
        console.error('Error updating food:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update food: ' + error.message
        }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const body = await request.json();

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid food ID'
            }, { status: 400 });
        }

        const updatedFood = await FoodItem.findByIdAndUpdate(
            params.id,
            {
                available: body.available !== undefined ? body.available : body.isAvailable,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedFood) {
            return NextResponse.json({
                success: false,
                message: 'Food item not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Food availability updated successfully',
            data: updatedFood
        });

    } catch (error: any) {
        console.error('Error updating food availability:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update food availability: ' + error.message
        }, { status: 500 });
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const deletedFood = await FoodItem.findByIdAndDelete(params.id);

        if (!deletedFood) {
            return NextResponse.json({
                success: false,
                message: 'Food item not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Food deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting food:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete food: ' + error.message
        }, { status: 500 });
    }
}