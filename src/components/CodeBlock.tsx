"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const customTheme = {
    'code[class*="language-"]': {
        color: '#FAFAFA',
        background: 'none',
        fontFamily: '"Geist Mono", "Roboto Mono", monospace',
        textAlign: 'left',
        whiteSpace: 'pre',
        wordSpacing: 'normal',
        wordBreak: 'normal',
        wordWrap: 'normal',
        lineHeight: '1.6',
        MozTabSize: '4',
        OTabSize: '4',
        tabSize: '4',
        WebkitHyphens: 'none',
        MozHyphens: 'none',
        msHyphens: 'none',
        hyphens: 'none',
    },
    'pre[class*="language-"]': {
        color: '#FAFAFA',
        background: 'none',
        fontFamily: '"Geist Mono", "Roboto Mono", monospace',
        textAlign: 'left',
        whiteSpace: 'pre',
        wordSpacing: 'normal',
        wordBreak: 'normal',
        wordWrap: 'normal',
        lineHeight: '1.6',
        MozTabSize: '4',
        OTabSize: '4',
        tabSize: '4',
        WebkitHyphens: 'none',
        MozHyphens: 'none',
        msHyphens: 'none',
        hyphens: 'none',
        padding: '1.5rem',
        margin: '0',
        overflow: 'auto',
    },
    'keyword': { color: '#3B82F6' },
    'string': { color: '#22C55E' },
    'comment': { color: '#71717A' },
    'function': { color: '#10B981' },
    'boolean': { color: '#3B82F6' },
    'number': { color: '#3B82F6' },
    'operator': { color: '#FAFAFA' },
    'punctuation': { color: '#FAFAFA' },
    'class-name': { color: '#10B981' },
    'constant': { color: '#3B82F6' },
};

interface CodeBlockProps {
    code: string;
    language?: string;
}

export default function CodeBlock({ code, language = 'pinescript' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950 shadow-sm group relative animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            {/* Syntax Highlighting */}
            <div className="relative font-mono">
                <SyntaxHighlighter
                    language={language}
                    style={customTheme as any}
                    customStyle={{
                        background: 'transparent',
                        fontSize: '14px',
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1.5em',
                        color: '#3F3F46',
                        textAlign: 'right',
                        userSelect: 'none',
                    }}
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
