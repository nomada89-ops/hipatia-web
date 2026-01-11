'use client';
import React, { useState } from 'react';
import { HelpCircle, PlayCircle, BookOpen, X } from 'lucide-react';

export const HelpFab: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'guide' | 'demo'>('guide');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-white border border-slate-200 shadow-xl rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:scale-110 transition-all z-40 group"
            >
                <HelpCircle size={28} />
                <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Ayuda
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                    <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 relative flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900">Centro de Ayuda</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('guide')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'guide' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <BookOpen size={16} /> Guía Rápida
                            </button>
                            <button
                                onClick={() => setActiveTab('demo')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'demo' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <PlayCircle size={16} /> Demo en Acción
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'guide' ? (
                                <div className="space-y-6">
                                    {[
                                        { step: 1, title: "Configura", desc: "Elige materia universal o Historia UCLM." },
                                        { step: 2, title: "Rúbrica", desc: "Carga tu guía. La IA anonimiza los datos." },
                                        { step: 3, title: "Exigencia", desc: "Selecciona Estricto, Estándar o ACNEE." },
                                        { step: 4, title: "Sube", desc: "Arrastra fotos. Juez y Auditor consensúan." },
                                        { step: 5, title: "Revisión", desc: "Mapa de competencias y feedback." },
                                        { step: 6, title: "Genera", desc: "Crea nuevos exámenes desde tus PDFs." }
                                    ].map((item) => (
                                        <div key={item.step} className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0 text-sm">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 relative overflow-hidden group">
                                        {/* Placeholder for Video/GIF */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
                                            <PlayCircle size={48} className="text-indigo-200 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <p className="relative z-10 text-xs font-bold text-slate-400 uppercase tracking-widest mt-20">Demo Video Placeholder</p>
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-xs">
                                        Visualiza el flujo completo: desde la carga de la rúbrica hasta la generación del informe ACNEE.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
