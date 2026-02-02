import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface UnlockScreenProps {
    onUnlock: (isDemo?: boolean) => void;
    hwid: string;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlock, hwid }) => {
    const [secret, setSecret] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUnlocking(true);
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:8000/system/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_secret: secret })
            });

            if (res.ok) {
                onUnlock();
            } else {
                throw new Error("Secreto Inválido");
            }
        } catch (e) {
            setError("Acceso Denegado: Secreto Incorrecto");
            setSecret('');
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl text-center">

                <div className="mb-6 flex justify-center relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full"></div>
                    <img src="/logo_cuadrante.PNG" alt="Cuadrante" className="w-20 h-20 rounded-xl shadow-2xl relative z-10 border-4 border-white/10" />
                </div>

                <p className="text-indigo-300 font-mono text-xs uppercase tracking-widest mb-6">Acceso Restringido (ENS-Medio)</p>

                <p className="text-slate-400 text-sm mb-8">
                    Introduzca su Secreto Maestro para derivar claves de memoria y descifrar el cuadrante.
                </p>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="relative group">
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                            placeholder="Secreto Maestro..."
                            autoFocus
                        />
                        <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs font-semibold animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isUnlocking || !secret}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isUnlocking ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Desbloquear Cuadrante <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>HWID: {hwid.substring(0, 12)}...</span>

                    {/* DEMO LINK */}
                    <button onClick={() => onUnlock(true)} className="hover:text-amber-400 transition-colors">
                        🧪 Modo Demo
                    </button>

                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Enclave Seguro
                    </span>
                </div>
            </div>
        </div>
    );
};
