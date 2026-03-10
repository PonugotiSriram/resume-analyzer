import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Download, Code, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PAPERS = [
    {
        id: 1,
        title: 'Data Structures Interview Guide',
        description: 'Comprehensive 50-page PDF covering arrays, trees, graphs, and dynamic programming with optimal solutions.',
        icon: <Code className="w-8 h-8 text-cyan-400" />,
        color: 'from-cyan-900/40 to-cyan-800/20',
    },
    {
        id: 2,
        title: 'System Design Cheat Sheet',
        description: 'Master scalability, load balancing, caching, and database sharding with this quick-reference architecture guide.',
        icon: <Layers className="w-8 h-8 text-indigo-400" />,
        color: 'from-indigo-900/40 to-indigo-800/20',
    },
    {
        id: 3,
        title: 'Top 100 Coding Problems',
        description: 'A curated list of the most frequent LeetCode-style questions asked by FAANG companies, categorized by pattern.',
        icon: <BookOpen className="w-8 h-8 text-emerald-400" />,
        color: 'from-emerald-900/40 to-emerald-800/20',
    },
    {
        id: 4,
        title: 'Resume Writing Guide 2026',
        description: 'Action verb lists, formatting templates, and ATS-beating strategies to maximize your screening passing rate.',
        icon: <FileText className="w-8 h-8 text-amber-400" />,
        color: 'from-amber-900/40 to-amber-800/20',
    }
];

export default function PapersPage() {
    const { user } = useAuth();

    // Protect route
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8 min-h-[90vh]">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-b border-gray-800 pb-8 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 justify-center md:justify-start">
                    <BookOpen className="text-indigo-400 w-10 h-10" /> AI Career Papers & Resources
                </h1>
                <p className="text-gray-400 mt-3 text-lg">Premium study materials reserved exclusively for registered NexusAI members.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PAPERS.map((paper, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={paper.id}
                        className={`glass-card p-6 bg-gradient-to-br ${paper.color} flex flex-col justify-between group`}
                    >
                        <div className="mb-6">
                            <div className="bg-gray-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                {paper.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{paper.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{paper.description}</p>
                        </div>

                        <button className="w-full py-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-gray-600 group-hover:border-indigo-500/50">
                            <Download className="w-5 h-5 text-indigo-400" /> Download PDF
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
