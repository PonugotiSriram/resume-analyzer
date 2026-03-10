import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function LoginCelebration() {
    const { justLoggedIn, clearCelebration } = useAuth();

    useEffect(() => {
        if (justLoggedIn) {
            // Trigger confetti burst
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#818cf8', '#22d3ee', '#34d399', '#f472b6']
            });

            // Clear celebration after 4 seconds
            const timer = setTimeout(() => {
                clearCelebration();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn, clearCelebration]);

    if (!justLoggedIn) return null;

    // Generate random falling papers
    const papers = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}vw`,
        animationDuration: `${1.5 + Math.random() * 1.5}s`,
        delay: `${Math.random() * 0.5}s`,
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 720,
        size: Math.random() > 0.5 ? 'text-4xl' : 'text-5xl',
        isWhite: Math.random() > 0.5,
        color: ['#818cf8', '#22d3ee', '#34d399', '#f472b6'][Math.floor(Math.random() * 4)]
    }));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-950/70 backdrop-blur-md transition-opacity"
                />

                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="z-10 bg-gray-900/90 text-white px-10 py-8 rounded-3xl shadow-2xl shadow-indigo-500/50 backdrop-blur-xl border border-indigo-500/50 text-center"
                >
                    <div className="text-5xl mb-4">🚀</div>
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                        Welcome Back!
                    </h2>
                    <p className="text-gray-300 font-medium text-lg">Your AI Career Dashboard is ready.</p>
                </motion.div>

                {papers.map((paper) => (
                    <motion.div
                        key={paper.id}
                        className={`absolute top-[-100px] ${paper.size} drop-shadow-xl`}
                        initial={{ y: -100, x: paper.left, rotate: paper.rotateStart, opacity: 1 }}
                        animate={{
                            y: '120vh',
                            rotate: paper.rotateEnd,
                        }}
                        transition={{
                            duration: parseFloat(paper.animationDuration),
                            delay: parseFloat(paper.delay),
                            ease: "easeIn"
                        }}
                    >
                        {paper.isWhite ? '📄' : (
                            <svg className="w-10 h-10" fill={paper.color} viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z" />
                            </svg>
                        )}
                    </motion.div>
                ))}
            </div>
        </AnimatePresence>
    );
}
