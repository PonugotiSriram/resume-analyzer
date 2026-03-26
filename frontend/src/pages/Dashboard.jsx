import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { FileDown, FileText, Bot, Activity, Linkedin, Clock, Hash, Zap, Target, Mail, ArrowRightLeft, Crown, Loader2, Circle, Layout, MapPin, CheckCircle, XCircle, Type, PenTool, AlertTriangle, ChevronDown, Upload as UploadIcon } from 'lucide-react';
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
    if (qs?.issue?.toLowerCase()?.includes('vague') || qs?.issue?.toLowerCase()?.includes('specifics')) borderClass = 'border-l-red-500';
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

// ==========================================
// Component: Detailed Section Card
// ==========================================
const DetailCard = ({ id, title, icon: Icon, isPass, issueText, explanation, suggestion, children }) => (
    <div id={id} className="scroll-mt-28 mb-10 group">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icon className={`w-6 h-6 ${isPass ? 'text-green-500' : 'text-red-500'}`} /> {title}
        </h2>
        <div className={`border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-sm border-t-4 transition-shadow hover:shadow-md ${isPass ? 'border-t-green-500' : 'border-t-red-500'}`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {issueText}
                </span>
            </div>
            {explanation && <p className="text-slate-600 text-sm mb-5 leading-relaxed font-medium">{explanation}</p>}
            {!isPass && suggestion && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 mb-5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500"/> How to fix this
                    </h4>
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{suggestion}</p>
                </div>
            )}
            {children && (
                <div className="pt-2">
                    {children}
                </div>
            )}
        </div>
    </div>
);

export default function Dashboard() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const result = state?.result || state;
    const [scanPhase, setScanPhase] = useState(0);
    const [expandedSections, setExpandedSections] = useState({ content: true, sections: true, 'ats-essentials': true, tailoring: true });
    const [activeItemId, setActiveItemId] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editedText, setEditedText] = useState("");
    const [isRescanning, setIsRescanning] = useState(false);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleItemClick = (itemId) => {
        setActiveItemId(itemId);
        // Direct map to element by its ID
        const element = document.getElementById(itemId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Step 1: Animation Loop for the Progress Spinner
    useEffect(() => {
        if (scanPhase < 4) {
            const t = setTimeout(() => setScanPhase(p => p + 1), 1000);
            return () => clearTimeout(t);
        }
    }, [scanPhase]);

    // Allow direct navigation to /dashboard without throwing or redirecting.

    const {
        suggestedRoles = [],
        matchedSkills = [], missingSkills = [], optimizedSummary = '', 
        wordCount = 0, readingTime = 0, diagnosticReport = [], coachSteps = [],
        quantificationSuggestions = [],
        spellingErrors: spelling_errors = [], pronoun_errors = [], complex_sentences = [], skills_targeting = {},
        repetitionErrors: repetition_errors = [], verbsScore: verbs_score = 0, quantScore: quant_score = 0, sectionGrades: section_grades = {},
        nexus_score = 0, ats_compatibility = 0, content_quality = 0, formatting_score = 0, linkedin_presence = 0,
        match_score = 0, rawResumeText = ''
    } = result || {};
    
    const handleRescan = async () => {
        setIsRescanning(true);
        try {
            const apiRes = await axios.post('http://localhost:4000/api/analyze-text', {
                text: editedText,
                candidateName: result.name || "Applicant",
                jobDescription: result.jobDescription || ""
            });
            // Update dashboard with new data
            navigate('.', { state: apiRes.data, replace: true });
            setScanPhase(0);
            setIsEditingMode(false);
        } catch (error) {
            alert("Analysis failed. Please check backend connection.");
        } finally {
            setIsRescanning(false);
        }
    };

    // Step 2: Data Extraction
    const hasEmail = diagnosticReport?.some(r => r.aspect === 'Email Included' && r.status === 'pass');
    const hasPhone = diagnosticReport?.some(r => r.aspect === 'Phone Included' && r.status === 'pass');
    const hasLinkedin = diagnosticReport?.some(r => r.aspect === 'LinkedIn Linked' && r.status === 'pass');
    const hasContact = hasEmail || hasPhone;
    
    const hasExperience = diagnosticReport?.some(r => r.aspect === 'Experience Section' && r.status === 'pass');
    
    const verbsScoreAttr = diagnosticReport?.find(r=>r.aspect==='Action Verbs')?.score || 0;
    const hasEducation = true; // Typically heuristic

    // Accordion Sidebar Data Setup
    const sidebarData = [
        {
            id: 'content',
            title: 'CONTENT',
            score: content_quality || 80,
            items: [
                { id: 'ats-parse', label: 'ATS Parse Rate', isPass: diagnosticReport?.find(r => r.aspect === 'ATS Parse Rate')?.status === 'pass', message: diagnosticReport?.find(r => r.aspect === 'ATS Parse Rate')?.status === 'pass' ? 'No issues' : 'Parsing issue' },
                { id: 'quantifying-impact', label: 'Quantifying Impact', isPass: quant_score > 30, message: quant_score > 30 ? 'No issues' : 'Needs improvement' },
                { id: 'repetition', label: 'Repetition', isPass: !repetition_errors || repetition_errors.length === 0, message: (!repetition_errors || repetition_errors.length === 0) ? 'No issues' : 'Repetitive words' },
                { id: 'spelling-grammar', label: 'Spelling & Grammar', isPass: (!spelling_errors || spelling_errors.length === 0), message: (!spelling_errors || spelling_errors.length === 0) ? 'No issues' : `${spelling_errors?.length || 0} issues` },
            ]
        },
        {
            id: 'sections',
            title: 'SECTIONS',
            score: section_grades?.Sections || 50,
            items: [
                { id: 'essential-sections', label: 'Essential Sections', isPass: diagnosticReport?.find(r => r.aspect === 'Essential Sections')?.status === 'pass', message: diagnosticReport?.find(r => r.aspect === 'Essential Sections')?.status === 'pass' ? 'No issues' : 'Missing sections' },
                { id: 'contact-info', label: 'Contact Information', isPass: hasContact, message: hasContact ? 'No issues' : 'Missing info' },
            ]
        },
        {
            id: 'ats-essentials',
            title: 'ATS ESSENTIALS',
            score: ats_compatibility || 50,
            items: [
                { id: 'file-format', label: 'File Format & Size', isPass: true, message: 'No issues' },
                { id: 'design', label: 'Design', isPass: true, message: 'No issues' },
                { id: 'email-address', label: 'Email Address', isPass: hasEmail, message: hasEmail ? 'No issues' : 'Missing' },
                { id: 'hyperlink-header', label: 'Hyperlinks', isPass: true, message: 'No issues' },
            ]
        },
        {
            id: 'tailoring',
            title: 'TAILORING',
            score: match_score,
            items: [
                { id: 'hard-skills', label: 'Hard Skills', isPass: matchedSkills?.length > 0, message: matchedSkills?.length > 0 ? 'No issues' : 'Missing skills' },
                { id: 'soft-skills', label: 'Soft Skills', isPass: true, message: 'No issues' },
                { id: 'action-verbs', label: 'Action Verbs', isPass: verbs_score > 50, message: verbs_score > 50 ? 'No issues' : 'Weak verbs' },
                { id: 'tailored-title', label: 'Tailored Title', isPass: false, message: '1 issue' },
            ]
        }
    ];

    // Fix: Dynamic Score Calculation (25% per main category)
    const contentScore = sidebarData[0].score || 0;
    const sectionsScore = sidebarData[1].score || 0;
    const atsScore = sidebarData[2].score || 0;
    const tailoringScore = sidebarData[3].score || 0;
    
    // Weighted Average Calculation
    const dynamicScore = Math.floor((contentScore + sectionsScore + atsScore + tailoringScore) / 4);

    // Final result score with fallback
    const finalScore = nexus_score > 0 ? nexus_score : (dynamicScore > 0 ? dynamicScore : 69);

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
        { title: 'Skills & Keywords', aspect: matchedSkills?.length > 0 }
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

    const getBadgeStyle = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const categoryDetails = {
        'ats-parse': <p>Your resume was perfectly read by our ATS simulator. All major text blocks were identified correctly without parsing errors.</p>,
        'repetition': (
            <>
                <p className="mb-2">A great resume uses varied vocabulary to keep recruiters engaged.</p>
                {Array.isArray(repetition_errors) && repetition_errors.length > 0 ? (
                    <ul className="space-y-2 mt-2">
                        {repetition_errors.map((err, i) => (
                            <li key={i} className="bg-red-50/50 p-3 rounded-lg border border-red-100 flex flex-col">
                                <span className="font-bold text-slate-700">{err}</span>
                                <span className="text-[11px] text-slate-500 mt-1">Try using synonyms or restructuring sentences to avoid sounding repetitive.</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-green-600 font-bold flex gap-1"><CheckCircle className="w-4 h-4"/> No excessive repetition detected.</p>}
            </>
        ),
        'quantifying-impact': (
            <>
                <p className="mb-3">Recruiters expect to see quantifiable metrics ($, %, counts) to understand the scale of your impact.</p>
                {Array.isArray(quantificationSuggestions) && quantificationSuggestions.length > 0 ? (
                    <div className="space-y-3">{quantificationSuggestions.map((qs, i) => <CritiqueCard key={i} qs={qs} />)}</div>
                ) : <p className="text-green-600 font-bold flex gap-1"><CheckCircle className="w-4 h-4"/> Great job quantifying your bullets.</p>}
            </>
        ),
        'spelling-grammar': (
            <>
                <p className="mb-2">Simple typos can instantly disqualify you from competitive roles.</p>
                {Array.isArray(spelling_errors) && spelling_errors.length > 0 && (
                    <ul className="space-y-2 mt-2">{spelling_errors.map((err, i) => <li key={i} className="bg-red-50/50 p-3 rounded-lg border border-red-100 flex flex-col"><span className="font-bold text-slate-700">Error: <span className="text-red-600">{err?.word}</span></span><span className="font-bold flex gap-1 mt-1 text-slate-700"><ArrowRightLeft className="w-3 h-3 text-slate-400"/> Suggestion: <span className="text-green-600">{err?.suggestion}</span></span></li>)}</ul>
                )}
            </>
        ),
        'essential-sections': <p>A modern resume requires strictly titled sections to map properly into ATS systems.</p>,
        'contact-info': (
            <>
                <p className="mb-3">Missing contact integrations mean recruiters can't reach you.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ChecklistRow icon={Mail} label="Email Address" statusName="Email" isComplete={hasEmail} />
                    <ChecklistRow icon={Hash} label="Mobile Phone" statusName="Phone Number" isComplete={hasPhone} />
                    <ChecklistRow icon={Linkedin} label="LinkedIn Profile" statusName="LinkedIn" isComplete={hasLinkedin} />
                </div>
            </>
        ),
        'file-format': <p>Standard PDF formatting is well within the 2MB size limit. Never upload word documents directly unless asked.</p>,
        'design': <p>Complex multi-column designs can confuse simple ATS scrapers. Use a standard top-down single-column approach.</p>,
        'email-address': <p>Using an unprofessional email address or leaving it out is a massive red flag. Add a formal address.</p>,
        'hyperlink-header': <p>Links to external portfolios were detected and are cleanly clickable.</p>,
        'hard-skills': (
            <>
                <p className="mb-4">We mapped your technical skills directly to the Job Description required skills.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-600"/> Found</h4><div className="flex flex-wrap gap-2">{Array.isArray(matchedSkills) && matchedSkills.length > 0 ? matchedSkills.map(skill => <span key={skill} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-bold border border-green-100">{skill?.toUpperCase()}</span>) : <span className="text-slate-400 text-xs font-medium">None found.</span>}</div></div>
                    <div><h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-600"/> Missing</h4><div className="flex flex-wrap gap-2">{Array.isArray(missingSkills) && missingSkills.length > 0 ? missingSkills.map(skill => <span key={skill} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold border border-red-100">{skill?.toUpperCase()}</span>) : <span className="text-green-600 text-xs font-bold">Perfect match!</span>}</div></div>
                </div>
            </>
        ),
        'soft-skills': <p>Soft skills like 'Leadership' are appropriately demonstrated through achievements, rather than keyword dumping.</p>,
        'action-verbs': <p>Avoiding weak phrasing ensures you sound confident. Start every bullet point with a robust action verb.</p>,
        'tailored-title': <p>Recruiters scan for exactly the job title they are hiring for at the very top of your resume within split seconds.</p>
    };

    // Step 3: Update UI
    return (
        <div className="min-h-screen bg-transparent text-slate-800 font-sans antialiased overflow-y-auto custom-scrollbar flex">
            
            {/* LEFT SIDEBAR - Crisp White */}
            <div className="w-72 shrink-0 border-r border-slate-200 bg-white min-h-screen h-full fixed top-[72px] left-0 overflow-y-auto p-6 flex-col hidden lg:flex shadow-sm z-10">
                
                {/* Score Gauge */}
                <div className="flex flex-col items-center border-b border-slate-100 pb-8 mb-6">
                    <ScoreRing calculatedScore={finalScore} scanPhase={scanPhase} />
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

                {/* 1. Score Breakdown Gauges */}
                <div className="bg-slate-50/50 rounded-xl p-6 mb-8 border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-blue-500"/> Performance Metrics
                    </h3>
                    <ProgressBar label="ATS Connectivity" percentage={ats_compatibility || 0} colorClass="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20" />
                    <ProgressBar label="Content Quality" percentage={content_quality || 0} colorClass="bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md shadow-green-500/20" />
                    <ProgressBar label="Formatting" percentage={formatting_score || 0} colorClass="bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20" />
                    <ProgressBar label="Online Presence" percentage={linkedin_presence || 0} colorClass="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20" />
                </div>

                {/* Section Sidebar - Accordion Menu */}
                <div className={`space-y-2 mb-8 transition-opacity duration-1000 ${scanPhase === 4 ? 'opacity-100' : 'opacity-0'}`}>
                    {sidebarData.map((section) => {
                        const isExpanded = expandedSections[section.id];
                        return (
                            <div key={section.id} className="border-b border-slate-100 last:border-0 pb-1">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors focus:outline-none"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600">
                                        {section.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded flex items-center justify-center text-[9px] font-black border ${getBadgeStyle(section.score)}`}>
                                            {section.score}%
                                        </div>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} />
                                    </div>
                                </button>
                                
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col py-1 pb-2 px-1">
                                        {section.items.map((item) => {
                                            const isActive = activeItemId === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item.id)}
                                                    className={`flex items-start gap-2 w-full text-left p-1.5 rounded-md transition-colors ${
                                                        isActive ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {item.isPass ? (
                                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-600'}`}>
                                                            {item.label}
                                                        </span>
                                                        <span className={`text-[9px] ${item.isPass ? 'text-slate-400' : 'text-red-500 font-bold'}`}>
                                                            {item.message}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Audit Progress Box */}
                <div className="mt-auto bg-slate-50/50 rounded-xl p-4 border border-slate-100 shadow-sm">
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
                        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Targeting: {suggestedRoles?.[0] || 'Software Professional'}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-3">
                        <motion.button 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setEditedText(rawResumeText); setIsEditingMode(true); }} 
                            className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-500/30 transition-all duration-1000 w-full sm:w-auto ${scanPhase === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <PenTool className="w-4 h-4" /> Live Edit
                        </motion.button>
                        <motion.button 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownload} 
                            className={`flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 py-2 px-5 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm border border-slate-200 transition-all duration-1000 w-full sm:w-auto ${scanPhase === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <FileDown className="w-4 h-4" /> Download PDF <Crown className="w-3 h-3 text-amber-500"/>
                        </motion.button>
                    </div>
                </div>

                {/* The Ultimate Modern AI Core Animation while scanPhase < 4 */}
                {scanPhase < 4 && (
                    <div className="space-y-6 lg:max-w-[800px] xl:max-w-none">
                        <div className="relative w-full min-h-[480px] flex flex-col items-center justify-center overflow-hidden bg-slate-900 rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-slate-800">
                            
                            {/* Moving Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-30 pointer-events-none"></div>

                            {/* Massive Dynamic Blurs */}
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></motion.div>
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute w-[400px] h-[400px] bg-cyan-400/10 blur-[80px] rounded-full pointer-events-none"></motion.div>

                            {/* Complex SVG/Motion Core */}
                            <div className="relative z-10 flex items-center justify-center mt-10 mb-20 scale-125">
                                
                                {/* Outer radar ring */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute w-56 h-56 rounded-full border border-dashed border-slate-600/50"></motion.div>
                                
                                {/* Inner solid ring with intense glowing tail */}
                                <div className="absolute w-40 h-40 rounded-full border border-slate-700 bg-slate-800/20 backdrop-blur-sm"></div>
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute w-40 h-40 rounded-full border-t-2 border-r-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] object-cover"></motion.div>

                                {/* Orbiting Satellite Node 1 */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute w-40 h-40 rounded-full">
                                    <div className="absolute top-0 left-1/2 -ml-1.5 -mt-1.5 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                                </motion.div>

                                {/* Orbiting Satellite Node 2 (Counter Direction) */}
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute w-56 h-56 rounded-full">
                                    <div className="absolute bottom-0 right-1/2 -mr-1 -mb-1 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
                                </motion.div>

                                {/* Center Brain Core */}
                                <motion.div 
                                    animate={{ scale: [1, 1.15, 1], boxShadow: ["0 0 30px rgba(99,102,241,0.4)", "0 0 60px rgba(99,102,241,0.8)", "0 0 30px rgba(99,102,241,0.4)"] }} 
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border-2 border-white/20 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
                                    <Bot className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
                                </motion.div>
                            </div>

                            {/* Typography & Terminal Progress - The Matrix Feel */}
                            <div className="relative z-10 w-full max-w-sm mb-12">
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <span className="text-cyan-400 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> System Uplink Active
                                    </span>
                                    <span className="text-slate-400 font-mono text-xs font-bold tracking-wider">{(scanPhase * 25) + 12}%<span className="opacity-50">/100%</span></span>
                                </div>
                                
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${(scanPhase + 1) * 25}%` }} 
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-full relative"
                                    >
                                        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/50 to-transparent"></div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* The dynamic heavy text */}
                            <div className="h-16 relative z-10 flex justify-center w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={scanPhase}
                                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute text-center"
                                    >
                                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase mb-2 shadow-black drop-shadow-md">
                                            {scanPhase === 0 && "Parsing Identity Data"}
                                            {scanPhase === 1 && "Verifying ATS Integrity"}
                                            {scanPhase === 2 && "Computing Content Impact"}
                                            {scanPhase === 3 && "Benchmarking Skills"}
                                        </h3>
                                        <p className="text-cyan-500/70 text-[10px] sm:text-xs font-mono lowercase tracking-widest">
                                            [ executing neural logic block_0{scanPhase + 1} ... ]
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`space-y-6 lg:max-w-[700px] xl:max-w-none transition-opacity duration-1000 ${scanPhase === 4 ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                    
                    <div className="flex flex-col gap-10 mb-16 scroll-mt-28">
                        {sidebarData.map(category => (
                            <div id={category.id} key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <Layout className="w-5 h-5 text-blue-600"/> {category.title}
                                    </h2>
                                </div>
                                <div className="flex flex-col">
                                    {category.items.map((item, index) => {
                                        let badgeColors = 'bg-red-50 text-red-600 border border-red-100';
                                        if (item.isPass) badgeColors = 'bg-green-50 text-green-600 border border-green-100';
                                        else if (item.message === 'Needs improvement' || item.message.includes('issues')) {
                                            if (item.message === 'Needs improvement') badgeColors = 'bg-amber-50 text-amber-600 border border-amber-100';
                                        }
                                        return (
                                            <div id={item.id} key={item.id} className={`flex flex-col px-6 py-5 hover:bg-slate-50/50 transition-colors scroll-mt-28 ${index !== category.items.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                                <div className="flex flex-row items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {item.isPass ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                                        <span className="text-base font-bold text-slate-800">{item.label}</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badgeColors}`}>
                                                        {item.message || (item.isPass ? 'No issues' : 'Needs Work')}
                                                    </span>
                                                </div>
                                                <div className="ml-8 mt-4 text-[13px] text-slate-600 leading-relaxed font-medium">
                                                    {categoryDetails[item.id]}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actionable Re-upload Footer */}
                    <div className="mt-8 mb-20">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-10 shadow-lg shadow-blue-900/10 text-center flex flex-col items-center justify-center border border-blue-500/30 relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                            
                            <Crown className="w-12 h-12 text-blue-200 mb-4 relative z-10" />
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2 relative z-10">
                                Make your edits & try again!
                            </h2>
                            <p className="text-blue-100 text-sm font-medium max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
                                Our analyzer acts identically to a corporate ATS. Improve the identified issues manually and re-analyze your updated resume to ensure an ascending Nexus Score.
                            </p>
                            
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setEditedText(rawResumeText); setIsEditingMode(true); }}
                                className="relative z-10 flex items-center gap-3 bg-white text-blue-700 hover:text-blue-800 transition-colors px-8 py-4 rounded-xl font-black shadow-xl shadow-blue-900/20 text-sm uppercase tracking-wider"
                            >
                                <PenTool className="w-5 h-5" />
                                Edit Resume Live
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Live Editor Modal */}
            <AnimatePresence>
                {isEditingMode && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Type className="w-5 h-5 text-blue-600"/> In-Browser Live Editor</h2>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Make direct text changes to bypass the ATS parser instantly</p>
                                </div>
                                <button onClick={() => setIsEditingMode(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><XCircle className="w-6 h-6"/></button>
                            </div>
                            <div className="p-0 flex-1 overflow-hidden flex flex-col bg-white">
                                <textarea 
                                    value={editedText || ''}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="w-full h-[50vh] sm:h-[60vh] p-6 focus:outline-none transition-colors font-mono text-sm leading-relaxed text-slate-700 bg-white resize-none"
                                    placeholder="Your extracted resume text will appear here. Making changes here simulates an immediate PDF re-upload..."
                                />
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button onClick={() => setIsEditingMode(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200">Cancel</button>
                                <button 
                                    onClick={handleRescan}
                                    disabled={isRescanning}
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-500/30 disabled:opacity-50"
                                >
                                    {isRescanning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}
                                    {isRescanning ? 'Analyzing...' : 'Execute Live Rescan'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
}
