import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

const Background3D = () => {
    const vantaRef = useRef(null);

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
                points: 15.00,
                maxDistance: 20.00,
                spacing: 15.00,
                showDots: true,
                backgroundAlpha: 1.0
            });
        } catch (error) {
            console.error("[Vanta] Failed to initialize background effect", error);
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, []);

    return (
        <div
            ref={vantaRef}
            className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}
        />
    );
};

export default Background3D;
