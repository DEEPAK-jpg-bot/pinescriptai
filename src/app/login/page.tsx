"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Terminal, Loader2, Mail, Lock, ChevronLeft, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success('Successfully logged in!');
            router.push('/dashboard');

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-page-dark px-4 font-sans text-zinc-900 dark:text-white transition-colors duration-300">
            <div className="w-full max-w-[400px] space-y-12 animate-fade-in">

                <div className="flex flex-col items-center gap-6 text-center">
                    <Link href="/" className="group">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 transform group-hover:scale-110 transition-all duration-300">
                            <Terminal className="text-white" size={24} />
                        </div>
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter leading-none">Welcome Back</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Access your Pine v6 workspace</p>
                    </div>
                </div>

                <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-[2.5rem] shadow-sm">
                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Terminal</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <Input
                                        type="email"
                                        placeholder="user@domain.com"
                                        className="pl-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Password Key</label>
                                    <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600">Reset</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} /> Validating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">Enter Dashboard <ChevronLeft className="rotate-180" size={16} /></span>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Don&apos;t have logic access?{' '}
                        <Link href="/signup" className="text-emerald-500 font-black hover:underline tracking-tight">
                            Create Account
                        </Link>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        <Sparkles size={12} className="text-emerald-500" /> Secure Protocol v6.0
                    </div>
                </div>

            </div>
        </div>
    );
};
