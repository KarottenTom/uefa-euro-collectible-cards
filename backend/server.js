const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const collectionRoutes = require('./routes/collection');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Allow all origins for Vercel deployment
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://uefa-euro-collectible-cards.vercel.app',
    frontendUrl
  ], 
  credentials: true 
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', cardRoutes);
app.use('/api', collectionRoutes);
app.use('/api', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UEFA Euro 2024 collectible backend is running.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

(async () => {
  await initDb();
  await require('./seed')();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend listening on http://0.0.0.0:${port}`);
  });
})();
