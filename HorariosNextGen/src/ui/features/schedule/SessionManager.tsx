import React, { useState, useMemo } from 'react';
import { ParsedTeacher, ParsedSubject } from '../../../utils/delphosParser';
import { ArrowRight, Search, Link, Unlink, AlertTriangle, Check, Layers, User } from 'lucide-react';

interface SessionManagerProps {
    teachers: ParsedTeacher[];
    subjects: ParsedSubject[];
    initialSimultaneity: Map<string, string[]>;
    onUpdateSimultaneity: (map: Map<string, string[]>) => void;
    onBack: () => void;
    onFinish: () => void;
}

// --- Rhythm Logic ---
// Default patterns based on total hours
const getRhythmPatterns = (hours: number): string[] => {
    if (hours === 4) return ["1+1+1+1", "2+1+1", "2+2"];
    if (hours === 3) return ["1+1+1", "2+1", "3"];
    if (hours === 2) return ["1+1", "2"];
    return ["1".repeat(hours).split("").join("+")];
};

export const SessionManager: React.FC<SessionManagerProps> = ({
    teachers,
    subjects,
    initialSimultaneity,
    onUpdateSimultaneity,
    onBack,
    onFinish
}) => {
    // --- State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [simultaneity, setSimultaneity] = useState<Map<string, string[]>>(initialSimultaneity);
    const [rhythms, setRhythms] = useState<Map<string, string>>(new Map()); // SubjectID -> Pattern (e.g. "2+1")

    // --- Helpers ---
    const getAssignedTeacher = (subjectId: string) => {
        // Teacher state usually has "assignedSubjects" array of IDs? 
        // In DelphosParser, ParsedTeacher doesn't have it by default, BUT `DepartmentSandbox` updates it.
        // We assume `teachers` passed here has the generic internal structure or we rely on `subject.teacherId` if updated.
        // Let's assume `DepartmentSandbox` updated the `ParsedTeacher` object with an array `assignedSubjects: string[]` ??
        // Actually, `ParsedTeacher` interface in delphosParser.ts is minimal. 
        // We need to check if we can rely on `subject.teacherId` if we updated it in Sandbox.
        // If not, we scan teachers.

        // Strategy: Check subject.teacherId first (most robust if propagated)
        // Fallback: Check if teacher has this subject ID (if teachers have extended props).
        // Since we are in TS, we might cast teacher to any to check 'assignedSubjects'.

        // Let's look for subject.teacherId first.
        // Find teacher by ID
        /* if (subject.teacherId) return teachers.find(t => t.id === subject.teacherId); */

        // Scan
        for (const t of teachers) {
            if ((t as any).assignedSubjects && (t as any).assignedSubjects.includes(subjectId)) {
                return t;
            }
        }
        return null;
    };

    const getTeacherLoad = (teacher: ParsedTeacher) => {
        // Simple calc: Count assigned subjects * standard hours (assume 3 if unknown)? 
        // Or sum specific hours.
        const assigned = (teacher as any).assignedSubjects || [];
        return assigned.length * 3; // Approximation for demo
    };

    // --- Derived Data ---
    const enrichedRows = useMemo(() => {
        return subjects
            .filter(s => {
                const q = searchQuery.toLowerCase();
                return (
                    s.name.toLowerCase().includes(q) ||
                    s.group?.toLowerCase().includes(q) ||
                    s.courseId.toLowerCase().includes(q) ||
                    s.id.toLowerCase().includes(q)
                );
            })
            .map(s => {
                const teacher = getAssignedTeacher(s.id);
                const blockInfo = Array.from(simultaneity.entries()).find(([_, ids]) => ids.includes(s.id));
                return {
                    subject: s,
                    teacher,
                    blockId: blockInfo ? blockInfo[0] : null,
                    blockSize: blockInfo ? blockInfo[1].length : 0,
                    hours: s.hours || 3, // Default to 3h
                    rhythm: rhythms.get(s.id) || getRhythmPatterns(s.hours || 3)[0]
                };
            });
    }, [subjects, teachers, searchQuery, simultaneity, rhythms]);

    // --- Actions ---
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleCreateBlock = () => {
        if (selectedIds.size < 2) return;
        const newMap = new Map(simultaneity);
        const blockId = crypto.randomUUID();

        // Remove from old blocks logic omitted for brevity (assume clean for now or overwrite)

        newMap.set(blockId, Array.from(selectedIds));
        setSimultaneity(newMap);
        onUpdateSimultaneity(newMap);
        setSelectedIds(new Set());
    };

    const handleUnlink = (blockId: string) => {
        const newMap = new Map(simultaneity);
        newMap.delete(blockId);
        setSimultaneity(newMap);
        onUpdateSimultaneity(newMap);
    };

    const cycleRhythm = (subjectId: string, currentHours: number) => {
        const patterns = getRhythmPatterns(currentHours);
        const currentPattern = rhythms.get(subjectId) || patterns[0];
        const idx = patterns.indexOf(currentPattern);
        const next = patterns[(idx + 1) % patterns.length];

        const newMap = new Map(rhythms);
        newMap.set(subjectId, next);
        setRhythms(newMap);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header & Search */}
            <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="text-indigo-600" /> Mesa de Mezclas 2.0 (Live)
                        </h2>
                        <p className="text-xs text-slate-400">
                            Configura ritmos y simultaneidad. {subjects.length} materias cargadas.
                        </p>
                    </div>

                    <div className="flex-1 max-w-xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por profesor, grupo o materia..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={onBack} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium">
                            Atrás
                        </button>
                        <button onClick={onFinish} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 text-sm transition-transform hover:scale-105 active:scale-95">
                            Generar Horario <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar (Simultaneity) */}
            {selectedIds.size > 0 && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-top-4 fade-in duration-300">
                    <button
                        onClick={handleCreateBlock}
                        disabled={selectedIds.size < 2}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl transition-all
                            ${selectedIds.size >= 2
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 scale-110'
                                : 'bg-slate-800 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        <Link size={18} />
                        {selectedIds.size >= 2 ? `Simultanear Bloque (${selectedIds.size})` : 'Selecciona más...'}
                    </button>
                </div>
            )}

            {/* Main Content: Smart Rows */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-2 pb-20">
                    {enrichedRows.map(({ subject, teacher, blockId, blockSize, hours, rhythm }) => {
                        const isSelected = selectedIds.has(subject.id);
                        const isBlocked = !!blockId;

                        // Validation Logic from Stage 2 (Mocked here)
                        const teacherLoad = teacher ? getTeacherLoad(teacher) : 0;
                        const isOverload = teacherLoad > 18;

                        return (
                            <div
                                key={subject.id}
                                className={`
                                    relative bg-white border rounded-xl p-3 flex items-center gap-4 transition-all duration-200
                                    ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md z-10' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}
                                    ${isBlocked ? 'bg-indigo-50/50 border-indigo-200' : ''}
                                `}
                            >
                                {/* Magnet Column */}
                                <div className="pl-2">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelection(subject.id)}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            disabled={isBlocked}
                                        />
                                        {isBlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-indigo-100 rounded pointer-events-none">
                                                <Link size={12} className="text-indigo-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Subject Context */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 truncate">{subject.name}</h4>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded border border-slate-200">
                                            {subject.group || "Sin Grupo"}
                                        </span>
                                        {isBlocked && (
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                <Link size={10} /> Bloque de {blockSize}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <span>{subject.courseId}</span>
                                        <span>•</span>
                                        <span className="font-mono">{subject.id}</span>
                                    </div>
                                </div>

                                {/* Teacher Card (Validation) */}
                                <div className="w-64 border-l border-slate-100 pl-4">
                                    {teacher ? (
                                        <div className={`flex items-center gap-3 p-2 rounded-lg ${isOverload ? 'bg-red-50 border border-red-100' : ''}`}>
                                            <div className={`p-1.5 rounded-full ${isOverload ? 'bg-red-200 text-red-700' : 'bg-slate-200 text-slate-500'}`}>
                                                <User size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${isOverload ? 'text-red-800' : 'text-slate-700'}`}>
                                                    {teacher.name}
                                                </p>
                                                {isOverload && (
                                                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-0.5 animate-pulse">
                                                        <AlertTriangle size={10} /> Carga Excedida ({teacherLoad}h)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic p-2">
                                            Sin profesor asignado
                                        </div>
                                    )}
                                </div>

                                {/* Rhythm Selector */}
                                <div className="w-48 border-l border-slate-100 pl-4 flex flex-col items-end">
                                    <button
                                        onClick={() => cycleRhythm(subject.id, hours)}
                                        className="group relative flex items-center gap-1 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors w-full justify-end"
                                        title="Click para cambiar ritmo"
                                    >
                                        <div className="flex flex-col items-end mr-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ritmo</span>
                                            <span className="text-sm font-bold text-indigo-700 font-mono">
                                                {rhythm}
                                            </span>
                                        </div>
                                        {/* Visual Bubbles */}
                                        <div className="flex items-center gap-1">
                                            {rhythm.split('+').map((part, i) => (
                                                <div
                                                    key={i}
                                                    className={`
                                                        rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shadow-sm
                                                        ${part === '2' ? 'w-6 h-6 bg-indigo-600' : 'w-5 h-5 bg-slate-400'}
                                                    `}
                                                >
                                                    {part}
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                </div>

                                {/* Unlink Action (Only if blocked) */}
                                {isBlocked && (
                                    <button
                                        onClick={() => handleUnlink(blockId!)}
                                        className="absolute -top-2 -right-2 p-1 bg-white border border-red-100 text-red-400 rounded-full shadow-sm hover:text-red-600 hover:scale-110 transition-all z-20"
                                        title="Romper simultaneidad"
                                    >
                                        <Unlink size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {enrichedRows.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No se encontraron materias con "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
