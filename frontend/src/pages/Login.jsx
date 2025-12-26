import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Fingerprint, Brain } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 relative px-4">
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-dark p-8 rounded-3xl border border-white/10 relative overflow-hidden group"
            >
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-flex p-4 rounded-[2rem] bg-primary/10 border border-primary/20 mb-6 shadow-2xl shadow-primary/10"
                    >
                        <Fingerprint className="w-10 h-10 text-primary text-glow-cyan" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">Identity Access</h2>
                    <p className="text-neutral-500 mt-2 uppercase text-[10px] tracking-[0.3em] font-black">Authorized Personnel Only</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-400 ml-1">Email Address</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-neutral-600"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-400 ml-1">Password</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-neutral-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group/btn relative bg-primary text-background py-5 rounded-[1.5rem] font-black transition-all hover:shadow-[0_0_30px_rgba(0,242,254,0.4)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden uppercase tracking-widest"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? 'CALIBRATING...' : 'ESTABLISH LINK'}
                        </span>
                    </button>
                </form>

                <p className="mt-8 text-center text-neutral-400">
                    Don't have an account? <Link to="/register" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
