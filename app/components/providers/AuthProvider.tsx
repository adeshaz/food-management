'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartContextType {
    items: CartItem[];
    total: number;
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
    const [total, setTotal] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setItems(parsedCart.items || []);
                setTotal(parsedCart.total || 0);
            } catch (error) {
                console.error('Failed to parse cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify({ items, total }));
    }, [items, total]);

    const addToCart = (item: CartItem) => {
        setItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            } else {
                return [...prev, item];
            }
        });
        setTotal(prev => prev + (item.price * item.quantity));
    };

    const removeFromCart = (id: string) => {
        setItems(prev => {
            const itemToRemove = prev.find(item => item.id === id);
            if (itemToRemove) {
                setTotal(prevTotal => prevTotal - (itemToRemove.price * itemToRemove.quantity));
            }
            return prev.filter(item => item.id !== id);
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems(prev => {
            const updatedItems = prev.map(item => {
                if (item.id === id) {
                    const quantityDiff = quantity - item.quantity;
                    setTotal(prevTotal => prevTotal + (item.price * quantityDiff));
                    return { ...item, quantity };
                }
                return item;
            });
            return updatedItems;
        });
    };

    const clearCart = () => {
        setItems([]);
        setTotal(0);
    };

    return (
        <CartContext.Provider value={{
            items,
            total,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}