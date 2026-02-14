import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AuthSync from "@/components/AuthSync";

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export const viewport: Viewport = {
    themeColor: "#4f46e5", // Updated to Indigo 600
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = {
    title: {
        default: "PineGen | AI-Powered Pine Script Generator for TradingView",
        template: "%s | PineGen"
    },
    description: "Instantly create TradingView strategies and indicators with AI. PineGen converts natural language into error-free Pine Script v6 code for modern traders.",
    keywords: ["Pine Script", "TradingView", "AI Strategy Generator", "Algo Trading", "PineScript v6", "Trading Bot", "Technical Indicators"],
    authors: [{ name: "PineGen Team" }],
    creator: "PineGen",
    publisher: "PineGen",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pinescript.vercel.app'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "PineGen - The Most Powerful AI Pine Script Generator",
        description: "Turn your trading ideas into code instantly. Optimized for v6 syntax.",
        url: 'https://pinescript.vercel.app',
        siteName: 'PineGen',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'PineGen Dashboard Preview',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "PineGen | Next-Gen Pine Script AI",
        description: "Generate indicators and strategies in seconds with natural language.",
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className={`${GeistSans.className} antialiased selection:bg-indigo-100 selection:text-indigo-900`}>
                <AuthSync />
                {children}
                <Toaster position="top-right" expand={false} richColors />
                <script src="https://app.lemonsqueezy.com/js/lemon.js" async />
            </body>
        </html>
    );
}
