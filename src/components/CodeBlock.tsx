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
        <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-2xl group relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5 prose-code:">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                    <div className="flex items-center gap-2">
                        <Code2 size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Pine Script v6</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
                    >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 border border-transparent hover:border-slate-700"
                    >
                        <Download size={13} />
                        Download
                    </button>
                </div>
            </div>

            {/* Code Body */}
            <div className="relative font-mono text-sm leading-relaxed overflow-hidden">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        background: 'transparent',
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1em',
                        color: '#4b5563',
                        textAlign: 'right',
                        userSelect: 'none',
                        fontSize: '11px',
                    }}
                >
                    {code.trim()}
                </SyntaxHighlighter>

                {/* Visual Flair: Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
