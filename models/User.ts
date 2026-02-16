// models/User.ts - COMPLETE UPDATED VERSION
import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  role: string;
  verified?: boolean;
  profileImage?: string; // ✅ Add this
  notifications?: boolean; // ✅ Add this
  marketingEmails?: boolean; // ✅ Add this
  cart: any[];
  createdAt: Date;
  updatedAt: Date;
}

// Cart item schema
const CartItemSchema = new Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  image: {
    type: String
  },
  restaurantId: {
    type: String
  },
  restaurantName: {
    type: String
  },
  notes: {
    type: String
  }
}, { _id: false });

// Main User schema
const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'vendor'],
    default: 'customer',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  profileImage: { // ✅ Add this field
    type: String,
    default: ''
  },
  notifications: { // ✅ Add this field
    type: Boolean,
    default: true
  },
  marketingEmails: { // ✅ Add this field
    type: Boolean,
    default: true
  },
  cart: {
    type: [CartItemSchema],
    default: []
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Export the model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;