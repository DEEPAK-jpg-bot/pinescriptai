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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { createConversation } = useChatStore();
    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <div className={cn("flex h-screen w-full bg-white dark:bg-page-dark transition-colors duration-300 overflow-hidden", isDarkMode && "dark")}>
            <Sidebar />

            <main className="flex-1 flex flex-col relative h-full">
                {/* HEADER (Sticky Top, 48px) */}
                <header className="h-12 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-page-dark/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu size={18} />
                        </Button>
                        <h1 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Sparkles size={12} className="text-white fill-white" />
                            </div>
                            PineScript AI <span className="text-emerald-500 font-extrabold">v6</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => createConversation()}
                            className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors"
                            title="New Chat"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors"
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
