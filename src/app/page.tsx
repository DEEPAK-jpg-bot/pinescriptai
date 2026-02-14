"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Terminal as TerminalIcon, Code, Zap, CheckCircle2, ArrowRight, Check, X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Landing() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                // Redirect ONLY if not specifically visiting pricing via upgrade link
                const isPricingReq = window.location.hash === '#pricing' || searchParams.get('ref') === 'upgrade';
                if (!isPricingReq) {
                    router.push('/dashboard');
                }
            }
        };
        checkUser();
    }, [router, supabase, searchParams]);

    const pricingPlans = [
        {
            name: "Free",
            price: "$0",
            period: "/mo",
            desc: "Explore Pine v6 basic logic.",
            features: ["10 generations / mo", "7-day chat history", "Basic templates"],
            buttonText: "Current Plan",
            buttonHref: "/signup",
            active: true
        },
        {
            name: "Pro",
            price: "$19",
            period: "/mo",
            desc: "For serious active traders.",
            features: ["200 generations / mo", "+$0.15/extra gen", "30-day chat history", "Priority queue"],
            buttonText: "Start Pro",
            buttonHref: "https://daredevil.lemonsqueezy.com/checkout/buy/9da03299-5619-4254-a7d7-1281da82c5b3?media=0&logo=0&desc=0&discount=0",
            highlight: false
        },
        {
            name: "Trader",
            price: "$50",
            period: "/mo",
            desc: "Advanced logic & institutional speed.",
            features: ["600 generations / mo", "+$0.10/extra gen", "90-day history", "Discord access"],
            buttonText: "Go Trader",
            buttonHref: "https://daredevil.lemonsqueezy.com/checkout/buy/4fdf2b32-6a7e-40af-a89e-4a6f26478954", // Using a trader variant if possible
            highlight: true
        },
        {
            name: "Pro Trader",
            price: "$100",
            period: "/mo",
            desc: "The ultimate PineScript machine.",
            features: ["1,500 generations / mo", "Unlimited history", "Priority Support"],
            buttonText: "Go Pro Trader",
            buttonHref: "https://daredevil.lemonsqueezy.com/checkout/buy/90c74f51-7f99-4d6d-8951-6453995817c1",
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
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
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl px-6 py-4">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                            <TerminalIcon size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">PineGen AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
                        <Link href="#templates" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Templates</Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-lg px-6 font-bold text-xs uppercase tracking-widest">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Log In</Button>
                            </Link>
                        )}
                        {!isLoggedIn && (
                            <Link href="/signup">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 font-bold text-xs uppercase tracking-widest transition-all">
                                    Join Now
                                </Button>
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-32 pb-40 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                                Professional PineScript v6<br />
                                <span className="text-indigo-500">Without the Bugs.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
                                Institutional-grade code generation with strict logical alignment. <br />
                                Stop fixing AI errors. Start trading strategies.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                                    <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20">
                                        Launch Strategy Lab
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* PRICING SECTION - Standardized */}
                <section id="pricing" className="py-24 px-6 bg-white text-slate-900 border-t border-slate-200">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black mb-4 tracking-tight">Standard Plans</h2>
                            <p className="text-slate-500 font-medium">Simple, flat pricing for traders of all levels.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {pricingPlans.map((plan, i) => (
                                <div key={i} className={`flex flex-col p-8 rounded-2xl border ${plan.highlight ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' : 'border-slate-200 bg-white shadow-sm'} transition-all hover:shadow-md`}>
                                    <h3 className="text-base font-black text-slate-900 mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        <span className="text-sm font-bold text-slate-400">{plan.period}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-8 leading-relaxed">{plan.desc}</p>

                                    <ul className="space-y-4 mb-10 flex-1">
                                        {plan.features.map((feature, fi) => (
                                            <li key={fi} className="flex items-start gap-3 text-xs font-bold text-slate-600">
                                                <Check size={14} className="text-indigo-600 mt-0.5" strokeWidth={3} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link href={plan.buttonHref} target={plan.buttonHref.startsWith('http') ? '_blank' : '_self'}>
                                        <Button
                                            disabled={plan.active}
                                            className={`w-full h-11 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all ${plan.highlight
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                                } ${plan.active ? 'opacity-30' : ''}`}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-12 bg-slate-50 border-t border-slate-200 text-center">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
                        <div className="font-black text-slate-900 tracking-tight">PineGen AI</div>
                        <nav className="flex gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
                            <Link href="mailto:support@pinegen.ai" className="hover:text-indigo-600 transition-colors">Support</Link>
                        </nav>
                        <p className="text-slate-400 text-[10px] font-bold">© 2026 PineScript AI. Institutional coding standards enforced.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};
