// app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Save, Bell, Shield, User, Mail, Phone, MapPin } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notifications: {
            email: true,
            sms: true,
            orderUpdates: true,
            promotional: false
        },
        privacy: {
            showProfile: true,
            shareData: false,
            analytics: true
        }
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            }));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                await updateUser(result.data);
                toast.success('Settings saved successfully');
            } else {
                toast.error(result.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your account preferences</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Profile */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+234 801 234 5678"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Delivery Address</Label>
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Enter your default delivery address"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription>
                                        Choose what notifications you want to receive
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="email-notifications">Email Notifications</Label>
                                            <p className="text-sm text-gray-500">Receive updates via email</p>
                                        </div>
                                        <Switch
                                            id="email-notifications"
                                            checked={formData.notifications.email}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    notifications: { ...formData.notifications, email: checked }
                                                })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                                            <p className="text-sm text-gray-500">Receive updates via SMS</p>
                                        </div>
                                        <Switch
                                            id="sms-notifications"
                                            checked={formData.notifications.sms}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    notifications: { ...formData.notifications, sms: checked }
                                                })
                                            }
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="order-updates">Order Updates</Label>
                                            <p className="text-sm text-gray-500">Get notified about order status</p>
                                        </div>
                                        <Switch
                                            id="order-updates"
                                            checked={formData.notifications.orderUpdates}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    notifications: { ...formData.notifications, orderUpdates: checked }
                                                })
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Actions */}
                        <div className="space-y-6">
                            {/* Privacy */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Privacy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="show-profile">Show Profile</Label>
                                            <p className="text-sm text-gray-500">Display your profile to restaurants</p>
                                        </div>
                                        <Switch
                                            id="show-profile"
                                            checked={formData.privacy.showProfile}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    privacy: { ...formData.privacy, showProfile: checked }
                                                })
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Save Button */}
                            <Card>
                                <CardContent className="p-6">
                                    <Button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-3 text-center">
                                        Your preferences will be updated immediately
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