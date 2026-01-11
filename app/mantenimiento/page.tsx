import React from 'react';
import { Shield, Hammer } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 text-center">
            <div className="glass shadow-stripe rounded-[32px] p-12 max-w-xl animate-in zoom-in-95 duration-700">
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-8 animate-float">
                    <Shield size={40} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
                    Protocolo Hipatia
                </h1>
                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8 text-balance">
                    Estamos realizando mejoras técnicas para potenciar tu experiencia docente. 
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-sm font-bold animate-pulse-soft">
                    <Hammer size={16} />
                    <span>Volveremos pronto</span>
                </div>
                <div className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                    HIPATIA ACADEMIC ECOSYSTEM v4.0
                </div>
            </div>
        </div>
    );
}
