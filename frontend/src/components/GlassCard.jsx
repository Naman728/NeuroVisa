import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position relative to the card center (-1 to 1)
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smoothed values for rotation
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

    // Dynamic shadow and reflection position
    const lightX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
    const lightY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });

    const handleMouseMove = (event) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();

        // Calculate normalized mouse position (-0.5 to 0.5)
        const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (event.clientY - rect.top) / rect.height - 0.5;

        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX: rotateX,
                rotateY: rotateY,
                transition: "transform 0.1s ease-out"
            }}
            className={`relative glass-dark rounded-[2.5rem] border border-white/10 overflow-hidden group/glass ${className}`}
        >
            {/* Dynamic Reflection Light */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover/glass:opacity-100 transition-opacity duration-500"
                style={{
                    background: useTransform(
                        [lightX, lightY],
                        ([lx, ly]) => `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
                    )
                }}
            />

            {/* Subtle Border Beam */}
            <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            {/* Dynamic Shadow Depth */}
            <motion.div
                className="absolute -inset-4 bg-primary/20 blur-[40px] -z-10 opacity-0 group-hover/glass:opacity-30 transition-opacity duration-500"
                style={{
                    x: useTransform(x, [-0.5, 0.5], [20, -20]),
                    y: useTransform(y, [-0.5, 0.5], [20, -20]),
                }}
            />
        </motion.div>
    );
};

export default GlassCard;
