"use client";

import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Check, Copy, Download, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
    code: string;
}

export const CodeBlock = ({ code }: CodeBlockProps) => {
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
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Downloaded ${filename}`);
        } catch {
            toast.error('Failed to download');
        }
    };

    return (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <FileJson size={16} className="text-slate-400" />
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Pine Script v5</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <Download size={14} />
                        Download
                    </button>
                </div>
            </div>
            <div className="h-[400px] w-full relative group">
                <Editor
                    height="100%"
                    defaultLanguage="javascript" // Monarch for pinescript?
                    theme="light" // Use light theme for Editor to match UI
                    value={code}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        lineNumbers: 'on',
                        renderValidationDecorations: 'off',
                        folding: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible'
                        },
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    }}
                />
            </div>
        </div>
    );
};
