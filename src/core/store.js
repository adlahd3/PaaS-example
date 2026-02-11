import Database from 'better-sqlite3';
import fs from 'fs';

const store = new Database('db.db');

export const createFunc = (name, code) => {
    const id = crypto.randomUUID();
    // code shall be inserted to database.
        const stmt = store.prepare(`
        INSERT INTO funcs (id, name, code) VALUES (?, ?, ?)
    RETURNING id`);
    stmt.run(id, name, code);
    // same code shall be stored as file .js in functions folder.
    fs.writeFileSync(`src/functions/${name}.cjs`, code);
    return id;
}