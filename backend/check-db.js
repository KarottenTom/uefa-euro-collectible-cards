const db = require('./db');

(async () => {
  await db.initDb();
  
  const nonPlayers = await db.all("SELECT id, name, nation, type FROM cards WHERE type IN ('coach', 'flag') ORDER BY id");
  console.log('\nNon-player cards in DB:');
  nonPlayers.forEach(c => console.log(`  ${c.id}: ${c.name} (${c.nation}, ${c.type})`));
  
  const germany = await db.all("SELECT id, name, nation FROM cards WHERE nation = 'Germany' AND type = 'player'");
  console.log(`\nGermany players in DB: ${germany.length}`);
  
  const duplicateNames = await db.all(`
    SELECT name, nation, type, COUNT(*) as count 
    FROM cards 
    WHERE type IN ('coach', 'flag')
    GROUP BY name, nation, type
    HAVING count > 1
  `);
  
  if (duplicateNames.length > 0) {
    console.log('\nDuplicates found:');
    duplicateNames.forEach(d => console.log(`  ${d.name} (${d.nation}, ${d.type}): ${d.count}x`));
  } else {
    console.log('\nNo duplicates found in coaches/flags');
  }
  
  process.exit(0);
})();
