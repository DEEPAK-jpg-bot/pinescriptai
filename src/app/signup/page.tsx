"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Code, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { isDisposableEmail } from '@/lib/email-check';
import { Input } from '@/components/ui/input';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (isDisposableEmail(email)) {
            toast.error('Disposable or temporary emails are not allowed. Please use a real email.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            toast.success('Check your email for the confirmation link!');
            setEmail('');
            setPassword('');

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
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
                    <p className="text-slate-500">Join PineGen with your email</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-6">
                        <ShieldCheck className="text-emerald-600 flex-shrink-0" size={18} />
                        <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                            Real emails required. Verification link will be sent to your inbox.
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} /> Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                            <span className="bg-white px-3 text-slate-400">Secure Access</span>
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-slate-400 leading-relaxed px-2">
                        By signing up, you verify that you are a real human and agree to our Terms and Privacy Policy.
                    </p>
                </div>

                <p className="text-sm text-center text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};
