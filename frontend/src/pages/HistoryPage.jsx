import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FolderHeart, Clock, TrendingUp, ChevronRight, FileText, Download, Activity, Award } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts';
import axios from 'axios';

export default function HistoryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:4000/api/report/history/${user.id}`)
                .then(res => {
                    const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setReports(sorted);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (!user) return <Navigate to="/login" replace />;

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

    if (loading) return <div className="p-12 text-center">Loading History...</div>;

    const totalAnalyzed = reports.length;
    const avgATS = totalAnalyzed > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.atsScore || 0), 0) / totalAnalyzed) : 0;
    const bestMatch = totalAnalyzed > 0 ? Math.max(...reports.map(r => r.matchScore || 0)) : 0;

    // Chart Data Preparation (Reverse for chronological order)
    const chartData = [...reports].reverse().map((r, idx) => ({
        name: `Run ${idx + 1}`,
        match: r.matchScore || 0,
        ats: r.atsScore || 0,
        date: new Date(r.createdAt).toLocaleDateString()
    }));

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8 min-h-[90vh]">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-b border-gray-800 pb-8 text-center md:text-left flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 justify-center md:justify-start">
                        <Clock className="text-cyan-400 w-10 h-10" /> Career Analysis History
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg">Track your improvement iteration by iteration.</p>
                </div>
                <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 rounded-lg text-white font-bold flex items-center gap-2 transition-all">
                    Analyze a New Resume <ChevronRight className="w-5 h-5" />
                </button>
            </motion.div>

            {totalAnalyzed === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">No Saved Reports Yet</h2>
                    <p className="text-gray-400 max-w-md">
                        After you analyze a resume against a job description while logged in, the AI will build your history timeline here.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Dashboard Metric Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-6 border-l-4 border-l-blue-500">
                            <p className="text-gray-400 text-sm font-medium uppercase mb-2">Total Analyzed</p>
                            <p className="text-3xl font-black text-white">{totalAnalyzed}</p>
                        </div>
                        <div className="glass-card p-6 border-l-4 border-l-cyan-500">
                            <p className="text-gray-400 text-sm font-medium uppercase mb-2">Average ATS Score</p>
                            <p className="text-3xl font-black text-white">{avgATS}%</p>
                        </div>
                        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                            <p className="text-gray-400 text-sm font-medium uppercase mb-2">Best Match</p>
                            <p className="text-3xl font-black text-white">{bestMatch}%</p>
                        </div>
                        <div className="glass-card p-6 border-l-4 border-l-amber-500">
                            <p className="text-gray-400 text-sm font-medium uppercase mb-2">Latest Status</p>
                            <p className="text-xl font-bold text-white mt-1">{reports[0]?.status}</p>
                        </div>
                    </div>

                    {/* Trends Chart */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-400" /> AI Score Timeline Over Iterations
                        </h3>
                        <div className="w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="match" name="Match Status %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="ats" name="ATS Score %" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/80 border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-5 font-semibold">Resume Date</th>
                                    <th className="p-5 font-semibold">Job Role</th>
                                    <th className="p-5 font-semibold">Scores</th>
                                    <th className="p-5 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {reports.map((report, idx) => (
                                    <motion.tr
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={idx}
                                        className="hover:bg-gray-800/30 transition group"
                                    >
                                        <td className="p-5 text-gray-300 font-medium">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-indigo-400" />
                                                {new Date(report.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-5 font-medium text-white">
                                            {report.suggestedRoles?.[0] || 'Unknown'}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                                                    Match: <span className="font-bold">{report.matchScore}%</span>
                                                </div>
                                                <div className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">
                                                    ATS: <span className="font-bold">{report.atsScore}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate('/dashboard', { state: { result: report } })} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition cursor-pointer text-white">
                                                    View Report
                                                </button>
                                                <button onClick={() => handleDownload(report)} className="px-3 py-1 bg-indigo-600/50 hover:bg-indigo-600 rounded text-sm font-medium transition cursor-pointer text-white flex items-center gap-1">
                                                    <Download className="w-4 h-4" /> PDF
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
