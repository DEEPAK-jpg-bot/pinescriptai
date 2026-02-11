"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User, LogOut, FileText, CreditCard } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export default function Settings() {
    const supabase = createClient();
    const router = useRouter();
    const { user, quotaInfo } = useChatStore();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Your Profile</h2>
                            <p className="text-slate-500">{user?.email || 'Loading...'}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-slate-400" size={20} />
                                <span className="font-medium text-slate-700">Current Plan</span>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Free Tier</span>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FileText className="text-slate-400" size={20} />
                                <span className="font-medium text-slate-700">Usage Quota</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-slate-900">{quotaInfo.remaining} / {quotaInfo.limit}</span>
                                <span className="text-xs text-slate-400">Requests remaining today</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={loading}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none"
                    >
                        <LogOut className="mr-2" size={16} />
                        {loading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
