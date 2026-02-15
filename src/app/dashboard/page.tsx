"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import {
    Send,
    Sparkles,
    AlertTriangle
} from 'lucide-react';
// motion import removed as it was unused
import ReactMarkdown, { Components } from 'react-markdown';
import CodeBlock from '@/components/CodeBlock';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const {
        messages,
        sendMessage,
        isGenerating,
        currentError,
    } = useChatStore();

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        console.log('Dashboard State:', {
            messageCount: messages.length,
            isGenerating,
            hasError: !!currentError,
            activeConv: useChatStore.getState().activeConversationId
        });
    }, [messages, isGenerating, currentError]);

    const handleSendMessage = async () => {
        if (!input.trim() || isGenerating) return;
        const content = input.trim();
        setInput('');
        await sendMessage(content);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatMessage = (content: string) => {
        const components: Components = {
            code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeValue = String(children).replace(/\n$/, '');

                return !(props as { inline?: boolean }).inline ? (
                    <CodeBlock
                        code={codeValue}
                        language={match ? match[1] : 'pinescript'}
                    />
                ) : (
                    <code className="bg-zinc-100 dark:bg-zinc-800 text-primary px-1.5 py-0.5 rounded text-sm font-semibold" {...props}>
                        {children}
                    </code>
                );
            },
            p({ children }) {
                return <p className="mb-4 last:mb-0 text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">{children}</p>;
            }
        };

        return (
            <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0">
                <ReactMarkdown components={components}>
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* CHAT AREA (Scrollable) */}
            <div
                className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-6 pb-[200px]"
                ref={scrollRef}
            >
                <div className="w-full max-w-[768px] px-6 space-y-10">
                    {messages.length === 0 ? (
                        <div className="h-[calc(100vh-250px)] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-4 pulse-animation">
                                <Sparkles size={32} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-bold dark:text-white">What are we coding today?</h2>
                            <p className="text-zinc-500 max-w-md mx-auto">
                                Generate high-accuracy Pine Script v6 indicators and strategies with institutional logic.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl pt-8">
                                {[
                                    "Create a v6 RSI mean reversion strategy",
                                    "Add take profit and stop loss to this code...",
                                    "Convert this v5 indicator to v6",
                                    "Explain how this session logic works"
                                ].map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(s)}
                                        className="p-4 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:border-primary hover:text-primary transition-all text-left"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-6 opacity-100",
                                        message.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-xs select-none",
                                        message.role === 'user'
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                            : "bg-primary text-white shadow-lg shadow-primary/10"
                                    )}>
                                        {message.role === 'user' ? 'U' : 'AI'}
                                    </div>
                                    <div className={cn(
                                        "flex-1 min-w-0 pt-1.5",
                                        message.role === 'user' ? "text-right" : "text-left"
                                    )}>
                                        {formatMessage(message.content)}
                                    </div>
                                </div>
                            ))}

                            {isGenerating && (
                                <div className="flex gap-6 animate-pulse">
                                    <div className="w-9 h-9 bg-primary/30 rounded-xl flex items-center justify-center text-white font-bold opacity-50">AI</div>
                                    <div className="space-y-2 pt-3 flex-1">
                                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-[80%]" />
                                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-[40%]" />
                                    </div>
                                </div>
                            )}

                        </>
                    )}

                    {currentError && (
                        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-6 rounded-3xl text-sm font-bold border border-red-200 dark:border-red-500/20 flex items-start gap-3 shadow-xl shadow-red-500/5 mt-4 animate-fade-in">
                            <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
                            <div className="space-y-1">
                                <p className="font-black uppercase tracking-widest text-[10px] opacity-70">Protocol Error Detected</p>
                                <p className="leading-relaxed">{currentError}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* INPUT BAR (Sticky Bottom) */}
            <div className="absolute bottom-0 w-full flex justify-center p-6 bg-gradient-to-t from-white dark:from-page-dark via-white dark:via-page-dark to-transparent pt-12 pointer-events-none">
                <div className="w-full max-w-[768px] relative pointer-events-auto">
                    <div className="relative bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="w-full bg-transparent border-0 ring-0 focus:ring-0 px-4 py-4 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 min-h-[56px] max-h-40 resize-none custom-scrollbar"
                            rows={1}
                        />
                        <div className="flex items-center justify-between px-4 pb-3">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={12} className="text-primary" /> v6 Logic Engine
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={isGenerating || !input.trim()}
                                className={cn(
                                    "p-2 rounded-xl transition-all",
                                    input.trim()
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.05]"
                                        : "text-zinc-400 bg-zinc-200 dark:bg-zinc-700 cursor-not-allowed",
                                    isGenerating && "animate-pulse"
                                )}
                            >
                                {isGenerating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
