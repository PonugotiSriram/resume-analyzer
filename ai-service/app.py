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
    
    # Extract skills
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))

    # Match calculation
    if len(job_skills) == 0:
         match_score = 0
    else:
         match_score = int((len(resume_skills.intersection(job_skills)) / len(job_skills)) * 100)
    
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
    ats_score = min(100, int((match_score * 0.5) + (health_score * 0.3) + (len(resume_skills) * 2)))

    # 2. Skill Gap Roadmap
    roadmap = []
    if missing_skills:
        for i, skill in enumerate(missing_skills[:4]):
            roadmap.append({
                "step": f"Step {i+1}",
                "content": f"Learn {skill.title()} fundamentals and build a small project."
            })

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
            "suggestion": "Add more quantified achievements (e.g., 'improved performance by 20%')."
        })

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
    
    return jsonify({
        "match_score": match_score,
        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "resume_skills": list(resume_skills),
        "job_skills": list(job_skills),
        "status": status,
        "health_score": health_score,
        "health_breakdown": health_breakdown,
        "suggestions": suggestions,
        "roadmap": roadmap,
        "ai_coach_suggestions": ai_coach_suggestions,
        "suggested_roles": job_roles,
        "top_industry_skills": top_industry_skills
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
