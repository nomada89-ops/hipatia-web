import React from 'react';
import { Loader2, ShieldCheck, FileText, UserX } from 'lucide-react';

interface ProcessingStatusProps {
    isVisible: boolean;
    status: string;
    progress: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ isVisible, status, progress }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-md p-8 overflow-hidden bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md">

                {/* Decorative Background Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="relative flex flex-col items-center text-center space-y-6">

                    {/* Icon Animation */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px] animate-spin-slow">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {progress > 50 ? (
                                <UserX className="w-6 h-6 text-emerald-400 animate-pulse" /> // Anonymizing
                            ) : (
                                <FileText className="w-6 h-6 text-indigo-400" /> // Reading
                            )}
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            Procesando Documentos
                        </h3>
                        <p className="text-slate-300 font-medium text-sm animate-pulse">
                            {status}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full space-y-2">
                        <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            <span>OCR</span>
                            <span>{Math.round(progress)}%</span>
                            <span>Anonimización</span>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Procesamiento 100% Local</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProcessingStatus;
