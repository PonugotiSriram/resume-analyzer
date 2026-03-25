import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Search, Zap, Loader2, Bot } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
        maxFiles: 1
    });

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please upload a resume first.");
            return;
        }
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        formData.append('candidateName', 'Guest');
        formData.append('company', 'General');
        formData.append('linkedinUrl', '');
        if (user) formData.append('userId', user.id);

        try {
            const response = await axios.post('http://localhost:4000/api/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard', { state: response.data });
        } catch (err) {
            console.error(err);
            setError("Failed to analyze resume. Please try again later.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="absolute inset-x-0 top-[72px] bottom-0 bg-white text-gray-900 font-sans overflow-y-auto z-10 custom-scrollbar">
            {/* HERO SECTION */}
            <div className="pt-16 pb-20 px-4 max-w-5xl mx-auto text-center relative">
                <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 tracking-tight relative z-10">
                    Free AI Resume Analyzer
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto relative z-10 font-medium">
                    Get instant ATS score, fix mistakes, and land more interviews by optimizing your resume to perfection.
                </p>

                {/* Upload Box Container */}
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-blue-100 p-6 md:p-10 max-w-4xl mx-auto text-left relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-6">
                        
                        {/* Drag and Drop */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-3">1. Upload Resume</label>
                            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all h-[240px] shadow-sm
                                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/60'}`}>
                                <input {...getInputProps()} />
                                {file ? (
                                    <div className="flex flex-col items-center text-blue-700 gap-2">
                                        <FileText className="w-12 h-12 mb-2 text-blue-600" />
                                        <p className="font-bold text-sm text-center truncate w-full px-4">{file.name}</p>
                                        <button className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-3 py-1 bg-white rounded-md shadow-sm border border-rose-100 mt-2" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                            Romve File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500 gap-2">
                                        <div className="bg-white p-3 rounded-full shadow-sm mb-2"><UploadCloud className="w-8 h-8 text-blue-500" /></div>
                                        <p className="text-base font-bold text-gray-800">Drag & drop resume</p>
                                        <p className="text-xs text-gray-500 mb-2">Supported: PDF, DOCX, DOC</p>
                                        <span className="text-sm font-semibold text-blue-600 border border-blue-200 bg-white px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                                            Browse Files
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Target Job Role */}
                        <div className="h-full flex flex-col">
                            <label className="block text-sm font-bold text-gray-800 mb-3">2. Target Job Description (Optional)</label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the exact job description you are targeting here. We will cross-reference your resume to extract missing keywords."
                                className="w-full h-[240px] bg-white border border-gray-200 rounded-2xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm placeholder:text-gray-400 font-medium shadow-sm transition-shadow hover:shadow-md"
                            />
                        </div>
                    </div>

                    {error && <div className="text-rose-600 text-sm font-medium bg-rose-50 border border-rose-100 p-3 rounded-xl mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {error}</div>}

                    <div className="flex justify-center mt-8">
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isUploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-16 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
                        >
                            {isUploading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing...</> : "Upload & Analyze Resume"}
                        </button>
                    </div>
                </div>
            </div>

            {/* PROBLEM SECTION */}
            <div className="bg-slate-50 py-20 px-4 border-y border-slate-200">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-blue-950 mb-12">Is your resume holding you back?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <ProblemCard title="Not Getting Calls?" icon={<AlertTriangle />} desc="Your resume is getting lost in the recruiter's pile." />
                        <ProblemCard title="Missing Keywords" icon={<Search />} desc="Failing basic ATS auto-filtering mechanisms." />
                        <ProblemCard title="Not ATS Friendly" icon={<Bot />} desc="Robots simply can't read your formatting." />
                        <ProblemCard title="Weak Bullet Points" icon={<Zap />} desc="Lacking hard numbers or quantified metrics." />
                    </div>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="py-24 px-4 max-w-6xl mx-auto text-center bg-white">
                <h2 className="text-3xl font-extrabold text-blue-950 mb-16">Everything you need to land interviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={<CheckCircle className="text-emerald-500" />} title="ATS Score Check" desc="Get a realistic passing score against popular standard ATS parsers." />
                    <FeatureCard icon={<Search className="text-blue-500" />} title="Keyword Analysis" desc="Identify exact missing skills to seamlessly inject into your resume." />
                    <FeatureCard icon={<AlertTriangle className="text-amber-500" />} title="Mistake Detection" desc="Flag weak statements, lack of metrics, and formatting issues instantly." />
                    <FeatureCard icon={<Zap className="text-indigo-500" />} title="AI Suggestions" desc="Generate perfectly tailored, professional summaries aligned with your JD." />
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="bg-blue-900 py-24 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-16">How It Works</h2>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-4 relative">
                        <div className="hidden md:block absolute top-[40px] left-20 right-20 h-0.5 bg-blue-800 -z-0" />
                        
                        <Step number="1" title="Upload Resume" desc="PDF or DOCX format" />
                        <Step number="2" title="AI Scans Document" desc="ATS compatibility check" />
                        <Step number="3" title="Review Report" desc="See score & mistakes" />
                        <Step number="4" title="Improve & Download" desc="Apply feedback instantly" />
                    </div>
                </div>
            </div>
            
            {/* FOOTER AREA */}
            <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 font-medium">
                © {new Date().getFullYear()} AI Resume Analyzer. Built for Students.
            </div>
        </div>
    );
}

function ProblemCard({ title, desc, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-5 border border-rose-100">
                {React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <h3 className="font-bold text-gray-900 mb-2 truncate w-full">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-slate-100">
                {React.cloneElement(icon, { className: 'w-8 h-8' })}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm font-medium">{desc}</p>
        </div>
    );
}

function Step({ number, title, desc }) {
    return (
        <div className="flex flex-col items-center relative z-10 w-full md:w-1/4">
            <div className="w-20 h-20 bg-blue-600 text-white font-black text-2xl rounded-full flex items-center justify-center mb-6 shadow-xl border-8 border-blue-900 shadow-blue-500/20">
                {number}
            </div>
            <h4 className="font-bold text-white text-lg mb-1">{title}</h4>
            <p className="text-blue-200 text-sm font-medium">{desc}</p>
        </div>
    );
}
