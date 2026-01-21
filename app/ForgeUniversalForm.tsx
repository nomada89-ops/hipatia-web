'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, CheckCircle, Upload, Zap, Eye, Printer, Loader2, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import { processFileText } from './utils';

interface ForgeUniversalFormProps {
    onBack: () => void;
    userToken: string;
}

const ForgeUniversalForm: React.FC<ForgeUniversalFormProps> = ({ onBack, userToken }) => {
    // Estados del Formulario
    const [temarioFiles, setTemarioFiles] = useState<File[]>([]);
    const [temarioText, setTemarioText] = useState<string>('');
    const [modeloFile, setModeloFile] = useState<File | null>(null);
    const [modeloText, setModeloText] = useState<string>('');

    // Configuración
    const [nivel, setNivel] = useState('Bachillerato');
    const [numPreguntas, setNumPreguntas] = useState<number>(5);
    const [instrucciones, setInstrucciones] = useState<string>('');

    // Estados de UI/Procesamiento
    const [isExtractingTemario, setIsExtractingTemario] = useState(false);
    const [isExtractingModelo, setIsExtractingModelo] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Resultado
    const [examHtml, setExamHtml] = useState<string | null>(null);
    const [solucionarioHtml, setSolucionarioHtml] = useState<string | null>(null);
    const [guiaData, setGuiaData] = useState<any>(null); // Para persistencia
    const [isDyslexic, setIsDyslexic] = useState(false);

    // Nuevos estados para Modo Inclusión DUA Refinado
    const [modoInclusion, setModoInclusion] = useState(false);
    const [stdData, setStdData] = useState<{ html: string; solucionario: string | null } | null>(null);
    const [acneaeData, setAcneaeData] = useState<{ html: string; solucionario: string | null } | null>(null);
    const [acsData, setAcsData] = useState<{ html: string; solucionario: string | null } | null>(null);

    const [pedagogicalData, setPedagogicalData] = useState<string | null>(null);
    const [activeVersion, setActiveVersion] = useState<'estandar' | 'acneae' | 'acs'>('estandar');
    const [viewMode, setViewMode] = useState<'examen' | 'solucionario'>('examen');

    // Refs
    const temarioInputRef = useRef<HTMLInputElement>(null);
    const modeloInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const printableRef = useRef<HTMLDivElement>(null);

    // --- MANEJADORES DE ARCHIVOS ---
    const handleTemarioFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsExtractingTemario(true);
        try {
            const fileArray = Array.from(files);
            let combinedText = "";

            for (const file of fileArray) {
                const text = await processFileText(file);
                combinedText += `\n\n--- INICIO ARCHIVO: ${file.name} ---\n${text}\n--- FIN ARCHIVO: ${file.name} ---\n`;
            }

            setTemarioText(combinedText);
            setTemarioFiles(fileArray);
        } catch (error) {
            console.error('Error procesando temario:', error);
            alert('Error al leer los archivos de temario.');
        } finally {
            setIsExtractingTemario(false);
        }
    };

    const handleModeloFile = async (file: File) => {
        setIsExtractingModelo(true);
        try {
            const text = await processFileText(file);
            setModeloText(text);
            setModeloFile(file);
        } catch (error) {
            console.error('Error procesando modelo:', error);
            alert('Error al leer el archivo modelo.');
        } finally {
            setIsExtractingModelo(false);
        }
    };

    // --- ENVÍO AL WEBHOOK ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        e.preventDefault();

        // El temario es opcional, pero las instrucciones son obligatorias si no hay temario (o siempre, según solicitud... solicitud dice: "instrucciones_profesor (Textarea OBLIGATORIO)")

        if (!instrucciones.trim()) {
            setStatus('error');
            setMessage('Debes indicar el tema del examen o instrucciones.');
            return;
        }

        setIsGenerating(true);
        setStatus('generating');
        setMessage('La IA está forjando el examen a medida...');

        try {
            const payload = {
                user_token: userToken,
                tipo_generacion: modoInclusion ? "Triple_ACNEE" : "Simple",
                texto_temario: temarioText,
                texto_modelo_examen: modeloText, // Opcional
                configuracion: {
                    nivel: nivel,
                    num_preguntas: Number(numPreguntas),
                    instrucciones_profesor: instrucciones
                }
            };

            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_FORGE_UNIVERSAL || 'https://n8n.protocolohipatia.com/webhook/generar-examen_generico_adaptado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();

            // Procesar respuesta
            if (data.version_estandar) {
                // Modo Triple DUA
                setStdData({
                    html: data.version_estandar.html || '',
                    solucionario: data.version_estandar.solucionario || null
                });
                setAcneaeData({
                    html: data.version_no_significativa.html || '',
                    solucionario: data.version_no_significativa.solucionario || null
                });
                setAcsData({
                    html: data.version_significativa.html || '',
                    solucionario: data.version_significativa.solucionario || null
                });
                setPedagogicalData(data.metadata_pedagogica?.justificacion_dua || null);
                setActiveVersion('estandar');
            } else {
                // Modo Simple (Legacy mapping to Standard)
                const htmlContent = data.examen_html || data.output || '<h3>Error: Sin contenido generado</h3>';
                setStdData({
                    html: htmlContent,
                    solucionario: data.solucionario_html || null
                });
                setAcneaeData(null);
                setAcsData(null);
                setPedagogicalData(null);
            }

            setGuiaData(data.guia_correccion_data || null);

            setStatus('success');
            setViewMode('examen');
        } catch (error) {
            console.error('Generation invalid:', error);
            setStatus('error');
            setMessage('Hubo un error al generar el examen. Revisa tu conexión.');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- HELPERS ---
    const getActiveData = () => {
        switch (activeVersion) {
            case 'acneae': return acneaeData;
            case 'acs': return acsData;
            case 'estandar': default: return stdData;
        }
    };

    // --- IMPRESIÓN INTELIGENTE ---
    // --- IMPRESIÓN INTELIGENTE ---
    const handlePrint = useReactToPrint({
        content: () => printableRef.current,
        documentTitle: `Examen_Hipatia-${nivel}-${activeVersion}-${new Date().toLocaleDateString()}`,
        pageStyle: `
            @media print {
                body { 
                    -webkit-print-color-adjust: exact; 
                }
                @page {
                    size: auto;
                    margin: 20mm;
                }
                /* Ocultar elementos específicos de UI al imprimir dentro del ref */
                .no-print {
                    display: none !important;
                }
                
                /* Asegurar que los contenedores no corten contenido */
                .prose {
                    max-width: none !important;
                    width: 100% !important;
                    overflow: visible !important;
                }
            }
        `
    });

    const handleCopySolucionario = () => {
        const currentData = getActiveData();
        if (currentData?.solucionario) {
            // Eliminar tags HTML planos para el portapapeles o copiar HTML crudo?
            // Copiamos texto plano del HTML para facilitar pegado, o el HTML crudo si es para moodle.
            // Para "trabajo administrativo", texto enriquecido es mejor.
            // Usamos una area temporal.
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentData.solucionario;
            const text = tempDiv.textContent || tempDiv.innerText || "";
            navigator.clipboard.writeText(text).then(() => alert("Solucionario copiado al portapapeles"));
        }
    };

    const handleReset = () => {
        if (confirm('¿Descartar examen y volver al generador?')) {
            setStdData(null);
            setAcneaeData(null);
            setAcsData(null);
            setPedagogicalData(null);
            setActiveVersion('estandar');
            setViewMode('examen');

            setGuiaData(null);
            setStatus('idle');
            setMessage('');
            setTemarioFiles([]);
            setTemarioText('');
        }
    };

    // --- VISTA EDITOR / PREVISUALIZACIÓN ---
    if (stdData) { // Si existe data estándar, mostramos visor
        const activeData = getActiveData();

        return (
            <div className={`h-screen overflow-hidden flex flex-col font-sans print:bg-white print:h-auto print:overflow-visible ${isDyslexic ? 'font-dyslexic' : ''}`}>

                <style>{`
                      .font-dyslexic * { font-family: 'OpenDyslexic', sans-serif !important; }
                  `}</style>

                {/* Header - Oculto al imprimir */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md print:hidden z-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span>HIPAT<span className="text-violet-400">IA</span></span> Universal
                        </h2>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Editor Universal</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* VERSION TABS - Top Hierarchy */}
                        <div className="flex bg-slate-800 p-1 rounded-lg mr-2 border border-slate-700 print:hidden">
                            <button
                                onClick={() => setActiveVersion('estandar')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeVersion === 'estandar' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                Estándar
                            </button>
                            {acneaeData && (
                                <button
                                    onClick={() => setActiveVersion('acneae')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeVersion === 'acneae' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    ACNEAE
                                </button>
                            )}
                            {acsData && (
                                <button
                                    onClick={() => setActiveVersion('acs')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeVersion === 'acs' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    ACS
                                </button>
                            )}
                        </div>

                        {/* VIEW MODE TOGGLE - Sub Menu */}
                        <div className="flex bg-slate-100 p-1 rounded-lg mr-4 border border-slate-200 print:hidden">
                            <button
                                onClick={() => setViewMode('examen')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'examen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Eye size={12} /> Examen
                            </button>
                            {activeData?.solucionario && (
                                <button
                                    onClick={() => setViewMode('solucionario')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'solucionario' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <CheckCircle size={12} /> Solucionario
                                </button>
                            )}
                        </div>


                        {/* Dyslexia Toggle */}
                        <div className="flex items-center gap-2 mr-4 print:hidden">
                            <div
                                onClick={() => setIsDyslexic(!isDyslexic)}
                                className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded-full transition-colors ${isDyslexic ? 'bg-violet-100 text-violet-700' : 'bg-transparent text-slate-400 hover:bg-slate-800'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider">Modo Dislexia</span>
                                <div className={`w-8 h-4 rounded-full flex items-center transition-colors p-0.5 ${isDyslexic ? 'bg-violet-500 justify-end' : 'bg-slate-600 justify-start'}`}>
                                    <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            Descartar
                        </button>

                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all active:scale-95 border border-indigo-500"
                        >
                            <Printer size={18} />
                            <span className="hidden xl:inline">Descargar PDF</span>
                        </button>

                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-8 print:p-0 print:bg-white print:overflow-visible print:overflow-visible print:overflow-visible">
                    <div ref={printableRef} className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[20mm] print:shadow-none print:p-0">

                        {/* EXAMEN CONTAINER */}
                        <div className={`prose prose-slate max-w-none outline-none ${viewMode === 'examen' ? 'block' : 'hidden print:block'}`}>

                            {/* Version Info Header */}
                            <div className="print:hidden">
                                {activeVersion === 'acneae' && (
                                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6">
                                        <p className="font-bold text-emerald-700 text-sm">Adaptación de Acceso (ACNEAE)</p>
                                        <p className="text-emerald-600 text-xs">Objetivos mantenidos. Lectura facilitada DUA.</p>
                                    </div>
                                )}
                                {activeVersion === 'acs' && (
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                                        <p className="font-bold text-amber-700 text-sm">Adaptación Curricular Significativa (ACS)</p>
                                        <p className="text-amber-600 text-xs">Complejidad ajustada. Evaluación competencia clave.</p>
                                    </div>
                                )}
                                {isDyslexic && (
                                    <div className="bg-violet-50 border-l-4 border-violet-500 p-4 mb-6">
                                        <p className="font-bold text-violet-700 text-sm">OpenDyslexic Activado</p>
                                        <p className="text-violet-600 text-xs">Formato optimizado para lectura facilitada disponible para descarga</p>
                                    </div>
                                )}
                            </div>

                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{
                                    __html: activeData?.html || '<p>Error de carga...</p>'
                                }}
                            />
                        </div>

                        {/* PAGE BREAK - Only when printing and Solucionario exists */}
                        {activeData?.solucionario && (
                            <div className="hidden print:block" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}></div>
                        )}

                        {/* SOLUCIONARIO CONTAINER */}
                        {activeData?.solucionario && (
                            <div className={`prose prose-slate max-w-none outline-none ${viewMode === 'solucionario' ? 'block' : 'hidden print:block'}`}>

                                <div className="print:hidden mb-4 p-4 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 flex justify-between items-center">
                                    <span className="uppercase tracking-widest text-xs">--- Solucionario y Criterios ---</span>
                                    <button
                                        onClick={handleCopySolucionario}
                                        className="bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded text-xs hover:bg-indigo-50 transition-colors"
                                    >
                                        Copiar Solucionario
                                    </button>
                                </div>
                                <div className="hidden print:block font-bold text-center text-lg mb-6 uppercase">Solucionario y Criterios de Evaluación</div>

                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    dangerouslySetInnerHTML={{ __html: activeData?.solucionario || '' }}
                                />
                            </div>
                        )}

                        {/* Pedagogical Justification Card */}
                        {pedagogicalData && (
                            <div className="mt-12 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden break-inside-avoid print:break-before-auto">
                                <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <BookOpen size={16} className="text-violet-500" />
                                        Evidencia Pedagógica y Justificación DUA
                                    </h3>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(pedagogicalData)}
                                        className="text-xs text-violet-600 hover:text-violet-800 font-medium px-2 py-1 rounded hover:bg-violet-50 transition-colors"
                                    >
                                        Copiar Texto
                                    </button>
                                </div>
                                <div className="p-6 text-sm text-slate-600 leading-relaxed font-serif whitespace-pre-wrap">
                                    {pedagogicalData}
                                </div>
                            </div>
                        )}

                        {/* Legal Footer */}
                        <div className="mt-12 pt-6 border-t border-slate-100 text-center print:break-inside-avoid">
                            <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-tight">
                                Nota legal: Las adaptaciones de Hipatia se basan en modelos de IA bajo normativa LOMLOE y principios DUA. La validación y firma de cualquier Adaptación Curricular (ACS) es competencia exclusiva del docente y el equipo de orientación del centro.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA FORMULARIO CONFIGURACIÓN ---
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
                            <span>HIPAT<span className="text-violet-600">IA</span></span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Generador General</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300 p-4 md:p-6 pb-20">

                    {/* Header Copy */}
                    <div className="text-center space-y-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                            Genera exámenes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Cualquier Materia</span>
                        </h2>
                    </div>

                    {/* Unified Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-xl shadow-violet-900/5 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* SECTION 1: DOCUMENTACION */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-violet-50 p-1.5 rounded-lg text-violet-600"><BookOpen size={14} /></div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuentes de Conocimiento</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Temario (Obligatorio) */}
                                    <div
                                        onClick={() => temarioInputRef.current?.click()}
                                        className={`group relative min-h-[6rem] h-auto border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-4
                                        ${temarioText ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-violet-400 hover:bg-slate-50'}`}
                                    >
                                        <input ref={temarioInputRef} type="file" multiple className="hidden" onChange={(e) => handleTemarioFiles(e.target.files)} accept=".pdf,.docx,.txt" />

                                        {isExtractingTemario ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                                                <span className="text-xs font-bold text-violet-400">Analizando archivos...</span>
                                            </div>
                                        ) : temarioFiles.length > 0 ? (
                                            <div className="flex flex-col items-center gap-2 text-center w-full">
                                                <div className="bg-white p-1.5 rounded-full shadow-sm text-emerald-500"><CheckCircle size={20} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">Temario Procesado</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">{temarioFiles.length} archivos subidos</p>
                                                    {temarioFiles.length === 1 && <p className="text-[10px] text-slate-400 truncate max-w-[200px] mx-auto">{temarioFiles[0].name}</p>}
                                                    <p className="text-[9px] text-emerald-600 font-mono mt-1">{(temarioText.length / 1000).toFixed(1)}k caracteres totales</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <Upload className="h-6 w-6 text-slate-300 mx-auto group-hover:text-violet-500 transition-colors" />
                                                <p className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">Sube tus apuntes (Opcional)</p>
                                                <p className="text-[9px] text-slate-400">Selecciona múltiples PDF, DOCX o TXT</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modelo (Opcional) */}
                                    <div
                                        onClick={() => modeloInputRef.current?.click()}
                                        className={`group relative min-h-[6rem] h-auto border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-4
                                        ${modeloText ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-fuchsia-400 hover:bg-slate-50'}`}
                                    >
                                        <input ref={modeloInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleModeloFile(e.target.files[0])} accept=".pdf,.docx,.txt" />

                                        {isExtractingModelo ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-5 w-5 text-fuchsia-500 animate-spin" />
                                                <span className="text-xs font-bold text-fuchsia-400">Analizando estilo...</span>
                                            </div>
                                        ) : modeloText ? (
                                            <div className="flex flex-col items-center gap-2 text-center w-full">
                                                <div className="bg-white p-1.5 rounded-full shadow-sm text-emerald-500"><CheckCircle size={20} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">Modelo Aplicado</p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[200px] mx-auto">{modeloFile?.name}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <Upload className="h-6 w-6 text-slate-300 mx-auto group-hover:text-fuchsia-500 transition-colors" />
                                                <p className="text-xs font-bold text-slate-600 group-hover:text-fuchsia-600 transition-colors">¿Imitar formato de examen antiguo?</p>
                                                <p className="text-[9px] text-slate-400">Opcional: Subir PDF/Word</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: CONFIGURACIÓN */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-violet-50 p-1.5 rounded-lg text-violet-600"><Zap size={14} /></div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración de la Prueba</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nivel Educativo</label>
                                        <select
                                            value={nivel}
                                            onChange={(e) => setNivel(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:border-violet-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 shadow-sm"
                                        >
                                            <option value="Primaria">Educación Primaria</option>
                                            <option value="ESO">ESO</option>
                                            <option value="Bachillerato">Bachillerato</option>
                                            <option value="Universidad">Universidad</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Número de Preguntas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={numPreguntas}
                                            onChange={(e) => setNumPreguntas(Number(e.target.value))}
                                            className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:border-violet-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tema del Examen / Instrucciones Adicionales</label>
                                    <textarea
                                        value={instrucciones}
                                        onChange={(e) => setInstrucciones(e.target.value)}
                                        placeholder="Ej: Revolución Francesa, céntrate en las causas económicas. Omitir la etapa del Terror. Preguntas de desarrollo corto."
                                        rows={3}
                                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:border-violet-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 shadow-sm resize-none"
                                    />
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1">
                                        <HelpCircle size={12} />
                                        <span>Este texto define el examen si no hay archivo de temario.</span>
                                    </div>
                                </div>
                            </div>

                            {/* DUA Inclusion Toggle */}
                            <div
                                onClick={() => setModoInclusion(!modoInclusion)}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${modoInclusion ? 'bg-fuchsia-50 border-fuchsia-400' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${modoInclusion ? 'bg-fuchsia-500 text-white' : 'bg-white text-slate-400'}`}>
                                        <Eye size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-xs uppercase tracking-widest ${modoInclusion ? 'text-fuchsia-900' : 'text-slate-500'}`}>Activar Modo Inclusión DUA</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Genera automáticamente 3 versiones adaptadas bajo normativa LOMLOE</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${modoInclusion ? 'bg-fuchsia-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                                    <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>

                            {/* ACTION BUTTON */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isGenerating || !instrucciones.trim()}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3
                                    ${isGenerating
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                            : modoInclusion
                                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-fuchsia-200 hover:shadow-xl hover:scale-[1.01]'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:scale-[1.01]'}`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                                            <span>{modoInclusion ? 'Forjando Pack DUA...' : 'Forjando Examen Universal...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5 text-white/80" />
                                            <span>{modoInclusion ? 'Generar Pack DUA (0,80 créditos)' : 'Generar Examen (0,40 créditos)'}</span>
                                        </>
                                    )}
                                </button>
                                {status === 'error' && (
                                    <p className="text-center text-xs font-bold text-rose-500 mt-3 animate-pulse">{message}</p>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                            Powered by HIPATIA Universal Engine
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgeUniversalForm;
