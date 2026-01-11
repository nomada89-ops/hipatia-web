const fs = require("fs");
const content = fs.readFileSync("../../app/LandingPage.tsx");
// Find "dise"
const index = content.indexOf("dise");
if (index !== -1) {
    const section = content.slice(index, index + 20);
    console.log("Text segment found: " + section.toString("binary")); // binary to see raw bytes as chars roughly
    console.log("Hex: " + section.toString("hex"));
}
const index2 = content.indexOf("eneraci");
if (index2 !== -1) {
    const section2 = content.slice(index2, index2 + 20);
    console.log("Text segment found: " + section2.toString("binary"));
    console.log("Hex: " + section2.toString("hex"));
}
