import mongoose, { Schema } from 'mongoose';

const cartItemSchema = new Schema({
    foodItem: {
        type: Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
});

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Calculate total before saving
cartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;