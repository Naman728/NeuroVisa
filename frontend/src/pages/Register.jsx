import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Globe, Briefcase, UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        target_country: 'USA',
        visa_type: 'Student F1'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.message
                || (typeof err.response?.data === 'string' ? err.response?.data : 'Registration failed.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 relative px-4">
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-dark p-8 rounded-3xl border border-white/10 relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-flex p-4 rounded-[2rem] bg-secondary/10 border border-secondary/20 mb-6"
                    >
                        <UserPlus className="w-10 h-10 text-secondary text-glow-purple" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">Initialize Identity</h2>
                    <p className="text-neutral-500 mt-2 uppercase text-[10px] tracking-[0.3em] font-black">Neural Portal Calibration</p>
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-400 ml-1">Full Name</label>
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                            <input
                                name="full_name"
                                type="text"
                                required
                                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-400 ml-1">Email Address</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-400 ml-1">Target</label>
                            <div className="relative group/input">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                                <select
                                    name="target_country"
                                    className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white appearance-none"
                                    value={formData.target_country}
                                    onChange={handleChange}
                                >
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Germany">Germany</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-400 ml-1">Visa Type</label>
                            <div className="relative group/input">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                                <select
                                    name="visa_type"
                                    className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white appearance-none"
                                    value={formData.visa_type}
                                    onChange={handleChange}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Work">Work</option>
                                    <option value="Tourist">Tourist</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-400 ml-1">Secure Password</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-primary transition-colors" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group/btn relative bg-secondary text-white py-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-4"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? 'Initializing...' : 'Deploy Account'}
                        </span>
                    </button>
                </form>

                <p className="mt-8 text-center text-neutral-400">
                    Already registered? <Link to="/login" className="text-secondary hover:text-white transition-colors underline decoration-secondary/30 underline-offset-4">Identity Access</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
