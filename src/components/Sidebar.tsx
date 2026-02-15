"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    MessageSquare, Plus, Trash2, Zap,
    LogOut, ChevronLeft, ChevronRight, User,
    Crown, BarChart3, Settings
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const router = useRouter();
    const supabase = createClient();
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        createConversation,
        deleteConversation,
        user,
        quotaInfo
    } = useChatStore();

    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className={cn(
            "h-full flex flex-col bg-zinc-100 dark:bg-sidebar-dark border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 relative group/sidebar",
            isCollapsed ? "md:w-16" : "md:w-64",
            "w-full"
        )}>
            {/* Top Section: Brand & New Chat */}
            <div className="p-4 flex flex-col gap-4">
                <button
                    onClick={() => createConversation()}
                    className={cn(
                        "w-full h-10 flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl font-semibold text-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:scale-[1.02] active:scale-[0.98]",
                        isCollapsed ? "px-0" : "px-4"
                    )}
                >
                    <Plus size={18} className="text-primary" />
                    {!isCollapsed && <span>New Chat</span>}
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
                {!isCollapsed && (
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">Recent chats</p>
                )}
                <div className="space-y-1">
                    {conversations.map((convo) => (
                        <div key={convo.id} className="relative group">
                            <button
                                onClick={() => setActiveConversation(convo.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                                    activeConversationId === convo.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/10"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                                )}
                            >
                                <MessageSquare size={16} className={cn(
                                    activeConversationId === convo.id ? "text-white" : "text-primary"
                                )} />
                                {!isCollapsed && (
                                    <span className="truncate flex-1 text-left leading-none font-medium">
                                        {convo.title || "Untitled Chat"}
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && activeConversationId === convo.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Delete session?")) deleteConversation(convo.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={12} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section: Usage, Upgrade, Profile */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                {!isCollapsed && (
                    <div className="px-1 space-y-3">
                        {/* Usage indicator */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                                <span>Gens Used</span>
                                <span>{quotaInfo.limit - quotaInfo.remaining} / {quotaInfo.limit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${((quotaInfo.limit - quotaInfo.remaining) / quotaInfo.limit) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Upgrade Button */}
                        {quotaInfo.tier === 'free' && (
                            <Link href="/settings">
                                <button className="w-full py-2.5 mt-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <Crown size={14} className="fill-white" />
                                    Upgrade Plan
                                </button>
                            </Link>
                        )}
                    </div>
                )}

                {/* Account Toggle */}
                <div className={cn(
                    "flex items-center gap-3",
                    isCollapsed ? "justify-center" : "px-1"
                )}>
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {user?.email?.substring(0, 1).toUpperCase()}
                        </div>
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.email}</p>
                            <Link href="/settings" className="text-[10px] font-bold uppercase text-primary hover:text-primary-dark tracking-widest leading-none mt-1 flex items-center gap-1">
                                Settings <Settings size={10} />
                            </Link>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="p-2 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Collapse Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-center shadow-sm z-50 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
                {isCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
            </button>
        </div>
    );
}
