const fs = require('fs');
const path = require('path');

const xmlPath = path.resolve(__dirname, '../../HorariosNextGen/ExportacionHorarios-45010387-2026-01-28-16-35-31.xml');
const content = fs.readFileSync(xmlPath, 'latin1');
const lines = content.split(/\r?\n/);

// Target ranges based on previous output
const ranges = [
    { start: 3040, end: 3060 }, // Religion
    { start: 6010, end: 6030 }  // Atencion Task
];

ranges.forEach(r => {
    console.log(`\n--- Range ${r.start}-${r.end} ---`);
    for (let i = r.start; i < r.end; i++) {
        if (lines[i]) console.log(`${i + 1}: ${lines[i].trim()}`);
    }
});
