import React, { useState, useMemo } from 'react';
import { ParsedData, EngineReport, ParsedTeacher } from '../../../utils/delphosParser';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { LevelCascadingSelector } from './LevelCascadingSelector';
import { StageTriageSelector } from './StageTriageSelector';
import { EngineRoom } from '../audit/EngineRoom'; // Step 0

import { OrphanDetector } from './OrphanDetector';

interface DataScrubbingModuleProps {
    data: ParsedData;
    initialExternalBlocks?: Map<string, string[]>;
    initialSimultaneity?: Map<string, string[]>;
    onComplete: (
        cleanedData: ParsedData,
        simultaneityBlocks: Map<string, string[]>,
        merges: any[],
        externalBlocks: Map<string, string[]>
    ) => void;
}

// --- State Interfaces ---
export interface ScrubbingState {
    activeLevels: Set<string>;
    simultaneityBlocks: Map<string, string[]>; // BlockID -> [Subject IDs]
    externalBlocks: Map<string, string[]>; // TeacherID -> [SlotIDs]
    ignoredIds: Set<string>;
    metaSubjectInfo: Map<string, { name: string, color: string }>;
    // New Audit State
    currentReport: EngineReport | null; // Null means use initial from data
    generatedVacancies: ParsedTeacher[];
}

export const DataScrubbingModule: React.FC<DataScrubbingModuleProps> = ({
    data,
    initialExternalBlocks,
    initialSimultaneity,
    onComplete
}) => {
    // --- Central State ---
    const [step, setStep] = useState<number>(0);
    const [state, setState] = useState<ScrubbingState>({
        activeLevels: new Set(),
        simultaneityBlocks: initialSimultaneity || new Map(),
        externalBlocks: initialExternalBlocks || new Map(),
        ignoredIds: new Set(),
        metaSubjectInfo: new Map(),
        currentReport: null,
        generatedVacancies: []
    });

    // --- Derived Data ---
    const effectiveReport = state.currentReport || data.engineReport;
    const effectiveTeachers = useMemo(() => {
        return [...data.teachers, ...state.generatedVacancies];
    }, [data.teachers, state.generatedVacancies]);

    const scrubbedStats = useMemo(() => {
        const activeGroups = data.groups.filter(g => state.activeLevels.has(g.courseId) && !state.ignoredIds.has(g.id));
        const activeSubjects = data.subjects.filter(s => state.activeLevels.has(s.courseId) && !state.ignoredIds.has(s.id));

        return {
            groupsCount: activeGroups.length,
            subjectsCount: activeSubjects.length,
            teachersCount: effectiveTeachers.length
        };
    }, [data, state.activeLevels, state.ignoredIds, effectiveTeachers]);

    const orphans = useMemo(() => {
        const activeS = data.subjects.filter(s => state.activeLevels.has(s.courseId) && !state.ignoredIds.has(s.id));
        const activeG = data.groups.filter(g => state.activeLevels.has(g.courseId) && !state.ignoredIds.has(g.id));

        const groupCourseIds = new Set(activeG.map(g => g.courseId));
        const subjectCourseIds = new Set(activeS.map(s => s.courseId));

        const badSubjects = activeS.filter(s => !groupCourseIds.has(s.courseId));
        const badGroups = activeG.filter(g => !subjectCourseIds.has(g.courseId));

        return { badSubjects, badGroups };
    }, [data, state.activeLevels, state.ignoredIds]);

    // --- Actions ---
    const toggleLevel = (levelId: string) => {
        const newSet = new Set(state.activeLevels);
        if (newSet.has(levelId)) {
            newSet.delete(levelId);
        } else {
            newSet.add(levelId);
        }
        setState(prev => ({ ...prev, activeLevels: newSet }));
    };

    // Bulk Toggle for Step 1 (Triage)
    const toggleLevels = (ids: string[], forceState?: boolean) => {
        const newSet = new Set(state.activeLevels);
        ids.forEach(id => {
            if (forceState !== undefined) {
                if (forceState) newSet.add(id);
                else newSet.delete(id);
            } else {
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
            }
        });
        setState(prev => ({ ...prev, activeLevels: newSet }));
    };

    // --- Audit Actions (Step 0) ---
    const handleVacanciesGenerated = (newTeachers: ParsedTeacher[], newReport: EngineReport) => {
        setState(prev => ({
            ...prev,
            generatedVacancies: [...prev.generatedVacancies, ...newTeachers],
            currentReport: newReport
        }));
    };

    // --- Simultaneity Actions (Step 2) ---
    const handleCreateBlock = (subjectIds: string[]) => {
        const newMap = new Map(state.simultaneityBlocks);
        for (const [bid, items] of newMap.entries()) {
            const filtered = items.filter(id => !subjectIds.includes(id));
            if (filtered.length === 0) newMap.delete(bid);
            else newMap.set(bid, filtered);
        }

        const blockId = crypto.randomUUID();
        newMap.set(blockId, subjectIds);
        setState(prev => ({ ...prev, simultaneityBlocks: newMap }));
    };

    const handleDeleteBlock = (blockId: string) => {
        const newMap = new Map(state.simultaneityBlocks);
        newMap.delete(blockId);
        setState(prev => ({ ...prev, simultaneityBlocks: newMap }));
    };

    const handleIgnore = (id: string, _type: 'SUBJECT' | 'GROUP') => {
        const newSet = new Set(state.ignoredIds);
        newSet.add(id);
        setState(prev => ({ ...prev, ignoredIds: newSet }));
    };

    // --- Navigation ---
    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // FINALIZE AND EXPORT

            // 1. Filter Data
            const filteredGroups = data.groups.filter(g => state.activeLevels.has(g.courseId) && !state.ignoredIds.has(g.id));
            const filteredSubjects = data.subjects.filter(s => state.activeLevels.has(s.courseId) && !state.ignoredIds.has(s.id));
            const filteredCourses = data.courses.filter(c => state.activeLevels.has(c.id));

            // 2. Resolve Lazy Clones & Blocks
            const finalSubjects = [...filteredSubjects];
            const finalBlocks = new Map<string, string[]>();

            state.simultaneityBlocks.forEach((ids, blockId) => {
                const resolvedIds = ids.map(id => {
                    if (id.includes('::')) {
                        const [originalId, groupName] = id.split('::');
                        const original = data.subjects.find(s => s.id === originalId);

                        if (original) {
                            // Validation: Check if group exists
                            // const group = data.groups.find(g => g.name === groupName && g.courseId === original.courseId);
                            const concreteId = `${originalId}-${groupName.replace(/\s/g, '')}`;

                            if (!finalSubjects.some(s => s.id === concreteId)) {
                                finalSubjects.push({
                                    ...original,
                                    id: concreteId,
                                    group: groupName,
                                    teacherId: undefined
                                });
                            }
                            return concreteId;
                        }
                        return id;
                    }
                    return id;
                });
                finalBlocks.set(blockId, resolvedIds);
            });

            // 3. Construct Final Data (Including Vacancies)
            const cleanedData: ParsedData = {
                ...data,
                groups: filteredGroups,
                subjects: finalSubjects,
                courses: filteredCourses,
                teachers: effectiveTeachers, // Include generated vacancies
                engineReport: effectiveReport // Include updated report
            };

            onComplete(cleanedData, finalBlocks, [], state.externalBlocks);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    // --- Render Steps ---

    // Step 0: Engine Room
    const renderEngineRoom = () => (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex gap-4 items-start">
                <div className="bg-white p-2 rounded-full text-indigo-600 shadow-sm">
                    <div className="w-6 h-6 font-bold flex items-center justify-center">1</div>
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900">Auditoría de Plantilla</h3>
                    <p className="text-sm text-indigo-700">
                        Revise el balance de horas por departamento. Si faltan horas, puede
                        <strong> Generar Profesores Vacantes</strong> automáticamente.
                    </p>
                </div>
            </div>
            <EngineRoom
                report={effectiveReport}
                onVacanciesGenerated={handleVacanciesGenerated}
            />
        </div>
    );

    // Step 1: Stage Selection
    const renderStageTriage = () => (
        <StageTriageSelector
            allCourses={data.courses}
            activeLevels={state.activeLevels}
            onToggleLevels={toggleLevels}
        />
    );

    // Step 2: Scrubbing
    const renderLevelSelector = () => (
        <LevelCascadingSelector
            allGroups={data.groups}
            allSubjects={data.subjects}
            allCourses={data.courses}
            activeLevels={state.activeLevels}
            simultaneityBlocks={state.simultaneityBlocks}
            onToggle={toggleLevel}
            onCreateBlock={handleCreateBlock}
            onDeleteBlock={handleDeleteBlock}
            activeStep={step}
        />
    );

    const getStepTitle = () => {
        switch (step) {
            case 0: return "Auditoría de Plantilla";
            case 1: return "Selección de Niveles";
            case 2: return "Definición de Simultaneidad";
            default: return "Higiene de Datos";
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <OrphanDetector
                orphanedSubjects={orphans.badSubjects}
                orphanedGroups={orphans.badGroups}
                onIgnore={handleIgnore}
            />

            {/* Header Steps */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        {step > 0 && (
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
                                title="Volver al paso anterior"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {getStepTitle()}
                            </h1>
                            <p className="text-xs text-slate-400 font-mono">Paso {step + 1} de 3</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {[0, 1, 2].map(s => (
                            <div
                                key={s}
                                className={`w-3 h-3 rounded-full transition-all ${step === s ? 'bg-indigo-600 scale-125' : (s < step ? 'bg-indigo-300' : 'bg-slate-200')}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto h-full">
                    {step === 0 && renderEngineRoom()}
                    {step === 1 && renderStageTriage()}
                    {step === 2 && renderLevelSelector()}
                </div>
            </div>

            {/* Footer Audit */}
            <div className="bg-white border-t border-slate-200 p-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex gap-6 text-sm">
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs">Grupos Activos</span>
                            <span className="font-bold text-slate-700">{scrubbedStats.groupsCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs">Materias</span>
                            <span className="font-bold text-slate-700">{scrubbedStats.subjectsCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs">Docentes</span>
                            <span className="font-bold text-slate-700">
                                {scrubbedStats.teachersCount}
                                {state.generatedVacancies.length > 0 && <span className="text-emerald-600 ml-1">(+{state.generatedVacancies.length})</span>}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {step > 0 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                            >
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && state.activeLevels.size === 0}
                            className={`
                                px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
                                ${(step === 1 && state.activeLevels.size === 0)
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'}
                            `}
                        >
                            {step === 2 ? 'Finalizar e Ir al Sandbox' : 'Siguiente Paso'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
