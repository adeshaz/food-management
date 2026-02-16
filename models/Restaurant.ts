import mongoose, { Schema } from 'mongoose';

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    cuisineType: {
        type: String,
        required: true,
        enum: ['nigerian', 'chinese', 'italian', 'indian', 'mexican', 'american', 'continental', 'fast-food']
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    images: [{
        type: String,
        default: []
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    deliveryTime: {
        type: Number,
        default: 30 // minutes
    },
    minimumOrder: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;