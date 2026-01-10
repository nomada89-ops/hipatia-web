'use client';
import React from 'react';

interface CompetencyChipProps {
    label: string;
    status: 'pass' | 'fail' | 'partial';
    feedback?: string;
}

export const CompetencyChip = ({ label, status, feedback }: CompetencyChipProps) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    const statusColors = {
        pass: { bg: 'bg-zen-success/10', text: 'text-zen-success', border: 'border-zen-success/30' },
        fail: { bg: 'bg-zen-error/10', text: 'text-zen-error', border: 'border-zen-error/30' },
        partial: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30' },
    };

    const colors = statusColors[status];

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border} cursor-default transition-all hover:scale-105`}>
                {label}
            </div>

            {showTooltip && feedback && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-surface border border-zen-muted/50 rounded-lg shadow-glass text-xs text-gray-300 whitespace-nowrap z-50 animate-fade-in">
                    {feedback}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zen-surface"></div>
                </div>
            )}
        </div>
    );
};
