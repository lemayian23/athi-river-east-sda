// routes/events.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../midleware/auth');
const router = express.Router();

// ===========================
// PUBLIC ROUTES (No auth)
// ===========================

//GET all events
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, title, description, event_date, end_date, location, image_url
            FROM events
            ORDER BY event_date ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Failed to fetch events'});
    }
});

// GET single event
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.paramams.id]);
        
    }
})