"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Download, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export const CodeBlock = ({ code, language = 'pinescript' }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code.trim());
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
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Downloaded ${filename}`);
        } catch {
            toast.error('Failed to download');
        }
    };

    return (
        <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 bg-[#0d0d0d] shadow-xl group relative">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Code2 size={18} />
                    </div>
                    <div>
                        <span className="block text-xs font-black text-white uppercase tracking-widest leading-none">Code Artifact</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PineScript v6 Console</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 border border-white/5"
                    >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                    >
                        <Download size={13} strokeWidth={3} />
                        Download .pine
                    </button>
                </div>
            </div>

            {/* Simple Code Body */}
            <div className="relative font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '2rem',
                        fontSize: '13px',
                        lineHeight: '1.7',
                        background: 'transparent',
                    }}
                    showLineNumbers={false} /* Removed as requested for simplicity */
                >
                    {code.trim()}
                </SyntaxHighlighter>

                {/* Bottom decorative bar */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-indigo-500/50 opacity-20" />
            </div>
        </div>
    );
};
