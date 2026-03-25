import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
# try:
#     import spacy
#     nlp = spacy.load("en_core_web_sm")
# except:
#     nlp = None

app = Flask(__name__)
CORS(app)

# A predefined list of common tech skills for demonstration
KNOWN_SKILLS = set([
    "python", "react", "sql", "docker", "system design", "aws", "javascript", 
    "node.js", "express", "mongodb", "java", "kubernetes", "ci/cd", 
    "html", "css", "machine learning", "nlp", "flask", "django"
])

# Maps jobs to standard industry skills
INDUSTRY_SKILLS = {
    "backend developer": ["docker", "kubernetes", "system design", "aws", "ci/cd", "node.js", "python", "sql", "mongodb"],
    "frontend developer": ["react", "javascript", "html", "css", "typescript", "figma"],
    "full stack developer": ["react", "node.js", "express", "mongodb", "docker", "javascript"],
    "data scientist": ["python", "machine learning", "nlp", "sql", "pandas"],
}

def get_ai_recommendation(bullet_text):
    text_lower = bullet_text.lower()
    if 'summary' in text_lower or 'objective' in text_lower or 'experienced' in text_lower or 'driven' in text_lower:
        return {
            "issue": "Summary lacks specifics.",
            "fix": "Add your total 'Years of experience' and highlight your 'Core Tech Stack'."
        }
    elif 'project' in text_lower or 'developed' in text_lower or 'app' in text_lower or 'built' in text_lower or 'system' in text_lower:
        return {
            "issue": "Project description is vague.",
            "fix": "Specify the 'Tools used' (e.g., React, Node.js) and add a 'GitHub link'."
        }
    else:
        return {
            "issue": "Lacks measurable work impact.",
            "fix": "Add a specific metric (e.g., 'Reduced latency by X%' or 'Managed a team of Y')."
        }

def extract_skills(text):
    text = text.lower()
    # Simple extraction purely for matching KNOWN_SKILLS
    found_skills = set()
    for skill in KNOWN_SKILLS:
        # Match word boundaries or literal phrases
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text):
            found_skills.add(skill)
    return list(found_skills)

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    resume_text = data.get('resume_text', '')
    job_description = data.get('job_description', '')
    linkedin_url = data.get('linkedin_url', '')
    company = data.get('company', 'General')
    
    # Extract skills
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))

    # Match calculation
    if len(job_skills) == 0:
         match_score = 0
    else:
         match_score = int((len(resume_skills.intersection(job_skills)) / len(job_skills)) * 100)
         if match_score == 100:
             match_score = 98 # Cap at 98% to avoid unrealistic 100% scores
    
    matched_skills = list(resume_skills.intersection(job_skills))
    missing_skills = list(job_skills.difference(resume_skills))

    # Determine status
    if match_score >= 80:
        status = "Strong Match"
    elif match_score >= 60:
        status = "Good Match"
    else:
        status = "Needs Improvement"
    
    # Generate suggestions
    suggestions = []
    if missing_skills:
        suggestions.append(f"To improve your match for this role, learn {', '.join(missing_skills[:3])}.")
    if len(resume_skills) < 3:
        suggestions.append("Consider adding more detailed descriptions of your past projects to highlight your technical stack.")

    health_score = min(100, 50 + len(resume_skills) * 5)

    # 1. ATS Score Calculation
    base_ats = (match_score * 0.5) + (health_score * 0.3) + (len(resume_skills) * 2)
    ats_score = min(94, int(base_ats)) # Cap at 94 to avoid unrealistic 100% scores

    # Company-Specific ATS Adjustments
    if company.lower() == "wipro":
        ats_score = max(0, ats_score - 5) # Wipro is typically stricter
    elif company.lower() == "infosys":
        if "java" not in resume_skills and "python" not in resume_skills:
            ats_score = max(0, ats_score - 8)
    elif company.lower() == "tcs":
        if "sql" not in resume_skills:
            ats_score = max(0, ats_score - 6)
    elif company.lower() == "cognizant":
        ats_score = max(0, ats_score - 4)


    # 2. Skill Gap Roadmap
    roadmap = []
    if missing_skills:
        for i, skill in enumerate(missing_skills[:4]):
            roadmap.append({
                "step": f"Step {i+1}",
                "content": f"Learn {skill.title()} fundamentals and build a small project."
            })

    # Project Suggestion Engine
    PROJECT_IDEAS = {
        "react": "Build a To-Do app or Weather Dashboard using React hooks.",
        "python": "Create a web scraper or a simple REST API using Flask.",
        "sql": "Design a basic e-commerce database schema and write complex JOIN queries.",
        "docker": "Containerize a simple Node.js or Python application.",
        "aws": "Deploy a static website on S3 with CloudFront.",
        "system design": "Sketch out an architecture diagram for a Twitter clone.",
        "javascript": "Build a dynamic calculator or tic-tac-toe game.",
        "node.js": "Create a simple chat server using Socket.io and Node.",
        "mongodb": "Build a REST API that stores user profiles in MongoDB.",
        "java": "Build a console-based library management system using Java."
    }
    
    project_suggestions = []
    for skill in missing_skills:
        if skill in PROJECT_IDEAS:
            project_suggestions.append({"skill": skill, "project": PROJECT_IDEAS[skill]})
        if len(project_suggestions) >= 3:
            break


    # 4. AI Resume Improvement Suggestions
    ai_coach_suggestions = suggestions.copy()
    if 'developed' not in resume_text.lower() and 'worked' in resume_text.lower():
        ai_coach_suggestions.append({
            "original": "Worked on a web development project.",
            "suggestion": "Developed a full-stack web application using clearly defined frameworks and measurable outcomes."
        })
    else:
        ai_coach_suggestions.append({
            "original": "Standard phrase detected",
            "suggestion": "Upgrade weak verbs. Use strong action verbs (e.g., 'Engineered', 'Spearheaded', 'Architected') and add quantified achievements."
        })

    # Quantification Highlighter & Heatmap
    quantification_suggestions = []
    annotated_sentences = []
    
    sentences = resume_text.split('.')
    for s in sentences:
        s = s.strip()
        if len(s.split()) > 3: # Ignore very short phrases
            is_quantified = any(char.isdigit() for char in s) or '%' in s or '$' in s
            annotated_sentences.append({
                "text": s + ".",
                "is_quantified": is_quantified
            })
            
        if len(s.split()) > 8: # Arbitrary heuristic for substantial sentences
            if not any(char.isdigit() for char in s) and '%' not in s and '$' not in s:
                if len(quantification_suggestions) < 3:
                    rec = get_ai_recommendation(s)
                    quantification_suggestions.append({
                        "sentence": s[:100] + "...", 
                        "issue": rec["issue"],
                        "fix": rec["fix"]
                    })

    # LinkedIn Profile Analyzer (Mock)
    if linkedin_url:
        linkedin_feedback = f"LinkedIn URL detected. Ensure your headline includes '{job_roles[0] if job_roles else 'Software Engineer'}' to match your resume. Consistency is key for recruiters."
    else:
        linkedin_feedback = "No LinkedIn URL provided. An optimized LinkedIn profile increases interview chances by 70%. Ensure you link it and mirror your resume achievements."

    # 1. Data Extraction Logic (18+ Parameters)
    # Contact Info
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+', resume_text))
    has_phone = bool(re.search(r'\+?\d[\d -]{8,12}\d', resume_text))
    has_linkedin = bool('linkedin.com' in resume_text.lower() or linkedin_url)
    
    # Section Headers
    sections = ['experience', 'education', 'skills', 'projects']
    sections_found = {sec: (sec in resume_text.lower()) for sec in sections}
    
    # Text Metrics
    bullet_points = [line for line in resume_text.split('\n') if line.strip().startswith(('•', '-', '*'))]
    bullet_density = len(bullet_points)
    words = resume_text.split()
    word_count = len(words)
    reading_time = max(1, word_count // 200) # minutes
    
    action_verbs_list = ['developed', 'engineered', 'led', 'designed', 'built', 'spearheaded', 'architected', 'managed', 'created', 'implemented', 'optimized', 'reduced', 'increased', 'delivered']
    verbs_count = sum(1 for word in words if word.lower().strip(',.') in action_verbs_list)

    # 2. Sub-Scoring System
    ats_compatibility = match_score
    content_quality = min(100, (verbs_count * 5) + (bullet_density * 2) + (30 if word_count > 200 else 10))
    formatting_score = min(100, sum(sections_found.values()) * 25)
    linkedin_presence = 100 if has_linkedin else 0

    nexus_score = int(ats_compatibility * 0.4 + content_quality * 0.3 + formatting_score * 0.2 + linkedin_presence * 0.1)

    # 3. Resume Health Breakdown (Diagnostic Report Data)
    diagnostic_report = [
        {"aspect": "Email Included", "status": "pass" if has_email else "fail", "score": 100 if has_email else 0},
        {"aspect": "Phone Included", "status": "pass" if has_phone else "fail", "score": 100 if has_phone else 0},
        {"aspect": "LinkedIn Linked", "status": "pass" if has_linkedin else "fail", "score": 100 if has_linkedin else 0},
        {"aspect": "Word Count", "status": "pass" if word_count > 300 else "fail", "score": min(100, word_count // 4)},
        {"aspect": "Action Verbs", "status": "pass" if verbs_count > 5 else "fail", "score": min(100, verbs_count * 10)},
        {"aspect": "Experience Section", "status": "pass" if sections_found['experience'] else "fail", "score": 100 if sections_found['experience'] else 0},
        {"aspect": "Projects Section", "status": "pass" if sections_found['projects'] else "fail", "score": 100 if sections_found['projects'] else 0}
    ]

    # AI Career Coach Next Steps
    coach_steps = []
    if missing_skills:
        coach_steps.append(f"Add the keyword '{missing_skills[0].title()}' to your Skills & Experience section to boost ATS score by 5 points.")
    if not has_linkedin:
        coach_steps.append("Embed your LinkedIn Profile URL at the top to secure your 10% Online Presence score.")
    if verbs_count < 5:
        coach_steps.append("Replace weak verbs (e.g. 'worked on') with strong action verbs (e.g. 'Engineered', 'Spearheaded').")
    if not coach_steps:
        coach_steps.append("Your resume is well optimized! Consider quantifying more bullet points.")
    
    # Top 3 only
    coach_steps = coach_steps[:3]

    # One-Click Resume Tailor (Optimized Summary)
    optimized_summary = f"Results-driven professional with expertise in {', '.join(list(resume_skills)[:3]) if len(resume_skills) >= 3 else 'software development'}. " \
                        f"Proven ability to deliver high-quality solutions using {', '.join(matched_skills[:2]) if matched_skills else 'industry standard tools'}. "
    missing_for_summary = missing_skills[:2]
    if missing_for_summary:
        optimized_summary += f"Actively upskilling in {', '.join(missing_for_summary)} to drive impactful technical initiatives."

    # Voice / Chatbot Assistant
    chatbot_message = "I've analyzed your resume! "
    if "aws" not in resume_skills and "azure" not in resume_skills:
        chatbot_message += "You haven't mentioned cloud tools like AWS or Azure. Want me to help you frame your projects around them? "
    elif len(quantification_suggestions) > 0:
        chatbot_message += "I noticed some missing metrics in your experience section. Should we quantify your impacts together?"
    else:
        chatbot_message += "Your resume looks very strong! Ready to tailor it for specific job descriptions?"



    # 6. Resume Health Breakdown
    health_breakdown = [
        "Good length and readable sections." if len(resume_text) > 500 else "Resume is too brief. Expand on your experiences.",
        "Add more quantified achievements." if '%' not in resume_text else "Good use of quantified achievements.",
        f"Technical stack clarity: {'Clear' if len(resume_skills) > 4 else 'Needs improvement. explicitly list technologies.'}"
    ]

    # 7. Job Role Suggestions
    job_roles = []
    if "react" in resume_skills or "html" in resume_skills: job_roles.append("Frontend Developer")
    if "node.js" in resume_skills or "python" in resume_skills: job_roles.append("Backend Developer")
    if len(job_roles) == 2: job_roles.append("Full Stack Developer")
    if not job_roles: job_roles = ["Software Engineer Intern", "Junior Developer"]

    # 9. Skill Trend Insights
    detected_job = "backend developer" # simplified default
    for role in INDUSTRY_SKILLS.keys():
        if role in job_description.lower():
            detected_job = role
            break
            
    top_industry_skills = INDUSTRY_SKILLS.get(detected_job, INDUSTRY_SKILLS["backend developer"])
    
    def calculate_grade(score):
        if score >= 85: return 'A'
        if score >= 70: return 'B'
        if score >= 50: return 'C'
        return 'F'

    contact_score = 100 if (has_email and has_phone) else (50 if has_email or has_phone else 0)
    experience_score = 100 if sections_found.get('experience') else 0
    education_score = 100 if sections_found.get('education') else 0
    skills_score = match_score if match_score > 0 else min(100, len(resume_skills) * 20)
    languages_score = 100 if 'language' in resume_text.lower() else 50
    
    section_grades = {
        "Contact Info": calculate_grade(contact_score),
        "Experience": calculate_grade(experience_score),
        "Education": calculate_grade(education_score),
        "Skills": calculate_grade(skills_score),
        "Languages": calculate_grade(languages_score)
    }
    
    return jsonify({
        "raw_resume_text": resume_text,
        "nexus_score": nexus_score,
        "ats_compatibility": ats_compatibility,
        "content_quality": content_quality,
        "formatting_score": formatting_score,
        "linkedin_presence": linkedin_presence,
        "word_count": word_count,
        "reading_time": reading_time,
        "diagnostic_report": diagnostic_report,
        "coach_steps": coach_steps,
        "optimized_summary": optimized_summary,
        "chatbot_message": chatbot_message,
        "annotated_sentences": annotated_sentences,
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "resume_skills": list(resume_skills),
        "job_skills": list(job_skills),
        "status": status,
        "quantification_suggestions": quantification_suggestions,
        "suggested_roles": job_roles,
        "section_grades": section_grades
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
