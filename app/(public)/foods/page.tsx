// app/(public)/foods/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, Clock, Loader2, Flame, Leaf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { FoodItem } from '@/types/food';
import { ArrowLeft } from 'lucide-react';
import { getDbCategory } from '@/utils/categoryMappings';

// Categories that match your DATABASE categories (not homepage display names)
const categories = [
    { value: 'all', label: 'All Foods' },
    { value: 'Traditional', label: 'Traditional' },
    { value: 'Rice Dishes', label: 'Rice Dishes' },
    { value: 'Swallow', label: 'Swallow' },
    { value: 'Soups & Stews', label: 'Soups & Stews' },
    { value: 'Protein', label: 'Protein' },
    { value: 'Snacks', label: 'Snacks' },
    { value: 'Drinks', label: 'Drinks' },
    { value: 'Desserts', label: 'Desserts' },
    { value: 'Breakfast', label: 'Breakfast' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' },
    { value: 'Special', label: 'Special' }
];

// FoodImage component remains the same
const FoodImage = ({ src, alt, foodName }: { src: string; alt: string; foodName: string }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) {
            setHasError(true);
            return;
        }

        // Normalize the image path
        let finalSrc = src;

        // Check if it's external URL
        if (src.startsWith('http')) {
            finalSrc = src;
        }
        // If it's a local path WITHOUT leading slash
        else if (src.startsWith('images/')) {
            finalSrc = `/${src}`;
        }
        // If it's a local path WITH leading slash
        else if (src.startsWith('/images/')) {
            finalSrc = src;
        }
        // If it's just a filename
        else if (!src.includes('/')) {
            finalSrc = `/images/foods/${src}`;
        }

        setImgSrc(finalSrc);
        setHasError(false);
    }, [src]);

    if (hasError || !imgSrc) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                <div className="text-center p-4">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🍽️</span>
                    </div>
                    <p className="text-green-600 font-semibold">{foodName}</p>
                    <p className="text-green-400 text-sm mt-1">Image not available</p>
                </div>
            </div>
        );
    }

    if (imgSrc.startsWith('http')) {
        return (
            <div className="w-full h-full relative">
                <Image
                    src={imgSrc}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
        />
    );
};

export default function FoodsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get('restaurant');
    const restaurantName = searchParams.get('restaurantName');
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

    // Fetch foods from API with category mapping
    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                // Add restaurant filter if provided
                if (restaurantId) {
                    params.append('restaurant', restaurantId);
                }

                // FIX: Handle category mapping from homepage slugs to database categories
                if (category !== 'all') {
                    // Check if category is a slug (like "local-delicacies") or direct category name
                    let dbCategory = category;

                    // If category contains hyphens, it's likely a slug from homepage
                    if (category.includes('-')) {
                        const mappedCategory = getDbCategory(category);
                        if (mappedCategory) {
                            dbCategory = mappedCategory;
                            console.log(`Mapped "${category}" → "${dbCategory}"`);
                        }
                    }

                    params.append('category', dbCategory);
                }

                if (search) params.append('search', search);
                params.append('sortBy', sortBy);

                console.log(`Fetching foods with params: ${params.toString()}`);

                const response = await fetch(`/api/foods?${params.toString()}`);
                const data = await response.json();

                if (data.success) {
                    setFoods(data.foods);
                    console.log(`Found ${data.foods.length} foods for category: ${category}`);
                } else {
                    toast.error('Failed to load foods');
                }
            } catch (error) {
                console.error('Error fetching foods:', error);
                toast.error('Failed to load foods');
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, [category, search, sortBy, restaurantId]);

    const handleAddToCart = (food: FoodItem) => {
        if (!user) {
            toast.error('Please sign in to add items to cart');
            router.push(`/signin?redirect=/foods`);
            return;
        }

        addToCart({
            id: food.id,
            name: food.name,
            price: food.price,
            quantity: 1,
            image: food.images?.[0] || '/images/food-placeholder.jpg',
            restaurantId: food.restaurantId,
            restaurantName: food.restaurantName
        });

        toast.success(`Added ${food.name} to cart!`, {
            duration: 3000,
            action: {
                label: 'View Cart',
                onClick: () => router.push('/dashboard/cart')
            }
        });
    };

    const getSpicyLevelText = (level: number) => {
        switch (level) {
            case 0: return 'Not Spicy';
            case 1: return 'Mild';
            case 2: return 'Medium';
            case 3: return 'Spicy';
            default: return '';
        }
    };

    const getSpicyLevelColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-green-100 text-green-800';
            case 1: return 'bg-yellow-100 text-yellow-800';
            case 2: return 'bg-orange-100 text-orange-800';
            case 3: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">
                        {restaurantName ? `${restaurantName} Menu` : 'Osogbo Delicacies'}
                    </h1>
                    <p className="text-lg text-green-100">
                        {restaurantName
                            ? `Discover authentic dishes from ${restaurantName}`
                            : 'Discover authentic Osogbo cuisine from local restaurants'
                        }
                    </p>

                    {restaurantId && (
                        <Link
                            href="/foods"
                            className="inline-flex items-center mt-3 text-green-200 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            View All Foods
                        </Link>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Search for food, restaurants, or dishes..."
                            className="pl-10 py-6 text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setSearch('')}
                                type="button"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full md:w-48 py-6">
                            <Filter className="h-5 w-5 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Sort Filter */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-48 py-6">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="price">Price: Low to High</SelectItem>
                            <SelectItem value="-price">Price: High to Low</SelectItem>
                            <SelectItem value="prepTime">Fastest Preparation</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Results Count */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {restaurantName
                                ? `${restaurantName}'s Menu`
                                : category === 'all'
                                    ? 'All Foods'
                                    : categories.find(c => c.value === category)?.label || category
                            }
                        </h2>
                        <p className="text-gray-600">
                            {loading ? 'Loading...' : `${foods.length} ${foods.length === 1 ? 'item' : 'items'} found`}
                            {restaurantName && ` from ${restaurantName}`}
                        </p>
                    </div>
                    {search && (
                        <Button
                            variant="outline"
                            onClick={() => setSearch('')}
                            className="border-gray-300"
                        >
                            Clear Search
                        </Button>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-green-600 mr-4" />
                        <p className="text-gray-600 text-lg">Loading delicious foods...</p>
                    </div>
                ) : foods.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No foods found</h3>
                        <p className="text-gray-600 mb-6">
                            {search ? `No results for "${search}"` : 'No foods available in this category'}
                            {category !== 'all' && category.includes('-') && (
                                <div className="mt-2 text-sm text-amber-600">
                                    Try searching for: {getDbCategory(category) || category}
                                </div>
                            )}
                        </p>
                        <Button
                            onClick={() => {
                                setSearch('');
                                setCategory('all');
                            }}
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                            View All Foods
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Food Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {foods.map((food) => (
                                <Card key={food.id} className="overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                                    {/* Image Section */}
                                    <div className="relative h-48 w-full">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />

                                        {/* Food Image */}
                                        <div className="w-full h-full">
                                            <FoodImage
                                                src={food.images?.[0] || ''}
                                                alt={food.name}
                                                foodName={food.name}
                                            />
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                                            {food.isPopular && (
                                                <Badge className="bg-amber-500 hover:bg-amber-600">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Popular
                                                </Badge>
                                            )}
                                            {food.spicyLevel >= 0 && (
                                                <Badge className={getSpicyLevelColor(food.spicyLevel)}>
                                                    <Flame className="h-3 w-3 mr-1" />
                                                    {getSpicyLevelText(food.spicyLevel)}
                                                </Badge>
                                            )}
                                            {food.isVegetarian && (
                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                    <Leaf className="h-3 w-3 mr-1" />
                                                    Vegetarian
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Discount Badge */}
                                        {food.discount && food.discount > 0 && (
                                            <Badge className="absolute top-3 right-3 z-20 bg-red-500 hover:bg-red-600">
                                                -{food.discount}%
                                            </Badge>
                                        )}

                                        {/* Category Badge */}
                                        <Badge className="absolute bottom-3 left-3 z-20 bg-white/90 text-gray-800 hover:bg-white">
                                            {food.category}
                                        </Badge>
                                    </div>

                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl line-clamp-1">{food.name}</CardTitle>
                                                <CardDescription className="text-sm">
                                                    <Link
                                                        href={`/restaurants/${food.restaurantId}`}
                                                        className="text-green-600 hover:text-green-700 hover:underline"
                                                    >
                                                        {food.restaurantName}
                                                    </Link>
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                                <span className="font-semibold">{food.rating.toFixed(1)}</span>
                                                <span className="text-xs text-gray-500 ml-1">({food.ratingCount})</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-4 flex-1">
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{food.description}</p>

                                        {/* Ingredients Preview */}
                                        {food.ingredients && food.ingredients.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {food.ingredients.slice(0, 3).map((ingredient, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {ingredient}
                                                        </Badge>
                                                    ))}
                                                    {food.ingredients.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{food.ingredients.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {food.tags && food.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {food.tags.slice(0, 3).map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div className="flex items-center justify-between text-gray-500 text-sm">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                <span>{food.preparationTime} min</span>
                                            </div>
                                            {food.calories && (
                                                <span>🔥 {food.calories} cal</span>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex justify-between items-center pt-4 border-t">
                                        <div>
                                            {food.discount && food.discount > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-green-700">
                                                        ₦{food.price.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ₦{food.originalPrice?.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-2xl font-bold text-green-700">
                                                    ₦{food.price.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleAddToCart(food)}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={!food.available}
                                        >
                                            {food.available ? 'Add to Cart' : 'Out of Stock'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Back to Home */}
            <div className="container mx-auto px-4 py-8 text-center">
                <Link href="/" className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}