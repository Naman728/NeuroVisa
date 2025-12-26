import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import PhysicsButton from './PhysicsButton';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md glass-dark border border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Decorative background pulse */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${type === 'danger' ? 'bg-red-500' : 'bg-primary'}`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{title}</h3>
                            <p className="text-neutral-400 mb-8 leading-relaxed">
                                {message}
                            </p>

                            <div className="flex gap-4">
                                <PhysicsButton
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-white hover:bg-white/10 transition-colors"
                                >
                                    {cancelText}
                                </PhysicsButton>
                                <PhysicsButton
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest ${type === 'danger' ? 'bg-red-500 text-white' : 'bg-primary text-background'
                                        }`}
                                >
                                    {confirmText}
                                </PhysicsButton>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
