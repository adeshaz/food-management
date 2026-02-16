// types/food.ts
export interface FoodItem {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    category: string;
    restaurantId: string;
    restaurantName: string; // Added restaurantName field
    images: string[];
    preparationTime: number;
    spicyLevel: number;
    isVegetarian: boolean;
    isPopular: boolean;
    rating: number;
    ratingCount: number;
    ingredients: string[];
    tags: string[];
    calories?: number;
    available: boolean;
}

export interface CreateFoodItemInput {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    restaurant: string;
    ingredients: string[];
    preparationTime: number;
    spicyLevel: 'mild' | 'medium' | 'hot';
    tags: string[];
}

export interface UpdateFoodItemInput extends Partial<CreateFoodItemInput> { }