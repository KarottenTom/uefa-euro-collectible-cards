const fs = require('node:fs');
const path = require('node:path');
const { initDb, run, all } = require('./db');

const cardsPath = path.join(__dirname, 'data', 'cards.json');

(async () => {
  console.log('Initializing database...');
  await initDb();
  
  console.log('Cards path exists:', fs.existsSync(cardsPath));
  
  const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  console.log('Total cards in JSON:', cardsData.length);
  
  console.log('Inserting cards...');
  let inserted = 0;
  for (const card of cardsData) {
    try {
      await run(
        'INSERT INTO cards (id, name, nation, position, type, team, normalImage, glitterImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [card.id, card.name, card.nation, card.position || '', card.type, card.team || '', card.normalImage, card.glitterImage]
      );
      inserted++;
    } catch (err) {
      console.error('Error inserting card:', card.id, err.message);
    }
  }
  
  console.log('Inserted:', inserted, 'cards');
  
  const result = await all('SELECT COUNT(*) as count FROM cards');
  console.log('Total in DB:', result[0].count);
  
  process.exit(0);
})();
