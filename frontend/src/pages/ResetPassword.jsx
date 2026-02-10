import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Code, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Password validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    const passwordsMatch = password === confirmPassword && password.length > 0;

    useEffect(() => {
        // Check if we have the recovery token in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken) {
            // Set the session with the recovery token
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get('refresh_token') || ''
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!hasUppercase || !hasNumber || !hasMinLength) {
            setError('Password does not meet requirements');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);
            toast.success('Password updated successfully!');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="noise-overlay" />
                
                <div className="w-full max-w-md relative z-10 text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Password Reset!</h1>
                    <p className="text-gray-400 mb-8">
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                    <Link to="/login">
                        <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg px-8">
                            Go to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="noise-overlay" />
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8">
                        <Code className="text-[#3B82F6]" size={32} />
                        <span className="text-2xl font-bold">PineScript AI</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
                    <p className="text-gray-400">Enter your new password below</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-[#3B82F6]/50"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {/* Password requirements */}
                        <div className="mt-3 space-y-2">
                            <div className={`text-xs flex items-center gap-2 ${hasMinLength ? 'text-green-500' : 'text-gray-500'}`}>
                                <CheckCircle size={14} />
                                At least 8 characters
                            </div>
                            <div className={`text-xs flex items-center gap-2 ${hasUppercase ? 'text-green-500' : 'text-gray-500'}`}>
                                <CheckCircle size={14} />
                                One uppercase letter
                            </div>
                            <div className={`text-xs flex items-center gap-2 ${hasNumber ? 'text-green-500' : 'text-gray-500'}`}>
                                <CheckCircle size={14} />
                                One number
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-[#3B82F6]/50"
                                required
                            />
                        </div>
                        {confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-red-400">Passwords do not match</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !hasUppercase || !hasNumber || !hasMinLength || !passwordsMatch}
                        className="w-full h-12 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <Link 
                        to="/login" 
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
