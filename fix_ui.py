import os
import re

dashboard_path = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/src/pages/Dashboard.jsx"

with open(dashboard_path, "r", encoding="utf-8") as f:
    dashboard_content = f.read()

# 1. Rename "Full Diagnostic Audit" (or whatever) to "Resume Analysis Dashboard"
# "Full Diagnostic Audit" -> "Resume Analysis Dashboard"
dashboard_content = dashboard_content.replace(
    'Full Diagnostic Audit',
    'Resume Analysis Dashboard'
)

# 2. Rename "Audit Progress" to "Analysis Progress"
dashboard_content = dashboard_content.replace(
    'Audit Progress',
    'Analysis Progress'
)

# 3. Change dashboard background to pure white.
# "min-h-screen w-full bg-gray-900 text-gray-100 font-sans..." -> bg-white text-gray-900
dashboard_content = dashboard_content.replace(
    'bg-gray-900 text-gray-100',
    'bg-white text-gray-900'
)
# Left Sidebar bg
dashboard_content = dashboard_content.replace(
    'bg-gray-900 min-h-screen h-full',
    'bg-white min-h-screen h-full'
)

# The user wants pure white, modern, clean font, focus on simplicity.
# Remove Performance Metrics section if it's taking up space, or fix it.
# Let's keep it but make it clean.
# Also fix sidebar background colors which use bg-gray-800 etc. Instead of manually replacing all, 
# I can just remove the whole "bg-gray-800" across the file, or write intelligent regexes for UI polish.

# Let's replace some dark mode classes with light mode classes.
light_swaps = {
    'bg-gray-800/40': 'bg-gray-50/50',
    'bg-gray-800/50': 'bg-gray-100/50',
    'bg-gray-800/30': 'bg-gray-50/30',
    'bg-gray-800': 'bg-white',
    'border-gray-700/50': 'border-gray-200/50',
    'border-gray-700': 'border-gray-200',
    'text-gray-100': 'text-gray-900',
    'text-gray-300': 'text-gray-700',
    'text-gray-400': 'text-gray-500',
    'bg-slate-900/60': 'bg-white/80',
    'bg-gradient-to-br from-gray-800 to-gray-900': 'bg-gradient-to-br from-gray-50 to-white',
    'shadow-blue-900/10': 'shadow-blue-900/5',
    'text-white': 'text-white', # keep buttons white text
}

for dark, light in light_swaps.items():
    dashboard_content = dashboard_content.replace(dark, light)

with open(dashboard_path, "w", encoding="utf-8") as f:
    f.write(dashboard_content)

print("Dashboard UI updated")
