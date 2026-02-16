// app/admin/restaurants/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Upload,
    X,
    MapPin,
    Phone,
    Mail,
    Clock,
    DollarSign,
    Star,
    Loader2
} from 'lucide-react';

const cuisineTypes = [
    'nigerian', 'chinese', 'italian', 'indian', 'mexican',
    'american', 'continental', 'fast-food', 'vegetarian', 'african'
];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function NewRestaurantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(['']);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cuisineType: 'nigerian',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        },
        contact: {
            phone: '',
            email: ''
        },
        openingHours: days.reduce((acc, day) => ({
            ...acc,
            [day]: { open: '09:00', close: '22:00' }
        }), {} as Record<string, { open: string; close: string }>),
        images: [] as string[],
        rating: 4.5,
        deliveryTime: 30,
        minimumOrder: 1000,
        featured: false,
        isActive: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    images: images.filter(img => img.trim() !== ''),
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Restaurant created successfully');
                router.push('/admin/restaurants');
            } else {
                toast.error(data.message || 'Failed to create restaurant');
            }
        } catch (error) {
            console.error('Error creating restaurant:', error);
            toast.error('Failed to create restaurant');
        } finally {
            setLoading(false);
        }
    };

    const addImageField = () => {
        setImages([...images, '']);
    };

    const removeImageField = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const updateImage = (index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Restaurants
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Restaurant</CardTitle>
                        <CardDescription>
                            Fill in the details to add a new restaurant to your platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Basic Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Restaurant Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Taste of Osogbo"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cuisineType">Cuisine Type *</Label>
                                        <select
                                            id="cuisineType"
                                            value={formData.cuisineType}
                                            onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        >
                                            {cuisineTypes.map((cuisine) => (
                                                <option key={cuisine} value={cuisine} className="capitalize">
                                                    {cuisine}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the restaurant, its specialties, and unique features..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Contact Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            <Phone className="inline h-4 w-4 mr-2" />
                                            Phone Number *
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={formData.contact.phone}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contact: { ...formData.contact, phone: e.target.value }
                                            })}
                                            placeholder="e.g., 08012345678"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            <Mail className="inline h-4 w-4 mr-2" />
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.contact.email}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contact: { ...formData.contact, email: e.target.value }
                                            })}
                                            placeholder="e.g., contact@restaurant.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">
                                    <MapPin className="inline h-5 w-5 mr-2" />
                                    Location
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="street">Street Address *</Label>
                                        <Input
                                            id="street"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value }
                                            })}
                                            placeholder="e.g., 123 Main Street"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value }
                                            })}
                                            placeholder="e.g., Osogbo"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value }
                                            })}
                                            placeholder="e.g., Osun State"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">ZIP Code</Label>
                                        <Input
                                            id="zipCode"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, zipCode: e.target.value }
                                            })}
                                            placeholder="e.g., 230001"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Restaurant Images</h3>

                                <div className="space-y-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={image}
                                                onChange={(e) => updateImage(index, e.target.value)}
                                                placeholder="Image URL (e.g., /images/restaurants/example.jpg)"
                                            />
                                            {images.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeImageField(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addImageField}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Add Another Image
                                    </Button>
                                </div>
                            </div>

                            {/* Business Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Business Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryTime">
                                            <Clock className="inline h-4 w-4 mr-2" />
                                            Delivery Time (minutes)
                                        </Label>
                                        <Input
                                            id="deliveryTime"
                                            type="number"
                                            value={formData.deliveryTime}
                                            onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) || 30 })}
                                            min="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minimumOrder">
                                            <DollarSign className="inline h-4 w-4 mr-2" />
                                            Minimum Order (₦)
                                        </Label>
                                        <Input
                                            id="minimumOrder"
                                            type="number"
                                            value={formData.minimumOrder}
                                            onChange={(e) => setFormData({ ...formData, minimumOrder: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rating">
                                            <Star className="inline h-4 w-4 mr-2" />
                                            Rating (0-5)
                                        </Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            step="0.1"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="featured"
                                            checked={formData.featured}
                                            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                                        />
                                        <Label htmlFor="featured" className="cursor-pointer">
                                            Mark as Featured Restaurant
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                        />
                                        <Label htmlFor="isActive" className="cursor-pointer">
                                            Restaurant is Active
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Opening Hours</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {days.map((day) => (
                                        <div key={day} className="space-y-2">
                                            <Label className="capitalize">{day}</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="time"
                                                    value={formData.openingHours[day].open}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        openingHours: {
                                                            ...formData.openingHours,
                                                            [day]: { ...formData.openingHours[day], open: e.target.value }
                                                        }
                                                    })}
                                                />
                                                <span className="self-center">to</span>
                                                <Input
                                                    type="time"
                                                    value={formData.openingHours[day].close}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        openingHours: {
                                                            ...formData.openingHours,
                                                            [day]: { ...formData.openingHours[day], close: e.target.value }
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Create Restaurant
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}