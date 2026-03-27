import os
import re

file_path = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/src/pages/Dashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update State for Resume Form
content = content.replace(
    'const [editedText, setEditedText] = useState("");',
    '''const [resumeForm, setResumeForm] = useState({
        name: result?.name || "Your Name",
        summary: "",
        skills: result?.resume_skills ? result.resume_skills.join(", ") : "",
        experience: "",
        projects: "",
        education: ""
    });'''
)
# Remove handleRescan and isRescanning
content = re.sub(r'const \[isRescanning, setIsRescanning\] = useState\(false\);', '', content)
content = re.sub(r'const handleRescan = async \(\) => \{.+?finally \{\s*setIsRescanning\(false\);\s*\}\s*\};', '', content, flags=re.DOTALL)

# 2. Add dynamic Word Count Logic right before "const hasEmail ="
content = content.replace(
    '// Step 2: Data Extraction',
    '''// Dynamic Word Count Logic
    const currentText = isEditingMode 
        ? Object.values(resumeForm).join(' ') 
        : rawResumeText || '';
    const dynamicWordCount = currentText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const dynamicReadTime = Math.max(1, Math.ceil(dynamicWordCount / 200));

    // Step 2: Data Extraction'''
)

# 3. Update Sidebar Word Count
# We want to replace the whole <div className="flex gap-4"> block inside the sidebar Score Gauge
content = re.sub(
    r'<div className="flex gap-4">.+?</div>\s*</div>',
    '''<div className="text-center font-bold text-gray-700 text-sm mt-4 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                        {scanPhase >= 3 ? dynamicWordCount : 0} Words &bull; {scanPhase >= 3 ? dynamicReadTime : 0} min read
                    </div>
                </div>''',
    content,
    flags=re.DOTALL
)

# 4. Fix Performance Metrics
# Replace the blocks for ProgressBar
content = re.sub(
    r'<ProgressBar label="ATS Connectivity".+?</ProgressBar>.+?</ProgressBar>.+?</ProgressBar>.+?</ProgressBar>',
    '''<ProgressBar label="ATS Score" percentage={ats_compatibility || 0} colorClass="bg-indigo-600" />
                    <ProgressBar label="Keyword Match %" percentage={match_score || 0} colorClass="bg-green-600" />
                    <ProgressBar label="Readability Score" percentage={content_quality || 0} colorClass="bg-amber-600" />
                    <ProgressBar label="Section Completeness" percentage={formatting_score || 0} colorClass="bg-purple-600" />''',
    content,
    flags=re.DOTALL
)

# 5. Live Edit Buttons (just change setEditedText to nothing since state is already init)
content = content.replace(
    'onClick={() => { setEditedText(rawResumeText); setIsEditingMode(true); }}',
    'onClick={() => setIsEditingMode(true)}'
)

# 6. Rewrite the Editor Modal
old_modal_pattern = r'\{/\* Live Editor Modal \*/\}.+?</AnimatePresence>'
new_modal = '''{/* Live Editor Modal */}
            <AnimatePresence>
                {isEditingMode && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-gray-200"
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><PenTool className="w-5 h-5 text-indigo-500"/> Resume Editor</h2>
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{dynamicWordCount} Words &bull; {dynamicReadTime} min read</span>
                                </div>
                                <button onClick={() => setIsEditingMode(false)} className="text-gray-500 hover:text-red-500 transition-colors p-1"><XCircle className="w-6 h-6"/></button>
                            </div>
                            
                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Left Side: Editor Form */}
                                <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-200 bg-gray-50/50 space-y-5 custom-scrollbar">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Edit Details</h3>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Full Name</label>
                                        <input 
                                            value={resumeForm.name} onChange={(e) => setResumeForm({...resumeForm, name: e.target.value})}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Professional Summary</label>
                                        <textarea 
                                            value={resumeForm.summary} onChange={(e) => setResumeForm({...resumeForm, summary: e.target.value})}
                                            className="w-full p-3 h-24 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-800"
                                            placeholder="Write a brief professional summary..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Skills (Comma separated or Bullets)</label>
                                        <textarea 
                                            value={resumeForm.skills} onChange={(e) => setResumeForm({...resumeForm, skills: e.target.value})}
                                            className="w-full p-3 h-24 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-800"
                                            placeholder="React, Node.js, Python..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Experience (Use bullet points -)</label>
                                        <textarea 
                                            value={resumeForm.experience} onChange={(e) => setResumeForm({...resumeForm, experience: e.target.value})}
                                            className="w-full p-3 h-40 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-800"
                                            placeholder="- Software Engineer at Tech Co.\\n- Developed scalable APIs..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Projects (Use bullet points -)</label>
                                        <textarea 
                                            value={resumeForm.projects} onChange={(e) => setResumeForm({...resumeForm, projects: e.target.value})}
                                            className="w-full p-3 h-32 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-800"
                                            placeholder="- Built an AI Analyzer...\\n- Increased traffic by 20%..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Education</label>
                                        <textarea 
                                            value={resumeForm.education} onChange={(e) => setResumeForm({...resumeForm, education: e.target.value})}
                                            className="w-full p-3 h-24 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-800"
                                            placeholder="B.S. Computer Science, University Name (2020 - 2024)"
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Live Formatted Preview */}
                                <div className="w-full md:w-1/2 bg-gray-200/50 p-6 overflow-y-auto custom-scrollbar flex justify-center">
                                    <div className="bg-white shadow-md border border-gray-200 w-full max-w-[210mm] min-h-[297mm] p-10 font-sans text-gray-900">
                                        {/* Resume Header */}
                                        <h1 className="text-3xl font-black text-center mb-1 text-gray-900 border-b-2 border-gray-800 pb-4">{resumeForm.name || "John Doe"}</h1>
                                        
                                        {/* Summary */}
                                        {resumeForm.summary && (
                                            <div className="mt-4">
                                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
                                                <p className="text-sm leading-relaxed text-gray-700">{resumeForm.summary}</p>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {resumeForm.skills && (
                                            <div className="mt-4">
                                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-2">Core Competencies</h2>
                                                <ul className="list-disc list-inside text-sm leading-relaxed text-gray-700 columns-2 gap-4">
                                                    {resumeForm.skills.split(/,|\\n/).map(s => s.trim().replace(/^-/, '')).filter(s => s.length > 0).map((skill, i) => (
                                                        <li key={i}>{skill}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Experience */}
                                        {resumeForm.experience && (
                                            <div className="mt-5">
                                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-2">Professional Experience</h2>
                                                <ul className="list-disc list-outside ml-4 text-sm leading-relaxed text-gray-700 space-y-1">
                                                    {resumeForm.experience.split('\\n').map(s => s.trim()).filter(s => s.length > 0).map((bullet, i) => (
                                                        <li key={i}>{bullet.replace(/^-/, '')}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Projects */}
                                        {resumeForm.projects && (
                                            <div className="mt-5">
                                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-2">Relevant Projects</h2>
                                                <ul className="list-disc list-outside ml-4 text-sm leading-relaxed text-gray-700 space-y-1">
                                                    {resumeForm.projects.split('\\n').map(s => s.trim()).filter(s => s.length > 0).map((bullet, i) => (
                                                        <li key={i}>{bullet.replace(/^-/, '')}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Education */}
                                        {resumeForm.education && (
                                            <div className="mt-5">
                                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-2">Education</h2>
                                                <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                                    {resumeForm.education}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Placeholder if empty */}
                                        {(!resumeForm.summary && !resumeForm.skills && !resumeForm.experience && !resumeForm.projects && !resumeForm.education) && (
                                            <div className="mt-20 flex flex-col items-center justify-center text-gray-300">
                                                <FileText className="w-16 h-16 mb-4 opacity-50"/>
                                                <p className="font-bold">Resume content will appear here</p>
                                                <p className="text-sm mt-1">Start typing on the left to build your beautiful ATS-friendly resume.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                                <button onClick={() => setIsEditingMode(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-500 hover:bg-gray-200 transition-colors border border-gray-300">Close Editor</button>
                                <button 
                                    onClick={() => alert('PDF Download coming soon! You can use CMD/CTRL+P to print this beautiful preview.')}
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4"/> Export PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>'''

content = re.sub(old_modal_pattern, new_modal, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modal replaced successfully")
