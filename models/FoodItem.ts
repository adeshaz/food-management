

// models/FoodItem.ts - UPDATED WITH COMPREHENSIVE CATEGORIES
import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    restaurant: Schema.Types.ObjectId;
    restaurantName: string;
    images: string[];
    available: boolean;
    ingredients: string[];
    preparationTime: number;
    spicyLevel: number;
    calories?: number;
    rating: number;
    ratingCount: number;
    isPopular: boolean;
    isVegetarian: boolean;
    discount?: number;
    originalPrice?: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const foodItemSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        min: 0,
        max: 100
    },
    category: {
        type: String,
        required: true,
        enum: [
            'local-delicacies',
            'swallow-foods',
            'grills-and-bbq',
            'snacks-and-drinks',
            'rice-dishes',
            'soups-and-stews',
            'breakfast',
            'desserts',
            'proteins',
            'beverages',
            'appetizers',
            'specials'
        ],
        default: 'local-delicacies'
    },
    subcategory: {
        type: String,
        trim: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        default: []
    }],
    available: {
        type: Boolean,
        default: true
    },
    ingredients: [{
        type: String,
        default: []
    }],
    preparationTime: {
        type: Number,
        default: 20
    },
    spicyLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 0
    },
    calories: {
        type: Number,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        default: []
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
foodItemSchema.index({ restaurant: 1, category: 1 });
foodItemSchema.index({ restaurant: 1, available: 1 }); // NEW
foodItemSchema.index({ category: 1, available: 1 });
foodItemSchema.index({ isPopular: 1, rating: -1 });
foodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
foodItemSchema.index({ price: 1 });
foodItemSchema.index({ createdAt: -1 });

const FoodItem = mongoose.models.FoodItem as mongoose.Model<IFoodItem> ||
    mongoose.model<IFoodItem>('FoodItem', foodItemSchema);

export default FoodItem;