import { getPostBySlug, getPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User, Code, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const post = await getPostBySlug((await params).slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.coverImage],
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
    };
}

export default async function BlogPostPage({ params }: any) {
    const post = await getPostBySlug((await params).slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        datePublished: post.date,
        dateModified: post.date,
        publisher: {
            '@type': 'Organization',
            name: 'PineGen',
            logo: {
                '@type': 'ImageObject',
                url: 'https://pinescript.vercel.app/logo.png', // Placeholder
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://pinescript.vercel.app/blog/${post.slug}`,
        },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://pinescript.vercel.app',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://pinescript.vercel.app/blog',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://pinescript.vercel.app/blog/${post.slug}`,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-50">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Header */}
            <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">P</div>
                            <span className="hidden sm:inline font-bold text-slate-900 tracking-tight">PineGen</span>
                        </Link>
                        {/* Breadcrumbs UI */}
                        <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
                            <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
                            <span className="mx-2">/</span>
                            <span className="text-slate-900 truncate max-w-[200px]">{post.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/signup">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">Try PineGen</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <div className="mb-8">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                        <ChevronLeft size={16} />
                        Back to all posts
                    </Link>
                </div>

                {/* Meta Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <span>{post.category}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User size={16} />
                            </div>
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                            <Calendar size={16} />
                            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                            <Share2 size={16} className="cursor-pointer hover:text-indigo-600 transition-colors" />
                            <span>Share</span>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-2xl border border-slate-100">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-3xl prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:p-1 prose-code:rounded prose-pre:bg-slate-900">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Footer Meta */}
                <footer className="mt-20 pt-10 border-t border-slate-100">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                            <Code size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Automate your TradingView strategies today.</h3>
                            <p className="text-slate-500 mb-6 max-w-lg">
                                Stop struggling with syntax errors. Let PineGen write your Pine Script v6 strategies in seconds.
                            </p>
                            <Link href="/signup">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">Get Started for Free</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-12 text-center">
                        <Link href="/blog" className="text-sm font-semibold text-indigo-600 hover:underline">
                            View all articles
                        </Link>
                    </div>
                </footer>
            </article>

            {/* Newsletter Simple */}
            <section className="bg-white border-t border-slate-100 py-16 px-6">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h2>
                    <p className="text-slate-500 mb-8">Get the latest PineScript v6 updates and TradingView strategies in your inbox.</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6">Subscribe</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
