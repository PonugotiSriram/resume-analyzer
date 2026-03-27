import os
import re

landing_path = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/src/pages/LandingPage.jsx"
upload_path = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/src/pages/UploadPage.jsx"

# --- 1. Modify LandingPage.jsx ---
with open(landing_path, "r", encoding="utf-8") as f:
    landing_content = f.read()

# Instead of Dropzone, just put a button to go to /upload
new_landing_content = re.sub(
    r'<div className="bg-white rounded-3xl shadow-\[0_20px_60px_-15px_rgba\(0,0,0,0\.1\)\].*?<div className="bg-slate-50 py-20',
    '''<div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-blue-100 p-6 md:p-10 max-w-xl mx-auto text-center relative z-20">
                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={() => navigate('/upload')} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-16 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                        >
                            Upload Resume
                        </button>
                    </div>
                </div>
            </div>

            {/* PROBLEM SECTION */}
            <div className="bg-slate-50 py-20''',
    landing_content,
    flags=re.DOTALL
)

with open(landing_path, "w", encoding="utf-8") as f:
    f.write(new_landing_content)

# --- 2. Modify UploadPage.jsx ---
with open(upload_path, "r", encoding="utf-8") as f:
    upload_content = f.read()

# We need to remove candidateName, linkedinUrl, company, but keep jobDescription
# So we can remove the entire "Input Column" block with these inputs.
# Replace the Grid with just Dropzone and Job Description.
new_upload_content = re.sub(
    r'<div className="grid grid-cols-2 gap-4">.*?<div className="space-y-2 flex-grow">',
    '<div className="space-y-2 flex-grow">',
    upload_content,
    flags=re.DOTALL
)
# Further remove the "Target Company ATS" div if it wasn't caught
new_upload_content = re.sub(
    r'<div className="space-y-2">\s*<label className="text-gray-300 text-sm font-medium">Target Company ATS</label>.*?</div>\s*<div className="space-y-2 flex-grow">',
    '<div className="space-y-2 flex-grow">',
    new_upload_content,
    flags=re.DOTALL
)

# In handleAnalyze, hardcode defaults for the removed states
new_upload_content = new_upload_content.replace(
    '''formData.append('candidateName', candidateName || 'Anonymous Student');''',
    '''formData.append('candidateName', 'Anonymous Student');'''
)
new_upload_content = new_upload_content.replace(
    '''formData.append('linkedinUrl', linkedinUrl);''',
    '''formData.append('linkedinUrl', '');'''
)
new_upload_content = new_upload_content.replace(
    '''formData.append('company', company);''',
    '''formData.append('company', 'General');'''
)

# Also update the styling of UploadPage.jsx to be clean white design, not dark mode
# Replacing dark mode classes
upload_swaps = {
    'bg-gray-900/50': 'bg-white',
    'bg-gray-900': 'bg-slate-50',
    'text-gray-300': 'text-gray-700',
    'text-white': 'text-gray-900',
    'border-gray-700': 'border-gray-200',
    'border-gray-600': 'border-gray-300',
    'bg-slate-900/95': 'bg-white/95',
    'text-gray-400': 'text-gray-500',
    'glass-card': 'bg-white shadow-sm'
}

for dark, light in upload_swaps.items():
    new_upload_content = new_upload_content.replace(dark, light)

with open(upload_path, "w", encoding="utf-8") as f:
    f.write(new_upload_content)

print("Flow and Upload scripts updated")
