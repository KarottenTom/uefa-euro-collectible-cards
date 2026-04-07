const express = require('express');
const bcrypt = require('bcrypt');
const { run, get } = require('../db');
const { requireAuth, signToken } = require('../auth');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required.' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await run(
      'INSERT INTO users (email, username, passwordHash, approved, admin, createdAt) VALUES (?, ?, ?, 0, 0, datetime("now"))',
      [email, username, passwordHash]
    );

    res.json({ message: 'Registration successful. Your account will be approved by an admin before login.' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.approved) {
      return res.status(401).json({ error: 'Account pending approval by admin.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, admin: Boolean(user.admin) } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await get('SELECT id, email, username, approved, admin FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
