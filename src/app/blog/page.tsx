import Link from 'next/link';
import { getPosts } from '@/lib/posts';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, Code } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | PineScript v6 Guides & AI Trading Tips',
    description: 'Learn how to master TradingView Pine Script with our expert guides, AI coding tips, and strategy tutorials.',
};

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <nav className="w-full bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Code className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">PineGen</span>
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Trading Strategy & <span className="text-indigo-600">PineScript Blog</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Expert insights into automated trading, AI-powered development, and mastering Pine Script v6.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                            <Card className="h-full border-slate-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <CardHeader className="p-6 pb-2">
                                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {post.title}
                                    </h2>
                                </CardHeader>
                                <CardContent className="p-6 pt-2 flex-1">
                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 italic">
                                        {post.excerpt}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 flex items-center justify-between text-[11px] font-medium text-slate-400 border-t border-slate-50 mt-4">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User size={12} />
                                            By {post.author}
                                        </span>
                                    </div>
                                    <ArrowRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" size={14} />
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            {/* CTA Section */}
            <section className="bg-indigo-900 py-20 px-6 text-center mt-20">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to automate your trading?</h2>
                    <p className="text-indigo-100 mb-10 text-lg opacity-80">
                        Join 2,000+ traders using PineGen to create error-free Pine Script in seconds.
                    </p>
                    <Link href="/signup">
                        <Button className="h-14 px-10 bg-white text-indigo-900 hover:bg-slate-100 font-bold text-lg rounded-xl shadow-lg">
                            Get Started Free
                        </Button>
                    </Link>
                </div>
            </section>

            <footer className="py-12 px-6 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs uppercase">P</div>
                        <span className="font-bold text-slate-900">PineGen</span>
                    </Link>
                    <p className="text-slate-400 text-xs">© 2026 PineScript AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
