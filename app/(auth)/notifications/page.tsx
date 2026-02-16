// app/(auth)/notifications/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Bell,
    BellOff,
    ShoppingCart,
    Truck,
    Tag,
    CreditCard,
    MessageSquare,
    Star,
    Settings,
    ArrowLeft,
    Check,
    Trash2,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

const notifications = [
    {
        id: 1,
        type: 'order',
        icon: ShoppingCart,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        title: 'Order Confirmed',
        description: 'Your order #ORD-78945 has been confirmed and is being prepared.',
        time: '2 minutes ago',
        read: false,
    },
    {
        id: 2,
        type: 'delivery',
        icon: Truck,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Order Shipped',
        description: 'Your order #ORD-78944 is out for delivery with John.',
        time: '1 hour ago',
        read: false,
    },
    {
        id: 3,
        type: 'promotion',
        icon: Tag,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-100',
        title: 'Special Offer',
        description: 'Get 20% off on your next order with code: OSOGBO20',
        time: 'Yesterday',
        read: true,
    },
    {
        id: 4,
        type: 'payment',
        icon: CreditCard,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100',
        title: 'Payment Successful',
        description: 'Payment of ₦5,450 for order #ORD-78943 has been confirmed.',
        time: '2 days ago',
        read: true,
    },
    {
        id: 5,
        type: 'review',
        icon: Star,
        iconColor: 'text-pink-600',
        bgColor: 'bg-pink-100',
        title: 'Leave a Review',
        description: 'How was your recent order from Taste of Osogbo? Share your experience.',
        time: '3 days ago',
        read: true,
    },
];

export default function NotificationsPage() {
    const [notificationList, setNotificationList] = useState(notifications);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [promotionalEmails, setPromotionalEmails] = useState(false);

    const markAsRead = (id: number) => {
        setNotificationList(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        toast.success('Marked as read');
    };

    const markAllAsRead = () => {
        setNotificationList(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
        toast.success('All notifications marked as read');
    };

    const deleteNotification = (id: number) => {
        setNotificationList(prev => prev.filter(notif => notif.id !== id));
        toast.success('Notification deleted');
    };

    const clearAll = () => {
        setNotificationList([]);
        toast.success('All notifications cleared');
    };

    const unreadCount = notificationList.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <Link href="/profile" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Profile
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'You\'re all caught up!'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                onClick={markAllAsRead}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Mark all as read
                            </Button>
                        )}
                        {notificationList.length > 0 && (
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={clearAll}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Notifications List */}
                    <div className="md:col-span-2 space-y-4">
                        {notificationList.length > 0 ? (
                            notificationList.map((notification) => {
                                const Icon = notification.icon;
                                return (
                                    <Card key={notification.id} className={`border overflow-hidden ${!notification.read ? 'border-emerald-200 bg-emerald-50/50' : ''}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-full ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`h-6 w-6 ${notification.iconColor}`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-gray-900">{notification.title}</h3>
                                                                {!notification.read && (
                                                                    <Badge className="bg-emerald-500 text-white text-xs">
                                                                        New
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-600 mt-1">{notification.description}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-xs text-gray-400 flex items-center">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {notification.time}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {notification.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 ml-2">
                                                    {!notification.read && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => markAsRead(notification.id)}
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                                    <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Settings Panel */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-emerald-600" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>Control how you receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="font-medium">Email Notifications</Label>
                                            <p className="text-sm text-gray-500">Receive order updates via email</p>
                                        </div>
                                        <Switch
                                            checked={emailNotifications}
                                            onCheckedChange={setEmailNotifications}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="font-medium">Push Notifications</Label>
                                            <p className="text-sm text-gray-500">Get alerts on your device</p>
                                        </div>
                                        <Switch
                                            checked={pushNotifications}
                                            onCheckedChange={setPushNotifications}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="font-medium">Promotional Emails</Label>
                                            <p className="text-sm text-gray-500">Special offers and discounts</p>
                                        </div>
                                        <Switch
                                            checked={promotionalEmails}
                                            onCheckedChange={setPromotionalEmails}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                    Save Preferences
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Bell className="h-8 w-8" />
                                    <div>
                                        <h4 className="font-bold mb-2">Stay Updated</h4>
                                        <p className="text-emerald-100 text-sm">
                                            Never miss important updates about your orders, deliveries, and exclusive offers.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}