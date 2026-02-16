
// models/Order.ts - SIMPLIFIED WORKING VERSION
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    foodItem: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    notes?: string;
}

export interface IOrder extends Document {
    orderNumber: string;
    user: mongoose.Types.ObjectId;
    restaurant: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    deliveryAddress: string;
    contactPhone: string;
    contactName: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentMethod: 'cash' | 'card' | 'transfer';
    estimatedDeliveryTime: Date;
    statusHistory: {
        status: string;
        timestamp: Date;
        notes?: string;
    }[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
    foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    notes: { type: String }
});


const orderSchema = new Schema<IOrder>({

    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => `ORD-${Date.now().toString().slice(-9)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactName: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentNote: {
        type: String,
        default: ''
    },

    deliveredAt: {
        type: Date
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer'],
        required: true
    },
    estimatedDeliveryTime: {
        type: Date,
        default: () => {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            return now;
        }
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        notes: String
    }],
    notes: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);