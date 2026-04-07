const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');

dotenv.config();

const dbFile = path.resolve(process.env.DATABASE_FILE || './database.sqlite');
const dbDir = path.dirname(dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbFile);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

const initDb = async () => {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    admin INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    nation TEXT NOT NULL,
    position TEXT,
    type TEXT NOT NULL,
    team TEXT,
    normalImage TEXT NOT NULL,
    glitterImage TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    cardId INTEGER NOT NULL,
    variant TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    UNIQUE(userId, cardId, variant),
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(cardId) REFERENCES cards(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);
};

module.exports = { db, run, get, all, initDb };
