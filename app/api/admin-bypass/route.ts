// // app/api/admin-bypass/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//     console.log('🎯 ADMIN BYPASS API called');

//     // Create a redirect response to admin page
//     const redirectUrl = new URL('/admin/orders', request.url);

//     // Create response that redirects
//     const response = NextResponse.redirect(redirectUrl);

//     // Set cookies server-side (proxy will see these!)
//     response.cookies.set({
//         name: 'token',
//         value: 'admin_bypass_api_token_123',
//         path: '/',
//         maxAge: 86400,
//         httpOnly: true,
//         sameSite: 'lax'
//     });

//     response.cookies.set({
//         name: 'user_role',
//         value: 'admin',
//         path: '/',
//         maxAge: 86400,
//         httpOnly: true,
//         sameSite: 'lax'
//     });

//     response.cookies.set({
//         name: 'admin_token',
//         value: 'admin_bypass_api_token_123',
//         path: '/',
//         maxAge: 86400,
//         httpOnly: true,
//         sameSite: 'lax'
//     });

//     console.log('✅ Admin cookies set via API');

//     return response;
// }

// // Also handle POST for flexibility
// export async function POST(request: NextRequest) {
//     return GET(request);
// }