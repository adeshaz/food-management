// types/user.ts
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin' | 'restaurant_owner';
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role?: 'customer' | 'admin' | 'restaurant_owner';
    phone?: string;
    address?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}