import React, { useState, useMemo } from 'react';
import { ParsedSubject, ParsedGroup, ParsedCourse } from '../../../utils/delphosParser';
import { ChevronRight, ChevronDown, Link, Unlink, Users } from 'lucide-react';

interface LevelCascadingSelectorProps {
    allGroups: ParsedGroup[];
    allSubjects: ParsedSubject[];
    allCourses: ParsedCourse[];
    activeLevels: Set<string>;
    simultaneityBlocks: Map<string, string[]>;
    onToggle: (levelId: string) => void;
    onCreateBlock: (subjectIds: string[]) => void;
    onDeleteBlock: (blockId: string) => void;
    activeStep: number;
}

export const LevelCascadingSelector: React.FC<LevelCascadingSelectorProps> = ({
    allGroups,
    allSubjects,
    allCourses,
    activeLevels,
    simultaneityBlocks,

    onCreateBlock,

    onDeleteBlock
}) => {
    const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

    // Toggle logic for individual "Subject Instance" (Subject + Group)
    const toggleSubjectInstance = (id: string, groupName?: string, isUnassigned?: boolean) => {
        // VIRTUAL ID LOGIC: If unassigned, bind to column
        const targetId = isUnassigned && groupName ? `${id}::${groupName}` : id;

        const newSet = new Set(selectedSubjects);
        // Toggle: If present, remove. If absent, add.
        if (newSet.has(targetId)) newSet.delete(targetId);
        else newSet.add(targetId);
        setSelectedSubjects(newSet);
    };

    // "Smart Select": Select ALL instances of this subject name in the level
    const selectAllInstances = (instances: ParsedSubject[], contextGroups: ParsedGroup[]) => {
        const targetIds = new Set<string>();

        contextGroups.forEach(g => {
            const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const nGName = normalize(g.name);

            // 1. Try to find EXACT or FUZZY match
            let instance = instances.find(i => {
                if (!i.group || i.group === 'No Asignado') return false;
                const nIGroup = normalize(i.group);
                if (nGName === nIGroup) return true;
                if (nIGroup.length <= 3 && nGName.endsWith(nIGroup)) return true;
                return nGName.includes(nIGroup) || nIGroup.includes(nGName);
            });

            // 2. Fallback: Phantom
            if (!instance) instance = instances.find(i => i.group === 'No Asignado');

            if (instance) {
                const isUnassigned = instance.group === 'No Asignado';
                const id = isUnassigned ? `${instance.id}::${g.name}` : instance.id;

                // CRITICAL FIX: Check BOTH specific ID (Virtual) AND Base ID (Generic)
                // If the generic subject is blocked (e.g. legacy block), we must consider this virtual slot blocked too.
                const blocked = getSubjectBlock(id) || (isUnassigned && getSubjectBlock(instance.id));

                if (!blocked) targetIds.add(id);
            }
        });

        // Toggle Logic
        const newSet = new Set(selectedSubjects);
        // Check if all VALID/AVAILABLE targets are selected
        if (targetIds.size === 0) return;

        const allAreSelected = Array.from(targetIds).every(id => newSet.has(id));

        if (allAreSelected) {
            targetIds.forEach(id => newSet.delete(id));
        } else {
            targetIds.forEach(id => newSet.add(id));
        }
        setSelectedSubjects(newSet);
    };

    const handleCreateBlockClick = () => {
        if (selectedSubjects.size < 2) return;
        onCreateBlock(Array.from(selectedSubjects));
        setSelectedSubjects(new Set());
    };

    // Helper: Find which block a subject belongs to
    const getSubjectBlock = (subjectId: string) => {
        for (const [blockId, subjects] of simultaneityBlocks.entries()) {
            if (subjects.includes(subjectId)) return { blockId, size: subjects.length };
        }
        return null;
    };

    // Organize Data: Level -> Unique Subject Names -> List of Instances (Groups)
    const levels = useMemo(() => {
        return allCourses.map(course => {
            const courseGroups = allGroups.filter(g => g.courseId === course.id).sort((a, b) => a.name.localeCompare(b.name));
            const courseSubjects = allSubjects.filter(s => s.courseId === course.id);

            // Group by Subject Name
            const byName = new Map<string, ParsedSubject[]>();
            courseSubjects.forEach(s => {
                const list = byName.get(s.name) || [];
                list.push(s);
                byName.set(s.name, list);
            });

            // Convert to array and Sort: "Prioritize multi-group subjects"
            const uniqueSubjects = Array.from(byName.entries()).map(([name, instances]) => ({
                name,
                instances,
                isMultiGroup: instances.length > 1,
                hasLaasr: instances.some(i => i.codDelphos === '1984' || i.name.includes('Atención'))
            })).sort((a, b) => {
                // Priority 1: Multi-group first
                if (a.isMultiGroup && !b.isMultiGroup) return -1;
                if (!a.isMultiGroup && b.isMultiGroup) return 1;
                // Priority 2: Name
                return a.name.localeCompare(b.name);
            });

            return {
                course,
                groups: courseGroups,
                uniqueSubjects
            };
        }).sort((a, b) => {
            return (a.course.name || a.course.id).localeCompare(b.course.name || b.course.id);
        });
    }, [allGroups, allSubjects, allCourses]);

    return (
        <div className="space-y-4 pb-20">
            {/* Info Panel */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 mt-1">
                    <Users size={16} />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Matriz de Grupos</h3>
                    <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                        Seleccione las burbujas de grupo (ej. <strong>A, B, C</strong>) en la fila de una materia para crear bloques de simultaneidad.
                        <br />
                        Las materias con <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-1"></span> aparecen en múltiples grupos y son candidatas ideales.
                    </p>
                </div>
            </div>

            {/* SPLIT VIEW LAYOUT */}
            <div className="flex gap-6 pb-20">
                {/* LEFT COLUMN: MATRIX */}
                <div className="flex-1 space-y-4">
                    <p className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                        <Users size={16} className="text-indigo-600" />
                        Selecciona los grupos equivalentes para crear bloques de simultaneidad.
                    </p>

                    {levels.filter(l => activeLevels.has(l.course.id)).map(({ course, groups, uniqueSubjects: subjects }) => {
                        const isExpanded = expandedLevel === course.id;

                        // Recalculate uniqueSubjects here or pass from Memo
                        // The memo returns 'subjects' (grouped) but the code expects 'uniqueSubjects' structure?
                        // Let's use the 'subjects' from the map which ARE the grouped ones (rows).
                        const rows = subjects;

                        return (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                                {/* Header */}
                                <div
                                    className="bg-slate-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => setExpandedLevel(isExpanded ? null : course.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <button className={`p-1 rounded-full transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </button>

                                        <div>
                                            <h3 className={`font-bold text-sm ${isExpanded ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                {course.name}
                                            </h3>
                                            <div className="flex gap-2 text-[10px] mt-0.5">
                                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded flex items-center gap-1">
                                                    <Users size={10} /> {groups.length} Grupos
                                                </span>
                                                {/* RGB Load Badge Array */}
                                                <div className="flex gap-1 ml-2 items-center">
                                                    {groups.map(g => {
                                                        const load = g.groupLoadIndex || 'LOW';
                                                        const colors = {
                                                            HIGH: 'bg-rose-500',
                                                            MEDIUM: 'bg-amber-400',
                                                            LOW: 'bg-emerald-400'
                                                        };
                                                        const hasBackpack = (g.pendingSubjectsCount || 0) > 0;

                                                        return (
                                                            <div key={g.id} className="flex flex-col items-center gap-0.5">
                                                                <div
                                                                    className={`w-2 h-2 rounded-full ${colors[load as keyof typeof colors]} shadow-sm`}
                                                                    title={`${g.name}: Carga ${load} (ICC: ${g.iccScore || 0}, ICCr: ${g.iccr || 1})`}
                                                                />
                                                                {hasBackpack && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.dispatchEvent(new CustomEvent('show-backpack-breakdown', { detail: { groupId: g.id, groupName: g.name } }));
                                                                        }}
                                                                        className="text-[10px] hover:scale-125 transition-transform"
                                                                        title={`Ver mochila de pendientes (${g.pendingSubjectsCount})`}
                                                                    >
                                                                        🎒
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                                                    {rows.length} Materias
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats or Actions could go here */}
                                </div>

                                {/* Body */}
                                {isExpanded && (
                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Materia</th>
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Asignación por Grupos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {rows.map(row => (
                                                    <tr key={row.name} className="hover:bg-indigo-50/30 transition-colors group">
                                                        <td className="px-4 py-3 align-middle bg-white group-hover:bg-transparent">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-slate-700 block max-w-[250px] truncate" title={row.name}>
                                                                        {row.name}
                                                                    </span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {row.hasLaasr && <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100 font-medium">Auto-LAASR</span>}

                                                                        {/* Debug / Error Badges */}
                                                                        {row.instances.some(i => i.group === 'No Asignado') && (
                                                                            <span className="text-[9px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 font-mono flex items-center gap-1">
                                                                                ⚠️ Sin Asignar ({row.instances.filter(i => i.group === 'No Asignado').length})
                                                                            </span>
                                                                        )}

                                                                        {/* Missing Matches Tooltips */}
                                                                        {row.instances.filter(i => {
                                                                            if (i.group === 'No Asignado' || !i.group) return false;
                                                                            const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                                                            const nIGroup = normalize(i.group);

                                                                            const hasMatch = groups.some(g => {
                                                                                const nGName = normalize(g.name);
                                                                                if (nGName === nIGroup) return true;
                                                                                if (nIGroup.length <= 3 && nGName.endsWith(nIGroup)) return true;
                                                                                return nGName.includes(nIGroup) || nIGroup.includes(nGName);
                                                                            });
                                                                            return !hasMatch;
                                                                        }).map(orphan => (
                                                                            <span key={orphan.id} className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 cursor-help" title={`Grupo '${orphan.group}' no coincide con: ${groups.map(g => g.name).join(', ')}`}>
                                                                                ? {orphan.group}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {/* Helper to Select All */}
                                                                <button
                                                                    onClick={() => selectAllInstances(row.instances, groups)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all text-[10px] font-bold uppercase tracking-wide"
                                                                    title="Seleccionar toda la fila"
                                                                >
                                                                    Todas
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Matrix Cells: Group Bubbles */}
                                                        <td className="px-4 py-3 align-middle">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {groups.map(g => {
                                                                    const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                                                    const nGName = normalize(g.name);

                                                                    // 1. Try to find EXACT or FUZZY match
                                                                    let instance = row.instances.find(i => {
                                                                        if (!i.group || i.group === 'No Asignado') return false;
                                                                        const nIGroup = normalize(i.group);
                                                                        if (nGName === nIGroup) return true;
                                                                        if (nIGroup.length <= 3 && nGName.endsWith(nIGroup)) return true;
                                                                        return nGName.includes(nIGroup) || nIGroup.includes(nGName);
                                                                    });

                                                                    // 2. Fallback: Check for 'No Asignado' (Phantom Candidate)
                                                                    if (!instance) {
                                                                        instance = row.instances.find(i => i.group === 'No Asignado');
                                                                    }

                                                                    if (!instance) {
                                                                        return (
                                                                            <div key={g.id} className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50/30 flex items-center justify-center text-slate-200 text-[10px] cursor-not-allowed select-none">
                                                                                -
                                                                            </div>
                                                                        );
                                                                    }

                                                                    const isUnassigned = instance.group === 'No Asignado';
                                                                    // VIRTUAL CHECK
                                                                    const virtualId = `${instance.id}::${g.name}`;
                                                                    const isSelected = selectedSubjects.has(instance.id) || (isUnassigned && selectedSubjects.has(virtualId));

                                                                    const blockInfo = getSubjectBlock(instance.id) || getSubjectBlock(virtualId);
                                                                    const isBlocked = !!blockInfo;
                                                                    const isLaasr = instance.name.includes('Atención') || instance.codDelphos === '1984';

                                                                    // Block Color
                                                                    const blockColor = isBlocked ? 'bg-indigo-100 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/20' : '';
                                                                    // Select Color
                                                                    const selectColor = isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105 z-10' : '';
                                                                    // Default Color & Phantom Styling
                                                                    let defaultColor = isLaasr
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600';

                                                                    if (isUnassigned && !isSelected && !isBlocked) {
                                                                        defaultColor = 'bg-amber-50 text-amber-700 border-amber-200 border-dashed hover:border-amber-400 hover:bg-amber-100 opacity-80';
                                                                    }

                                                                    const finalClass = `
                                                                        w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all duration-200 relative
                                                                        ${isSelected ? selectColor : (isBlocked ? blockColor : defaultColor)}
                                                                    `;

                                                                    return (
                                                                        <div key={g.id} className="relative group/bubble">
                                                                            <button
                                                                                onClick={() => !isBlocked && toggleSubjectInstance(instance!.id, g.name, isUnassigned)}
                                                                                className={finalClass}
                                                                                disabled={isBlocked}
                                                                            >
                                                                                {/* Display abbreviated group name: 1ESOA -> 1A */}
                                                                                {g.name.replace(/.*(\d+[A-Z]+).*/, "$1").replace(/.*([A-Z])$/, "$1").substring(0, 2)}
                                                                            </button>

                                                                            {/* Tooltip on Hover */}
                                                                            <div className="absolute opacity-0 group-hover/bubble:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20 transition-opacity max-w-[300px] break-all">
                                                                                {g.name}: {instance.name}
                                                                                <br />
                                                                                <span className="text-amber-300 font-mono text-[9px]">{isUnassigned ? `ID Virtual: ${virtualId}` : `ID: ${instance.id}`}</span>
                                                                                <br />
                                                                                {isBlocked ? '(En Bloque)' : '(Libre)'}
                                                                            </div>

                                                                            {/* Unlink Badge if blocked */}
                                                                            {isBlocked && blockInfo && (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(blockInfo.blockId); }}
                                                                                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-sm border border-white z-20 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
                                                                                    title="Desvincular del bloque"
                                                                                >
                                                                                    <Unlink size={8} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT COLUMN: SIMULTANEITY MONITOR (Sidebar) */}
                <div className="w-80 shrink-0">
                    <div className="sticky top-6 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col max-h-[calc(100vh-100px)] overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                <Link size={16} className="text-indigo-600" />
                                Bloques de Simultaneidad Activos
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full ml-auto font-mono">
                                    {simultaneityBlocks.size}
                                </span>
                            </h3>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[150px]">
                            {simultaneityBlocks.size === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
                                    <Link size={32} className="opacity-20 mb-2" />
                                    <p className="text-sm font-medium">No hay bloques</p>
                                    <p className="text-[10px] mt-1 max-w-[150px] opacity-70">Selecciona burbujas de la izquierda y crea un bloque nuevo.</p>
                                </div>
                            ) : (
                                Array.from(simultaneityBlocks.entries()).map(([blockId, ids]) => {
                                    // Helper to resolve names
                                    const resolveBlockInfo = (ids: string[]) => {
                                        return ids.map(sid => {
                                            if (sid.includes('::')) {
                                                const [oid, gName] = sid.split('::');
                                                const s = allSubjects.find(subj => subj.id === oid);
                                                return { name: s?.name || 'Desconocido', group: gName };
                                            }
                                            const s = allSubjects.find(subj => subj.id === sid);
                                            return { name: s?.name || 'Desconocido', group: s?.group || '?' };
                                        });
                                    };

                                    const info = resolveBlockInfo(ids);
                                    // NEW: Get all unique names
                                    const uniqueNames = Array.from(new Set(info.map(i => i.name)));

                                    // Deduplicate groups for badges
                                    const uniqueGroups = Array.from(new Set(info.map(i => i.group))).sort((a, b) => a.localeCompare(b));

                                    return (
                                        <div key={blockId} className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-sm group hover:border-indigo-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <div className="flex flex-col gap-0.5">
                                                    {uniqueNames.map(name => (
                                                        <span key={name} className="font-bold text-indigo-900 text-xs leading-tight" title={name}>
                                                            {name}
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => onDeleteBlock(blockId)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                                    title="Eliminar Bloque"
                                                >
                                                    <Unlink size={12} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {uniqueGroups.map((gName) => (
                                                    <span key={gName} className="bg-white border border-indigo-200 text-indigo-700 rounded px-1.5 py-0.5 text-[9px] font-mono shadow-sm">
                                                        {gName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Active Selection Action Area */}
                        <div className="bg-slate-50 border-t border-slate-200 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Selección Actual</span>
                                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 rounded font-bold">{selectedSubjects.size}</span>
                            </div>
                            <button
                                onClick={handleCreateBlockClick}
                                disabled={selectedSubjects.size < 2}
                                className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm
                                    ${selectedSubjects.size >= 2
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:-translate-y-0.5'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                <Link size={14} />
                                Crear Bloque
                            </button>
                            {selectedSubjects.size > 0 && selectedSubjects.size < 2 && (
                                <p className="text-[10px] text-center text-amber-600 mt-2">
                                    Selecciona al menos 2 ítems
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
