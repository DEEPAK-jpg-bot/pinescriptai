import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-white dark:bg-page-dark font-sans text-zinc-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="h-12 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-page-dark/80 backdrop-blur-md flex items-center justify-center px-4">
                <nav className="w-full max-w-[768px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                            <ChevronLeft size={18} className="text-zinc-500" />
                        </Link>
                        <h1 className="text-sm font-bold tracking-tight">Privacy Policy</h1>
                    </div>
                </nav>
            </header>

            <main className="flex flex-col items-center py-20 px-6">
                <div className="w-full max-w-[768px] space-y-12 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter leading-none">Security Protocol</h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Last updated: February 14, 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
                        <section>
                            <h3 className="text-xl font-black tracking-tight mb-4">1. Information We Collect</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">We collect information to provide better services to all our users. This includes:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-600 dark:text-zinc-400 font-medium">
                                <li><strong className="text-zinc-900 dark:text-white">Account Information:</strong> When you sign up, we collect your email address via Supabase Authentication.</li>
                                <li><strong className="text-zinc-900 dark:text-white">Usage Data:</strong> We log the prompts you send to our AI and the code it generates to improve our service and prevent abuse.</li>
                                <li><strong className="text-zinc-900 dark:text-white">Payment Data:</strong> Payment processing is handled by Lemon Squeezy. We do not store your credit card information on our servers.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-black tracking-tight mb-4">2. How We Use Information</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect PineScript AI and our users.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-black tracking-tight mb-4">3. Data Security</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                We work hard to protect PineScript AI and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.
                            </p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">
                                Questions? Contact <Link href="mailto:support@pinegen.ai" className="text-primary hover:underline">support@pinegen.ai</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
