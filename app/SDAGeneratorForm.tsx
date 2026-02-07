'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Loader2, Zap, Download, CheckCircle, Save, AlertTriangle, FileText, Info, ArrowRight } from 'lucide-react';

interface SDAGeneratorFormProps {
    userToken: string;
    onBack: () => void;
}

export default function SDAGeneratorForm({ userToken, onBack }: SDAGeneratorFormProps) {
    const [formData, setFormData] = useState({
        materia: '',
        ccaa: '',
        nivel: '1º ESO',
        centro_interes: '',
        email_usuario: ''
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'payment_required'>('idle');
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loadingMsg, setLoadingMsg] = useState('Iniciando el Arquitecto de SDA...');
    const [errorMessage, setErrorMessage] = useState('');
    const [fileName, setFileName] = useState('SDA_Hipatia.pdf');

    const CCAA_LIST = ["Canarias", "Comunidad de Madrid", "Castilla-La Mancha"];
    const MATERIAS_1_ESO = [
        "Matemáticas", "Geografía e Historia", "Biología y Geología",
        "Lengua Castellana y Literatura", "Tecnología y Digitalización",
        "Música", "Educación Física", "Lengua Extranjera"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.centro_interes || formData.centro_interes.length < 5) {
            alert("Por favor, describe el centro de interés con más detalle.");
            return;
        }

        setStatus('sending');
        setLoadingMsg(`HIPATIA está analizando el currículo oficial de ${formData.ccaa} para ${formData.materia}...`);

        try {
            const response = await fetch('https://n8n.protocolohipatia.com/webhook-test/generar-sda-v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_token: userToken })
            });

            if (response.status === 402) {
                setStatus('payment_required');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.html && typeof data.html === 'string') {
                    setHtmlContent(data.html);
                    if (data.fileName) setFileName(data.fileName);
                    setStatus('success');
                } else {
                    throw new Error('No se recibió el diseño visual de la SDA');
                }
            } else {
                throw new Error('Error en el motor de generación');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Lo sentimos, Hipatia no ha podido generar la SDA. Por favor, revisa el centro de interés o inténtalo de nuevo.');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generatePDF = () => {
        const originalTitle = document.title;
        document.title = fileName.replace('.pdf', '');
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 100);
    };

    if (status === 'payment_required') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                        <AlertTriangle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Créditos Insuficientes</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Tu suscripción ha llegado al límite. Recarga para seguir usando la potencia de HIPATIA.
                    </p>
                    <button onClick={onBack} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'sending') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white space-y-8 p-10">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="text-amber-500 animate-pulse" size={32} />
                    </div>
                </div>
                <div className="text-center space-y-4 max-w-lg">
                    <h2 className="text-2xl font-black text-slate-900 animate-pulse">Generando Situación de Aprendizaje</h2>
                    <p className="text-slate-500 font-medium leading-relaxed italic">{loadingMsg}</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full animate-[loading_30s_ease-in-out_infinite]"></div>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes loading {
                        0% { width: 0%; }
                        50% { width: 70%; }
                        100% { width: 95%; }
                    }
                `}</style>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="h-full flex flex-col bg-slate-50 p-6 overflow-hidden">
                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        #sda-report, #sda-report * { visibility: visible; }
                        #sda-report {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            background: white !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}</style>

                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 no-print">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">SDA Generada</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Edición en vivo disponible para PDF</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStatus('idle')} className="px-6 py-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors">
                                Nueva Generación
                            </button>
                            <button onClick={generatePDF} className="px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-2">
                                <Download size={16} /> Descargar PDF
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                        <div
                            id="sda-report"
                            className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] min-h-[1123px] w-full max-w-[800px] mx-auto p-[2cm] relative"
                        >
                            <div
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="focus:outline-none"
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="glass border-b border-slate-200/50 px-8 py-5 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-slate-100">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200"><Zap size={20} /></span>
                            GENERADOR DE SDA
                        </h1>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                        Soporte LOMLOE
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-900/5 border border-slate-100 p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

                        <div className="mb-12 relative z-10">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-none">Diseña tu Situación de Aprendizaje</h2>
                            <p className="text-slate-500 font-medium text-lg">Define tu hilo conductor y HIPATIA construirá la arquitectura curricular oficial.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            {/* Row 1: CCAA y Nivel */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                        Comunidad Autónoma <Shield size={12} className="text-indigo-500" />
                                    </label>
                                    <select
                                        required
                                        value={formData.ccaa}
                                        onChange={(e) => handleInputChange('ccaa', e.target.value)}
                                        className="w-full h-16 px-6 bg-slate-50/50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {CCAA_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nivel Educativo</label>
                                    <input
                                        disabled
                                        type="text"
                                        value={formData.nivel}
                                        className="w-full h-16 px-6 bg-slate-100 border-2 border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed text-center"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Materia */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Materia (Currículo Oficial)</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {MATERIAS_1_ESO.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleInputChange('materia', m)}
                                            className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 
                                                ${formData.materia === m
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.05]'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-300'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Centro de Interés */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    Centro de Interés / Hilo Conductor <Zap size={12} className="text-amber-500" />
                                </label>
                                <textarea
                                    required
                                    value={formData.centro_interes}
                                    onChange={(e) => handleInputChange('centro_interes', e.target.value)}
                                    placeholder="Ej: El impacto de los microplásticos en las playas de mi localidad..."
                                    rows={4}
                                    className="w-full p-6 bg-slate-50/50 border-2 border-slate-100 rounded-[32px] font-bold text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                                />
                                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                        Describe el tema de forma creativa. La IA buscará en el currículo las competencias que mejor se adapten a este hilo conductor.
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-[24px] shadow-2xl hover:bg-indigo-600 hover:shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                                >
                                    PROYECTAR SDA AHORA
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                                {status === 'error' && (
                                    <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                                        <AlertTriangle size={18} />
                                        <span className="text-xs font-bold">{errorMessage}</span>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="text-center text-slate-400 text-[9px] uppercase tracking-[0.4em] font-black pb-10">
                        SISTEMA INTEGRADO DE GESTIÓN CURRICULAR V2.0
                    </div>
                </div>
            </main>
        </div>
    );
}
