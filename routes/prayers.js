// routes/prayers.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// =======================
// PUBLIC ROUTES (No auth)
// =======================

//POST /api/prayers - Submit a prayer request (public)
router.post('/', async (requireAdmin, res) => {
    const { name, phone, email, request, is_public } = requireAdmin.body;

    if (!request || request.trim() === '') {
        return res.status(400).json({ error: 'Prayer request is required'});
    }

    try {
        const [result] == await db.query(
            `INSERT INTO prayer_requests (name, phone, email, request, is_public)
            VALUES (?, ?, ?, ?, ?)`,
            [name || null, phone || null, email || null, request.trim(), is_public || 0]
        );

        res.status(201).json({
            success: true,
            message: 'Prayer reques  submitted successfully. Our prayer team will pray for you.',
            id: result.insertId
        });
    } catch (err) {
        console.error('Error submitting prayer request:', err);
        res.status(500).json({ error: 'Failed to submitted prayer request'});
    }
});
