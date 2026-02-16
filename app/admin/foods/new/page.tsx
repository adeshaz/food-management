// app/admin/foods/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Loader2, Plus, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Restaurant {
    _id: string;
    name: string;
    cuisineType: string;
}

const CATEGORIES = [
    { value: 'local-delicacies', label: 'Local Delicacies' },
    { value: 'swallow-foods', label: 'Swallow Foods' },
    { value: 'grills-and-bbq', label: 'Grills & BBQ' },
    { value: 'snacks-and-drinks', label: 'Snacks & Drinks' },
    { value: 'rice-dishes', label: 'Rice Dishes' },
    { value: 'soups-and-stews', label: 'Soups & Stews' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'proteins', label: 'Proteins' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'specials', label: 'Specials' }
];

export default function NewFoodPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'rice-dishes',
        restaurantId: '',
        images: [''],
        ingredients: [''],
        preparationTime: '30',
        spicyLevel: '0',
        isVegetarian: false,
        isPopular: false,
        tags: ''
    });

    // Fetch restaurants on mount
    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/restaurants');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                    setRestaurants(data.data);
                    // Auto-select first restaurant
                    setFormData(prev => ({
                        ...prev,
                        restaurantId: data.data[0]._id
                    }));
                } else {
                    toast.error('No restaurants found. Create a restaurant first.');
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            toast.error('Failed to load restaurants');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim() || !formData.price || !formData.category || !formData.restaurantId) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            toast.error('Price must be greater than 0');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category: formData.category,
                restaurantId: formData.restaurantId,
                images: formData.images.filter(img => img.trim() !== ''),
                ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
                preparationTime: parseInt(formData.preparationTime) || 30,
                spicyLevel: parseInt(formData.spicyLevel) || 0,
                isVegetarian: formData.isVegetarian,
                isPopular: formData.isPopular,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };

            console.log('Creating food with payload:', payload);

            const response = await fetch('/api/foods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Food item created successfully!');
                router.push('/admin/foods');
                router.refresh();
            } else {
                throw new Error(data.message || 'Failed to create food');
            }
        } catch (error: any) {
            console.error('Error creating food:', error);
            toast.error(error.message || 'Failed to create food item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header with back button */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/foods">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Foods
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold">Add New Food Item</h1>
                    <p className="text-gray-600">Create a new menu item for a restaurant</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Food Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Restaurant Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="restaurantId">Restaurant *</Label>
                                <Select
                                    value={formData.restaurantId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, restaurantId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a restaurant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {restaurants.map(restaurant => (
                                            <SelectItem key={restaurant._id} value={restaurant._id}>
                                                {restaurant.name} ({restaurant.cuisineType})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {restaurants.length === 0 && (
                                    <p className="text-sm text-red-500">
                                        No restaurants available. Please create a restaurant first.
                                    </p>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Food Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Jollof Rice with Chicken"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₦) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="3500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe the dish..."
                                    rows={3}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(category => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label>Image URLs (optional)</Label>
                                {formData.images.map((url, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <Input
                                            value={url}
                                            onChange={(e) => {
                                                const newImages = [...formData.images];
                                                newImages[index] = e.target.value;
                                                setFormData(prev => ({ ...prev, images: newImages }));
                                            }}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const newImages = formData.images.filter((_, i) => i !== index);
                                                    setFormData(prev => ({ ...prev, images: newImages }));
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Image URL
                                </Button>
                            </div>

                            {/* Preparation Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                                    <Input
                                        id="preparationTime"
                                        type="number"
                                        min="0"
                                        value={formData.preparationTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="spicyLevel">Spicy Level (0-3)</Label>
                                    <Input
                                        id="spicyLevel"
                                        type="number"
                                        min="0"
                                        max="3"
                                        value={formData.spicyLevel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, spicyLevel: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated, optional)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="jollof, rice, chicken, spicy"
                                />
                                <p className="text-sm text-gray-500">
                                    Separate tags with commas. Example: jollof, rice, chicken
                                </p>
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isVegetarian"
                                        checked={formData.isVegetarian}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="isVegetarian" className="cursor-pointer">
                                        Vegetarian
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isPopular"
                                        checked={formData.isPopular}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="isPopular" className="cursor-pointer">
                                        Mark as Popular
                                    </Label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || restaurants.length === 0}
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Food Item'
                                    )}
                                </Button>
                                {restaurants.length === 0 && (
                                    <p className="text-sm text-red-500 mt-2 text-center">
                                        Cannot create food without restaurants
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}