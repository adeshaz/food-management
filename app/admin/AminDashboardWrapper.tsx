// app/admin/AdminDashboardWrapper.tsx - Client Component Wrapper
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [clientSide, setClientSide] = useState(false);

    useEffect(() => {
        setClientSide(true);
    }, []);

    useEffect(() => {
        if (!isLoading && clientSide) {
            if (!user) {
                router.push('/signin?redirect=/admin');
                return;
            }

            if (user.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
        }
    }, [user, isLoading, clientSide, router]);

    if (isLoading || !clientSide) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}