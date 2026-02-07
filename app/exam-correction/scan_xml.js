const fs = require('fs');
const path = require('path');

// Target file is in sibling directory HorariosNextGen
const xmlPath = path.resolve(__dirname, '../../HorariosNextGen/ExportacionHorarios-45010387-2026-01-28-16-35-31.xml');

if (!fs.existsSync(xmlPath)) {
    console.error('File not found:', xmlPath);
    process.exit(1);
}

const content = fs.readFileSync(xmlPath, 'latin1'); // Use latin1 for ISO-8859-1 coverage
const lines = content.split(/\r?\n/);

console.log('Searching for "Relig" or "Atenc"...');

lines.forEach((line, index) => {
    if (line.match(/Relig/i) || line.match(/Atenc/i)) {
        // Print context: 5 lines before and 5 after
        const start = Math.max(0, index - 5);
        const end = Math.min(lines.length, index + 5);
        console.log(`\n--- Match at line ${index + 1} ---`);
        for (let i = start; i < end; i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
});
