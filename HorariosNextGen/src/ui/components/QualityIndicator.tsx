import React from 'react';

interface QualityIndicatorProps {
    score: number; // Objective Value (Penalties). Lower is better.
    loading?: boolean;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({ score, loading }) => {
    // Map score to a visual percentage for the bar (Inverse: 0 penalty = 100% quality)
    // Heuristic: Assume 100 penalties is "Very Bad" (0% quality) for visualization scaling.
    const maxPenalty = 500;
    const qualityPercent = Math.max(0, 100 - (score / maxPenalty) * 100);

    // Color interpolation
    const getColor = (p: number) => {
        if (p > 80) return 'bg-emerald-500'; // Excellent
        if (p > 50) return 'bg-yellow-500';  // Modular
        return 'bg-red-500';                 // Poor
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Schedule Quality
                </h3>
                {loading && <span className="text-xs text-blue-500 animate-pulse">Calculating...</span>}
            </div>

            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-100 ${getColor(qualityPercent)}`}>
                            {score.toFixed(1)} Penalties
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-slate-600">
                            {qualityPercent.toFixed(0)}% Opt.
                        </span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                    <div
                        style={{ width: `${qualityPercent}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getColor(qualityPercent)}`}
                    ></div>
                </div>

                <p className="text-xs text-slate-500">
                    Lower penalty score indicates fewer gaps and better teacher satisfaction.
                </p>
            </div>
        </div>
    );
};
