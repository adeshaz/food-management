// app/dashboard/checkout/page.tsx - COMPLETE CORRECTED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    Banknote,
    Building,
    MapPin,
    Phone,
    User,
    Package,
    Shield,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Home,
    ShoppingBag,
    Lock,
    CheckCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { clearCart } = useCart();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [checkoutData, setCheckoutData] = useState<any>(null);
    const [paystackProcessing, setPaystackProcessing] = useState(false);
    const [bankTransferDetails, setBankTransferDetails] = useState({
        show: false,
        accountNumber: '0123456789',
        accountName: 'OSOGBO FOOD MANAGEMENT',
        bankName: 'Wema Bank',
        amount: 0
    });

    const [formData, setFormData] = useState({
        deliveryAddress: '',
        contactPhone: '',
        contactName: '',
        specialInstructions: '',
        paymentMethod: 'cash' as 'cash' | 'card' | 'transfer'
    });

    // Load checkout data from localStorage on component mount
    useEffect(() => {
        const loadCheckoutData = () => {
            try {
                const storedData = localStorage.getItem('checkoutData');
                if (storedData) {
                    const data = JSON.parse(storedData);
                    setCheckoutData(data);

                    // Update bank transfer amount
                    setBankTransferDetails(prev => ({
                        ...prev,
                        amount: data.total || 0
                    }));

                    // Pre-fill form with stored data
                    setFormData(prev => ({
                        ...prev,
                        deliveryAddress: data.deliveryAddress || '',
                        contactPhone: data.contactPhone || '',
                        contactName: data.contactName || '',
                        specialInstructions: data.specialInstructions || ''
                    }));
                }
            } catch (error) {
                console.error('Error loading checkout data:', error);
            }
        };

        loadCheckoutData();
    }, []);

    useEffect(() => {
        if (!user) {
            router.push('/signin?redirect=/dashboard/checkout');
            return;
        }

        // Pre-fill with user data if not already filled from localStorage
        if (!formData.contactName && user.name) {
            setFormData(prev => ({
                ...prev,
                contactName: user.name || ''
            }));
        }

        if (!formData.contactPhone && user.phone) {
            setFormData(prev => ({
                ...prev,
                contactPhone: user.phone || ''
            }));
        }

        if (!formData.deliveryAddress && user.address) {
            setFormData(prev => ({
                ...prev,
                deliveryAddress: user.address || ''
            }));
        }
    }, [user, router, formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!checkoutData) {
            toast.error('No checkout data found. Please go back to cart.');
            router.push('/dashboard/cart');
            return;
        }

        if (!formData.deliveryAddress.trim() || !formData.contactPhone.trim() || !formData.contactName.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Handle different payment methods
        if (formData.paymentMethod === 'card') {
            await handlePaystackPayment();
        } else if (formData.paymentMethod === 'transfer') {
            // Show bank transfer details
            setBankTransferDetails(prev => ({
                ...prev,
                show: true,
                amount: checkoutData.total
            }));
            return; // Don't proceed with normal order placement
        } else {
            // Cash on delivery - proceed normally
            await placeOrder();
        }
    };

    const placeOrder = async () => {
        setProcessing(true);

        try {
            // Prepare order data for YOUR API
            const orderData = {
                restaurantId: checkoutData.restaurantId,
                deliveryAddress: formData.deliveryAddress,
                contactPhone: formData.contactPhone,
                contactName: formData.contactName,
                contactEmail: user?.email,
                specialInstructions: formData.specialInstructions,
                paymentMethod: formData.paymentMethod,
                items: checkoutData.items.map((item: any) => ({
                    foodItem: item.id || item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: checkoutData.subtotal,
                deliveryFee: checkoutData.deliveryFee,
                tax: checkoutData.tax,
                total: checkoutData.total
            };

            console.log('📦 Sending order data to API:', orderData);

            // Call your Orders API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // Clear cart
                clearCart();

                // Clear localStorage
                localStorage.removeItem('checkoutData');

                // Save order to localStorage for fallback
                localStorage.setItem(`order_${result.data.orderNumber}`, JSON.stringify(result.data));

                // Save to recent orders
                const recentOrders = JSON.parse(localStorage.getItem('recentOrders') || '[]');
                recentOrders.unshift({
                    orderNumber: result.data.orderNumber,
                    total: result.data.totalAmount,
                    date: new Date().toISOString(),
                    status: 'confirmed'
                });
                localStorage.setItem('recentOrders', JSON.stringify(recentOrders.slice(0, 5)));

                // Redirect to success page
                const orderNumber = result.data.orderNumber || result.data._id;
                router.push(`/dashboard/orders/success?orderId=${orderNumber}`);

                toast.success('Order placed successfully! 🎉');
            } else {
                toast.error(result.message || 'Failed to place order');
                console.error('Order API error:', result);
            }

        } catch (error) {
            console.error('Order error:', error);
            toast.error('An error occurred while placing your order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // ✅ CORRECTED PayStack Payment Handler
    const handlePaystackPayment = async () => {
        if (!checkoutData || !user) {
            toast.error('No checkout data found');
            return;
        }

        setPaystackProcessing(true);

        try {
            // First, create the order with pending status
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    restaurantId: checkoutData.restaurantId,
                    deliveryAddress: formData.deliveryAddress,
                    contactPhone: formData.contactPhone,
                    contactName: formData.contactName,
                    contactEmail: user.email,
                    specialInstructions: formData.specialInstructions,
                    paymentMethod: 'card',
                    paymentStatus: 'pending',
                    status: 'pending',
                    items: checkoutData.items.map((item: any) => ({
                        foodItem: item.id || item._id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    subtotal: checkoutData.subtotal,
                    deliveryFee: checkoutData.deliveryFee,
                    tax: checkoutData.tax,
                    total: checkoutData.total,
                    paymentReference: `PAY-${Date.now()}`,
                    notes: 'PayStack payment initiated'
                })
            });

            const orderResult = await orderResponse.json();

            if (orderResult.success) {
                // Generate payment reference
                const reference = `DEMO-PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                // Get BOTH orderNumber AND orderId
                const orderNumber = orderResult.data.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;
                const orderId = orderResult.data._id; // MongoDB _id

                // Save order data for fallback
                localStorage.setItem(`order_${orderNumber}`, JSON.stringify(orderResult.data));

                // Save to recent orders
                const recentOrders = JSON.parse(localStorage.getItem('recentOrders') || '[]');
                recentOrders.unshift({
                    orderNumber: orderNumber,
                    orderId: orderId,
                    total: checkoutData.total,
                    date: new Date().toISOString(),
                    status: 'pending'
                });
                localStorage.setItem('recentOrders', JSON.stringify(recentOrders.slice(0, 5)));

                // Pass orderId to payment page
                const paymentParams = new URLSearchParams({
                    amount: checkoutData.total.toString(),
                    orderNumber: orderNumber,
                    orderId: orderId,
                    reference: reference,
                    email: user.email,
                    name: formData.contactName || user.name,
                    address: formData.deliveryAddress
                });

                // Clear cart and localStorage
                clearCart();
                localStorage.removeItem('checkoutData');

                // Redirect to demo payment page
                toast.success('Redirecting to secure payment...');

                // Wait a moment then redirect
                setTimeout(() => {
                    router.push(`/payment?${paymentParams.toString()}`);
                }, 1000);

            } else {
                toast.error('Failed to create order: ' + (orderResult.message || 'Unknown error'));
                console.error('Order creation error:', orderResult);
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment processing failed. Please try again.');
        } finally {
            setPaystackProcessing(false);
        }
    };

    // ✅ CORRECTED Bank Transfer Handler
    const handleBankTransferConfirm = async () => {
        setProcessing(true);

        try {
            // SAVE FORM DATA TEMPORARILY
            const orderData = {
                restaurantId: checkoutData.restaurantId,
                deliveryAddress: formData.deliveryAddress,
                contactPhone: formData.contactPhone,
                contactName: formData.contactName,
                contactEmail: user?.email,
                specialInstructions: formData.specialInstructions,
                paymentMethod: 'transfer',
                paymentStatus: 'pending',
                items: checkoutData.items.map((item: any) => ({
                    foodItem: item.id || item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: checkoutData.subtotal,
                deliveryFee: checkoutData.deliveryFee,
                tax: checkoutData.tax,
                total: checkoutData.total,
                // ADD BANK TRANSFER DETAILS
                bankTransferDetails: {
                    accountNumber: bankTransferDetails.accountNumber,
                    accountName: bankTransferDetails.accountName,
                    bankName: bankTransferDetails.bankName,
                    amount: bankTransferDetails.amount
                }
            };

            console.log('🏦 Bank transfer order data:', orderData);

            // Call your Orders API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // Clear cart
                clearCart();

                // Clear localStorage
                localStorage.removeItem('checkoutData');

                // Save order for fallback
                const orderNumber = result.data.orderNumber || result.data._id;
                localStorage.setItem(`order_${orderNumber}`, JSON.stringify(result.data));

                // Save to recent orders
                const recentOrders = JSON.parse(localStorage.getItem('recentOrders') || '[]');
                recentOrders.unshift({
                    orderNumber: orderNumber,
                    total: checkoutData.total,
                    date: new Date().toISOString(),
                    status: 'pending'
                });
                localStorage.setItem('recentOrders', JSON.stringify(recentOrders.slice(0, 5)));

                // Show success message
                toast.success('Order placed! Please complete your bank transfer.');

                // Redirect to order pending page
                router.push(`/dashboard/orders/pending-payment?orderId=${orderNumber}&method=transfer&amount=${checkoutData.total}`);

            } else {
                toast.error(result.message || 'Failed to place order');
            }

        } catch (error) {
            console.error('Bank transfer error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setProcessing(false);
            setBankTransferDetails(prev => ({ ...prev, show: false }));
        }
    };

    const handleCopyBankDetails = () => {
        const text = `Account Number: ${bankTransferDetails.accountNumber}\nAccount Name: ${bankTransferDetails.accountName}\nBank: ${bankTransferDetails.bankName}\nAmount: ₦${bankTransferDetails.amount.toLocaleString()}`;
        navigator.clipboard.writeText(text);
        toast.success('Bank details copied to clipboard!');
    };

    const handlePaymentMethodChange = (value: 'cash' | 'card' | 'transfer') => {
        setFormData({ ...formData, paymentMethod: value });
        setBankTransferDetails(prev => ({ ...prev, show: false }));

        if (value === 'card') {
            toast.info('You will be redirected to PayStack for secure card payment');
        } else if (value === 'transfer') {
            toast.info('Bank transfer details will be shown for payment');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (!checkoutData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Checkout Data</h2>
                    <p className="text-gray-600 mb-6">Please add items to cart and proceed from there</p>
                    <div className="space-y-3">
                        <Button onClick={() => router.push('/dashboard/cart')} className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Cart
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/foods')} className="w-full">
                            Browse Foods
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const restaurantName = checkoutData.restaurantName || 'Restaurant';
    const cartTotal = checkoutData.total || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/dashboard/cart">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Cart
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    </div>
                    <p className="text-gray-600">Complete your order from {restaurantName}</p>
                </div>

                {/* Bank Transfer Modal */}
                {bankTransferDetails.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-md w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Bank Transfer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Account Number:</span>
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    {bankTransferDetails.accountNumber}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Account Name:</span>
                                                <span className="font-semibold">{bankTransferDetails.accountName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Bank:</span>
                                                <span>{bankTransferDetails.bankName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Amount:</span>
                                                <span className="text-lg font-bold text-green-700">
                                                    ₦{bankTransferDetails.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-800">Important Instructions:</p>
                                                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                                    <li>• Transfer the exact amount shown above</li>
                                                    <li>• Use your order number as payment reference</li>
                                                    <li>• Send payment proof to payments@osogbofoods.com</li>
                                                    <li>• Your order will be processed after payment confirmation</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={handleCopyBankDetails}
                                        >
                                            Copy Details
                                        </Button>
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={handleBankTransferConfirm}
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            I've Made Transfer
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => setBankTransferDetails(prev => ({ ...prev, show: false }))}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Left Column - Delivery & Payment */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="contactName" className="mb-2">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="contactName"
                                                required
                                                value={formData.contactName}
                                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                placeholder="Enter your full name"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="phone" className="mb-2">
                                                    Contact Phone *
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    required
                                                    value={formData.contactPhone}
                                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                                    placeholder="+234 801 234 5678"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Delivery Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                                                Delivery Address *
                                            </Label>
                                            <Textarea
                                                id="address"
                                                required
                                                value={formData.deliveryAddress}
                                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                                placeholder="Enter your full delivery address including landmarks"
                                                rows={3}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="instructions" className="mb-2">
                                                Special Instructions (Optional)
                                            </Label>
                                            <Textarea
                                                id="instructions"
                                                value={formData.specialInstructions}
                                                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                                                placeholder="Any special instructions for delivery?"
                                                rows={2}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => handlePaymentMethodChange(value as any)}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                                            <RadioGroupItem value="cash" id="cash" />
                                            <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <Banknote className="h-6 w-6 text-green-600" />
                                                    <div>
                                                        <p className="font-semibold">Cash on Delivery</p>
                                                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                                            <RadioGroupItem value="card" id="card" />
                                            <Label htmlFor="card" className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <CreditCard className="h-6 w-6 text-blue-600" />
                                                        <Lock className="h-3 w-3 text-blue-400 absolute -top-1 -right-1" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">Credit/Debit Card</p>
                                                        <p className="text-sm text-gray-500">Pay securely with PayStack</p>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                                            <RadioGroupItem value="transfer" id="transfer" />
                                            <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <Building className="h-6 w-6 text-purple-600" />
                                                    <div>
                                                        <p className="font-semibold">Bank Transfer</p>
                                                        <p className="text-sm text-gray-500">Transfer to our bank account</p>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-start gap-2">
                                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-800">Secure Payment</p>
                                                <p className="text-xs text-green-600">
                                                    All payments are secured and encrypted. We never store your card details.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PayStack processing indicator */}
                                    {formData.paymentMethod === 'card' && paystackProcessing && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <p className="text-sm text-blue-700">
                                                    Redirecting to secure payment page...
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="mt-8 lg:mt-0">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Restaurant Info */}
                                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-800">Ordering from:</p>
                                        <p className="font-semibold text-green-900">{restaurantName}</p>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="mb-4">
                                        <p className="font-medium text-gray-700 mb-2">Items:</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {checkoutData.items?.map((item: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 truncate">
                                                        {item.quantity}× {item.name}
                                                    </span>
                                                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 border-t pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">₦{checkoutData.subtotal?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Fee</span>
                                            <span className="font-medium">₦{checkoutData.deliveryFee?.toLocaleString() || '500'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax (7.5%)</span>
                                            <span className="font-medium">₦{(checkoutData.tax || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-3">
                                            <span className="text-lg font-bold">Total</span>
                                            <span className="text-lg font-bold text-green-700">
                                                ₦{cartTotal.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Method Summary */}
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700">Selected Payment:</p>
                                        <p className="font-semibold capitalize">
                                            {formData.paymentMethod === 'card' && '💳 Credit/Debit Card (PayStack)'}
                                            {formData.paymentMethod === 'transfer' && '🏦 Bank Transfer'}
                                            {formData.paymentMethod === 'cash' && '💰 Cash on Delivery'}
                                        </p>
                                    </div>

                                    {/* Terms */}
                                    <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <p className="text-xs text-gray-600">
                                                By placing your order, you agree to our Terms of Service and Privacy Policy
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submit Button - Dynamic based on payment method */}
                                    <Button
                                        type="submit"
                                        className="w-full mt-6 bg-green-600 hover:bg-green-700 py-6 text-lg"
                                        disabled={processing || paystackProcessing}
                                    >
                                        {paystackProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Processing Payment...
                                            </>
                                        ) : processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Placing Order...
                                            </>
                                        ) : formData.paymentMethod === 'card' ? (
                                            'Pay with PayStack'
                                        ) : formData.paymentMethod === 'transfer' ? (
                                            'Show Bank Details'
                                        ) : (
                                            'Place Order (Cash)'
                                        )}
                                    </Button>

                                    <p className="text-center text-sm text-gray-500 mt-4">
                                        {formData.paymentMethod === 'card' && 'Secure payment powered by PayStack'}
                                        {formData.paymentMethod === 'transfer' && 'Bank details will be shown for transfer'}
                                        {formData.paymentMethod === 'cash' && 'Pay when your order arrives'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}