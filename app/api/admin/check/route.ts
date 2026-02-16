// app/api/admin/check/route.ts - TEST ENDPOINT
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);

        console.log('Admin check - User:', user);

        return NextResponse.json({
            success: true,
            isAdmin: user?.role === 'admin',
            user: user ? {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            } : null,
            message: user ? 'User found' : 'No user found'
        });
    } catch (error: any) {
        console.error('Admin check error:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        });
    }
}