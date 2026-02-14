"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Plus,
    MessageSquare,
    LogOut,
    Settings,
    History,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Zap,
    LayoutDashboard,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const {
        user,
        conversations,
        activeConversationId,
        setActiveConversation,
        deleteConversation,
        createConversation,
        fetchConversations,
        quotaInfo
    } = useChatStore();

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    const handleNewChat = async () => {
        const id = await createConversation();
        if (id) {
            router.push('/dashboard');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const isChatActive = pathname === '/dashboard';
    const isSettingsActive = pathname === '/settings';

    return (
        <div className={cn(
            "flex flex-col h-screen border-r border-slate-200 bg-white transition-all duration-300 relative z-40",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Brand Section */}
            <div className="flex items-center h-16 px-6 border-b border-slate-100/80 flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 overflow-hidden">
                    <span className="text-sm">P</span>
                </div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-3"
                        >
                            <span className="text-base font-black text-slate-900 tracking-tighter">PineGen AI</span>
                            <div className="h-[2px] w-4 bg-indigo-500 rounded-full mt-[-2px]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-hidden flex flex-col p-4 pt-6 gap-8">

                {/* Global Links */}
                <div className="space-y-1">
                    <button
                        onClick={handleNewChat}
                        className={cn(
                            "flex items-center w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                            "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95",
                            isCollapsed && "justify-center px-0"
                        )}
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                        {!isCollapsed && <span className="ml-3">New Strategy</span>}
                    </button>

                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-3",
                            isSettingsActive
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600",
                            isCollapsed && "justify-center px-0"
                        )}
                    >
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">Dashboard</span>}
                    </Link>
                </div>

                {/* History Section */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className={cn("flex items-center justify-between mb-4 px-2", isCollapsed && "justify-center")}>
                        {!isCollapsed && (
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Sessions</h3>
                        )}
                        <History size={14} className="text-slate-300" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {conversations.map((convo) => (
                            <div key={convo.id} className="group relative">
                                <button
                                    onClick={() => {
                                        setActiveConversation(convo.id);
                                        if (pathname !== '/dashboard') router.push('/dashboard');
                                    }}
                                    className={cn(
                                        "flex items-center w-full px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group border border-transparent",
                                        activeConversationId === convo.id
                                            ? "bg-white border-slate-200 text-indigo-600 shadow-sm ring-1 ring-slate-100"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                    )}
                                >
                                    <MessageSquare className={cn(
                                        "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
                                        activeConversationId === convo.id ? "text-indigo-600" : "text-slate-300"
                                    )} />
                                    {!isCollapsed && (
                                        <span className="ml-4 truncate pr-6 text-left leading-none tracking-tight">
                                            {convo.title}
                                        </span>
                                    )}
                                </button>

                                {!isCollapsed && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("Delete session?")) deleteConversation(convo.id);
                                            }}
                                            className="p-1.5 bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 rounded-lg transition-all shadow-sm"
                                        >
                                            <Trash2 size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {conversations.length === 0 && !isCollapsed && (
                            <div className="py-10 text-center space-y-3 opacity-40 grayscale">
                                <MessageSquare className="mx-auto text-slate-300" size={24} strokeWidth={1.5} />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No Recent Activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100 space-y-4">
                {/* Upgrade Card */}
                {!isCollapsed && quotaInfo.tier === 'free' && (
                    <div className="p-5 rounded-[1.5rem] bg-[#1E293B] text-white shadow-xl shadow-slate-200 border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-[40px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 flex items-center gap-1.5">
                                <Zap size={10} className="fill-indigo-400" /> Unlock Pro
                            </h4>
                            <p className="text-[11px] font-bold text-slate-400 leading-normal mb-4">Get 20x daily credits & priorityPine v6 speed.</p>
                            <Link href="/?ref=upgrade#pricing">
                                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                    Upgrade <ArrowUpRight size={12} />
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Account Toggle */}
                <div className={cn(
                    "flex items-center gap-4 transition-all",
                    isCollapsed ? "justify-center" : "px-2"
                )}>
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xs border border-slate-200">
                            {user?.email?.substring(0, 1).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${quotaInfo.tier !== 'free' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{user?.email}</p>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mt-1">
                                {quotaInfo.tier?.replace('_', ' ') || 'Free Tier'}
                            </p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut size={16} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            {/* Collapse Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.05)] z-50 hover:bg-slate-50 transition-colors"
            >
                {isCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
            </button>
        </div>
    );
}
