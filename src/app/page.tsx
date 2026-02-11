"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Terminal as TerminalIcon, Code, Zap, BarChart2, CheckCircle2, ArrowRight
} from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">{icon}</div>
        <h3 className="text-lg font-bold mb-2 text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const PricingCard = ({ plan, price, features, cta, popular }: { plan: string, price: string, features: string[], cta: string, popular?: boolean }) => (
    <div className={`p-8 rounded-2xl border ${popular ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200'} bg-white shadow-sm flex flex-col relative overflow-hidden`}>
        {popular && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{plan}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-4xl font-extrabold text-slate-900">${price}</span>
            <span className="text-slate-500 ml-2">/mo</span>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    {feature}
                </li>
            ))}
        </ul>
        <Link href="/dashboard" className="w-full">
            <Button id={`cta-pricing-${plan.toLowerCase()}`} className={`w-full h-12 text-base ${popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}>
                {cta}
            </Button>
        </Link>
    </div>
);

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
        <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">

            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PineGen",
                        "url": "https://pinescript.vercel.app",
                        "operatingSystem": "Web",
                        "applicationCategory": "FinTech / Trading Tool",
                        "description": "AI-powered Pine Script generator for TradingView. Create strategies in seconds.",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    })
                }}
            />

            {/* HEADER */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <nav className="max-w-7xl mx-auto flex items-center justify-between" aria-label="Main Navigation">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Code className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">PineGen</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 mr-8">
                        <Link href="/#pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">Log in</Link>
                        <Link href="/signup">
                            <Button id="cta-header-signup" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="pt-32 pb-20">
                {/* HERO SECTION */}
                <section className="px-6 mb-32" aria-labelledby="hero-title">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 id="hero-title" className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
                            PineScript generator <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">for modern traders.</span>
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Turn your trading strategies into code instantly. <br className="hidden md:block" />
                            Powered by advanced AI models trained on thousands of indicators.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button id="cta-hero-start-primary" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-2">
                                    Start Generating <ArrowRight size={20} />
                                </Button>
                            </Link>
                        </div>

                        {/* Hero Image / Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="mt-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl max-w-5xl mx-auto"
                        >
                            <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[16/9] relative flex items-center justify-center group">
                                <div className="absolute inset-0 bg-slate-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                <div className="relative z-10 text-center">
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-4 max-w-md mx-auto transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                                <Code size={16} />
                                            </div>
                                            <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-slate-50 rounded-full"></div>
                                            <div className="h-2 w-3/4 bg-slate-50 rounded-full"></div>
                                            <div className="h-2 w-5/6 bg-slate-50 rounded-full"></div>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Interactive Editor Preview</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* FEATURES SECTION */}
                <section className="py-24 px-6 bg-white border-y border-slate-200" aria-labelledby="features-title">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 id="features-title" className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">From simple indicators to complex backtesting strategies, PineGen handles it all.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <article>
                                <FeatureCard
                                    icon={<TerminalIcon size={24} />}
                                    title="Code Generation"
                                    description="Natural language to PineScript v6. Just describe your strategy."
                                />
                            </article>
                            <article>
                                <FeatureCard
                                    icon={<Code size={24} />}
                                    title="Pro Generation"
                                    description="Deeply optimized for Pine Script v6. Get clean, error-free strategy code."
                                />
                            </article>
                            <article>
                                <FeatureCard
                                    icon={<Zap size={24} />}
                                    title="Instant Refinement"
                                    description="Iterate on your code. Add filters, stops, and logic in seconds."
                                />
                            </article>
                            <article>
                                <FeatureCard
                                    icon={<BarChart2 size={24} />}
                                    title="Strategy Library"
                                    description="Access common patterns and indicator templates instantly."
                                />
                            </article>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section className="py-24 px-6 bg-slate-50" id="pricing" aria-labelledby="pricing-title">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 id="pricing-title" className="text-3xl font-bold text-slate-900 mb-4">Simple Pricing</h2>
                            <p className="text-slate-500">Start for free, upgrade when you need more power.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <PricingCard
                                plan="Free"
                                price="0"
                                features={["10 generations/month", "Standard speed", "Community support", "Basic templates"]}
                                cta="Get Started"
                            />
                            <PricingCard
                                plan="Pro"
                                price="29"
                                features={["Unlimited generations", "Fast execution", "Priority support", "GPT-4 Optimized Models"]}
                                cta="Upgrade to Pro"
                                popular
                            />
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-12 px-6 bg-white border-t border-slate-200">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs">P</div>
                            <span className="font-bold text-slate-900">PineGen</span>
                        </div>
                        <nav className="flex gap-8 text-slate-500 text-sm" aria-label="Footer Navigation">
                            <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-indigo-600 transition-colors">Contact</Link>
                        </nav>
                        <p className="text-slate-400 text-sm">© 2026 PineScript AI.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};
