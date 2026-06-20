// routes/prayers.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// ========================
// PUBLIC ROUTES (No auth)
// ========================

// POST /api/prayers - Submit a prayer request (public)
router.post('/', async (req, res) => {
  const { name, phone, email, request, is_public } = req.body;

  if (!request || request.trim() === '') {
    return res.status(400).json({ error: 'Prayer request is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO prayer_requests (name, phone, email, request, is_public) 
       VALUES (?, ?, ?, ?, ?)`,
      [name || null, phone || null, email || null, request.trim(), is_public || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Prayer request submitted successfully. Our prayer team will pray for you.',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error submitting prayer request:', err);
    res.status(500).json({ error: 'Failed to submit prayer request' });
  }
});

// ========================
// PROTECTED ROUTES (Auth required)
// ========================

// GET all prayer requests (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, phone, email, request, is_public, is_answered, created_at 
       FROM prayer_requests 
       ORDER BY is_answered ASC, created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching prayer requests:', err);
    res.status(500).json({ error: 'Failed to fetch prayer requests' });
  }
});

// GET single prayer request (admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM prayer_requests WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Prayer request not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching prayer request:', err);
    res.status(500).json({ error: 'Failed to fetch prayer request' });
  }
});

// PUT /api/prayers/:id/answer - Mark as answered
router.put('/:id/answer', authenticateToken, async (req, res) => {
  const prayerId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM prayer_requests WHERE id = ?', [prayerId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Prayer request not found' });

    await db.query('UPDATE prayer_requests SET is_answered = 1 WHERE id = ?', [prayerId]);

    res.json({ 
      success: true, 
      message: 'Prayer request marked as answered. God is faithful!' 
    });
  } catch (err) {
    console.error('Error marking prayer as answered:', err);
    res.status(500).json({ error: 'Failed to update prayer request' });
  }
});

// DELETE prayer request (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const prayerId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM prayer_requests WHERE id = ?', [prayerId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Prayer request not found' });

    await db.query('DELETE FROM prayer_requests WHERE id = ?', [prayerId]);
    res.json({ success: true, message: 'Prayer request deleted successfully' });
  } catch (err) {
    console.error('Error deleting prayer request:', err);
    res.status(500).json({ error: 'Failed to delete prayer request' });
  }
});

// GET unanswered prayer requests count (for dashboard)
router.get('/count/unanswered', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM prayer_requests WHERE is_answered = 0'
    );
    res.json({ unanswered: rows[0].count });
  } catch (err) {
    console.error('Error counting unanswered prayers:', err);
    res.status(500).json({ error: 'Failed to get prayer count' });
  }
});

module.exports = router;