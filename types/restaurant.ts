// types/restaurant.ts - COMPLETELY UPDATED TO MATCH YOUR MODEL
export interface Restaurant {
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
        email?: string;
        website?: string;
    };
    openingHours: Record<string, string> | {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
        general?: string;
    };
    images: string[];
    rating: number;
    deliveryTime: number;
    minimumOrder: number;
    featured: boolean;
    createdAt?: string;
    updatedAt?: string;
    // For backward compatibility only
    menu?: any[];
    image?: string;
    deliveryAvailable?: boolean;
}

export interface MenuItem {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available: boolean;
    ingredients: string[];
    preparationTime: number;
    spicyLevel: 'mild' | 'medium' | 'hot';
}

export interface CreateRestaurantInput {
    name: string;
    description: string;
    cuisineType: string;
    address: {
        street: string;
        city: string;
        state: string;
    };
    contact: {
        phone: string;
        email?: string;
        website?: string;
    };
    openingHours: Record<string, string>;
    images: string[];
    deliveryTime: number;
    minimumOrder: number;
    featured?: boolean;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> { }