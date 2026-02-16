// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import connectDB from '@/lib/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email required' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne(
            { email },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Create JWT token
        const token = await new SignJWT({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        // Set cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Session creation error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}