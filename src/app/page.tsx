"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Terminal as TerminalIcon, Code, Zap, CheckCircle2, ArrowRight, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Landing() {
    const router = useRouter();
    const supabase = createClient();

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            }
        };
        checkUser();
    }, [router, supabase]);

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
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <TerminalIcon size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            PineGen AI
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Why We&apos;re Different</Link>
                        <Link href="#templates" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Templates</Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Log In</Link>
                        <Link href="/signup">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 transition-all hover:scale-105 active:scale-95">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-32 pb-40 px-6 overflow-hidden text-center">
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Powered by v6 Logic Engine
                            </span>
                            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tight">
                                PineScript AI<br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">
                                    The Future of Trading.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                                The most accurate PineScript v6 code generator. <br />
                                Production-ready strategies that work on the first try.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup">
                                    <Button className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-2xl shadow-indigo-600/30 flex items-center gap-2 group transition-all hover:-translate-y-1">
                                        Generate Your Strategy <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="#pricing">
                                    <Button variant="outline" className="h-14 px-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-all active:scale-95">
                                        View Plans
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Stats Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8 px-8 py-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md"
                        >
                            <div className="space-y-1">
                                <div className="text-3xl lg:text-5xl font-black text-indigo-400">10,000+</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Users</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl lg:text-5xl font-black text-violet-400">500K+</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Code Generated</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl lg:text-5xl font-black text-emerald-400">100%</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Accuracy Rate</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl lg:text-5xl font-black text-amber-400">90%</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Time Saved</div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* WHY WE ARE DIFFERENT */}
                <section id="features" className="py-32 px-6 border-y border-white/5 bg-[#030712]">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-20 items-center text-left">
                            <div className="lg:w-1/2">
                                <span className="text-indigo-500 font-bold uppercase tracking-widest text-xs mb-4 block">Proven Performance</span>
                                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                                    Why We&apos;re Different:<br />
                                    <span className="text-slate-400 italic font-medium">The Only AI That Generates 100% Accurate v6 Code</span>
                                </h2>
                                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                                    Other AI tools generate broken PineScript code because they rely on outdated models.
                                    Our strict rule-book approach ensures every line of code is production-ready.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { title: "100% Code Accuracy", desc: "Our AI follows a comprehensive rule book for PineScript v6. Every generated strategy works on the first paste.", icon: <CheckCircle2 className="text-emerald-500" /> },
                                        { title: "Type-Safe Code", desc: "Generates explicit type annotations, UDTs, and error handling as standard.", icon: <Code className="text-indigo-400" /> },
                                        { title: "30% Faster Backtesting", desc: "Optimized with 'var' caching and efficient loops for high-speed testing.", icon: <Zap className="text-amber-400" /> }
                                    ].map((f, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                            <div className="mt-1">{f.icon}</div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">{f.title}</h4>
                                                <p className="text-sm text-slate-500">{f.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-violet-600 blur-[80px] opacity-20 rounded-full" />
                                <div className="relative rounded-3xl border border-white/10 bg-[#0a0f1d] p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden group">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                    </div>
                                    <div className="space-y-4 font-mono text-xs md:text-sm text-slate-400">
                                        <div className="flex gap-4 border-l-2 border-indigo-500/50 pl-4">
                                            <span className="text-indigo-400">1</span>
                                            <span>//@version=6</span>
                                        </div>
                                        <div className="flex gap-4 border-l-2 border-indigo-500/50 pl-4">
                                            <span className="text-indigo-400">2</span>
                                            <span className="text-amber-300">strategy</span>(&quot;Alpha Seeker&quot;, overlay=<span className="text-white">true</span>)
                                        </div>
                                        <div className="flex gap-4 pl-4 font-normal">
                                            <span className="text-slate-600">3</span>
                                            <span className="text-slate-500 italic">// Rule-based logic enforcement...</span>
                                        </div>
                                        <div className="flex gap-4 pl-4 group-hover:bg-indigo-500/10 transition-colors">
                                            <span className="text-indigo-400">4</span>
                                            <span className="text-violet-400">float</span> entry_price = <span className="text-indigo-300">array.get</span>(prices, <span className="text-white">0</span>)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TEMPLATES SECTION */}
                <section id="templates" className="py-32 px-6 bg-[#030712]">
                    <div className="max-w-6xl mx-auto text-center mb-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Quick Start Templates</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Click a core concept to see how PineGen handles institutional-grade logic.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { icon: "🏦", title: "Smart Money Concepts", desc: "Create a Smart Money Concepts (SMC) indicator showing market structure (BOS/CHoCH), order blocks, fair value gaps, premium/discount zones, and liquidity levels. Include swing highs/lows detection." },
                            { icon: "📊", title: "Volume Profile", desc: "Build a Volume Profile indicator showing Point of Control (POC), Value Area High/Low (VAH/VAL), and volume distribution across price levels. Include session-based analysis." },
                            { icon: "📦", title: "Order Blocks", desc: "Create an Order Block detection indicator that identifies bullish and bearish order blocks with mitigation detection. Include optimal entry zones and stop loss placement." },
                            { icon: "⚡", title: "Supply & Demand", desc: "Build a Supply and Demand zone indicator with automatic zone detection, zone strength scoring, and retest alerts. Include flip zones and fresh vs tested zones." }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all text-left group"
                            >
                                <div className="text-4xl mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">{t.icon}</div>
                                <h3 className="text-xl font-bold mb-4">{t.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">{t.desc}</p>
                                <Button variant="link" className="text-indigo-400 p-0 font-bold group-hover:text-white transition-colors">Generate Prototype →</Button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section id="pricing" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">Choose the plan that fits your trading needs. All plans include our 100% accuracy guarantee.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* FREE */}
                            <div className="p-8 pb-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-colors group text-left">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Current Plan</span>
                                <h3 className="text-xl font-bold mb-4">Free</h3>
                                <div className="text-4xl font-black mb-8">$0</div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> 10 gens / mo</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> 7-day chat history</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> Basic templates</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> Community support</li>
                                </ul>
                                <Button disabled className="w-full h-12 rounded-2xl bg-white/10 text-white font-bold opacity-50">Active Plan</Button>
                            </div>

                            {/* PRO */}
                            <div className="p-8 pb-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-colors relative group text-left">
                                <h3 className="text-xl font-bold mb-4 text-white">Pro</h3>
                                <div className="text-4xl font-black mb-1">$19</div>
                                <div className="text-xs font-bold text-slate-500 mb-8 lowercase">/month</div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-slate-300 font-bold"><CheckCircle2 size={16} className="text-indigo-500" /> 200 gens / mo</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> +$0.15/extra</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> 30-day chat history</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> Priority queue</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={16} className="text-indigo-500" /> Email support</li>
                                </ul>
                                <Link href="https://daredevil.lemonsqueezy.com/checkout/buy/9da03299-5619-4254-a7d7-1281da82c5b3?media=0&logo=0&desc=0&discount=0" target="_blank">
                                    <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95">Start Pro Trial</Button>
                                </Link>
                            </div>

                            {/* TRADER - POPULAR */}
                            <div className="p-8 pb-10 rounded-[2.5rem] bg-indigo-600/10 border-2 border-indigo-500/50 flex flex-col relative scale-[1.05] z-10 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] text-left">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</div>
                                <h3 className="text-xl font-bold mb-4 text-white">Trader</h3>
                                <div className="text-4xl font-black mb-1 text-white">$50</div>
                                <div className="text-xs font-bold text-indigo-300/60 mb-8 lowercase">/month</div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-white font-bold"><CheckCircle2 size={16} className="text-indigo-400" /> 600 gens / mo</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-400" /> +$0.10/extra</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-400" /> 90-day history</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-400" /> Strategy library</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-400" /> Discord support</li>
                                </ul>
                                <Link href="https://daredevil.lemonsqueezy.com/checkout/buy/9da03299-5619-4254-a7d7-1281da82c5b3?media=0&logo=0&desc=0&discount=0" target="_blank">
                                    <Button className="w-full h-12 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 font-black transition-all active:scale-95">Get Started</Button>
                                </Link>
                            </div>

                            {/* PRO TRADER */}
                            <div className="p-8 pb-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-colors group text-left">
                                <h3 className="text-xl font-bold mb-4 text-white">Pro Trader</h3>
                                <div className="text-4xl font-black mb-1">$100</div>
                                <div className="text-xs font-bold text-slate-500 mb-8 lowercase">/month</div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-slate-300 font-bold"><CheckCircle2 size={16} className="text-indigo-500" /> 1,500 gens / mo</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-500" /> Unlimited history</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-500" /> 1-on-1 onboarding</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-500" /> API access (Beta)</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-indigo-500" /> 24/7 Priority Support</li>
                                </ul>
                                <Link href="https://daredevil.lemonsqueezy.com/checkout/buy/9da03299-5619-4254-a7d7-1281da82c5b3?media=0&logo=0&desc=0&discount=0" target="_blank">
                                    <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 font-bold transition-all active:scale-95">Go Pro Trader</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 text-slate-500 text-sm font-medium border-t border-white/5 pt-12 text-center">
                            <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> 100% accuracy guarantee</div>
                            <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Cancel anytime</div>
                            <div className="flex items-center gap-2">
                                <span className="p-1 px-2 rounded-md bg-white/5 border border-white/10 text-[10px] text-white flex items-center gap-1.5 leading-none">
                                    <Zap size={10} className="fill-amber-400 text-amber-400" /> Secure via Lemon Squeezy
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 bg-slate-950 text-center">
                    <p className="text-slate-400 mb-4">Need more generations or white-labeling?</p>
                    <Link href="mailto:enterprise@pinegen.ai" className="text-indigo-400 font-bold hover:text-white transition-colors underline decoration-indigo-500/30 underline-offset-8">
                        Contact us for enterprise pricing →
                    </Link>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="py-12 px-6 border-t border-white/5 bg-[#030712] text-center">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/20">P</div>
                        <span className="font-bold text-white tracking-tight">PineGen AI</span>
                    </div>
                    <nav className="flex gap-8 text-slate-400 text-sm font-medium">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="mailto:support@pinegen.ai" className="hover:text-white transition-colors">Contact</Link>
                    </nav>
                    <p className="text-slate-500 text-xs font-medium tracking-tight">© 2026 PineScript AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
