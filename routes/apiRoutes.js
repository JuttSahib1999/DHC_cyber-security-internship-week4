// routes/apiRoutes.js
// Week 4: Protected API endpoints

const router = require('express').Router();
const { apiLimiter } = require('../middleware/rateLimiter');
const { apiKeyAuth, jwtAuth, fullAuth } = require('../middleware/auth');
const { findById, getAuditLog } = require('../config/database');
const { logger } = require('../config/logger');

// GET /api/health  — Public
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'DHC Cybersecurity Week 4',
    author: 'Abdul Muqeet Tabraiz',
    time: new Date().toISOString(),
    securityActive: {
      rateLimiting: true,
      cors: true,
      helmet_csp: true,
      hsts: true,
      apiKeyAuth: true,
      jwtAuth: true,
      winstonLogging: true
    }
  });
});

// GET /api/headers-check  — Public (shows what security headers are set)
router.get('/headers-check', (req, res) => {
  res.json({
    message: 'Open Postman or DevTools → Network → Headers tab to see:',
    expectedHeaders: {
      'Content-Security-Policy': "default-src 'self' ...",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
});

// GET /api/profile  — JWT Protected
router.get('/profile', apiLimiter, jwtAuth, async (req, res) => {
  try {
    const user = await findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    logger.info('PROFILE_ACCESS', { userId: user.id });
    res.json({ message: 'Profile retrieved', user, protectedBy: 'JWT Authentication' });
  } catch (err) {
    res.status(500).json({ error: 'Could not get profile.' });
  }
});

// GET /api/data  — API Key Protected
router.get('/data', apiLimiter, apiKeyAuth, (req, res) => {
  res.json({
    message: 'Sensitive data — API Key verified',
    records: [
      { id: 1, entry: 'Security log: Rate limiting active' },
      { id: 2, entry: 'Security log: CORS enforced' },
      { id: 3, entry: 'Security log: CSP headers enabled' }
    ],
    protectedBy: 'API Key Authentication'
  });
});

// GET /api/admin  — API Key + JWT + Admin role
router.get('/admin', apiLimiter, ...fullAuth, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin role required.' });
  try {
    const logs = await getAuditLog();
    res.json({ message: 'Admin access granted', user: req.user, auditLog: logs, protectedBy: 'API Key + JWT + Admin Role' });
  } catch (err) {
    res.status(500).json({ error: 'Could not load admin data.' });
  }
});

module.exports = router;
