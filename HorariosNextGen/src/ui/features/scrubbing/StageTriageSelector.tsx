import React, { useMemo } from 'react';
import { ParsedCourse } from '../../../utils/delphosParser';
import { Filter, CheckSquare, Square } from 'lucide-react';

interface StageTriageSelectorProps {
    allCourses: ParsedCourse[];
    activeLevels: Set<string>;
    onToggleLevels: (levelIds: string[], forceState?: boolean) => void;
}

export const StageTriageSelector: React.FC<StageTriageSelectorProps> = ({
    allCourses,
    activeLevels,
    onToggleLevels
}) => {

    // 1. Lexeme Analysis
    const stageGroups = useMemo(() => {
        const groups = new Map<string, ParsedCourse[]>();
        const keywordMatchers = [
            { key: "LOMLOE", regex: /LOMLOE/i },
            { key: "LOE", regex: /LOE/i },
            { key: "LOMCE", regex: /LOMCE/i },
            { key: "ESO", regex: /ESO|Secundaria/i },
            { key: "Bachillerato", regex: /Bachillerato/i },
            { key: "EBO", regex: /EBO/i },
            { key: "TVA", regex: /TVA/i },
            { key: "FP / Ciclos", regex: /Ciclo|Grado|FP/i },
            { key: "Otros", regex: /.*/ } // Fallback
        ];

        allCourses.forEach(course => {
            const name = course.name;
            let matched = false;

            // Prioritize Law tags first (LOMLOE/LOE)
            // Actually, a course can be "ESO (LOMLOE)". It belongs to BOTH logic.
            // But usually user wants to filter by "Etapa" (ESO vs EBO) or "Ley" (LOE vs LOMLOE).
            // Let's create buckets. If a course matches multiple, we might need a more complex UI.
            // Simplified approach: Primary classification.

            // Try to find the MOST specific tag.
            // Often "EBO (LOE)" -> Key: "EBO" AND Key: "LOE".
            // Let's just Group by "Lexeme" detected. One course can belong to multiple groups? 
            // Better: Unique distinct tags found.

            // Revised Strategy: Just Extract Tags
            const tags = new Set<string>();

            if (/LOMLOE/i.test(name)) tags.add("LOMLOE");
            if (/LOE/i.test(name)) tags.add("LOE");
            if (/EBO/i.test(name)) tags.add("EBO");
            if (/TVA/i.test(name)) tags.add("TVA");
            if (/ESO/i.test(name) || /Secundaria/i.test(name)) tags.add("ESO");
            if (/Bachillerato/i.test(name)) tags.add("Bachillerato");
            if (/Ciclo|Grado|FP/i.test(name)) tags.add("FP / Ciclos");

            if (tags.size === 0) tags.add("Otros");

            tags.forEach(tag => {
                if (!groups.has(tag)) groups.set(tag, []);
                groups.get(tag)!.push(course);
            });
        });

        // Convert to array and sort
        return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [allCourses]);

    // Helpers
    const getGroupStatus = (courses: ParsedCourse[]) => {
        const activeCount = courses.filter(c => activeLevels.has(c.id)).length;
        if (activeCount === 0) return 'NONE';
        if (activeCount === courses.length) return 'ALL';
        return 'SOME';
    };

    const handleGroupToggle = (tag: string, courses: ParsedCourse[]) => {
        const currentStatus = getGroupStatus(courses);
        const shouldActivate = currentStatus !== 'ALL'; // If Mixed or None, turn All ON. If All, turn Off.

        onToggleLevels(courses.map(c => c.id), shouldActivate);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1">
                    <Filter size={16} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 text-sm">Etapa 0: Triage Macro de Etapas</h3>
                    <p className="text-xs text-blue-800 mt-1">
                        Se han detectado las siguientes <strong>Familias Legislativas / Educativas</strong>.
                        Desactive aquellas familias antiguas (ej. LOE, LOGSE) o etapas que no desee gestionar para limpiar el área de trabajo.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stageGroups.map(([tag, courses]) => {
                    const status = getGroupStatus(courses);
                    const isAll = status === 'ALL';
                    const isNone = status === 'NONE';

                    return (
                        <div
                            key={tag}
                            onClick={() => handleGroupToggle(tag, courses)}
                            className={`
                                cursor-pointer group flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                ${!isNone ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                                    ${!isNone ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}
                                `}>
                                    {tag.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${!isNone ? 'text-slate-800' : 'text-slate-500'}`}>{tag}</h4>
                                    <p className="text-xs text-slate-400">{courses.length} Niveles detectados</p>
                                </div>
                            </div>

                            <div className={`transition-colors ${!isNone ? 'text-blue-600' : 'text-slate-300'}`}>
                                {isAll ? <CheckSquare size={24} /> : (status === 'SOME' ? <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center"><div className="w-4 h-1 bg-white" /></div> : <Square size={24} />)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Preview (Optional, or just trust the summary) */}
        </div>
    );
};
