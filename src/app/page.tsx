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
    Layout,
    ArrowUpRight
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

        // Optimized Lemon Squeezy Init
        const initLS = () => {
            if (window.createLemonSqueezy) {
                window.createLemonSqueezy();
                if (window.LemonSqueezy) {
                    window.LemonSqueezy.Setup({
                        eventHandler: (event) => {
                            if (event.event === 'Checkout.Success') {
                                console.log('Successfully upgraded!');
                                window.location.reload();
                            }
                        }
                    });
                }
            } else {
                setTimeout(initLS, 500);
            }
        };
        initLS();
    }, [router, supabase, searchParams]);

    const handleCheckout = (url: string) => {
        if (window.LemonSqueezy) {
            window.LemonSqueezy.Url.Open(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-page-dark text-zinc-900 dark:text-white font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">

            {/* Header */}
            <header className="h-12 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-page-dark/80 backdrop-blur-md flex items-center justify-center px-4">
                <nav className="w-full max-w-[768px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <TerminalIcon size={12} className="text-white fill-white" />
                        </div>
                        <h1 className="text-sm font-bold tracking-tight">PineScript AI <span className="text-emerald-500 font-extrabold">v6</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Client Node</Link>
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button size="sm" className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest px-4">Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href="/signup">
                                <Button size="sm" className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest px-4">Initialize</Button>
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex flex-col items-center">
                {/* HERO */}
                <section className="w-full max-w-[768px] px-6 py-24 md:py-32 space-y-12">
                    <div className="space-y-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                            <Sparkles size={12} className="fill-emerald-500" /> New v6 Logic Engine
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
                        >
                            Institutional <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">Pine Script Lab.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-500 dark:text-zinc-400 text-lg font-medium max-w-lg mx-auto leading-relaxed"
                        >
                            Turn complex trading logic into high-accuracy v6 indicators and strategies instantly. Verified against modern TradingView standards.
                        </motion.p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/signup" className="w-full md:w-auto">
                            <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest px-10 shadow-xl shadow-emerald-500/20 transition-all active:scale-95">
                                Start Free Session
                            </Button>
                        </Link>
                        <Link href="#pricing" className="w-full md:w-auto">
                            <Button variant="outline" className="w-full h-14 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest px-10 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all">
                                View Scalable Tiers
                            </Button>
                        </Link>
                    </div>
                </section>

                <div className="w-full max-w-[768px] px-6 space-y-32 py-20 pb-40">

                    {/* FEATURES (3 cards) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: "v6 Runtime", desc: "Native support for the latest TradingView Pine Script v6 runtime and logic components.", icon: <Zap size={20} /> },
                            { title: "Risk Engine", desc: "Automated inclusion of TP/SL, trailing stops, and volume-based position sizing.", icon: <ShieldCheck size={20} /> },
                            { title: "Logic Verification", desc: "Real-time checking for look-ahead bias and non-repainting assurance.", icon: <Target size={20} /> }
                        ].map((f, i) => (
                            <div key={i} className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-3xl space-y-4 group hover:border-emerald-500/30 transition-all">
                                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">{f.icon}</div>
                                <h3 className="text-lg font-black tracking-tight leading-none pt-2">{f.title}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed font-bold uppercase tracking-widest">{f.desc}</p>
                            </div>
                        ))}
                    </section>

                    {/* PRICING */}
                    <section id="pricing" className="space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter">Scalable Power.</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">From independent testers to institutional logic deployment.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {([
                                { name: "Lab", price: "$0", features: ["10 gens / mo", "7-day history", "Standard Speed"], href: "/signup" },
                                { name: "Pro", price: "$19", features: ["200 gens / mo", "30-day history", "Priority Queue"], highlight: true, href: "https://daredevil.lemonsqueezy.com/buy/893ad243-718e-4903-8758-15103ec4101e" },
                                { name: "Trader", price: "$50", features: ["600 gens / mo", "90-day history", "Priority Queue", "v6 Multi-logic"], href: "https://daredevil.lemonsqueezy.com/buy/4579d46f-f232-475a-a320-f49553bc9697" },
                                { name: "Pro Trader", price: "$100", features: ["Unlimited gens", "Infinite history", "24/7 Priority", "Early v7 Access"], href: "https://daredevil.lemonsqueezy.com/buy/ebf22be5-21d7-463f-91a5-827d00f80695" }
                            ] as { name: string, price: string, features: string[], href: string, highlight?: boolean }[]).map((p, i) => (
                                <div key={i} className={cn(
                                    "relative p-1.5 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02]",
                                    p.highlight ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]" : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                                )}>
                                    {p.highlight && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-20">
                                            Most Popular
                                        </div>
                                    )}
                                    <div className="bg-white dark:bg-zinc-900 h-full p-8 rounded-[2rem] flex flex-col items-center text-center space-y-8">
                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{p.name}</h3>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-4xl font-black tracking-tighter">{p.price}</span>
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">/dev</span>
                                            </div>
                                        </div>

                                        <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800" />

                                        <ul className="space-y-4 flex-1">
                                            {p.features.map((f, fi) => (
                                                <li key={fi} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                                                    <Check size={14} className="text-emerald-500" /> {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => p.href.startsWith('http') ? handleCheckout(p.href) : router.push(p.href)}
                                            className={cn(
                                                "w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.97] group flex items-center justify-center gap-2",
                                                p.highlight
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            {p.price === "$0" ? "Initialize" : "Select Tier"}
                                            {p.highlight && <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-transparent">
                <div className="w-full max-w-[768px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center">
                                <TerminalIcon size={16} />
                            </div>
                            <h4 className="font-bold tracking-tight">PineScript AI</h4>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xs">
                            The definitive platform for TradingView v6 logic generation. Engineered for high-speed development and market-ready precision.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Network</h5>
                            <nav className="flex flex-col gap-3">
                                <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Login</Link>
                                <Link href="/signup" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Register</Link>
                                <Link href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Pricing</Link>
                            </nav>
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Terminal</h5>
                            <nav className="flex flex-col gap-3">
                                <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Privacy</Link>
                                <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Terms</Link>
                                <Link href="mailto:support@pinegen.ai" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Support</Link>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="w-full max-w-[768px] mx-auto px-6 pt-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 opacity-50">© 2026 PINESCRIPT AI LOGIC NETWORK. ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
        </div>
    );
}

export default function Landing() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center font-black tracking-tighter text-emerald-500 animate-pulse uppercase">Initializing v6 Logic Engine...</div>}>
            <LandingContent />
        </Suspense>
    );
}
