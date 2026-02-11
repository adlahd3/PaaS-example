import Database from 'better-sqlite3';

const db = new Database('db.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS funcs (
        id uuid PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP
    )
`);