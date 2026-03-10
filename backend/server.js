const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const PDFDocument = require('pdfkit');
const User = require('./models/User');
const { mockUsers } = require('./routes/auth');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-analyzer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error (using mock fallback):', err.message));

// Auth Routes
const { router: authRouter } = require('./routes/auth');
app.use('/auth', authRouter);

// In-memory db for quick mock without mongo connect requirement right away
const resumes = [];

// Multer setup for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded.' });
        }

        let jd = req.body.jobDescription || "";
        let candidateName = req.body.candidateName || "Unknown Candidate";
        let userId = req.body.userId || null;

        // Parse PDF
        const data = await pdfParse(req.file.buffer);
        const text = data.text;

        // Sent text to Python AI Service
        let aiResult;
        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze', {
                resume_text: text,
                job_description: jd
            });
            aiResult = response.data;
        } catch (err) {
            console.error('AI Service Err:', err.message);
            aiResult = {
                match_score: 50,
                ats_score: 50,
                status: "Unknown",
                matched_skills: [],
                missing_skills: [],
                resume_skills: [],
                health_score: 50,
                health_breakdown: [],
                roadmap: [],
                ai_coach_suggestions: [],
                suggested_roles: [],
                top_industry_skills: [],
                suggestions: ["Provide AI service online"]
            };
        }

        const candidate = {
            id: Date.now().toString(),
            name: candidateName,
            status: aiResult.status,
            matchScore: aiResult.match_score,
            atsScore: aiResult.ats_score,
            skills: aiResult.resume_skills,
            matchedSkills: aiResult.matched_skills,
            missingSkills: aiResult.missing_skills,
            healthScore: aiResult.health_score,
            healthBreakdown: aiResult.health_breakdown,
            suggestions: aiResult.suggestions,
            roadmap: aiResult.roadmap,
            aiCoachSuggestions: aiResult.ai_coach_suggestions,
            suggestedRoles: aiResult.suggested_roles,
            topIndustrySkills: aiResult.top_industry_skills,
            createdAt: new Date().toISOString()
        };

        resumes.push(candidate);

        // Try linking to user account if logged in
        if (userId) {
            try {
                if (mongoose.connection.readyState === 1) {
                    await User.findByIdAndUpdate(userId, { $push: { resumeHistory: candidate } });
                } else {
                    const mockUser = mockUsers.find(u => u.id === userId);
                    if (mockUser) mockUser.resumeHistory.push(candidate);
                }
            } catch (e) { console.error("Could not save to history", e) }
        }

        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/candidates', (req, res) => {
    // Return sorted candidates by match score
    const sorted = [...resumes].sort((a, b) => b.matchScore - a.matchScore);
    res.json(sorted);
});

app.put('/api/candidates/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const candidateIndex = resumes.findIndex(c => c.id === id);

        if (candidateIndex === -1) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        resumes[candidateIndex].recruiterStatus = status;
        res.json(resumes[candidateIndex]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download PDF Report
app.post('/api/report/download', (req, res) => {
    try {
        const { candidate, jobRole } = req.body;
        if (!candidate) return res.status(400).json({ error: "No report data provided" });

        const doc = new PDFDocument({ margin: 50 });
        let filename = `${candidate.name || 'Candidate'}_Report.pdf`.replace(/\s/g, '_');
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(25).fillColor('#4f46e5').text('Resume Analysis Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).fillColor('#000000').text(`Candidate Name: ${candidate.name}`);
        doc.text(`Job Role: ${jobRole || 'General'}`);
        doc.text(`Date Check: ${new Date(candidate.createdAt || Date.now()).toLocaleDateString()}`);
        doc.moveDown();

        // Scores
        doc.fontSize(18).fillColor('#059669').text('Core Scores');
        doc.fontSize(12).fillColor('#000000').text(`Match Score: ${candidate.matchScore}%`);
        doc.text(`ATS Score: ${candidate.atsScore}%`);
        doc.text(`Health Score: ${candidate.healthScore}/100`);
        doc.moveDown();

        // Skills
        doc.fontSize(18).fillColor('#ea580c').text('Skill Assessment', { underline: true });
        doc.fontSize(12).fillColor('#000000');
        doc.text(`Matched Skills: ${candidate.matchedSkills?.join(', ') || 'None'}`);
        doc.text(`Missing Skills: ${candidate.missingSkills?.join(', ') || 'None'}`);
        doc.moveDown();

        // Roadmap
        if (candidate.roadmap && candidate.roadmap.length > 0) {
            doc.fontSize(18).fillColor('#2563eb').text('Skill Gap Learning Roadmap', { underline: true });
            doc.fontSize(12).fillColor('#000000');
            candidate.roadmap.forEach((r, idx) => {
                doc.text(`${r.step}: ${r.content}`);
            });
            doc.moveDown();
        }

        // Suggestions
        doc.fontSize(18).fillColor('#9333ea').text('AI Improvement Suggestions', { underline: true });
        doc.fontSize(12).fillColor('#000000');
        if (candidate.suggestions) {
            candidate.suggestions.forEach(s => doc.text(`- ${s}`));
        }
        if (candidate.aiCoachSuggestions) {
            candidate.aiCoachSuggestions.forEach(s => {
                doc.text(`Original: ${s.original}`);
                doc.text(`Suggest: ${s.suggestion}`);
                doc.moveDown(0.5);
            });
        }

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate report" });
    }
});


// User History fetching
app.get('/api/report/history/:userId', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const user = await User.findById(req.params.userId);
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json(user.resumeHistory || []);
        } else {
            const mockUser = mockUsers.find(u => u.id === req.params.userId);
            if (!mockUser) return res.status(404).json({ error: 'User not found' });
            return res.json(mockUser.resumeHistory || []);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Save Report specifically
app.post('/api/report/save', async (req, res) => {
    try {
        const { userId, report } = req.body;
        if (!userId || !report) return res.status(400).json({ error: "Missing data" });

        if (mongoose.connection.readyState === 1) {
            await User.findByIdAndUpdate(userId, { $push: { resumeHistory: report } });
            res.json({ success: true });
        } else {
            const mockUser = mockUsers.find(u => u.id === userId);
            if (mockUser) mockUser.resumeHistory.push(report);
            res.json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Node backend running on port ${PORT}`);
});
