"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, FileText, CreditCard, ExternalLink } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import UpgradeButton from '@/components/UpgradeButton';

interface Subscription {
    status: string;
}

export default function Settings() {
    const supabase = createClient();
    const router = useRouter();
    const { user, quotaInfo } = useChatStore();
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        const loadSub = async () => {
            if (!user) return;
            const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
            setSubscription(data as Subscription);
        };
        loadSub();
    }, [user, supabase]);

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
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-slate-400" size={20} />
                                <div>
                                    <span className="block font-medium text-slate-700">Current Plan</span>
                                    <span className="text-xs text-slate-500">
                                        {subscription ?
                                            (subscription.status === 'active' ? 'Pro Plan active' : `Status: ${subscription.status}`)
                                            : 'Free Tier'}
                                    </span>
                                </div>
                            </div>

                            {/* UPGRADE / MANAGE BUTTON */}
                            <div className="w-full md:w-auto">
                                {subscription && subscription.status === 'active' ? (
                                    <Button variant="outline" onClick={() => window.open('https://your-store.lemonsqueezy.com/billing', '_blank')}>
                                        Manage Billing <ExternalLink size={14} className="ml-2" />
                                    </Button>
                                ) : (
                                    user && <UpgradeButton userId={user.id} email={user.email} />
                                )}
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-slate-800">Token Usage</span>
                                        <span className="text-xs text-slate-500">Daily allowance reset every 24h</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-900 leading-none">{quotaInfo.remaining} / {quotaInfo.limit}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Available</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${(quotaInfo.remaining / quotaInfo.limit) < 0.2 ? 'bg-red-500' :
                                        (quotaInfo.remaining / quotaInfo.limit) < 0.5 ? 'bg-amber-500' : 'bg-indigo-600'
                                        }`}
                                    style={{ width: `${Math.min(100, (quotaInfo.remaining / quotaInfo.limit) * 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-[11px] font-medium">
                                <span className={`${(quotaInfo.remaining / quotaInfo.limit) < 0.2 ? 'text-red-600' : 'text-slate-500'}`}>
                                    {Math.round((quotaInfo.remaining / quotaInfo.limit) * 100)}% remaining
                                </span>
                                {quotaInfo.tier !== 'pro' && (
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="text-indigo-600 hover:text-indigo-700 font-bold"
                                    >
                                        Get more tokens →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12 pt-8 border-t border-slate-200">
                    <div className="flex gap-6 text-xs text-slate-400 font-medium">
                        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                        <Link href="mailto:support@pinegen.ai" className="hover:text-indigo-600 transition-colors">Support</Link>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={loading}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none px-6"
                    >
                        <LogOut className="mr-2" size={16} />
                        {loading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
