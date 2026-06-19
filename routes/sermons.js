// routes/sermons.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// ========================
// PUBLIC ROUTES (No auth)
// ========================

// GET all sermons (public view)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, speaker, scripture, description, 
              audio_url, video_url, date, views, created_at 
       FROM sermons 
       ORDER BY date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sermons:', err);
    res.status(500).json({ error: 'Failed to fetch sermons' });
  }
});

// GET single sermon by ID (public, increments views)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sermons WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sermon not found' });
    }

    // Increment view count asynchronously (don't await to avoid blocking response)
    db.query('UPDATE sermons SET views = views + 1 WHERE id = ?', [req.params.id]);

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching sermon:', err);
    res.status(500).json({ error: 'Failed to fetch sermon' });
  }
});

// ========================
// PROTECTED ROUTES (Auth required)
// ========================

// POST /api/sermons - Create a new sermon
router.post('/', authenticateToken, async (req, res) => {
  const { title, speaker, scripture, description, audio_url, video_url, date, duration } = req.body;

  // Validation
  if (!title || !speaker || !date) {
    return res.status(400).json({ error: 'Title, speaker, and date are required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO sermons 
       (title, speaker, scripture, description, audio_url, video_url, date, duration, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, speaker, scripture, description, audio_url, video_url, date, duration, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Sermon created successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creating sermon:', err);
    res.status(500).json({ error: 'Failed to create sermon' });
  }
});

// PUT /api/sermons/:id - Update an existing sermon
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, speaker, scripture, description, audio_url, video_url, date, duration } = req.body;
  const sermonId = req.params.id;

  try {
    // Check if sermon exists
    const [existing] = await db.query('SELECT id FROM sermons WHERE id = ?', [sermonId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Sermon not found' });
    }

    // Update only provided fields (COALESCE keeps old value if new is NULL/undefined)
    await db.query(
      `UPDATE sermons SET 
        title = COALESCE(?, title),
        speaker = COALESCE(?, speaker),
        scripture = COALESCE(?, scripture),
        description = COALESCE(?, description),
        audio_url = COALESCE(?, audio_url),
        video_url = COALESCE(?, video_url),
        date = COALESCE(?, date),
        duration = COALESCE(?, duration),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title, speaker, scripture, description, audio_url, video_url, date, duration, sermonId]
    );

    res.json({ success: true, message: 'Sermon updated successfully' });
  } catch (err) {
    console.error('Error updating sermon:', err);
    res.status(500).json({ error: 'Failed to update sermon' });
  }
});

// DELETE /api/sermons/:id - Delete a sermon (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const sermonId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM sermons WHERE id = ?', [sermonId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Sermon not found' });
    }

    await db.query('DELETE FROM sermons WHERE id = ?', [sermonId]);
    res.json({ success: true, message: 'Sermon deleted successfully' });
  } catch (err) {
    console.error('Error deleting sermon:', err);
    res.status(500).json({ error: 'Failed to delete sermon' });
  }
});

module.exports = router;