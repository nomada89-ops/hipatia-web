const fs = require("fs");
const content = fs.readFileSync("../../app/LandingPage.tsx", "utf8");
// Check for "deseñado" or "diseñado"
const index = content.indexOf("diseñado");
const index2 = content.indexOf("diseéado");
if (index !== -1) console.log("SUCCESS: Found 'diseñado'");
if (index2 !== -1) console.log("FAILURE: Found 'diseéado'");
