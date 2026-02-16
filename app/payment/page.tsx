// app/payment/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    CreditCard,
    Lock,
    CheckCircle,
    Loader2,
    Shield,
    AlertCircle,
    ArrowLeft,
    Receipt,
    Mail
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [formData, setFormData] = useState({
        cardNumber: '4111 1111 1111 1111',
        expiryDate: '12/28',
        cvv: '123',
        cardName: 'Demo User'
    });

    // ✅ FIX: Get orderId from URL (MongoDB _id)
    const amount = searchParams.get('amount') || '23935';
    const orderNumber = searchParams.get('orderNumber') || searchParams.get('orderId') || `ORD-${Date.now().toString().slice(-6)}`;
    const orderId = searchParams.get('orderId') || ''; // ✅ MongoDB _id for API
    const reference = searchParams.get('reference') || `PAY-${Date.now()}`;
    const email = searchParams.get('email') || 'customer@example.com';

    // // ✅ FIX: Update order payment status function
    // const updateOrderPaymentStatus = async () => {
    //     try {
    //         if (!orderId) {
    //             console.error('❌ No order ID found for payment update');
    //             return;
    //         }
            
    //         console.log(`🔄 Updating payment status for order ID: ${orderId}`);
            
    //         // ✅ FIX: Use the orderId (MongoDB _id) for API call
    //         const response = await fetch(`/api/orders/${orderId}/pay`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 paymentStatus: 'paid',
    //                 transactionId: reference,
    //                 paymentMethod: 'card'
    //             })
    //         });

    //         const result = await response.json();
    //         if (!result.success) {
    //             console.error('❌ Failed to update order status:', result.message);
    //         } else {
    //             console.log('✅ Order payment status updated:', result.data);
    //         }
    //     } catch (error) {
    //         console.error('❌ Error updating order status:', error);
    //     }
    // };


    // IN app/payment/page.tsx - Replace the current function
    const updateOrderPaymentStatus = async () => {
        try {
            // ✅ FIX: Get orderId from URL or use orderNumber to find order
            const orderId = searchParams.get('orderId') || '';
            const orderNumber = searchParams.get('orderNumber') || '';

            if (!orderId && !orderNumber) {
                console.error('❌ No order identifier found');
                toast.error('Order information missing');
                return;
            }

            let finalOrderId = orderId;

            // If we only have orderNumber, find the order by number
            if (!orderId && orderNumber) {
                console.log('🔍 Looking up order by number:', orderNumber);
                const findResponse = await fetch(`/api/orders?orderNumber=${orderNumber}`);
                const findResult = await findResponse.json();

                if (findResult.success && findResult.data) {
                    finalOrderId = findResult.data._id;
                    console.log('✅ Found order ID:', finalOrderId);
                } else {
                    toast.error('Order not found');
                    return;
                }
            }

            console.log(`🔄 Updating payment for order ID: ${finalOrderId}`);

            // ✅ FIX: Use the correct endpoint
            const response = await fetch(`/api/orders/${finalOrderId}`, { // Use the main PATCH endpoint
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentStatus: 'paid',
                    paymentMethod: 'card',
                    status: 'confirmed',
                    statusNotes: 'Payment completed via PayStack demo'
                })
            });

            const result = await response.json();

            if (!result.success) {
                console.error('❌ Failed to update order:', result.message);
                toast.error('Payment completed but order update failed');
            } else {
                console.log('✅ Order updated successfully:', result.data);
            }
        } catch (error) {
            console.error('❌ Error updating order:', error);
            // Don't show error to user - payment was successful
        }
    };

    // Auto-process demo payment after 3 seconds on page load
    useEffect(() => {
        if (!success && !processing) {
            const timer = setTimeout(() => {
                handleSubmit();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In real scenario, this would call PayStack API
            // For demo, we'll create a mock successful payment
            const mockPaymentData = {
                success: true,
                data: {
                    reference: reference,
                    status: 'success',
                    amount: parseInt(amount) * 100, // In kobo
                    paid_at: new Date().toISOString(),
                    channel: 'card',
                    currency: 'NGN',
                    customer: { email }
                }
            };

            // Call your PayStack verify API (optional for demo)
            try {
                const response = await fetch(`/api/paystack/verify?reference=${reference}`, {
                    method: 'GET'
                });
                const result = await response.json();
                console.log('PayStack verify result:', result);
            } catch (verifyError) {
                console.log('⚠️ PayStack verify skipped (demo mode)');
            }

            // ✅ FIX: Update order payment status
            await updateOrderPaymentStatus();
            
            setSuccess(true);
            setPaymentData(mockPaymentData);
            toast.success('Payment successful! Email confirmation sent.');

            // ✅ FIX: Redirect with orderNumber (not orderId) for display
            setTimeout(() => {
                router.push(`/dashboard/orders/success?orderId=${orderNumber}&payment=success&reference=${reference}`);
            }, 3000);
            
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-2 border-green-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">✅ Payment Successful!</CardTitle>
                        <CardDescription>
                            PayStack Demo Receipt - Test Mode
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* PayStack-style receipt */}
                        <div className="p-4 bg-white border-2 border-green-300 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold">PayStack Receipt</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">TEST MODE</Badge>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <code className="text-sm font-mono">{reference.slice(0, 12)}...</code>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Order #:</span>
                                    <span className="font-semibold">{orderNumber}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-bold text-green-700">₦{parseInt(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Status:</span>
                                    <Badge className="bg-green-100 text-green-800">Successful</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="text-sm">{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">✅ Payment Confirmed</p>
                                    <p className="text-xs text-blue-600">
                                        A payment confirmation has been sent to your email.
                                        Your order #{orderNumber} is now being prepared.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => router.push(`/dashboard/orders/${orderNumber}`)}
                            >
                                View Order Details
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/dashboard/orders')}
                            >
                                Go to My Orders
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="mb-6">
                    <Link href="/dashboard/checkout">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Checkout
                        </Button>
                    </Link>
                </div>

                <Card className="border-2 border-blue-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                        <CardTitle className="flex items-center gap-2">
                            <div className="relative">
                                <CreditCard className="h-7 w-7 text-blue-600" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                            </div>
                            <div>
                                <span className="text-lg font-semibold">PayStack</span>
                                <span className="text-xs text-gray-500 ml-2">Secure Payment Gateway</span>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Complete payment for order #{orderNumber}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Payment Amount - PayStack Style */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="text-3xl font-bold text-green-700">
                                            ₦{parseInt(amount).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">NGN - Nigerian Naira</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="mb-1 bg-white">Order</Badge>
                                        <p className="text-sm font-semibold">{orderNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details - PayStack Style */}
                            <div className="space-y-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-700">Card Details</h3>
                                
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                                        <Input
                                            id="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                                            placeholder="1234 5678 9012 3456"
                                            className="font-mono text-lg"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate" className="text-sm">Expiry Date</Label>
                                            <Input
                                                id="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                                placeholder="MM/YY"
                                                className="text-center"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv" className="text-sm">CVV</Label>
                                            <Input
                                                id="cvv"
                                                type="password"
                                                value={formData.cvv}
                                                onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                                                placeholder="123"
                                                className="text-center"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cardName" className="text-sm">Cardholder Name</Label>
                                        <Input
                                            id="cardName"
                                            value={formData.cardName}
                                            onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Info */}
                            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Secured by PayStack</p>
                                        <p className="text-xs text-green-600">
                                            256-bit SSL encryption • PCI DSS compliant
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Demo Instructions */}
                            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">💳 Demo Payment Instructions</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            This is a demo. Use test card: <strong>4111 1111 1111 1111</strong><br/>
                                            Any future expiry date • Any 3-digit CVV • Auto-process in 3 seconds
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pay Button - PayStack Style */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-6 text-lg font-semibold shadow-lg"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Processing with PayStack...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5 mr-2" />
                                        Pay ₦{parseInt(amount).toLocaleString()}
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs font-semibold">VISA</span>
                                    </div>
                                    <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs font-semibold">Mastercard</span>
                                    </div>
                                    <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs font-semibold">Verve</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    By proceeding, you agree to PayStack's Terms of Service
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}