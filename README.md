# UEFA Euro 2024 Collectible Cards

A public collectible card website built with a React frontend and Node.js + Express backend. The app is designed around the UEFA Euro 2024 players dataset and includes user registration, admin approval, JWT authentication, card collections, and animated pack opening.

## Features
- Email/password registration with admin approval before login
- JWT-secured API access
- Collect official Euro 2024 player, coach, and flag cards
- Normal + glitter variants with shimmer animation
- Full card catalog, collection view, card detail, and pack opening
- Admin management panel for approving/denying new users
- SQLite database for easy local deployment

## Setup

### 1. Install dependencies

```bash
cd uefa-euro-collectible-cards/backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend

Copy the example environment file:

```bash
cd backend
copy .env.example .env
```

Adjust `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` if desired.

### 3. Start backend and frontend

```bash
cd backend
npm start
```

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` and backend on `http://localhost:4000`.

## Dataset integration

The repository includes a sample player dataset for the starter experience. To use the official Kaggle UEFA Euro 2024 players dataset:

1. Download the dataset from Kaggle:
   - `https://www.kaggle.com/datasets/damirdizdarevic/uefa-euro-2024-players/data`
2. Place the CSV file in `backend/data/euro2024_players.csv`.
3. Run the import script to convert rows into card entries:
   ```bash
   node backend/scripts/import_players.js backend/data/euro2024_players.csv > backend/data/cards.json
   ```
4. Review `backend/data/cards.json` to add official image URLs for each player.

> Note: official image URLs must come from UEFA, Wikimedia/Wikipedia, or sanctioned sources. The sample dataset already includes several official player, coach, and flag URLs.

## Admin login

A default admin account is seeded on first backend start using values from `.env`.

- Email: `admin@eurocards.local`
- Password: `Admin2024!`

Use the admin account to approve new user registrations.

## Local development notes

- `backend/server.js` hosts all API endpoints under `/api`
- `frontend/src` contains the React app and pages
- `backend/data/cards.json` contains the sample collectible cards

## Next steps

- Add the full Kaggle dataset to `backend/data/euro2024_players.csv`
- Extend `backend/data/cards.json` with official image URLs for all players
- Optionally deploy the backend to Vercel, Render, or Fly.io and the frontend to Netlify or Vercel
