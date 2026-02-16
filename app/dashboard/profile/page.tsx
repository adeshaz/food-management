// app/dashboard/profile/page.tsx - REDIRECT PAGE
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardProfileRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to /profile
        router.replace('/profile');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to profile page...</p>
            </div>
        </div>
    );
}