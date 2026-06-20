// routes/settings.js
const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// ========================
// PUBLIC ROUTES (No auth)
// ========================

// GET all public settings (for the website)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT \`key\`, \`value\` FROM settings 
       WHERE \`key\` IN (
         'church_name', 'church_address', 'church_phone', 'church_email',
         'sabbath_school_time', 'divine_service_time', 'vespers_time', 'ay_time',
         'welcome_message', 'paybill_number', 'paybill_account'
       )`
    );
    
    // Convert to key-value object
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  } catch (err) {
    console.error('Error fetching public settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET single setting by key (public)
router.get('/public/:key', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT `value` FROM settings WHERE `key` = ?', [req.params.key]);
    if (rows.length === 0) return res.status(404).json({ error: 'Setting not found' });
    res.json({ key: req.params.key, value: rows[0].value });
  } catch (err) {
    console.error('Error fetching setting:', err);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// ========================
// PROTECTED ROUTES (Admin only)
// ========================

// GET all settings (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.\`key\`, s.\`value\`, s.updated_at, u.username as updated_by_name
       FROM settings s
       LEFT JOIN users u ON s.updated_by = u.id
       ORDER BY s.\`key\``
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE a setting (admin only)
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
  const settingKey = req.params.key;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const [existing] = await db.query('SELECT `key` FROM settings WHERE `key` = ?', [settingKey]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    await db.query(
      'UPDATE settings SET `value` = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE `key` = ?',
      [value, req.user.id, settingKey]
    );

    res.json({
      success: true,
      message: `Setting "${settingKey}" updated successfully`
    });
  } catch (err) {
    console.error('Error updating setting:', err);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// BULK UPDATE multiple settings (admin only)
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  const settings = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Settings object is required' });
  }

  try {
    const updates = Object.keys(settings).map(key => {
      return db.query(
        'UPDATE settings SET `value` = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE `key` = ?',
        [settings[key], req.user.id, key]
      );
    });

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      updated: Object.keys(settings)
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;