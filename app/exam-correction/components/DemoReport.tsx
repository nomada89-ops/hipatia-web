'use client';
import React, { useState } from 'react';
import { BadgeCheck, Info, TrendingUp, BookOpen, PenTool, CheckCircle2, AlertTriangle, ArrowLeft, XCircle, FileText } from 'lucide-react';

interface DemoReportProps {
    onBack: () => void;
}

export const DemoReport: React.FC<DemoReportProps> = ({ onBack }) => {
    const [activeTip, setActiveTip] = useState<string | null>(null);

    return (
        <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden font-sans relative">
            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
                <span className="text-[12rem] font-black -rotate-45 whitespace-nowrap">HIPATIA DEMO</span>
            </div>

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expediente Demo</span>
                        <h2 className="text-sm font-black text-slate-800 tracking-tight">ALU-PRUEBA-02</h2>
                    </div>
                    <div className="h-6 w-px bg-slate-200 ml-2"></div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full ml-1">
                        <BadgeCheck size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-700">AUDITORÍA CERTIFICADA</span>
                    </div>
                </div>
            </div>

            {/* Main Content Info */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar z-10">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* 1. SECCIÓN DE COMENTARIO HUMANO */}
                    <section className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-violet-600"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Dictamen Pedagógico Global</h3>
                            <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                                <BadgeCheck size={12} /> Redactado por Agente Auditor tras consenso
                            </span>
                        </div>

                        <div className="prose prose-lg max-w-none">
                            <p className="text-slate-600 leading-8 font-serif text-lg select-none">
                                <span className="text-4xl text-indigo-200 float-left mr-2 -mt-2">"</span>
                                He realizado una lectura detenida y minuciosa de tu examen sobre la crisis del Antiguo Régimen y la construcción del Estado Liberal. Debo decirte que tienes madera de historiador/a; no solo narras hechos, sino que conectas causas y consecuencias con una madurez impropia de este nivel. Tu análisis del conflicto dinástico supera la simple memorización. Sin embargo, en un nivel de excelencia, debemos pulir la precisión terminológica y la ortografía técnica para que la forma brille tanto como el fondo. <span className="font-bold text-indigo-600">¡Confío plenamente en tu capacidad para alcanzar el sobresaliente!</span>
                            </p>
                        </div>
                    </section>

                    {/* 2. DESGLOSE MATEMÁTICO TRANSPARENTE */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>

                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp size={14} /> Transparencia Algorítmica
                            </h3>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="font-mono text-sm md:text-lg space-y-4 w-full">
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Parte 1 (Constitución 1812)</span>
                                        <span className="text-emerald-400 font-bold">+ 0.94</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Parte 2 (Reinado Isabel II)</span>
                                        <span className="text-emerald-400 font-bold">+ 3.20</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Parte 3 (Fuentes Históricas)</span>
                                        <span className="text-emerald-400 font-bold">+ 3.86</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 group relative cursor-help">
                                        <span className="text-rose-300 flex items-center gap-2 border-b border-dashed border-rose-300/30 pb-0.5" title="ACNEE Mode Active">
                                            Penalización (Ortografía) <Info size={14} />
                                        </span>
                                        <span className="text-rose-400 font-bold">- 0.30</span>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white text-slate-800 text-xs p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                            <strong>Nota ACNEE:</strong> Las faltas se han ponderado a -0.30 (vs -1.0 estándar) para priorizar la competencia histórica.
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800 p-6 rounded-2xl min-w-[180px] text-center border border-slate-700">
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Nota Final</span>
                                    <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">7.70</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. MAPA DE COMPETENCIAS VISUAL */}
                        <div className="lg:col-span-4 space-y-3">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Competencias Clave</h3>

                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><BookOpen size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Comprensión</p>
                                        <p className="text-[10px] text-slate-400">Procesos Históricos</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">ALTO</span>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><FileText size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Análisis</p>
                                        <p className="text-[10px] text-slate-400">Fuentes Documentales</p>
                                    </div>
                                </div>
                                <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-1 rounded">MUY ALTO</span>
                            </div>

                            <div
                                className="bg-white p-4 rounded-xl border-l-4 border-l-rose-400 border border-y-slate-100 border-r-slate-100 shadow-md cursor-pointer hover:bg-rose-50/30 transition-colors relative"
                                onClick={() => setActiveTip(activeTip === 'expresion' ? null : 'expresion')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-rose-50 p-2 rounded-lg text-rose-500"><PenTool size={18} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">Expresión</p>
                                            <p className="text-[10px] text-slate-400">Ortografía Técnica</p>
                                        </div>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded">MEDIO-ALTO</span>
                                </div>

                                {activeTip === 'expresion' && (
                                    <div className="mt-3 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg font-medium animate-in slide-in-from-top-1">
                                        Consejo: Debemos ser exigentes con la ortografía técnica (tildes en palabras clave como "Nación").
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 4. BLOQUES LO MEJOR / A MEJORAR */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                            <h4 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={18} /> Puntos Fuertes
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    "Uso preciso del término 'soberanía nacional' en el contexto de 1812.",
                                    "Distinción clara entre realistas y liberales.",
                                    "Estructura del ensayo muy coherente y bien hilada."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-2 text-xs md:text-sm text-slate-700">
                                        <span className="text-emerald-500">•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                            <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} /> Áreas de Mejora
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    "Omisión de la 'Pragmática Sanción' al explicar el problema sucesorio.",
                                    "Algunas tildes diacríticas ausentes.",
                                    "Profundizar más en las consecuencias sociales de la Desamortización."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-2 text-xs md:text-sm text-slate-700">
                                        <span className="text-amber-500">•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
