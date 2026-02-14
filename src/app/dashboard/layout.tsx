"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Sparkles,
    Moon,
    Sun,
    Menu,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { createConversation } = useChatStore();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className={cn("flex h-screen w-full bg-white dark:bg-page-dark transition-colors duration-300 overflow-hidden", isDarkMode && "dark")}>
            {/* DESKTOP SIDEBAR */}
            <Sidebar />

            {/* MOBILE SIDEBAR OVERLAY */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        className="w-[280px] h-full bg-zinc-100 dark:bg-sidebar-dark shadow-2xl"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <Sidebar />
                    </motion.div>
                </div>
            )}

            <main className="flex-1 flex flex-col relative h-full">
                {/* HEADER (Sticky Top, 48px) */}
                <header className="h-12 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-page-dark/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={18} />
                        </Button>
                        <h1 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                                <Sparkles size={12} className="text-white fill-white" />
                            </div>
                            PineScript AI <span className="text-primary font-extrabold">v6</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => createConversation()}
                            className="p-2 text-zinc-500 hover:text-primary transition-colors"
                            title="New Chat"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 text-zinc-500 hover:text-primary transition-colors"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
