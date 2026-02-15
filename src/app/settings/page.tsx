"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User, LogOut, CreditCard,
    ExternalLink, Zap, ShieldCheck, Clock,
    BarChart3, Settings as SettingsIcon,
    ChevronRight, ArrowUpRight, ChevronLeft,
    Sparkles
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

interface Subscription {
    status: string;
    plan_id: string;
    current_period_end: string;
}

export default function Settings() {
    const supabase = createClient();
    const router = useRouter();
    const { user, quotaInfo, checkRateLimit } = useChatStore();
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        const loadSub = async () => {
            if (!user) return;
            const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
            setSubscription(data as Subscription);
            await checkRateLimit();
        };
        loadSub();
    }, [user, supabase, checkRateLimit]);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/login');
    };

    const getTierDisplay = () => {
        const tier = quotaInfo.tier?.toLowerCase() || 'free';
        if (tier === 'pro_trader') return { name: 'Pro Trader', color: 'indigo', icon: <ShieldCheck className="text-primary" /> };
        if (tier === 'trader') return { name: 'Trader', color: 'indigo', icon: <Zap className="text-primary" /> };
        if (tier === 'pro') return { name: 'Pro', color: 'indigo', icon: <Sparkles className="text-primary" /> };
        return { name: 'Free Tier', color: 'zinc', icon: <User className="text-zinc-400" /> };
    };

    const tierInfo = getTierDisplay();

    return (
        <div className="min-h-screen bg-white dark:bg-page-dark text-zinc-900 dark:text-white font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
            {/* Header (Adaptive 48px Header) */}
            <header className="h-12 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-page-dark/80 backdrop-blur-md flex items-center justify-center px-4">
                <nav className="w-full max-w-[768px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                            <ChevronLeft size={18} className="text-zinc-500" />
                        </Link>
                        <h1 className="text-sm font-bold tracking-tight">Account Settings</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white">
                            <SettingsIcon size={12} />
                        </div>
                    </div>
                </nav>
            </header>

            <main className="flex flex-col items-center py-12 px-6">
                <div className="w-full max-w-[768px] space-y-12">

                    {/* 1. Profile Section */}
                    <section className="animate-fade-in">
                        <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-[2rem] flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-3xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-primary shadow-sm transition-transform group-hover:scale-105">
                                    <User size={40} strokeWidth={1.5} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary border-4 border-white dark:border-zinc-900 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-black tracking-tighter">{user?.email?.split('@')[0]}</h2>
                                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {tierInfo.name}
                                    </span>
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">{user?.email}</p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                disabled={loading}
                                className="h-10 rounded-xl border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-all font-bold text-xs"
                            >
                                <LogOut size={14} className="mr-2" />
                                {loading ? 'Signing out...' : 'Sign Out'}
                            </Button>
                        </div>
                    </section>

                    {/* 2. Usage & Quota Card */}
                    <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="p-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2rem] shadow-sm space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black leading-none">Usage Stats</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Institutional Quota Monitor</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-5xl font-black tracking-tighter text-primary">{quotaInfo.limit - quotaInfo.remaining}</span>
                                        <span className="text-zinc-400 font-bold text-xl ml-2 tracking-tight">/ {quotaInfo.limit} gens used</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Utilization</span>
                                        <span className="text-lg font-black">{Math.round(((quotaInfo.limit - quotaInfo.remaining) / quotaInfo.limit) * 100)}%</span>
                                    </div>
                                </div>

                                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-700/50 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                        style={{ width: `${Math.max(2, (1 - (quotaInfo.remaining / (quotaInfo.limit || 1))) * 100)}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center gap-3 group hover:border-primary/30 transition-all">
                                        <Clock className="text-zinc-400 group-hover:text-primary transition-colors" size={20} />
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Frequency Cycle</p>
                                            <p className="text-xs font-bold">Standard Monthly Cycle</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center gap-3 group hover:border-primary/30 transition-all">
                                        <Zap className="text-zinc-400 group-hover:text-primary transition-colors" size={20} />
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Compute Priority</p>
                                            <p className="text-xs font-bold">{quotaInfo.tier !== 'free' ? 'Institutional (Pro)' : 'Standard Core'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Subscription Status */}
                    <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="p-8 bg-white dark:bg-zinc-800 border-2 border-primary/20 rounded-[2rem] shadow-xl shadow-primary/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                        <CreditCard size={14} /> Subscription Engine
                                    </h3>
                                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                        ID: {subscription?.plan_id || 'Free'}
                                    </div>
                                </div>

                                <div className="space-y-1 text-zinc-900 dark:text-white">
                                    <p className="text-zinc-400 text-sm font-medium">Active Deployment</p>
                                    <p className="text-4xl font-black tracking-tighter tracking-tight">{tierInfo.name}</p>
                                </div>

                                {quotaInfo.tier === 'free' ? (
                                    <Link href="/?ref=upgrade#pricing">
                                        <Button className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 group/btn transition-all active:scale-95">
                                            Upgrade Account <ArrowUpRight className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="pt-4 space-y-4">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold transition-all text-sm rounded-xl"
                                            onClick={() => window.open('https://daredevil.lemonsqueezy.com/billing', '_blank')}
                                        >
                                            Billing Dashboard <ExternalLink size={16} className="ml-2 opacity-50" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 4. Support & Links */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <div className="p-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2rem] shadow-sm">
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Support Portal</h4>
                            <nav className="space-y-2">
                                {[
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                    { label: 'Institutional Support', href: 'mailto:support@pinegen.ai' },
                                ].map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.href}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 text-sm font-bold transition-all group"
                                    >
                                        {link.label}
                                        <ChevronRight size={14} className="text-zinc-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Sparkles size={24} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">TradingView v6 Ready</p>
                            <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold leading-relaxed max-w-[200px]">
                                Your logic is verified against modern TradingView standards.
                            </p>
                        </div>
                    </section>

                </div>
            </main>

            {/* Mobile Nav Overlay (Institutional Style) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-3 shadow-2xl flex items-center gap-8">
                <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
                    <BarChart3 size={20} />
                </Link>
                <div className="w-px h-4 bg-white/10" />
                <Link href="/settings" className="text-primary font-bold flex items-center gap-2">
                    <SettingsIcon size={20} />
                    <span className="text-[10px] uppercase font-black tracking-widest">Account</span>
                </Link>
            </div>
        </div>
    );
}
