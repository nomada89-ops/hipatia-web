import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckSquare, Lock } from 'lucide-react';

interface LegalModalProps {
    forceShow?: boolean;
    onClose?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ forceShow = false, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [hasRead, setHasRead] = useState(false); // To track checkbox state

    useEffect(() => {
        // Check local storage on mount
        const alreadyAccepted = localStorage.getItem('legal_accepted') === 'true';
        if (!alreadyAccepted || forceShow) {
            setIsOpen(true);
        }

        if (alreadyAccepted && !forceShow) {
            setAccepted(true); // Auto-accept if previously done and not forced
        }
    }, [forceShow]);

    const handleAccept = () => {
        if (!hasRead) return;
        localStorage.setItem('legal_accepted', 'true');
        setAccepted(true);
        setIsOpen(false);
        if (onClose) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-full">
                        <ShieldAlert className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            AVISO DE RESPONSABILIDAD TÉCNICA Y PRIVACIDAD (LOPD)
                        </h2>
                        <p className="text-sm text-slate-500">
                            Lectura obligatoria para el acceso al sistema
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed bg-white">
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-1 flex items-center">
                                1. Naturaleza del Asistente
                            </h3>
                            <p>
                                Esta aplicación utiliza inteligencia artificial y motores de optimización para sugerir la organización de horarios. Estas sugerencias son de carácter <strong>orientativo</strong>.
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <h3 className="font-bold text-amber-800 mb-1 flex items-center">
                                2. Supervisión Humana Obligatoria
                            </h3>
                            <p>
                                El usuario (Jefe de Estudios o Dirección) es el <strong>único responsable final</strong> de validar y aprobar el horario generado. El software no sustituye el criterio de la Inspección Educativa ni exime del cumplimiento de la normativa vigente.
                            </p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 mb-1 flex items-center">
                                <Lock className="w-3 h-3 mr-1" />
                                3. Seguridad de Grado ENS-Medio
                            </h3>
                            <p>
                                En cumplimiento con la LOPD y el Esquema Nacional de Seguridad (ENS-Medio), se emplea <strong>Argon2id</strong> para la derivación de claves y un <strong>Secreto Maestro de Usuario</strong> irrecuperable. El procesamiento de Inteligencia Artificial se realiza bajo política de <strong>No-Training en Región UE</strong>, garantizando que ningún dato alimente modelos externos.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-1 flex items-center">
                                4. Exención de Responsabilidad
                            </h3>
                            <p>
                                El desarrollador no se hace responsable de las decisiones organizativas tomadas basadas en los cálculos del sistema o de posibles errores derivados de archivos XML de origen corruptos o mal formados.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 z-10">
                    <label className="flex items-start gap-3 cursor-pointer group mb-6 select-none">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={hasRead}
                                onChange={(e) => setHasRead(e.target.checked)}
                            />
                            <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
                            <CheckSquare className="w-3.5 h-3.5 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                            He leído y acepto que la validez legal del horario depende exclusivamente de mi revisión y supervisión manual.
                        </span>
                    </label>

                    <button
                        onClick={handleAccept}
                        disabled={!hasRead}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-center transition-all shadow-md flex justify-center items-center gap-2
              ${hasRead
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer transform hover:-translate-y-0.5'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }
            `}
                    >
                        {hasRead ? (
                            <>
                                <ShieldAlert className="w-5 h-5" />
                                Entrar a la Aplicación
                            </>
                        ) : (
                            "Debes aceptar los términos para continuar"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
