// app/dashboard/orders/[id]/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PhoneCallButton from '@/components/ui/PhoneCallButton';
import {
    Package,
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    Truck,
    Phone,
    Mail,
    User,
    CheckCircle,
    Clock3,
    XCircle,
    ArrowLeft,
    Printer,
    Share2,
    MessageSquare,
    Star,
    Loader2,
    HelpCircle,
    Headphones,
    Building,
    Banknote,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Props {
    params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [printing, setPrinting] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/signin');
            return;
        }

        fetchOrder();
    }, [id, user, router]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching order details for:', id);

            const response = await fetch(`/api/orders/${id}`);
            const data = await response.json();

            console.log('📥 Order API response:', data);

            if (data.success) {
                setOrder(data.data);
            } else {
                console.error('Order not found:', data.message);
                toast.error('Order not found');
                router.push('/dashboard/orders');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const statusLower = status?.toLowerCase() || 'pending';

        switch (statusLower) {
            case 'delivered':
                return {
                    icon: CheckCircle,
                    color: 'bg-green-100 text-green-800',
                    label: 'Delivered'
                };
            case 'preparing':
                return {
                    icon: Clock3,
                    color: 'bg-blue-100 text-blue-800',
                    label: 'Preparing'
                };
            case 'on-the-way':
            case 'out-for-delivery':
                return {
                    icon: Truck,
                    color: 'bg-purple-100 text-purple-800',
                    label: 'On the way'
                };
            case 'cancelled':
                return {
                    icon: XCircle,
                    color: 'bg-red-100 text-red-800',
                    label: 'Cancelled'
                };
            case 'confirmed':
                return {
                    icon: CheckCircle,
                    color: 'bg-emerald-100 text-emerald-800',
                    label: 'Confirmed'
                };
            default:
                return {
                    icon: Clock3,
                    color: 'bg-amber-100 text-amber-800',
                    label: 'Pending'
                };
        }
    };

    const getPaymentIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'card': return CreditCard;
            case 'transfer': return Building;
            case 'cash': return Banknote;
            default: return CreditCard;
        }
    };

    const handlePrint = () => {
        setPrinting(true);
        setTimeout(() => {
            window.print();
            setPrinting(false);
        }, 500);
    };

    const handleReorder = () => {
        toast.info('Reorder feature coming soon!');
    };

    const handleContactRestaurant = () => {
        toast.info('Contact restaurant feature coming soon!');
    };

    const handleTrackOrder = () => {
        router.push(`/dashboard/tracking/${id}`);
    };

    const handleCustomerSupport = () => {
        toast.info('Customer support feature coming soon!');
    };

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelling(true);
            const response = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'cancelled',
                    statusNotes: 'Cancelled by customer'
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Order cancelled successfully');
                fetchOrder(); // Refresh order
            } else {
                toast.error(data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error('An error occurred');
        } finally {
            setCancelling(false);
        }
    };

    const handleRateOrder = () => {
        toast.info('Rating feature coming soon!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist</p>
                    <Link href="/dashboard/orders">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const PaymentIcon = getPaymentIcon(order.paymentMethod);

    // ✅ SAFE CALCULATIONS - Prevent undefined errors
    const items = order.items || [];
    const restaurant = order.restaurant || { name: 'Restaurant', phone: '+234 801 234 5678', address: '' };
    const userInfo = order.user || { name: 'Customer', email: '', phone: '' };

    // Calculate totals safely
    const subtotal = order.subtotal || items.reduce((sum: number, item: any) =>
        sum + ((item.price || 0) * (item.quantity || 1)), 0);

    const deliveryFee = order.deliveryFee || 500;
    const tax = order.tax || Math.round(subtotal * 0.075); // 7.5% tax
    const discount = order.discount || 0;

    // ✅ CRITICAL FIX: Use totalAmount first, then total, then calculate
    const total = order.totalAmount || order.total || (subtotal + deliveryFee + tax - discount);

    // Format dates safely
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const formattedDate = orderDate.toLocaleDateString();
    const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Estimated delivery time
    const estimatedTime = order.estimatedDeliveryTime
        ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '30-45 mins';

    // Status timeline from statusHistory
    const statusHistory = order.statusHistory || [
        { status: 'ordered', timestamp: order.createdAt || new Date().toISOString() }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/orders">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Orders
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formattedDate} at {formattedTime}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge className={`${statusConfig.color} flex items-center gap-1 text-sm`}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                            </Badge>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={printing}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                {printing ? 'Printing...' : 'Print'}
                            </Button>

                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>Items ordered from {restaurant.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {items.map((item: any, index: number) => (
                                        <div key={item.id || index} className="flex justify-between items-start py-3 border-b last:border-b-0">
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="font-medium">{item.foodItem?.name || item.name || `Item ${index + 1}`}</p>
                                                    <p className="font-semibold">
                                                        ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.quantity || 1} × ₦{(item.price || 0).toLocaleString()}
                                                        </Badge>
                                                        {(item.notes || item.foodItem?.notes) && (
                                                            <span className="text-sm text-gray-500">
                                                                Note: {item.notes || item.foodItem?.notes}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={handleReorder}>
                                                        Reorder this item
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-6" />

                                {/* Price Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₦{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span>₦{deliveryFee.toLocaleString()}</span>
                                    </div>
                                    {tax > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax (7.5%)</span>
                                            <span>₦{tax.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-₦{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-green-700">₦{total.toLocaleString()}</span>
                                    </div>

                                    {/* Payment Note */}
                                    {order.paymentNote && (
                                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-700">{order.paymentNote}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Delivery Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Delivery Address
                                        </h3>
                                        <p className="text-gray-800">{order.deliveryAddress || 'No address provided'}</p>
                                        {order.notes && (
                                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                                <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                                                <p className="text-sm text-yellow-700">{order.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Delivery Time
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Estimated:</span>
                                                <span className="font-medium">{estimatedTime}</span>
                                            </div>
                                            {order.deliveredAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Delivered:</span>
                                                    <span className="font-medium">
                                                        {new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Delivery Person Info (if available) */}
                                        {order.deliveryPerson && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <h4 className="font-medium mb-2">Delivery Person</h4>
                                                <p className="text-gray-800">{order.deliveryPerson.name}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm text-gray-600">{order.deliveryPerson.phone}</span>
                                                    {order.deliveryPerson.rating && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {order.deliveryPerson.rating} ★
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Status Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {statusHistory.map((step: any, index: number) => {
                                        const stepTime = step.timestamp || step.time || order.createdAt;
                                        const stepDate = stepTime ? new Date(stepTime) : new Date();

                                        return (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${index <= statusHistory.findIndex((s: any) => s.status === order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    {index < statusHistory.length - 1 && (
                                                        <div className={`w-0.5 h-8 ${index < statusHistory.findIndex((s: any) => s.status === order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="font-medium capitalize">{step.status || 'Ordered'}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {stepDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {stepDate.toLocaleDateString()}
                                                        {step.notes && <span className="ml-2 text-gray-500">- {step.notes}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* End of Left Column */}

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Restaurant Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Restaurant Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-300 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {restaurant.name?.charAt(0) || 'R'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{restaurant.name}</p>
                                            {restaurant.address && (
                                                <p className="text-sm text-gray-600">{restaurant.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span>{restaurant.phone || '+234 801 234 5678'}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={handleContactRestaurant}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Contact Restaurant
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Payment Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Method</span>
                                        <div className="flex items-center gap-2">
                                            <PaymentIcon className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium capitalize">{order.paymentMethod || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <Badge className={
                                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-red-100 text-red-800'
                                        }>
                                            {(order.paymentStatus || 'pending').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Paid</span>
                                        <span className="font-bold text-green-700">₦{total.toLocaleString()}</span>
                                    </div>
                                    {order.paymentNote && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded">
                                            <p className="text-sm text-gray-600">Note</p>
                                            <p className="text-sm">{order.paymentNote}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Customer Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">{order.contactName || userInfo.name || 'Customer'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{user?.email || userInfo.email || 'customer@email.com'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{order.contactPhone || userInfo.phone || 'No phone provided'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rating & Review */}
                        {order.rating && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">Your Review</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${i < (order.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                                />
                                            ))}
                                            <span className="font-medium ml-2">{order.rating}/5</span>
                                        </div>
                                        {order.review && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm italic">"{order.review}"</p>
                                            </div>
                                        )}
                                        <Button variant="outline" size="sm" className="w-full" onClick={handleRateOrder}>
                                            Edit Review
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* ACTIONS CARD */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Actions</h3>
                                <div className="space-y-3">
                                    {(order.status === 'preparing' || order.status === 'on-the-way' || order.status === 'confirmed') && (
                                        <Button
                                            className="w-full"
                                            onClick={handleTrackOrder}
                                        >
                                            <Truck className="h-4 w-4 mr-2" />
                                            Track Order Live
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleReorder}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Reorder All Items
                                    </Button>

                                    {!order.rating && order.status === 'delivered' && (
                                        <Button variant="outline" className="w-full" onClick={handleRateOrder}>
                                            <Star className="h-4 w-4 mr-2" />
                                            Rate This Order
                                        </Button>
                                    )}

                                    {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            Cancel Order
                                        </Button>
                                    )}
                                </div>

                                {/* HELP SECTION WITH PHONE BUTTONS */}
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <HelpCircle className="h-5 w-5 text-blue-600" />
                                        Need Help?
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Contact our customer support team for assistance
                                    </p>
                                    <div className="space-y-2">
                                        <PhoneCallButton
                                            phoneNumber="+2349037272637"
                                            label="Call Customer Support"
                                            variant="call"
                                            className="w-full"
                                        />
                                        <PhoneCallButton
                                            phoneNumber="+2349037272637"
                                            label="Chat on WhatsApp"
                                            variant="whatsapp"
                                            className="w-full"
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleCustomerSupport}
                                        >
                                            <Headphones className="h-4 w-4 mr-2" />
                                            Live Chat Support
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Customer service: 9 AM - 9 PM daily
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* End of Right Column */}
                </div>
                {/* End of Grid */}
            </div>
            {/* End of Container */}
        </div>
    );
}