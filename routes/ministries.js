// routes/ministries.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// ========================
// PUBLIC ROUTES (No auth)
// ========================

// GET all ministries (sorted by sort_order)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order 
       FROM ministries 
       ORDER BY sort_order ASC, name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ministries:', err);
    res.status(500).json({ error: 'Failed to fetch ministries' });
  }
});

// GET single ministry
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ministries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ministry not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching ministry:', err);
    res.status(500).json({ error: 'Failed to fetch ministry' });
  }
});

// ========================
// PROTECTED ROUTES (Auth required)
// ========================

// CREATE ministry
router.post('/', authenticateToken, async (req, res) => {
  const { name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Ministry name is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ministries 
       (name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Ministry created successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creating ministry:', err);
    res.status(500).json({ error: 'Failed to create ministry' });
  }
});

// UPDATE ministry
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order } = req.body;
  const ministryId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM ministries WHERE id = ?', [ministryId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Ministry not found' });

    await db.query(
      `UPDATE ministries SET 
        name = COALESCE(?, name),
        leader = COALESCE(?, leader),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        meeting_day = COALESCE(?, meeting_day),
        meeting_time = COALESCE(?, meeting_time),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [name, leader, email, phone, meeting_day, meeting_time, description, image_url, sort_order, ministryId]
    );

    res.json({ success: true, message: 'Ministry updated successfully' });
  } catch (err) {
    console.error('Error updating ministry:', err);
    res.status(500).json({ error: 'Failed to update ministry' });
  }
});

// DELETE ministry (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const ministryId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM ministries WHERE id = ?', [ministryId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Ministry not found' });

    await db.query('DELETE FROM ministries WHERE id = ?', [ministryId]);
    res.json({ success: true, message: 'Ministry deleted successfully' });
  } catch (err) {
    console.error('Error deleting ministry:', err);
    res.status(500).json({ error: 'Failed to delete ministry' });
  }
});

module.exports = router;