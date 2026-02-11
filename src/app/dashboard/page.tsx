"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles, User, Send, Plus,
    MessageSquare, RefreshCw, Lightbulb,
    Loader2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CodeBlock } from '@/components/CodeBlock';
import { cn } from '@/lib/utils'; // Keep helper

const MODES = {
    GENERATE: 'generate',
    REFINE: 'refine',
    EXPLAIN: 'explain'
};

const SAMPLE_PROMPTS = [
    "Create a RSI Divergence strategy",
    "Build a MACD Crossover with EMA filter",
    "Darvas Box Strategy with Trailing Stop",
    "Bollinger Bands Mean Reversion"
];

// Helper to extract code
const extractPineScript = (content: string) => {
    if (!content) return content;
    const codeBlockMatch = content.match(/```(?:pinescript|pine|)\s*\n?([\s\S]*?)```/i);
    if (codeBlockMatch) return codeBlockMatch[1].trim();
    const versionMatch = content.match(/\/\/@version=\d+[\s\S]*/);
    if (versionMatch) return versionMatch[0].trim();
    return content;
};

interface Message {
    role: 'user' | 'assistant';
    text?: string;
    code?: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(MODES.GENERATE);
    const [lastCode, setLastCode] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Mode switching based on context
    useEffect(() => {
        if (lastCode && mode === MODES.GENERATE) {
            setMode(MODES.REFINE);
        } else if (!lastCode && mode !== MODES.GENERATE) {
            setMode(MODES.GENERATE);
        }
    }, [lastCode, mode]);

    const handleSend = async (customInput?: string) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || loading) return;

        const userMessage: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        if (!customInput) setInput('');
        setLoading(true);

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            let responseData: { text?: string; code?: string } = { text: '', code: undefined };

            // Mock API or Real API
            // For now, assume Real API is running on localhost:8000
            // If it fails, fallback to mock response for demo

            try {
                if (mode === MODES.GENERATE) {
                    const { data } = await api.post('/generate', { prompt: textToSend });
                    if (data.message?.content) {
                        const extracted = extractPineScript(data.message.content);
                        responseData.text = "Here is the generated Pine Script based on your request:";
                        responseData.code = extracted;
                        setLastCode(extracted);
                    } else {
                        throw new Error('Invalid response');
                    }
                } else if (mode === MODES.REFINE) {
                    if (!lastCode) throw new Error("No code to refine.");
                    const { data } = await api.post('/refine', { code: lastCode, instruction: textToSend });
                    const extracted = extractPineScript(data.code);
                    responseData.text = "I've updated the script with your changes:";
                    responseData.code = extracted;
                    setLastCode(extracted);
                } else if (mode === MODES.EXPLAIN) {
                    if (!lastCode) throw new Error("No code to explain.");
                    const { data } = await api.post('/explain', { code: lastCode });
                    responseData.text = data.explanation || "Here is the explanation.";
                }
            } catch (err) {
                // Fallback Mock for Demo if backend not running
                // Remove this in prod
                console.warn("Backend failed, using mock", err);
                await new Promise(r => setTimeout(r, 2000));
                responseData.text = "Here is a sample result (Backend not connected, running in demo mode):";
                responseData.code = `//@version=5
strategy("New Strategy", overlay=true)
// Your Logic Here
plot(close)`;
                setLastCode(responseData.code);
            }

            setMessages(prev => [...prev, { role: 'assistant', ...responseData }]);

        } catch (error: any) {
            const errorMsg = error?.message || "An error occurred";
            setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${errorMsg}` }]);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">

            {/* Header / Top Bar for Chat */}
            {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="text-indigo-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">PineScript AI Assistant</h2>
                        <p className="text-slate-500 max-w-md">
                            I can help you write, debug, and optimize strategies for TradingView.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                        {SAMPLE_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(prompt)}
                                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all shadow-sm hover:shadow-md group"
                            >
                                <div className="font-medium text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{prompt}</div>
                                <div className="text-slate-400 text-xs flex items-center gap-1">
                                    <Sparkles size={12} /> Generate Strategy
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto pb-40 px-4 py-6 scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn(
                                "flex gap-6 animate-in slide-in-from-bottom-5 duration-300",
                                msg.role === 'assistant' ? "bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" : ""
                            )}>
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                    msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
                                )}>
                                    {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
                                        {msg.text && (
                                            <div className="whitespace-pre-wrap mb-4 font-medium">{msg.text}</div>
                                        )}
                                        {msg.code && (
                                            <CodeBlock code={msg.code} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-4 p-6 animate-pulse">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Loader2 className="text-emerald-600 animate-spin" size={20} />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                    <div className="h-3 w-48 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-4" />
                    </div>
                </div>
            )}

            {/* Input Area (Fixed Bottom) */}
            <div className="absolute bottom-0 left-0 w-full bg-slate-50/80 backdrop-blur-md border-t border-slate-200 p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Mode Selector */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1">
                            {Object.values(MODES).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all flex items-center gap-2",
                                        mode === m
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    {m === MODES.GENERATE && <Sparkles size={14} />}
                                    {m === MODES.REFINE && <RefreshCw size={14} />}
                                    {m === MODES.EXPLAIN && <Lightbulb size={14} />}
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all overflow-hidden">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                mode === MODES.REFINE ? "How should I improve the code?" :
                                    "Describe your strategy logic..."
                            }
                            className="w-full max-h-[200px] py-4 pl-5 pr-14 bg-transparent border-0 focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 text-base"
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className={cn(
                                "absolute right-3 bottom-3 p-2 rounded-xl transition-all",
                                input.trim()
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <AlertTriangle size={10} />
                            AI-generated code may contain errors. Always backtest before live trading.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
