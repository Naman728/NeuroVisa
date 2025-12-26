import React from 'react';
import { motion } from 'framer-motion';

const PhysicsButton = ({ children, onClick, className = "", disabled = false, type = "button" }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 10px 20px -5px rgba(0, 242, 254, 0.3)"
            }}
            whileTap={{
                scale: 0.98,
                y: 0
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 15
            }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

export default PhysicsButton;
