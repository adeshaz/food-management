// app/admin/restaurants/[id]/edit/page.tsx 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    cuisineType: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    openingHours: any;
    deliveryTime: number;
    minimumOrder: number;
    rating: number;
    featured: boolean;
    images: string[];
}

const CUISINE_TYPES = [
    'nigerian', 'chinese', 'italian', 'indian', 
    'mexican', 'american', 'continental', 'fast-food'
];

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [openingHours, setOpeningHours] = useState<any>({});

    useEffect(() => {
        // Convert async params to sync
        const loadParams = async () => {
            const { id } = await params;
            if (id) {
                fetchRestaurant(id);
            }
        };
        loadParams();
    }, [params]);

    const fetchRestaurant = async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/restaurants/${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                setRestaurant(data.data);
                // Parse opening hours
                if (data.data.openingHours) {
                    if (typeof data.data.openingHours === 'string') {
                        // Handle string format
                        setOpeningHours({ general: data.data.openingHours });
                    } else if (data.data.openingHours.general) {
                        // Handle general format
                        setOpeningHours({ general: data.data.openingHours.general });
                    } else {
                        // Handle detailed format
                        setOpeningHours(data.data.openingHours);
                    }
                } else {
                    // Default opening hours
                    setOpeningHours({
                        monday: { open: '08:00', close: '22:00' },
                        tuesday: { open: '08:00', close: '22:00' },
                        wednesday: { open: '08:00', close: '22:00' },
                        thursday: { open: '08:00', close: '22:00' },
                        friday: { open: '08:00', close: '23:00' },
                        saturday: { open: '09:00', close: '23:00' },
                        sunday: { open: '10:00', close: '21:00' }
                    });
                }
            } else {
                toast.error('Restaurant not found');
                router.push('/admin/restaurants');
            }
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            toast.error('Failed to load restaurant');
            router.push('/admin/restaurants');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant) return;

        try {
            setSaving(true);
            
            // Prepare data for API
            const payload = {
                ...restaurant,
                openingHours: openingHours
            };

            const response = await fetch(`/api/restaurants/${restaurant._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Restaurant updated successfully!');
                router.push('/admin/restaurants');
                router.refresh();
            } else {
                throw new Error(data.message || 'Failed to update restaurant');
            }
        } catch (error: any) {
            console.error('Error updating restaurant:', error);
            toast.error(error.message || 'Failed to update restaurant');
        } finally {
            setSaving(false);
        }
    };

    const updateOpeningHours = (day: string, field: 'open' | 'close', value: string) => {
        setOpeningHours({
            ...openingHours,
            [day]: {
                ...openingHours[day],
                [field]: value
            }
        });
    };

    const getDayHours = (day: string) => {
        if (openingHours[day]) {
            return openingHours[day];
        } else if (openingHours.general) {
            // Extract times from general format "08:00 - 22:00"
            const [open, close] = openingHours.general.split('-').map((t: string) => t.trim());
            return { open, close };
        }
        return { open: '08:00', close: '22:00' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p>Loading restaurant...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
                    <Button onClick={() => router.push('/admin/restaurants')}>
                        Back to Restaurants
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/restaurants">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Restaurants
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold">Edit Restaurant</h1>
                    <p className="text-gray-600">Update restaurant details</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Restaurant Name *</Label>
                                        <Input
                                            id="name"
                                            value={restaurant.name}
                                            onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={restaurant.description}
                                            onChange={(e) => setRestaurant({...restaurant, description: e.target.value})}
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cuisineType">Cuisine Type *</Label>
                                            <select
                                                id="cuisineType"
                                                value={restaurant.cuisineType}
                                                onChange={(e) => setRestaurant({...restaurant, cuisineType: e.target.value})}
                                                className="w-full px-3 py-2 border rounded-md"
                                                required
                                            >
                                                {CUISINE_TYPES.map(type => (
                                                    <option key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryTime">Delivery Time (minutes) *</Label>
                                            <Input
                                                id="deliveryTime"
                                                type="number"
                                                min="0"
                                                value={restaurant.deliveryTime}
                                                onChange={(e) => setRestaurant({...restaurant, deliveryTime: parseInt(e.target.value)})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minimumOrder">Minimum Order (₦) *</Label>
                                            <Input
                                                id="minimumOrder"
                                                type="number"
                                                min="0"
                                                value={restaurant.minimumOrder}
                                                onChange={(e) => setRestaurant({...restaurant, minimumOrder: parseInt(e.target.value)})}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="rating">Rating (0-5)</Label>
                                            <Input
                                                id="rating"
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={restaurant.rating || 4.0}
                                                onChange={(e) => setRestaurant({...restaurant, rating: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input
                                                id="phone"
                                                value={restaurant.contact?.phone || ''}
                                                onChange={(e) => setRestaurant({
                                                    ...restaurant, 
                                                    contact: {...restaurant.contact, phone: e.target.value}
                                                })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={restaurant.contact?.email || ''}
                                                onChange={(e) => setRestaurant({
                                                    ...restaurant, 
                                                    contact: {...restaurant.contact, email: e.target.value}
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            value={restaurant.contact?.website || ''}
                                            onChange={(e) => setRestaurant({
                                                ...restaurant, 
                                                contact: {...restaurant.contact, website: e.target.value}
                                            })}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Address</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="street">Street Address *</Label>
                                        <Input
                                            id="street"
                                            value={restaurant.address?.street || ''}
                                            onChange={(e) => setRestaurant({
                                                ...restaurant, 
                                                address: {...restaurant.address, street: e.target.value}
                                            })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={restaurant.address?.city || ''}
                                                onChange={(e) => setRestaurant({
                                                    ...restaurant, 
                                                    address: {...restaurant.address, city: e.target.value}
                                                })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={restaurant.address?.state || ''}
                                                onChange={(e) => setRestaurant({
                                                    ...restaurant, 
                                                    address: {...restaurant.address, state: e.target.value}
                                                })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Featured Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="featured" className="cursor-pointer">
                                            Featured Restaurant
                                        </Label>
                                        <Switch
                                            id="featured"
                                            checked={restaurant.featured}
                                            onCheckedChange={(checked) => setRestaurant({...restaurant, featured: checked})}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Opening Hours */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Opening Hours</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="mb-3">
                                        <Label className="text-sm text-gray-500">Format: HH:MM (24-hour)</Label>
                                    </div>
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                        const hours = getDayHours(day);
                                        return (
                                            <div key={day} className="flex items-center ">
                                                <Label className="capitalize w-16 text-xs text-gray-600">{day}</Label>
                                                <div className="flex items-center">
                                                    <Input
                                                        type="time"
                                                        value={hours.open || '08:00'}
                                                        onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                                                        className=" w-25 h-8 text-xs px-2"
                                                    />
                                                    <span>to</span>
                                                    <Input
                                                        type="time"
                                                        value={hours.close || '22:00'}
                                                        onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                                                        className="w-24"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Image URLs (one per line)</Label>
                                        <Textarea
                                            value={(restaurant.images || []).join('\n')}
                                            onChange={(e) => setRestaurant({
                                                ...restaurant, 
                                                images: e.target.value.split('\n').filter(url => url.trim() !== '')
                                            })}
                                            rows={4}
                                            placeholder="https://example.com/image1.jpg"
                                        />
                                        <p className="text-sm text-gray-500">Enter one image URL per line</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" size="lg" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}