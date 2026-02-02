import React, { useState, useMemo, useEffect } from 'react';
import { ParsedTeacher, ParsedSubject, ParsedCourse } from '../../../utils/delphosParser';
import { BookOpen, Filter, Search, UserCheck, AlertCircle, ChevronRight, Users, CheckCircle, Layers, Grid } from 'lucide-react';

interface DepartmentSandboxProps {
    teachers: ParsedTeacher[];
    subjects: ParsedSubject[];
    courses: ParsedCourse[];
    onUpdateAssignments: (updatedTeachers: ParsedTeacher[], updatedSubjects: ParsedSubject[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export const DepartmentSandbox: React.FC<DepartmentSandboxProps> = ({ teachers, subjects, courses, onUpdateAssignments, onNext, onBack }) => {
    // Heuristic: Patch 0-hour subjects using siblings
    const patchMissingHours = (list: ParsedSubject[]) => {
        return list.map(s => {
            if ((!s.hours || s.hours === 0) && s.name && s.courseId) {
                const sibling = list.find(sib =>
                    sib.name === s.name &&
                    sib.courseId === s.courseId &&
                    (sib.hours || 0) > 0
                );
                if (sibling) return { ...s, hours: sibling.hours };
            }
            return s;
        });
    };

    // Local state for assignments (Patched)
    const [localSubjects, setLocalSubjects] = useState<ParsedSubject[]>(() => patchMissingHours(subjects));

    // Filters
    // Hierarchy: Level -> Group -> Dept
    const [selectedLevelId, setSelectedLevelId] = useState<string>("ALL");
    const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
    const [selectedDeptName, setSelectedDeptName] = useState<string>("ALL");
    const [searchText, setSearchText] = useState("");

    // Selection state
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [showAllTeachers, setShowAllTeachers] = useState(false);

    // Sync props & Patch
    useEffect(() => {
        setLocalSubjects(patchMissingHours(subjects));
    }, [subjects]);

    // --- DERIVED DATA & OPTIONS ---

    // 1. Available Levels (Mapped to Names)
    const levelOptions = useMemo(() => {
        const uniqueIds = new Set(subjects.map(s => s.courseId));
        return Array.from(uniqueIds).map(id => {
            const course = courses.find(c => c.id === id);
            return {
                id: id || "UNKNOWN",
                name: course?.name || id || "Sin Nivel"
            };
        }).filter(l => l.id !== "UNKNOWN").sort((a, b) => a.name.localeCompare(b.name));
    }, [subjects, courses]);

    // 2. Available Groups (Dependent on Level)
    const groupOptions = useMemo(() => {
        let relevantSubjects = subjects;
        if (selectedLevelId !== "ALL") {
            relevantSubjects = subjects.filter(s => s.courseId === selectedLevelId);
        }
        const groups = new Set(relevantSubjects.map(s => s.group).filter(g => g));
        return Array.from(groups).sort();
    }, [subjects, selectedLevelId]);

    // 3. Available Departments (Based on Subjects)
    const deptOptions = useMemo(() => {
        const deps = new Set(subjects.map(s => s.department || "General"));
        return Array.from(deps).filter(d => d).sort();
    }, [subjects]);

    // Reset subordinate filters when parent changes
    useEffect(() => {
        setSelectedGroup("ALL");
    }, [selectedLevelId]);

    // --- FILTERING LOGIC ---

    const filteredSubjects = useMemo(() => {
        return localSubjects.filter(s => {
            // 1. Level Filter (Primary)
            if (selectedLevelId !== "ALL" && s.courseId !== selectedLevelId) return false;

            // 2. Group Filter (Secondary)
            if (selectedGroup !== "ALL" && s.group !== selectedGroup) return false;

            // 3. Department Filter (Tertiary)
            if (selectedDeptName !== "ALL" && (s.department || "General") !== selectedDeptName) return false;

            // 4. Search
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const matchesName = s.name.toLowerCase().includes(searchLower);
                const matchesGroup = s.group?.toLowerCase().includes(searchLower);

                // NEW: Teacher Name Search
                const assignedTeacher = teachers.find(t => t.id === s.teacherId);
                const matchesTeacher = assignedTeacher?.name.toLowerCase().includes(searchLower);

                if (!matchesName && !matchesGroup && !matchesTeacher) return false;
            }

            return true;
        }).sort((a, b) => {
            // Sort: Pending assignment first
            if (!a.teacherId && b.teacherId) return -1;
            if (a.teacherId && !b.teacherId) return 1;
            // Then by Name
            return a.name.localeCompare(b.name);
        });
    }, [localSubjects, selectedLevelId, selectedGroup, selectedDeptName, searchText]);

    // --- SELECTION LOGIC ---

    const activeSubject = useMemo(() =>
        localSubjects.find(s => s.id === selectedSubjectId),
        [localSubjects, selectedSubjectId]);

    const candidateTeachers = useMemo(() => {
        if (!activeSubject && !showAllTeachers) return [];

        if (showAllTeachers) {
            return teachers.slice().sort((a, b) => a.name.localeCompare(b.name));
        }

        const targetDept = activeSubject?.department || "General";
        const candidates = teachers.filter(t =>
            (t.specialty === targetDept) || (t.department === targetDept)
        );

        return candidates.sort((a, b) => a.name.localeCompare(b.name));
    }, [teachers, activeSubject, showAllTeachers]);

    // --- HANDLERS ---

    const handleAssign = (teacherId: string) => {
        if (!selectedSubjectId) return;
        const updated = localSubjects.map(s => {
            if (s.id === selectedSubjectId) {
                // Toggle: If the same teacher is clicked, unassign.
                return { ...s, teacherId: s.teacherId === teacherId ? undefined : teacherId };
            }
            return s;
        });
        setLocalSubjects(updated);
        onUpdateAssignments(teachers, updated);
    };

    const getTeacherLoad = (teacherId: string) => {
        return localSubjects
            .filter(s => s.teacherId === teacherId)
            .reduce((sum, s) => sum + (s.hours || 0), 0);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* --- HEADER & FILTERS --- */}
            <div className="bg-white border-b border-slate-200 shadow-sm z-20">
                {/* Top Bar */}
                <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-indigo-600" />
                        Reparto Inteligente
                        <span className="text-sm font-normal text-slate-400 border-l border-slate-300 pl-2 ml-2">
                            Asignación por Grupo
                        </span>
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={onBack} className="px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium text-sm transition-colors">
                            Atrás
                        </button>
                        <button onClick={onNext} className="px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-2 text-sm font-bold transition-all">
                            Siguiente Paso <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="px-6 py-3 bg-slate-50 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-slate-500 mr-2">
                        <Filter size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Filtros:</span>
                    </div>

                    {/* 1. LEVEL FILTER (Primary) */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Layers size={14} className="text-indigo-500" />
                        </div>
                        <select
                            value={selectedLevelId}
                            onChange={e => setSelectedLevelId(e.target.value)}
                            className="pl-9 pr-6 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer min-w-[160px]"
                        >
                            <option value="ALL">Todos los Niveles</option>
                            {levelOptions.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        <div className="absolute -top-2 left-2 px-1 bg-slate-50 text-[10px] font-bold text-indigo-600">NIVEL</div>
                    </div>

                    <ChevronRight size={14} className="text-slate-300" />

                    {/* 2. GROUP FILTER (Secondary) */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Grid size={14} className="text-pink-500" />
                        </div>
                        <select
                            value={selectedGroup}
                            onChange={e => setSelectedGroup(e.target.value)}
                            className="pl-9 pr-6 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer min-w-[140px]"
                        >
                            <option value="ALL">Todos los Grupos</option>
                            {groupOptions.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        <div className="absolute -top-2 left-2 px-1 bg-slate-50 text-[10px] font-bold text-pink-600">GRUPO</div>
                    </div>

                    <ChevronRight size={14} className="text-slate-300" />

                    {/* 3. DEPT FILTER (Tertiary) */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <BookOpen size={14} className="text-emerald-500" />
                        </div>
                        <select
                            value={selectedDeptName}
                            onChange={e => setSelectedDeptName(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer min-w-[200px]"
                        >
                            <option value="ALL">Todos los Deptos</option>
                            {deptOptions.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <div className="absolute -top-2 left-2 px-1 bg-slate-50 text-[10px] font-bold text-emerald-600">DEPARTAMENTO</div>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs ml-auto">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={14} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 py-2 shadow-inner"
                            placeholder="Buscar materia..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- COLUMNS LAYOUT --- */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: Subjects */}
                <div className="w-1/3 min-w-[400px] border-r border-slate-200 bg-white flex flex-col">
                    <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                            Materias Filtradas
                        </span>
                        <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            {filteredSubjects.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                        {filteredSubjects.map(subject => {
                            const isSelected = selectedSubjectId === subject.id;
                            const isAssigned = !!subject.teacherId;
                            const teacherName = isAssigned ? teachers.find(t => t.id === subject.teacherId)?.name : null;
                            const deptName = subject.department || "General";

                            return (
                                <div
                                    key={subject.id}
                                    onClick={() => {
                                        setSelectedSubjectId(subject.id);
                                        setShowAllTeachers(false); // Reset to smart mode
                                    }}
                                    className={`
                                        rounded-lg border shadow-sm p-3 cursor-pointer transition-all duration-200 group
                                        ${isSelected
                                            ? 'bg-white border-indigo-500 ring-2 ring-indigo-100 z-10 scale-[1.01]'
                                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 pr-2">
                                            <h4 className={`font-bold text-sm leading-tight ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                {subject.name}
                                            </h4>
                                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                <span className="bg-slate-100 px-1.5 rounded">{subject.group}</span>
                                                <span className="opacity-50">•</span>
                                                <span className="truncate max-w-[150px]">{deptName}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-1 rounded min-w-[32px] text-center border border-slate-200">
                                            {subject.hours}h
                                        </span>
                                    </div>

                                    {/* Assignment Status */}
                                    <div className={`
                                        text-xs rounded px-2 py-1.5 flex items-center gap-2 border
                                        ${isAssigned
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-slate-50 text-slate-400 border-dashed border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100'
                                        }
                                    `}>
                                        {isAssigned ? (
                                            <>
                                                <UserCheck size={14} />
                                                <span className="font-semibold truncate">{teacherName}</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={14} />
                                                <span>Sin Asignar</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredSubjects.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                                <Filter size={32} className="mb-2" />
                                <p className="text-sm">Sin resultados.</p>
                                <p className="text-xs">Ajusta los filtros arriba.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Teachers */}
                <div className="flex-1 bg-white flex flex-col relative">
                    {activeSubject ? (
                        <>
                            {/* Candidate Header */}
                            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shadow-inner">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Asignando Docente para:
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {activeSubject.name} <span className="text-slate-400 text-sm font-normal">({activeSubject.group})</span>
                                        </h3>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-bold border border-indigo-200">
                                            {activeSubject.hours} horas
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Departamento requerido: <strong className="text-indigo-600">{activeSubject.department || "General"}</strong>
                                    </p>

                                    {/* Unassign Action */}
                                    {activeSubject.teacherId && (
                                        <button
                                            onClick={() => handleAssign(activeSubject.teacherId!)}
                                            className="mt-2 text-[11px] flex items-center gap-1 text-red-500 hover:text-red-700 font-medium hover:underline"
                                        >
                                            <AlertCircle size={12} />
                                            Desasignar Docente Actual
                                        </button>
                                    )}
                                </div>

                                {/* Affinity Toggle */}
                                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <span className="text-xs font-semibold text-slate-600 text-right leading-tight">
                                            Mostrar<br />Todos
                                        </span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={showAllTeachers}
                                                onChange={e => setShowAllTeachers(e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Cards Grid */}
                            <div className="flex-1 overflow-y-auto p-5 bg-slate-100/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                                    {candidateTeachers.map(teacher => {
                                        const load = getTeacherLoad(teacher.id);
                                        const contract = 18; // TODO: Real contract from props
                                        const isOverload = load > contract;
                                        const isAssignedToThis = activeSubject.teacherId === teacher.id;

                                        return (
                                            <button
                                                key={teacher.id}
                                                onClick={() => handleAssign(teacher.id)}
                                                className={`
                                                    relative flex flex-col text-left p-4 rounded-xl border transition-all duration-200 group overflow-hidden
                                                    ${isAssignedToThis
                                                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                                                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5'
                                                    }
                                                `}
                                            >
                                                {/* Card Header */}
                                                <div className="flex gap-3 mb-3 items-start">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0
                                                        ${isAssignedToThis ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                                                    `}>
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-slate-800 truncate text-[13px] leading-tight">
                                                            {teacher.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                                            {teacher.specialty || "Sin Adscripción"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Load Meter */}
                                                <div className="space-y-1.5 w-full">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-slate-500">Carga Actual</span>
                                                        <span className={isOverload ? 'text-red-500' : 'text-slate-700'}>
                                                            {load} / {contract}h
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isOverload ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                            style={{ width: `${Math.min((load / contract) * 100, 100)}%` }}
                                                        />
                                                        {/* Contract Marker */}
                                                        <div className="absolute top-0 bottom-0 w-0.5 bg-black/10 left-[100%]" />
                                                    </div>
                                                </div>

                                                {/* Active Feedback */}
                                                {isAssignedToThis && (
                                                    <div className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/50 py-1 rounded">
                                                        <CheckCircle size={12} /> Asignado
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}

                                    {candidateTeachers.length === 0 && (
                                        <div className="col-span-full py-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                            <p className="text-slate-400 text-sm">No se encontraron docentes en este departamento.</p>
                                            <button
                                                onClick={() => setShowAllTeachers(true)}
                                                className="text-indigo-600 font-bold text-xs mt-2 hover:underline"
                                            >
                                                Mostrar todo el claustro
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 select-none">
                            <Layers size={64} className="mb-4 text-slate-200" />
                            <p className="text-xl font-bold text-slate-400">Selecciona Materia</p>
                            <p className="text-sm max-w-xs text-center mt-2 text-slate-400/70">
                                Navega por el listado de la izquierda para comenzar a asignar profesores.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
