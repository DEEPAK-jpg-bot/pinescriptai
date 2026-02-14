"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Terminal as TerminalIcon,
    ArrowRight,
    Check,
    Zap,
    ShieldCheck,
    Sparkles,
    Globe,
    Lock,
    Target,
    BarChart3,
    Code2,
    Settings,
    Copy,
    Layout
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        createLemonSqueezy: () => void;
        LemonSqueezy: {
            Url: {
                Open: (url: string) => void;
            };
            Setup: (options: { eventHandler: (event: any) => void }) => void;
        };
    }
}

function LandingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                const isPricingReq = window.location.hash === '#pricing' || searchParams.get('ref') === 'upgrade';
                if (!isPricingReq) {
                    router.push('/dashboard');
                }
            }
        };
        checkUser();

        if (typeof window !== 'undefined' && window.createLemonSqueezy) {
            window.createLemonSqueezy();
        }
    }, [router, supabase, searchParams]);

    const handleCheckout = (url: string) => {
        if (window.LemonSqueezy) {
            window.LemonSqueezy.Url.Open(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-page-dark text-zinc-900 dark:text-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* HEADER (Sticky Top, 48px) */}
            <header className="h-12 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-page-dark/80 backdrop-blur-md flex items-center justify-center px-4">
                <nav className="w-full max-w-[768px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black">
                            <TerminalIcon size={14} />
                        </div>
                        <span className="text-sm font-bold tracking-tight">PineScript AI <span className="text-emerald-500">v6</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Log In</Link>
                        <Link href="/signup">
                            <Button className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 font-bold text-[10px] uppercase tracking-widest transition-all">
                                Join Free
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex flex-col items-center py-20 px-6">
                <div className="w-full max-w-[768px] space-y-32">

                    {/* HERO SECTION */}
                    <section className="text-center pt-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-100 dark:border-emerald-500/20">
                                <Sparkles size={12} className="fill-emerald-500" />
                                Institutional v6 Intelligence
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[0.95] tracking-tighter">
                                Code your vision.<br />
                                <span className="text-emerald-500">Trade with precision.</span>
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-12 font-medium leading-relaxed max-w-xl mx-auto">
                                The world's most advanced AI engine specifically trained for Pine Script v6 professional standards. Non-stop alpha.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup" className="w-full sm:w-auto">
                                    <Button className="w-full h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all">
                                        Start Building <ArrowRight size={16} />
                                    </Button>
                                </Link>
                                <Link href="/login" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full h-12 px-8 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-white transition-all">
                                        View Tutorials
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </section>

                    {/* TRUST INDICATORS (4 boxes) */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: <Target className="text-emerald-500" />, label: "99.9%", sub: "Accuracy" },
                            { icon: <ShieldCheck className="text-emerald-500" />, label: "Secure", sub: "Logic" },
                            { icon: <Zap className="text-emerald-500" />, label: "Instant", sub: "v6 Code" },
                            { icon: <Globe className="text-emerald-500" />, label: "Live", sub: "Markets" }
                        ].map((t, i) => (
                            <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl text-center space-y-2 group hover:border-emerald-500/50 transition-all">
                                <div className="mx-auto w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{t.icon}</div>
                                <div className="text-lg font-bold">{t.label}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.sub}</div>
                            </div>
                        ))}
                    </section>

                    {/* FEATURE CARDS (3 cards) */}
                    <section className="space-y-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight">Powerful Capabilities</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Logic Conversion", desc: "Easily migrate from legacy v4/v5 code to the latest v6 specifications instantly.", icon: <Code2 /> },
                                { title: "Alpha Generation", desc: "Convert backtesting ideas into production-ready strategies with robust risk management.", icon: <BarChart3 /> },
                                { title: "Institutional Quality", desc: "Compiler-level checks ensure your code follows strict TradingView logical alignment.", icon: <Lock /> }
                            ].map((f, i) => (
                                <div key={i} className="p-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-4 hover:-translate-y-1 transition-all shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">{f.icon}</div>
                                    <h3 className="text-xl font-bold">{f.title}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* TEMPLATES (4 buttons) */}
                    <section className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Build from Base</h2>
                            <p className="text-sm text-zinc-500 font-medium">Standard modules to accelerate your development.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Mean Reversion", icon: <Target size={14} /> },
                                { label: "Trend Following", icon: <Zap size={14} /> },
                                { label: "News Scraper", icon: <Globe size={14} /> },
                                { label: "Grid Trader", icon: <Layout size={14} /> }
                            ].map((t, i) => (
                                <button key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl flex flex-col items-center gap-3 hover:border-emerald-500 hover:text-emerald-500 transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {t.icon}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* PRICING (4 tiers) */}
                    <section id="pricing" className="space-y-12 pb-20">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold tracking-tight mb-4">Scalable Tiers</h2>
                            <p className="text-zinc-500 font-medium">From independent traders to institutional firms.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {([
                                { name: "Free", price: "$0", features: ["10 gens / mo", "7-day history"], href: "/signup" },
                                { name: "Pro", price: "$19", features: ["200 gens / mo", "30-day history"], highlight: true, href: "https://daredevil.lemonsqueezy.com/buy/893ad243-718e-4903-8758-15103ec4101e" },
                                { name: "Trader", price: "$50", features: ["600 gens / mo", "90-day history"], href: "https://daredevil.lemonsqueezy.com/buy/4579d46f-f232-475a-a320-f49553bc9697" },
                                { name: "Pro Trader", price: "$100", features: ["Unlimited gens", "Infinite history"], href: "https://daredevil.lemonsqueezy.com/buy/ebf22be5-21d7-463f-91a5-827d00f80695" }
                            ] as { name: string, price: string, features: string[], href: string, highlight?: boolean }[]).map((p, i) => (
                                <div key={i} className={cn(
                                    "p-8 bg-white dark:bg-zinc-800 border-2 rounded-2xl flex flex-col transition-all hover:scale-[1.02]",
                                    p.highlight ? "border-emerald-500 shadow-xl shadow-emerald-500/10" : "border-zinc-200 dark:border-zinc-700"
                                )}>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">{p.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-bold">{p.price}</span>
                                        <span className="text-xs text-zinc-500 font-medium">/mo</span>
                                    </div>
                                    <ul className="space-y-4 mb-10 flex-1">
                                        {p.features.map((f, fi) => (
                                            <li key={fi} className="flex items-center gap-3 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                                                <Check size={14} className="text-emerald-500" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => p.href.startsWith('http') ? handleCheckout(p.href) : router.push(p.href)}
                                        className={cn(
                                            "w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                            p.highlight ? "bg-emerald-500 text-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600"
                                        )}
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <div className="w-full max-w-[768px] mx-auto px-6 space-y-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
                        © 2026 PineScript AI • Professional Trading Infrastructure
                    </p>
                    <nav className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <Link href="/terms" className="hover:text-emerald-500 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy</Link>
                        <Link href="mailto:support@pinegen.ai" className="hover:text-emerald-500 transition-colors">Support</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

export default function Landing() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-page-dark flex items-center justify-center text-emerald-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing v6 Engine...</div>}>
            <LandingContent />
        </Suspense>
    );
}
