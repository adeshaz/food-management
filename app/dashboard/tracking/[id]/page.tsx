// app/dashboard/tracking/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Clock,
    Truck,
    Package,
    ChefHat,
    CheckCircle,
    Home,
    Phone,
    Loader2,
    Navigation,
    Calendar,
    Shield,
    User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
    params: Promise<{ id: string }>;
}

const trackingSteps = [
    { id: 'pending', label: 'Order Placed', icon: Package, color: 'bg-blue-500' },
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-green-500' },
    { id: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-orange-500' },
    { id: 'ready', label: 'Ready', icon: CheckCircle, color: 'bg-purple-500' },
    { id: 'on-the-way', label: 'On the Way', icon: Truck, color: 'bg-indigo-500' },
    { id: 'delivered', label: 'Delivered', icon: Home, color: 'bg-green-600' }
];

const getStepIndex = (status: string): number => {
    const index = trackingSteps.findIndex(step => step.id === status);
    return index >= 0 ? index : 0;
};

export default function TrackOrderPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState({
        lat: 7.7833,
        lng: 4.5667,
        address: 'Near Oke-Fia Roundabout, Osogbo'
    });
    const [estimatedArrival, setEstimatedArrival] = useState('15-20 minutes');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!user) {
            router.push('/signin');
            return;
        }

        // Fetch order details
        fetchOrderDetails();

        // Simulate live updates
        const interval = setInterval(() => {
            updateTracking();
        }, 10000);

        return () => clearInterval(interval);
    }, [id, user, router]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // In real app, fetch from API: /api/orders/${id}
            // For now, simulate with mock data
            setTimeout(() => {
                const mockOrder = {
                    _id: id,
                    orderNumber: `ORD-${id.slice(-8).toUpperCase()}`,
                    restaurant: {
                        name: 'Taste of Naija',
                        address: '123 Lagos Street, Osogbo',
                        phone: '+234 801 234 5678'
                    },
                    status: 'on-the-way',
                    deliveryAddress: '123 Oke-Fia Road, Osogbo, Osun State',
                    contactPhone: '+234 812 345 6789',
                    estimatedDelivery: new Date(Date.now() + 30 * 60000),
                    createdAt: new Date(Date.now() - 15 * 60000),
                    driver: {
                        name: 'Adebayo Johnson',
                        phone: '+234 803 456 7890',
                        vehicle: 'Honda Bike',
                        plate: 'OSG-123AB',
                        rating: 4.8
                    },
                    items: [
                        { name: 'Jollof Rice with Grilled Chicken', quantity: 2, price: 3500 },
                        { name: 'Zobo Drink', quantity: 1, price: 800 }
                    ],
                    totalAmount: 8300
                };

                setOrder(mockOrder);
                setLoading(false);

                // Set progress based on status
                const stepIndex = getStepIndex(mockOrder.status);
                const progressValue = (stepIndex / (trackingSteps.length - 1)) * 100;
                setProgress(progressValue);
            }, 1000);
        } catch (error) {
            console.error('Error fetching order:', error);
            setLoading(false);
        }
    };

    const updateTracking = () => {
        // Simulate driver movement
        setDriverLocation(prev => ({
            ...prev,
            lat: prev.lat + 0.0005,
            lng: prev.lng + 0.0005,
            address: ['Near Oke-Fia', 'Approaching Station Road', 'At Oja-Oba Market'][Math.floor(Math.random() * 3)]
        }));

        // Update estimated arrival
        const times = ['10-15 minutes', '5-10 minutes', 'Almost there'];
        setEstimatedArrival(times[Math.floor(Math.random() * times.length)]);
    };

    const handleCallDriver = () => {
        if (order?.driver?.phone) {
            window.open(`tel:${order.driver.phone}`, '_blank');
        }
    };

    const handleContactRestaurant = () => {
        if (order?.restaurant?.phone) {
            window.open(`tel:${order.restaurant.phone}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading order tracking...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
                <div className="text-center max-w-md">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find this order for tracking</p>
                    <div className="space-y-3">
                        <Button onClick={() => router.push('/dashboard/orders')}>
                            View All Orders
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/foods')}>
                            Order Food
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const currentStepIndex = getStepIndex(order.status);
    const isDelivered = order.status === 'delivered';

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <Link href={`/dashboard/orders/${id}`}>
                                <Button variant="ghost" size="sm">
                                    ← Back to Order Details
                                </Button>
                            </Link>
                            <Badge className={`${isDelivered ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {isDelivered ? 'Delivered' : 'Live Tracking'}
                            </Badge>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Tracking Order #{order.orderNumber}
                                    </h1>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Ordered: {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Estimated Arrival</p>
                                    <p className="text-2xl font-bold text-green-700">{estimatedArrival}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Order Progress</span>
                            <span className="text-sm font-bold text-green-700">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Tracking Timeline */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tracking Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Navigation className="h-5 w-5" />
                                        Order Journey
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {trackingSteps.map((step, index) => {
                                            const StepIcon = step.icon;
                                            const isCompleted = index <= currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div key={step.id} className="flex items-start gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? step.color : 'bg-gray-200'
                                                            }`}>
                                                            <StepIcon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-gray-400'
                                                                }`} />
                                                        </div>
                                                        {index < trackingSteps.length - 1 && (
                                                            <div className={`w-0.5 h-12 ${isCompleted ? step.color : 'bg-gray-200'
                                                                }`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <div className="flex justify-between items-center">
                                                            <p className={`font-medium text-lg ${isCompleted ? 'text-gray-900' : 'text-gray-500'
                                                                }`}>
                                                                {step.label}
                                                            </p>
                                                            {isCurrent && !isDelivered && (
                                                                <Badge className="bg-green-100 text-green-800 animate-pulse">
                                                                    In Progress
                                                                </Badge>
                                                            )}
                                                            {isCompleted && !isCurrent && (
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Done
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* Status-specific messages */}
                                                        {isCurrent && (
                                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                                {step.id === 'preparing' && (
                                                                    <p className="text-sm text-gray-600">
                                                                        👨‍🍳 Chef is preparing your meal at {order.restaurant.name}
                                                                    </p>
                                                                )}
                                                                {step.id === 'on-the-way' && (
                                                                    <p className="text-sm text-gray-600">
                                                                        🚚 Driver {order.driver?.name} is on the way to your location
                                                                    </p>
                                                                )}
                                                                {step.id === 'delivered' && (
                                                                    <p className="text-sm text-gray-600">
                                                                        ✅ Order delivered successfully at {order.deliveredAt || 'your location'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Map/Location Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        {isDelivered ? 'Delivery Location' : 'Live Location'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48 bg-gradient-to-r from-green-400 to-emerald-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                                        {/* Simple map visualization */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Restaurant marker */}
                                            <div className="absolute left-1/4 top-1/2 w-8 h-8 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                                                <span className="text-xs font-bold text-blue-600">R</span>
                                            </div>

                                            {/* Driver marker */}
                                            {!isDelivered && (
                                                <div className="absolute left-2/3 top-1/2 w-10 h-10 bg-white rounded-full border-4 border-green-500 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
                                                    <Truck className="h-5 w-5 text-green-600" />
                                                </div>
                                            )}

                                            {/* Destination marker */}
                                            <div className="absolute right-1/4 top-1/2 w-8 h-8 bg-white rounded-full border-4 border-red-500 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                                                <Home className="h-4 w-4 text-red-600" />
                                            </div>

                                            {/* Path line */}
                                            <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-gray-300 transform -translate-y-1/2"></div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Current Location</p>
                                            <p className="font-medium">{driverLocation.address}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Estimated Arrival</p>
                                            <p className="font-medium">{estimatedArrival}</p>
                                        </div>
                                    </div>

                                    {!isDelivered && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <p className="text-sm text-blue-700">
                                                    Your food is being kept warm in our thermal delivery bag
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Driver & Order Info */}
                        <div className="space-y-6">
                            {/* Driver Information */}
                            {order.driver && !isDelivered && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                            <Truck className="h-5 w-5" />
                                            Your Delivery Driver
                                        </h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {order.driver.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{order.driver.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {order.driver.rating} ★
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">Verified Driver</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Vehicle</p>
                                                <p className="font-medium">{order.driver.vehicle}</p>
                                                <p className="text-sm text-gray-500">{order.driver.plate}</p>
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Contact</p>
                                                <p className="font-medium">{order.driver.phone}</p>
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="space-y-2">
                                            <Button onClick={handleCallDriver} className="w-full">
                                                <Phone className="h-4 w-4 mr-2" />
                                                Call Driver
                                            </Button>
                                            <Button variant="outline" className="w-full">
                                                Send Message
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Order Summary */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Restaurant</span>
                                            <span className="font-medium">{order.restaurant.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Address</span>
                                            <span className="font-medium text-right">{order.deliveryAddress}</span>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            {order.items.map((item: any, index: number) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        {item.quantity}× {item.name}
                                                    </span>
                                                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span className="text-green-700">₦{order.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full" onClick={handleContactRestaurant}>
                                            Contact Restaurant
                                        </Button>
                                        <Button variant="outline" className="w-full">
                                            Change Delivery Instructions
                                        </Button>
                                        {!isDelivered && (
                                            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                                Report Issue
                                            </Button>
                                        )}
                                        <Link href={`/dashboard/orders/${id}`} className="block">
                                            <Button variant="ghost" className="w-full">
                                                View Full Order Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}