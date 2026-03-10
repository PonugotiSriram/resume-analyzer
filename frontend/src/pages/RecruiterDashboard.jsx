import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Filter, ArrowUpRight, ShieldCheck, Mail, Activity, UploadCloud, CheckCircle, XCircle, FileText, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';

export default function RecruiterDashboard() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [candidateName, setCandidateName] = useState('');

    const fetchCandidates = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/candidates');
            // ensure recruiterStatus exists
            const mapped = res.data.map(c => ({ ...c, recruiterStatus: c.recruiterStatus || 'Under Review' }));
            setCandidates(mapped);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch candidates from DB.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setUploadError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    });

    const handleUploadCandidate = async (e) => {
        e.preventDefault();
        if (!file || !jobDescription) {
            setUploadError("Please provide both a PDF resume and a job description.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        formData.append('candidateName', candidateName || 'Anonymous Candidate');

        try {
            await axios.post('http://localhost:4000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // refresh list
            await fetchCandidates();
            setFile(null);
            setCandidateName('');
            // Optional: Do not clear job description as recruiters upload bulk candidates for the same JD
        } catch (err) {
            setUploadError("Failed to upload candidate. Is the backend and AI service running?");
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:4000/api/candidates/${id}/status`, { status: newStatus });
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, recruiterStatus: newStatus } : c));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleDownload = async (cand) => {
        try {
            const response = await axios.post('http://localhost:4000/api/report/download', {
                candidate: cand,
                jobRole: cand.suggestedRoles?.[0] || 'Unknown'
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${cand.name || 'Candidate'}_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download historical report");
        }
    };

    const totalApplications = candidates.length;
    const shortlisted = candidates.filter(c => c.recruiterStatus === 'Shortlisted').length;
    const rejected = candidates.filter(c => c.recruiterStatus === 'Rejected').length;
    const pending = totalApplications - shortlisted - rejected;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8 min-h-screen">

            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Users className="text-indigo-400 w-8 h-8" /> Recruiter Control Center
                    </h1>
                    <p className="text-gray-400 mt-2">Manage, upload, rank and process your candidates.</p>
                </div>

                <div className="flex bg-gray-900 border border-gray-700 rounded-xl p-2 gap-2 shadow-inner">
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold text-white transition flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-800 rounded-lg text-sm font-bold text-gray-300 transition">
                        Export CSV
                    </button>
                </div>
            </motion.div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-l-blue-500">
                    <p className="text-gray-400 text-sm font-medium uppercase mb-2">Total Applications</p>
                    <p className="text-3xl font-black text-white">{totalApplications}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                    <p className="text-gray-400 text-sm font-medium uppercase mb-2">Shortlisted</p>
                    <p className="text-3xl font-black text-emerald-400">{shortlisted}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-red-500">
                    <p className="text-gray-400 text-sm font-medium uppercase mb-2">Rejected</p>
                    <p className="text-3xl font-black text-red-400">{rejected}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-amber-500">
                    <p className="text-gray-400 text-sm font-medium uppercase mb-2">Pending Candidates</p>
                    <p className="text-3xl font-black text-amber-400">{pending}</p>
                </div>
            </div>

            {/* Uploader Block */}
            <div className="glass-card p-6 border border-gray-800 bg-gray-900/50">
                <h2 className="text-xl font-bold text-white mb-4">Upload New Candidate</h2>
                <form onSubmit={handleUploadCandidate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 font-medium">Candidate Name</label>
                            <input
                                required
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="Candidate Full Name"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 font-medium">Target Job Description (for matching)</label>
                            <textarea
                                required
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the JD here..."
                                className="w-full h-32 resize-y bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1">
                        <label className="text-sm text-gray-400 font-medium">Candidate Resume (PDF)</label>
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-full min-h-[160px]
                            ${isDragActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-700 hover:border-indigo-400/60'}`}>
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="text-center text-emerald-400">
                                    <FileText className="w-8 h-8 mx-auto mb-2" />
                                    <p className="font-semibold text-sm truncate max-w-[200px]">{file.name}</p>
                                    <button type="button" className="text-indigo-400 text-xs mt-2" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <UploadCloud className="w-8 h-8 mx-auto mb-2 opacity-70" />
                                    <p className="text-sm">Drag & drop or click</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-col justify-end gap-3">
                        {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}
                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : "Upload & Analyze Candidate"}
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Activity className="animate-pulse w-12 h-12 text-indigo-500" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
                    {error}
                </div>
            ) : totalApplications === 0 ? (
                <div className="glass-card p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg">No candidates processed yet. Upload candidates above.</p>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/80 border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-5 font-semibold w-16">Rank</th>
                                    <th className="p-5 font-semibold">Candidate Name</th>
                                    <th className="p-5 font-semibold w-48">AI Scores</th>
                                    <th className="p-5 font-semibold">Status (Recruiter)</th>
                                    <th className="p-5 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {candidates.map((cand, idx) => (
                                    <motion.tr
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={cand.id}
                                        className="hover:bg-gray-800/30 transition group"
                                    >
                                        <td className="p-5 font-extrabold text-white text-xl text-center">
                                            #{idx + 1}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                    {cand.name ? cand.name.substring(0, 2).toUpperCase() : 'AN'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{cand.name || 'Anonymous'}</p>
                                                    <p className="text-xs text-gray-500">Added: {new Date(cand.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-gray-400">Match:</span>
                                                    <span className="text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-600">{cand.matchScore}%</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-gray-400">ATS:</span>
                                                    <span className="text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-600">{cand.atsScore || 0}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                                                ${cand.recruiterStatus === 'Shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    cand.recruiterStatus === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {cand.recruiterStatus === 'Shortlisted' && <CheckCircle className="w-3 h-3" />}
                                                {cand.recruiterStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
                                                {cand.recruiterStatus}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                {cand.recruiterStatus !== 'Shortlisted' && (
                                                    <button onClick={() => handleStatusChange(cand.id, 'Shortlisted')} className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition" title="Shortlist">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {cand.recruiterStatus !== 'Rejected' && (
                                                    <button onClick={() => handleStatusChange(cand.id, 'Rejected')} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition" title="Reject">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDownload(cand)} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition" title="Download Report">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
