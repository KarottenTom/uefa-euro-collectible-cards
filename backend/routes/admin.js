const express = require('express');
const { all, get, run } = require('../db');
const { requireAdmin } = require('../auth');
const router = express.Router();

router.get('/admin/pending', requireAdmin, async (req, res, next) => {
  try {
    const pending = await all('SELECT id, email, username, createdAt FROM users WHERE approved = 0');
    res.json({ pending });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/approve', requireAdmin, async (req, res, next) => {
  try {
    const { userId, approve } = req.body;
    if (typeof userId !== 'number') {
      return res.status(400).json({ error: 'userId must be a number.' });
    }

    const user = await get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (approve) {
      await run('UPDATE users SET approved = 1 WHERE id = ?', [userId]);
      return res.json({ message: 'User approved.' });
    }

    await run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User denied and removed.' });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/stats', requireAdmin, async (req, res, next) => {
  try {
    const totalUsers = await get('SELECT COUNT(*) as count FROM users');
    const totalCards = await get('SELECT COUNT(*) as count FROM cards');
    const totalCollections = await get('SELECT COUNT(*) as count FROM collections');
    const approvedUsers = await get('SELECT COUNT(*) as count FROM users WHERE approved = 1');
    
    res.json({
      totalUsers: totalUsers.count,
      approvedUsers: approvedUsers.count,
      totalCards: totalCards.count,
      totalCollections: totalCollections.count
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/clearCollection/:userId', requireAdmin, async (req, res, next) => {
  try {
    const userId = Number.parseInt(req.params.userId);
    const user = await get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await run('DELETE FROM collections WHERE userId = ?', [userId]);
    res.json({ message: 'User collection cleared successfully.' });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/users', requireAdmin, async (req, res, next) => {
  try {
    const users = await all('SELECT id, username, email, approved, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
