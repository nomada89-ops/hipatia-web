import React, { useState, useMemo } from 'react';
import { ParsedData } from '../../../utils/delphosParser';
import { Magnet, Layers, GitMerge, Pin, Users, ArrowRight, Check, X, Filter, Sparkles } from 'lucide-react';

interface MagneticModuleProps {
    data: ParsedData;
    onComplete: (stakes: any[]) => void;
}

// --- Types ---
type LinkType = 'SIMULTANEOUS' | 'SUPPORT' | 'FIXED';

interface Stake {
    id: string;
    type: LinkType;
    subjects: string[]; // IDs of subjects in this stake
}

// --- Logic Helpers ---
const CORE_SUBJECTS_REGEX = /matemáticas|lengua|historia|geografía|física|química|biología|inglés|educación física|filosofía/i;

const getLevelFromGroup = (groupName: string): string => {
    const normalize = groupName.trim().toUpperCase();

    // 1. Detect Standard Levels (ESO, BACH, FP)
    const stdMatch = normalize.match(/(\d)[º°]?\s?(ESO|BACH|FP)/);
    if (stdMatch) return `${stdMatch[1]}º ${stdMatch[2]}`;

    // 2. Detect EBO/Special Ed (User flagged "7º EBO" as anomaly, likely E. Especial)
    if (normalize.includes("EBO") || normalize.includes("TVA")) return "E. ESPECIAL";

    // 3. Fallback: First alphanumeric sequence
    const match = normalize.match(/^(\d+[º°]?\s?[A-Z]+)/);
    if (match) return match[1].replace(/\s/g, '');

    return "OTROS";
};

const levelSorter = (a: string, b: string): number => {
    // Priority: ESO < BACH < FP < OTROS
    const priority = (lvl: string) => {
        if (lvl.includes("ESO")) return 1;
        if (lvl.includes("BACH")) return 2;
        if (lvl.includes("FP")) return 3;
        return 4;
    };

    const pA = priority(a);
    const pB = priority(b);

    if (pA !== pB) return pA - pB;
    return a.localeCompare(b);
};

// --- Components ---

const OrphanItem = ({ id, name, subtitle, level, isCore, isSelected, isSuggested, onClick }: {
    id: string, name: string, subtitle?: string, level: string, isCore: boolean, isSelected: boolean, isSuggested: boolean, onClick: () => void
}) => {
    return (
        <div
            onClick={onClick}
            className={`p-3 w-full border rounded-lg shadow-sm cursor-pointer transition-all flex flex-col justify-center relative overflow-hidden
                ${isSelected
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 z-10'
                    : isSuggested
                        ? 'bg-amber-50 border-amber-300 shadow-md ring-1 ring-amber-200'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }
            `}
        >
            {isSuggested && (
                <div className="absolute top-0 right-0 p-1 bg-amber-100 rounded-bl-lg">
                    <Sparkles size={12} className="text-amber-600" />
                </div>
            )}

            <div className="flex justify-between items-start">
                <div className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {name}
                </div>
                {!isCore && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                        OPT
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isCore ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {level}
                </span>
                {subtitle && <div className="text-xs text-slate-400 truncate flex-1">{subtitle}</div>}
            </div>
        </div>
    );
};

const StakeCard = ({ stake, allSubjects }: { stake: Stake, allSubjects: Map<string, any> }) => {
    const icon = {
        'SIMULTANEOUS': <GitMerge size={16} className="text-indigo-500" />,
        'SUPPORT': <Users size={16} className="text-emerald-500" />,
        'FIXED': <Pin size={16} className="text-amber-500" />
    }[stake.type];

    const label = {
        'SIMULTANEOUS': 'Simultánea',
        'SUPPORT': 'Apoyo / Desdoble',
        'FIXED': 'Fija'
    }[stake.type];

    return (
        <div className="relative group w-64 bg-white rounded-xl shadow border-2 border-indigo-100 p-3 hover:border-indigo-300 transition-all">
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg z-10 transition-transform group-hover:scale-110">
                <span className="text-xs font-bold">{stake.subjects.length}</span>
            </div>

            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-50">
                {icon}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</span>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                {stake.subjects.map(sid => {
                    const sub = allSubjects.get(sid);
                    return (
                        <div key={sid} className="bg-slate-50 p-2 rounded text-xs text-slate-700 font-medium truncate border border-slate-100 flex items-center justify-between group/item">
                            <span>{sub?.displayName || sid}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main Module ---

export const MagneticModule = ({ data, onComplete }: MagneticModuleProps) => {
    const [stakes, setStakes] = useState<Stake[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [pendingStake, setPendingStake] = useState<{ subjects: string[] } | null>(null);

    // Filters State
    const [filterLevel, setFilterLevel] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<'ALL' | 'CORE' | 'ELECTIVE'>('ALL');

    // 1. Enrich Data
    const groupMap = useMemo(() => {
        const map = new Map<string, string>();
        data.groups.forEach(g => map.set(g.courseId, g.name));
        return map;
    }, [data.groups]);

    const enrichedItems = useMemo(() => {
        return data.subjects.map(s => {
            const groupName = groupMap.get(s.courseId) || 'Sin Grupo';
            const level = getLevelFromGroup(groupName);
            const isCore = CORE_SUBJECTS_REGEX.test(s.name);
            return {
                id: s.id,
                name: s.name,
                abbrev: s.abbreviation,
                subtitle: `${groupName} • ${s.abbreviation}`,
                displayName: `${s.name} (${groupName})`,
                level,
                isCore,
                courseId: s.courseId, // For suggestions
                originalGroup: groupName
            };
        });
    }, [data.subjects, groupMap]);

    const itemMap = useMemo(() => new Map(enrichedItems.map(i => [i.id, i])), [enrichedItems]);

    // 2. Extract Available Levels for Filter
    const availableLevels = useMemo(() => {
        const levels = new Set(enrichedItems.map(i => i.level));
        return Array.from(levels).sort(levelSorter);
    }, [enrichedItems]);

    // 3. Filter Logic
    const stakedIds = new Set(stakes.flatMap(s => s.subjects));

    const filteredOrphans = useMemo(() => {
        return enrichedItems.filter(i => {
            // Must not be staked
            if (stakedIds.has(i.id)) return false;

            // Level Filter
            if (filterLevel !== 'ALL' && i.level !== filterLevel) return false;

            // Type Filter
            if (filterType === 'CORE' && !i.isCore) return false;
            if (filterType === 'ELECTIVE' && i.isCore) return false;

            return true;
        });
    }, [enrichedItems, stakedIds, filterLevel, filterType]);

    // 4. Suggestion Logic
    const suggestedIds = useMemo(() => {
        if (selectedIds.size === 0) return new Set<string>();

        // Strategy: If 1 item selected, find matches
        const firstId = Array.from(selectedIds)[0];
        const seedItem = itemMap.get(firstId);
        if (!seedItem) return new Set<string>();

        // Find items with same Level AND same Abbreviation (Simultaneous)
        // OR same Group (Support)
        const suggestions = new Set<string>();

        filteredOrphans.forEach(i => {
            if (selectedIds.has(i.id)) return;

            // Heuristic 1: Simultaneous (Same Subject Name, Different Group, Same Level)
            if (i.abbrev === seedItem.abbrev && i.level === seedItem.level && i.id !== seedItem.id) {
                suggestions.add(i.id);
            }

            // Heuristic 2: Support (Same Group, different subject name but maybe matches profile?) -> Harder to guess without explicit metadata.
            // For now, prioritize "Same Level + Elective/Optative" grouping
        });

        return suggestions;
    }, [selectedIds, filteredOrphans, itemMap]);


    // Interactions
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleMergeClick = () => {
        if (selectedIds.size >= 2) {
            setPendingStake({ subjects: Array.from(selectedIds) });
        }
    };

    const confirmStake = (type: LinkType) => {
        if (pendingStake) {
            setStakes([...stakes, {
                id: crypto.randomUUID(),
                type,
                subjects: pendingStake.subjects
            }]);
            setPendingStake(null);
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="h-full flex gap-6 p-6 bg-slate-100 relative">

            {/* Left Panel: Orphans */}
            <div className="w-96 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-700 flex items-center gap-2">
                            <Layers size={18} className="text-slate-400" />
                            Sesiones Huérfanas
                        </h2>
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold">
                            {filteredOrphans.length} <span className="text-slate-300 font-normal">/ {enrichedItems.length - stakedIds.size}</span>
                        </span>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex flex-col gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                            <Filter size={12} /> Filtros de Visualización
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="flex-1 text-xs text-slate-900 border border-slate-300 rounded p-1.5 focus:border-indigo-500 outline-none bg-white font-medium"
                            >
                                <option className="text-slate-900 bg-white" value="ALL">Todos los Cursos</option>
                                {availableLevels.map(l => (
                                    <option className="text-slate-900 bg-white" key={l} value={l}>{l}</option>
                                ))}
                            </select>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="flex-1 text-xs text-slate-900 border border-slate-300 rounded p-1.5 focus:border-indigo-500 outline-none bg-white font-medium"
                            >
                                <option className="text-slate-900 bg-white" value="ALL">Todo Tipo</option>
                                <option className="text-slate-900 bg-white" value="CORE">Troncales</option>
                                <option className="text-slate-900 bg-white" value="ELECTIVE">Optativas</option>
                            </select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredOrphans.map(orphan => (
                            <OrphanItem
                                key={orphan.id}
                                {...orphan}
                                isSelected={selectedIds.has(orphan.id)}
                                isSuggested={suggestedIds.has(orphan.id)}
                                onClick={() => toggleSelection(orphan.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Center: Magnetic Zone */}
            <div className="flex-1 flex flex-col gap-4">
                <div className={`flex-1 rounded-xl border-4 border-dashed transition-all duration-500 overflow-y-auto p-4 flex flex-wrap content-start gap-4 border-slate-200 bg-slate-50/30`}>

                    {stakes.length === 0 && selectedIds.size === 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                            <Magnet size={48} className="mb-4 text-slate-300" />
                            <p className="text-lg font-medium">Zona Magnética</p>
                            <p className="text-sm opacity-70">Usa os filtros y selecciona dos o más sesiones para fusionarlas.</p>
                        </div>
                    )}

                    {stakes.map(stake => (
                        <StakeCard key={stake.id} stake={stake} allSubjects={itemMap} />
                    ))}
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow border border-slate-200">
                    <div className="flex items-center gap-4">
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                                <span className="text-sm font-bold text-indigo-600">{selectedIds.size} seleccionadas</span>
                                <button
                                    onClick={handleMergeClick}
                                    disabled={selectedIds.size < 2}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                                        ${selectedIds.size >= 2
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <Magnet size={16} />
                                    Fusionar Seleccionadas
                                </button>
                                <button onClick={() => setSelectedIds(new Set())} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                        {suggestedIds.size > 0 && selectedIds.size > 0 && (
                            <div className="text-xs text-amber-600 font-bold animate-pulse flex items-center gap-1">
                                <Sparkles size={12} />
                                {suggestedIds.size} sugerencias encontradas
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onComplete(stakes)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        Finalizar Vínculos <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Modal: Link Type Selector */}
            {pendingStake && (
                <div className="fixed inset-0 z-50 bg-slate-500/30 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform scale-100 transition-all">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <Magnet size={32} className="text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">¡Fusión Magnética!</h3>
                            <p className="text-slate-500 mt-2">¿Qué relación tienen estas {pendingStake.subjects.length} sesiones?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => confirmStake('SIMULTANEOUS')}
                                className="p-4 border-2 border-indigo-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center gap-4 group text-left"
                            >
                                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <GitMerge className="text-indigo-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 group-hover:text-indigo-700">Simultánea / Optativa</div>
                                    <div className="text-sm text-slate-400">Distintos grupos, mismo tramo horario. (Ej: Religión / Valores)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => confirmStake('SUPPORT')}
                                className="p-4 border-2 border-emerald-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-4 group text-left"
                            >
                                <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                    <Users className="text-emerald-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 group-hover:text-emerald-700">Apoyo / Co-Docencia</div>
                                    <div className="text-sm text-slate-400">Mismo grupo, refuerzo o división. (Ej: PT, AL dentro del aula)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => confirmStake('FIXED')}
                                className="p-4 border-2 border-amber-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center gap-4 group text-left"
                            >
                                <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                    <Pin className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 group-hover:text-amber-700">Fijar en Calendario</div>
                                    <div className="text-sm text-slate-400">Anclar a un día y hora específicos. (Ej: Reuniones Dpto)</div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setPendingStake(null)}
                            className="w-full mt-6 py-3 text-slate-400 hover:text-slate-600 font-medium text-sm"
                        >
                            Cancelar fusión
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
