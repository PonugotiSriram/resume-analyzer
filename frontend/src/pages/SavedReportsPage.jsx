import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FolderHeart, Clock, TrendingUp, ChevronRight, FileText, Download } from 'lucide-react';
import axios from 'axios';

export default function SavedReportsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (user && user.resumeHistory) {
            // Sort newest first
            setReports([...user.resumeHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleDownload = async (report) => {
        try {
            const response = await axios.post('http://localhost:4000/api/report/download', {
                candidate: report,
                jobRole: report.suggestedRoles?.[0] || 'Unknown'
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${report.name || 'Candidate'}_History_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download historical report");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8 min-h-[90vh]">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-b border-gray-800 pb-8 text-center md:text-left flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 justify-center md:justify-start">
                        <FolderHeart className="text-rose-400 w-10 h-10" /> Saved Archives
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg">Your historical resume compatibility reports and AI coaching advice.</p>
                </div>
                <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 rounded-lg text-white font-bold flex items-center gap-2 transition-all">
                    Analyze a New Resume <ChevronRight className="w-5 h-5" />
                </button>
            </motion.div>

            {reports.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                        <Clock className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Saved Reports Yet</h2>
                    <p className="text-gray-400 max-w-md">
                        After you analyze a resume against a job description while logged in, the comprehensive AI report will be automatically saved here to track your improvement over time.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="glass-card p-6 flex flex-col justify-between group hover:border-indigo-500/50 transition-all border border-gray-700"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-500/20 p-3 rounded-lg"><FileText className="w-6 h-6 text-indigo-400" /></div>
                                    <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Score: {report.matchScore}%</h3>
                                <p className="text-sm font-medium text-cyan-400 mb-4">ATS: {report.atsScore}% · Health: {report.healthScore}/100</p>
                                <div className="space-y-2 mb-6 text-sm text-gray-300">
                                    <p className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>Matched Skills</span> <span className="text-emerald-400 font-bold">{report.matchedSkills?.length || 0}</span>
                                    </p>
                                    <p className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>Missing Skills</span> <span className="text-red-400 font-bold">{report.missingSkills?.length || 0}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate('/dashboard', { state: { result: report } })}
                                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium text-sm transition-all text-center"
                                >
                                    View Analysis
                                </button>
                                <button
                                    onClick={() => handleDownload(report)}
                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> PDF
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

        </div>
    );
}
