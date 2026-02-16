// app/api/user/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
    try {
        const token = await getToken(request);
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();
        const body = await request.json();

        const updatedUser = await User.findByIdAndUpdate(
            token.userId,
            {
                name: body.name,
                phone: body.phone,
                address: body.address,
                preferences: {
                    notifications: body.notifications,
                    privacy: body.privacy
                }
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error: any) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}