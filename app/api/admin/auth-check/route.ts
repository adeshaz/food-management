// app/api/admin/auth-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Not authenticated',
                authenticated: false
            }, { status: 401 });
        }

        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required',
                authenticated: true,
                isAdmin: false,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin authenticated',
            authenticated: true,
            isAdmin: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error('Auth check error:', error);
        return NextResponse.json({
            success: false,
            message: 'Authentication error: ' + error.message,
            authenticated: false
        }, { status: 500 });
    }
}