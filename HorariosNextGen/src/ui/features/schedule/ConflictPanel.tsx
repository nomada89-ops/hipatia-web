import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export interface Conflict {
    id: string;
    type: 'CRITICAL' | 'WARNING';
    message: string;
    affectedIds: string[]; // IDs of teachers / groups / slots involved
}

interface ConflictPanelProps {
    conflicts: Conflict[];
    onHighlight: (ids: string[]) => void;
}

export const ConflictPanel: React.FC<ConflictPanelProps> = ({ conflicts, onHighlight }) => {
    if (conflicts.length === 0) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                    <span className="text-sm text-emerald-700 font-medium">Sin conflictos activos</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full max-h-[80vh]">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                    Conflictos e Incompatibilidades
                </h3>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {conflicts.length}
                </span>
            </div>

            <div className="overflow-y-auto p-2 space-y-2 flex-1">
                {conflicts.length === 0 ? (
                    <div className="text-xs text-slate-400 p-2 text-center italic">Sin conflictos activos</div>
                ) : (
                    conflicts.map((conflict) => (
                        <div
                            key={conflict.id}
                            onClick={() => onHighlight(conflict.affectedIds)}
                            className="p-3 bg-red-50 border border-red-100 rounded-md cursor-pointer hover:bg-red-100 transition-colors group relative"
                        >
                            <div className="flex items-start">
                                <Info className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm text-red-700 font-medium leading-tight">
                                        {conflict.message}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-red-400">
                                            Click para resaltar
                                        </p>
                                        <button
                                            className="text-[10px] bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded border border-red-200 flex items-center transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alert("Mostrando Artículos Relacionados (Simulación RAG): \n\n- Orden 112/2022 Art. 4\n- RD 83/1996");
                                            }}
                                        >
                                            Ver Fuente Legal ⚖️
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Hover indicator */}
                            <div className="absolute inset-y-0 right-0 w-1 bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
