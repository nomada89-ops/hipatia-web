import React from 'react';
import { ParsedGroup, ParsedSubject } from '../../../utils/delphosParser';
import { AlertCircle, Trash2, ArrowRightCircle } from 'lucide-react';

interface OrphanDetectorProps {
    orphanedSubjects: ParsedSubject[];
    orphanedGroups: ParsedGroup[];
    onIgnore: (id: string, type: 'SUBJECT' | 'GROUP') => void;
}

export const OrphanDetector: React.FC<OrphanDetectorProps> = ({
    orphanedSubjects,
    orphanedGroups,
    onIgnore
}) => {
    if (orphanedSubjects.length === 0 && orphanedGroups.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-6 w-80 bg-white border border-amber-200 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-10 z-50">
            <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={18} />
                <h4 className="font-bold text-amber-900 text-sm">Aviso de Datos (Higiene)</h4>
            </div>

            <div className="max-h-60 overflow-y-auto p-3 space-y-3">
                {orphanedGroups.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Grupos Vacíos ({orphanedGroups.length})
                        </div>
                        {orphanedGroups.map(g => (
                            <div key={g.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="truncate flex-1 font-medium text-slate-700">{g.name}</span>
                                <button
                                    onClick={() => onIgnore(g.id, 'GROUP')}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                    title="Ignorar / Borrar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {orphanedSubjects.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Materias Huérfanas ({orphanedSubjects.length})
                        </div>
                        {orphanedSubjects.map(s => (
                            <div key={s.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                <div className="flex flex-col flex-1 min-w-0 pr-2">
                                    <span className="truncate font-medium text-slate-700">{s.name}</span>
                                    <span className="text-[10px] text-slate-400 truncate">{s.department}</span>
                                </div>
                                <button
                                    onClick={() => onIgnore(s.id, 'SUBJECT')}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                    title="Ignorar / Borrar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
