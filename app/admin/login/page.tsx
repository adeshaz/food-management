// app/admin/login/page.tsx - UPDATE THE REDIRECT LOGIC
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin'; // 👈 Default to /admin

    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Use your AuthContext login function
            const success = await login(email, password);

            if (success) {
                toast.success('Admin login successful!');

                // Redirect to /admin (NOT /admin/dashboard)
                setTimeout(() => {
                    router.push(redirect); // This should be '/admin'
                }, 1000);
            } else {
                setError('Login failed. Check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Connection failed. Please try again.');
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail('hafizadegbite@gmail.com');
        setPassword('Carzola111#'); // 👈 Your actual password
        toast.info('Demo credentials loaded. Click "Login as Admin"');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Card className="w-full max-w-md shadow-2xl border-gray-200">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <Shield className="h-8 w-8 text-emerald-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
                    <CardDescription className="text-center">
                        Enter your admin credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Login as Admin'
                            )}
                        </Button>

                        <div className="text-center space-y-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleDemoLogin}
                                disabled={loading}
                            >
                                Load Demo Credentials
                            </Button>

                            <div className="text-sm text-gray-600 border-t pt-4">
                                <p className="mb-2 font-semibold">Demo Admin Credentials:</p>
                                <div className="bg-gray-50 p-3 rounded border">
                                    <p className="font-mono text-sm">
                                        <span className="text-gray-500">Email:</span> hafizadegbite@gmail.com
                                    </p>
                                    <p className="font-mono text-sm mt-1">
                                        <span className="text-gray-500">Password:</span> Carzola111#
                                    </p>
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    For development only. In production, use real credentials.
                                </p>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}