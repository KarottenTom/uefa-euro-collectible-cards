const db = require('./db');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  await db.initDb();
  
  // Delete all current cards
  await db.run('DELETE FROM cards');
  console.log('Cleared all cards from database');
  
  // Reload from fresh JSON
  const cardsPath = path.join(__dirname, 'data', 'cards.json');
  const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  
  // Remove duplicates from cardsData (keep first occurrence only)
  const seen = new Set();
  const uniqueCards = cardsData.filter(card => {
    const key = `${card.name}-${card.nation}-${card.type}`;
    if (seen.has(key)) {
      console.log(`Skipping duplicate: ${card.name}`);
      return false;
    }
    seen.add(key);
    return true;
  });
  
  console.log(`Seeding ${uniqueCards.length} unique cards...`);
  
  for (const card of uniqueCards) {
    await db.run(
      'INSERT INTO cards (id, name, nation, position, type, team, normalImage, glitterImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [card.id, card.name, card.nation, card.position || '', card.type, card.team || '', card.normalImage, card.glitterImage]
    );
  }
  
  // Verify
  const germany = await db.all("SELECT id, name FROM cards WHERE nation = 'Germany' AND type = 'player'");
  const total = await db.all("SELECT COUNT(*) as count FROM cards");
  
  console.log(`\nGermany players: ${germany.length}`);
  console.log(`Total cards: ${total[0].count}`);
  
  process.exit(0);
})();
