import React from 'react';
import { CheckCircle, ServerCog, Loader2 } from 'lucide-react';

interface StatusHeaderProps {
    totalSessions: number;
    placedSessions: number;
    qualityScore: number;
    overrideProgress?: number;
    customLabel?: string;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
    totalSessions,
    placedSessions,
    qualityScore,
    overrideProgress,
    customLabel
}) => {
    // Determine which progress to use
    const isSystemMode = overrideProgress !== undefined;

    const schedulingPercent = Math.min(100, Math.round((placedSessions / totalSessions) * 100));
    const activePercent = isSystemMode ? overrideProgress : schedulingPercent;

    const isComplete = activePercent === 100;

    // Quality Logic (from previous QualityIndicator)
    const maxPenalty = 500;
    const qualityPercent = Math.max(0, 100 - (qualityScore / maxPenalty) * 100);

    const getQualityColor = (p: number) => {
        if (p > 80) return 'text-emerald-600 bg-emerald-100';
        if (p > 50) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex items-center justify-between gap-6 transition-all duration-500">
            {/* Left: Progress Section */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        {isSystemMode ? (
                            <span className="flex items-center gap-1 text-indigo-600 animate-pulse">
                                <ServerCog className="w-4 h-4" />
                                {customLabel || "System Processing"}
                            </span>
                        ) : (
                            "Scheduling Progress"
                        )}

                        {isComplete && !isSystemMode && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ready for Review
                            </span>
                        )}
                    </h2>
                    <span className="text-xs font-semibold text-slate-500">
                        {isSystemMode ? `${activePercent}% Completed` : `${placedSessions} / ${totalSessions} sessions (${activePercent}%)`}
                    </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    {/* Background Striping for System Mode */}
                    {isSystemMode && activePercent !== 100 && (
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-stripes z-10 opacity-30"></div>
                    )}

                    <div
                        className={`h-full transition-all duration-700 ease-out z-0 
                            ${isComplete ? 'bg-emerald-500' : isSystemMode ? 'bg-indigo-600' : 'bg-indigo-500'}
                        `}
                        style={{ width: `${activePercent}%` }}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-slate-200"></div>

            {/* Right: Quality Visualization (Dimmed if System Mode) */}
            <div className={`min-w-[200px] transition-opacity ${isSystemMode ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase">Quality Score</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getQualityColor(qualityPercent)}`}>
                        {qualityPercent.toFixed(0)}% Opt.
                    </span>
                </div>
                <div className="flex gap-1 h-3">
                    {/* Simple discretized bars for aesthetic style */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-sm ${i < (qualityPercent / 20) ? (qualityPercent > 80 ? 'bg-emerald-400' : qualityPercent > 50 ? 'bg-amber-400' : 'bg-red-400') : 'bg-slate-100'}`}
                        />
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 text-right">
                    {qualityScore.toFixed(1)} penalty points
                </p>
            </div>
        </div>
    );
};
