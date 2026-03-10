import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, Layout } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl z-10"
            >
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6">
                    AI Career Intelligence Engine
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
                    Smarter Hiring, <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                        Automated Screening.
                    </span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Upload resumes and job descriptions. Let cutting-edge NLP instantly rank candidates and uncover hidden potential.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/upload" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105">
                        Analyze Resume (Student Mode)
                    </Link>
                    <Link to="/recruiter" className="glass-card px-8 py-4 rounded-xl font-bold hover:bg-gray-800/60 transition-all transform hover:scale-105">
                        Recruiter Dashboard
                    </Link>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full z-10">
                <FeatureCard
                    icon={<Zap className="w-8 h-8 text-amber-400" />}
                    title="Instant NLP Extraction"
                    description="We use SpaCy/NLTK to automatically distill your raw resume PDFs into categorized skills, experience, and projects."
                />
                <FeatureCard
                    icon={<Target className="w-8 h-8 text-emerald-400" />}
                    title="Smart Skill Matching"
                    description="Find missing skills, calculate match percentage, and generate actionable improvement suggestions instantaneously."
                />
                <FeatureCard
                    icon={<Layout className="w-8 h-8 text-cyan-400" />}
                    title="Automated Ranking"
                    description="Recruiters can mass-upload resumes and view a leaderboard of the most qualified candidates for any job description."
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-6 flex flex-col items-start gap-4"
        >
            <div className="p-3 bg-gray-900/50 rounded-lg">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </motion.div>
    );
}
