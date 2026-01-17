'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, Shield, Send, Loader2, FileText, Download, Edit, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
        instrucciones_adicionales: ''
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [guideData, setGuideData] = useState<GuideCriterion[]>([]);
    const [loadingMsg, setLoadingMsg] = useState('Iniciando el Arquitecto de Guías...');

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
            const response = await fetch('https://n8n.protocolohipatia.com/webhook-test/arquitecto-guias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_token: userToken })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.guia_maestra && Array.isArray(data.guia_maestra)) {
                    setGuideData(data.guia_maestra);
                    setStatus('success');
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCellChange = (index: number, field: keyof GuideCriterion, value: string) => {
        const newData = [...guideData];
        newData[index] = { ...newData[index], [field]: value };
        setGuideData(newData);
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("HIPATIA | Informe de Evaluación", 14, 20);

        doc.setFontSize(10);
        doc.text(`Examen: ${formData.nombre_examen}`, 14, 30);
        doc.text(`Materia: ${formData.materia} - Nivel: ${formData.nivel}`, 14, 35);
        doc.text(`CCAA: ${formData.ccaa}`, 14, 40);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 45);

        // Table
        // @ts-ignore
        doc.autoTable({
            startY: 55,
            head: [['Criterio', 'Puntuación', 'Detalle']],
            body: guideData.map(row => [row.criterio, row.puntuacion.toString(), row.detalle]),
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [79, 70, 229] } // Indigo 600
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text('Generado por HIPATIA - Basado en normativa oficial.', 14, 285);
            doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
        }

        doc.save(`${formData.nombre_examen}_Guia.pdf`);
    };

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
                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Guía Generada con Éxito</h2>
                                <p className="text-xs text-slate-500">Guardada en tu biblioteca personal de Baserow</p>
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

                    <div className="flex-1 overflow-auto p-6">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
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
                                            <td className="p-4 align-top">
                                                <textarea
                                                    value={row.criterio}
                                                    onChange={(e) => handleCellChange(idx, 'criterio', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none font-bold text-slate-700 h-20"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <input
                                                    type="number"
                                                    value={row.puntuacion}
                                                    onChange={(e) => handleCellChange(idx, 'puntuacion', e.target.value)}
                                                    className="w-full bg-indigo-50 border-none rounded text-center font-bold text-indigo-700 p-2"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <textarea
                                                    value={row.detalle}
                                                    onChange={(e) => handleCellChange(idx, 'detalle', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none text-slate-600 h-20"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                        Arquitecto de Guías
                    </h1>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl shadow-indigo-900/5 border border-slate-100 p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Diseña tu Sistema de Evaluación</h2>
                            <p className="text-slate-500">Configura los parámetros y deja que la IA estructure los criterios según normativa.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            {/* Text Areas */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cuerpo del Examen (texto completo)</label>
                                <textarea
                                    required
                                    value={formData.texto_examen}
                                    onChange={(e) => handleInputChange('texto_examen', e.target.value)}
                                    placeholder="Copia y pega aquí las preguntas del examen..."
                                    rows={6}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                />
                                <p className="text-[10px] text-right text-slate-400">{formData.texto_examen.length} caracteres</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Apuntes / Contenido Referencia</label>
                                <textarea
                                    required
                                    value={formData.texto_apuntes}
                                    onChange={(e) => handleInputChange('texto_apuntes', e.target.value)}
                                    placeholder="Pega aquí el temario o los criterios base..."
                                    rows={6}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                />
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
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-[0.99] flex items-center justify-center gap-3"
                                >
                                    <Shield size={20} />
                                    Generar Guía Maestra
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
