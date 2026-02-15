"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Terminal, Loader2, ShieldCheck, Mail, Lock, Sparkles, ChevronLeft, AlertTriangle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { isAllowedEmail } from '@/lib/email-check';
import { Input } from '@/components/ui/input';
import { getURL } from '@/utils/get-url';

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

        if (!isAllowedEmail(email)) {
            toast.error('Please use a standard email provider (Gmail, Outlook, etc.). Business or disposable emails are restricted.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${getURL()}auth/callback`,
                },
            });

            if (error) throw error;

            toast.success('Protocol Initiated. Check your email (and Spam folder) for the confirmation link!');
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-page-dark px-4 font-sans text-zinc-900 dark:text-white transition-colors duration-300">
            <div className="w-full max-w-[400px] space-y-12 animate-fade-in">

                <div className="flex flex-col items-center gap-6 text-center">
                    <Link href="/" className="group">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transform group-hover:scale-110 transition-all duration-300">
                            <Terminal className="text-white" size={24} />
                        </div>
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter leading-none">Initialize Access</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Join the v6 logic network</p>
                    </div>
                </div>

                <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-[2.5rem] shadow-sm">
                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 p-4 rounded-2xl mb-8">
                            <ShieldCheck className="text-primary flex-shrink-0" size={18} />
                            <p className="text-[10px] text-primary dark:text-primary font-bold uppercase tracking-widest leading-tight">
                                Verification Required. Real emails only.
                            </p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Terminal Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <Input
                                        type="email"
                                        placeholder="user@domain.com"
                                        className="pl-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 transition-all focus-visible:ring-primary"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Security Key (8+ Chars)</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 transition-all focus-visible:ring-primary"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} /> Deploying...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">Initialize Account <ChevronLeft className="rotate-180" size={16} /></span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-2xl">
                            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={14} />
                            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest leading-relaxed">
                                Note: Confirmation emails may arrive in your <span className="underline decoration-2 underline-offset-2">Spam Folder</span>. Please check it if you don't receive the link within 60 seconds.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-black hover:underline tracking-tight">
                            Log In
                        </Link>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        <Sparkles size={12} className="text-primary" /> Professional Node v6.0
                    </div>
                </div>

            </div>
        </div>
    );
};
