// app/(auth)/profile/edit/page.tsx - COMPLETE VERSION
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    User,
    Mail,
    Phone,
    MapPin,
    ArrowLeft,
    Save,
    Camera,
    Shield,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    profileImage?: string;
    notifications: boolean;
    marketingEmails: boolean;
}

export default function EditProfilePage() {
    const router = useRouter();
    const { user: authUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState<UserProfile>({
        _id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'user',
        notifications: true,
        marketingEmails: true,
        profileImage: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!authUser) {
            router.push('/signin?redirect=/profile/edit');
            return;
        }

        fetchProfile();
    }, [authUser, router]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/profile', {
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.user) {
                setFormData({
                    _id: data.user._id || data.user.id || '',
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    address: data.user.address || '',
                    role: data.user.role || 'user',
                    profileImage: data.user.profileImage || '',
                    notifications: data.user.notifications !== false,
                    marketingEmails: data.user.marketingEmails !== false
                });
            } else {
                toast.error(data.message || 'Failed to load profile');
                router.push('/profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    notifications: formData.notifications,
                    marketingEmails: formData.marketingEmails
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update user in auth context
                if (updateUser) {
                    await updateUser({
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                        email: formData.email
                    });
                }

                toast.success('Profile updated successfully!');

                // Redirect back to profile page
                setTimeout(() => {
                    router.push('/profile');
                }, 1000);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await fetch('/api/auth/profile/image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setFormData(prev => ({ ...prev, profileImage: data.imageUrl }));

                // Update user in context
                if (updateUser) {
                    await updateUser({ profileImage: data.imageUrl });
                }

                toast.success('Profile image updated!');
            } else {
                toast.error(data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const getUserInitials = () => {
        if (!formData.name) return 'U';
        return formData.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Link href="/profile">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Profile
                                    </Button>
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                            <p className="text-gray-600">Update your personal information</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Left Column - Profile & Basic Info */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Profile Image Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-emerald-600" />
                                            Profile Picture
                                        </CardTitle>
                                        <CardDescription>Upload a clear photo of yourself</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-6">
                                            <div className="relative">

                                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                                    {formData.profileImage ? (
                                                        <AvatarImage
                                                            src={formData.profileImage}
                                                            alt={formData.name}
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                // If image fails to load, show fallback
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-2xl font-bold">
                                                        {getUserInitials()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                                    {formData.profileImage ? (
                                                        <AvatarImage
                                                            src={formData.profileImage}
                                                            alt={formData.name}
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-2xl font-bold">
                                                        {getUserInitials()}
                                                    </AvatarFallback>
                                                </Avatar> */}
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="profileImage" className="mb-2 block">
                                                    Upload New Photo
                                                </Label>
                                                <Input
                                                    id="profileImage"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="cursor-pointer"
                                                    disabled={uploadingImage}
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    JPG, PNG or GIF. Max size 5MB.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-emerald-600" />
                                            Basic Information
                                        </CardTitle>
                                        <CardDescription>Your personal details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    className={errors.name ? 'border-red-500' : ''}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="bg-gray-50"
                                                />
                                                <p className="text-xs text-gray-500">Email cannot be changed</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+234 801 234 5678"
                                                    className={errors.phone ? 'border-red-500' : ''}
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="role">Account Type</Label>
                                                <Input
                                                    id="role"
                                                    value={formData.role}
                                                    disabled
                                                    className="bg-gray-50 capitalize"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Delivery Address</Label>
                                            <Textarea
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Enter your complete delivery address"
                                                rows={3}
                                            />
                                            <p className="text-xs text-gray-500">
                                                We'll use this address for food deliveries
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Actions & Tips */}
                            <div className="space-y-6">
                                {/* Action Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Save Changes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
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

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push('/profile')}
                                        >
                                            Cancel
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Security Info */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-3">
                                            <Shield className="h-6 w-6 text-emerald-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">Your Data is Secure</h4>
                                                <p className="text-sm text-gray-600">
                                                    All your information is encrypted and protected.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}