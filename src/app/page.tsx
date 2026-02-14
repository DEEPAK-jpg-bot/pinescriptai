"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal as TerminalIcon, Code, Zap, CheckCircle2, ArrowRight, Check, X,
    ShieldCheck, Sparkles, Globe, Lock, Code2, Layers
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

declare global {
    interface Window {
        createLemonSqueezy: () => void;
        LemonSqueezy: {
            Url: {
                Open: (url: string) => void;
            };
            Setup: (config: { eventHandler: (event: any) => void }) => void;
        };
    }
}

export default function Landing() {
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

        // Initialize Lemon Squeezy Overlay
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

    const pricingPlans = [
        {
            id: 'free',
            name: "Free Access",
            price: "$0",
            period: "/monthly",
            desc: "For exploring the basics of Pine v6 logic.",
            features: ["10 generations / mo", "7-day chat history", "Basic strategy templates", "Community Discord"],
            buttonText: "Current Plan",
            buttonHref: "/signup",
            active: true,
            theme: "slate"
        },
        {
            id: 'pro',
            name: "Professional",
            price: "$19",
            period: "/monthly",
            desc: "Everything you need for active strategy building.",
            features: ["200 generations / mo", "+$0.15/extra generation", "30-day chat history", "Priority cloud queue", "Standard API Access"],
            buttonText: "Select Pro",
            buttonHref: "https://daredevil.lemonsqueezy.com/buy/893ad243-718e-4903-8758-15103ec4101e", // Variant 1307516
            highlight: false,
            theme: "emerald"
        },
        {
            id: 'trader',
            name: "The Trader",
            price: "$50",
            period: "/monthly",
            desc: "Institutional capacity for volume traders.",
            features: ["600 generations / mo", "+$0.10/extra generation", "90-day history sync", "Custom Logic Guardrails", "1-on-1 Discord Sprints", "Beta Logic Previews"],
            buttonText: "Upgrade to Trader",
            buttonHref: "https://daredevil.lemonsqueezy.com/buy/4579d46f-f232-475a-a320-f49553bc9697", // Variant 1307522
            highlight: true,
            theme: "indigo"
        },
        {
            id: 'pro_trader',
            name: "Pro Trader",
            price: "$100",
            period: "/monthly",
            desc: "The ultimate PineScript engine for firms.",
            features: ["1,500 generations / mo", "Unlimited history", "Full API logic control", "White-label support", "Direct Developer Link", "Custom Logic models"],
            buttonText: "Go Pro Trader",
            buttonHref: "https://daredevil.lemonsqueezy.com/buy/ebf22be5-21d7-463f-91a5-827d00f80695", // Variant 1307525
            highlight: false,
            theme: "violet"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
            {/* SEO JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PineGen AI",
                        "description": "High-accuracy Pine Script v6 generator for TradingView.",
                        "applicationCategory": "FinTech",
                        "operatingSystem": "Web",
                        "offers": { "@type": "Offer", "price": "19.00", "priceCurrency": "USD" }
                    })
                }}
            />

            {/* NAVBAR */}
            <header className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-[#020617]/80 backdrop-blur-2xl px-6 py-4">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                            <TerminalIcon size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            PineGen AI
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        {["Features", "Templates", "Pricing"].map((item) => (
                            <Link key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">
                                {item}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button className="h-10 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all">
                                    Strategy Lab
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Log In</Link>
                                <Link href="/signup">
                                    <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                        Join Free
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                {/* HERO */}
                <section className="relative pt-40 pb-32 px-6 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 group">
                        <div className="absolute top-0 left-1/4 w-[40%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
                        <div className="absolute bottom-0 right-1/4 w-[40%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse [animation-delay:1s]" />
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.3em] uppercase rounded-full bg-white/[0.03] text-indigo-400 border border-white/[0.08] backdrop-blur-md">
                            <Sparkles size={12} className="fill-indigo-400" />
                            v6 Engine Activated
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter">
                            Code your vision.<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
                                Trade with precision.
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            Stop debugging. Start backtesting. The world's most advanced AI engine <br className="hidden md:block" />
                            specifically trained for Pine Script v6 strict logical standards.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                                <Button className="h-14 px-10 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-white/10 flex items-center gap-3 group transition-all">
                                    {isLoggedIn ? "Resume Strategy" : "Start Building"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="#pricing">
                                <Button className="h-14 px-10 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                    Compare Tiers
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* PRICING - "Checkout Items Beautiful" */}
                <section id="pricing" className="py-32 px-6 bg-[#020617] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Choose Your Power</h2>
                            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Scalable limits for independent traders and institutional firms.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {pricingPlans.map((plan, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative flex flex-col p-1 rounded-[2.5rem] ${plan.highlight ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0_0_50px_-10px_rgba(79,70,229,0.3)] scale-[1.02]' : 'bg-white/[0.03] border border-white/[0.08]'}`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                                            Peak Performance
                                        </div>
                                    )}

                                    <div className={`flex flex-col flex-1 p-8 rounded-[2.3rem] ${plan.highlight ? 'bg-slate-900/90 backdrop-blur-3xl' : 'bg-[#020617]'}`}>
                                        <div className="mb-10">
                                            <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${plan.highlight ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                                                <span className="text-xs font-bold text-slate-500">{plan.period}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed min-h-[40px] uppercase tracking-wider">{plan.desc}</p>
                                        </div>

                                        <div className="space-y-4 mb-12 flex-1">
                                            {plan.features.map((feature, fi) => (
                                                <div key={fi} className="flex gap-4 items-start group">
                                                    <div className={`mt-0.5 p-1 rounded-md ${plan.highlight ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/[0.03] text-slate-600'}`}>
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                    <span className={`text-[11px] font-black uppercase tracking-widest ${plan.highlight ? 'text-slate-200' : 'text-slate-500'} group-hover:text-white transition-colors`}>
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => plan.buttonHref.startsWith('http') ? handleCheckout(plan.buttonHref) : router.push(plan.buttonHref)}
                                            disabled={plan.active && isLoggedIn}
                                            className={`w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${plan.highlight
                                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20'
                                                : plan.active && isLoggedIn
                                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'
                                                    : 'bg-white text-slate-950 hover:bg-slate-200'
                                                }`}
                                        >
                                            {plan.buttonText}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Visual Proof / Meta info */}
                        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { icon: <ShieldCheck className="text-emerald-500" />, label: "Secure Payments", sub: "Via Lemon Squeezy" },
                                { icon: <Lock className="text-indigo-400" />, label: "Private Logic", sub: "Your alpha is encrypted" },
                                { icon: <Globe className="text-violet-400" />, label: "Instant Access", sub: "Zero activation delay" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group p-6 rounded-3xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05]">
                                    <div className="p-3 bg-white/[0.03] rounded-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest">{item.label}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-20 bg-[#020617] border-t border-white/[0.03] text-center">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">P</div>
                            <span className="font-bold tracking-tight">PineGen AI</span>
                        </div>
                        <nav className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {["Dashboard", "Pricing", "Terms", "Privacy", "API Docs"].map(link => (
                                <Link key={link} href="#" className="hover:text-white transition-colors">{link}</Link>
                            ))}
                        </nav>
                        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
                            © 2026 PineScript AI. Precision Engineering for Market Alpha.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};
