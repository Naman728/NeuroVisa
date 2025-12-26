import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, FileText, BarChart2, Plus, ArrowRight, CheckCircle, Smartphone, Zap, Fingerprint, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ProgressRing from '../components/ProgressRing';
import PhysicsButton from '../components/PhysicsButton';
import ConfidencePulse from '../components/ConfidencePulse';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({
        completedCount: 0,
        avgScore: 0,
        readiness: 0,
        recentStatus: 'Not Started'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get('/interview/my-sessions');
                const sessionData = response.data;
                setSessions(sessionData); // They come ordered by start_time asc/desc? Assuming we might need to sort.

                // Calculate Stats
                const completed = sessionData.filter(s => s.status === 'completed');
                const avg = completed.length > 0
                    ? Math.round(completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length)
                    : 0;

                // Simple Weighted Readiness Logic: Avg Score * 0.7 + Completion Count * 5 (capped at 95)
                let readiness = Math.min(96, Math.round(avg * 0.8 + (completed.length * 2)));
                if (completed.length === 0) readiness = 10; // Baseline

                // Recent Status
                const lastSession = sessionData[sessionData.length - 1]; // Assuming appended last
                const recentStatus = lastSession ? (lastSession.status === 'completed' ? 'Ready for Next' : 'In Progress') : 'Not Started';

                setStats({
                    completedCount: completed.length,
                    avgScore: avg,
                    readiness,
                    recentStatus
                });

            } catch (error) {
                console.error("Failed to fetch sessions", error);
            }
        };
        fetchSessions();
    }, []);

    const handleStartInterview = async () => {
        try {
            const response = await api.post('/interview/start');
            navigate(`/interview/${response.data.id}`);
        } catch (error) {
            console.error("Failed to start interview", error);
        }
    };

    // Sort sessions for display (newest first)
    const sortedSessions = [...sessions].reverse();

    const formatDuration = (start, end) => {
        if (!end) return 'In Progress';
        const durationMs = new Date(end) - new Date(start);
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Welcome Section with AI Insight */}
            <div className="grid md:grid-cols-3 gap-8">
                <GlassCard className="md:col-span-2 p-10 flex flex-col justify-center relative group">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <h1 className="text-4xl font-black mb-2 z-10 tracking-tight">System Authorized: {user?.full_name}</h1>
                    <p className="text-neutral-400 z-10 mb-8 max-w-lg">
                        Neural profile synced for <span className="text-primary font-bold">{user?.target_country} ({user?.visa_type} Protocol)</span>.
                        The evaluator is ready for sync.
                    </p>

                    <div className="flex flex-wrap gap-4 z-10">
                        {stats.recentStatus === 'In Progress' ? (
                            <>
                                <PhysicsButton
                                    onClick={() => navigate(`/interview/${sessions[sessions.length - 1].id}`)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-lg font-black transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2"
                                >
                                    <Smartphone size={22} /> RESUME PROTOCOL
                                </PhysicsButton>
                                <PhysicsButton
                                    onClick={handleStartInterview}
                                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-black transition-all border border-white/10 flex items-center gap-2 group"
                                >
                                    <Plus size={22} className="group-hover:rotate-90 transition-transform" /> NEW PROTOCOL
                                </PhysicsButton>
                            </>
                        ) : (
                            <PhysicsButton
                                onClick={handleStartInterview}
                                className="bg-primary text-background px-8 py-4 rounded-2xl text-lg font-black transition-all shadow-xl shadow-primary/30 flex items-center gap-2 group"
                            >
                                <Zap size={22} className="fill-current" /> INITIALIZE SIMULATION
                            </PhysicsButton>
                        )}
                    </div>
                </GlassCard>

                {/* AI Readiness Card */}
                <GlassCard className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-500/5 pointer-events-none" />

                    <h3 className="text-gray-400 font-black mb-4 text-[10px] uppercase tracking-[0.2em]">Neural Approval Pulse</h3>

                    <div className="mb-6">
                        <ConfidencePulse score={stats.readiness}>
                            <ProgressRing
                                progress={stats.readiness}
                                size={140}
                                strokeWidth={10}
                                color={stats.readiness > 70 ? "#10b981" : stats.readiness > 40 ? "#f59e0b" : "#ef4444"}
                                glowColor={stats.readiness > 70 ? "rgba(16, 185, 129, 0.5)" : "rgba(245, 158, 11, 0.3)"}
                            />
                        </ConfidencePulse>
                    </div>

                    <p className={`text-[10px] font-black uppercase tracking-widest ${stats.readiness > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {stats.readiness > 70 ? 'High probability link' : stats.readiness > 40 ? 'Calibrating...' : 'Weak Connectivity'}
                    </p>
                </GlassCard>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Fingerprint className="text-primary" />}
                    value={stats.completedCount}
                    label="Nodes Completed"
                />
                <StatCard
                    icon={<Zap className="text-secondary" />}
                    value={`${stats.avgScore}%`}
                    label="Neural Stability"
                />
                <StatCard
                    icon={<Target className="text-accent" />}
                    value={stats.recentStatus === 'Ready for Next' ? 'CALIBRATED' : stats.recentStatus.toUpperCase()}
                    label="System Status"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-surface rounded-2xl border border-gray-800 p-6">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black tracking-tight">Neural History</h3>
                    <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-white transition-colors">Full Archive</Link>
                </div>

                {sortedSessions.length > 0 ? (
                    <div className="space-y-4">
                        {sortedSessions.slice(0, 5).map(session => (
                            <div key={session.id} className="group bg-background p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400 animate-pulse'}`}>
                                        {session.status === 'completed' ? <CheckCircle size={20} /> : <Play size={20} className="ml-1" />}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-gray-200">
                                            {session.status === 'completed' ? 'Practice Interview (Completed)' : 'Practice Interview (In Progress)'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(session.start_time).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {session.end_time && ` • Duration: ${formatDuration(session.start_time, session.end_time)}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {session.status === 'completed' ? (
                                        <>
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-400 uppercase">Score</span>
                                                <span className={`font-bold ${session.score >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {session.score || 0}%
                                                </span>
                                            </div>
                                            <PhysicsButton
                                                onClick={(e) => { e.stopPropagation(); navigate(`/report/${session.id}`); }}
                                                className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all border border-primary/20"
                                                title="View Detailed Report"
                                            >
                                                <FileText size={18} />
                                            </PhysicsButton>
                                        </>
                                    ) : (
                                        <PhysicsButton
                                            onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}`); }}
                                            className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                                        >
                                            RESUME
                                        </PhysicsButton>
                                    )}

                                    <button
                                        onClick={() => navigate(session.status === 'completed' ? `/report/${session.id}` : `/interview/${session.id}`)}
                                        className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <Play size={24} />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">No interviews yet</h4>
                        <p className="text-gray-400 max-w-sm mx-auto mb-6">Start your first mock interview to get your AI readiness score.</p>
                        <button onClick={handleStartInterview} className="text-primary hover:underline font-medium">Start your first one now</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, value, label }) => (
    <GlassCard className="p-8">
        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-background/50 rounded-xl border border-white/5 group-hover:border-primary/50 transition-colors">
                    {icon}
                </div>
                <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-[0.2em]">{label}</span>
            </div>
            <div className="text-4xl font-black text-white">{value}</div>
        </div>
    </GlassCard>
);

export default Dashboard;
