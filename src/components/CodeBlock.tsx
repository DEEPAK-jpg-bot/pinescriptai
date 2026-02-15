"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const customTheme = {
    'code[class*="language-"]': {
        color: 'inherit',
        background: 'none',
        fontFamily: 'inherit',
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
        color: 'inherit',
        background: 'none',
        fontFamily: 'inherit',
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
        padding: '1.25rem',
        margin: '0',
        overflow: 'auto',
    },
    'keyword': { color: '#4f46e5', fontWeight: '600' }, // Indigo 600
    'string': { color: '#0891b2' }, // Cyan 600 for contrast
    'comment': { color: '#71717A', fontStyle: 'italic' },
    'function': { color: '#2563eb' }, // Blue 600
    'boolean': { color: '#4f46e5' },
    'number': { color: '#4f46e5' },
    'operator': { color: 'inherit' },
    'punctuation': { color: 'inherit' },
    'class-name': { color: '#4f46e5' },
    'constant': { color: '#4f46e5' },
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
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm group relative animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-800/80">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-primary transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            {/* Syntax Highlighting */}
            <div className="relative font-mono text-zinc-800 dark:text-zinc-200">
                <SyntaxHighlighter
                    language={language}
                    style={customTheme as { [key: string]: React.CSSProperties }}
                    customStyle={{
                        background: 'transparent',
                        fontSize: '13px',
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1.5em',
                        color: '#A1A1AA',
                        opacity: 0.5,
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
