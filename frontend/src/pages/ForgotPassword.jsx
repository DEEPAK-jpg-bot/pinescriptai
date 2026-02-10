import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Code, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || loading) return;

        setLoading(true);
        try {
            await api.post('/auth/password/reset', { email });
            setSent(true);
            toast.success('Reset link sent! Check your email.');
        } catch (error) {
            // Still show success to prevent email enumeration
            setSent(true);
            toast.success('If an account exists, a reset link has been sent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="noise-overlay" />
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8">
                        <Code className="text-[#3B82F6]" size={32} />
                        <span className="text-2xl font-bold">PineScript AI</span>
                    </Link>
                    
                    {!sent ? (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                            <p className="text-gray-400">Enter your email to receive a reset link</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-500" size={32} />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
                            <p className="text-gray-400">We've sent a password reset link to your email</p>
                        </>
                    )}
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-[#3B82F6]/50"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full h-12 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg font-bold"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-sm text-gray-400 text-center">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button 
                                    onClick={() => setSent(false)}
                                    className="text-[#3B82F6] hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
