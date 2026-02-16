'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    restaurantId?: string;
    restaurantName?: string;
}

interface CartContextType {
    items: CartItem[];
    total: number;
    itemCount: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}

interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);

    /* ✅ Load cart safely */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const savedCart = localStorage.getItem('osogbo-foods-cart');
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            localStorage.removeItem('osogbo-foods-cart');
        }
    }, []);

    /* ✅ Save cart safely */
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('osogbo-foods-cart', JSON.stringify(items));
    }, [items]);

    /* ✅ DERIVED STATE (no bugs) */
    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );

    const total = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items]
    );

    /* ✅ Actions */
    const addToCart = (item: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('osogbo-foods-cart');
        }
    };

    return (
        <CartContext.Provider
            value={{
                items,
                total,
                itemCount,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
