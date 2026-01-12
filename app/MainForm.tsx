import React, { useState, useEffect, useRef } from 'react';
import { useExamContext } from './ExamContext';
import { Upload, Send, CheckCircle, AlertCircle, Loader2, FileDown, Bold, Italic, List, FileText, X, Eye, ChevronRight, Zap, ArrowLeft, Shield, BookOpen } from 'lucide-react';
import { SheetViewer } from './SheetViewer';
import { GradeBreakdown } from './GradeBreakdown';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';
import { optimizeExamImage } from './optimizeImage';
import { DemoReport } from './components/DemoReport';

// Configurar worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface MainFormProps {
    onBack: () => void;
    userToken: string;
}

const MainForm: React.FC<MainFormProps> = ({ onBack, userToken }) => {
    // Contexto para datos globales (opcional, pero útil si se quiere persistir al cambiar de pestaña)
    const { guiaCorreccion, setGuiaCorreccion, materialReferenciaFiles, setMaterialReferenciaFiles, setMaterialReferenciaTexto, materialReferenciaTexto } = useExamContext();

    // Estados Locales de UI
    const [rubricaFile, setRubricaFile] = useState<File | null>(null);
    const [extractingRubrica, setExtractingRubrica] = useState(false);
    const [extractingRef, setExtractingRef] = useState(false);

    const [alumnoId, setAlumnoId] = useState('');
    const [idGrupo, setIdGrupo] = useState('');

    // Persistence for Group ID
    useEffect(() => {
        const savedGroup = localStorage.getItem('hipatia_id_grupo');
        if (savedGroup) setIdGrupo(savedGroup);
    }, []);

    const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setIdGrupo(val);
        if (val) localStorage.setItem('hipatia_id_grupo', val);
        else localStorage.removeItem('hipatia_id_grupo');
    };
    const [nivelExigencia, setNivelExigencia] = useState('normal');
    const [examenArchivos, setExamenArchivos] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [legalAccepted, setLegalAccepted] = useState(false);

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(() => {
        // HACK: Detect sample load synchronously to prevent UI flash
        if (typeof window !== 'undefined' && localStorage.getItem('hipatia_load_sample') === 'true') {
            return 'sending';
        }
        return 'idle';
    });
    const [message, setMessage] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('Iniciando...');

    const rubricaInputRef = useRef<HTMLInputElement>(null);
    const refInputRef = useRef<HTMLInputElement>(null);

    const loadingMessages = [
        "Escaneando evidencias...",
        "Aplicando OCR...",
        "Analizando rúbrica...",
        "Generando veredicto...",
        "Consensuando (Juez)...",
        "Validando (Auditor)..."
    ];

    // --- LOGICA DE EXTRACCIÓN (Traída de Sidebar.tsx) ---
    const processFileText = async (file: File): Promise<string> => {
        let text = '';
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // @ts-ignore
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
            }
            text = fullText;
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            text = await file.text();
        }
        return text;
    };

    const handleRubricaFile = async (file: File) => {
        setExtractingRubrica(true);
        try {
            const text = await processFileText(file);
            setGuiaCorreccion(text);
            setRubricaFile(file);
        } catch (error) {
            console.error('Error extrayendo rúbrica:', error);
            alert('Error leyendo el archivo.');
        } finally {
            setExtractingRubrica(false);
        }
    };

    const handleRefFiles = async (files: File[]) => {
        setExtractingRef(true);
        try {
            const newFiles = [...materialReferenciaFiles, ...files];
            setMaterialReferenciaFiles(newFiles);

            // Re-procesar TODO el texto combinado (o añadir, pero re-procesar todo es más seguro para consistencia)
            let combinedText = '';
            for (const file of newFiles) {
                const text = await processFileText(file);
                combinedText += `\n--- CONTENIDO DE: ${file.name} ---\n${text}\n`;
            }
            setMaterialReferenciaTexto(combinedText);
        } catch (error) {
            console.error('Error extrayendo referencia:', error);
            alert('Error leyendo los archivos de referencia.');
        } finally {
            setExtractingRef(false);
        }
    };

    // --- EFECTOS DE UI ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'sending') {
            setLoadingMsg(loadingMessages[0]);
            let i = 0;
            interval = setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                setLoadingMsg(loadingMessages[i]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const [originalReport, setOriginalReport] = useState<string | null>(null);
    const [editedReport, setEditedReport] = useState<string>('');
    const [jsonGrade, setJsonGrade] = useState<number | null>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerStartingIndex, setViewerStartingIndex] = useState(0);

    useEffect(() => {
        if (originalReport) {
            setEditedReport(originalReport);
        }
    }, [originalReport]);

    // CHECK FOR SAMPLE LOAD REQUEST
    useEffect(() => {
        const checkSample = localStorage.getItem('hipatia_load_sample');
        if (checkSample === 'true') {
            localStorage.removeItem('hipatia_load_sample');
            // If status wasn't set by initializer (due to hydration or SSR), set it now
            setStatus('sending');
            setLoadingMsg("Cargando simulación de Alu prueba 2...");

            setTimeout(() => {
                setStatus('success');
                setAlumnoId('ALU-PRUEBA-02');
                setNivelExigencia('acnee');
                setJsonGrade(7.7);
                setOriginalReport(`
                    <h2>Informe de Corrección (Simulado)</h2>
                    <p><strong>Alumno:</strong> ALU-PRUEBA-02 | <strong>Nivel:</strong> ACNEE</p>
                    <p>He realizado una lectura detenida de tu examen sobre el siglo XIX español y quiero felicitarte por el esfuerzo. Se nota que has comprendido las dinámicas políticas fundamentales entre liberales y absolutistas.</p>
                    <p>A continuación, desglosamos la corrección:</p>
                    
                    <h3>1. La Constitución de 1812</h3>
                    <ul>
                        <li><strong>Clasificación y Naturaleza:</strong> Has identificado correctamente que se trata de un texto jurídico y constitucional. (Puntuación: Alta)</li>
                        <li><strong>Ideas Principales:</strong> Explicas bien la Soberanía Nacional y la División de Poderes. Te ha faltado profundizar un poco más en el contexto de guerra, pero la idea central está clara.</li>
                    </ul>

                    <h3>2. Reinado de Isabel II</h3>
                    <ul>
                        <li><strong>Problema Sucesorio (Carlismo):</strong> Muy buen análisis del conflicto dinástico. Entiendes las causas profundas.</li>
                        <li><strong>Evolución Política:</strong> Describe correctamente la alternancia de partidos, aunque la parte de la Desamortización podría ser más detallada en cuanto a sus consecuencias sociales.</li>
                    </ul>

                    <h3>Conclusión</h3>
                    <p>En resumen, demuestras una competencia notable en el análisis histórico. Tu calificación final ajustada es de un <strong>7.7</strong>. ¡Confío plenamente en tu capacidad para seguir mejorando!</p>
                `);
            }, 1500); // Slightly faster but still feels like it's working
        }
    }, []);

    // --- HANDLERS DEL FORMULARIO ---
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const rawFiles = Array.from(e.dataTransfer.files);
            await processAndAddFiles(rawFiles);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const rawFiles = Array.from(e.target.files);
            await processAndAddFiles(rawFiles);
        }
    };

    const processAndAddFiles = async (files: File[]) => {
        setIsOptimizing(true);
        try {
            const optimizedFiles = await Promise.all(files.map(async (file) => {
                // Solo optimizar imágenes (no PDFs)
                if (file.type.startsWith('image/')) {
                    return await optimizeExamImage(file);
                }
                return file;
            }));
            setExamenArchivos(prev => [...prev, ...optimizedFiles]);
        } catch (error) {
            console.error("Error optimizing files:", error);
            alert("Error optimizando algunas imágenes. Se intentarán subir originales.");
            setExamenArchivos(prev => [...prev, ...files]);
        } finally {
            setIsOptimizing(false);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setExamenArchivos(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    
    const handleGenerateGroupReport = async () => {
        if (!idGrupo) return;
        setStatus('sending');
        setMessage('Solicitando informe grupal...');
        
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_AUDITOR || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/evaluacion-examen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_group_report',
                    id_grupo: idGrupo.trim(),
                    user_token: userToken // Assuming userToken is available in scope
                })
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            // Assuming response might be a file download or just a success message?
            // User said "Geneerar Informe", implies a download or view.
            // For now, let's assume it returns JSON with a message or url.
            const data = await response.json();
            console.log("Group Report Response:", data);
            
            setStatus('success');
            setMessage('Informe grupal solicitado correctamente. Revisa tu correo o la carpeta de salida.'); // Generic success
            
        } catch (error) {
            console.error('Group Report Error:', error);
            setStatus('error');
            setMessage('Error al generar el informe grupal.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!guiaCorreccion && materialReferenciaFiles.length === 0) {
            setStatus('error');
            setMessage('Configura la rúbrica o referencia primero.');
            return;
        }
        if (examenArchivos.length === 0) {
            setStatus('error');
            setMessage('Adjunta al menos una hoja del examen.');
            return;
        }

        setStatus('sending');
        setOriginalReport(null);
        setEditedReport('');

        try {
            const formData = new FormData();
            formData.append('user_token', userToken);
            formData.append('guia_correccion', guiaCorreccion);
            if (materialReferenciaTexto) {
                formData.append('material_referencia', materialReferenciaTexto);
            }
            formData.append('alumno_id', alumnoId);
            formData.append('id_grupo', (idGrupo || 'SIN_GRUPO').trim());
            formData.append('nivel_exigencia', nivelExigencia);

            examenArchivos.forEach((file, index) => {
                formData.append(`hoja_${index}`, file);
            });

            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_AUDITOR || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/evaluacion-examen', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setStatus('success');
                const data = await response.json();
                const reportHtml = data.html_report || data.output || '<p>Informe generado.</p>';

                // Priorizar la nota que viene limpia en el JSON (soporta 'nota', 'score', 'grade')
                const numericGrade = data.nota ?? data.score ?? data.grade ?? null;
                setJsonGrade(numericGrade !== null ? Number(numericGrade) : null);

                setOriginalReport(reportHtml);
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Error conectando con el servidor.');
        }
    };

    const handleReset = () => {
        if (confirm('¿Restablecer el informe?')) {
            setEditedReport(originalReport || '');
        }
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (contentRef.current) {
            setEditedReport(contentRef.current.innerHTML);
            contentRef.current.focus();
        }
    };

    const handleDownloadPdf = async () => {
        if (typeof window !== 'undefined') {
            const element = document.createElement('div');
            element.innerHTML = `
                <div style="padding: 40px; font-family: sans-serif;">
                    <h1 style="color: #333; border-bottom: 2px solid #ccc; padding-bottom: 10px;">Informe de Corrección</h1>
                    <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Alumno: ${alumnoId || 'N/A'} | Fecha: ${new Date().toLocaleDateString()}</p>
                    ${editedReport}
                    <div style="margin-top: 40px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                        Generado por HIPATIA Ecosistema v4.0
                    </div>
                </div>
            `;

            // @ts-ignore
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin: 10,
                filename: `Correccion_${alumnoId || 'Examen'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            html2pdf().set(opt).from(element).save();
        }
    };

    const extractedGrade = jsonGrade !== null
        ? jsonGrade
        : parseFloat(editedReport?.match(/Nota(?:\s*Final)?\s*:\s*([\d\.]+)/i)?.[1] || "0");
    const isPass = extractedGrade >= 5;

    // --- VISTA DE INFORMES (RESULTADOS) ---
    if (originalReport) {
        // --- VISTA DEMO REAL (ALU-PRUEBA-02) ---
        if (alumnoId === 'ALU-PRUEBA-02') {
            return <DemoReport onBack={() => setOriginalReport(null)} />;
        }

        return (
            <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden animate-fade-in font-inter">
                {/* Header Superior Compact */}
                <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Expediente</span>
                            <h2 className="text-sm font-bold text-slate-900">{alumnoId || 'ID-ALUMNO'}</h2>
                        </div>
                        <div className="h-6 w-px bg-slate-200 ml-2"></div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-bold text-emerald-700">AUDITADO</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            <FileDown className="h-3.5 w-3.5" /> PDF
                        </button>
                        <button onClick={() => setOriginalReport(null)} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all">
                            NUEVA
                        </button>
                    </div>
                </div>

                {/* Dashboard Compact Workspace */}
                <div className="flex-1 overflow-auto p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                        {/* Filmstrip Overlay */}
                        <div className="col-span-12 lg:col-span-3 space-y-4 pr-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Evidencias</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                                {examenArchivos.map((_, idx) => (
                                    <div key={idx} onClick={() => { setViewerStartingIndex(idx); setIsViewerOpen(true); }} className="relative group cursor-pointer">
                                        <div className="aspect-[3/4] bg-white border border-slate-200 rounded-lg shadow-soft flex flex-col items-center justify-center transition-all group-hover:border-indigo-400 overflow-hidden relative">
                                            <FileText className="h-6 w-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                            <span className="text-[10px] font-bold text-slate-500 mt-1.5">Pág {idx + 1}</span>
                                            <CheckCircle className="absolute top-1 right-1 h-3 w-3 text-indigo-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-6 space-y-6">
                            {/* Score Card Hero Compact */}
                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-soft flex items-center justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Calificación Final</h3>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`text-5xl font-black ${isPass ? 'text-indigo-600' : 'text-rose-600'}`}>
                                            {extractedGrade.toFixed(2)}
                                        </span>
                                        <span className="text-xl font-bold text-slate-300">/ 10</span>
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {isPass ? 'Promoción apta' : 'Refuerzo necesario'}
                                    </div>
                                </div>
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={263.8} strokeDashoffset={263.8 - (263.8 * extractedGrade) / 10} className={`${isPass ? 'text-indigo-600' : 'text-rose-500'} transition-all duration-1000`} />
                                    </svg>
                                    <span className="absolute text-[11px] font-bold text-slate-500">{(extractedGrade * 10).toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Informe Pedagógico</h3>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => execCmd('bold')} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"><Bold className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => execCmd('italic')} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"><Italic className="h-3.5 w-3.5" /></button>
                                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                                        <button onClick={handleReset} className="text-[9px] font-bold text-rose-500 uppercase hover:underline">Reset</button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 shadow-soft min-h-[450px] p-8 overflow-hidden">
                                    <div
                                        className="outline-none prose prose-auditor prose-sm"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={(e) => setEditedReport(e.currentTarget.innerHTML)}
                                        dangerouslySetInnerHTML={{ __html: editedReport }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            <div className="bg-slate-900 rounded-xl p-5 shadow-lg text-white">
                                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Análisis Técnico</h3>
                                <div className="font-mono bg-slate-800/40 rounded-lg p-4 border border-slate-800">
                                    <div className="text-indigo-400 text-[8px] mb-2 font-bold tracking-widest">$ PRECISION_LOG</div>
                                    <div className="space-y-1.5 text-[11px] text-slate-400">
                                        <p>P1: <span className="text-white">+2.00</span></p>
                                        <p>P2: <span className="text-white">+1.50</span></p>
                                        <p>P3: <span className="text-white">+1.34</span></p>
                                        <div className="h-px bg-slate-700 my-3"></div>
                                        <p className="text-sm font-bold text-white tracking-tight">
                                            $ Σ = <span className="text-indigo-400">{extractedGrade.toFixed(2)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <GradeBreakdown htmlContent={editedReport} />
                        </div>
                    </div>
                </div>

                <SheetViewer files={examenArchivos} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} />
            </div>
        );
    }

    // --- VISTA PRINCIPAL (FORMULARIO UNIFICADO - ESTILO FORGE) ---
    // Show a clean loading screen if we're in the initial sample loading phase
    if (status === 'sending' && !alumnoId && !guiaCorreccion && examenArchivos.length === 0) {
        return (
            <div className="flex-1 h-full bg-slate-50 flex flex-col items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Shield className="absolute inset-0 m-auto h-6 w-6 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Preparando simulación</h2>
                        <p className="text-sm text-slate-400 font-medium px-8">{loadingMsg}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Top Navigation */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>HIPAT<span className="text-indigo-600">IA</span></span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Corrector</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300 p-4 md:p-6 pb-20">
                    {/* Header Copy */}
                    <div className="text-center space-y-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                            Escanea, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Analiza</span> y Califica
                        </h2>
                    </div>

                    {/* Unified Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-xl shadow-indigo-900/5 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* SECTION 1: CONTEXTO (RÚBRICA & REFERENCIAS) */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Shield size={16} /></div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contexto de la Evaluación</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Rubrica Upload */}
                                    <div
                                        onClick={() => rubricaInputRef.current?.click()}
                                        className={`group relative h-20 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all
                                        ${guiaCorreccion ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                                    >
                                        <input ref={rubricaInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleRubricaFile(e.target.files[0])} accept=".pdf,.docx,.txt" />

                                        {extractingRubrica ? (
                                            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                                        ) : guiaCorreccion ? (
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-1.5 rounded-full shadow-sm text-emerald-500"><CheckCircle size={16} /></div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-slate-700">Rúbrica OK</p>
                                                    <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{rubricaFile?.name || 'Texto'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="flex flex-col items-center">
                                                  <p className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Subir Rúbrica</p>
                                                  <p className="text-[10px] text-slate-400 mt-1 font-medium text-center leading-tight max-w-[160px]">Lo más detallada posible para mejores resultados</p>
                                              </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Referencia Upload */}
                                    <div
                                        onClick={() => refInputRef.current?.click()}
                                        className={`group relative min-h-[5rem] h-auto border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-2
                                        ${materialReferenciaFiles.length > 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-violet-400 hover:bg-slate-50'}`}
                                    >
                                        <input ref={refInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && e.target.files.length > 0 && handleRefFiles(Array.from(e.target.files))} accept=".pdf,.docx,.txt" />

                                        {extractingRef ? (
                                            <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                                        ) : materialReferenciaFiles.length > 0 ? (
                                            <div className="w-full flex flex-col gap-2">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <div className="bg-white p-1 rounded-full shadow-sm text-emerald-500"><CheckCircle size={14} /></div>
                                                    <p className="text-xs font-bold text-slate-700">Contenidos ({materialReferenciaFiles.length})</p>
                                                </div>
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {materialReferenciaFiles.map((f, i) => (
                                                        <span key={i} className="text-[9px] bg-white border border-emerald-100 px-2 py-0.5 rounded text-slate-500 truncate max-w-[120px] shadow-sm">
                                                            {f.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-[9px] text-center text-violet-400 font-bold mt-1 group-hover:block hidden">+ Añadir más</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="flex flex-col items-center">
                                                  <p className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">Subir contenidos de referencia</p>
                                                  <p className="text-[10px] text-slate-400 mt-1 font-medium text-center leading-tight max-w-[160px]">Para que corrija solo con tus contenidos</p>
                                              </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* SECTION 2: DATOS DEL ALUMNO */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ID Alumno (Privacidad: No usar nombre real)</label>
                                        <input
                                            type="text"
                                            value={alumnoId}
                                            onChange={(e) => setAlumnoId(e.target.value)}
                                            placeholder="Ej: ALU-2024-X"
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all font-bold text-base text-slate-700 shadow-sm"
                                            required
                                        />
                                    </div>
                                    
                                      <div className="space-y-2">
                                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                              Identificador de Grupo
                                          </label>
                                          <input
                                              type="text"
                                              value={idGrupo}
                                              onChange={handleGroupChange}
                                              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all font-bold text-base text-slate-700 shadow-sm placeholder:font-normal placeholder:text-slate-300"
                                              placeholder="Ej: MAT-4A (Opcional)"
                                          />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Criterio de Exigencia</label>
                                        <select
                                            value={nivelExigencia}
                                            onChange={(e) => setNivelExigencia(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all font-bold text-base text-slate-700 shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="estricto">ESTRICTO</option>
                                            <option value="normal">ESTÁNDAR</option>
                                            <option value="acnee">ACNEE</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: EVIDENCIAS */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Escanear Examen</label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative group h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                                        ${isDragOver ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                                >
                                    <input
                                        type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileSelect} accept="image/*,application/pdf"
                                    />
                                    <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className={`h-5 w-5 ${isDragOver ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600">
                                        {isDragOver ? 'Suelte aquí' : isOptimizing ? 'Optimizando...' : 'Arrastre las hojas'}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-1 text-center scale-90">
                                        Tip: Usa buena luz y evita fotos borrosas
                                    </p>
                                </div>

                                {examenArchivos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 animate-in slide-in-from-top-2">
                                        {examenArchivos.map((file, idx) => (
                                            <div key={idx} className="pl-3 pr-2 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-indigo-700 truncate max-w-[120px]">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(idx)} className="text-indigo-400 hover:text-rose-500 transition-colors"><X className="h-3 w-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Legal Checkbox */}
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex bg-white rounded-md border border-slate-200 p-0.5 mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="legal-consent"
                                        checked={legalAccepted}
                                        onChange={(e) => setLegalAccepted(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded bg-white border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                </div>
                                <label htmlFor="legal-consent" className="text-xs text-slate-500 font-medium leading-relaxed cursor-pointer select-none">
                                    Certifico que soy el propietario legítimo de los materiales subidos y acepto el tratamiento de datos para fines de evaluación académica según la <a href="/legal?tab=privacidad" target="_blank" className="text-indigo-600 hover:underline font-bold">Política de Privacidad</a> y el <a href="/legal?tab=aviso-legal" target="_blank" className="text-indigo-600 hover:underline font-bold">Aviso Legal</a>, incluyendo la anonimización de datos de menores.
                                </label>
                            </div>

                            {/* ACTION BUTTON */}
                            <button
                                type="submit"
                                disabled={status === 'sending' || examenArchivos.length === 0 || !legalAccepted}
                                className={`w-full py-4 text-lg font-black text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 
                                    ${status === 'sending' || !legalAccepted
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 shadow-indigo-200'}`}
                            >
                                {status === 'sending' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span className="animate-pulse text-sm">{loadingMsg}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>INICIAR CORRECCIÓN</span>
                                        <ChevronRight size={20} className="opacity-60" />
                                    </>
                                )}
                            </button>
                              <button
                                  type="button"
                                  onClick={handleGenerateGroupReport}
                                  disabled={!idGrupo || status === 'sending'}
                                  className={`w-full mt-4 p-4 rounded-xl border-2 transition-all font-bold flex items-center justify-center gap-2 ${
                                      !idGrupo
                                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50 hidden' 
                                          : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                                  }`}
                              >
                                  <BookOpen size={20} />
                                  <span>GENERAR INFORME GRUPAL</span>
                              </button>
    

                            {status === 'error' && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in shake">
                                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                                    <p className="text-sm font-bold text-rose-700">{message}</p>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainForm;
