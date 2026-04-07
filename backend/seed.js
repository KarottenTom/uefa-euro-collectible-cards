const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcrypt');
const { get, run, all } = require('./db');
const dotenv = require('dotenv');

dotenv.config();

const cardsPath = path.join(__dirname, 'data', 'cards.json');

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eurocards.local';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required for seeding. Set it in your .env file.');
  }
  const existingAdmin = await get('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await run(
      'INSERT INTO users (email, username, passwordHash, approved, admin, createdAt) VALUES (?, ?, ?, 1, 1, datetime("now"))',
      [adminEmail, 'admin', passwordHash]
    );
    console.log(`Seeded admin account: ${adminEmail}`);
  }
};

const seedCards = async () => {
  const existing = await all('SELECT id FROM cards LIMIT 1');
  if (existing.length > 0) {
    return;
  }

  if (!fs.existsSync(cardsPath)) {
    console.warn('cards.json not found. Please add backend/data/cards.json or import the Kaggle dataset.');
    return;
  }

  const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  for (const card of cardsData) {
    await run(
      'INSERT INTO cards (id, name, nation, position, type, team, normalImage, glitterImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [card.id, card.name, card.nation, card.position || '', card.type, card.team || '', card.normalImage, card.glitterImage]
    );
  }
  console.log(`Seeded ${cardsData.length} collectible cards.`);
};

const cleanupCoachesAndFlags = async () => {
  try {
    // Delete coaches and flags from collections first (foreign key constraint)
    await run('DELETE FROM collections WHERE cardId IN (SELECT id FROM cards WHERE type IN ("coach", "flag"))');
    
    // Delete coaches and flags from cards
    const deleted = await run('DELETE FROM cards WHERE type IN ("coach", "flag")');
    
    const coachesFlags = await all('SELECT COUNT(*) as count FROM cards WHERE type IN ("coach", "flag")');
    console.log('✓ Coaches and flags removed!');
  } catch (error) {
    console.error('Error removing coaches and flags:', error);
  }
};

const cleanupInvalidPlayers = async () => {
  try {
    // Remove Jakub Kaluzinski (ID 326) - was not on Poland official squad
    await run('DELETE FROM collections WHERE cardId = 326');
    await run('DELETE FROM cards WHERE id = 326');
    console.log('✓ Invalid players removed!');
  } catch (error) {
    console.error('Error removing invalid players:', error);
  }
};

async function seedDatabase() {
  await seedAdmin();
  await seedCards();
  await cleanupCoachesAndFlags();
  await cleanupInvalidPlayers();
}

module.exports = seedDatabase;
