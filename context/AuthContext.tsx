// // context/AuthContext.tsx - FIXED VERSION
// 'use client';

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';

// interface User {
//     _id: string;
//     email: string;
//     name: string;
//     role: string;
//     phone?: string;
// }

// interface AuthContextType {
//     user: User | null;
//     isLoading: boolean;
//     login: (email: string, password: string) => Promise<boolean>;
//     logout: () => Promise<void>;
//     refreshUser: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const router = useRouter();

//     useEffect(() => {
//         checkAuth();
//     }, []);

//     const checkAuth = async () => {
//         try {
//             const response = await fetch('/api/auth/me', {
//                 credentials: 'include',
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 console.log('Auth check response:', data);
//                 if (data.success && data.user) {
//                     setUser(data.user);
//                 } else {
//                     setUser(null);
//                 }
//             } else {
//                 console.log('Auth check failed');
//                 setUser(null);
//             }
//         } catch (error) {
//             console.error('Auth check failed:', error);
//             setUser(null);
//         } finally {
//             setIsLoading(false);
//         }
//     };


// // context/AuthContext.tsx - Add this to login function
// const login = async (email: string, password: string): Promise<boolean> => {
//     console.log('🔑 Login called for:', email);

//     try {
//         const response = await fetch('/api/auth/signin', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email, password }),
//             credentials: 'include',
//         });

//         const data = await response.json();
//         console.log('📥 Login API response:', {
//             status: response.status,
//             ok: response.ok,
//             success: data.success,
//             message: data.message
//         });

//         if (response.ok && data.success) {
//             console.log('✅ Login successful, user data:', data.user);
//             setUser(data.user);
//             toast.success('Login successful!');
            
//             // Sync cart after successful login
//             setTimeout(() => {
//                 // Dispatch event to sync cart
//                 window.dispatchEvent(new Event('user-login'));
//             }, 1000);
            
//             return true;
//         } else {
//             console.log('❌ Login failed:', data.message);
//             toast.error(data.message || 'Login failed');
//             return false;
//         }
//     } catch (error) {
//         console.error('🔥 Login error:', error);
//         toast.error('Network error. Please try again.');
//         return false;
//     }
// };



//     // const login = async (email: string, password: string): Promise<boolean> => {
//     //     console.log('🔑 Login called for:', email);

//     //     try {
//     //         const response = await fetch('/api/auth/signin', {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //             },
//     //             body: JSON.stringify({ email, password }),
//     //             credentials: 'include',
//     //         });

//     //         const data = await response.json();
//     //         console.log('📥 Login API response:', {
//     //             status: response.status,
//     //             ok: response.ok,
//     //             success: data.success,
//     //             message: data.message
//     //         });

//     //         if (response.ok && data.success) {
//     //             console.log('✅ Login successful, user data:', data.user);
//     //             setUser(data.user);
//     //             toast.success('Login successful!');

//     //             // Clear any previous cart data from localStorage
//     //             localStorage.removeItem('osogbo-foods-cart');
//     //             localStorage.removeItem('checkoutData');

//     //             return true;
//     //         } else {
//     //             console.log('❌ Login failed:', data.message);
//     //             toast.error(data.message || 'Login failed');
//     //             return false;
//     //         }
//     //     } catch (error) {
//     //         console.error('🔥 Login error:', error);
//     //         toast.error('Network error. Please try again.');
//     //         return false;
//     //     }
//     // };




//     // In your existing AuthContext logout function, update it slightly:
//     const logout = async (): Promise<void> => {
//         try {
//             console.log('🟢 Starting logout process...');

//             // Determine if we're in admin area
//             const isAdminArea = window.location.pathname.startsWith('/admin');

//             // Call logout API
//             const response = await fetch('/api/auth/logout', {
//                 method: 'POST',
//                 credentials: 'include',
//             });

//             if (response.ok) {
//                 console.log('✅ Logout API call successful');

//                 // Clear user state
//                 setUser(null);

//                 // Clear localStorage completely
//                 localStorage.clear();

//                 // Clear sessionStorage
//                 sessionStorage.clear();

//                 // Dispatch logout event for other components
//                 window.dispatchEvent(new Event('user-logout'));

//                 // Show success message
//                 toast.success('Logged out successfully');

//                 // Redirect based on where we logged out from
//                 setTimeout(() => {
//                     if (isAdminArea) {
//                         window.location.href = '/admin/login';
//                     } else {
//                         window.location.href = '/signin';
//                     }
//                 }, 500);

//             } else {
//                 console.error('❌ Logout API call failed');
//                 toast.error('Failed to logout');
//             }
//         } catch (error) {
//             console.error('🔥 Logout error:', error);
//             toast.error('An error occurred during logout');

//             // Fallback: Clear everything and redirect
//             setUser(null);
//             localStorage.clear();
//             window.location.href = '/signin';
//         }
//     };

//     const refreshUser = async () => {
//         await checkAuth();
//     };

//     return (
//         <AuthContext.Provider value={{
//             user,
//             isLoading,
//             login,
//             logout,
//             refreshUser
//         }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within AuthProvider');
//     }
//     return context;
// };


// context/AuthContext.tsx - UPDATED VERSION
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
    profileImage?: string;
    notifications?: boolean;
    marketingEmails?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<boolean>; // ✅ ADD THIS
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Auth check response:', data);
                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                console.log('Auth check failed');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        console.log('🔑 Login called for:', email);

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();
            console.log('📥 Login API response:', {
                status: response.status,
                ok: response.ok,
                success: data.success,
                message: data.message
            });

            if (response.ok && data.success) {
                console.log('✅ Login successful, user data:', data.user);
                setUser(data.user);
                toast.success('Login successful!');

                // Sync cart after successful login
                setTimeout(() => {
                    window.dispatchEvent(new Event('user-login'));
                }, 1000);

                return true;
            } else {
                console.log('❌ Login failed:', data.message);
                toast.error(data.message || 'Login failed');
                return false;
            }
        } catch (error) {
            console.error('🔥 Login error:', error);
            toast.error('Network error. Please try again.');
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('🟢 Starting logout process...');

            const isAdminArea = window.location.pathname.startsWith('/admin');

            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                console.log('✅ Logout API call successful');

                setUser(null);
                localStorage.clear();
                sessionStorage.clear();
                window.dispatchEvent(new Event('user-logout'));

                toast.success('Logged out successfully');

                setTimeout(() => {
                    if (isAdminArea) {
                        window.location.href = '/admin/login';
                    } else {
                        window.location.href = '/signin';
                    }
                }, 500);

            } else {
                console.error('❌ Logout API call failed');
                toast.error('Failed to logout');
            }
        } catch (error) {
            console.error('🔥 Logout error:', error);
            toast.error('An error occurred during logout');

            setUser(null);
            localStorage.clear();
            window.location.href = '/signin';
        }
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    // ✅ ADD THIS FUNCTION: Update user in context
    const updateUser = async (updates: Partial<User>): Promise<boolean> => {
        try {
            console.log('🔄 Updating user in context:', updates);

            // Update local state
            setUser(prev => prev ? { ...prev, ...updates } : null);

            // Update localStorage if exists
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    localStorage.setItem('user', JSON.stringify({ ...user, ...updates }));
                }
            }

            toast.success('Profile updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update profile');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            refreshUser,
            updateUser // ✅ ADD THIS TO CONTEXT
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};