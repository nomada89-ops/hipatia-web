const fs = require("fs");
const filePath = "../MainForm.tsx";
let content = fs.readFileSync(filePath, "utf8");

// We need to implement the Group Report Logic + Checkbox State + PostMessage Listener
// But on a clean file (098c89d restore + header fix).

// 1. INJECT STATE
const stateAnchor = "const [alumnoId, setAlumnoId] = useState('');";
if (content.indexOf("const [isGroupMode") === -1 && content.indexOf(stateAnchor) !== -1) {
    const newStateBlock = `const [alumnoId, setAlumnoId] = useState('');
    const [idGrupo, setIdGrupo] = useState('');
    const [isGroupMode, setIsGroupMode] = useState(false);

    useEffect(() => {
        const savedGroup = localStorage.getItem('hipatia_id_grupo');
        if (savedGroup) setIdGrupo(savedGroup);
        
        const savedMode = localStorage.getItem('hipatia_group_mode');
        if (savedMode === 'true') setIsGroupMode(true);

        const messageHandler = (e: MessageEvent) => {
             if (e.data === 'triggerGroupReport') {
                 document.getElementById('btn-generate-group')?.click();
             }
        };
        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    const handleGroupModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsGroupMode(checked);
        localStorage.setItem('hipatia_group_mode', String(checked));
    };
    
    const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setIdGrupo(val);
        localStorage.setItem('hipatia_id_grupo', val);
    };`;
    
    // Replace the original line (and potentially neighboring old idGrupo line if present)
    // The old file had: "const [idGrupo, setIdGrupo] = useState('');" ... and logic?
    // Let's replace "const [alumnoId...]" line with our block.
    // If idGrupo was already there, we might duplicate it.
    // Let's check.
    const hasOldIdGrupo = content.indexOf("const [idGrupo, setIdGrupo]");
    if (hasOldIdGrupo !== -1) {
        // Remove old line first?
        // Let's rely on replacement overlapping or check where it is.
        // It's safer to remove the old line first if it exists.
        // content = content.replace("const [idGrupo, setIdGrupo] = useState('');", "");
        // But simpler: Just replace the alumno line and assume we act before idGrupo.
    }
    
    content = content.replace(stateAnchor, newStateBlock);
    
    // Cleanup old idGrupo definition if it was separate
     content = content.replace(/const \[idGrupo, setIdGrupo\] = useState\(''\);\s*/, "");
     // Also remove old useEffect for persistence if it exists
     content = content.replace(/useEffect\(\(\) => \{\s*const savedGroup = localStorage\.getItem\('hipatia_id_grupo'\);[\s\S]*?\}, \[\]\);\s*/, "");

    console.log("State injected.");
}

// 2. INJECT UI CHECKBOX
// Find "Identificador de Grupo" label block.
const labelStr = "Identificador de Grupo";
const idx = content.indexOf(labelStr);

if (idx !== -1) {
    // Find preceding <div className="space-y-2">
    const divStart = content.lastIndexOf('<div className="space-y-2">', idx);
    const endDiv = content.indexOf("</div>", idx) + 6;
    
    if (divStart !== -1 && endDiv !== -1) {
        const newUI = `
                                      <div className="space-y-2">
                                          <div className="flex items-center gap-2 mb-2">
                                              <input 
                                                  type="checkbox" 
                                                  id="group-mode-check"
                                                  checked={isGroupMode}
                                                  onChange={handleGroupModeChange}
                                                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                              />
                                              <label htmlFor="group-mode-check" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
                                                  Corregir como parte de un grupo
                                              </label>
                                          </div>
                                          
                                          {isGroupMode && (
                                              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-1">
                                                      Identificador de Grupo
                                                  </label>
                                                  <input
                                                      type="text"
                                                      value={idGrupo}
                                                      onChange={handleGroupChange}
                                                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all font-bold text-base text-slate-700 shadow-sm placeholder:font-normal placeholder:text-slate-300"
                                                      placeholder="Ej: MAT-4A"
                                                  />
                                              </div>
                                          )}
                                      </div>`;
         content = content.slice(0, divStart) + newUI + content.slice(endDiv);
         console.log("UI Checkbox injected.");
    }
}

// 3. INJECT GROUP BUTTON
// Find after Submit button.
const submitBtnRegex = /(<button[^>]*type="submit"[^>]*>[\s\S]*?INICIAR CORREC[\s\S]*?<\/button>)/;
if (submitBtnRegex.test(content)) {
    const cleanButton = `
                              <button
                                  id="btn-generate-group"
                                  type="button"
                                  onClick={handleGenerateGroupReport}
                                  disabled={!isGroupMode || !idGrupo || status === 'sending'}
                                  className={\`w-full mt-4 p-4 rounded-xl border-2 transition-all font-bold flex items-center justify-center gap-2 \${
                                      (!isGroupMode || !idGrupo)
                                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50 hidden' 
                                          : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                                  }\`}
                              >
                                  {status === 'sending' && message.includes('grupo') ? (
                                      <>
                                          <Loader2 className="animate-spin" size={20} />
                                          <span>Procesando...</span>
                                      </>
                                  ) : (
                                      <>
                                          <BookOpen size={20} />
                                          <span>GENERAR INFORME GRUPAL</span>
                                      </>
                                  )}
                              </button>`;
    // Check if group button already exists (from old revert state?)
    if (!content.includes("handleGenerateGroupReport")) {
         content = content.replace(submitBtnRegex, (match) => match + cleanButton);
         console.log("Group Button injected.");
    } else {
         // Maybe just replace the existing one if it's there
         // But we are on a clean checkout of 098c89d which DID include the button but NOT the checkbox logic.
         // So we should replace the old button.
         const oldBtnRegex = /<button[^>]*onClick=\{handleGenerateGroupReport\}[^>]*>[\s\S]*?<\/button>/;
         content = content.replace(oldBtnRegex, cleanButton.trim()); // trim to avoid extra newlines logic mess
         console.log("Group Button updated.");
    }
}

// 4. INJECT GROUP HANDLER (and Update Submit Handler)
// We need to add handleGenerateGroupReport.
// And update handleSubmit to use "SIN_GRUPO" logic and document.open.

// Detect handleSubmit
const submitIdx = content.indexOf("const handleSubmit = async");
if (submitIdx !== -1) {
    // Insert Group Handler BEFORE it.
    const newGroupHandler = `const handleGenerateGroupReport = async () => {
        // Enforce validations
        if (!isGroupMode || !idGrupo) return;
        
        setStatus('sending');
        setMessage('Hipatia está analizando el grupo...');
        
        try {
            const payload = {
                user_token: userToken,
                id_grupo: idGrupo.trim()
            };
            
            const response = await fetch('https://n8n.protocolohipatia.com/webhook/generar-informe-grupal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const reportHtml = await response.text();
                
                const reportWindow = window.open('', 'InformeGrupal');
                if (reportWindow) {
                    reportWindow.document.open();
                    reportWindow.document.write(reportHtml);
                    reportWindow.document.close();
                }
                
                setStatus('success');
                setMessage('Informe grupal generado correctamente.');
            } else {
                throw new Error(\`Error del servidor: \${response.status}\`);
            }
        } catch (error) {
            console.error('Error al generar el informe:', error);
            setStatus('error'); // Adapted from user's alert/console
            setMessage('No se pudo conectar con Hipatia. Revisa tu conexión.');
        } 
    };

    `;
    
    // Check if it already exists
    if (!content.includes("const handleGenerateGroupReport")) {
        content = content.slice(0, submitIdx) + newGroupHandler + content.slice(submitIdx);
        console.log("Group Handler inserted.");
    } else {
        // Replace existing
        const oldHandlerRegex = /const handleGenerateGroupReport = async \(\) => \{[\s\S]*?\};/;
        content = content.replace(oldHandlerRegex, newGroupHandler);
        console.log("Group Handler updated.");
    }
    
    // UPDATE SUBMIT HANDLER FOR INDIVIDUAL LOGIC
    // 1. Payload: id_grupo
    // 2. Window: document.open
    
    // We can do simple string replace for these.
    
    // Payload
    const payloadRegex = /formData\.append\('id_grupo',[^)]+\);/;
    if (payloadRegex.test(content)) {
        content = content.replace(payloadRegex, "formData.append('id_grupo', (isGroupMode && idGrupo ? idGrupo.trim() : 'SIN_GRUPO'));");
        console.log("Individual Payload logic updated.");
    }
    
    // Window
    // Old: setOriginalReport(reportHtml); ... window.open ...
    // Note: The checkout 098c89d might NOT have window.open yet? 
    // Wait, 098c89d was "fix: restore missing BookOpen import". 
    // Did it include window logic? No. Window logic came in LATER commits (d0e7646).
    // So we need to ADD window logic.
    
    const successBlock = "setOriginalReport(reportHtml);";
    if (content.includes(successBlock)) {
        const windowLogic = `
                  const reportWindow = window.open('', 'InformeIndividual');
                  if (reportWindow) {
                      reportWindow.document.open();
                      reportWindow.document.write(reportHtml);
                      reportWindow.document.close();
                  }`;
        
        // We assume safe to append after setOriginalReport
        // Use replace to avoid duplication if running multiple times (though we shouldn't)
        if (!content.includes("window.open('', 'InformeIndividual')")) {
             content = content.replace(successBlock, successBlock + windowLogic);
             console.log("Individual Window Logic added.");
        }
    }
}

fs.writeFileSync(filePath, content, "utf8");
