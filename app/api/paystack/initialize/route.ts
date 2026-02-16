// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializePayment } from '@/lib/paystack';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { email, amount, reference, metadata, callback_url } = body;

        if (!email || !amount || !reference) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await initializePayment({
            email,
            amount,
            reference,
            metadata,
            callback_url
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('PayStack initialization API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Payment initialization failed'
            },
            { status: 500 }
        );
    }
}