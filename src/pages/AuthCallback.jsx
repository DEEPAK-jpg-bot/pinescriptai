import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { Button } from '../components/ui/button';

const AuthCallback = () => {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the hash parameters from URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');
                const error = hashParams.get('error');
                const errorDescription = hashParams.get('error_description');

                // Check for errors in URL
                if (error) {
                    setStatus('error');
                    setMessage(errorDescription || 'Authentication failed');
                    return;
                }

                // Handle different auth types
                if (type === 'signup' || type === 'email_confirmation') {
                    // Email confirmation
                    if (accessToken) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || ''
                        });

                        if (sessionError) throw sessionError;

                        setStatus('success');
                        setMessage('Your email has been verified successfully!');

                        // Redirect to dashboard after 2 seconds
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 2000);
                    }
                } else if (type === 'recovery') {
                    // Password recovery - redirect to reset password page
                    navigate('/auth/reset-password' + window.location.hash);
                    return;
                } else if (type === 'magiclink') {
                    // Magic link login
                    if (accessToken) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || ''
                        });

                        if (sessionError) throw sessionError;

                        setStatus('success');
                        setMessage('Logged in successfully!');

                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 2000);
                    }
                } else {
                    // Unknown type or no type - check for session
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session) {
                        setStatus('success');
                        setMessage('Authentication successful!');
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 2000);
                    } else {
                        setStatus('error');
                        setMessage('Invalid or expired authentication link');
                    }
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage(error.message || 'Authentication failed. Please try again.');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="noise-overlay" />

            <div className="w-full max-w-md relative z-10 text-center">
                <div className="inline-flex items-center gap-2 mb-8">
                    <Code className="text-[#3B82F6]" size={32} />
                    <span className="text-2xl font-bold">PineScript AI</span>
                </div>

                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-[#3B82F6]/20 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="text-[#3B82F6] animate-spin" size={40} />
                        </div>
                        <h1 className="text-2xl font-bold">Verifying...</h1>
                        <p className="text-gray-400">Please wait while we verify your authentication</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="text-green-500" size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-green-500">Success!</h1>
                        <p className="text-gray-400">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="text-red-500" size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-red-500">Verification Failed</h1>
                        <p className="text-gray-400">{message}</p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg"
                            >
                                Go to Login
                            </Button>
                            <Button
                                onClick={() => navigate('/signup')}
                                variant="outline"
                                className="bg-white/5 border-white/10 hover:bg-white/10 rounded-lg"
                            >
                                Create New Account
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
