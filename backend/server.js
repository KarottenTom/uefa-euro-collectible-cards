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
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Add response headers for API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
  try {
    console.log('Initializing database...');
    await initDb();
    console.log('Database initialized');
    
    console.log('Running seed...');
    await require('./seed')();
    console.log('Seed completed');
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`Backend listening on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
})();
