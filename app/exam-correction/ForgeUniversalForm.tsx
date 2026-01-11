'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Upload, Zap, Eye, Printer, Loader2, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import { processFileText } from './utils';

interface ForgeUniversalFormProps {
    onBack: () => void;
    userToken: string;
}

const ForgeUniversalForm: React.FC<ForgeUniversalFormProps> = ({ onBack, userToken }) => {
    // Estados del Formulario
    const [temarioFile, setTemarioFile] = useState<File | null>(null);
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
    const [guiaData, setGuiaData] = useState<any>(null); // Para persistencia
    const [isDyslexic, setIsDyslexic] = useState(false);

    // Refs
    const temarioInputRef = useRef<HTMLInputElement>(null);
    const modeloInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    // --- MANEJADORES DE ARCHIVOS ---
    const handleTemarioFile = async (file: File) => {
        setIsExtractingTemario(true);
        try {
            const text = await processFileText(file);
            setTemarioText(text);
            setTemarioFile(file);
        } catch (error) {
            console.error('Error procesando temario:', error);
            alert('Error al leer el archivo de temario.');
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
                texto_temario: temarioText,
                texto_modelo_examen: modeloText, // Opcional
                configuracion: {
                    nivel: nivel,
                    num_preguntas: Number(numPreguntas),
                    instrucciones_profesor: instrucciones
                }
            };

            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_FORGE_UNIVERSAL || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/generar-examen_generico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();

            // Procesar respuesta
            const htmlContent = data.examen_html || data.output || '<h3>Error: Sin contenido generado</h3>';
            setExamHtml(htmlContent);
            setGuiaData(data.guia_correccion_data || null);

            setStatus('success');
        } catch (error) {
            console.error('Generation invalid:', error);
            setStatus('error');
            setMessage('Hubo un error al generar el examen. Revisa tu conexión.');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- PERSISTENCIA / IMPRESIÓN ---
    const handlePrint = () => {
        // Simular persistencia en segundo plano
        if (guiaData) {
            console.log('Guardando guía de corrección en DB (Simulado)...', guiaData);
            // Aquí iría la llamada a DB real
            localStorage.setItem('last_generated_multiversal_guia', JSON.stringify(guiaData));
        }
        window.print();
    };

    const handleReset = () => {
        if (confirm('¿Descartar examen y volver al generador?')) {
            setExamHtml(null);
            setGuiaData(null);
            setStatus('idle');
            setMessage('');
        }
    };

    // --- VISTA EDITOR / PREVISUALIZACIÓN ---
    if (examHtml) {
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
                        <div className="flex items-center gap-2 mr-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modo Lectura</span>
                            <button
                                onClick={() => setIsDyslexic(!isDyslexic)}
                                className={`w-10 h-6 rounded-full flex items-center transition-colors p-1 ${isDyslexic ? 'bg-violet-500 justify-end' : 'bg-slate-700 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>

                        <div className="text-xs text-amber-400 flex items-center gap-2 mr-4 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-700/50">
                            <AlertCircle size={14} />
                            <span>Contenido Editable</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg shadow-lg shadow-violet-900/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Printer size={18} />
                            IMPRIMIR / GUARDAR
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-8 print:p-0 print:bg-white">
                    <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[20mm] print:shadow-none print:p-0">
                        <div
                            ref={editorRef}
                            className="prose prose-slate max-w-none outline-none"
                            contentEditable
                            suppressContentEditableWarning
                            dangerouslySetInnerHTML={{ __html: examHtml }}
                        />
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
                            <span>HIPAT<span className="text-violet-600">IA</span></span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Forge Universal</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-300 p-4 md:p-6 pb-20">

                    {/* Header Copy */}
                    <div className="text-center space-y-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                            Forja exámenes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Cualquier Materia</span>
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
                                        <input ref={temarioInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleTemarioFile(e.target.files[0])} accept=".pdf,.docx,.txt" />

                                        {isExtractingTemario ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                                                <span className="text-xs font-bold text-violet-400">Analizando temario...</span>
                                            </div>
                                        ) : temarioText ? (
                                            <div className="flex flex-col items-center gap-2 text-center w-full">
                                                <div className="bg-white p-1.5 rounded-full shadow-sm text-emerald-500"><CheckCircle size={20} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">Temario Procesado</p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[200px] mx-auto">{temarioFile?.name}</p>
                                                    <p className="text-[9px] text-emerald-600 font-mono mt-1">{(temarioText.length / 1000).toFixed(1)}k caracteres</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <Upload className="h-6 w-6 text-slate-300 mx-auto group-hover:text-violet-500 transition-colors" />
                                                <p className="text-xs font-bold text-slate-600 group-hover:text-violet-600 transition-colors">Sube tus apuntes (Opcional)</p>
                                                <p className="text-[9px] text-slate-400">PDF, DOCX o TXT</p>
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
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración del Forjado</h3>
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

                            {/* ACTION BUTTON */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isGenerating || !instrucciones.trim()}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3
                                    ${isGenerating
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'}`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                                            <span>Forjando Examen Universal...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5 text-violet-400" />
                                            <span>Generar Examen</span>
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
