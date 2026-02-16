// app/dashboard/orders/pending-payment/page.tsx - UPDATED
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, Building, CheckCircle, ArrowLeft, FileText, Copy, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import your auth context

export default function PendingPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth(); // Get user from auth context

    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const amount = searchParams.get('amount');
    const method = searchParams.get('method');

    const [copied, setCopied] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);

    // Check if user is admin
    useEffect(() => {
        if (user && user.role === 'admin') {
            setIsAdmin(true);
        }
    }, [user]);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;

            try {
                const response = await fetch(`/api/orders/${orderId}`);
                const result = await response.json();

                if (result.success) {
                    setOrderDetails(result.data);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    // Bank details for demo
    const bankDetails = {
        accountNumber: '0123456789',
        accountName: 'OSOGBO FOOD MANAGEMENT',
        bankName: 'Wema Bank',
        amount: amount ? parseInt(amount) : 23935
    };

    const handleCopyDetails = () => {
        const text = `Account Number: ${bankDetails.accountNumber}\nAccount Name: ${bankDetails.accountName}\nBank: ${bankDetails.bankName}\nAmount: ₦${bankDetails.amount.toLocaleString()}\nReference: ${orderNumber || orderId}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Bank details copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleAdminConfirmPayment = async () => {
        if (!orderId) {
            toast.error('Order ID is required');
            return;
        }

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    statusNotes: `Admin ${user?.name || 'Admin'} confirmed bank transfer`
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('✅ Payment confirmed! Order is now active.');

                // Redirect to order details or admin orders page
                setTimeout(() => {
                    router.push('/admin/orders');
                }, 2000);
            } else {
                toast.error(result.message || 'Failed to confirm payment');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            toast.error('Error confirming payment');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-6">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                    </Link>
                </div>

                <Card className="border-2 border-blue-200">
                    <CardHeader className="text-center bg-blue-50">
                        <div className="mx-auto mb-4">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Awaiting Payment</CardTitle>
                        <CardDescription>
                            Order #{orderNumber || orderId} is pending bank transfer
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Admin Notice */}
                        {isAdmin && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-800">Admin View</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    You can mark this payment as received and activate the order.
                                </p>
                            </div>
                        )}

                        {/* Order Status */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-amber-500">Pending Payment</Badge>
                                    <span className="text-sm text-gray-600">
                                        {orderDetails?.paymentNote || 'Order will be processed after payment'}
                                    </span>
                                </div>
                                <Badge variant="outline">Bank Transfer</Badge>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="p-6 bg-white border-2 border-blue-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Building className="h-6 w-6 text-blue-600" />
                                <h3 className="text-lg font-semibold">Bank Transfer Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Bank Name</p>
                                        <p className="font-semibold">{bankDetails.bankName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Account Number</p>
                                        <p className="font-semibold font-mono">{bankDetails.accountNumber}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Account Name</p>
                                    <p className="font-semibold text-lg">{bankDetails.accountName}</p>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Amount to Transfer</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                ₦{bankDetails.amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            Order: {orderNumber || orderId}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-semibold text-amber-800 mb-2">Important Instructions</h4>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Transfer the EXACT amount shown above</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Use order number <strong>{orderNumber || orderId}</strong> as payment reference</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Send payment proof to <strong>payments@osogbofoods.com</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Your order will be processed within 1 hour of payment confirmation</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleCopyDetails}
                                variant="outline"
                                className="w-full"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy Bank Details'}
                            </Button>

                            {/* Admin Button */}
                            {isAdmin && (
                                <Button
                                    onClick={handleAdminConfirmPayment}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Confirm Payment Received (Admin)
                                </Button>
                            )}

                            <Button
                                onClick={() => router.push('/dashboard/orders')}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                View My Orders
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => router.push('/foods')}
                                className="w-full"
                            >
                                Continue Shopping
                            </Button>
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            Need help? Contact support at support@osogbofoods.com
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}