import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Bot, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [company, setCompany] = useState('General');
    const [isUploading, setIsUploading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const loadingMessages = [
        "Initializing Nexus Engine...",
        "Extracting raw text from document...",
        "Running NLP syntax & grammar check...",
        "Mapping technical skills against Job Description...",
        "Quantifying impact & metrics...",
        "Compiling final diagnostic report..."
    ];

    React.useEffect(() => {
        let timer;
        if (isUploading) {
            setLoadingStep(0);
            timer = setInterval(() => {
                setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
            }, 800);
        }
        return () => clearInterval(timer);
    }, [isUploading]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
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
        formData.append('candidateName', candidateName || 'Anonymous Student');
        formData.append('linkedinUrl', linkedinUrl);
        formData.append('company', company);
        if (user) {
            formData.append('userId', user.id);
        }

        try {
            // Force a minimum UX delay of 3 seconds so the user can experience the scanning animation
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
            const axiosPromise = axios.post('http://localhost:4000/api/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const [response] = await Promise.all([axiosPromise, minTimePromise]);

            console.log("Analysis response:", response.data);
            navigate('/dashboard', { state: response.data });
        } catch (err) {
            console.error(err);
            setError("Failed to analyze resume. Make sure backend and AI services are running.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in py-12 relative">
            {/* Full Screen Loading Overlay */}
            {isUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex flex-col items-center max-w-md w-full p-8 text-center"
                    >
                        <div className="relative mb-8">
                            {/* Scanning rings */}
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-indigo-500 w-24 h-24 -ml-2 -mt-2 opacity-50"></motion.div>
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-b-2 border-cyan-400 w-28 h-28 -ml-4 -mt-4 opacity-30"></motion.div>
                            
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/30 relative z-10">
                                <Bot className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Analyzing Resume</h2>
                        
                        <div className="h-6 overflow-hidden w-full relative">
                            {loadingMessages.map((msg, idx) => (
                                <motion.p 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: loadingStep === idx ? 1 : 0, y: loadingStep === idx ? 0 : -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 text-cyan-400 font-medium text-sm w-full text-center"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {msg}
                                </motion.p>
                            ))}
                        </div>
                        
                        <div className="w-64 h-1.5 bg-gray-800 rounded-full mt-6 overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            <div className={`text-center space-y-2 transition-opacity duration-300 ${isUploading ? 'opacity-0' : 'opacity-100'}`}>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
                    Analyze Your Resume
                </h2>
                <p className="text-gray-400">Upload your PDF and paste a job description. Let our AI career coach score you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Upload Column */}
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4 text-sm font-medium">
                    <label className="text-gray-300">1. Required: Resume PDF</label>
                    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[250px]
              ${isDragActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-600 glass-card hover:border-indigo-400/60'}`}>
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center text-emerald-400 gap-2">
                                <FileText className="w-12 h-12 mb-2" />
                                <p className="font-semibold text-center">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button className="text-indigo-400 text-xs hover:underline mt-2 flex items-center gap-1" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 gap-3">
                                <UploadCloud className="w-12 h-12 text-indigo-400/80 mb-2" />
                                <p className="text-base text-center">Drag & drop your PDF here</p>
                                <p className="text-xs text-gray-500">Only PDF files are supported</p>
                                <div className="px-5 py-2 mt-4 bg-gray-800 rounded-lg shadow font-medium hover:bg-gray-700 transition">
                                    Browse Files
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Input Column */}
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium">Your Name (Optional)</label>
                            <input
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="e.g., Sai Ram"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium">LinkedIn URL (Optional)</label>
                            <input
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="linkedin.com/in/username"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-gray-300 text-sm font-medium">Target Company ATS</label>
                        <select
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                            <option value="General">General (Default ATS)</option>
                            <option value="Wipro">Wipro</option>
                            <option value="Infosys">Infosys</option>
                            <option value="TCS">TCS</option>
                            <option value="Cognizant">Cognizant</option>
                            <option value="Accenture">Accenture</option>
                        </select>
                    </div>

                    <div className="space-y-2 flex-grow">
                        <label className="text-gray-300 text-sm font-medium">2. Required: Job Description</label>
                        <div className="relative h-full text-base">
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the target job description here. Our NLP will extract required skills automatically..."
                                className="w-full h-full min-h-[160px] resize-y bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 block"
                            />
                            <Bot className="absolute bottom-4 right-4 w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="flex flex-col items-center mt-8 gap-4">
                {error && <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{error}</div>}

                <button
                    onClick={handleAnalyze}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-3 transform hover:scale-105"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" /> Parsing & Analyzing...
                        </>
                    ) : (
                        <>Analyze & Get Intelligence</>
                    )}
                </button>
            </div>

        </div>
    );
}
