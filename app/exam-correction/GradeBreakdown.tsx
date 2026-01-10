'use client';
import React, { useMemo, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { SegmentedProgress } from './SegmentedProgress';

interface GradeBreakdownProps {
    htmlContent: string;
}

export const GradeBreakdown = ({ htmlContent }: GradeBreakdownProps) => {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const criteria = useMemo(() => {
        if (!htmlContent) return [];
        // Regex to extract items from <li> with score/max formatting
        const regex = /<li.*?>\s*(?:<.*?>)*\s*(.*?)\s*(?:<\/.*?>)*\s*:\s*(\d+(?:\.\d+)?)\s*(?:\/|de)\s*(\d+(?:\.\d+)?)/gi;
        const results = [];
        let match;
        let safety = 0;
        regex.lastIndex = 0;

        while ((match = regex.exec(htmlContent)) !== null && safety < 50) {
            const name = match[1].replace(/<[^>]+>/g, '').trim();
            const score = parseFloat(match[2]);
            const max = parseFloat(match[3]);

            if (name && !isNaN(score) && !isNaN(max)) {
                results.push({ name, score, max });
            }
            safety++;
        }
        return results;
    }, [htmlContent]);

    if (criteria.length === 0) return null;

    const getStatusStyle = (percentage: number) => {
        if (percentage >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Sobresaliente' };
        if (percentage >= 50) return { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Satisfactorio' };
        return { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Insuficiente' };
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-soft border border-slate-200 animate-fade-in space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Distribución de Puntos</h3>
            <div className="space-y-4">
                {criteria.map((item, idx) => {
                    const percentage = Math.min(Math.max((item.score / item.max) * 100, 0), 100);
                    const style = getStatusStyle(percentage);
                    const isExpanded = expandedIdx === idx;

                    return (
                        <div
                            key={idx}
                            className={`group rounded-xl border transition-all duration-300 ${isExpanded ? 'border-indigo-200 bg-slate-50 shadow-soft' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div
                                className="p-4 cursor-pointer flex items-center justify-between"
                                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                    <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                                        {style.label}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="font-mono text-sm font-black text-slate-900">{item.score.toFixed(2)}</span>
                                        <span className="font-mono text-[10px] font-bold text-slate-400 block -mt-1">/ {item.max}</span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-4 pb-4 space-y-3">
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${percentage >= 50 ? 'bg-indigo-600' : 'bg-rose-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                        El alumno ha alcanzado el <span className="text-slate-900 font-bold">{percentage.toFixed(1)}%</span> de la puntuación máxima asignada a esta competencia.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
