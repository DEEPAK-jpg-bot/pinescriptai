import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Code, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            const message = error.message || 'Invalid credentials';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A] px-4 font-sans">
            <div className="w-full max-w-[400px] space-y-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Link to="/" className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-[#10A37F] rounded-md flex items-center justify-center">
                            <Code className="text-white" size={24} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
                </div>

                <div className="bg-[#2D2D2D] p-8 rounded-md shadow-lg border border-black/10">
                    <form onSubmit={handleSubmit} className="space-y-5">
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

                    <div className="mt-4 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-xs text-[#10A37F] hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <p className="text-sm text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#10A37F] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
