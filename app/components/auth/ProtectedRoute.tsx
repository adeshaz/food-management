'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check', {
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok || !data.authenticated) {
                    router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
                    return;
                }

                if (requireAdmin && data.user.role !== 'admin') {
                    router.push('/');
                    return;
                }
            } catch (error) {
                router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
            }
        };

        checkAuth();
    }, [router, requireAdmin]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
    );
}