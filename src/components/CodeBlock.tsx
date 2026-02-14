"use client";

import { useState } from 'react';
import { Check, Copy, Download, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export const CodeBlock = ({ code }: CodeBlockProps) => {
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
        <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col">
            {/* Simple Section Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Terminal size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block leading-none mb-1">Generated Output</span>
                        <span className="text-xs font-bold text-slate-700 leading-none">Pine Script v6 Code</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-white transition-all border border-transparent hover:border-slate-200"
                    >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <Download size={13} />
                        Download
                    </button>
                </div>
            </div>

            {/* Simple Text Section */}
            <div className="p-6 overflow-x-auto custom-scrollbar bg-[#F8FAFC]">
                <pre className="font-mono text-[13px] leading-relaxed text-slate-700 selection:bg-indigo-100 selection:text-indigo-900">
                    <code>{code.trim()}</code>
                </pre>
            </div>
        </div>
    );
};
