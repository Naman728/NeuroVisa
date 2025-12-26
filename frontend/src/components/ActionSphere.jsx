import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActionSphere = ({
    icon: Icon,
    label,
    isActive,
    isPulse,
    onClick,
    disabled,
    color = "primary" // primary, secondary, accent
}) => {
    const colorMap = {
        primary: "rgba(0, 242, 254, 0.4)",
        secondary: "rgba(139, 92, 246, 0.4)",
        accent: "rgba(245, 158, 11, 0.4)"
    };

    const neonColor = colorMap[color] || colorMap.primary;

    return (
        <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="relative">
                {/* Active Outer Glow */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 rounded-full blur-xl"
                            style={{ backgroundColor: neonColor }}
                        />
                    )}
                </AnimatePresence>

                {/* Pulsing Ring for Recording/Listening */}
                <AnimatePresence>
                    {isPulse && (
                        <motion.div
                            animate={{
                                scale: [1, 1.5],
                                opacity: [0.5, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeOut"
                            }}
                            className="absolute inset-0 rounded-full border-2"
                            style={{ borderColor: neonColor }}
                        />
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={onClick}
                    disabled={disabled}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isActive
                            ? 'bg-white text-background shadow-[0_0_30px_rgba(255,255,255,0.4)]'
                            : 'bg-white/5 text-neutral-500 border border-white/10 hover:border-white/20'
                        } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <Icon size={32} strokeWidth={isActive ? 2.5 : 2} />
                </motion.button>
            </div>

            <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isActive ? 'text-white' : 'text-neutral-600'
                }`}>
                {label}
            </span>
        </motion.div>
    );
};

export default ActionSphere;
