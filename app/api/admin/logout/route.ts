// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Admin logged out successfully'
        });

        // Clear token cookie
        response.cookies.delete('token');

        return response;

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json({
            success: false,
            message: 'Logout failed: ' + error.message
        }, { status: 500 });
    }
}