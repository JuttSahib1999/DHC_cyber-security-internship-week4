// routes/authRoutes.js
// Week 4: Signup + Login (rate limited, bcrypt, JWT)
// Week 5: Prepared statements — no SQL injection possible

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const validator = require('validator');
const { loginLimiter } = require('../middleware/rateLimiter');
const { findByEmail, createUser, logAction } = require('../config/database');
const { logger, securityLogger } = require('../config/logger');

// POST /auth/signup
router.post('/signup', async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required.' });
  if (!validator.isEmail(email))
    return res.status(400).json({ error: 'Invalid email format.' });
  if (!validator.isStrongPassword(password, { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }))
    return res.status(400).json({ error: 'Weak password. Need: 8+ chars, uppercase, number, symbol (e.g. Admin@2026)' });

  email = validator.normalizeEmail(email);
  try {
    if (await findByEmail(email))
      return res.status(409).json({ error: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 12);
    const { id } = await createUser(email, hash);
    await logAction(id, 'SIGNUP', req.ip);
    logger.info('USER_REGISTERED', { id, email });
    res.status(201).json({ message: 'Account created! You can now login.' });
  } catch (err) {
    logger.error('SIGNUP_ERROR', { error: err.message });
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /auth/login  (rate limited: 5 attempts / 15 min)
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required.' });
  try {
    const user = await findByEmail(email);
    if (!user) {
      securityLogger.warn('LOGIN_FAIL_NO_USER', { ip: req.ip, email });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!await bcrypt.compare(password, user.password)) {
      securityLogger.warn('LOGIN_FAIL_WRONG_PW', { ip: req.ip, email });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    await logAction(user.id, 'LOGIN', req.ip);
    logger.info('LOGIN_SUCCESS', { userId: user.id, email });
    res.json({ message: 'Login successful!', token, expiresIn: '1h', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('LOGIN_ERROR', { error: err.message });
    res.status(500).json({ error: 'Login failed.' });
  }
});

module.exports = router;
