import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/proxy-auth';

// This acts as a proxy for checking auth on specific routes
export async function GET(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const user = await getAuthUser();

        // Public paths that don't require authentication
        const publicPaths = ['/api/auth', '/api/public', '/signin', '/signup', '/'];

        // Check if this is an API call to a protected route
        const isProtectedApi = pathname.startsWith('/api/') &&
            !pathname.startsWith('/api/auth') &&
            !pathname.startsWith('/api/public');

        // If it's a protected API route and user is not authenticated
        if (isProtectedApi && !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // For non-API routes, we just check auth and let Next.js handle routing
        return NextResponse.json({
            authenticated: !!user,
            user: user || null,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Proxy auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}