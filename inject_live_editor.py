import os
import re

file_path = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/src/pages/Dashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

live_editor_code = """
// ==========================================
// Component: Live Editor Modal (Real-Time Inline)
// ==========================================
const LiveEditorModal = ({ result, rawResumeText, onClose }) => {
    const [lines, setLines] = useState((rawResumeText || "Your resume text here...").split('\\n'));
    const [editingIndex, setEditingIndex] = useState(null);
    
    // Derived issues
    const grammarIssues = result?.spelling_errors || [];
    const weakPhrases = result?.quantificationSuggestions || [];
    const missingSkills = result?.missingSkills || [];
    
    // Helper to highlight a line
    const highlightLine = (line, idx) => {
        if (editingIndex === idx) {
            return (
                <textarea 
                    autoFocus
                    value={line}
                    onChange={(e) => {
                        const newLines = [...lines];
                        newLines[idx] = e.target.value;
                        setLines(newLines);
                    }}
                    onBlur={() => setEditingIndex(null)}
                    className="w-full bg-white border border-indigo-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px] resize-none shadow-sm text-gray-800"
                />
            );
        }
        
        let highlighted = line;
        let hasIssue = false;
        
        // 1. Weak Phrases (Orange)
        if (weakPhrases.length > 0) {
            weakPhrases.forEach(wp => {
                const snippet = wp.sentence.replace('...', '').trim().substring(0, 30);
                if (snippet.length > 5 && line.includes(snippet)) {
                    hasIssue = true;
                    highlighted = highlighted.replace(
                        snippet, 
                        `<span class="bg-orange-200 border-b-2 border-orange-400 cursor-pointer text-orange-900 group relative" title="Weak Phrase: ${wp.issue} | Suggestion: ${wp.fix}">${snippet}</span>`
                    );
                }
            });
        }
        
        // 2. Grammar Issues (Red)
        if (grammarIssues.length > 0) {
            grammarIssues.forEach(ge => {
                const word = ge.word;
                if (word && word.length > 2) {
                    const regex = new RegExp(`\\\\b${word}\\\\b`, 'gi');
                    if (regex.test(line)) {
                        hasIssue = true;
                        highlighted = highlighted.replace(
                            regex, 
                            `<span class="bg-red-200 border-b-2 border-red-500 cursor-pointer text-red-900 group relative" title="Spelling: ${word} -> ${ge.suggestion}">$&</span>`
                        );
                    }
                }
            });
        }

        return (
            <div 
                onClick={() => setEditingIndex(idx)}
                className={`min-h-[24px] cursor-text hover:bg-gray-50 border border-transparent hover:border-indigo-200 p-1 rounded transition-colors whitespace-pre-wrap ${hasIssue ? 'mb-1' : ''}`}
                dangerouslySetInnerHTML={{ __html: highlighted || '<br/>' }}
            />
        );
    };

    const handleDownload = () => {
         // Temporarily hide background elements for print
         document.body.classList.add('print-modal-only');
         window.print();
         document.body.classList.remove('print-modal-only');
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
        >
            <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-gray-200"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg"><PenTool className="w-5 h-5 text-indigo-600"/></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">Interactive Resume Editor</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Click any text to edit inline</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors">
                            <FileDown className="w-4 h-4"/> Download PDF
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
                
                {/* Body Split */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
                    
                    {/* Left: Interactive Resume */}
                    <div className="w-full md:w-2/3 overflow-y-auto bg-gray-100/50 p-6 md:p-8 custom-scrollbar relative print:w-full print:p-0">
                        <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-lg border border-gray-200 p-8 md:p-12 text-gray-800 font-sans leading-relaxed text-[14px] md:text-[15px] outline-none print:shadow-none print:border-none print:p-0">
                            {lines.map((line, idx) => (
                                <React.Fragment key={idx}>
                                    {highlightLine(line, idx)}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Right: Suggestions Panel */}
                    <div className="w-full md:w-1/3 overflow-y-auto bg-white border-l border-gray-200 p-6 custom-scrollbar flex flex-col gap-6 print:hidden">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4 border-b pb-2">
                                <Activity className="w-4 h-4 text-indigo-500"/> Improvement Radar
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mb-4">
                                Click on any highlighted text in the document to edit inline & fix the errors below.
                            </p>
                        </div>

                        {missingSkills.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target className="w-3 h-3"/> Missing Keywords</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {missingSkills.map(skill => (
                                        <span key={skill} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[11px] font-bold border border-yellow-200">{skill}</span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-yellow-600 mt-2 font-medium">Inject these naturally into your Experience section.</p>
                            </div>
                        )}

                        {weakPhrases.length > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3"/> Weak Phrases</h4>
                                <div className="space-y-3">
                                    {weakPhrases.map((wp, i) => (
                                        <div key={i} className="bg-white border border-orange-100 rounded-lg p-3 shadow-sm">
                                            <span className="bg-orange-100 text-orange-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mb-1 inline-block">Issue: {wp.issue}</span>
                                            <p className="text-xs text-gray-600 italic line-clamp-2 mt-1">"{wp.sentence}"</p>
                                            <div className="mt-2 text-xs font-bold text-orange-600 flex items-start gap-1">
                                                <ArrowRightLeft className="w-3 h-3 mt-0.5 shrink-0"/> {wp.fix}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {grammarIssues.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Type className="w-3 h-3"/> Spelling & Grammar</h4>
                                <div className="space-y-2">
                                    {grammarIssues.map((ge, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white border border-red-100 p-2 rounded-lg text-xs shadow-sm">
                                            <span className="text-red-500 font-bold line-through">{ge.word}</span>
                                            <ArrowRightLeft className="w-3 h-3 text-gray-400 mx-2"/>
                                            <span className="text-green-600 font-bold">{ge.suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {missingSkills.length === 0 && weakPhrases.length === 0 && grammarIssues.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2"/>
                                <p className="text-sm font-bold">Looks flawless!</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function Dashboard() {"""

content = content.replace("export default function Dashboard() {", live_editor_code)


new_modal_call = """
            {/* Live Editor Modal */}
            <AnimatePresence>
                {isEditingMode && (
                    <LiveEditorModal 
                        result={result}
                        rawResumeText={rawResumeText}
                        onClose={() => setIsEditingMode(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
"""

content = re.sub(r'\{\/\*\s*Live Editor Modal\s*\*\/\}.*?</AnimatePresence>\s*</div>\s*\);\s*}', new_modal_call, content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected Live Editor Module.")
