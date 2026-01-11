const fs = require("fs");
const path = require("path");

const root = "../../app";

// Recursive function to get all .tsx/.ts files
function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = `${dir}/${file}`;
        if (fs.statSync(name).isDirectory()) {
            if (file !== "node_modules" && file !== ".next") {
                getFiles(name, files);
            }
        } else {
            if (name.endsWith(".tsx") || name.endsWith(".ts")) {
                files.push(name);
            }
        }
    }
    return files;
}

const files = getFiles(root);

const replacements = [
    // The "é" + char pattern (Where C3 became é)
    { from: /\u00e9\u00b1/g, to: "ñ" }, // é -> ñ
    { from: /\u00e9\u00b3/g, to: "ó" }, // é -> ó
    { from: /\u00e9\u00a1/g, to: "á" }, // é¡ -> á
    { from: /\u00e9\u00a9/g, to: "é" }, // é -> é
    { from: /\u00e9\u00ba/g, to: "ú" }, // éº -> ú
    { from: /\u00e9\u00ad/g, to: "í" }, // é + SHY -> í
    
    // Also cover the standard Mojibake "Ã" pattern just in case
    { from: /\u00c3\u00b1/g, to: "ñ" }, // Ã -> ñ
    { from: /\u00c3\u00b3/g, to: "ó" }, // Ã -> ó
    { from: /\u00c3\u00a1/g, to: "á" }, // Ã¡ -> á
    { from: /\u00c3\u00a9/g, to: "é" }, // Ã -> é
    { from: /\u00c3\u00ba/g, to: "ú" }, // Ãº -> ú
    { from: /\u00c3\u00ad/g, to: "í" }, // Ã + SHY -> í (if simple replace fails)
    
    // Uppercase vowels (C3 8x)
    // Á (C3 81). 81 is not a printed 1252 char. It might be dropped or control.
    // É (C3 89). 89 is  (per mill) in 1252. é -> É
    { from: /\u00e9\u2030/g, to: "É" },
    // Í (C3 8D). 8D is undefined/control.
    // Ó (C3 93). 93 is  (left double quote). é -> Ó
    { from: /\u00e9\u201c/g, to: "Ó" },
    // Ú (C3 9A). 9A is š (s caron). éš -> Ú
    { from: /\u00e9\u0161/g, to: "Ú" },
    // Ñ (C3 91). 91 is  (left single quote). é -> Ñ
    { from: /\u00e9\u2018/g, to: "Ñ" }
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, "utf8");
    let original = content;
    
    replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Fixed encoding in: ${filePath}`);
    }
});
