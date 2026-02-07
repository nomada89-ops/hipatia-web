const fs = require('fs');
const path = require('path');

const xmlPath = path.resolve(__dirname, '../../HorariosNextGen/ExportacionHorarios-45010387-2026-01-28-16-35-31.xml');
const content = fs.readFileSync(xmlPath, 'latin1');
const match = content.match(/seq="([^"]+)"/g);
const unique = [...new Set(match)];
console.log(unique);
