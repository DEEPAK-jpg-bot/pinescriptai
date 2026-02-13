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
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { createClient } from "@/utils/supabase/client";
import UpgradeButton from "./UpgradeButton";

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

    return (
        <div className={cn(
            "flex flex-col h-screen border-r border-slate-200 bg-white transition-all duration-300 relative",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-slate-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Brand */}
            <div className="flex items-center h-16 px-6 border-b border-slate-100 flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    P
                </div>
                {!isCollapsed && (
                    <span className="ml-3 text-lg font-bold text-slate-900">PineGen</span>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-3">
                    <button
                        onClick={handleNewChat}
                        className={cn(
                            "flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">New Chat</span>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                    {!isCollapsed && (
                        <div className="flex items-center justify-between px-3 mt-4 mb-2">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History</h3>
                            <History size={14} className="text-slate-300" />
                        </div>
                    )}

                    {conversations.length === 0 && !isCollapsed && (
                        <p className="px-3 py-4 text-xs text-slate-400 text-center italic">No history yet</p>
                    )}

                    {conversations.map((convo) => (
                        <div key={convo.id} className="group relative">
                            <button
                                onClick={() => {
                                    setActiveConversation(convo.id);
                                    if (pathname !== '/dashboard') router.push('/dashboard');
                                }}
                                className={cn(
                                    "flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                                    activeConversationId === convo.id
                                        ? "bg-slate-100 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <MessageSquare className={cn(
                                    "w-4 h-4 flex-shrink-0",
                                    activeConversationId === convo.id ? "text-indigo-600" : "text-slate-400"
                                )} />
                                {!isCollapsed && (
                                    <span className="ml-3 truncate pr-10 text-left">
                                        {convo.title}
                                    </span>
                                )}
                            </button>

                            {!isCollapsed && (
                                <div className="absolute right-2 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newTitle = prompt("Rename conversation:", convo.title);
                                            if (newTitle) useChatStore.getState().renameConversation(convo.id, newTitle);
                                        }}
                                        className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                                        title="Rename"
                                    >
                                        <Plus size={14} className="rotate-45" /> {/* Use a small icon for edit or just a pencil */}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this conversation?")) deleteConversation(convo.id);
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Upgrade Plan Card */}
            {!isCollapsed && quotaInfo.tier === 'free' && (
                <div className="p-4 mx-2 mb-2 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-sm">
                        <Zap size={14} className="fill-indigo-600 text-indigo-600" />
                        <span>Upgrade to Pro</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        Unlock unlimited generations, faster speeds, and advanced models.
                    </p>
                    <UpgradeButton userId={user?.id || ''} email={user?.email || ''} />
                </div>
            )}

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex flex-col gap-4">
                    <Link href="/settings" className={cn(
                        "flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm transition-all",
                        pathname === "/settings" && "bg-white shadow-sm text-indigo-700"
                    )}>
                        <Settings className="w-4 h-4" />
                        {!isCollapsed && <span className="ml-3 font-medium">Settings</span>}
                    </Link>

                    <div className="flex items-center gap-3 px-1">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm border border-indigo-200">
                            {user?.email?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                        "inline-block w-1.5 h-1.5 rounded-full",
                                        quotaInfo.tier === 'pro' ? "bg-emerald-500" : "bg-slate-400"
                                    )} />
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                                        {quotaInfo.tier === 'pro' ? "Pro Member" : "Free Tier"}
                                    </p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
