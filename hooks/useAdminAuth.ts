// hooks/useAdminAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UseAdminAuthReturn {
    user: AdminUser | null;
    isLoading: boolean;
    isAdmin: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
    const router = useRouter();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/auth-check');
            const data = await response.json();

            if (data.success && data.isAdmin) {
                setUser(data.user);
                setIsAdmin(true);
            } else {
                setUser(null);
                setIsAdmin(false);
                // Redirect if not admin
                if (!data.authenticated) {
                    router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname));
                } else if (!data.isAdmin) {
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAdmin(false);
            router.push('/signin');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            setIsAdmin(false);
            router.push('/signin');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return { user, isLoading, isAdmin, checkAuth, logout };
}