const Database = require('better-sqlite3');
const path = require('path');
const fetch = require('node-fetch');

const dbPath = path.join(__dirname, '..', 'solar.db');
const db = new Database(dbPath);

const OPEN_DTU_URL = 'http://rafaelus.zapto.org/api/livedata/status';

async function fetchData() {
    console.log(`Attempting to fetch from: ${OPEN_DTU_URL}`);
    try {
        const response = await fetch(OPEN_DTU_URL);
        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Extract relevant data points
        const total = data.total;
        const power = total['Power']; // Watts
        const yieldDay = total['YieldDay']; // Watt-hours
        const yieldTotal = total['YieldTotal']; // Kilowatt-hours

        const inverterKey = Object.keys(data.inverters)[0];
        const inverter = data.inverters[inverterKey];
        const gridVoltage = inverter.AC[0].Voltage;
        const gridFrequency = inverter.AC[0].Frequency;

        console.log(`Fetched Data: Power=${power.v}W, YieldDay=${yieldDay.v}Wh, Voltage=${gridVoltage.v}V`);

        const stmt = db.prepare(`
      INSERT INTO readings (power_watts, grid_voltage, grid_frequency, day_yield_wh, total_yield_kwh)
      VALUES (?, ?, ?, ?, ?)
    `);

        stmt.run(power.v, gridVoltage.v, gridFrequency.v, yieldDay.v, yieldTotal.v);

        updateDailyStats(yieldDay.v, power.v);

        console.log('Database updated successfully.');

    } catch (error) {
        if (error.code) console.error('Error Code:', error.code);
        if (error.message) console.error('Error Message:', error.message);
        console.error('Full Error:', error);
    }
}

function updateDailyStats(currentYieldWh, currentPowerW) {
    const today = new Date().toISOString().split('T')[0];

    const getDay = db.prepare('SELECT * FROM daily_stats WHERE date = ?');
    const existing = getDay.get(today);

    if (existing) {
        const newPeak = Math.max(existing.peak_power_watts, currentPowerW);
        const update = db.prepare(`
            UPDATE daily_stats 
            SET total_yield_wh = ?, peak_power_watts = ?, last_updated = CURRENT_TIMESTAMP
            WHERE date = ?
        `);
        update.run(currentYieldWh, newPeak, today);
    } else {
        const insert = db.prepare(`
            INSERT INTO daily_stats (date, total_yield_wh, peak_power_watts)
            VALUES (?, ?, ?)
        `);
        insert.run(today, currentYieldWh, currentPowerW);
    }
}

fetchData();
