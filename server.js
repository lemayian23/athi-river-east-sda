// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads (placeholder for now)
app.use('/uploads', express.static('uploads'));

// ========================
// ROUTES
// ========================

// 1. Authentication routes (login, change password)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 2. Sermon routes (CRUD)
const sermonRoutes = require('./routes/sermons');
app.use('/api/sermons', sermonRoutes);

// 3. Event routes
const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

// 4. Public health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth/login`);
  console.log(`   Sermons: http://localhost:${PORT}/api/sermons`);
});