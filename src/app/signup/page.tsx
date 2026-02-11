"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Code, Loader2, Github, Apple, ShieldCheck } from 'lucide-react';

export default function Signup() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleOAuthSignup = async (provider: 'google' | 'github' | 'azure' | 'apple') => {
        setLoading(provider);
        try {
            // Simulation for now
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Account created with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 font-sans text-slate-900">
            <div className="w-full max-w-[400px] space-y-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Link href="/" className="flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Code className="text-white" size={24} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
                    <p className="text-slate-500">Join PineGen with a secure provider</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-6">
                        <ShieldCheck className="text-emerald-600 flex-shrink-0" size={18} />
                        <p className="text-xs text-emerald-800 font-medium">
                            Protected by advanced threat detection and rate limiting.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full h-12 justify-start pl-4 text-base font-normal bg-white hover:bg-slate-50 border-slate-200 text-slate-700 relative"
                            onClick={() => handleOAuthSignup('google')}
                            disabled={!!loading}
                        >
                            {loading === 'google' ? (
                                <Loader2 className="animate-spin absolute left-4" size={20} />
                            ) : (
                                <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="ml-10">Sign up with Google</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-12 justify-start pl-4 text-base font-normal bg-[#24292F] hover:bg-[#24292F]/90 text-white border-transparent relative"
                            onClick={() => handleOAuthSignup('github')}
                            disabled={!!loading}
                        >
                            {loading === 'github' ? (
                                <Loader2 className="animate-spin absolute left-4" size={20} />
                            ) : (
                                <Github className="absolute left-4 w-5 h-5" />
                            )}
                            <span className="ml-10">Sign up with GitHub</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-12 justify-start pl-4 text-base font-normal bg-[#00A4EF] hover:bg-[#00A4EF]/90 text-white border-transparent relative"
                            onClick={() => handleOAuthSignup('azure')}
                            disabled={!!loading}
                        >
                            {loading === 'azure' ? (
                                <Loader2 className="animate-spin absolute left-4" size={20} />
                            ) : (
                                <svg className="absolute left-4 w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
                                    <path d="M11.5 0C5.147 0 0 5.147 0 11.5S5.147 23 11.5 23 23 17.853 23 11.5 17.853 0 11.5 0zm0 21.5c-5.523 0-10-4.477-10-10S5.977 1.5 11.5 1.5s10 4.477 10 10-4.477 10-10 10z" />
                                    <path d="M11.5 5.5v12" />
                                    <path d="M5.5 11.5h12" />
                                </svg>
                            )}
                            <span className="ml-10">Sign up with Microsoft</span>
                        </Button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">No Password Required</span>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400">
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>

                <p className="text-sm text-center text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};
