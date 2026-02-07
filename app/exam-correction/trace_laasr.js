const fs = require('fs');
const path = require('path');

const xmlPath = path.resolve(__dirname, '../../HorariosNextGen/ExportacionHorarios-45010387-2026-01-28-16-35-31.xml');
const content = fs.readFileSync(xmlPath, 'latin1');
const lines = content.split(/\r?\n/);

console.log('Searching for "LAASR" references...');

lines.forEach((line, index) => {
    if (line.includes('LAASR')) {
        console.log(`\n--- Match at line ${index + 1} ---`);
        const start = Math.max(0, index - 2);
        const end = Math.min(lines.length, index + 5);
        for (let i = start; i < end; i++) {
            console.log(`${i + 1}: ${lines[i].trim()}`);
        }
    }
});
