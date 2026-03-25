import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('jobseeker');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let loggedInUser;
            if (isLogin) {
                loggedInUser = await login(email, password);
            } else {
                loggedInUser = await register(name, email, password, role);
            }
            navigate('/history');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[10%] right-[20%] w-72 h-72 bg-cyan-500/20 rounded-full blur-[80px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md p-8 z-10 space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <BrainCircuit className="text-indigo-400 w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">
                        {isLogin ? 'Welcome Back' : 'Join NexusAI'}
                    </h2>
                    <p className="text-gray-400">Unlock premium AI career intelligence.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400 font-medium">Name</label>
                                <input
                                    type="text" required
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Sai Ram"
                                />
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 font-medium">Email</label>
                        <input
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 font-medium">Password</label>
                        <input
                            type="password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold p-3 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="flex items-center gap-2 my-6">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-500 text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                <div className="space-y-4 text-center">
                    <button
                        onClick={() => navigate('/upload')} // Guest users go straight to upload
                        type="button"
                        className="w-full glass-card hover:bg-gray-800 text-gray-300 font-medium p-3 rounded-xl transition-all"
                    >
                        Continue Without Login
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
