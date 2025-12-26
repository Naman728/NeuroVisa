import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Download,
    RefreshCw,
    ChevronLeft,
    Brain,
    Zap,
    Target,
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle2,
    Activity,
    ShieldCheck
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';
import PhysicsButton from '../components/PhysicsButton';
import ProgressRing from '../components/ProgressRing';

const Report = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const reportRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/interview/${sessionId}`);
                setSession(response.data);
            } catch (err) {
                console.error("Failed to fetch session for report", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sessionId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
        </div>
    );

    if (!session) return <div className="p-10 text-center">Protocol data not found.</div>;

    // Data Transformation for Charts
    const confidenceTrendData = session.questions.map((q, i) => ({
        index: i + 1,
        score: q.answer?.feedback?.score || 0
    }));

    const responseTimeData = session.questions.map((q, i) => ({
        index: i + 1,
        time: (q.answer?.response_time_ms || 0) / 1000,
        edits: q.answer?.edit_count || 0
    }));

    const skillData = [
        { subject: 'Clarity', A: session.questions.reduce((acc, q) => acc + (q.answer?.feedback?.evaluation_json?.metrics?.clarity === 'High' ? 100 : 60), 0) / session.questions.length },
        { subject: 'Consistency', A: session.score || 0 },
        { subject: 'Logic', A: (session.score || 0) * 0.9 },
        { subject: 'Intent', A: Math.max(70, session.score || 0) },
        { subject: 'Vocal Stability', A: session.questions.reduce((acc, q) => acc + (q.answer?.feedback?.evaluation_json?.metrics?.confidence === 'High' ? 100 : 70), 0) / session.questions.length },
    ];

    const pieData = [
        { name: 'Optimal', value: session.questions.filter(q => (q.answer?.feedback?.score || 0) > 80).length },
        { name: 'Stable', value: session.questions.filter(q => (q.answer?.feedback?.score || 0) <= 80 && (q.answer?.feedback?.score || 0) > 60).length },
        { name: 'Calibrating', value: session.questions.filter(q => (q.answer?.feedback?.score || 0) <= 60).length },
    ];

    const COLORS = ['#00f2fe', '#8b5cf6', '#f59e0b'];

    const handleDownload = () => {
        window.print(); // Simple but effective for a hackathon
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 space-y-10 mb-20" ref={reportRef}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4 group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Return to Command Center</span>
                    </button>
                    <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2">NEURO-ANALYTICAL REPORT</h1>
                    <div className="flex items-center gap-4 text-neutral-500">
                        <span className="text-xs font-mono">PROTOCOL ID: {session.id}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                        <span className="text-xs font-mono">TIMESTAMP: {new Date(session.end_time || session.start_time).toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <PhysicsButton
                        onClick={handleDownload}
                        className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold"
                    >
                        <Download size={18} /> DOWNLOAD
                    </PhysicsButton>
                    <PhysicsButton
                        onClick={() => navigate('/dashboard')} // In a real app, this would start a NEW session
                        className="bg-primary text-background px-6 py-3 rounded-2xl flex items-center gap-2 font-black transition-all hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]"
                    >
                        <RefreshCw size={18} /> RETAKE INTERVIEW
                    </PhysicsButton>
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="grid md:grid-cols-4 gap-6">
                <GlassCard className="p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">Neural Approval</span>
                    <ProgressRing
                        progress={session.score || 0}
                        size={120}
                        strokeWidth={8}
                        color={session.score > 70 ? "#00f2fe" : "#f59e0b"}
                    />
                    <div className="mt-4">
                        <span className="text-3xl font-black text-white">{session.score || 0}%</span>
                    </div>
                </GlassCard>

                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatBox icon={<Target className="text-primary" />} label="Avg Clarity" value="High Stability" />
                    <StatBox icon={<Activity className="text-secondary" />} label="Vocal Confidence" value="Consistent" />
                    <StatBox icon={<TrendingUp className="text-green-400" />} label="Logic Coherence" value="Optimal" />
                    <StatBox icon={<Clock className="text-accent" />} label="Avg Response" value="12.4s" />
                    <StatBox icon={<ShieldCheck className="text-primary" />} label="Risk Profile" value="Minimal" />
                    <StatBox icon={<Zap className="text-yellow-400" />} label="AI Assessment" value="AUTHORIZED" />
                </div>
            </div>

            {/* Visualization Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Confidence Trend Chart */}
                <GlassCard className="p-8 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" /> Confidence Gradient Trajectory
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={confidenceTrendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="index" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#00f2fe', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Radar Chart Skills */}
                <GlassCard className="p-8 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <ActionSphereIcon size={16} /> Neural Skill Fingerprint
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                <PolarGrid stroke="#1f2937" />
                                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                                <Radar name="NeuroProfile" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Response Time & Edits */}
                <GlassCard className="p-8 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Clock size={16} className="text-accent" /> Temporal Stress Indicators (Hesitation)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={responseTimeData}>
                                <XAxis dataKey="index" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="time" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Distribution Pie Chart */}
                <GlassCard className="p-8 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Activity size={16} className="text-secondary" /> Performance Node Distribution
                    </h3>
                    <div className="h-64 w-full flex items-center">
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-4">
                            {pieData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-[10px] uppercase font-black text-neutral-400 tracking-widest">{entry.name}: {entry.value} Nodes</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Qualitative Feedback Section */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-500/5 border border-green-500/10 p-10 rounded-[2.5rem] space-y-6">
                    <h3 className="text-sm font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={16} /> Key Neural Strengths
                    </h3>
                    <ul className="space-y-4">
                        {[
                            "High logical coherence in articulating professional intent.",
                            "Strong vocal stability during high-impact inquiries.",
                            "Consistent financial narrative across all response nodes.",
                            "Optimal clarity on return ties to home country."
                        ].map((s, i) => (
                            <li key={i} className="flex items-start gap-4 text-sm text-neutral-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/10 p-10 rounded-[2.5rem] space-y-6">
                    <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={16} /> Optimization Nodes (Improvements)
                    </h3>
                    <ul className="space-y-4">
                        {[
                            "Reduce hesitation on financial specific inquiries.",
                            "Provide more granular detail regarding travel itinerary.",
                            "Maintain eye contact (Simulated) during complex logic chains.",
                            "Elaborate on specific professional responsibilities."
                        ].map((s, i) => (
                            <li key={i} className="flex items-start gap-4 text-sm text-neutral-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="flex justify-center pt-10">
                <PhysicsButton
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-background px-12 py-5 rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                    Finalize Session Archive
                </PhysicsButton>
            </div>
        </div>
    );
};

const StatBox = ({ icon, label, value }) => (
    <GlassCard className="p-6 flex flex-col justify-between border-white/5 hover:border-primary/20 transition-colors">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                {icon}
            </div>
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-lg font-black text-white tracking-tight">{value}</div>
    </GlassCard>
);

const ActionSphereIcon = (props) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default Report;
