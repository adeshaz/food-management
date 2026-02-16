// app/(auth)/signin/page.tsx - FIXED VERSION
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ChefHat, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SigninPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setIsSubmitting(true);
        setError('');

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

            if (response.ok && data.success) {
                setSuccess(true);

                // Wait 2 seconds then redirect
                setTimeout(() => {
                    // Force refresh to update auth state
                    window.location.href = '/';
                }, 2000);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            <div className="w-full max-w-md relative z-10">
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="text-center space-y-4">
                        <Link href="/" className="inline-flex items-center justify-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                                    Osogbo<span className="text-emerald-600">Foods</span>
                                </h1>
                                <p className="text-sm text-gray-500">Taste the tradition</p>
                            </div>
                        </Link>
                        <div>
                            <CardTitle className="text-2xl">Welcome Back</CardTitle>
                            <CardDescription>
                                Sign in to your account to continue ordering
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Success Message */}
                        {success && (
                            <Alert className="mb-4 bg-emerald-50 border-emerald-200">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <AlertDescription className="text-emerald-700">
                                    ✅ Login successful! Redirecting...
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Alert className="mb-4 bg-red-50 border-red-200">
                                <AlertDescription className="text-red-700">
                                    ❌ {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-emerald-600 hover:text-emerald-700"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                                    Remember me for 30 days
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <Separator className="my-6" />

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    href="/signup"
                                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                                >
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-center text-xs text-gray-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </div>
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { Mail, Lock, ChefHat } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Separator } from '@/components/ui/separator';
// import { toast } from 'sonner';

// export default function SignInPage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const redirect = searchParams.get('redirect') || '/';

//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         rememberMe: false
//     });
//     const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         // Basic validation
//         const newErrors: { email?: string; password?: string } = {};
//         if (!formData.email.trim()) {
//             newErrors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             newErrors.email = 'Please enter a valid email';
//         }

//         if (!formData.password) {
//             newErrors.password = 'Password is required';
//         } else if (formData.password.length < 6) {
//             newErrors.password = 'Password must be at least 6 characters';
//         }

//         setErrors(newErrors);
//         if (Object.keys(newErrors).length > 0) return;

//         setIsLoading(true);
//         console.log('Attempting signin for:', formData.email);

//         try {
//             const response = await fetch('/api/auth/signin', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     email: formData.email.toLowerCase(),
//                     password: formData.password
//                 }),
//             });

//             const data = await response.json();
//             console.log('Signin response:', { status: response.status, data });

//             if (response.ok) {
//                 toast.success('Signed in successfully!');

//                 // Small delay to ensure cookie is set
//                 setTimeout(() => {
//                     router.push(redirect);
//                     router.refresh(); // Refresh to update auth state
//                 }, 100);
//             } else {
//                 toast.error(data.message || 'Invalid credentials');
//                 // Clear password on error
//                 setFormData(prev => ({ ...prev, password: '' }));
//             }
//         } catch (error) {
//             console.error('Sign in error:', error);
//             toast.error('An error occurred. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Demo credentials button (for testing)
//     const handleDemoLogin = () => {
//         setFormData({
//             email: 'demo@example.com',
//             password: 'demo123',
//             rememberMe: false
//         });
//         toast.info('Demo credentials filled. Click Sign In to test.');
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
//             {/* Background Pattern */}
//             <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

//             <div className="relative container mx-auto px-4 py-12">
//                 <div className="max-w-md mx-auto">
//                     <motion.div
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                         className="mb-8 text-center"
//                     >
//                         <Link href="/" className="inline-flex items-center gap-3 justify-center">
//                             <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
//                                 <ChefHat className="w-6 h-6 text-white" />
//                             </div>
//                             <div>
//                                 <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent">
//                                     Osogbo<span className="text-emerald-600">Foods</span>
//                                 </h1>
//                                 <p className="text-sm text-gray-500">Taste the tradition</p>
//                             </div>
//                         </Link>
//                     </motion.div>

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6, delay: 0.1 }}
//                     >
//                         <Card className="border-0 shadow-2xl overflow-hidden">
//                             <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
//                                 <CardTitle className="text-2xl font-bold text-center text-gray-900">
//                                     Welcome Back
//                                 </CardTitle>
//                                 <CardDescription className="text-center">
//                                     Sign in to your Osogbo Foods account
//                                 </CardDescription>
//                             </CardHeader>

//                             <CardContent className="p-6">
//                                 <form onSubmit={handleSubmit} className="space-y-6">
//                                     {/* Email */}
//                                     <div className="space-y-2">
//                                         <Label htmlFor="email">Email Address *</Label>
//                                         <div className="relative">
//                                             <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                                             <Input
//                                                 id="email"
//                                                 name="email"
//                                                 type="email"
//                                                 value={formData.email}
//                                                 onChange={(e) => {
//                                                     setFormData({ ...formData, email: e.target.value });
//                                                     if (errors.email) setErrors({ ...errors, email: undefined });
//                                                 }}
//                                                 placeholder="john@example.com"
//                                                 className="pl-10"
//                                                 disabled={isLoading}
//                                             />
//                                         </div>
//                                         {errors.email && (
//                                             <p className="text-sm text-red-600">{errors.email}</p>
//                                         )}
//                                     </div>

//                                     {/* Password */}
//                                     <div className="space-y-2">
//                                         <div className="flex items-center justify-between">
//                                             <Label htmlFor="password">Password *</Label>
//                                             <Link
//                                                 href="/forgot-password" // Fixed: removed /auth prefix
//                                                 className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
//                                             >
//                                                 Forgot password?
//                                             </Link>
//                                         </div>
//                                         <div className="relative">
//                                             <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                                             <Input
//                                                 id="password"
//                                                 name="password"
//                                                 type="password"
//                                                 value={formData.password}
//                                                 onChange={(e) => {
//                                                     setFormData({ ...formData, password: e.target.value });
//                                                     if (errors.password) setErrors({ ...errors, password: undefined });
//                                                 }}
//                                                 placeholder="Enter your password"
//                                                 className="pl-10"
//                                                 disabled={isLoading}
//                                             />
//                                         </div>
//                                         {errors.password && (
//                                             <p className="text-sm text-red-600">{errors.password}</p>
//                                         )}
//                                     </div>

//                                     {/* Remember Me */}
//                                     <div className="flex items-center space-x-2">
//                                         <Checkbox
//                                             id="rememberMe"
//                                             checked={formData.rememberMe}
//                                             onCheckedChange={(checked) =>
//                                                 setFormData({ ...formData, rememberMe: checked as boolean })
//                                             }
//                                             disabled={isLoading}
//                                         />
//                                         <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
//                                             Remember me for 30 days
//                                         </Label>
//                                     </div>

//                                     {/* Sign In Button */}
//                                     <Button
//                                         type="submit"
//                                         disabled={isLoading}
//                                         className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12 shadow-md"
//                                     >
//                                         {isLoading ? (
//                                             <>
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                                                 Signing In...
//                                             </>
//                                         ) : (
//                                             'Sign In'
//                                         )}
//                                     </Button>

//                                     {/* Demo Button (Optional - for testing) */}
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         onClick={handleDemoLogin}
//                                         className="w-full h-10 text-sm"
//                                         disabled={isLoading}
//                                     >
//                                         Try Demo Account
//                                     </Button>
//                                 </form>

//                                 <Separator className="my-6" />

//                                 {/* Sign Up Link */}
//                                 <div className="text-center">
//                                     <p className="text-sm text-gray-600">
//                                         Don&apos;t have an account?{' '}
//                                         <Link
//                                             href="/signup" // Fixed: removed /auth prefix
//                                             className="font-semibold text-emerald-600 hover:text-emerald-700"
//                                         >
//                                             Sign up here
//                                         </Link>
//                                     </p>
//                                 </div>
//                             </CardContent>

//                             <CardFooter className="bg-gray-50 border-t px-6 py-4">
//                                 <p className="text-xs text-gray-500 text-center w-full">
//                                     By signing in, you agree to our{' '}
//                                     <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
//                                         Terms of Service
//                                     </Link>{' '}
//                                     and{' '}
//                                     <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
//                                         Privacy Policy
//                                     </Link>.
//                                 </p>
//                             </CardFooter>
//                         </Card>

//                         {/* Debug Info (Remove in production) */}
//                         <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
//                             <p className="font-semibold mb-1">Debug Info:</p>
//                             <p>• API Endpoint: <code>/api/auth/signin</code></p>
//                             <p>• Redirect after login: <code>{redirect}</code></p>
//                             <p>• Ensure signin page is at: <code>app/(auth)/signin/page.tsx</code></p>
//                             <p>• Make sure User model has password hashing enabled</p>
//                         </div>
//                     </motion.div>
//                 </div>
//             </div>
//         </div>
//     );
// }