'use client';
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Shield, FileText, Zap, Award, CheckCircle, BarChart3, HelpCircle } from 'lucide-react';

const STEPS = [
    {
        title: "Paso 1: Configura el Contexto",
        desc: "Elige entre materia universal o Historia UCLM. Tus datos se anonimizan automáticamente.",
        icon: Shield,
        color: "text-indigo-600",
        bg: "bg-indigo-100"
    },
    {
        title: "Paso 2: Carga tu Rúbrica",
        desc: "Sube tu guía de corrección. El sistema justificará matemáticamente cada nota.",
        icon: FileText,
        color: "text-emerald-600",
        bg: "bg-emerald-100"
    },
    {
        title: "Paso 3: Elige la Exigencia",
        desc: "Define si el alumno es Estándar, Estricto o ACNEE para ajustar penalizaciones.",
        icon: BarChart3,
        color: "text-amber-600",
        bg: "bg-amber-100"
    },
    {
        title: "Paso 4: Sube y Analiza",
        desc: "Arrastra las fotos. El Juez y el Auditor consensuarán un feedback humano.",
        icon: Zap,
        color: "text-violet-600",
        bg: "bg-violet-100"
    },
    {
        title: "Paso 5: Mapa de Competencias",
        desc: "Revisa los niveles de logro (Alto, Medio, Bajo) y consejos de mejora.",
        icon: Award,
        color: "text-rose-600",
        bg: "bg-rose-100"
    },
    {
        title: "Paso 6: Crea Material Nuevo",
        desc: "Usa el generador para crear exámenes a partir de tus propios PDFs.",
        icon: CheckCircle,
        color: "text-blue-600",
        bg: "bg-blue-100"
    }
];

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowSample: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onShowSample }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const StepIcon = STEPS[currentStep].icon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden relative border border-white/20">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    ></div>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="p-8 pb-10 text-center">
                    <div className={`w-20 h-20 ${STEPS[currentStep].bg} rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm transition-colors duration-500`}>
                        <StepIcon size={40} className={`${STEPS[currentStep].color} transition-colors duration-500`} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-500 key={currentStep}">
                        {STEPS[currentStep].title}
                    </h2>

                    <p className="text-slate-500 text-lg leading-relaxed mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-75 key={currentStep + 'desc'}">
                        {STEPS[currentStep].desc}
                    </p>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            disabled={currentStep === 0}
                            className={`p-3 rounded-xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex gap-2">
                            {STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-indigo-600 w-6' : 'bg-slate-200'}`}
                                />
                            ))}
                        </div>

                        {currentStep < STEPS.length - 1 ? (
                            <button
                                onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Siguiente <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => { onClose(); onShowSample(); }}
                                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-indigo-500/30 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Ver Ejemplo <Award size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
