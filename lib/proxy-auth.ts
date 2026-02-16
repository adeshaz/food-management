import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '6146937497c36167f97af35418818d7a';

export interface AuthUser {
    id: string;
    email: string;
    role: string;
    name: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            console.log('No token found in cookies');
            return null;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
            console.log('User authenticated:', decoded.email);
            return decoded;
        } catch (jwtError) {
            console.log('Invalid token:', jwtError);
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getAuthUser();
    return !!user;
}

export async function requireAuth(): Promise<AuthUser> {
    const user = await getAuthUser();

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

// Proxy headers helper
export function getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}