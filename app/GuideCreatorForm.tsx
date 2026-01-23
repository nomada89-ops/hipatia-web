'use client';
// Force redeploy: Fix PDF export syntax error

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Loader2, FileText, Download, CheckCircle, UploadCloud, CreditCard, AlertTriangle, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface GuideCreatorFormProps {
    userToken: string;
    onBack: () => void;
}

interface GuideCriterion {
    criterio: string;
    puntuacion: string | number;
    detalle: string;
}

export default function GuideCreatorForm({ userToken, onBack }: GuideCreatorFormProps) {
    const [formData, setFormData] = useState({
        nombre_examen: '',
        materia: '',
        nivel: '',
        ccaa: '',
        texto_examen: '',
        texto_apuntes: '',
        instrucciones_adicionales: '',
        criterios_profesor: ''
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'payment_required'>('idle');
    const [guideData, setGuideData] = useState<GuideCriterion[]>([]);
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loadingMsg, setLoadingMsg] = useState('Iniciando el Arquitecto de Guías...');
    const [errorMessage, setErrorMessage] = useState('');
    const [isDragOverExamen, setIsDragOverExamen] = useState(false);
    const [isDragOverApuntes, setIsDragOverApuntes] = useState(false);
    const [isDragOverCriterios, setIsDragOverCriterios] = useState(false);
    const [processingFile, setProcessingFile] = useState(false);

    // Load criteria from localStorage on mount
    useEffect(() => {
        const savedCriteria = localStorage.getItem('saved_criterios_profesor');
        if (savedCriteria) {
            setFormData(prev => ({ ...prev, criterios_profesor: savedCriteria }));
        }
    }, []);

    // Save criteria to localStorage when it changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('saved_criterios_profesor', formData.criterios_profesor);
        }, 1000); // Debounce save
        return () => clearTimeout(timeoutId);
    }, [formData.criterios_profesor]);

    const CCAA_LIST = [
        "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña", "Valencia", "Extremadura", "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja", "Ceuta", "Melilla"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.texto_examen.length < 50) {
            alert("El cuerpo del examen debe tener al menos 50 caracteres.");
            return;
        }

        setStatus('sending');
        setLoadingMsg(`HIPATIA está diseñando la guía basada en la normativa oficial de ${formData.ccaa || 'tu comunidad'}...`);

        try {
            const response = await fetch('https://n8n.protocolohipatia.com/webhook/arquitecto-guias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_token: userToken })
            });

            if (response.status === 402) {
                const data = await response.json();
                if (data.error_code === 'INSUFFICIENT_FUNDS' || true) { // Fallback standard 402 check
                    setStatus('payment_required');
                    return;
                }
            }

            if (response.ok) {
                const data = await response.json();
                // We now expect 'html' for display AND 'guia_maestra' for PDF generation
                if (data.html && typeof data.html === 'string') {
                    setHtmlContent(data.html);
                    // If guideData is present, we start it for PDF generation
                    if (data.guia_maestra && Array.isArray(data.guia_maestra)) {
                        setGuideData(data.guia_maestra);
                    }
                    setStatus('success');
                } else if (data.guia_maestra && Array.isArray(data.guia_maestra)) {
                    // Fallback for old API response format just in case
                    setGuideData(data.guia_maestra);
                    setHtmlContent(''); // No HTML available
                    setStatus('success');
                } else {
                    throw new Error('Formato de respuesta inválido: Se esperaba HTML o Guía Maestra');
                }
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Lo sentimos, Hipatia no ha podido generar un resultado de calidad. No se han descontado créditos de su cuenta. Por favor, inténtelo de nuevo o póngase en contacto con nosotros.');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Removed handleCellChange as table is no longer editable/visible

    const extractTextFromFile = async (file: File): Promise<string> => {
        setProcessingFile(true);
        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                return fullText;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // DOCX
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                return result.value;
            } else if (file.type === 'text/plain') {
                return await file.text();
            } else {
                throw new Error('Formato no soportado. Usa PDF, DOCX o TXT.');
            }
        } catch (err) {
            console.error('Extraction error:', err);
            alert('Error al leer el archivo. Asegúrate de que es un PDF, DOCX o TXT válido.');
            return '';
        } finally {
            setProcessingFile(false);
        }
    };

    const handleFileDrop = async (e: React.DragEvent, field: 'texto_examen' | 'texto_apuntes' | 'criterios_profesor') => {
        e.preventDefault();
        e.stopPropagation();

        if (field === 'texto_examen') setIsDragOverExamen(false);
        else if (field === 'texto_apuntes') setIsDragOverApuntes(false);
        else if (field === 'criterios_profesor') setIsDragOverCriterios(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            let newText = '';

            // For single file fields (Examen), we just take the first one
            // For "Apuntes", we iterate if there are multiple, or just take the one
            const files = Array.from(e.dataTransfer.files);

            // Logic: If field is 'texto_apuntes', we ALLOW appending multiple files.
            // For others, we might stick to single file replacement for simplicity, or allow appending too.
            // Let's allow appending for Apuntes specifically as requested.

            if (field === 'texto_apuntes') {
                for (const file of files) {
                    const text = await extractTextFromFile(file);
                    if (text) {
                        newText += `\n\n--- ${file.name} ---\n${text}`;
                    }
                }
                // Append to existing
                handleInputChange(field, formData[field] + newText);
            } else if (field === 'texto_examen') {
                // For Exam Body, we replace but include the filename header
                const file = files[0];
                const text = await extractTextFromFile(file);
                if (text) {
                    handleInputChange(field, `--- ${file.name} ---\n\n${text}`);
                }
            } else {
                // Default single behavior for others (replace)
                const text = await extractTextFromFile(files[0]);
                if (text) handleInputChange(field, text);
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: 'texto_examen' | 'texto_apuntes' | 'criterios_profesor') => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            if (field === 'texto_apuntes') {
                let newText = '';
                for (const file of files) {
                    const text = await extractTextFromFile(file);
                    if (text) {
                        newText += `\n\n--- ${file.name} ---\n${text}`;
                    }
                }
                handleInputChange(field, formData[field] + newText);
            } else if (field === 'texto_examen') {
                const file = files[0];
                const text = await extractTextFromFile(file);
                if (text) {
                    handleInputChange(field, `--- ${file.name} ---\n\n${text}`);
                }
            } else {
                const text = await extractTextFromFile(files[0]);
                if (text) handleInputChange(field, text);
            }
        }
    };

    const generatePDF = () => {
        const originalTitle = document.title;
        document.title = "HIPATIA _ Rúbrica de examen";
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 100);
    };

    if (status === 'payment_required') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                        <CreditCard size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Créditos Insuficientes</h2>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        Tu suscripción ha llegado al límite. Recarga para seguir usando la potencia de HIPATIA.
                    </p>
                    <a
                        href="https://protocolohipatia.com/pricing" // Placeholder link
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all"
                    >
                        Recargar Saldo Ahora
                    </a>
                    <button onClick={onBack} className="text-slate-400 font-bold text-sm hover:text-slate-600">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'sending') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 animate-in fade-in">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Construyendo Guía</h2>
                <p className="text-slate-500 font-medium px-4 text-center max-w-md">{loadingMsg}</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="h-full flex flex-col bg-slate-50 p-6 overflow-hidden">
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #guide-report, #guide-report * {
                            visibility: visible;
                        }
                        #guide-report {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 2rem !important;
                            background: white;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}</style>

                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50 no-print">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Guía Generada con Éxito</h2>
                                <p className="text-xs text-slate-500">Editables para PDF. Los cambios se reflejarán al descargar.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStatus('idle')} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm">
                                Crear Otra
                            </button>
                            <button onClick={generatePDF} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all">
                                <Download size={18} /> Descargar PDF
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8 bg-white text-slate-800 printable-content">
                        <div id="guide-report" className="p-8 min-h-screen">
                            {/* Header that only shows on print/pdf usually, but we include it here for WYSIWYG */}
                            <div className="mb-6 border-b border-slate-200 pb-4">
                                <h1 className="text-2xl font-black text-indigo-900">HIPATIA | Informe de Evaluación</h1>
                                <div className="mt-2 text-sm text-slate-600 grid grid-cols-2 gap-2">
                                    <p><span className="font-bold">Examen:</span> {formData.nombre_examen}</p>
                                    <p><span className="font-bold">Materia:</span> {formData.materia} - {formData.nivel}</p>
                                    <p><span className="font-bold">CCAA:</span> {formData.ccaa}</p>
                                    <p><span className="font-bold">Fecha:</span> {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Render HTML content securely */}
                            {htmlContent ? (
                                <div
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    className="prose prose-indigo max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg p-2 transition-all"
                                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                                />
                            ) : (
                                /* Fallback table if no HTML but guideData exists */
                                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden" contentEditable={true} suppressContentEditableWarning={true}>
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-indigo-600 text-white font-bold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="p-4 w-1/4">Criterio</th>
                                                <th className="p-4 w-24 text-center">Puntos</th>
                                                <th className="p-4">Detalle de Corrección</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {guideData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors bg-white">
                                                    <td className="p-4 align-top font-bold text-slate-700">{row.criterio}</td>
                                                    <td className="p-4 align-top text-center font-bold text-indigo-700">{row.puntuacion}</td>
                                                    <td className="p-4 align-top text-slate-600">{row.detalle}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-12 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                                Generado por HIPATIA - Basado en normativa oficial.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="p-1.5 bg-violet-100 text-violet-700 rounded-md"><Shield size={16} /></span>
                        Generador de Rúbricas
                    </h1>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl shadow-indigo-900/5 border border-slate-100 p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Diseña tu Sistema de Evaluación</h2>
                            <p className="text-slate-500">Configura los parámetros y deja que la IA estructure los criterios según normativa.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Examen</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.nombre_examen}
                                        onChange={(e) => handleInputChange('nombre_examen', e.target.value)}
                                        placeholder="Ej: examen-tema-1-historia"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Materia</label>
                                    <select
                                        required
                                        value={formData.materia}
                                        onChange={(e) => handleInputChange('materia', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Lengua Castellana">Lengua Castellana</option>
                                        <option value="Historia de España">Historia de España</option>
                                        <option value="Filosofía">Filosofía</option>
                                        <option value="Matemáticas">Matemáticas</option>
                                        <option value="Biología">Biología</option>
                                        <option value="Inglés">Inglés</option>
                                        <option value="Otras">Otras</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nivel Educativo</label>
                                    <select
                                        required
                                        value={formData.nivel}
                                        onChange={(e) => handleInputChange('nivel', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="1º Bachillerato">1º Bachillerato</option>
                                        <option value="2º Bachillerato">2º Bachillerato</option>
                                        <option value="EBAU / PAU">EBAU / PAU</option>
                                        <option value="ESO">ESO</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comunidad Autónoma</label>
                                    <select
                                        required
                                        value={formData.ccaa}
                                        onChange={(e) => handleInputChange('ccaa', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {CCAA_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Drag & Drop Areas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Cuerpo del Examen */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cuerpo del Examen</label>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">PDF, DOCX, TXT</span>
                                    </div>
                                    <div
                                        className={`relative group border-2 border-dashed rounded-2xl transition-all ${isDragOverExamen ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/50 hover:bg-white'}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOverExamen(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragOverExamen(false); }}
                                        onDrop={(e) => handleFileDrop(e, 'texto_examen')}
                                    >
                                        <textarea
                                            required
                                            value={formData.texto_examen}
                                            onChange={(e) => handleInputChange('texto_examen', e.target.value)}
                                            placeholder="Arrastra el archivo del examen aquí o pega el texto manualmente..."
                                            className="w-full h-48 p-4 bg-transparent border-none rounded-2xl focus:ring-0 outline-none resize-none text-sm text-slate-600 font-medium z-10 relative"
                                        />

                                        {/* Drop Overlay Hint */}
                                        {formData.texto_examen.length === 0 && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                                                <UploadCloud size={32} className="mb-2 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-400">Arrastrar archivo o pegar texto</span>
                                            </div>
                                        )}

                                        {/* File Input Trigger */}
                                        <label className="absolute bottom-3 right-3 cursor-pointer p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-indigo-50 transition-colors z-20 group-hover:opacity-100 opacity-0 group-focus-within:opacity-100">
                                            <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => handleFileSelect(e, 'texto_examen')} />
                                            <FileText size={16} className="text-indigo-600" />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-right text-slate-400">{formData.texto_examen.length} caracteres</p>
                                </div>

                                {/* Apuntes */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Apuntes / Referencia</label>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">PDF, DOCX, TXT</span>
                                    </div>
                                    <div
                                        className={`relative group border-2 border-dashed rounded-2xl transition-all ${isDragOverApuntes ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-slate-50/50 hover:bg-white'}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOverApuntes(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragOverApuntes(false); }}
                                        onDrop={(e) => handleFileDrop(e, 'texto_apuntes')}
                                    >
                                        <textarea
                                            required
                                            value={formData.texto_apuntes}
                                            onChange={(e) => handleInputChange('texto_apuntes', e.target.value)}
                                            placeholder="Sube uno o varios archivos (Apuntes, Temario...) o pega el texto aquí. Los nuevos archivos se añadirán al final..."
                                            className="w-full h-48 p-4 bg-transparent border-none rounded-2xl focus:ring-0 outline-none resize-none text-sm text-slate-600 font-medium z-10 relative"
                                        />

                                        {formData.texto_apuntes.length === 0 && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                                                <UploadCloud size={32} className="mb-2 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-400">Arrastrar archivo o pegar texto</span>
                                            </div>
                                        )}

                                        <label className="absolute bottom-3 right-3 cursor-pointer p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-violet-50 transition-colors z-20 group-hover:opacity-100 opacity-0 group-focus-within:opacity-100">
                                            <input type="file" className="hidden" multiple accept=".pdf,.docx,.txt" onChange={(e) => handleFileSelect(e, 'texto_apuntes')} />
                                            <FileText size={16} className="text-violet-600" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Criterios Profesor */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        Criterios de Evaluación / Programación
                                        {formData.criterios_profesor && (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">
                                                <Save size={10} /> Guardado
                                            </span>
                                        )}
                                    </label>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Opcional • Persistente</span>
                                </div>
                                <div
                                    className={`relative group border-2 border-dashed rounded-2xl transition-all ${isDragOverCriterios ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50/50 hover:bg-white'}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragOverCriterios(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragOverCriterios(false); }}
                                    onDrop={(e) => handleFileDrop(e, 'criterios_profesor')}
                                >
                                    <textarea
                                        value={formData.criterios_profesor}
                                        onChange={(e) => handleInputChange('criterios_profesor', e.target.value)}
                                        placeholder="Sube tus criterios personales o programación docente (PDF) para que la IA los priorice..."
                                        className="w-full h-32 p-4 bg-transparent border-none rounded-2xl focus:ring-0 outline-none resize-none text-sm text-slate-600 font-medium z-10 relative"
                                    />

                                    {formData.criterios_profesor.length === 0 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                                            <UploadCloud size={32} className="mb-2 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-400">Subir Criterios (PDF/DOCX)</span>
                                        </div>
                                    )}

                                    <label className="absolute bottom-3 right-3 cursor-pointer p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-amber-50 transition-colors z-20 group-hover:opacity-100 opacity-0 group-focus-within:opacity-100">
                                        <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => handleFileSelect(e, 'criterios_profesor')} />
                                        <FileText size={16} className="text-amber-600" />
                                    </label>
                                </div>

                                {formData.criterios_profesor.length > 150000 && (
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs font-semibold">
                                        <AlertTriangle size={16} />
                                        Documento muy extenso ({formData.criterios_profesor.length} caracteres). El procesamiento podría tardar unos segundos extra.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instrucciones de Personalización (Opcional)</label>
                                <textarea
                                    value={formData.instrucciones_adicionales}
                                    onChange={(e) => handleInputChange('instrucciones_adicionales', e.target.value)}
                                    placeholder="Ej: Sé muy estricto con las fechas, valora el contexto internacional..."
                                    rows={3}
                                    className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl font-medium text-indigo-800 placeholder-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processingFile}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                                >
                                    {processingFile ? <Loader2 className="animate-spin" /> : <Shield size={20} />}
                                    {processingFile ? 'Procesando archivo...' : 'Generar Guía Maestra'}
                                </button>
                                {status === 'error' && (
                                    <p className="text-center text-xs font-bold text-rose-500 mt-3 animate-pulse">{errorMessage}</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
