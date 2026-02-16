// actions/auth.actions.ts - UPDATED VERSION
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface SignUpResult {
    success: boolean;
    error?: string;
    user?: any;
}

export async function signUp(
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string
): Promise<SignUpResult> {  
    try {
        console.log('Signup action called with:', { name, email, phone });

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                phone: phone || '',
                password,
                address: address || '',
            }),
        });

        const data = await response.json();
        console.log('Signup response:', data);

        if (response.ok && data.success) {
            if (data.token) {
                const cookieStore = await cookies();
                cookieStore.set('token', data.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7, 
                    path: '/',
                });
            }

            return {
                success: true,
                user: data.user,
            };
        }

        return {
            success: false,
            error: data.message || data.error || 'Signup failed',
        };
    } catch (error: any) {
        console.error('Signup action error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred during signup',
        };
    }
}

// Keep your existing functions
export async function signIn(email: string, password: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function signOut() {
    try {
        // Clear the token cookie
        (await cookies()).delete('token');
        redirect('/');
    } catch (error) {
        console.error('Sign out error:', error);
        redirect('/');
    }
}

export async function getCurrentUser() {
    try {
        const token = (await cookies()).get('token')?.value;

        if (!token) {
            return null;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            return data.user;
        }

        return null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}