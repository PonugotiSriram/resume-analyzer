import re
import os

filepath = r"c:\Users\ponug\OneDrive\Desktop\MP\frontend\src\pages\Dashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Dictionary of replacements to convert to a beautiful dark/glass theme
replacements = {
    r'\bbg-white\b': 'bg-gray-900/40 backdrop-blur-xl',
    r'\btext-slate-900\b': 'text-white',
    r'\btext-slate-800\b': 'text-gray-100',
    r'\btext-slate-700\b': 'text-gray-300',
    r'\btext-slate-600\b': 'text-gray-400',
    r'\btext-slate-500\b': 'text-gray-400',
    r'\btext-slate-400\b': 'text-gray-500',
    r'\btext-slate-300\b': 'text-gray-600',
    r'\bbg-slate-50/50\b': 'bg-gray-800/30',
    r'\bbg-slate-50\b': 'bg-gray-800/50',
    r'\bbg-\[#f8fafc\]\b': 'bg-gray-800/40',
    r'\bborder-slate-100\b': 'border-gray-700/50',
    r'\bborder-slate-200\b': 'border-gray-700',
    r'\bborder-slate-50\b': 'border-gray-800',
    r'\bbg-slate-100\b': 'bg-gray-700',
    r'\bh-1\.5 bg-slate-100\b': 'h-1.5 bg-gray-700/50',
    r'\bbg-slate-200\b': 'bg-gray-600',
    
    # Text colors for colored borders and badges
    r'\btext-slate-900\b': 'text-gray-100',
    r'\btext-blue-600\b': 'text-indigo-400',
    r'\btext-blue-700\b': 'text-indigo-300',
    r'\btext-green-900\b': 'text-green-300',
    r'\btext-green-700\b': 'text-green-400',
    r'\btext-green-600\b': 'text-green-400',
    r'\btext-green-500\b': 'text-green-400',
    r'\bbg-green-50\b': 'bg-green-500/10',
    r'\bbg-green-100\b': 'bg-green-500/20',
    r'\bborder-green-100\b': 'border-green-500/20',
    
    r'\btext-amber-900\b': 'text-amber-300',
    r'\btext-amber-700\b': 'text-amber-400',
    r'\btext-amber-600\b': 'text-amber-400',
    r'\bbg-amber-50\b': 'bg-amber-500/10',
    r'\bborder-amber-100\b': 'border-amber-500/20',
    
    r'\btext-red-900\b': 'text-red-300',
    r'\btext-red-700\b': 'text-red-400',
    r'\btext-red-600\b': 'text-red-400',
    r'\bbg-red-50/50\b': 'bg-red-500/10',
    r'\bbg-red-50\b': 'bg-red-500/10',
    r'\bbg-red-100\b': 'bg-red-500/20',
    r'\bborder-red-100\b': 'border-red-500/20',

    r'\bbg-blue-600/50\b': 'bg-indigo-500/20',
    r'\bbg-blue-50/60\b': 'bg-indigo-500/10',
    r'\bbg-blue-600\b': 'bg-indigo-600',
    r'\bbg-blue-700\b': 'bg-indigo-500',
    
    # Stroke colors
    r'stroke="#f8fafc"': 'stroke="#1f2937"', # gray-800
    r"'#cbd5e1'": "'#374151'", # gray-700
    r"'text-slate-300'": "'text-gray-600'",
    r"'text-slate-900'": "'text-white'",
    
    # Gradient text
    r'\bbg-gradient-to-r from-blue-600 to-indigo-600\b': 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
    
    # Specific elements
    r'\bmin-h-screen bg-gray-900/40 backdrop-blur-xl text-gray-100 font-sans antialiased overflow-y-auto custom-scrollbar flex\b': 'fixed inset-0 min-h-screen bg-gray-900 text-gray-100 font-sans antialiased overflow-y-auto custom-scrollbar flex',
    r'\bbg-white border border-slate-200 rounded-3xl p-12\b': 'bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-3xl p-12',
    r'\bbg-blue-400/10\b': 'bg-indigo-500/20',
    r'\bbg-cyan-400/10\b': 'bg-purple-500/20',
    r'\bshadow-\[0_0_12px_3px_rgba\(59,130,246,0\.6\)\]\b': 'shadow-[0_0_20px_5px_rgba(99,102,241,0.6)]',
    
    # Footer actionable component
    r'\bbg-gradient-to-br from-blue-600 to-indigo-700\b': 'bg-gradient-to-br from-gray-800 to-gray-900',
    r'\bborder-blue-500/30\b': 'border-gray-700/50',
    r'\btext-blue-200\b': 'text-indigo-400',
    r'\btext-blue-100\b': 'text-gray-300',
    r'\bbg-gray-900/40 backdrop-blur-xl text-indigo-300\b': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md',

    # Hover bg-slate-50
    r'\bhover:bg-slate-50\b': 'hover:bg-gray-800',
    
    # Other adjustments
    r'\bgray-900/40 backdrop-blur-xl\b': 'gray-800/40 backdrop-blur-md',
}

for pattern, repl in replacements.items():
    content = re.sub(pattern, repl, content)

# Fix double replacements or specific manual fixes
content = content.replace('bg-gray-900/40 backdrop-blur-xl', 'bg-gray-800/40 backdrop-blur-md')
content = content.replace('min-h-screen bg-gray-800/40 backdrop-blur-md text-gray-100', 'min-h-screen bg-gray-900 text-gray-100')
content = content.replace('bg-gray-800/40 backdrop-blur-md min-h-screen', 'bg-gray-900 min-h-screen')

content = content.replace("shadow-sm shadow-blue-500/30", "shadow-lg shadow-indigo-500/25")
content = content.replace("bg-white min-h-screen", "bg-gray-900 min-h-screen")
content = content.replace("bg-white rounded-2xl", "bg-gray-800/40 backdrop-blur-md rounded-2xl")
content = content.replace("bg-white text-gray-100 text-slate-800", "bg-gray-900 text-gray-100")

# Final write
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced colors")
