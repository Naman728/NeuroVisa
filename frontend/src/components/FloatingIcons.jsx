import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Globe, Lock, Shield, Cpu } from 'lucide-react';

const icons = [
    { Icon: Brain, color: "text-blue-500/20" },
    { Icon: FileText, color: "text-purple-500/20" },
    { Icon: Globe, color: "text-cyan-500/20" },
    { Icon: Lock, color: "text-indigo-500/20" },
    { Icon: Shield, color: "text-emerald-500/20" },
    { Icon: Cpu, color: "text-blue-400/20" }
];

const FloatingIcons = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-5]">
            {[...Array(12)].map((_, i) => {
                const item = icons[i % icons.length];
                const initialX = (i * 37) % 100;
                const initialY = (i * 23) % 100;

                return (
                    <motion.div
                        key={i}
                        className={`absolute ${item.color}`}
                        initial={{ x: `${initialX}vw`, y: `${initialY}vh` }}
                        animate={{
                            x: [null, `${initialX + (Math.random() - 0.5) * 10}vw`],
                            y: [null, `${initialY + (Math.random() - 0.5) * 10}vh`],
                            rotate: [0, 360],
                            scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            translateX: (mousePos.x - window.innerWidth / 2) * (0.01 + Math.random() * 0.02),
                            translateY: (mousePos.y - window.innerHeight / 2) * (0.01 + Math.random() * 0.02),
                        }}
                    >
                        <item.Icon size={32 + (i % 3) * 16} strokeWidth={1} />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default FloatingIcons;
