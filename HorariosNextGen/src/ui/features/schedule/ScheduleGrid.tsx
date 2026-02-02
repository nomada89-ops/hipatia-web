import React, { useState } from 'react';
// REMOVED DND-KIT IMPORTS TO BYPASS NETWORK ERROR
// import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { QualityIndicator } from '../../components/QualityIndicator';
import { StatusHeader } from '../../components/StatusHeader';
import { ConflictPanel, Conflict } from './ConflictPanel';
import { useSecureNames } from '../../hooks/useSecureNames';
import { EngineRoom } from '../audit/EngineRoom';
import { MagneticModule } from '../magnetic/MagneticModule';
import { DataScrubbingModule } from '../scrubbing/DataScrubbingModule';
import { calculateDelta, DeltaReport } from '../../../utils/deltaSync';
import { DeltaDiscrepancyPanel } from '../scrubbing/DeltaDiscrepancyPanel';
import { parseDelphosXML, EngineReport, ParsedTeacher, ParsedSubject, ParsedGroup, ParsedTask, ParsedClassroom, ParsedCourse, ParsedData } from '../../../utils/delphosParser';
import { FileImportZone } from '../import/FileImportZone';
import { MatriculaModule } from '../enrollment/MatriculaModule';
import { BackpackBreakdownModal } from '../enrollment/BackpackBreakdownModal';
import { TimeframeConfig } from '../config/TimeframeConfig';
import { DepartmentSandbox } from './DepartmentSandbox';
import { AvailabilityManager } from './AvailabilityManager';
import { SessionManager } from './SessionManager';
import { Users, BookOpen, Layers, ClipboardList, Home, Magnet, ArrowRight } from 'lucide-react';

// --- Types ---
interface Session {
    id: string; // Database ID
    teacher_id: string;
    group_id: string;
    subject_id: string;
    day: number;
    slot_index: number;
    start_time: string;
    end_time: string;
}

enum Stage {
    TRIAGE = 'TRIAGE',
    ENROLLMENT = 'ENROLLMENT', // NEW: Student data enrichment
    SANDBOX = 'SANDBOX',
    AVAILABILITY = 'AVAILABILITY', // New Name for Preferences
    SESSIONS = 'SESSIONS',
    SOLVER = 'SOLVER'
}

// --- Visual-Only Components (No Drag & Drop) ---
// --- Visual-Only Components (No Drag & Drop) ---
const DraggableSession = ({ session, realName, isHighlighted }: { session: Session, realName: string, isHighlighted: boolean }) => {
    // VISUAL ONLY - No hooks
    return (
        <div
            title={`ID: ${session.subject_id}`} // Encapsulated ID on hover
            className={`p-2 mb-1 rounded text-xs shadow-sm cursor-default border-l-4 transition-all group
        ${isHighlighted ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300' : 'bg-white border-indigo-500 hover:bg-indigo-50'}
      `}
        >
            <div className="font-bold text-slate-800 truncate text-[11px] leading-tight mb-0.5">{realName}</div>
            <div className="flex justify-between items-center">
                <div className="text-[10px] text-slate-500 font-medium">{session.group_id}</div>
                {/* Visual Disambiguation: Show ID only if explicitly requested per user rule, or keep hidden/tooltip */}
                {/* User Rule: "Solo en caso de conflicto... añade sufijo". For now, ID is hidden mainly. */}
                <div className="text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {session.subject_id.substring(0, 6)}...
                </div>
            </div>
        </div>
    );
};

// --- Droppable Slot Component ---
const DroppableSlot = ({ day, slot, children, isHighlighted }: { day: number, slot: number, children: React.ReactNode, isHighlighted: boolean }) => {
    return (
        <div
            className={`min-h-[80px] border border-slate-100 p-1 flex flex-col transition-colors bg-white
        ${isHighlighted ? 'bg-red-50 ring-inset ring-2 ring-red-200' : ''}
      `}
        >
            {children}
        </div>
    );
};

interface ScheduleGridProps {
    externalProgress?: number;
    isProcessing?: boolean;
    isDemo?: boolean;
    onDataLoaded?: (data: { teachers: any[] }) => void;
}

interface ImportStats {
    teachers: number;
    sessions: number;
    engineReport?: EngineReport;
    subjects: ParsedSubject[];
    groups: ParsedGroup[];
    tasks: ParsedTask[];
    classrooms: ParsedClassroom[];
    courses: ParsedCourse[]; // NEW
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ externalProgress, isProcessing, isDemo, onDataLoaded }) => {
    // --- State ---
    const [sessions, setSessions] = useState<Session[]>([]); // Start empty for real mode
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [score, setScore] = useState(0);
    const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
    const [stage, setStage] = useState<Stage>(Stage.TRIAGE);
    const [itinerancyConstraints, setItinerancyConstraints] = useState<Map<string, string[]>>(new Map());
    const [simultaneityConstraints, setSimultaneityConstraints] = useState<Map<string, string[]>>(new Map()); // NEW for Persistence

    const [isScrubbed, setIsScrubbed] = useState(false); // NEW STATE
    const [showMagnetic, setShowMagnetic] = useState(false);
    const [showTimeframe, setShowTimeframe] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false); // NEW STATE
    const [importStats, setImportStats] = useState<ImportStats | null>(null);
    const [parsedTeachers, setParsedTeachers] = useState<any[]>([]);
    const [hasImported, setHasImported] = useState(false);
    const [fileHead, setFileHead] = useState<string>("");

    // --- Delta Sync State ---
    const [deltaReport, setDeltaReport] = useState<DeltaReport | null>(null);
    const [showDeltaPanel, setShowDeltaPanel] = useState(false);
    const [pendingImportData, setPendingImportData] = useState<ParsedData | null>(null);

    const handleHighlight = (ids: string[]) => {
        setHighlightedIds(ids);
        setTimeout(() => setHighlightedIds([]), 3000);
    };

    const handleFileImport = async (file: File) => {
        console.log("Importing:", file.name);
        try {
            const text = await file.text();
            setFileHead(text.substring(0, 600));

            const result = await parseDelphosXML(file);

            if (hasImported && importStats) {
                // DELTA SYNC CHECK
                const currentData: ParsedData = {
                    teachers: parsedTeachers,
                    subjects: importStats.subjects,
                    groups: importStats.groups,
                    tasks: importStats.tasks,
                    classrooms: importStats.classrooms,
                    courses: importStats.courses || [],
                    engineReport: importStats.engineReport!
                };

                const report = calculateDelta(currentData, result);
                const hasChanges = (report.stats.newTeachers + report.stats.removedTeachers + report.stats.modifiedTeachers +
                    report.stats.newSubjects + report.stats.removedSubjects + report.stats.modifiedSubjects +
                    report.stats.newGroups + report.stats.removedGroups + report.stats.modifiedGroups) > 0;

                if (hasChanges) {
                    setDeltaReport(report);
                    setPendingImportData(result);
                    setShowDeltaPanel(true);
                    return;
                }
            }

            // Normal Load
            applyImport(result);

        } catch (e) {
            console.error("XML Parse Error", e);
            alert("Error al leer el archivo XML. Asegúrese de que es un XML de Delphos válido.");
        }
    };

    const applyImport = (result: ParsedData) => {
        setParsedTeachers(result.teachers);
        setImportStats({
            teachers: result.teachers.length,
            sessions: result.engineReport.totalSessions,
            engineReport: result.engineReport,
            subjects: result.subjects,
            groups: result.groups,
            tasks: result.tasks,
            classrooms: result.classrooms,
            courses: result.courses
        });
        setHasImported(true);
        if (onDataLoaded) onDataLoaded({ teachers: result.teachers });

        // Reset Scrubbing if new data (fresh start) ??
        // Actually user said "Preserve Metadata".
        // If we just overwrite here, we might lose some things if we don't merge.
        // But the requirement is mainly about the *Delta Check* first.
        // Persistence of 'itinerancyConstraints' is naturally handled because 'itinerancyConstraints' state 
        // is keyed by ID. If IDs persist in 'result.teachers', the map entries remain valid.
        setIsScrubbed(false); // Force re-scrubbing on new import?
    };

    const handleConfirmSync = () => {
        if (pendingImportData) {
            applyImport(pendingImportData);
            setShowDeltaPanel(false);
            setPendingImportData(null);
        }
    };

    const handleCancelSync = () => {
        setShowDeltaPanel(false);
        setPendingImportData(null);
    };

    // ... demo helpers ...

    const handleVacanciesGenerated = (newTeachers: any[], newReport: any) => {
        const updatedList = [...parsedTeachers, ...newTeachers];
        setParsedTeachers(updatedList);
        setImportStats(prev => prev ? ({ ...prev, teachers: updatedList.length, engineReport: newReport }) : null);

        if (onDataLoaded) {
            onDataLoaded({ teachers: updatedList });
        }
        alert(`✅ Se han generado ${newTeachers.length} vacantes. La plantilla está equilibrada.`);
    };

    const handleTimeframeSave = async (config: any) => {
        setShowTimeframe(false);
        setIsSimulating(true);

        // TRIGGER SOLVER MOCK
        try {
            await fetch('http://127.0.0.1:8000/process/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
            }).catch(() => console.warn("Backend unavailable"));
        } catch (e) {
            console.warn("Backend unavailable");
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-end px-6 py-4 bg-white border-b border-slate-200">
                <div className="flex items-center gap-4">
                    {/* DEV NAVIGATION - REMOVE IN PROD */}
                    <div className="flex bg-slate-100 rounded-lg p-1 mr-4">
                        {[
                            { id: Stage.TRIAGE, label: '1. Higiene' },
                            { id: Stage.ENROLLMENT, label: '2. Matrícula' },
                            { id: Stage.SANDBOX, label: '3. Sandbox' },
                            { id: Stage.AVAILABILITY, label: '4. Preferencias' },
                            { id: Stage.SESSIONS, label: '5. Mesa Mezclas' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStage(s.id)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${stage === s.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Stats if imported */}
                    {importStats && (
                        <div className="flex gap-4 text-xs font-mono text-slate-500">
                            <span className="flex items-center gap-1"><Users size={14} className="text-indigo-600" /> {importStats.teachers} Docentes</span>
                            <span className="flex items-center gap-1"><BookOpen size={14} className="text-emerald-600" /> {importStats.subjects.length} Materias</span>
                            <span className="flex items-center gap-1"><Layers size={14} className="text-amber-600" /> {importStats.groups.length} Grupos</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area - Switch based on Stage */}
            <div className="flex-1 overflow-hidden relative">

                {/* STAGE 1: TRIAGE (Import + Scrubbing + Magnetic) */}
                {stage === Stage.TRIAGE && (
                    <div className="h-full overflow-y-auto p-6">
                        <div className="max-w-7xl mx-auto flex flex-col items-center">
                            {!hasImported && <FileImportZone onFileSelected={handleFileImport} />}

                            {importStats && importStats.engineReport && (
                                <div className="w-full mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {/* Strict Assignments Panel */}
                                    {importStats.sessions === 0 && importStats.subjects.length > 0 && (
                                        <div className="w-full p-6 rounded-xl border border-amber-200 bg-amber-50 backdrop-blur-sm">
                                            {/* ... content ... */}
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                                                    <ClipboardList size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-amber-900">Datos Maestros Cargados</h3>
                                                    <p className="text-sm text-amber-700 mt-1">
                                                        Se han detectado {importStats.teachers} docentes y {importStats.subjects.length} materias.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <EngineRoom
                                        report={importStats.engineReport}
                                        onVacanciesGenerated={handleVacanciesGenerated}
                                    />

                                    {/* Navigation to Next Stage */}
                                    <div className="flex justify-end p-4 gap-4">
                                        <button
                                            onClick={() => setShowMagnetic(true)}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/20 font-medium transition-all flex items-center gap-2"
                                        >
                                            <Magnet className="w-5 h-5" />
                                            (Opcional) Vinculación Magnética
                                        </button>
                                        <button
                                            onClick={() => setStage(Stage.ENROLLMENT)}
                                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg font-medium transition-all flex items-center gap-2"
                                        >
                                            Ir a Módulo de Matrícula <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STAGE 1.5: ENROLLMENT (Data Fusion) */}
                {stage === Stage.ENROLLMENT && importStats && (
                    <MatriculaModule
                        data={{
                            teachers: parsedTeachers,
                            subjects: importStats.subjects,
                            groups: importStats.groups,
                            tasks: importStats.tasks,
                            classrooms: importStats.classrooms,
                            courses: importStats.courses || [],
                            engineReport: importStats.engineReport!
                        }}
                        onComplete={(enrichedData) => {
                            applyImport(enrichedData);
                            setStage(Stage.SANDBOX);
                        }}
                        onBack={() => setStage(Stage.TRIAGE)}
                    />
                )}

                {/* STAGE 2: SANDBOX */}
                {stage === Stage.SANDBOX && (
                    <DepartmentSandbox
                        teachers={parsedTeachers}
                        subjects={importStats?.subjects || []}
                        courses={importStats?.courses || []}
                        onUpdateAssignments={(t, s) => {
                            setParsedTeachers(t);
                            // Also need to update subjects state? currently importStats.subjects is source of truth
                            // ideally setImportStats with new subjects
                        }}
                        onNext={() => setStage(Stage.AVAILABILITY)}
                        onBack={() => setStage(Stage.TRIAGE)}
                    />
                )}

                {/* STAGE 3: AVAILABILITY */}
                {stage === Stage.AVAILABILITY && (
                    <AvailabilityManager
                        teachers={parsedTeachers}
                        onNext={() => setStage(Stage.SESSIONS)}
                        onBack={() => setStage(Stage.SANDBOX)}
                    />
                )}

                {/* STAGE 4: SESSIONS */}
                {stage === Stage.SESSIONS && (
                    <SessionManager
                        teachers={parsedTeachers}
                        subjects={importStats?.subjects || []}
                        initialSimultaneity={simultaneityConstraints}
                        onUpdateSimultaneity={(newMap) => setSimultaneityConstraints(newMap)}
                        onFinish={() => setShowTimeframe(true)}
                        onBack={() => setStage(Stage.AVAILABILITY)}
                    />
                )}

            </div>



            {/* Scrubbing Overlay (Before Magnetic) */}
            {
                showDeltaPanel && deltaReport && (
                    <div className="absolute inset-0 z-50 bg-slate-50 animate-in zoom-in-95 duration-200">
                        <DeltaDiscrepancyPanel
                            report={deltaReport}
                            onConfirm={handleConfirmSync}
                            onCancel={handleCancelSync}
                        />
                    </div>
                )
            }

            {
                importStats && !isScrubbed && !showDeltaPanel && (
                    <div className="absolute inset-0 z-40 bg-slate-50 animate-in fade-in duration-300">
                        <DataScrubbingModule
                            data={{
                                teachers: parsedTeachers, // Use parsedTeachers which might include generated ones
                                subjects: importStats.subjects,
                                groups: importStats.groups,
                                tasks: importStats.tasks,
                                classrooms: importStats.classrooms,
                                courses: importStats.courses, // NEW
                                engineReport: importStats.engineReport!
                            }}
                            initialExternalBlocks={itinerancyConstraints}
                            initialSimultaneity={simultaneityConstraints}
                            onComplete={(cleanedData, simultaneityBlocks, merges, externalBlocks) => {
                                // Apply cleaning results (CASCADE FILTER UPDATE)
                                setParsedTeachers(cleanedData.teachers);
                                setImportStats(prev => prev ? ({
                                    ...prev,
                                    subjects: cleanedData.subjects,
                                    groups: cleanedData.groups,
                                    courses: cleanedData.courses,
                                    tasks: cleanedData.tasks, // If filtered
                                    classrooms: cleanedData.classrooms // If filtered
                                }) : null);

                                setIsScrubbed(true);
                                // Store external blocks (Itinerancy)
                                if (externalBlocks) setItinerancyConstraints(externalBlocks);
                                // Store simultaneity blocks (Persistence)
                                if (simultaneityBlocks) setSimultaneityConstraints(simultaneityBlocks);

                                // DIRECT NAVIGATION TO SANDBOX (User Request)
                                setStage(Stage.SANDBOX);
                            }}
                        />
                    </div>
                )
            }

            {/* Magnetic Overlay */}
            {
                showMagnetic && isScrubbed && importStats && (
                    <div className="absolute inset-0 z-40 bg-slate-100 animate-in fade-in duration-300">
                        <MagneticModule
                            data={{
                                teachers: parsedTeachers,
                                subjects: importStats.subjects,
                                groups: importStats.groups,
                                tasks: importStats.tasks,
                                classrooms: importStats.classrooms,
                                courses: importStats.courses, // NEW
                                engineReport: importStats.engineReport!
                            }}
                            onComplete={(stakes) => {
                                console.log("Stakes created:", stakes);
                                setShowMagnetic(false);
                                setShowTimeframe(true);
                            }}
                        />
                    </div>
                )
            }

            {/* Config Overlay - Only show when showTimeframe is true */}
            {
                showTimeframe && (
                    <div className="absolute inset-0 z-50 bg-slate-500/30 backdrop-blur-sm animate-in fade-in duration-300">
                        <TimeframeConfig onSave={() => setShowTimeframe(false)} />
                    </div>
                )
            }
            {/* ENROLLMENT MODAL (Shared) */}
            <BackpackBreakdownModal />
        </div >
    );
};

