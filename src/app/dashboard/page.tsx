"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Loader2, Send, AlertTriangle,
    MessageSquare, Sparkles, Zap,
    ShieldCheck, CornerDownLeft
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/components/CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const {
        user,
        messages,
        isGenerating,
        currentError,
        quotaInfo,
        fetchConversations,
        sendMessage,
        checkRateLimit,
    } = useChatStore();

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchConversations();
            checkRateLimit();
        }
    }, [user, fetchConversations, checkRateLimit]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isGenerating]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    const formatMessage = (content: string) => {
        return (
            <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0">
                <ReactMarkdown
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeValue = String(children).replace(/\n$/, '');

                            return !inline ? (
                                <CodeBlock
                                    code={codeValue}
                                    language={match ? match[1] : 'pinescript'}
                                />
                            ) : (
                                <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-semibold" {...props}>
                                    {children}
                                </code>
                            );
                        },
                        p({ children }) {
                            return <p className="mb-4 last:mb-0 text-slate-700 leading-relaxed font-medium">{children}</p>;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    const getTierDisplay = () => {
        const tier = quotaInfo.tier?.toLowerCase() || 'free';
        if (tier === 'pro_trader') return { name: 'Pro Trader', icon: <ShieldCheck size={12} />, bg: 'bg-violet-600' };
        if (tier === 'trader') return { name: 'Trader', icon: <Zap size={12} />, bg: 'bg-indigo-600' };
        if (tier === 'pro') return { name: 'Pro', icon: <Sparkles size={12} />, bg: 'bg-emerald-600' };
        return { name: 'Free', icon: null, bg: 'bg-slate-400' };
    };

    const tier = getTierDisplay();

    return (
        <div className="flex flex-col h-full w-full bg-[#FBFBFE]">
            {/* Header / Brand Bar */}
            <div className="flex-shrink-0 px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex justify-between items-center sticky top-0 z-20 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <MessageSquare size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight">Strategy Lab</h1>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 ${tier.bg} text-white text-[9px] font-black uppercase tracking-widest rounded`}>
                                {tier.icon} {tier.name}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{quotaInfo.remaining} / {quotaInfo.limit} credits</span>
                        </div>
                    </div>
                </div>

                {quotaInfo.isExceeded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-amber-200 shadow-sm"
                    >
                        <AlertTriangle size={14} className="animate-pulse" />
                        Daily Quota Reached
                    </motion.div>
                )}
            </div>

            {/* Error Banner */}
            {currentError && (
                <div className="bg-red-50 text-red-700 px-6 py-3 text-xs font-bold border-b border-red-200 flex justify-between items-center animate-shake">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>{currentError}</span>
                    </div>
                    <button onClick={() => window.location.reload()} className="underline hover:text-red-900 transition-colors">Emergency Reload</button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-10 space-y-10 custom-scrollbar scroll-smooth" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-80 select-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] border border-indigo-100 flex items-center justify-center mb-8 shadow-sm"
                        >
                            <Sparkles className="text-indigo-600" size={40} strokeWidth={1.5} />
                        </motion.div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deploy Your Alpha</h3>
                        <p className="text-slate-500 max-w-sm mt-3 font-medium leading-relaxed">
                            Describe any indicator or strategy concept below. <br />
                            I will generate institutional-grade PineScript v6 code.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 max-w-2xl mx-auto">
                            {[
                                "EMA crossover with volatility filter",
                                "Volume Profile POC strategy",
                                "Smart Money Concepts detector",
                                "RSI divergence with trailing stop"
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all text-left shadow-sm hover:translate-y-[-2px]"
                                >
                                    &ldquo;{suggestion}&rdquo;
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8 pb-10">
                        {messages.map((m) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] lg:max-w-full rounded-[1.5rem] p-6 shadow-sm ${m.role === 'user'
                                    ? 'bg-[#1E293B] text-white rounded-tr-none border border-slate-700'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none ring-1 ring-black/5'
                                    }`}>
                                    <div className={m.role === 'user' ? 'text-white' : 'text-slate-800'}>
                                        {m.role === 'user' ? (
                                            <p className="font-bold text-lg leading-snug">{m.content}</p>
                                        ) : (
                                            formatMessage(m.content)
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-white border border-slate-200 px-6 py-4 rounded-[1.5rem] rounded-tl-none shadow-sm shadow-indigo-100 flex items-center gap-4 border-l-4 border-l-indigo-600 ring-1 ring-black/5">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Architecting Pine Logic...</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-6 bg-white border-t border-slate-200/60 sticky bottom-0 z-20">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
                    <div className="relative flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            rows={1}
                            style={{ height: 'auto', minHeight: '56px' }}
                            placeholder={quotaInfo.isExceeded ? "You have reached your daily credit limit." : "Enter strategy requirements..."}
                            disabled={isGenerating || quotaInfo.isExceeded}
                            className="w-full px-5 py-4 bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-400 resize-none overflow-hidden"
                            onInput={(e: any) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />
                        <div className="flex items-center justify-between px-4 pb-3 border-t border-slate-50">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <CornerDownLeft size={10} /> Shift+Enter for new line
                            </div>
                            <Button
                                onClick={handleSend}
                                disabled={isGenerating || !input.trim() || quotaInfo.isExceeded}
                                size="sm"
                                className={`h-8 px-4 font-black uppercase text-[10px] tracking-widest rounded-lg transition-all ${input.trim() && !isGenerating
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95'
                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={12} /> : "Transmit →"}
                            </Button>
                        </div>
                    </div>
                </div>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-4 opacity-60">
                    Proprietary PineGen v6 Logic Enforcement Active
                </p>
            </div>
        </div>
    );
}
