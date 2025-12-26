import React from 'react';
import { motion } from 'framer-motion';

const ConfidencePulse = ({ children, score }) => {
    const pulseScale = score > 70 ? [1, 1.05, 1] : [1, 1.02, 1];
    const pulseOpacity = score > 70 ? [0.4, 0.7, 0.4] : [0.2, 0.4, 0.2];
    const duration = score > 70 ? 2 : 4;

    return (
        <div className="relative inline-block">
            <motion.div
                animate={{
                    scale: pulseScale,
                    opacity: pulseOpacity,
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className={`absolute inset-0 blur-xl rounded-full -z-10 ${score > 70 ? 'bg-primary' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
            />
            {children}
        </div>
    );
};

export default ConfidencePulse;
