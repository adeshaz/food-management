// lib/auth.ts - UPDATED AND CORRECTED
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
    _id: string;
    id: string;
    email: string;
    role: string;
    name: string;
}

// Get current user from cookies (for server components)
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        await connectToDatabase();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) return null;

        return {
            _id: user._id.toString(),
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'user',
            name: user.name
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Get current user from request (for API routes)
export async function getCurrentUserFromRequest(request: Request): Promise<any> {
    try {
        // Get token from cookies or Authorization header
        const cookieHeader = request.headers.get('cookie');
        const token = cookieHeader?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1] ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        await connectToDatabase();
        const user = await User.findById(decoded.userId).select('-password');

        return user;
    } catch (error) {
        console.error('Error getting user from request:', error);
        return null;
    }
}

// Helper functions for authentication checks
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return !!user;
}

export async function requireAuth(): Promise<AuthUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}

export async function requireAdmin(): Promise<AuthUser> {
    const user = await requireAuth();

    if (user.role !== 'admin') {
        throw new Error('Admin access required');
    }

    return user;
}