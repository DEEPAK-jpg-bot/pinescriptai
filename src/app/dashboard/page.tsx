"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming standard input
import { Loader2, Send, Copy, AlertTriangle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/components/CodeBlock';

export default function Dashboard() {
    const {
        user,
        setUser,
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
    const supabase = createClient();

    // 1. Initial Data Load (Auth is handled by AuthSync)
    useEffect(() => {
        if (user) {
            fetchConversations();
            checkRateLimit();
        }
    }, [user, fetchConversations, checkRateLimit]);

    // 2. Auto-scroll
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

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
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
                            return <p className="mb-4 last:mb-0 text-slate-700 leading-relaxed">{children}</p>;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50">
            {/* Header / Quota Warning */}
            <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600" size={24} />
                        PineGen Chat
                    </h1>
                    {quotaInfo.tier === 'pro' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-sm">
                            Pro
                        </span>
                    )}
                </div>
                {quotaInfo.isExceeded && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                        <AlertTriangle size={14} />
                        <span>Quota Exceeded</span>
                    </div>
                )}
                {!quotaInfo.isExceeded && (
                    <div className="text-xs text-slate-500">
                        {quotaInfo.remaining} / {quotaInfo.limit} tokens left
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {currentError && (
                <div className="bg-red-50 text-red-700 px-4 py-2 text-sm border-b border-red-200 flex justify-between items-center">
                    <span>{currentError}</span>
                    <button onClick={() => window.location.reload()} className="underline hover:text-red-900">Reload</button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 select-none">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                            <Send className="text-slate-400 ml-1" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Start a new strategy</h3>
                        <p className="text-slate-500 max-w-xs mt-2">Describe your trading idea, and I&apos;ll generate the Pine Script code for you.</p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 shadow-sm ${m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                }`}>
                                <div className={m.role === 'user' ? 'text-white' : 'text-slate-800'}>
                                    {m.role === 'user' ? m.content : formatMessage(m.content)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isGenerating && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                            <Loader2 className="animate-spin text-indigo-600" size={18} />
                            <span className="text-sm text-slate-500 font-medium">Generating logic...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder={quotaInfo.isExceeded ? "Daily limit reached." : "Describe your strategy (e.g. 'RSI crossover with EMA filter')..."}
                        disabled={isGenerating || quotaInfo.isExceeded}
                        className="flex-1 h-12 text-base"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isGenerating || !input.trim() || quotaInfo.isExceeded}
                        className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex-shrink-0"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    </Button>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                    AI can make mistakes. Always verify the code before using real funds.
                </p>
            </div>
        </div>
    );
}
