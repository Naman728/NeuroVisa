import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = "currentColor", glowColor }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                        filter: glowColor ? `drop-shadow(0 0 8px ${glowColor})` : 'none'
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-2xl font-black text-white"
                >
                    {progress}%
                </motion.span>
            </div>
        </div>
    );
};

export default ProgressRing;
