import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface SetupWizardProps {
    onComplete: (isDemo?: boolean) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'input' | 'vault'>('input');
    const [secret, setSecret] = useState('');
    const [vault, setVault] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedSave, setConfirmedSave] = useState(false);

    const handleSetup = async () => {
        if (secret.length < 12) {
            setError("Critical Security: User Secret must be at least 12 characters.");
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:8000/system/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_secret: secret })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || "Setup Failed");

            setVault(data.recovery_vault);
            setStep('vault');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = () => {
        if (!confirmedSave) return;
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-700">
                {/* Header */}
                <div className="bg-indigo-900 p-6 flex items-center gap-4 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/logo_cuadrante.PNG')] opacity-10 blur-sm bg-cover"></div>
                    <div className="p-1 bg-white rounded-lg shadow-lg z-10">
                        <img src="/logo_cuadrante.PNG" alt="Cuadrante" className="w-12 h-12 rounded" />
                    </div>
                    <div className="z-10">
                        <h1 className="text-xl font-bold tracking-wide">ASISTENTE DE CONFIGURACIÓN</h1>
                        <p className="text-indigo-200 text-sm">Infraestructura Crítica (ENS-Alto)</p>
                    </div>
                </div>

                <div className="p-8">
                    {step === 'input' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-sm">
                                <p className="font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    ACCIÓN REQUERIDA
                                </p>
                                <p className="mt-1">
                                    Debe definir un <strong>Secreto Maestro de Usuario</strong>. Este secreto se mezcla con el ID de Hardware (HWID) para derivar matemáticamente las claves de cifrado.
                                </p>
                                <p className="mt-2 font-mono text-xs text-red-600 font-bold">
                                    SI PIERDE ESTE SECRETO, LOS DATOS SERÁN IRRECUPERABLES.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Definir Secreto Maestro (Mín. 12 Caracteres)
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        value={secret}
                                        onChange={(e) => setSecret(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                        placeholder="Ej: Corre-Caballo-Bateria-Grapa..."
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Fortaleza: {secret.length >= 20 ? 'Excelente' : secret.length >= 12 ? 'Aceptable' : 'Débil'}</span>
                                    <span>{secret.length} / 12 chars</span>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleSetup}
                                disabled={isSubmitting || secret.length < 12}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded font-bold shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? 'Blindando Sistema...' : 'Inicializar Núcleo Seguro'}
                            </button>

                            {/* DEMO MODE BUTTON */}
                            <div className="pt-4 border-t border-slate-200 mt-4 text-center">
                                <p className="text-xs text-slate-400 mb-2">¿Solo quieres probar la interfaz?</p>
                                <button
                                    onClick={() => onComplete(true)} // Pass true to signal Demo Mode
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                                >
                                    🧪 Explorar Modo Demo (Datos Ficticios)
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'vault' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Sistema Inicializado y Bloqueado</h2>
                            </div>

                            <div className="p-4 bg-slate-900 text-slate-100 rounded border border-slate-700 font-mono text-sm break-all relative group">
                                <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Bóveda de Recuperación (Guardar YA)</p>
                                {vault}
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(vault); alert("Copiado al Portapapeles"); }}
                                        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-800 rounded border border-red-200 text-sm">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Advertencia de Migración de Hardware</p>
                                    <p>Sus datos están vinculados a esta máquina (HWID). Si mueve Cuadrante a otro PC, necesitará esta Bóveda + Su Secreto.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="confirm"
                                    checked={confirmedSave}
                                    onChange={(e) => setConfirmedSave(e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 rounded"
                                />
                                <label htmlFor="confirm" className="text-sm text-slate-700 font-medium select-none">
                                    He guardado la Bóveda de Recuperación en lugar seguro (USB).
                                </label>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={!confirmedSave}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale text-white py-3 rounded font-bold shadow-lg transition-all"
                            >
                                Reconocer y Desbloquear
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
