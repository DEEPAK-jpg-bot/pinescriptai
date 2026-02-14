"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Code2 } from 'lucide-react';
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

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-xl group relative">
            {/* Dark Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Code2 size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pine Script v6</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
                >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy Code'}
                </button>
            </div>

            {/* vscDarkPlus Syntax Highlighting (No Monaco) */}
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
            </div>
        </div>
    );
};
