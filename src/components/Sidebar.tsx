"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Plus,
    MessageSquare,
    User,
    LogOut,
    Settings,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Simplified navigation matching the original app's intent (Chat centric)
    const navigation = [
        { name: "New Chat", href: "/dashboard", icon: Plus },
        // Mock history items
        { name: "RSI Strategy", href: "#", icon: MessageSquare },
        { name: "MACD Alert", href: "#", icon: MessageSquare },
        { name: "Volume Spike", href: "#", icon: MessageSquare },
    ];

    const secondaryNavigation = [
        { name: "Settings", href: "#", icon: Settings },
    ];

    return (
        <div className={cn(
            "flex flex-col h-screen border-r border-slate-200 bg-white transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Brand */}
            <div className="flex items-center h-16 px-6 border-b border-slate-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    P
                </div>
                {!isCollapsed && (
                    <span className="ml-3 text-lg font-bold text-slate-900">PineGen</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 mb-4 shadow-sm"
                        )}
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">New Chat</span>}
                    </Link>

                    {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">History</h3>}
                    {navigation.slice(1).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 group transition-colors"
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
                            {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium text-sm">
                        AT
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">Alex Trader</p>
                            <p className="text-xs text-slate-500 truncate">Pro Plan</p>
                        </div>
                    )}
                    <button className="text-slate-400 hover:text-slate-600">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
