// app/cart/page.tsx - NEW FILE (Simple Redirect)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CartRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/cart');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                <p>Redirecting to cart...</p>
            </div>
        </div>
    );
}