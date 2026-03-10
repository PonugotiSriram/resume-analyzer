import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, Tooltip as RechartsTooltip
} from 'recharts';
import { Award, CheckCircle, XCircle, TrendingUp, Cpu, Briefcase, FileDown, Route, Activity, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
    const { state } = useLocation();
    const result = state?.result || state;

    const { user } = useAuth();
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:4000/api/report/history/${user.id}`).then(res => {
                const sorted = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setHistoryData(sorted);
            }).catch(console.error);
        }
    }, [user]);

    if (!result) return <Navigate to="/upload" />;

    const {
        matchScore, healthScore, matchedSkills, missingSkills, status, suggestions,
        atsScore, healthBreakdown, roadmap, aiCoachSuggestions, suggestedRoles, topIndustrySkills
    } = result;

    const chartData = [
        { name: 'Matched', value: matchScore, color: '#10b981' },
        { name: 'Missing', value: 100 - matchScore, color: '#f43f5e' }
    ];

    const barData = [
        { name: 'Matched', count: matchedSkills?.length || 0, fill: '#10b981' },
        { name: 'Missing', count: missingSkills?.length || 0, fill: '#f43f5e' }
    ];

    const handleDownload = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/report/download', {
                candidate: result,
                jobRole: suggestedRoles?.[0] || 'Unknown'
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${result.name || 'Candidate'}_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download report");
        }
    };

    let previousScore = null;
    let improvementLineData = [];
    if (historyData.length > 0) {
        // Look for the report right before this exact one (or the latest if this is a fresh run not in history yet)
        const currentIdx = historyData.findIndex(h => h.createdAt === result.createdAt);
        if (currentIdx > 0) {
            previousScore = historyData[currentIdx - 1].matchScore;
        } else if (currentIdx === -1 && historyData.length > 0) {
            // Unsaved run or newly completed run
            previousScore = historyData[historyData.length - 1].matchScore;
        }

        improvementLineData = historyData.map((h, i) => ({
            name: `V${i + 1}`,
            score: h.matchScore
        }));
        // If current run not in history array yet, mock append for chart
        if (currentIdx === -1) {
            improvementLineData.push({ name: `V${historyData.length + 1}`, score: matchScore });
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-8 min-h-screen">

            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Cpu className="text-cyan-400 w-8 h-8" /> Analysis Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">AI-driven actionable insights for your resume.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-500/20">
                        <FileDown className="w-5 h-5" /> Download Report
                    </button>
                    <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl shadow-inner border border-gray-700 hidden sm:flex">
                        <div className="text-center px-4 border-r border-gray-700">
                            <p className="text-sm font-medium text-gray-400 uppercase">Match</p>
                            <p className="text-2xl font-black text-white">{matchScore}%</p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-400 uppercase">ATS Score</p>
                            <p className="text-2xl font-black text-white">{atsScore || 0}%</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-4 border-l-4 border-l-cyan-500 flex items-center gap-4">
                    <div className="bg-cyan-500/10 p-3 rounded-xl"><Briefcase className="w-6 h-6 text-cyan-400" /></div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase">Predicted Role</p>
                        <p className="text-lg font-bold text-white">{suggestedRoles?.[0] || 'Unknown'}</p>
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-emerald-500 flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-xl"><CheckCircle className="w-6 h-6 text-emerald-400" /></div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase">Strongest Match</p>
                        <p className="text-lg font-bold text-white pl-1">{status}</p>
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-indigo-500 flex items-center gap-4">
                    <div className="bg-indigo-500/10 p-3 rounded-xl"><Award className="w-6 h-6 text-indigo-400" /></div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase">Health Score</p>
                        <p className="text-lg font-bold text-white">{healthScore || 0}/100</p>
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-purple-500 flex items-center gap-4">
                    <div className="bg-purple-500/10 p-3 rounded-xl"><Activity className="w-6 h-6 text-purple-400" /></div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase">ATS Compatibility</p>
                        <p className="text-lg font-bold text-white">{atsScore || 0}/100</p>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visualizations Column */}
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 lg:col-span-1">
                    <div className="glass-card p-6 relative overflow-hidden flex flex-col items-center">
                        <h3 className="text-lg font-bold text-white mb-2 w-full">Match Distribution</h3>
                        <div className="w-full h-48 relative drop-shadow-xl">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', borderColor: '#374151' }} itemStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-white mb-4 w-full">Skill Breakdown</h3>
                        <div className="w-full h-48 drop-shadow-xl">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none' }} cursor={{ fill: '#1f2937' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Improvement Tracker */}
                    {previousScore !== null && (
                        <div className="glass-card p-6 flex flex-col items-center border border-indigo-500/30">
                            <h3 className="text-lg font-bold text-white mb-2 w-full flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" /> Score Tracker
                            </h3>
                            <div className="w-full flex justify-between items-center mb-4 text-sm font-medium">
                                <div className="text-gray-400">Prev: <span className="text-white">{previousScore}%</span></div>
                                <div className="text-emerald-400">Now: <span className="text-white">{matchScore}%</span></div>
                                <div className={`${matchScore >= previousScore ? 'text-emerald-400' : 'text-red-400'} font-bold px-2 py-1 bg-gray-800 rounded`}>
                                    {matchScore >= previousScore ? '+' : ''}{matchScore - previousScore}%
                                </div>
                            </div>
                            <div className="w-full h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={improvementLineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                                        <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={[0, 100]} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none' }} />
                                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Analysis Column */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-card p-6 border-t-2 border-t-emerald-500 bg-emerald-950/10">
                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5" /> Strong Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {matchedSkills?.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-medium border border-emerald-500/30">
                                        {skill.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6 border-t-2 border-t-red-500 bg-red-950/10">
                            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
                                <XCircle className="w-5 h-5" /> Needs Improvement
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {missingSkills?.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium border border-red-500/30">
                                        {skill.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Roadmap Section */}
                    {roadmap && roadmap.length > 0 && (
                        <div className="glass-card p-6 bg-gradient-to-r from-gray-900 to-gray-800">
                            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2 mb-6">
                                <Route className="w-6 h-6" /> Skill Gap Learning Roadmap
                            </h3>
                            <div className="space-y-4">
                                {roadmap.map((step, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            {idx < roadmap.length - 1 && <div className="w-px h-full bg-cyan-500/30 my-1"></div>}
                                        </div>
                                        <div className="pb-6 pt-1">
                                            <h4 className="font-bold text-gray-200">{step.step}</h4>
                                            <p className="text-gray-400 text-sm mt-1">{step.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Coach Suggestion Details */}
                    <div className="glass-card p-6 border border-indigo-500/20">
                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2 mb-6">
                            <Lightbulb className="w-6 h-6" /> AI Resume Coach
                        </h3>

                        <div className="space-y-4 mb-6">
                            {aiCoachSuggestions?.map((s, i) => (
                                <div key={i} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                                    <p className="text-red-400/80 text-sm line-through mb-2"><span className="text-gray-500 font-medium">Original:</span> {s.original}</p>
                                    <p className="text-emerald-400 text-sm"><span className="text-gray-300 font-medium no-underline">Suggested:</span> {s.suggestion}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-indigo-950/20 p-4 rounded-xl">
                            <h4 className="font-bold text-indigo-300 mb-2">Resume Health Breakdown</h4>
                            <ul className="text-sm text-gray-400 space-y-1 list-disc pl-5">
                                {healthBreakdown?.map((item, id) => <li key={id}>{item}</li>)}
                            </ul>
                        </div>
                    </div>

                </motion.div>
            </div>

            {/* Bottom Trend Panel */}
            <div className="glass-card p-6 border-t border-purple-500/30 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400" /> Industry Trend Insights</h3>
                    <p className="text-gray-400 text-sm mt-1">Top skills currently demanded for <span className="text-purple-300">{suggestedRoles?.[0] || 'Unknown'}</span> roles.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    {topIndustrySkills?.map(s => (
                        <span key={s} className="px-3 py-1 bg-gray-800 text-gray-300 rounded border border-gray-600 text-xs shadow">
                            {s.toUpperCase()}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}
