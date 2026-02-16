// app/api/auth/me/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    console.log('👤 /api/auth/me called');

    try {
        // Get token from cookie OR Authorization header
        const token = request.cookies.get('token')?.value ||
            request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            console.log('❌ No token found');
            return NextResponse.json({
                success: false,
                message: 'Not authenticated'
            }, { status: 401 });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
            console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
        } catch (jwtError) {
            console.error('❌ JWT verification failed:', jwtError);
            return NextResponse.json({
                success: false,
                message: 'Invalid token'
            }, { status: 401 });
        }

        // Connect to database
        await connectToDatabase();

        // Find user
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log('❌ User not found in database');
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        console.log('✅ User found:', user.email);

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role || 'user' // Default to 'user' if not set
            }
        });

    } catch (error: any) {
        console.error('🔴 /api/auth/me error:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

