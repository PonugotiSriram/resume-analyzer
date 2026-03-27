import os
import re

FRONTEND_DIR = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/src"
BACKEND_FILE = r"c:/Users/ponug/OneDrive/Desktop/MP/backend/server.js"

# 1. Update Frontend files
for root, dirs, files in os.walk(FRONTEND_DIR):
    for file in files:
        if file.endswith((".jsx", ".js")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # We want to replace exactly: 'http://localhost:4000/some/path'
            # and `http://localhost:4000/some/path`
            # and "http://localhost:4000/some/path"
            
            # Simple approach: replace http://localhost:4000 with ${import.meta.env.VITE_BACKEND_URL}
            # and if the surrounding quotes were single/double quotes, turn them into backticks.
            
            # Pattern matching: ('|")http://localhost:4000([^'"]*)('|")
            def replacer(match):
                quote_start = match.group(1)
                path = match.group(2)
                quote_end = match.group(3)
                
                # if there is already template string variables without backticks, wait,
                # actually it's easier to always use backticks
                # What if the original was already a backtick? match.group(1) is `
                if quote_start in ["'", '"', '`']:
                    return f"`${{import.meta.env.VITE_BACKEND_URL}}{path}`"
                return match.group(0) # fallback
                
            new_content = re.sub(r"""(['"`])http://localhost:4000([^'"`]*)(['"`])""", replacer, content)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

# 2. Update Backend file
with open(BACKEND_FILE, "r", encoding="utf-8") as f:
    backend_content = f.read()

# Replace http://127.0.0.1:5000 with https://your-ai-service.onrender.com (or env var pattern)
# Actually, the user says "AI Service: https://your-ai-service.onrender.com"
backend_content = backend_content.replace("'http://127.0.0.1:5000/analyze'", "process.env.AI_SERVICE_URL || 'https://your-ai-service.onrender.com/analyze'")
backend_content = backend_content.replace('"http://127.0.0.1:5000/analyze"', "process.env.AI_SERVICE_URL || 'https://your-ai-service.onrender.com/analyze'")
backend_content = backend_content.replace('`http://127.0.0.1:5000/analyze`', "process.env.AI_SERVICE_URL || 'https://your-ai-service.onrender.com/analyze'")

with open(BACKEND_FILE, "w", encoding="utf-8") as f:
    f.write(backend_content)
print(f"Updated {BACKEND_FILE}")

# 3. Create .env file for frontend
ENV_PATH = r"c:/Users/ponug/OneDrive/Desktop/MP/frontend/.env"
with open(ENV_PATH, "w", encoding="utf-8") as f:
    f.write("VITE_BACKEND_URL=https://resume-analyzer-7qpy.onrender.com\n")
print(f"Created/Updated {ENV_PATH}")

