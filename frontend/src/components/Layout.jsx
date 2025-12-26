import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, User, LogOut } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col text-neutral-100">
            <header className="glass border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black text-white hover:text-primary transition-all flex items-center gap-2 group">
                        <div className="p-2 rounded-xl glass group-hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] transition-all">
                            <Brain className="text-primary" />
                        </div>
                        NeuroVisa
                    </Link>
                    <nav className="flex items-center gap-8">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest">Protocol</Link>
                                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">Authorized</span>
                                        <span className="text-xs font-bold text-white">{user.full_name}</span>
                                    </div>
                                    <button onClick={handleLogout} className="p-2.5 glass-dark hover:bg-red-500/20 hover:border-red-500/50 rounded-xl transition-all group" title="Terminate Session">
                                        <LogOut size={18} className="text-neutral-400 group-hover:text-red-400" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest">Entry</Link>
                                <Link to="/register" className="relative group overflow-hidden bg-primary text-background px-6 py-2.5 rounded-xl transition-all font-bold hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]">
                                    <span className="relative z-10">Initialize</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-12">
                <Outlet />
            </main>
            <footer className="border-t border-white/5 py-10">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-neutral-600 text-xs font-medium uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} NeuroVisa // Neural Approval Protocol
                    </p>
                    <div className="flex gap-8">
                        <span className="text-neutral-500 text-[10px] uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Security Protocol</span>
                        <span className="text-neutral-500 text-[10px] uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Neural Link</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
