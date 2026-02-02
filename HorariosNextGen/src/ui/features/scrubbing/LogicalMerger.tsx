import React, { useState } from 'react';
import { ParsedSubject } from '../../../utils/delphosParser';
import { Merge, GripVertical, AlertCircle, X, ArrowRight, Unlink } from 'lucide-react';

interface LogicalMergerProps {
    subjects: ParsedSubject[];
    merges: Map<string, string[]>; // Key = MetaID, Value = [OriginalIDs]
    metaInfo: Map<string, { name: string, color: string }>;
    onMerge: (sourceIds: string[], targetName?: string) => void;
    onUnmerge: (metaId: string) => void;
}

export const LogicalMerger: React.FC<LogicalMergerProps> = ({
    subjects,
    merges,
    metaInfo,
    onMerge,
    onUnmerge
}) => {
    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Helper: Is this subject already part of a merge?
    const getMergeId = (subjectId: string) => {
        for (const [metaId, originals] of merges.entries()) {
            if (originals.includes(subjectId)) return metaId;
        }
        return null;
    };

    // Filter out subjects that are already merged (they are shown inside their merge card)
    const orphans = subjects.filter(s => getMergeId(s.id) === null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
        setDraggedId(id);
    };

    const handleDrop = (e: React.DragEvent, targetId?: string, isMergeDrop?: boolean) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');
        if (!sourceId || sourceId === targetId) return;

        // Logic:
        // 1. If dropping Orphan A on Orphan B -> Create New Merge [A, B]
        // 2. If dropping Orphan A on Merge M -> Add A to M

        if (isMergeDrop && targetId) {
            // Target is an existing Merge
            const current = merges.get(targetId) || [];
            onMerge([...current, sourceId]);
        } else if (targetId) {
            // Target is an Orphan
            onMerge([targetId, sourceId], subjects.find(s => s.id === targetId)?.name);
        }

        setDraggedId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
    };

    return (
        <div className="flex h-full gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Left: Orphans (Draggable) */}
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <GripVertical size={18} /> Materias Sueltas
                    </h3>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{orphans.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 content-start grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orphans.map(sub => (
                        <div
                            key={sub.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, sub.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, sub.id)}
                            className={`
                                p-3 rounded-lg border-2 border-dashed border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-grab active:cursor-grabbing
                                flex items-center gap-3 relative group
                                ${draggedId === sub.id ? 'opacity-50' : ''}
                            `}
                        >
                            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase shrink-0">
                                {sub.abbreviation.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-700 truncate">{sub.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity">{sub.id}</div>
                            </div>
                        </div>
                    ))}
                    {orphans.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-400">
                            Todas las materias han sido fusionadas
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Merged (Drop Zone) */}
            <div className="w-1/3 flex flex-col bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Merge size={18} className="text-indigo-600" /> Fusiones Activas
                    </h3>
                    <div className="text-xs text-slate-500">
                        Arrastra aquí para agrupar
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Array.from(merges.entries()).map(([metaId, originalIds]) => {
                        const info = metaInfo.get(metaId);
                        return (
                            <div
                                key={metaId}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, metaId, true)}
                                className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-3 animate-in slide-in-from-right-4"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-indigo-900">{info?.name || "Grupo Fusionado"}</div>
                                        <div className="text-xs text-indigo-400">{originalIds.length} materias agrupadas</div>
                                    </div>
                                    <button
                                        onClick={() => onUnmerge(metaId)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="Deshacer fusión"
                                    >
                                        <Unlink size={16} />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {originalIds.map(oid => {
                                        const sub = subjects.find(s => s.id === oid);
                                        return (
                                            <div key={oid} className="text-xs flex items-center gap-2 text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <span className="truncate flex-1">{sub?.name || oid}</span>
                                                <span className="font-mono text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{oid}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {merges.size === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center opacity-60">
                            <Merge size={48} className="mb-4" />
                            <p>Arrastra una materia sobre otra para crear una fusión lógica.</p>
                            <p className="text-xs mt-2 max-w-[200px]">Esto unifica su representación visual pero mantiene los IDs internos para Delphos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
