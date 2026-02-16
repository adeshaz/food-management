// app/(auth)/signup/page.tsx - UPDATED with immediate auth
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Lock, MapPin, Eye, EyeOff,
    Check, ArrowRight, ChefHat, Clock, Shield, Truck
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext'; // Add this import

interface SignupFormData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address: string;
    agreeToTerms: boolean;
    receiveUpdates: boolean;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    address?: string;
    agreeToTerms?: string;
}

export default function SignupPage() {
    const router = useRouter();
    const { refreshUser } = useAuth(); // Get refreshUser from auth context
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        agreeToTerms: false,
        receiveUpdates: true
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [step, setStep] = useState(1);
    const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');

    useEffect(() => {
        console.log('🔍 Signup page loaded');
    }, []);

    const validateStep1 = () => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, and numbers';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: FormErrors = {};

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required for delivery';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

        // Calculate password strength
        if (name === 'password') {
            let strength = 0;
            if (value.length >= 8) strength += 1;
            if (/[a-z]/.test(value)) strength += 1;
            if (/[A-Z]/.test(value)) strength += 1;
            if (/\d/.test(value)) strength += 1;
            if (/[^A-Za-z0-9]/.test(value)) strength += 1;
            setPasswordStrength(strength);
        }
    };

    const handleCheckboxChange = (name: keyof SignupFormData, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));

        // Clear error when user checks the box
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('=== SIGNUP FORM SUBMIT STARTED ===');
        console.log('Current step:', step);

        // If we're on step 1, validate and go to step 2
        if (step === 1) {
            console.log('On step 1, validating...');
            if (validateStep1()) {
                setStep(2);
                console.log('✅ Step 1 valid, moving to step 2');
                window.scrollTo(0, 0); // Scroll to top for better UX
            } else {
                console.log('❌ Step 1 validation failed');
                // Scroll to first error
                const firstErrorKey = Object.keys(errors)[0];
                if (firstErrorKey) {
                    document.getElementById(firstErrorKey)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
            return;
        }

        console.log('Form data:', {
            ...formData,
            password: '***',
            confirmPassword: '***'
        });

        // Validate step 2
        if (!validateStep2()) {
            console.log('❌ Step 2 validation failed');
            return;
        }

        console.log('✅ All validation passed, submitting...');
        setIsSubmitting(true);

        try {
            console.log('📤 Making API request to /api/auth/signup...');

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address
                }),
            });

            console.log('📥 API Response status:', response.status);

            let data;
            try {
                data = await response.json();
                console.log('📥 API Response data:', data);
            } catch (jsonError) {
                console.error('❌ Failed to parse JSON response:', jsonError);
                const text = await response.text();
                console.error('❌ Raw response:', text);
                toast.error('Invalid response from server');
                setIsSubmitting(false);
                return;
            }

            if (response.ok && data.success) {
                console.log('✅ Signup successful!');

                // Try to auto-login after signup
                try {
                    console.log('🔄 Attempting auto-login...');
                    const loginResponse = await fetch('/api/auth/signin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: formData.email,
                            password: formData.password
                        }),
                        credentials: 'include'
                    });

                    const loginData = await loginResponse.json();

                    if (loginResponse.ok && loginData.success) {
                        console.log('✅ Auto-login successful!');
                        // Force refresh of user data
                        await refreshUser();

                        toast.success('🎉 Welcome! Account created and signed in successfully!');

                        // Redirect immediately
                        setTimeout(() => {
                            router.push('/');
                            router.refresh();
                        }, 1000);
                    } else {
                        // If auto-login fails, redirect to signin
                        toast.success('🎉 Account created successfully! Please sign in.');
                        setTimeout(() => {
                            router.push('/signin');
                        }, 2000);
                    }
                } catch (loginError) {
                    console.error('❌ Auto-login failed:', loginError);
                    // If auto-login fails, redirect to signin
                    toast.success('🎉 Account created successfully! Please sign in.');
                    setTimeout(() => {
                        router.push('/signin');
                    }, 2000);
                }
            } else {
                console.log('❌ Signup failed:', data.message || data.error || 'Unknown error');
                toast.error(data.message || data.error || 'Signup failed. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('🔥 Network or unexpected error during signup:', error);
            toast.error('Network error. Please check your connection and try again.');
            setIsSubmitting(false);
        }
    };

    const handleNextStep = () => {
        console.log('handleNextStep called, current step:', step);
        if (validateStep1()) {
            setStep(2);
            console.log('✅ Moving to step 2');
            window.scrollTo(0, 0);
        } else {
            console.log('❌ Cannot move to step 2, validation failed');
        }
    };

    const handlePrevStep = () => {
        console.log('Going back to step 1');
        setStep(1);
        window.scrollTo(0, 0);
    };

    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'Uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: 'Lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: 'Number', met: /\d/.test(formData.password) },
    ];

    const features = [
        {
            icon: Clock,
            title: "Fast Delivery",
            description: "Get food delivered in under 30 minutes",
            color: "text-green-600 bg-green-50"
        },
        {
            icon: Shield,
            title: "Secure Payments",
            description: "100% secure payment processing",
            color: "text-blue-600 bg-blue-50"
        },
        {
            icon: ChefHat,
            title: "Authentic Cuisine",
            description: "Traditional Osogbo recipes",
            color: "text-amber-600 bg-amber-50"
        },
        {
            icon: Truck,
            title: "Live Tracking",
            description: "Track your order in real-time",
            color: "text-purple-600 bg-purple-50"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            <div className="relative container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Column - Brand & Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div>
                            <Link href="/" className="inline-flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <ChefHat className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                                        Osogbo<span className="text-emerald-600">Foods</span>
                                    </h1>
                                    <p className="text-sm text-gray-500">Taste the tradition</p>
                                </div>
                            </Link>

                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                Join Our Food
                                <span className="text-emerald-600"> Community</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                                Sign up to experience authentic Osogbo cuisine delivered fresh to your doorstep.
                                Get exclusive deals and faster ordering.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm"
                                >
                                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 border-0 shadow-xl">
                            <CardContent className="p-6 text-white">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold">15K+</div>
                                        <div className="text-emerald-100 text-sm">Happy Customers</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">50+</div>
                                        <div className="text-emerald-100 text-sm">Restaurants</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">4.8★</div>
                                        <div className="text-emerald-100 text-sm">Avg Rating</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column - Signup Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="border-0 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Create Your Account
                                </CardTitle>
                                <CardDescription>
                                    Step {step} of 2 • {step === 1 ? 'Basic Information' : 'Delivery Details'}
                                </CardDescription>
                            </CardHeader>

                            {/* Progress Bar */}
                            <div className="px-6 pt-6">
                                <Progress value={step === 1 ? 50 : 100} className="h-2" />
                                <div className="flex justify-between text-sm text-gray-500 mt-2">
                                    <span>Basic Info</span>
                                    <span>Delivery Details</span>
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    data-gramm="false"
                                    data-gramm_editor="false"
                                    data-enable-grammarly="false"
                                >
                                    <AnimatePresence mode="wait">
                                        {step === 1 ? (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                {/* Signup Method Tabs */}
                                                <Tabs defaultValue="email" className="w-full" onValueChange={(v) => setSignupMethod(v as 'email' | 'phone')}>
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="email">Email</TabsTrigger>
                                                        <TabsTrigger value="phone">Phone</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="email" className="mt-4">
                                                        <p className="text-sm text-gray-600">
                                                            Sign up with your email address. We'll send verification and updates to this email.
                                                        </p>
                                                    </TabsContent>
                                                    <TabsContent value="phone" className="mt-4">
                                                        <p className="text-sm text-gray-600">
                                                            Sign up with your phone number. We'll send SMS verification and updates.
                                                        </p>
                                                    </TabsContent>
                                                </Tabs>

                                                {/* Full Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="fullName">Full Name *</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="fullName"
                                                            name="fullName"
                                                            type="text"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                            placeholder="John Doe"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    {errors.fullName && (
                                                        <p className="text-sm text-red-600">{errors.fullName}</p>
                                                    )}
                                                </div>

                                                {/* Email - Always show if email tab is selected */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address *</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            placeholder="john@example.com"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    {errors.email && (
                                                        <p className="text-sm text-red-600">{errors.email}</p>
                                                    )}
                                                </div>

                                                {/* Phone */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number *</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="phone"
                                                            name="phone"
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            placeholder="+234 810 123 4567"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    {errors.phone && (
                                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                                    )}
                                                </div>

                                                {/* Password */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Password *</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            placeholder="Create a strong password"
                                                            className="pl-10 pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-3"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Password Strength */}
                                                    {formData.password && (
                                                        <div className="space-y-3 pt-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">Password strength</span>
                                                                <Badge variant={
                                                                    passwordStrength <= 2 ? 'destructive' :
                                                                        passwordStrength <= 3 ? 'outline' : 'default'
                                                                }>
                                                                    {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Good' : 'Strong'}
                                                                </Badge>
                                                            </div>

                                                            <div className="space-y-2">
                                                                {passwordRequirements.map((req, index) => (
                                                                    <div key={index} className="flex items-center gap-2">
                                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                                            }`}>
                                                                            <Check className="w-3 h-3" />
                                                                        </div>
                                                                        <span className={`text-sm ${req.met ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                                            {req.label}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {errors.password && (
                                                        <p className="text-sm text-red-600">{errors.password}</p>
                                                    )}
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            placeholder="Confirm your password"
                                                            className="pl-10 pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-3"
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {errors.confirmPassword && (
                                                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={handleNextStep}
                                                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12"
                                                >
                                                    Continue to Delivery Details
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handlePrevStep}
                                                    className="gap-2 text-emerald-600 hover:text-emerald-700"
                                                >
                                                    ← Back to Basic Info
                                                </Button>

                                                {/* Address */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Delivery Address *</Label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <textarea
                                                            id="address"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                                setFormData({ ...formData, address: e.target.value })
                                                            }
                                                            rows={3}
                                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-10 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                            placeholder="Enter your complete delivery address in Osogbo"
                                                        />
                                                    </div>
                                                    {errors.address && (
                                                        <p className="text-sm text-red-600">{errors.address}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        Please include landmarks, street name, and house number for accurate delivery.
                                                    </p>
                                                </div>

                                                {/* Checkboxes */}
                                                <div className="space-y-4">
                                                    <div className="flex items-start space-x-3">
                                                        <Checkbox
                                                            id="agreeToTerms"
                                                            name="agreeToTerms"
                                                            checked={formData.agreeToTerms}
                                                            onCheckedChange={(checked) =>
                                                                handleCheckboxChange('agreeToTerms', checked as boolean)
                                                            }
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                                                                I agree to the{' '}
                                                                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                                                    Terms of Service
                                                                </Link>{' '}
                                                                and{' '}
                                                                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                                                    Privacy Policy
                                                                </Link>{' '}
                                                                *
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    {errors.agreeToTerms && (
                                                        <p className="text-sm text-red-600 pl-9">{errors.agreeToTerms}</p>
                                                    )}

                                                    <div className="flex items-start space-x-3">
                                                        <Checkbox
                                                            id="receiveUpdates"
                                                            name="receiveUpdates"
                                                            checked={formData.receiveUpdates}
                                                            onCheckedChange={(checked) =>
                                                                handleCheckboxChange('receiveUpdates', checked as boolean)
                                                            }
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <Label htmlFor="receiveUpdates" className="text-sm cursor-pointer">
                                                                I want to receive updates about new restaurants, special offers, and food recommendations
                                                            </Label>
                                                            <p className="text-xs text-gray-500">
                                                                You can unsubscribe at any time from your account settings
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                            Creating Account...
                                                        </>
                                                    ) : (
                                                        'Create Account'
                                                    )}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>

                                <Separator className="my-6" />

                                {/* Sign In Link */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            href="/signin"
                                            className="font-semibold text-emerald-600 hover:text-emerald-700"
                                        >
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-gray-50 border-t px-6 py-4">
                                <p className="text-xs text-gray-500 text-center w-full">
                                    By signing up, you agree to our Terms of Service and Privacy Policy.
                                    Your data is protected with bank-level security.
                                </p>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}


// import { NextRequest, NextResponse } from 'next/server';
// import mongoose from 'mongoose';

// export async function POST(request: NextRequest) {
//   try {
//     console.log('=== SIGNUP START ===');
    
//     // Get MongoDB URI from env
//     const MONGODB_URI = process.env.MONGODB_URI;
//     if (!MONGODB_URI) {
//       console.error('MONGODB_URI not set');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error' },
//         { status: 500 }
//       );
//     }
    
//     // Connect to MongoDB directly (no caching)
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ MongoDB connected');
    
//     // Parse request
//     const body = await request.json();
//     const { name, email, password } = body;
    
//     if (!name || !email || !password) {
//       return NextResponse.json(
//         { success: false, error: 'All fields required' },
//         { status: 400 }
//       );
//     }
    
//     // Check if User model exists, create if not
//     const userSchema = new mongoose.Schema({
//       name: String,
//       email: { type: String, unique: true },
//       password: String,
//       role: { type: String, default: 'customer' }
//     }, { timestamps: true });
    
//     const User = mongoose.models.User || mongoose.model('User', userSchema);
    
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json(
//         { success: false, error: 'Email already exists' },
//         { status: 400 }
//       );
//     }
    
//     // Create user (store plain password for now)
//     const user = await User.create({
//       name,
//       email,
//       password, // No hashing for testing
//       role: 'customer'
//     });
    
//     console.log('✅ User created:', user._id);
    
//     // Create simple token (not JWT for now)
//     const token = `user-token-${user._id}-${Date.now()}`;
    
//     // Create response
//     const response = NextResponse.json({
//       success: true,
//       message: 'User created successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     }, { status: 201 });
    
//     // Set cookie
//     response.cookies.set({
//       name: 'token',
//       value: token,
//       httpOnly: true,
//       secure: false, // false for localhost
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       path: '/',
//     });
    
//     console.log('✅ Cookie set, signup complete');
//     return response;
    
//   } catch (error: any) {
//     console.error('❌ SIGNUP ERROR:', error.message);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }