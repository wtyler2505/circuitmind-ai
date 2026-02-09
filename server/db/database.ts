import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'circuitmind.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for concurrent reads during writes
db.pragma('journal_mode = WAL');
// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

// Run schema migrations on startup
const schema = readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

console.log(`Database initialized at ${DB_PATH}`);

export function close(): void {
  db.close();
  console.log('Database connection closed');
}

export default db;
