// context/CartContext.tsx - FIXED VERSION
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    restaurantId?: string;
    restaurantName?: string;
    notes?: string;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    cartTotal: number;
    loading: boolean;
    syncing: boolean;
    addToCart: (item: CartItem) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => Promise<void>;
    syncCartWithBackend: () => Promise<void>;
    getSubtotal: () => number;
    getItemCount: () => number;
    getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [itemCount, setItemCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    // Use ref to track mounted state
    const isMounted = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Calculate item count and total whenever items change
    useEffect(() => {
        if (!isMounted.current) return;

        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        setItemCount(count);
        setCartTotal(total);

        console.log('🛒 Cart updated:', { items, count, total });
    }, [items]);

    // Load cart based on user authentication state
    useEffect(() => {
        if (!isMounted.current) return;

        const loadCart = async () => {
            setLoading(true);
            try {
                if (user) {
                    console.log('🔄 Loading cart from backend for user:', user.email);
                    await loadCartFromBackend();
                } else {
                    console.log('🔄 Loading cart from localStorage (guest)');
                    loadCartFromLocalStorage();
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                loadCartFromLocalStorage();
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        loadCart();
    }, [user]);

    const loadCartFromLocalStorage = () => {
        try {
            const savedCart = localStorage.getItem('osogbo-foods-cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                const cartItems = Array.isArray(parsedCart) ? parsedCart : parsedCart?.items || [];
                setItems(cartItems);
                console.log('✅ Cart loaded from localStorage:', cartItems.length, 'items');
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            localStorage.removeItem('osogbo-foods-cart');
            setItems([]);
        }
    };

    const loadCartFromBackend = async () => {
        try {
            const response = await fetch('/api/cart', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const backendItems = data.cart?.items || [];
                    setItems(backendItems);
                    console.log(`✅ Cart loaded from backend: ${backendItems.length} items`);
                }
            } else {
                console.warn('⚠️ Failed to load cart from backend, using localStorage');
                loadCartFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading cart from backend:', error);
            loadCartFromLocalStorage();
        }
    };

    // Save cart to backend when user is logged in
    const saveCartToBackend = async (cartItems: CartItem[]) => {
        if (!user) return;

        try {
            if (!isMounted.current) return;
            setSyncing(true);

            const response = await fetch('/api/cart/put', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ items: cartItems }),
            });

            if (!response.ok) {
                throw new Error('Failed to save cart to backend');
            }

            console.log(`✅ Cart saved to backend for ${user.email}`);
        } catch (error) {
            console.error('Error saving cart to backend:', error);
            // Fallback: save to localStorage
            localStorage.setItem('osogbo-foods-cart', JSON.stringify(cartItems));
        } finally {
            if (isMounted.current) {
                setSyncing(false);
            }
        }
    };

    // Save cart to localStorage for guests
    useEffect(() => {
        if (!isMounted.current) return;

        if (!user && !loading && items.length > 0) {
            localStorage.setItem('osogbo-foods-cart', JSON.stringify(items));
            console.log('💾 Cart saved to localStorage:', items.length, 'items');
        }
    }, [items, user, loading]);

    // Save cart to backend when items change (for logged in users)
    useEffect(() => {
        if (!isMounted.current) return;

        if (user && !loading) {
            const timeoutId = setTimeout(() => {
                saveCartToBackend(items);
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [items, user, loading]);

    // Listen for logout event
    useEffect(() => {
        const handleLogout = () => {
            console.log('🔄 CartContext: Clearing cart on logout');
            if (isMounted.current) {
                setItems([]);
            }
            localStorage.removeItem('osogbo-foods-cart');
            localStorage.removeItem('checkoutData');
        };

        window.addEventListener('user-logout', handleLogout);

        return () => {
            window.removeEventListener('user-logout', handleLogout);
        };
    }, []);

    const addToCart = useCallback((item: CartItem) => {
        if (!isMounted.current) return;

        console.log('➕ Adding to cart:', item);

        setItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);

            let newItems;
            if (existingItem) {
                newItems = prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            } else {
                newItems = [...prev, item];
            }

            console.log('🛒 New cart items:', newItems);
            return newItems;
        });
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (!isMounted.current) return;

        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    }, []);

    const removeFromCart = useCallback((id: string) => {
        if (!isMounted.current) return;

        console.log('❌ Removing from cart:', id);
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearCart = useCallback(async () => {
        if (!isMounted.current) return;

        console.log('🧹 Clearing cart...');

        if (user) {
            try {
                await fetch('/api/cart', {
                    method: 'DELETE',
                    credentials: 'include',
                });
                console.log('✅ Backend cart cleared');
            } catch (error) {
                console.error('Error clearing backend cart:', error);
            }
        }

        setItems([]);
        localStorage.removeItem('osogbo-foods-cart');
        localStorage.removeItem('checkoutData');
    }, [user]);

    const syncCartWithBackend = useCallback(async () => {
        if (user) {
            await loadCartFromBackend();
        }
    }, [user]);

    const getSubtotal = useCallback(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);

    const getItemCount = useCallback(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }, [items]);

    const getCartTotal = useCallback(() => {
        return getSubtotal();
    }, [getSubtotal]);

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            cartTotal,
            loading,
            syncing,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            syncCartWithBackend,
            getSubtotal,
            getItemCount,
            getCartTotal,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};