// routes/events.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// ========================
// PUBLIC ROUTES (No auth)
// ========================

// GET all events
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
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// GET upcoming events (next 30 days)
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, description, event_date, location 
       FROM events 
       WHERE event_date >= CURDATE() 
       ORDER BY event_date ASC 
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// ========================
// PROTECTED ROUTES (Auth required)
// ========================

// CREATE event
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, event_date, end_date, location, is_recurring, recurrence_rule, image_url } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event date are required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO events 
       (title, description, event_date, end_date, location, is_recurring, recurrence_rule, image_url, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, end_date, location, is_recurring || 0, recurrence_rule, image_url, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// UPDATE event
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, event_date, end_date, location, is_recurring, recurrence_rule, image_url } = req.body;
  const eventId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Event not found' });

    await db.query(
      `UPDATE events SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        event_date = COALESCE(?, event_date),
        end_date = COALESCE(?, end_date),
        location = COALESCE(?, location),
        is_recurring = COALESCE(?, is_recurring),
        recurrence_rule = COALESCE(?, recurrence_rule),
        image_url = COALESCE(?, image_url)
      WHERE id = ?`,
      [title, description, event_date, end_date, location, is_recurring, recurrence_rule, image_url, eventId]
    );

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const eventId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Event not found' });

    await db.query('DELETE FROM events WHERE id = ?', [eventId]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;