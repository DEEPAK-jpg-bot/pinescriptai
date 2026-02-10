import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, User, LogOut, Send, Plus,
    MessageSquare, ChevronRight,
    Copy, Download, Lightbulb, RefreshCw,
    MoreHorizontal, Check, Loader2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import api from '../utils/api';

// --- Constants & Config ---
const MODES = {
    GENERATE: 'generate',
    REFINE: 'refine',
    EXPLAIN: 'explain'
};

const SAMPLE_PROMPTS = [
    "Create a RSI Divergence strategy",
    "Build a MACD Crossover with EMA filter",
    "Davvas Box Strategy with Trailing Stop",
    "Bollinger Bands Mean Reversion"
];

// --- Helper Functions ---
const extractPineScript = (content) => {
    if (!content) return content;
    const codeBlockMatch = content.match(/```(?:pinescript|pine|)\s*\n?([\s\S]*?)```/i);
    if (codeBlockMatch) return codeBlockMatch[1].trim();
    const versionMatch = content.match(/\/\/@version=\d+[\s\S]*/);
    if (versionMatch) return versionMatch[0].trim();
    return content;
};

const CodeBlock = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied to clipboard');
        } catch {
            toast.error('Failed to copy');
        }
    };

    const handleDownload = () => {
        try {
            const nameMatch = code.match(/(?:indicator|strategy)\s*\(\s*["']([^"']+)["']/);
            const filename = nameMatch
                ? `${nameMatch[1].replace(/[^a-z0-9]/gi, '_')}.pine`
                : 'pinescript.pine';

            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Downloaded ${filename}`);
        } catch {
            toast.error('Failed to download');
        }
    };

    return (
        <div className="mt-4 rounded-md overflow-hidden border border-[#404040] bg-[#0d0d0d]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2A2B32] border-b border-[#404040]">
                <span className="text-xs font-mono text-gray-400">Pine Script</span>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                        <Download size={14} />
                        Download
                    </button>
                </div>
            </div>
            <div className="h-[300px] w-full relative group">
                <Editor
                    height="100%"
                    defaultLanguage="javascript" // Monarch support for 'pinescript' might not be standard in basic monaco build
                    theme="vs-dark"
                    value={code}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        lineNumbers: 'on',
                        renderValidationDecorations: 'off',
                        folding: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible'
                        }
                    }}
                />
            </div>
        </div>
    );
};

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`group w-full text-foreground border-b border-black/5 dark:border-white/5 ${isUser ? 'bg-transparent' : 'bg-[#444654]/0'}`}>
            <div className="m-auto flex gap-4 p-4 md:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
                <div className={`relative flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-sm ${isUser ? 'bg-[#5436DA]' : 'bg-[#19C37D]'}`}>
                    {isUser ? <User size={20} className="text-white" /> : <Sparkles size={20} className="text-white" />}
                </div>
                <div className="relative flex-1 overflow-hidden">
                    <div className="prose prose-invert max-w-none text-sm leading-7">
                        {message.text && (
                            <div className="whitespace-pre-wrap mb-2 text-gray-100">{message.text}</div>
                        )}
                        {message.code && (
                            <CodeBlock code={message.code} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { profile, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mode, setMode] = useState(MODES.GENERATE);
    const [lastCode, setLastCode] = useState(null);
    const textareaRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Auto-switch mode based on context
    useEffect(() => {
        if (lastCode && mode === MODES.GENERATE) {
            setMode(MODES.REFINE);
        } else if (!lastCode && mode !== MODES.GENERATE) {
            setMode(MODES.GENERATE);
        }
    }, [lastCode, mode]);

    const handleSend = async (customInput) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || loading) return;

        const userMessage = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        if (!customInput) setInput('');
        setLoading(true);

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            let responseData = { text: '', code: null };

            if (mode === MODES.GENERATE) {
                const { data } = await api.post('/generate', { prompt: textToSend });
                if (data.message?.content) {
                    const extracted = extractPineScript(data.message.content);
                    responseData.text = "Here is the generated Pine Script based on your request:";
                    responseData.code = extracted;
                    setLastCode(extracted);
                } else {
                    throw new Error('Invalid response from server');
                }
            } else if (mode === MODES.REFINE) {
                if (!lastCode) throw new Error("No code to refine. Generate something first.");
                const { data } = await api.post('/refine', { code: lastCode, instruction: textToSend });
                const extracted = extractPineScript(data.code);
                responseData.text = "I've updated the script with your changes:";
                responseData.code = extracted;
                setLastCode(extracted);
            } else if (mode === MODES.EXPLAIN) {
                if (!lastCode) throw new Error("No code to explain.");
                const { data } = await api.post('/explain', { code: lastCode });
                responseData.text = data.explanation || "Here is the explanation for the code.";
            }

            setMessages(prev => [...prev, { role: 'assistant', ...responseData }]);
            refreshProfile();
            // toast.success('Response received'); // No toast in chat flow typically

        } catch (error) {
            const errorMsg = error.response?.data?.detail?.message
                || error.response?.data?.detail
                || error.message
                || 'An error occurred';
            setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${errorMsg}` }]);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <div className="flex h-screen bg-[#343541] text-gray-100 font-sans overflow-hidden">

            {/* SIDEBAR */}
            <div
                className={`
                    ${sidebarOpen ? 'w-[260px]' : 'w-0'} 
                    bg-[#202123] flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5
                `}
            >
                {/* New Chat Button */}
                <div className="p-3">
                    <button
                        onClick={() => {
                            setMessages([]);
                            setLastCode(null);
                            setMode(MODES.GENERATE);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-white/20 hover:bg-[#2A2B32] transition-colors text-sm text-white"
                    >
                        <Plus size={16} />
                        New chat
                    </button>
                </div>

                {/* History */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-hide">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2">Suggested</div>
                    {SAMPLE_PROMPTS.slice(0, 3).map((item, i) => (
                        <button key={i} onClick={() => handleSend(item)} className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-300 text-left truncate group">
                            <MessageSquare size={16} className="text-gray-400 group-hover:text-white" />
                            <span className="truncate">{item}</span>
                        </button>
                    ))}
                </div>

                {/* User Profile & Logout */}
                <div className="p-3 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-sm bg-[#5436DA] flex items-center justify-center text-white font-bold text-xs uppercase">
                            {profile?.email?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{profile?.email || 'User'}</div>
                            <div className="text-xs text-gray-400">{profile?.plan || 'Free'} Plan</div>
                        </div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-full relative bg-[#343541]">
                {/* Top Mobile/Toggle Header */}
                <div className="sticky top-0 z-10 flex items-center p-2 text-gray-500 bg-[#343541] md:hidden border-b border-white/5">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:text-white">
                        <MoreHorizontal size={24} />
                    </button>
                    <div className="flex-1 text-center text-sm text-white">PineScript AI</div>
                    <button onClick={() => {
                        setMessages([]);
                        setLastCode(null);
                    }} className="p-2 hover:text-white">
                        <Plus size={24} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide pb-40">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-foreground px-4">
                            <div className="bg-white/5 p-4 rounded-full mb-8">
                                <Sparkles size={40} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-8">PineScript AI Generator</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                                {SAMPLE_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(prompt)}
                                        className="p-4 bg-white/5 hover:bg-[#2A2B32] border border-white/5 rounded-xl text-left text-sm transition-colors"
                                    >
                                        <div className="font-medium text-white mb-1">{prompt}</div>
                                        <div className="text-gray-400 text-xs">Generate strategy</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            {messages.map((msg, i) => (
                                <ChatMessage key={i} message={msg} />
                            ))}
                            {loading && (
                                <div className="w-full text-gray-100 border-b border-black/5 dark:border-white/5 bg-[#444654]/0">
                                    <div className="m-auto flex gap-4 p-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl">
                                        <div className="relative flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-sm bg-[#19C37D]">
                                            <Loader2 size={20} className="text-white animate-spin" />
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-400 animate-pulse">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} className="h-4" />
                        </div>
                    )}
                </div>

                {/* Toggle Sidebar Button (Desktop) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-1/2 left-2 z-50 p-2 text-gray-400 hover:text-white transition-colors"
                    title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {!sidebarOpen && <ChevronRight size={24} />}
                </button>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-10 pb-6 px-4">
                    <div className="max-w-3xl mx-auto space-y-3">
                        {/* Token / Mode Indicator */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 mr-2">Mode:</span>
                                {Object.values(MODES).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`
                                            px-3 py-1 rounded-full text-xs font-medium capitalize transition-all flex items-center gap-1.5
                                            ${mode === m ? 'bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/50' : 'text-gray-500 hover:text-gray-300'}
                                        `}
                                    >
                                        {m === MODES.GENERATE && <Sparkles size={12} />}
                                        {m === MODES.REFINE && <RefreshCw size={12} />}
                                        {m === MODES.EXPLAIN && <Lightbulb size={12} />}
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <div className="text-[10px] text-gray-500">
                                {profile?.tokens_remaining?.toLocaleString()} Tokens Left
                            </div>
                        </div>

                        {/* Textarea Container */}
                        <div className="relative flex items-end p-3 bg-[#40414F] border border-[#2F2F2F] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] focus-within:shadow-[0_0_20px_rgba(0,0,0,0.2)] focus-within:border-black/30 transition-all">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    mode === MODES.GENERATE ? "Describe a strategy..." :
                                        mode === MODES.REFINE ? "How should I improve the code?" :
                                            "Ask a question about the code..."
                                }
                                className="w-full max-h-[200px] py-2 pr-10 bg-transparent border-0 focus:ring-0 resize-none text-white text-sm placeholder:text-gray-400 scrollbar-hide outline-none"
                                rows={1}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className={`
                                    absolute right-3 bottom-3 p-1.5 rounded-md transition-all
                                    ${input.trim() ? 'bg-[#19C37D] text-white hover:bg-[#15a369]' : 'bg-transparent text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] text-gray-500">
                                PineScript AI can make mistakes. Consider checking important code.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
