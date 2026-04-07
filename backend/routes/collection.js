const express = require('express');
const { all, get, run } = require('../db');
const { requireAuth } = require('../auth');
const router = express.Router();

const chooseRandom = (items, count) => {
  const selected = [];
  const pool = [...items];
  while (selected.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
};

router.get('/user/collection', requireAuth, async (req, res, next) => {
  try {
    const collection = await all(
      `SELECT c.cardId, c.variant, c.count, cards.name, cards.nation, cards.position, cards.type, cards.normalImage, cards.glitterImage
       FROM collections c
       JOIN cards ON cards.id = c.cardId
       WHERE c.userId = ?
       ORDER BY cards.type, cards.nation, cards.name`,
      [req.user.id]
    );
    res.json({ collection });
  } catch (error) {
    next(error);
  }
});

router.post('/user/addCard', requireAuth, async (req, res, next) => {
  try {
    const { cardId, variant } = req.body;
    const card = await get('SELECT id FROM cards WHERE id = ?', [cardId]);
    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    const existing = await get('SELECT id, count FROM collections WHERE userId = ? AND cardId = ? AND variant = ?', [req.user.id, cardId, variant]);
    if (existing) {
      await run('UPDATE collections SET count = ? WHERE id = ?', [existing.count + 1, existing.id]);
    } else {
      await run('INSERT INTO collections (userId, cardId, variant, count) VALUES (?, ?, ?, 1)', [req.user.id, cardId, variant]);
    }

    res.json({ message: 'Card added to your collection.' });
  } catch (error) {
    next(error);
  }
});

router.post('/user/openPack', requireAuth, async (req, res, next) => {
  try {
    const cards = await all('SELECT * FROM cards');
    if (cards.length === 0) {
      return res.status(400).json({ error: 'No cards available.' });
    }

    // Get shiny percentage from settings, default to 20%
    const setting = await get('SELECT value FROM settings WHERE key = ?', ['shinyPercentage']);
    const shinyPercentage = setting ? Number.parseInt(setting.value) : 20;
    const shinyChance = shinyPercentage / 100;

    const packCards = chooseRandom(cards, 5).map((card) => {
      const glitter = Math.random() < shinyChance ? 'glitter' : 'normal';
      return { ...card, variant: glitter, newlyAdded: true };
    });

    for (const packCard of packCards) {
      const existing = await get('SELECT id, count FROM collections WHERE userId = ? AND cardId = ? AND variant = ?', [req.user.id, packCard.id, packCard.variant]);
      if (existing) {
        await run('UPDATE collections SET count = ? WHERE id = ?', [existing.count + 1, existing.id]);
      } else {
        await run('INSERT INTO collections (userId, cardId, variant, count) VALUES (?, ?, ?, 1)', [req.user.id, packCard.id, packCard.variant]);
      }
    }

    res.json({ pack: packCards });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
