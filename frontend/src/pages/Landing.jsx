import { Link } from 'react-router-dom';
import { CheckCircle, Brain, Play, Fingerprint, MessageSquare, Cpu, ArrowRight, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-32 pb-32 overflow-hidden">
            {/* Hero Section */}
            <section className="relative text-center space-y-12 pt-16 md:pt-32 px-4">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute top-40 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="flex justify-center">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass px-6 py-2 rounded-full text-sm font-medium text-primary border-primary/20 flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4 text-primary animate-pulse" />
                            Neural Decision Intelligence
                        </motion.span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white">
                        Decode Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient">
                            Approval Logic
                        </span>
                    </h1>
                </motion.div>

                <motion.p
                    className="text-xl md:text-2xl text-neutral-400 max-w-4xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    NeuroVisa leverages <span className="text-white font-semibold italic">Neural Analytics</span> to simulate embassy protocols.
                    Practice with the world's first AI officer trained on cognitive approval patterns.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row justify-center gap-6 pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {user ? (
                        <Link to="/dashboard" className="group relative glass px-12 py-6 rounded-[2rem] text-lg font-black transition-all hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] flex items-center justify-center gap-3 overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                            <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest">
                                Open Portal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="group relative bg-primary text-background px-12 py-6 rounded-[2rem] text-lg font-black transition-all hover:shadow-[0_0_40px_rgba(0,242,254,0.5)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 uppercase tracking-widest">
                                Initialize Identity <Fingerprint size={22} />
                            </Link>
                            <Link to="/login" className="group glass px-12 py-6 rounded-[2rem] text-lg font-bold transition-all hover:bg-white/5 flex items-center justify-center gap-2 uppercase tracking-widest">
                                Identity Access
                            </Link>
                        </>
                    )}
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section className="px-4 max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">The Neural Protocol</h2>
                    <p className="text-neutral-500 text-xl font-medium">Sync your profile with the embassy mindset</p>
                </div>
                <div className="grid md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10" />

                    <StepCard
                        number="01"
                        icon={<Fingerprint size={32} className="text-primary" />}
                        title="Identity Sync"
                        description="Upload your bio-metrics and visa intentions to calibrate the neural model."
                    />
                    <StepCard
                        number="02"
                        icon={<Brain size={32} className="text-secondary" />}
                        title="Cognitive Drill"
                        description="Engage in a sensory-realistic simulation with an adaptive AI officer."
                    />
                    <StepCard
                        number="03"
                        icon={<Target size={32} className="text-accent" />}
                        title="Approval Pulse"
                        description="Receive real-time telemetry on your readiness and likelihood of success."
                    />
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-4 max-w-7xl mx-auto">
                <GlassCard className="p-16 md:p-32 rounded-[4rem] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />

                    <div className="relative z-10 space-y-24">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">Bio-Neural Modules</h2>
                            <p className="text-neutral-400 text-lg md:text-xl">Engineered for high-stakes decision environments.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            <FeatureCard
                                icon={<Cpu className="text-primary" size={32} />}
                                title="Neural Bridge"
                                highlight="Cross-Embassy Logic"
                                description="Real-time calibration for USA, UK, Canada, and EU visa protocols."
                            />
                            <FeatureCard
                                icon={<Brain className="text-secondary" size={32} />}
                                title="Voice Biometrics"
                                highlight="Confidence Analysis"
                                description="Deep analysis of vocal tonality, hesitation patterns, and logical stability."
                            />
                            <FeatureCard
                                icon={<CheckCircle className="text-accent" size={32} />}
                                title="Risk Sentinel"
                                highlight="Pattern Detection"
                                description="Identify cognitive red flags before they manifest in a real interview."
                            />
                        </div>
                    </div>
                </GlassCard>
            </section>
        </div>
    );
};

const StepCard = ({ number, icon, title, description }) => (
    <GlassCard className="p-12 text-center group h-full">
        <div className="w-24 h-24 mx-auto glass rounded-[2rem] flex items-center justify-center mb-10 border-white/10 group-hover:border-primary/50 transition-all shadow-2xl relative z-20 group-hover:scale-110">
            {icon}
        </div>
        <div className="absolute top-8 right-10 text-6xl font-black opacity-5 text-white group-hover:opacity-10 transition-opacity z-0">
            {number}
        </div>
        <h3 className="text-2xl font-black text-white mb-4 relative z-10 tracking-tight">{title}</h3>
        <p className="text-neutral-400 leading-relaxed relative z-10 text-sm md:text-base">
            {description}
        </p>
    </GlassCard>
);

const FeatureCard = ({ icon, title, description, highlight }) => (
    <GlassCard className="p-12 group text-left h-full">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-20">
            {icon}
        </div>
        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary transition-colors relative z-10 tracking-tight">{title}</h3>
        {highlight && (
            <span className="inline-block px-3 py-1 bg-white/5 text-[10px] font-black text-primary rounded-full mb-6 uppercase tracking-[0.2em] border border-primary/20 relative z-10">
                {highlight}
            </span>
        )}
        <p className="text-neutral-400 leading-relaxed relative z-10 text-sm">
            {description}
        </p>
    </GlassCard>
);

export default Landing;
