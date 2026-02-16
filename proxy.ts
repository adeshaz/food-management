// proxy.ts - UPDATED VERSION
import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/debug",
    "/api/auth",
    "/_next",
    "/static",
    "/favicon.ico",
    "/restaurants",
    "/foods",
    "/map",
    "/menu",
    "/cart",  // Add cart as public since it redirects
    "/api/auth/me",  // This must be public for auth checks
    "/api/health",
    "/api/test"
];

// Routes that require admin access
const adminRoutes = [
    "/admin",
    "/admin/orders",
    "/admin/users",
    "/admin/restaurants",
    "/admin/foods",
    "/admin/categories",
    "/admin/analytics",
    "/admin/settings",
    // "/admin/dashboard"
];

// Routes that require authentication (user dashboard)
const protectedRoutes = [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/settings",  // REMOVED /dashboard/profile from here
    "/dashboard/wallet",
    "/dashboard/cart",
    "/dashboard/checkout",
    "/dashboard/favorites",
    "/checkout",
    "/payment",
    "/account",
    "/profile"  // ADD /profile here instead
];

// Check if user is authenticated and has admin role
async function checkAdminAccess(token: string, origin: string): Promise<boolean> {
    try {
        const response = await fetch(`${origin}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            return data.user?.role === 'admin';
        }
    } catch (error) {
        console.error('Admin check error:', error);
    }
    return false;
}

// Check if user is authenticated (any role)
async function checkUserAccess(token: string, origin: string): Promise<{ isAuthenticated: boolean; user?: any }> {
    try {
        const response = await fetch(`${origin}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            return { isAuthenticated: true, user: data.user };
        }
    } catch (error) {
        console.error('User check error:', error);
    }
    return { isAuthenticated: false };
}

// Helper to extract token from request
function getTokenFromRequest(req: NextRequest): string | null {
    // Try cookies first
    const cookieToken = req.cookies.get('token')?.value;
    if (cookieToken) return cookieToken;

    // Try Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

// The proxy function - exported with this exact name
export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const origin = req.nextUrl.origin;

    console.log('🔍 Proxy checking:', path, 'Method:', req.method);

    // ✅ Handle static files and Next.js internal routes
    if (
        path.startsWith('/_next/') ||
        path.startsWith('/static/') ||
        path.includes('.ico') ||
        path.includes('.png') ||
        path.includes('.jpg') ||
        path.includes('.jpeg') ||
        path.includes('.gif') ||
        path.includes('.svg') ||
        path.includes('.css') ||
        path.includes('.js') ||
        path.includes('.woff') ||
        path.includes('.woff2') ||
        path.includes('.ttf')
    ) {
        return NextResponse.next();
    }

    if (path === '/admin') {
        console.log('✅ Allowing /admin route');
        return NextResponse.next(); // Don't redirect, just allow it
    }

    // ✅ Handle redirects
    // if (path === '/admin') {
    //     console.log('🔀 Redirecting /admin to /admin/dashboard');
    //     return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    // }

    if (path === '/settings') {
        console.log('🔀 Redirecting /settings to /dashboard/settings');
        return NextResponse.redirect(new URL('/dashboard/settings', req.url));
    }

    if (path === '/orders') {
        console.log('🔀 Redirecting /orders to /dashboard/orders');
        return NextResponse.redirect(new URL('/dashboard/orders', req.url));
    }

    if (path === '/dashboard') {
        console.log('🔀 Redirecting /dashboard to /dashboard/orders');
        return NextResponse.redirect(new URL('/dashboard/orders', req.url));
    }

    // ✅ Always allow API/auth routes
    if (path.startsWith('/api/auth/')) {
        console.log('✅ Allowing API/auth route:', path);
        return NextResponse.next();
    }

    // ✅ Check if it's a public route
    const isPublicRoute = publicRoutes.some(route =>
        path === route ||
        (route !== '/' && path.startsWith(route + '/'))
    );

    if (isPublicRoute) {
        console.log('✅ Allowing public route:', path);
        return NextResponse.next();
    }

    // ✅ For development, you can temporarily allow admin routes
    // Remove this in production!
    if (process.env.NODE_ENV === 'development') {
        const isAdminRoute = adminRoutes.some(route =>
            path === route || path.startsWith(route + '/')
        );

        if (isAdminRoute) {
            console.log('🎯 DEV MODE: Allowing admin route without check:', path);
            return NextResponse.next();
        }
    }

    // ✅ Check if it's an admin route (for production)
    if (process.env.NODE_ENV !== 'development') {
        const isAdminRoute = adminRoutes.some(route =>
            path === route || path.startsWith(route + '/')
        );

        if (isAdminRoute) {
            console.log('🔐 Checking admin access for:', path);

            const token = getTokenFromRequest(req);

            if (!token) {
                console.log('❌ No token for admin route, redirecting to signin');
                const redirectUrl = new URL('/signin', req.url);
                redirectUrl.searchParams.set('redirect', path);
                return NextResponse.redirect(redirectUrl);
            }

            const isAdmin = await checkAdminAccess(token, origin);

            if (!isAdmin) {
                console.log('❌ User is not admin, redirecting to dashboard');
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }

            console.log('✅ Admin access granted for:', path);
            return NextResponse.next();
        }
    }

    // ✅ Check if it's a protected route (user dashboard)
    const isProtectedRoute = protectedRoutes.some(route =>
        path === route || path.startsWith(route + '/')
    );

    if (isProtectedRoute) {
        console.log('🔐 Checking user access for protected route:', path);

        const token = getTokenFromRequest(req);

        if (!token) {
            console.log('❌ No token for protected route, redirecting to signin');
            const redirectUrl = new URL('/signin', req.url);
            redirectUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(redirectUrl);
        }

        const { isAuthenticated } = await checkUserAccess(token, origin);

        if (!isAuthenticated) {
            console.log('❌ Invalid token, redirecting to signin');
            const redirectUrl = new URL('/signin', req.url);
            redirectUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(redirectUrl);
        }

        console.log('✅ Authenticated access granted for:', path);
        return NextResponse.next();
    }

    // ✅ For other API routes, allow them (they handle their own auth)
    if (path.startsWith('/api/')) {
        console.log('✅ Allowing API route:', path);
        return NextResponse.next();
    }

    // ✅ If we reach here and the route is not public, check authentication
    console.log('🔐 Route not explicitly handled, checking authentication:', path);

    const token = getTokenFromRequest(req);

    if (!token) {
        console.log('❌ No token for unknown route, redirecting to signin');
        const redirectUrl = new URL('/signin', req.url);
        redirectUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(redirectUrl);
    }

    const { isAuthenticated } = await checkUserAccess(token, origin);

    if (!isAuthenticated) {
        console.log('❌ Invalid token for unknown route, redirecting to signin');
        const redirectUrl = new URL('/signin', req.url);
        return NextResponse.redirect(redirectUrl);
    }

    console.log('✅ Allowing authenticated route:', path);
    return NextResponse.next();
}

// Required config for proxy
export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico, sitemap.xml, robots.txt (metadata files)
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};