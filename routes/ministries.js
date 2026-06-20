// routes/ministries.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();


// ==============================
// PUBLIC ROUTES (No auth)
// ==============================

// GET all ministries (sorted by sort_order)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order
            FROM ministries
            ORDER BY sort_order ASC, name ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching ministries: ', err);
        res.status(500).json({ error: 'Failed to fetch ministries'});
    }
});

// GET single ministry
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ministries WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Ministry not found'});
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching ministry:', err);
        res.status(500).json({ error: 'Failed to fetch ministry'});
    }
});

// =================================
// PROTECTED ROUTES (Auth required)
// =================================

//CREATE ministry
router.post('/', authenticateToken, async (req, res) => {
    const 
})