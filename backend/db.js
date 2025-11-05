import Database from 'better-sqlite3';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Determine database file; default to a local file
const dbFile = process.env.DB_FILE || './data.sqlite';

// Initialize database connection
const db = new Database(dbFile);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT '',
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
