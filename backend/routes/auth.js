const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-123';

// Mock in-memory DB fallback if Mongoose isn't connected
let mockUsers = [];

const isMongoConnected = () => mongoose.connection.readyState === 1;
const mongoose = require('mongoose');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const assignedRole = role === 'recruiter' ? 'recruiter' : 'jobseeker';

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        if (isMongoConnected()) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ error: 'User already exists' });

            const user = new User({ name, email, passwordHash, role: assignedRole, resumeHistory: [] });
            await user.save();

            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
        } else {
            // Mock Fallback
            if (mockUsers.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
            const user = { id: Date.now().toString(), name, email, passwordHash, role: assignedRole, resumeHistory: [] };
            mockUsers.push(user);
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, user: { id: user.id, name, email, role: assignedRole } });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user;
        if (isMongoConnected()) {
            user = await User.findOne({ email });
        } else {
            user = mockUsers.find(u => u.email === email);
        }

        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Use _id for Mongo, id for Mock
        const token = jwt.sign({ id: user._id || user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role || 'jobseeker' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

        const decoded = jwt.verify(token, JWT_SECRET);

        let user;
        if (isMongoConnected()) {
            user = await User.findById(decoded.id).select('-passwordHash');
        } else {
            const mockUser = mockUsers.find(u => u.id === decoded.id);
            if (mockUser) {
                const { passwordHash, ...rest } = mockUser;
                user = rest;
            }
        }

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
});

module.exports = { router, mockUsers };
