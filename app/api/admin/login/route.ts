// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { email, password } = body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Invalid credentials'
            }, { status: 401 });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }

        // In production, use proper password comparison:
        // const isValidPassword = await bcrypt.compare(password, user.password);
        // For now, using demo password check
        const isDemoUser = email === 'hafizadegbite@gmail.com' && password === 'admin123';
        const isValidPassword = isDemoUser || (user.password === password);

        if (!isValidPassword) {
            return NextResponse.json({
                success: false,
                message: 'Invalid credentials'
            }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Admin login successful',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        // Set token cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 24 hours
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Admin login error:', error);
        return NextResponse.json({
            success: false,
            message: 'Login failed: ' + error.message
        }, { status: 500 });
    }
}