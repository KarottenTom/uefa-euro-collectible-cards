const { run, all } = require('./db');

const removeCoachesAndFlags = async () => {
  try {
    // Get cards to be deleted
    const cardsToDelete = await all("SELECT id FROM cards WHERE type IN ('coach', 'flag')");
    console.log(`Found ${cardsToDelete.length} coaches and flags to remove.`);

    // Delete from collections first (foreign key constraint)
    const cardIds = cardsToDelete.map(c => c.id);
    for (const cardId of cardIds) {
      await run('DELETE FROM collections WHERE cardId = ?', [cardId]);
    }

    // Delete from cards
    await run("DELETE FROM cards WHERE type IN ('coach', 'flag')");
    
    console.log('✓ Coaches and flags removed successfully!');
  } catch (error) {
    console.error('Error removing coaches and flags:', error);
    process.exit(1);
  }
};

(async () => {
  const { initDb } = require('./db');
  await initDb();
  await removeCoachesAndFlags();
  process.exit(0);
})();
