'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Type, RefreshCw, Printer, AlertCircle, Lock, ChevronRight } from 'lucide-react';

interface ForgeFormProps {
    onBack: () => void;
    userToken: string;
}

export default function ForgeForm({ onBack, userToken }: ForgeFormProps) {
    const [loading, setLoading] = useState(false);
    const [examHtml, setExamHtml] = useState<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        user_token: userToken,
        unidades: '',
        conceptos: '',
        instrucciones_profesor: '',
        modo_dislexia: false,
    });
    const [isDyslexic, setIsDyslexic] = useState(false);

    // Conexión con n8n esperando JSON { "html": "..." }
    const handleGenerate = async () => {
        if (!formData.unidades || !formData.conceptos) {
            alert("Por favor, rellena Unidades y Conceptos.");
            return;
        }

        setLoading(true);

        try {
            const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_FORGE || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/generar-examen';

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.html) {
                setExamHtml(data.html);
            } else {
                throw new Error("La respuesta no contiene la propiedad 'html' esperada.");
            }

        } catch (error: any) {
            console.error("Error en generación:", error);
            alert('Lo sentimos, Hipatia no ha podido generar un resultado de calidad. No se han descontado créditos de su cuenta. Por favor, inténtelo de nuevo o póngase en contacto con nosotros.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setExamHtml(null);
        setLoading(false);
    };

    // --- VISTA EDITOR / PREVISUALIZACIÓN ---
    if (examHtml) {
        return (
            <div className={`h-screen overflow-hidden flex flex-col font-sans print:bg-white print:h-auto print:overflow-visible ${isDyslexic ? 'font-dyslexic' : ''}`}>
                {/* Header - Oculto al imprimir */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md print:hidden z-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-violet-400">HIPAT<span className="text-white">IA</span></span> Editor
                        </h2>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Modo Edición en Vivo</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 mr-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modo Dislexia</span>
                            <button
                                onClick={() => setIsDyslexic(!isDyslexic)}
                                className={`w-10 h-6 rounded-full flex items-center transition-colors p-1 ${isDyslexic ? 'bg-violet-500 justify-end' : 'bg-slate-700 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>

                        <div className="text-xs text-amber-400 flex items-center gap-2 mr-4 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-700/50">
                            <AlertCircle size={14} />
                            <span>Puedes editar el texto directamente abajo</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Printer size={18} /> IMPRIMIR / PDF
                        </button>
                    </div>
                </div>

                {/* Área de Edición (Papel) */}
                <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8 print:p-0 print:overflow-visible flex justify-center custom-scrollbar">
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning={true}
                        className="bg-white shadow-2xl p-6 md:p-[2cm] max-w-5xl w-full min-h-[297mm] outline-none print:shadow-none print:w-full print:max-w-none print:p-0 print:min-h-0 forge-editor-content transition-all"
                        dangerouslySetInnerHTML={{ __html: examHtml }}
                    />
                </div>

                {/* Inject OpenDyslexic Font and Base Styles (Fixed) */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Fonts - Using correct CDN package */
                    @font-face {
                        font-family: 'OpenDyslexic';
                        src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/otf/OpenDyslexic-Regular.otf') format('opentype');
                        src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff'),
                             url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Regular.ttf') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }
                    @font-face {
                        font-family: 'OpenDyslexic';
                        src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/otf/OpenDyslexic-Bold.otf') format('opentype');
                        src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff'),
                             url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Bold.ttf') format('truetype');
                        font-weight: bold;
                        font-style: normal;
                    }

                    .font-dyslexic * { font-family: 'OpenDyslexic', sans-serif !important; }

                    /* Editor Base Styles */
                    .forge-editor-content {
                        font-family: 'Times New Roman', Times, serif; /* Default, overridable by inner CSS */
                        line-height: 1.5;
                        color: black;
                    }

                    /* Styling for print media - Optimized for A4 PDF */
                    @media print {
                        @page {
                            size: A4;
                            margin: 2cm;
                        }
                        
                        body {
                            background: white !important;
                            -webkit-print-color-adjust: exact;
                        }

                        /* Force reset of all containers to allow paging */
                        html, body, #__next, div[class*="min-h-screen"], div[class*="h-screen"] {
                            height: auto !important;
                            overflow: visible !important;
                        }

                        /* Hide UI elements */
                        button, .no-print {
                            display: none !important;
                        }

                        /* Content styling */
                        div[contenteditable] {
                            box-shadow: none !important;
                            max-width: 100% !important;
                            width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            font-size: 11pt !important; /* Standard academic size */
                            line-height: 1.4 !important;
                        }

                        /* Prevent awkward breaks */
                        h1, h2, h3 {
                            break-after: avoid;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            break-inside: avoid;
                        }
                        p, li {
                            break-inside: avoid;
                            widows: 3;
                            orphans: 3;
                        }
                        
                        /* Fix overflow clipping */
                        * {
                            overflow: visible !important;
                        }
                    }
                `}} />
            </div>
        );
    }

    // --- VISTA FORMULARIO ---
    return (
        <div className="flex-1 h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Nav Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>HIPAT<span className="text-violet-600">IA</span></span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Generador</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col items-center">
                <div className="w-full max-w-3xl space-y-6 animate-in fade-in zoom-in-95 duration-300 p-4 md:p-6 pb-20">
                    <div className="text-center space-y-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Diseña, <span className="text-indigo-600">Edita</span> e Imprime</h2>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                    <FileText size={14} className="text-indigo-500" /> Unidades Didácticas
                                </label>
                                <input
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 font-medium text-sm placeholder:text-slate-300 shadow-inner"
                                    placeholder="Ej: El Sexenio Democrático..."
                                    value={formData.unidades}
                                    onChange={(e) => setFormData({ ...formData, unidades: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                    <Type size={14} className="text-indigo-500" /> Conceptos Clave
                                </label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all h-28 resize-none text-slate-700 font-medium text-sm placeholder:text-slate-300 shadow-inner"
                                    placeholder="Lista de conceptos separados por comas..."
                                    value={formData.conceptos}
                                    onChange={(e) => setFormData({ ...formData, conceptos: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                    <FileText size={14} className="text-indigo-500" /> Tema del Examen / Instrucciones Adicionales
                                </label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all h-28 resize-none text-slate-700 font-medium text-sm placeholder:text-slate-300 shadow-inner"
                                    placeholder="Escribe aquí las instrucciones específicas para el examen..."
                                    value={formData.instrucciones_profesor}
                                    onChange={(e) => setFormData({ ...formData, instrucciones_profesor: e.target.value })}
                                />
                            </div>



                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`w-full py-4 text-lg font-black text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 shadow-indigo-200'}`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={20} />
                                        <span className="text-sm">GENERANDO...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>CREAR EXAMEN</span>
                                        <ChevronRight size={20} className="text-white/60" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
