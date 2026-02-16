// app/admin/dashboard/page.tsx - REDIRECT PAGE
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to admin dashboard...</p>
            </div>
        </div>
    );
}