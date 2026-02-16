// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import User from '@/models/User';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function POST(request: NextRequest) {
//     try {
//         await connectDB();

//         const { email, password } = await request.json();

//         if (!email || !password) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Email and password are required'
//                 },
//                 { status: 400 }
//             );
//         }

//         const user = await User.findOne({ email }).select('+password');
//         if (!user) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Invalid email or password'
//                 },
//                 { status: 401 }
//             );
//         }

//         const isPasswordValid = await user.comparePassword(password);
//         if (!isPasswordValid) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Invalid email or password'
//                 },
//                 { status: 401 }
//             );
//         }

//         const token = jwt.sign(
//             {
//                 userId: user._id.toString(),
//                 email: user.email,
//                 role: user.role
//             },
//             JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         const userResponse = {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             phone: user.phone,
//             address: user.address,
//             createdAt: user.createdAt
//         };

//         const response = NextResponse.json({
//             success: true,
//             message: 'Login successful',
//             user: userResponse,
//         });

//         response.cookies.set('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 60 * 60 * 24 * 7,
//             path: '/',
//         });

//         return response;

//     } catch (error: any) {
//         console.error('Login error:', error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: 'Internal server error'
//             },
//             { status: 500 }
//         );
//     }
// }

// app/api/auth/signin/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    console.log('🟢 SIGNIN API CALLED');

    try {
        const body = await request.json();
        console.log('📦 Signin attempt for:', body.email);

        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: 'Email and password are required'
            }, { status: 400 });
        }

        // Connect to DB using mongoose
        await connectToDatabase();
        console.log('✅ Database connected');

        // Find user using User model
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        console.log('✅ Password valid for user:', user.email);

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Signin successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        }, { status: 200 });

        // Set cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        console.log('✅ Signin completed successfully');
        return response;

    } catch (error: any) {
        console.error('🔴 SIGNIN ERROR:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Server error: ' + error.message
        }, { status: 500 });
    }
}