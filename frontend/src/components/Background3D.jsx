import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';
import { motion, AnimatePresence } from 'framer-motion';

import FloatingIcons from './FloatingIcons';

const Background3D = () => {
    const vantaRef = useRef(null);
    const [ripples, setRipples] = useState([]);

    const handleBackgroundClick = (e) => {
        const id = Date.now();
        setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 1000);
    };

    useEffect(() => {
        let vantaEffect = null;
        try {
            vantaEffect = NET({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x00f2fe, // Neon Cyan
                backgroundColor: 0x030014, // Deep Dark Space
                points: 20.00, // Increased density
                maxDistance: 22.00,
                spacing: 16.00,
                showDots: true,
                backgroundAlpha: 1.0
            });
        } catch (error) {
            console.error("[Vanta] Failed to initialize background effect", error);
        }

        window.addEventListener('click', handleBackgroundClick);

        return () => {
            if (vantaEffect) vantaEffect.destroy();
            window.removeEventListener('click', handleBackgroundClick);
        };
    }, []);

    return (
        <>
            <div
                ref={vantaRef}
                className="fixed inset-0 -z-20 w-full h-full pointer-events-none"
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}
            />
            <FloatingIcons />

            {/* Click Ripple Layer */}
            <div className="fixed inset-0 z-[-15] pointer-events-none">
                <AnimatePresence>
                    {ripples.map(ripple => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute w-20 h-20 border border-primary/30 rounded-full"
                            style={{
                                left: ripple.x - 40,
                                top: ripple.y - 40
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

export default Background3D;
