// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import User from '@/models/User';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function POST(request: NextRequest) {
//     try {
//         await connectDB();

//         const body = await request.json();
//         const { name, email, password, phone, address, role = 'customer' } = body;

//         if (!name || !email || !password) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Name, email, and password are required'
//                 },
//                 { status: 400 }
//             );
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'User with this email already exists'
//                 },
//                 { status: 400 }
//             );
//         }

//         const user = await User.create({
//             name,
//             email,
//             password,
//             phone,
//             address,
//             role,
//         });

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
//             message: 'User created successfully',
//             user: userResponse,
//         }, { status: 201 });

//         response.cookies.set('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 60 * 60 * 24 * 7,
//             path: '/',
//         });

//         return response;

//     } catch (error: any) {
//         console.error('Register error:', error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: 'Internal server error'
//             },
//             { status: 500 }
//         );
//     }
// }


// app/api/auth/signup/route.ts - UPDATED WITH CORRECT ENV VARS
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User'; // Use the User model
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        console.log('🟢 SIGNUP API CALLED');
        const body = await request.json();

        console.log('📦 Request body:', {
            name: body.name,
            email: body.email,
            phone: body.phone,
            password: '***',
            address: body.address
        });

        const { name, email, phone, password, address } = body;

        // Validation
        if (!name || !email || !phone || !password || !address) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectToDatabase();
        console.log('✅ Database connected');

        // Check if user already exists using User model
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user using User model
        const newUser = new User({
            name,
            email: email.toLowerCase().trim(),
            phone,
            password: hashedPassword,
            address,
            role: 'customer',
            verified: false
        });

        await newUser.save();
        console.log('✅ User created:', newUser.email);

        // Send welcome email
        await sendWelcomeEmail(email, name);

        // Create JWT token for immediate signin
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            {
                userId: newUser._id.toString(),
                email: newUser.email,
                role: newUser.role,
                name: newUser.name
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Create response with cookie
        const response = NextResponse.json(
            {
                success: true,
                message: 'Account created successfully!',
                userId: newUser._id,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role
                }
            },
            { status: 201 }
        );

        // Set auth cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('❌ Signup error:', error);
        
        // More specific error messages
        let errorMessage = 'Internal server error';
        if (error.code === 11000) {
            errorMessage = 'Email already exists';
        } else if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map((err: any) => err.message).join(', ');
        }

        return NextResponse.json(
            { 
                success: false, 
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            },
            { status: 500 }
        );
    }
}

// Email sending function - UPDATED with correct env vars
async function sendWelcomeEmail(email: string, name: string) {
    try {
        console.log('📧 Attempting to send welcome email to:', email);

        // Log environment variables (masked)
        console.log('📧 Email config:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER?.substring(0, 3) + '...',
            from: process.env.SMTP_FROM
        });

        // Check if email config exists
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.warn('⚠️ Email configuration missing. Skipping email send.');
            return;
        }

        // Create transporter with your SMTP settings
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ Email server connection verified');

        // Send email
        const info = await transporter.sendMail({
            from: `"Osogbo Food Management" <${process.env.SMTP_FROM || 'noreply@osogbocanteen.com'}>`,
            to: email,
            subject: '🎉 Welcome to Osogbo Food Management!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Osogbo Food Management</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
                        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">Welcome to Osogbo Food Management, ${name}!</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Comprehensive Food Management System</p>
                    </div>
                    
                    <div class="content">
                        <p>Dear ${name},</p>
                        
                        <p>Thank you for joining <strong>Osogbo Food Management</strong>! We're excited to have you as part of our food community.</p>
                        
                        <p>With your account, you can:</p>
                        <ul>
                            <li>Order food from local restaurants</li>
                            <li>Track your orders in real-time</li>
                            <li>Manage your delivery addresses</li>
                            <li>View order history and receipts</li>
                            <li>Receive special offers and discounts</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/dashboard" 
                               class="button">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <p>If you have any questions or need assistance, feel free to reply to this email.</p>
                        
                        <p>Best regards,<br>
                        <strong>The Osogbo Food Management Team</strong></p>
                        
                        <div class="footer">
                            <p>This email was sent to ${email}. If you didn't create an account, please ignore this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Osogbo Food Management. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log('✅ Welcome email sent successfully! Message ID:', info.messageId);

    } catch (error: any) {
        console.error('❌ Failed to send welcome email:', error.message);
        // Don't throw - email failure shouldn't break signup
    }
}

// import { NextRequest, NextResponse } from 'next/server';
// import mongoose from 'mongoose';

// export async function POST(request: NextRequest) {
//     try {
//         console.log('=== SIGNUP START ===');

//         // Get MongoDB URI from env
//         const MONGODB_URI = process.env.MONGODB_URI;
//         if (!MONGODB_URI) {
//             console.error('MONGODB_URI not set');
//             return NextResponse.json(
//                 { success: false, error: 'Server configuration error' },
//                 { status: 500 }
//             );
//         }

//         // Connect to MongoDB directly (no caching)
//         await mongoose.connect(MONGODB_URI);
//         console.log('✅ MongoDB connected');

//         // Parse request
//         const body = await request.json();
//         const { name, email, password } = body;

//         if (!name || !email || !password) {
//             return NextResponse.json(
//                 { success: false, error: 'All fields required' },
//                 { status: 400 }
//             );
//         }

//         // Check if User model exists, create if not
//         const userSchema = new mongoose.Schema({
//             name: String,
//             email: { type: String, unique: true },
//             password: String,
//             role: { type: String, default: 'customer' }
//         }, { timestamps: true });

//         const User = mongoose.models.User || mongoose.model('User', userSchema);

//         // Check if user exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return NextResponse.json(
//                 { success: false, error: 'Email already exists' },
//                 { status: 400 }
//             );
//         }

//         // Create user (store plain password for now)
//         const user = await User.create({
//             name,
//             email,
//             password, // No hashing for testing
//             role: 'customer'
//         });

//         console.log('✅ User created:', user._id);

//         // Create simple token (not JWT for now)
//         const token = `user-token-${user._id}-${Date.now()}`;

//         // Create response
//         const response = NextResponse.json({
//             success: true,
//             message: 'User created successfully',
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         }, { status: 201 });

//         // Set cookie
//         response.cookies.set({
//             name: 'token',
//             value: token,
//             httpOnly: true,
//             secure: false, // false for localhost
//             sameSite: 'lax',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//             path: '/',
//         });

//         console.log('✅ Cookie set, signup complete');
//         return response;

//     } catch (error: any) {
//         console.error('❌ SIGNUP ERROR:', error.message);
//         return NextResponse.json(
//             { success: false, error: error.message },
//             { status: 500 }
//         );
//     }
// }