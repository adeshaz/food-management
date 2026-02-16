// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || '6146937497c36167f97af35418818d7a';

// Helper to verify JWT token
function verifyToken(token: string): any {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

// Helper to get user from token
async function getAuthenticatedUser(request: NextRequest): Promise<any> {
    try {
        // Try to get token from cookies
        const token = request.cookies.get('token')?.value;

        if (!token) {
            // Try Authorization header
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const tokenFromHeader = authHeader.substring(7);
                return verifyToken(tokenFromHeader);
            }
            return null;
        }

        return verifyToken(token);
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔐 Admin Users API called');

        // Check authentication
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            console.log('❌ No authenticated user');
            return NextResponse.json(
                {
                    success: false,
                    message: 'Authentication required',
                    error: 'UNAUTHORIZED'
                },
                { status: 401 }
            );
        }

        console.log('✅ Authenticated user:', authUser.email);

        // Check if user is admin
        if (authUser.role !== 'admin') {
            console.log('❌ User is not admin:', authUser.role);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Admin access required',
                    error: 'FORBIDDEN'
                },
                { status: 403 }
            );
        }

        console.log('✅ Admin user verified');

        // Get query parameters
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const role = url.searchParams.get('role');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        console.log('📊 Query params:', { search, role, page, limit });

        // Connect to database
        await connectToDatabase();
        console.log('✅ Database connected');

        // Build query
        const query: any = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Role filter
        if (role && role !== 'all') {
            query.role = role;
        }

        // Get users from database
        const users = await User.find(query)
            .select('-password') // Exclude password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count
        const total = await User.countDocuments(query);

        console.log(`✅ Found ${users.length} users, total: ${total}`);

        // Format response
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            status: 'active', // You can add status field to your User model
            profileImage: user.profileImage || '',
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
            ordersCount: 0 // You can calculate this from orders collection
        }));

        return NextResponse.json({
            success: true,
            users: formattedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            message: 'Users fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error in admin/users API:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch users',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}