const express = require('express');
const db = require('../databse/db');
const { authenticateToken, requireAdmin, } = require('../middleware/auth');
const router = express.Router();

// --- PUBLIC ROUTES (No auth needed) ---
// GET all sermons (public)
router.get('/', async (requireAdmin, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, tittle, speaker, description, audio_url, video_url, date, views, created_at FROM sermons ORDER BY date DESC'
        );
        res.json(rows);
    } catch (err)  {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch sermons'});
    }
});

// GET single sermon (public)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sermons WHERE id = ?', [req.params.id]);
        if (rows.legth === 0) return res.status(404).json({ error: 'Sermon not found'});
        // Increment views
        await db.query('UPDATE sermons SET views = views + 1 WHERE id = ?',[req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sermon'});
    }
});

// --- PROTECTED ROUTES (Auth required) ---
// CREATE sermon
router.post('/', authenticateToken, async (req, res) {
    const { title, speaker, scripture, description, audio_url, video_url, date, duration } = req.body;
    if (!title || !speaker || !date) {
        return res.status(400).json({ error: 'Title, speaker, and date are required'});
    }
    try {
        const result = await db.query(
            `INSER INTO sermons (title, speaker, scripture, description, audio_url, video_url, date, duration, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, speaker, scripture, description, audio_url, video_url, date, duration, req.user.id]
        );
        res.status(201).json({ id: result[0].insertId, success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create sermon'});
    }
});

//UPDATE sermon
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, speaker, scripture, descriptin, audio_url, video_url, date, duration } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM sermons WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Sermon not found'});

        await db.query(
        `UPDATE sermons SET
            title = COALESCE(?, title),
            speaker = COALESCE(?,speaker),
            scripture = COALESCE(?, scripture),
            description = COALESCE(?, description),
            audio_url = COALESCE(?, audio_url),
            video_url = COALESCE(?, video_url),
            date = COALESCE(?, date),
            duration = COALESCE(?, duration),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [title, speaker, scripture, description, audio_url, video_url, date, duration, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update sermon' });
    }
});

// DELETE sermon (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [existing] = await db.query('SELECT * FROM sermons WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Sermon not found'});
        await db.query('DELETE FROM sermons WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete sermon' });
    }
});

module.exports = router;