// app/admin/foods/[id]/edit/page.tsx - UPDATED FOR NEXT.JS 14
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface FoodItem {
    _id: string;
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    category: string;
    restaurantId: string;
    restaurantName: string;
    images: string[];
    ingredients: string[];
    preparationTime: number;
    spicyLevel: number;
    isVegetarian: boolean;
    isPopular: boolean;
    rating: number;
    ratingCount: number;
    tags: string[];
    available: boolean;
}

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

export default function EditFoodPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [food, setFood] = useState<FoodItem | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {
        // Convert async params to sync
        const loadParams = async () => {
            const { id } = await params;
            if (id) {
                fetchFood(id);
                fetchRestaurants();
            }
        };
        loadParams();
    }, [params]);

    const fetchFood = async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/foods/${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                // Ensure we have the correct field names
                const foodData = {
                    ...data.data,
                    id: data.data._id || data.data.id,
                    _id: data.data._id || data.data.id,
                    isVegetarian: data.data.isVegetarian || false,
                    isPopular: data.data.isPopular || false,
                    images: data.data.images || [],
                    ingredients: data.data.ingredients || [],
                    tags: data.data.tags || [],
                    available: data.data.available !== false
                };
                setFood(foodData);
            } else {
                toast.error('Food item not found');
                router.push('/admin/foods');
            }
        } catch (error) {
            console.error('Error fetching food:', error);
            toast.error('Failed to load food item');
            router.push('/admin/foods');
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/restaurants');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setRestaurants(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!food) return;

        try {
            setSaving(true);

            // Prepare data for API - match your FoodItem model
            const payload = {
                name: food.name,
                description: food.description,
                price: food.price,
                originalPrice: food.originalPrice,
                discount: food.discount,
                category: food.category,
                restaurantId: food.restaurantId,
                restaurantName: food.restaurantName,
                images: food.images,
                ingredients: food.ingredients,
                preparationTime: food.preparationTime,
                spicyLevel: food.spicyLevel,
                isVegetarian: food.isVegetarian,
                isPopular: food.isPopular,
                rating: food.rating,
                ratingCount: food.ratingCount,
                tags: food.tags,
                available: food.available
            };

            const response = await fetch(`/api/foods/${food.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Food item updated successfully!');
                router.push('/admin/foods');
                router.refresh();
            } else {
                throw new Error(data.message || 'Failed to update food item');
            }
        } catch (error: any) {
            console.error('Error updating food:', error);
            toast.error(error.message || 'Failed to update food item');
        } finally {
            setSaving(false);
        }
    };

    const addImage = () => {
        if (!food) return;
        setFood({ ...food, images: [...food.images, ''] });
    };

    const removeImage = (index: number) => {
        if (!food) return;
        const newImages = food.images.filter((_, i) => i !== index);
        setFood({ ...food, images: newImages });
    };

    const updateImage = (index: number, value: string) => {
        if (!food) return;
        const newImages = [...food.images];
        newImages[index] = value;
        setFood({ ...food, images: newImages });
    };

    const addIngredient = () => {
        if (!food) return;
        setFood({ ...food, ingredients: [...food.ingredients, ''] });
    };

    const removeIngredient = (index: number) => {
        if (!food) return;
        const newIngredients = food.ingredients.filter((_, i) => i !== index);
        setFood({ ...food, ingredients: newIngredients });
    };

    const updateIngredient = (index: number, value: string) => {
        if (!food) return;
        const newIngredients = [...food.ingredients];
        newIngredients[index] = value;
        setFood({ ...food, ingredients: newIngredients });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p>Loading food item...</p>
                </div>
            </div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Food item not found</h2>
                    <Button onClick={() => router.push('/admin/foods')}>
                        Back to Foods
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
                        <Link href="/admin/foods">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Foods
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold">Edit Food Item</h1>
                    <p className="text-gray-600">Update food item details</p>
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
                                        <Label htmlFor="name">Food Name *</Label>
                                        <Input
                                            id="name"
                                            value={food.name}
                                            onChange={(e) => setFood({ ...food, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={food.description}
                                            onChange={(e) => setFood({ ...food, description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (₦) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={food.price}
                                                onChange={(e) => setFood({ ...food, price: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="originalPrice">Original Price (₦)</Label>
                                            <Input
                                                id="originalPrice"
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={food.originalPrice || ''}
                                                onChange={(e) => setFood({
                                                    ...food,
                                                    originalPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="discount">Discount (%)</Label>
                                            <Input
                                                id="discount"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={food.discount || ''}
                                                onChange={(e) => setFood({
                                                    ...food,
                                                    discount: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="restaurantId">Restaurant *</Label>
                                            <select
                                                id="restaurantId"
                                                value={food.restaurantId}
                                                onChange={(e) => {
                                                    const selectedRestaurant = restaurants.find(r => r._id === e.target.value);
                                                    setFood({
                                                        ...food,
                                                        restaurantId: e.target.value,
                                                        restaurantName: selectedRestaurant?.name || food.restaurantName
                                                    });
                                                }}
                                                className="w-full px-3 py-2 border rounded-md"
                                                required
                                            >
                                                <option value="">Select Restaurant</option>
                                                {restaurants.map(restaurant => (
                                                    <option key={restaurant._id} value={restaurant._id}>
                                                        {restaurant.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <select
                                                id="category"
                                                value={food.category}
                                                onChange={(e) => setFood({ ...food, category: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md"
                                                required
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                                            <Input
                                                id="preparationTime"
                                                type="number"
                                                min="0"
                                                value={food.preparationTime}
                                                onChange={(e) => setFood({ ...food, preparationTime: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="spicyLevel">Spicy Level (0-3)</Label>
                                            <Input
                                                id="spicyLevel"
                                                type="number"
                                                min="0"
                                                max="3"
                                                value={food.spicyLevel}
                                                onChange={(e) => setFood({ ...food, spicyLevel: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {food.images.map((image, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={image}
                                                onChange={(e) => updateImage(index, e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeImage(index)}
                                                disabled={food.images.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addImage}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Image
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Ingredients */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ingredients</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {food.ingredients.map((ingredient, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={ingredient}
                                                onChange={(e) => updateIngredient(index, e.target.value)}
                                                placeholder="e.g., Rice, Chicken, Spices"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeIngredient(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addIngredient}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Ingredient
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Status & Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status & Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="available" className="cursor-pointer">
                                            Available
                                        </Label>
                                        <Switch
                                            id="available"
                                            checked={food.available}
                                            onCheckedChange={(checked) => setFood({ ...food, available: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="isVegetarian" className="cursor-pointer">
                                            Vegetarian
                                        </Label>
                                        <Switch
                                            id="isVegetarian"
                                            checked={food.isVegetarian}
                                            onCheckedChange={(checked) => setFood({ ...food, isVegetarian: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="isPopular" className="cursor-pointer">
                                            Popular
                                        </Label>
                                        <Switch
                                            id="isPopular"
                                            checked={food.isPopular}
                                            onCheckedChange={(checked) => setFood({ ...food, isPopular: checked })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tags */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tags</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Tags (comma separated)</Label>
                                        <Input
                                            value={food.tags.join(', ')}
                                            onChange={(e) => setFood({
                                                ...food,
                                                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                                            })}
                                            placeholder="jollof, rice, chicken, spicy"
                                        />
                                        <p className="text-sm text-gray-500">Separate tags with commas</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ratings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ratings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="rating">Rating (0-5)</Label>
                                            <Input
                                                id="rating"
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={food.rating}
                                                onChange={(e) => setFood({ ...food, rating: parseFloat(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ratingCount">Rating Count</Label>
                                            <Input
                                                id="ratingCount"
                                                type="number"
                                                min="0"
                                                value={food.ratingCount}
                                                onChange={(e) => setFood({ ...food, ratingCount: parseInt(e.target.value) })}
                                            />
                                        </div>
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