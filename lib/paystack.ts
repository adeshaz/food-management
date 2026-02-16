
// lib/paystack.ts
import { default as Paystack } from 'paystack';

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY!);

interface PaymentData {
    email: string;
    amount: number; // in kobo (₦1 = 100 kobo)
    reference: string;
    metadata?: Record<string, any>;
    callback_url?: string;
}

export async function initializePayment(data: PaymentData) {
    try {
        const response = await paystack.transaction.initialize({
            email: data.email,
            amount: Math.round(data.amount * 100), // Convert to kobo
            reference: data.reference,
            metadata: data.metadata || {},
            callback_url: data.callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/success`
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error: any) {
        console.error('Paystack initialization error:', error);
        return {
            success: false,
            error: error.message || 'Failed to initialize payment'
        };
    }
}

export async function verifyPayment(reference: string) {
    try {
        const response = await paystack.transaction.verify(reference);

        return {
            success: true,
            data: response.data
        };
    } catch (error: any) {
        console.error('Paystack verification error:', error);
        return {
            success: false,
            error: error.message || 'Failed to verify payment'
        };
    }
}

// Add this function for listing banks
export async function listBanks() {
    try {
        const response = await paystack.misc.list_banks({ country: 'nigeria' });
        return {
            success: true,
            data: response.data
        };
    } catch (error: any) {
        console.error('Paystack bank list error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch banks'
        };
    }
}