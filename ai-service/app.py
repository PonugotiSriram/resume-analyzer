import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from spellchecker import SpellChecker
from collections import Counter

app = Flask(__name__)
CORS(app)

try:
    spell = SpellChecker()
except:
    spell = None

# A predefined list of common tech skills for demonstration
KNOWN_SKILLS = set([
    "python", "react", "sql", "docker", "system design", "aws", "javascript", 
    "node.js", "express", "mongodb", "java", "kubernetes", "ci/cd", 
    "html", "css", "machine learning", "nlp", "flask", "django", "typescript", "figma", "pandas"
])

# Custom Dictionary of 20 common resume spelling mistakes
COMMON_MISSPELLINGS = {
    "achievment": "achievement",
    "proffessional": "professional",
    "accomodate": "accommodate",
    "recieve": "receive",
    "seperate": "separate",
    "aquire": "acquire",
    "reccomend": "recommend",
    "experiance": "experience",
    "maintainance": "maintenance",
    "calender": "calendar",
    "enviroment": "environment",
    "goverment": "government",
    "sucessful": "successful",
    "optomize": "optimize",
    "impelement": "implement",
    "devlopment": "development",
    "stratagy": "strategy",
    "responsabilities": "responsibilities",
    "managment": "management",
    "knowlege": "knowledge"
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
    found_skills = set()
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text):
            found_skills.add(skill)
    return list(found_skills)

def check_repetition(text):
    words = re.findall(r'\b\w+\b', text.lower())
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'as', 'is', 'are', 'was', 'were', 'to', 'from'}
    relevant_words = [w for w in words if w not in stop_words and len(w) > 3]
    counts = Counter(relevant_words)
    repeated_issues = []
    for word, count in counts.items():
        if count > 8: 
            repeated_issues.append(f"Word '{word}' used {count} times.")
    return repeated_issues[:3]

def calculate_grade(score):
    if score >= 85: return 'A'
    if score >= 70: return 'B'
    if score >= 50: return 'C'
    return 'F'

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    resume_text = data.get('resume_text', '')
    original_text = resume_text
    
    # Text Cleaning
    # Remove awkward PDF artifacts and special non-resume characters, keeping basic punctuation
    resume_text = re.sub(r'[^\w\s.,!?;:\'-]', ' ', resume_text)
    # Remove extra spaces completely
    resume_text = re.sub(r'\s+', ' ', resume_text).strip()
    
    job_description = data.get('job_description', '')
    linkedin_url = data.get('linkedin_url', '')
    company = data.get('company', 'General')
    
    # 1. Skill Extraction & Matching
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))

    if not job_skills:
        # Fallback if no JD skills detected
        match_score = min(100, len(resume_skills) * 10)
    else:
        match_score = int((len(resume_skills.intersection(job_skills)) / len(job_skills)) * 100)
        match_score = min(98, match_score)
    
    matched_skills = list(resume_skills.intersection(job_skills))
    missing_skills = list(job_skills.difference(resume_skills))

    # 2. Section Identification
    sections = ['experience', 'education', 'skills', 'projects', 'summary', 'contact']
    sections_found = {sec: (sec in resume_text.lower()) for sec in sections}

    # 3. Spell Check
    spelling_errors = []
    
    # Custom Dictionary Scan Logic (Before main NLP)
    words_in_text = re.findall(r'\b[a-zA-Z]+\b', resume_text.lower())
    for word in words_in_text:
        if word in COMMON_MISSPELLINGS:
            if not any(e['word'] == word for e in spelling_errors):
                spelling_errors.append({"word": word, "suggestion": COMMON_MISSPELLINGS[word]})
                
    if spell:
        words_to_check = [w for w in words_in_text if w not in KNOWN_SKILLS and len(w) > 2]
        misspelled = spell.unknown(words_to_check)
        
        errors_found = len(spelling_errors)
        for word in misspelled:
            if errors_found >= 5: 
                break
            correction = spell.correction(word)
            if correction and correction != word:
                spelling_errors.append({"word": word, "suggestion": correction})
                errors_found += 1
            elif not correction:
                spelling_errors.append({"word": word, "suggestion": "No suggestion found"})
                errors_found += 1

    # 4. Quantification & Metrics
    annotated_sentences = []
    quantification_suggestions = []
    sentences = re.split(r'[.!?]', resume_text)
    for s in sentences:
        s = s.strip()
        if not s: continue
        word_list = s.split()
        if len(word_list) > 3:
            is_quantified = any(char.isdigit() for char in s) or '%' in s or '$' in s
            annotated_sentences.append({"text": s + ".", "is_quantified": is_quantified})
            if not is_quantified and len(word_list) > 10 and len(quantification_suggestions) < 3:
                rec = get_ai_recommendation(s)
                quantification_suggestions.append({"sentence": s[:100] + "...", "issue": rec["issue"], "fix": rec["fix"]})

    quantified_count = sum(1 for s in annotated_sentences if s['is_quantified'])
    full_quant_score = int((quantified_count / len(annotated_sentences)) * 100) if annotated_sentences else 0

    # 5. Repetition Check
    repetition_errors = check_repetition(resume_text)
    has_repetition = len(repetition_errors) > 0

    # 6. Contact Info
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+', resume_text))
    has_phone = bool(re.search(r'\+?\d[\d -]{8,12}\d', resume_text))
    has_linkedin = bool('linkedin.com' in resume_text.lower() or linkedin_url)
    has_contact = has_email or has_phone

    # 7. Action Verbs
    words = resume_text.split()
    word_count = len(words)
    action_verbs_list = ['developed', 'engineered', 'led', 'designed', 'built', 'spearheaded', 'architected', 'managed', 'created', 'implemented', 'optimized', 'reduced', 'increased', 'delivered']
    verbs_count = sum(1 for word in words if word.lower().strip(',.').replace(':', '') in action_verbs_list)
    verbs_score = min(100, verbs_count * 10)

    # 8. Composite Scores
    ats_compatibility = match_score
    content_quality = min(100, (verbs_count * 5) + (full_quant_score // 2) + (30 if word_count > 200 else 10))
    formatting_score = min(100, sum(sections_found.values()) * 16) # ~6 sections
    linkedin_presence = 100 if has_linkedin else 0
    nexus_score = int(ats_compatibility * 0.4 + content_quality * 0.3 + formatting_score * 0.2 + linkedin_presence * 0.1)

    # Diagnostic Report
    diagnostic_report = [
        {"aspect": "ATS Parse Rate", "status": "pass" if len(resume_text) > 100 else "fail", "score": 100 if len(resume_text) > 100 else 0},
        {"aspect": "Quantifying Impact", "status": "pass" if full_quant_score > 20 else "fail", "score": full_quant_score},
        {"aspect": "Repetition", "status": "fail" if has_repetition else "pass", "score": 100 if not has_repetition else 40},
        {"aspect": "Spelling & Grammar", "status": "fail" if spelling_errors else "pass", "score": max(0, 100 - len(spelling_errors) * 10)},
        {"aspect": "Essential Sections", "status": "pass" if sections_found['experience'] and sections_found['education'] else "fail", "score": 100 if sections_found['experience'] and sections_found['education'] else 50},
        {"aspect": "Contact Information", "status": "pass" if has_contact else "fail", "score": 100 if has_contact else 0},
        {"aspect": "File Format & Size", "status": "pass", "score": 100},
        {"aspect": "Design", "status": "pass" if len(resume_text) < 5000 else "fail", "score": 80},
        {"aspect": "Email Address", "status": "pass" if has_email else "fail", "score": 100 if has_email else 0},
        {"aspect": "Hard Skills", "status": "pass" if matched_skills else "fail", "score": match_score},
        {"aspect": "Soft Skills", "status": "pass", "score": 100},
        {"aspect": "Action Verbs", "status": "pass" if verbs_count > 5 else "fail", "score": min(100, verbs_count * 10)},
    ]

    section_grades = {
        "Content": calculate_grade(int(((100 if not has_repetition else 40) + max(0, 100 - len(spelling_errors) * 10) + full_quant_score) / 3)),
        "Sections": calculate_grade(100 if sections_found['experience'] and sections_found['education'] else 50),
        "ATS Essentials": calculate_grade(80 if has_email else 40),
        "Tailoring": calculate_grade(match_score)
    }

    # Suggestions / Coach
    coach_steps = []
    if missing_skills:
        coach_steps.append(f"Add keywords: {', '.join(missing_skills[:2])}.")
    if not has_linkedin:
        coach_steps.append("Add your LinkedIn profile.")
    if verbs_count < 5:
        coach_steps.append("Use more strong action verbs.")
    if not coach_steps:
        coach_steps.append("Great job! Keep quantifying.")

    return jsonify({
        "raw_resume_text": original_text,
        "nexus_score": nexus_score,
        "ats_compatibility": ats_compatibility,
        "content_quality": content_quality,
        "formatting_score": formatting_score,
        "linkedin_presence": linkedin_presence,
        "word_count": word_count,
        "reading_time": max(1, word_count // 200),
        "diagnostic_report": diagnostic_report,
        "coach_steps": coach_steps[:3],
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "resume_skills": list(resume_skills),
        "job_skills": list(job_skills),
        "status": "Strong Match" if match_score > 80 else "Needs Improvement",
        "quantification_suggestions": quantification_suggestions,
        "section_grades": section_grades,
        "spelling_errors": spelling_errors,
        "repetition_errors": repetition_errors,
        "verbs_score": verbs_score,
        "quant_score": full_quant_score,
        "annotated_sentences": annotated_sentences
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
