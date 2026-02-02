import React from 'react';
import { DeltaReport, DeltaChange } from '../../../utils/deltaSync';
import { PlusCircle, Trash2, Edit2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ParsedTeacher, ParsedSubject, ParsedGroup } from '../../../utils/delphosParser';

interface DeltaDiscrepancyPanelProps {
    report: DeltaReport;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeltaDiscrepancyPanel: React.FC<DeltaDiscrepancyPanelProps> = ({ report, onConfirm, onCancel }) => {

    // Helper to render a section
    const renderSection = <T extends { name: string }>(
        title: string,
        items: DeltaChange<T>[],
        icon: React.ReactNode
    ) => {
        const changed = items.filter(i => i.type !== 'UNCHANGED');
        if (changed.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    {icon} {title}
                </h4>
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    {changed.map(c => (
                        <div key={c.id} className="p-3 border-b border-slate-100 last:border-b-0 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge type={c.type} />
                                    <span className="text-slate-700 font-medium">{c.item.name}</span>
                                </div>
                                {c.type === 'MODIFIED' && c.modifications && (
                                    <ul className="mt-1 ml-6 text-xs text-slate-500 list-disc">
                                        {c.modifications.map((m, i) => <li key={i}>{m}</li>)}
                                    </ul>
                                )}
                            </div>
                            <span className="text-xs font-mono text-slate-300">{c.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const hasChanges = (report.stats.newTeachers + report.stats.removedTeachers + report.stats.modifiedTeachers +
        report.stats.newSubjects + report.stats.removedSubjects + report.stats.modifiedSubjects +
        report.stats.newGroups + report.stats.removedGroups + report.stats.modifiedGroups) > 0;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" />
                        Sincronización Diferencial
                    </h2>
                    <p className="text-sm text-slate-500">Se han detectado cambios respecto a los datos cargados anteriormente.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {!hasChanges ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <CheckCircle size={40} className="text-green-500 mb-2" />
                        <p>No se han detectado cambios significativos. Los datos son idénticos.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <StatCard label="Nuevos" value={report.stats.newTeachers + report.stats.newSubjects + report.stats.newGroups} color="green" />
                            <StatCard label="Modificados" value={report.stats.modifiedTeachers + report.stats.modifiedSubjects + report.stats.modifiedGroups} color="amber" />
                            <StatCard label="Eliminados" value={report.stats.removedTeachers + report.stats.removedSubjects + report.stats.removedGroups} color="red" />
                        </div>

                        {renderSection("Docentes", report.teachers, <Edit2 size={16} />)}
                        {renderSection("Materias", report.subjects, <Edit2 size={16} />)}
                        {renderSection("Grupos", report.groups, <Edit2 size={16} />)}
                    </>
                )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
                <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg">
                    Confirmar Sincronización
                </button>
            </div>
        </div>
    );
};

const Badge = ({ type }: { type: string }) => {
    if (type === 'NEW') return <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1"><PlusCircle size={10} /> NUEVO</span>;
    if (type === 'REMOVED') return <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-1"><Trash2 size={10} /> BAJA</span>;
    if (type === 'MODIFIED') return <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1"><Edit2 size={10} /> CAMBIO</span>;
    return null;
};

const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className={`p-3 rounded-lg border bg-white flex flex-col items-center justify-center border-${color}-200`}>
        <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
);
