// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const { email, newPassword = 'password123' } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email is required'
            }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password reset',
            user: {
                email: user.email,
                name: user.name,
            },
            newPassword,
            note: 'Use this password to login'
        });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}