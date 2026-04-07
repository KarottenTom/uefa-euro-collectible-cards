const express = require('express');
const { all, get } = require('../db');
const { requireAuth } = require('../auth');
const router = express.Router();

router.get('/cards', requireAuth, async (req, res, next) => {
  try {
    const cards = await all('SELECT * FROM cards ORDER BY type, nation, name');
    res.json({ cards });
  } catch (error) {
    next(error);
  }
});

router.get('/cards/:id', requireAuth, async (req, res, next) => {
  try {
    const card = await get('SELECT * FROM cards WHERE id = ?', [req.params.id]);
    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }
    res.json({ card });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
