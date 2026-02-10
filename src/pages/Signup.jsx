import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Code, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const referralCode = localStorage.getItem('referral_code');
            await signup(email, password, name, referralCode);
            setEmailSent(true);
            localStorage.removeItem('referral_code');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A] px-4 font-sans text-white">
                <div className="w-full max-w-[400px] text-center">
                    <CheckCircle className="text-[#10A37F] mx-auto mb-6" size={50} />
                    <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                    <p className="text-gray-400 mb-8">
                        We sent a confirmation link to <span className="text-white font-medium">{email}</span>
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full h-12 bg-[#10A37F] hover:bg-[#0E906F] text-white rounded-md">
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A] px-4 font-sans">
            <div className="w-full max-w-[400px] space-y-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Link to="/" className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-[#10A37F] rounded-md flex items-center justify-center">
                            <Code className="text-white" size={24} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create your account</h1>
                </div>

                <div className="bg-[#2D2D2D] p-8 rounded-md shadow-lg border border-black/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 bg-[#3F3F3F] border-[#555] text-white placeholder:text-gray-400 focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] rounded-md"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-[#3F3F3F] border-[#555] text-white placeholder:text-gray-400 focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] rounded-md"
                                required
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-[#3F3F3F] border-[#555] text-white placeholder:text-gray-400 focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] rounded-md pr-10"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#10A37F] hover:bg-[#0E906F] text-white rounded-md font-medium text-base transition-colors"
                            disabled={loading || !email || !password}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Continue'}
                        </Button>
                    </form>
                </div>

                <p className="text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#10A37F] hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
