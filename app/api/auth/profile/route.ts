
// // app/api/auth/profile/route.ts - CORRECTED (no next-auth)
// import { NextRequest, NextResponse } from 'next/server';
// import connectToDatabase from '@/lib/db';
// import User from '@/models/User';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// export async function GET(request: NextRequest) {
//     try {
//         // Get token from cookies
//         const token = request.cookies.get('token')?.value;

//         if (!token) {
//             return NextResponse.json(
//                 { success: false, message: 'Unauthorized' },
//                 { status: 401 }
//             );
//         }

//         // Verify token
//         let decoded;
//         try {
//             decoded = jwt.verify(token, JWT_SECRET) as any;
//         } catch (jwtError) {
//             return NextResponse.json(
//                 { success: false, message: 'Invalid token' },
//                 { status: 401 }
//             );
//         }

//         // Connect to database
//         await connectToDatabase();

//         // Find user by ID from token
//         const user = await User.findById(decoded.userId).select('-password');

//         if (!user) {
//             return NextResponse.json(
//                 { success: false, message: 'User not found' },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json({
//             success: true,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone || '',
//                 address: user.address || '',
//                 role: user.role || 'customer',
//                 createdAt: user.createdAt
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching profile:', error);
//         return NextResponse.json(
//             { success: false, message: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }


// app/api/auth/profile/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET user profile
export async function GET(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
        } catch (jwtError) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Connect to database
        await connectToDatabase();

        // Find user by ID from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Convert to plain object and handle missing fields
        const userObj = user.toObject();

        // Check if fields exist, otherwise use defaults
        const profileImage = userObj.profileImage || '';
        const notifications = userObj.hasOwnProperty('notifications') ? userObj.notifications : true;
        const marketingEmails = userObj.hasOwnProperty('marketingEmails') ? userObj.marketingEmails : true;

        return NextResponse.json({
            success: true,
            user: {
                _id: userObj._id.toString(),
                id: userObj._id.toString(),
                name: userObj.name || '',
                email: userObj.email || '',
                phone: userObj.phone || '',
                address: userObj.address || '',
                role: userObj.role || 'customer',
                profileImage: profileImage,
                notifications: notifications,
                marketingEmails: marketingEmails,
                createdAt: userObj.createdAt || new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
        } catch (jwtError) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, phone, address, notifications, marketingEmails } = body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return NextResponse.json(
                { success: false, message: 'Name is required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectToDatabase();

        // Update user - only include fields that exist
        const updateData: any = {
            name: name.trim(),
            phone: phone || '',
            address: address || '',
            updatedAt: new Date()
        };

        // Only add optional fields if provided
        if (notifications !== undefined) updateData.notifications = notifications;
        if (marketingEmails !== undefined) updateData.marketingEmails = marketingEmails;

        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const updatedUserObj = updatedUser.toObject();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: updatedUserObj._id.toString(),
                id: updatedUserObj._id.toString(),
                name: updatedUserObj.name || '',
                email: updatedUserObj.email || '',
                phone: updatedUserObj.phone || '',
                address: updatedUserObj.address || '',
                role: updatedUserObj.role || 'customer',
                profileImage: updatedUserObj.profileImage || '',
                notifications: updatedUserObj.hasOwnProperty('notifications') ? updatedUserObj.notifications : true,
                marketingEmails: updatedUserObj.hasOwnProperty('marketingEmails') ? updatedUserObj.marketingEmails : true,
                createdAt: updatedUserObj.createdAt
            }
        });

    } catch (error: any) {
        console.error('Error updating profile:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}