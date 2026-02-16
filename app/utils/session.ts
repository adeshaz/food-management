import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '6146937497c36167f97af35418818d7a';

interface User {
    id: string;
    email: string;
    role: string;
    name: string;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    message?: string;
}

/**
 * Check if user is authenticated
 */
export async function auth(): Promise<AuthResult> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as User;
            return {
                success: true,
                user: decoded,
            };
        } catch (jwtError) {
            return {
                success: false,
                message: 'Invalid or expired token'
            };
        }
    } catch (error) {
        console.error('Auth error:', error);
        return {
            success: false,
            message: 'Authentication check failed'
        };
    }
}

/**
 * Get current user (for server components)
 */
export async function getCurrentUser(): Promise<User | null> {
    const result = await auth();
    return result.success ? result.user! : null;
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
    const result = await auth();
    if (!result.success || !result.user) return false;
    return result.user.role === requiredRole;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole('admin');
}