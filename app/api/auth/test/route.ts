import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    console.log('🔍 Test auth endpoint');

    // Check token
    const token = request.cookies.get('token')?.value;
    console.log('Token exists:', !!token);

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            console.log('Decoded token:', decoded);

            await connectToDatabase();
            const user = await User.findById(decoded.userId);
            console.log('User found:', user?.email, 'Role:', user?.role);

            return NextResponse.json({
                success: true,
                tokenExists: true,
                user: {
                    id: user?._id,
                    email: user?.email,
                    role: user?.role
                }
            });
        } catch (error) {
            console.error('Token error:', error);
        }
    }

    return NextResponse.json({
        success: false,
        tokenExists: false,
        message: 'No valid token'
    });
}