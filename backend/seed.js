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

async function seedDatabase() {
  await seedAdmin();
  await seedCards();
}

module.exports = seedDatabase;
