const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'solar.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Creating database at:', dbPath);

// Create readings table for 5-minute intervals
// Stores detailed data: power, voltage, yield, etc.
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    power_watts REAL,
    grid_voltage REAL,
    grid_frequency REAL,
    day_yield_wh REAL,
    total_yield_kwh REAL
  )
`);

// Create daily_stats table
// Aggregated stats per day for faster historical queries
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_stats (
    date TEXT PRIMARY KEY,
    total_yield_wh REAL,
    peak_power_watts REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Database tables setup successfully.');
db.close();
