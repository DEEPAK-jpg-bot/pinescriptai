import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import {
    Terminal as TerminalIcon, Code, Zap, BarChart3
} from 'lucide-react';
import PricingCard from '../components/ui/PricingCard';

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-6 rounded-lg border border-[#ffffff10] bg-[#ffffff05] hover:bg-[#ffffff08] transition-colors">
        <div className="text-[#10A37F] mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

const Landing = () => {
    return (
        <div className="relative min-h-screen bg-[#000000] text-white font-sans overflow-x-hidden">

            {/* HEADER */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#ffffff10] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#10A37F] rounded-sm flex items-center justify-center">
                        <Code className="text-white" size={20} />
                    </div>
                    <span className="text-lg font-bold tracking-tight">PineScript AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
                    <Link to="/signup">
                        <Button className="bg-[#10A37F] hover:bg-[#0E906F] text-white rounded-md px-4 py-2 text-sm font-medium transition-colors">
                            Sign up
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32">
                {/* HERO SECTION */}
                <section className="flex flex-col items-center text-center px-4 mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
                            PineScript generator <br />
                            <span className="text-[#10A37F]">for traders.</span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Turn your trading strategies into code instantly. <br />
                            Powered by advanced AI models.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup">
                                <Button className="h-12 px-8 bg-[#10A37F] hover:bg-[#0E906F] text-white rounded-md font-medium text-base transition-all">
                                    Start generating
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" className="h-12 px-8 bg-transparent border border-gray-600 text-white hover:bg-gray-800 rounded-md font-medium text-base">
                                    View demo
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* FEATURES SECTION */}
                <section className="py-24 px-6 border-t border-[#ffffff10] bg-[#111111]">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureCard
                                icon={<TerminalIcon size={24} />}
                                title="Code Generation"
                                description="Natural language to PineScript v6. Just describe your strategy."
                            />
                            <FeatureCard
                                icon={<Code size={24} />}
                                title="Editor Optimized"
                                description="Integrated environment to review and refine your scripts."
                            />
                            <FeatureCard
                                icon={<Zap size={24} />}
                                title="Instant Refinement"
                                description="Iterate on your code. Add filters, stops, and logic in seconds."
                            />
                            <FeatureCard
                                icon={<BarChart3 size={24} />}
                                title="Strategy Library"
                                description="Access common patterns and indicator templates instantly."
                            />
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section className="py-24 px-6 bg-black border-t border-[#ffffff10]">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-16">Pricing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <PricingCard
                                plan="Free"
                                price="0"
                                features={["10 generations/month", "Standard speed", "Community support"]}
                                cta="Get Started"
                            />
                            <PricingCard
                                plan="Pro"
                                price="29"
                                features={["Unlimited generations", "Fast speed", "Priority support", "Advanced models"]}
                                cta="Upgrade to Pro"
                                popular
                            />
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="py-12 px-6 border-t border-[#ffffff10] bg-black text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex gap-6 text-gray-400">
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                        <p>© 2026 PineScript AI.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Landing;
