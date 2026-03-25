// server.js
// DHC Cybersecurity Internship — Week 4
// Author: Abdul Muqeet Tabraiz
// Builds on Week 1-3 foundation with advanced security

require('dotenv').config();
const express = require('express');
const path    = require('path');

const { logger, securityLogger }              = require('./config/logger');
const securityHeaders                         = require('./middleware/securityHeaders');
const { corsMiddleware, corsErrorHandler }    = require('./middleware/corsConfig');
const { globalLimiter }                       = require('./middleware/rateLimiter');
const authRoutes                              = require('./routes/authRoutes');
const apiRoutes                               = require('./routes/apiRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ════════════════════════════════════════════
// MIDDLEWARE (Order matters!)
// ════════════════════════════════════════════
app.use(securityHeaders);                              // 1. Helmet CSP + HSTS
app.use(corsMiddleware);                               // 2. CORS whitelist
app.use(express.json({ limit: '10kb' }));              // 3. JSON body parser (with size limit)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(globalLimiter);                                // 4. Global rate limit
app.use(express.static(path.join(__dirname, 'public')));  // 5. Static files

// Request logger
app.use((req, res, next) => {
  logger.info('REQUEST', { method: req.method, path: req.path, ip: req.ip });
  next();
});

// ════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════
app.use('/auth', authRoutes);
app.use('/api',  apiRoutes);

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ════════════════════════════════════════════
// ERROR HANDLERS
// ════════════════════════════════════════════
app.use(corsErrorHandler);

app.use((req, res) => {
  res.status(404).json({ status: 404, error: 'Not Found', message: `${req.method} ${req.path} not found.` });
});

app.use((err, req, res, next) => {
  securityLogger.error('SERVER_ERROR', { message: err.message, ip: req.ip });
  res.status(500).json({ status: 500, error: 'Internal Server Error' });
});

// ════════════════════════════════════════════
// START
// ════════════════════════════════════════════
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DHC Cybersecurity Internship | Week 4 Server');
  console.log('  Author  : Abdul Muqeet Tabraiz');
  console.log(`  Server  : http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Week 4 Security Features Active:');
  console.log('  ✅  Rate Limiting    (express-rate-limit)');
  console.log('  ✅  CORS Policy      (cors)');
  console.log('  ✅  API Key Auth     (custom middleware)');
  console.log('  ✅  JWT Auth         (jsonwebtoken)');
  console.log('  ✅  CSP Headers      (helmet)');
  console.log('  ✅  HSTS             (helmet)');
  console.log('  ✅  Security Logging (winston)');
  console.log('');
  console.log('  Available Endpoints:');
  console.log('  POST  /auth/signup          → Register new user');
  console.log('  POST  /auth/login           → Login (rate limited: 5/15min)');
  console.log('  GET   /api/health           → Server health check');
  console.log('  GET   /api/headers-check    → View security headers');
  console.log('  GET   /api/profile          → JWT protected');
  console.log('  GET   /api/data             → API Key protected');
  console.log('  GET   /api/admin            → API Key + JWT + Admin');
  console.log('');
  console.log('  Default admin: admin@dhc.com / Admin@2026');
  console.log('  API Key:       dhc-apikey-admin-001');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  logger.info('Server started', { port: PORT });
});

module.exports = app;
