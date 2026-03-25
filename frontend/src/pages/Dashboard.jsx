import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { FileDown, Activity, Linkedin, Clock, Hash, Zap, Target, Mail, ArrowRightLeft, Crown, Loader2, Circle, Layout, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ==========================================
// Component: Animated Score Ring
// ==========================================
const ScoreRing = ({ calculatedScore, scanPhase }) => {
    const [displayScore, setDisplayScore] = useState(0);
    
    useEffect(() => {
        // Step 1: Animate score based on current scan phase
        let target = 0;
        if (scanPhase === 1) target = 25;
        else if (scanPhase === 2) target = 50;
        else if (scanPhase === 3) target = 75;
        else if (scanPhase >= 4) target = calculatedScore;
        
        let current = displayScore;
        if (current === target) return;
        
        const step = Math.max(1, Math.floor(Math.abs(target - current) / 10));
        const timer = setInterval(() => {
            current += (target > current ? step : -step);
            if (target > displayScore ? current >= target : current <= target) {
                setDisplayScore(target);
                clearInterval(timer);
            } else {
                setDisplayScore(current);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [calculatedScore, scanPhase]);

    // Use standard Tailwind colors for the ring
    const isLow = displayScore < 60;
    const isMedium = displayScore >= 60 && displayScore < 80;
    const strokeColor = scanPhase < 4 ? '#cbd5e1' : (isLow ? '#ef4444' : (isMedium ? '#f59e0b' : '#16a34a'));
    const textColor = scanPhase < 4 ? 'text-slate-300' : 'text-slate-900';
    
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    return (
        <div className="relative w-40 h-40 flex items-center justify-center mx-auto mb-6">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} stroke="#f8fafc" strokeWidth="4" fill="transparent" />
                <motion.circle 
                    cx="80" cy="80" r={radius} 
                    stroke={strokeColor} 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                />
            </svg>
            <div className={`absolute flex flex-col items-center justify-center transition-colors duration-500 ${textColor}`}>
                <span className="text-5xl font-black tracking-tighter">{displayScore}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nexus Score</span>
            </div>
        </div>
    );
};

// ==========================================
// Component: Simple Label Bar
// ==========================================
const ProgressBar = ({ label, percentage, colorClass }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-600">
            <span>{label}</span>
            <span className="text-slate-400">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${percentage}%` }} 
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full ${colorClass}`}
            />
        </div>
    </div>
);

// ==========================================
// Component: Interactive Critique Card
// ==========================================
const CritiqueCard = ({ qs }) => {
    const [showOptimized, setShowOptimized] = useState(false);
    
    let borderClass = 'border-l-amber-500';
    if (qs.issue.includes('vague') || qs.issue.includes('specifics')) borderClass = 'border-l-red-500';
    if (showOptimized) borderClass = 'border-l-green-500';

    return (
        <div className={`flex flex-col rounded-r-lg overflow-hidden border-y border-r border-slate-100 border-l-4 ${borderClass} bg-white transition-colors duration-300 mb-3 shadow-sm hover:shadow-md`}>
            <div className="flex justify-between items-center bg-slate-50/50 px-4 py-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    {showOptimized ? <CheckCircle className="w-4 h-4 text-green-500"/> : (
                        borderClass === 'border-l-red-500' ? <XCircle className="w-4 h-4 text-red-500"/> : <Zap className="w-4 h-4 text-amber-500"/>
                    )}
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${showOptimized ? 'text-green-700' : (borderClass === 'border-l-red-500' ? 'text-red-700' : 'text-amber-700')}`}>
                        {showOptimized ? 'Optimized Suggestion' : 'Identified Issue'}
                    </span>
                </div>
                <button 
                    onClick={() => setShowOptimized(!showOptimized)}
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded border border-slate-200"
                >
                    <ArrowRightLeft className="w-3 h-3" />
                    {showOptimized ? 'See Original' : 'See Optimized'}
                </button>
            </div>
            
            <div className="p-4">
                {showOptimized ? (
                    <div className="p-1">
                        <p className="text-[13px] text-green-900 leading-relaxed font-bold">"{qs.fix}"</p>
                    </div>
                ) : (
                    <div className="p-1">
                        <p className={`text-[13px] leading-relaxed font-medium ${borderClass === 'border-l-red-500' ? 'text-red-900' : 'text-amber-900'}`}>"{qs.sentence}"</p>
                        <div className={`mt-3 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${borderClass === 'border-l-red-500' ? 'text-red-600 border-red-100 bg-red-50' : 'text-amber-700 border-amber-100 bg-amber-50'}`}>
                            {qs.issue || 'Opportunity for Improvement'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// Component: Clickable Checklist Row
// ==========================================
const ChecklistRow = ({ icon: Icon, label, statusName, isComplete }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="flex flex-col border border-slate-100 rounded-md bg-slate-50 overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => !isComplete && setExpanded(!expanded)}>
            <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <Icon className="w-4 h-4 text-slate-400"/> {label}
                </div>
                {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-600"/>
                ) : (
                    <XCircle className="w-4 h-4 text-red-600"/>
                )}
            </div>
            <AnimatePresence>
                {expanded && !isComplete && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="px-3 pb-3 pt-1 text-xs text-red-600 font-medium"
                    >
                        Please add your missing {statusName} to improve your score.
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Dashboard() {
    const { state } = useLocation();
    const result = state?.result || state;
    const [scanPhase, setScanPhase] = useState(0);

    // Step 1: Animation Loop for the Progress Spinner
    useEffect(() => {
        if (scanPhase < 4) {
            const t = setTimeout(() => setScanPhase(p => p + 1), 1000);
            return () => clearTimeout(t);
        }
    }, [scanPhase]);

    if (!result) return <Navigate to="/" />;

    const {
        suggestedRoles,
        matchedSkills, missingSkills, optimizedSummary, 
        wordCount, readingTime, diagnosticReport, coachSteps,
        quantificationSuggestions
    } = result;

    // Step 2: Data Extraction
    const hasEmail = diagnosticReport?.some(r => r.aspect === 'Email Included' && r.status === 'pass');
    const hasPhone = diagnosticReport?.some(r => r.aspect === 'Phone Included' && r.status === 'pass');
    const hasLinkedin = diagnosticReport?.some(r => r.aspect === 'LinkedIn Linked' && r.status === 'pass');
    const hasContact = hasEmail || hasPhone;
    
    const hasExperience = diagnosticReport?.some(r => r.aspect === 'Experience Section' && r.status === 'pass');
    
    const verbsScoreAttr = diagnosticReport?.find(r=>r.aspect==='Action Verbs')?.score || 0;
    const hasEducation = true; // Typically heuristic

    // Fix: The 'Zero Score' Bug - Explicit Calculated Score
    let calculatedScore = 0;
    if (hasContact) calculatedScore += 20;
    if (hasEducation) calculatedScore += 20;
    if (hasExperience) calculatedScore += 30;
    if (verbsScoreAttr > 50) calculatedScore += 30; // Alternatively check raw action_verbs param if > 5

    // Fix: NaN% Error for Word Density
    const safeWordCount = Math.max(1, wordCount || 1);
    const wordDensity = Math.min(100, Math.floor((safeWordCount / 400) * 100));

    // A-F Grades logic with if-else
    let gradeContact = 'F';
    if (hasEmail && hasPhone) gradeContact = 'A';
    else if (hasEmail || hasPhone) gradeContact = 'C';

    let gradeExperience = hasExperience ? 'A' : 'F';
    let gradeEducation = hasEducation ? 'A' : 'F';
    let gradeSkills = (matchedSkills?.length > 3) ? 'A' : ((matchedSkills?.length > 0) ? 'C' : 'F');
    let gradeLanguage = 'C'; // Default placeholder

    const grades = {
        "Contact Info": gradeContact,
        "Experience": gradeExperience,
        "Education": gradeEducation,
        "Skills": gradeSkills,
        "Languages": gradeLanguage
    };

    const scanSteps = [
        { title: 'Contact Information', aspect: hasContact },
        { title: 'Section Integrity', aspect: hasExperience && hasEducation },
        { title: 'Content Density', aspect: safeWordCount > 200 },
        { title: 'ATS Keywords', aspect: matchedSkills?.length > 0 }
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
            link.setAttribute('download', 'AI_Resume_Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert("Failed to download report");
        }
    };

    // Derived Action metrics
    const verbsScore = verbsScoreAttr || 60;
    const quantScore = (quantificationSuggestions?.length < 3) ? 85 : 40;

    // Step 3: Update UI
    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans antialiased overflow-y-auto custom-scrollbar flex">
            
            {/* LEFT SIDEBAR */}
            <div className="w-72 shrink-0 border-r border-slate-100 bg-white min-h-screen h-full fixed top-[72px] left-0 overflow-y-auto p-6 flex flex-col hidden lg:flex">
                
                {/* Score Gauge */}
                <div className="flex flex-col items-center border-b border-slate-100 pb-8 mb-6">
                    <ScoreRing calculatedScore={calculatedScore} scanPhase={scanPhase} />
                    <div className="flex gap-4">
                        <div className="text-center">
                            <span className="block text-slate-900 font-black text-lg">{scanPhase >= 3 ? safeWordCount : 0}</span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Words</span>
                        </div>
                        <div className="w-px bg-slate-100 h-8"></div>
                        <div className="text-center">
                            <span className="block text-slate-900 font-black text-lg">{scanPhase >= 3 ? readingTime : 0}</span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Minutes</span>
                        </div>
                    </div>
                </div>

                {/* Section Sidebar - Vertical Menu */}
                <div className={`space-y-1 mb-8 transition-opacity duration-1000 ${scanPhase === 4 ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4 px-2">Diagnostic Grades</h3>
                    {Object.entries(grades).map(([section, grade]) => {
                        let gradeColor = 'text-red-600 bg-red-50 border-red-100';
                        if (grade === 'A') gradeColor = 'text-green-600 bg-green-50 border-green-100';
                        else if (grade === 'B') gradeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                        else if (grade === 'C') gradeColor = 'text-amber-600 bg-amber-50 border-amber-100';

                        return (
                            <a href={`#${section.toLowerCase()}`} key={section} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">{section}</span>
                                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black border ${gradeColor}`}>
                                    {grade}
                                </div>
                            </a>
                        );
                    })}
                </div>

                {/* Audit Progress Box */}
                <div className="mt-auto bg-[#f8fafc] rounded-lg p-4 border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        {scanPhase < 4 ? <Loader2 className="w-3 h-3 animate-spin"/> : <Activity className="w-3 h-3 text-green-500"/>}
                        Audit Progress
                    </h3>
                    <div className="space-y-3">
                        {scanSteps.map((step, idx) => {
                            const isActive = idx === scanPhase;
                            const isPast = idx < scanPhase;
                            
                            return (
                                <div key={idx} className={`flex items-center justify-between transition-opacity duration-500 ${isPast || isActive ? 'opacity-100' : 'opacity-30'}`}>
                                    <span className={`text-[11px] font-bold ${isPast ? 'text-slate-600' : isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                        Step {idx + 1}
                                    </span>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <span className={`text-[9px] uppercase tracking-wider font-bold ${isPast ? 'text-slate-500' : isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {isPast ? 'Complete' : isActive ? 'Scanning' : 'Pending'}
                                        </span>
                                        {isPast ? (
                                            step.aspect ? <CheckCircle className="text-green-600 w-3 h-3"/> : <Zap className="text-amber-500 w-3 h-3"/>
                                        ) : isActive ? (
                                            <Loader2 className="text-blue-500 w-3 h-3 animate-spin"/>
                                        ) : (
                                            <Circle className="text-slate-300 w-3 h-3"/>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 lg:ml-72 mt-[72px] px-6 lg:px-12 py-8 max-w-5xl">
                
                {/* Professional Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Full Diagnostic Audit</h1>
                        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Targeting: Software Development Engineer (6-8 LPA)</p>
                    </div>
                    <motion.button 
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload} 
                        className={`mt-4 sm:mt-0 flex items-center gap-2 bg-white hover:bg-slate-50 text-blue-700 py-2 px-4 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm border border-slate-200 transition-opacity duration-1000 ${scanPhase === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <FileDown className="w-4 h-4" /> Download Report <Crown className="w-3 h-3 text-amber-500"/>
                    </motion.button>
                </div>

                <div className={`space-y-10 transition-opacity duration-1000 ${scanPhase === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    
                    {/* DENSE CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Sub-Checklist: Contact Info Card */}
                        <div id="contact info" className="scroll-mt-24">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Core Essentials</h2>
                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm h-full">
                                <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">Contact Integrations</h3>
                                
                                <ul className="space-y-3">
                                    <ChecklistRow icon={Mail} label="Email Address" statusName="Email" isComplete={hasEmail} />
                                    <ChecklistRow icon={Hash} label="Mobile Phone" statusName="Phone Number" isComplete={hasPhone} />
                                    <ChecklistRow icon={Linkedin} label="LinkedIn Profile" statusName="LinkedIn URL" isComplete={hasLinkedin} />
                                    <ChecklistRow icon={MapPin} label="Location / City" statusName="Location" isComplete={true} />
                                </ul>
                            </div>
                        </div>

                        {/* Sub-Checklist: Content Card (Progress Bars) */}
                        <div id="experience" className="scroll-mt-24">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Metrics Density</h2>
                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm h-full flex flex-col justify-center">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">Content Analysis</h3>
                                <div className="space-y-3">
                                    <ProgressBar label="Action Verbs" percentage={verbsScore} colorClass="bg-blue-600" />
                                    <ProgressBar label="Quantifiable Impact" percentage={quantScore} colorClass={quantScore > 50 ? "bg-green-600" : "bg-amber-500"} />
                                    <ProgressBar label="Word Density" percentage={wordDensity} colorClass="bg-indigo-600" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ATS Keywords / Skills Card */}
                    <div id="skills" className="scroll-mt-24 border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">ATS Targeting & Keywords</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-600"/> Found in Resume</h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchedSkills?.length > 0 ? matchedSkills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-bold border border-green-100">
                                            {skill.toUpperCase()}
                                        </span>
                                    )) : <span className="text-slate-400 text-xs font-medium">Searching for keywords... Please paste a Job Description.</span>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-600"/> Missing Required</h4>
                                <div className="flex flex-wrap gap-2">
                                    {missingSkills?.length > 0 ? missingSkills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-bold border border-red-100">
                                            {skill.toUpperCase()}
                                        </span>
                                    )) : (
                                        (!matchedSkills || matchedSkills.length === 0) ? 
                                        <span className="text-slate-400 text-xs font-medium">Paste JD to map against requirements.</span> :
                                        <span className="text-green-600 text-xs font-bold">Perfect match!</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Resume Critique */}
                    <div className="scroll-mt-24">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Line Analysis</h2>
                        <div className="border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">Live Resume Critique</h3>
                            <p className="text-[13px] text-slate-500 font-medium mb-6">We found {quantificationSuggestions?.length || 0} bullet points that can be optimized for ATS systems.</p>
                            
                            <div className="flex flex-col">
                                {quantificationSuggestions && quantificationSuggestions.length > 0 ? quantificationSuggestions.map((qs, idx) => (
                                    <CritiqueCard key={idx} qs={qs} />
                                )) : (
                                    <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-100">
                                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <h3 className="text-sm font-bold text-slate-900">No major critiques!</h3>
                                        <p className="text-xs text-slate-500 mt-1">Your bullet points are well-quantified.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
        </div>
    );
}
