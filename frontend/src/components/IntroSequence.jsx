import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, Zap } from 'lucide-react';

const IntroSequence = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => onComplete(), 1000);
                    return 100;
                }
                return prev + 1;
            });
        }, 30);

        const stepTimer = setInterval(() => {
            setStep(prev => (prev < 3 ? prev + 1 : prev));
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(stepTimer);
        };
    }, [onComplete]);

    const messages = [
        "Initializing Neural Fabric...",
        "Establishing Secure Node Link...",
        "Syncing Biometric Telemetry...",
        "NeuroVisa Protocol Active"
    ];

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030014] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Neural Particles (CSS Powered) */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/40 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Central Icon Transformation */}
            <div className="relative mb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
                        className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-[0_0_50px_rgba(0,242,254,0.2)]"
                    >
                        {step === 0 && <Brain size={64} className="text-primary" />}
                        {step === 1 && <Shield size={64} className="text-secondary" />}
                        {step === 2 && <Zap size={64} className="text-accent" />}
                        {step >= 3 && <Brain size={64} className="text-white" />}

                        {/* Scanning Line */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-0.5 bg-primary/50 blur-sm pointer-events-none"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Neural Evaluation Text */}
            <div className="text-center space-y-4 px-6 max-w-md w-full">
                <motion.h2
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-black uppercase tracking-[0.4em] text-white"
                >
                    {messages[step]}
                </motion.h2>

                <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent"
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-neutral-500">
                    <span>Alpha Build 4.0.2</span>
                    <span>System Stability: 99.8%</span>
                </div>
            </div>

            {/* Skip Button */}
            <button
                onClick={onComplete}
                className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1"
            >
                Skip Neural Link
            </button>
        </motion.div>
    );
};

export default IntroSequence;
