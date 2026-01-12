const fs = require("fs");
const filePath = "../MainForm.tsx";
let content = fs.readFileSync(filePath, "utf8");

const wrongLogic = "formData.append('id_grupo', (idGrupo || 'SIN_GRUPO').trim());";
const correctLogic = "formData.append('id_grupo', (isGroupMode && idGrupo ? idGrupo.trim() : 'SIN_GRUPO'));";

if (content.includes(wrongLogic)) {
    content = content.replace(wrongLogic, correctLogic);
    console.log("Fixed handleSubmit logic to respect isGroupMode.");
    fs.writeFileSync(filePath, content, "utf8");
} else if (content.includes(correctLogic)) {
    console.log("Logic is already correct.");
} else {
    // Maybe whitespace diff?
    console.log("Could not match logic string exactly. Checking regex...");
    const regex = /formData\.append\('id_grupo',\s*\(idGrupo \|\| 'SIN_GRUPO'\)\.trim\(\)\);/;
    if (regex.test(content)) {
        content = content.replace(regex, correctLogic);
        console.log("Fixed handleSubmit logic (via regex).");
        fs.writeFileSync(filePath, content, "utf8");
    } else {
        console.log("Logic not found or format differs.");
    }
}
