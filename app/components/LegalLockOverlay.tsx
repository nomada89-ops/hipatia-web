import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

const LegalLockOverlay = () => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100/40 backdrop-blur-[2px] cursor-not-allowed select-none">
            <div className="max-w-md w-full mx-4 p-8 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl text-center space-y-5 animate-in fade-in zoom-in duration-300">

                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-100 rounded-full animate-pulse"></div>
                    <Lock className="relative w-8 h-8 text-rose-500" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        Módulo en Adecuación Normativa
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Esta herramienta se encuentra temporalmente deshabilitada mientras actualizamos nuestros protocolos de privacidad y seguridad para cumplir con el nuevo marco regulatorio (LOPD/RGPD).
                    </p>
                </div>

                <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Funcionalidad Pausada</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LegalLockOverlay;
