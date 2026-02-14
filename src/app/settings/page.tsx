"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User, LogOut, FileText, CreditCard,
    ExternalLink, Zap, ShieldCheck, Clock,
    BarChart3, Settings as SettingsIcon,
    ChevronRight, ArrowUpRight
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
            await checkRateLimit(); // Refresh quota info
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
        if (tier === 'pro_trader') return { name: 'Pro Trader', color: 'from-violet-600 to-indigo-600', icon: <ShieldCheck className="text-violet-500" /> };
        if (tier === 'trader') return { name: 'Trader', color: 'from-indigo-500 to-blue-500', icon: <Zap className="text-indigo-500" /> };
        if (tier === 'pro') return { name: 'Pro', color: 'from-emerald-500 to-teal-500', icon: <User className="text-emerald-500" /> };
        return { name: 'Free Tier', color: 'from-slate-500 to-slate-600', icon: <User className="text-slate-400" /> };
    };

    const tierInfo = getTierDisplay();

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <BarChart3 className="text-indigo-600" size={20} />
                        </Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight">Account Settings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Main Info */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Profile Card */}
                        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tierInfo.color} p-[2px]`}>
                                    <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-slate-900">
                                        <User size={32} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-black text-slate-900 leading-none">Your Profile</h2>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${tierInfo.color}`}>
                                            {tierInfo.name}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-medium">{user?.email}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </section>

                        {/* 2. Usage Section */}
                        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">Usage & Capacity</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Monthly Generation Quota</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="space-y-1">
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{quotaInfo.remaining}</span>
                                            <span className="text-slate-400 font-bold text-lg ml-2">/ {quotaInfo.limit} remaining</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Usage Rate</span>
                                            <span className="text-sm font-black text-slate-600">{Math.round(((quotaInfo.limit - quotaInfo.remaining) / quotaInfo.limit) * 100)}%</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-in-out bg-gradient-to-r ${tierInfo.color}`}
                                            style={{ width: `${Math.max(5, (quotaInfo.remaining / quotaInfo.limit) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Clock className="text-slate-400" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Next Reset</p>
                                            <p className="text-sm font-bold text-slate-700">Daily Window (Floating)</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Zap className="text-amber-500" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Speed</p>
                                            <p className="text-sm font-bold text-slate-700">{quotaInfo.tier !== 'free' ? 'Priority Queue' : 'Standard Rate'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Subscription & Billing */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Subscription Card */}
                        <section className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-900/10 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center gap-2">
                                    <CreditCard size={14} /> Subscription
                                </h3>

                                <div className="mb-8">
                                    <p className="text-sm font-bold text-slate-400 mb-1">Current Plan</p>
                                    <p className="text-3xl font-black">{tierInfo.name}</p>
                                    <p className="text-xs text-indigo-300 font-bold mt-2 flex items-center gap-1.5 leading-none">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        {subscription?.status === 'active' ? 'Account in good standing' : 'Status: ' + (subscription?.status || 'Active')}
                                    </p>
                                </div>

                                {quotaInfo.tier === 'free' ? (
                                    <div className="space-y-4">
                                        <Link href="/?ref=upgrade#pricing">
                                            <Button className="w-full h-12 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black transition-all group">
                                                Upgrade Now <ArrowUpRight size={18} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Billing Information</p>
                                        <Button
                                            variant="outline"
                                            className="w-full h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold transition-all text-xs"
                                            onClick={() => window.open('https://daredevil.lemonsqueezy.com/billing', '_blank')}
                                        >
                                            Manage Dashboard <ExternalLink size={14} className="ml-2 opacity-50" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Quick Links */}
                        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 leading-none">Legal & Support</h4>
                            <nav className="space-y-1">
                                {[
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                    { label: 'Technical Support', href: 'mailto:support@pinegen.ai' },
                                ].map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.href}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-bold transition-all group"
                                    >
                                        {link.label}
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                    </Link>
                                ))}
                            </nav>
                        </section>
                    </div>
                </div>
            </main>

            {/* Sticky Mobile Nav Toggle (Optional) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center gap-6">
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                    <BarChart3 size={20} />
                </Link>
                <div className="w-px h-4 bg-white/10" />
                <Link href="/settings" className="text-indigo-400 font-bold flex items-center gap-2">
                    <SettingsIcon size={20} />
                    <span className="text-xs">Account</span>
                </Link>
            </div>
        </div>
    );
}
