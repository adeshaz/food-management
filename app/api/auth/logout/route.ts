// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('🟢 LOGOUT API CALLED');

    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        // Clear the token cookie
        response.cookies.set({
            name: 'token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expire immediately
            path: '/',
        });

        console.log('✅ Token cookie cleared');
        return response;

    } catch (error: any) {
        console.error('❌ Logout error:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Logout failed'
        }, { status: 500 });
    }
}