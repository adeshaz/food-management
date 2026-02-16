'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ClientProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ClientProtectedRoute({ children, requireAdmin = false }: ClientProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push(`/signin?redirect=${encodeURIComponent(pathname || '/')}`);
            } else if (requireAdmin && user.role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, isLoading, router, pathname, requireAdmin]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user || (requireAdmin && user.role !== 'admin')) {
        return null;
    }

    return <>{children}</>;
}