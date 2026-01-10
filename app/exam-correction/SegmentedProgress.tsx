'use client';
import React from 'react';

interface SegmentedProgressProps {
    value: number;
    max: number;
    segments?: number;
    colorClass?: string;
}

export const SegmentedProgress = ({ value, max, segments = 10, colorClass = 'bg-auditor-primary' }: SegmentedProgressProps) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const filledSegments = Math.round((percentage / 100) * segments);

    // Determine color based on percentage if not provided
    let resolvedColor = colorClass;
    if (colorClass === 'bg-auditor-primary') {
        if (percentage >= 80) resolvedColor = 'bg-auditor-success';
        else if (percentage < 50) resolvedColor = 'bg-auditor-error';
    }

    return (
        <div className="flex gap-1">
            {Array.from({ length: segments }).map((_, idx) => (
                <div
                    key={idx}
                    className={`h-2 flex-1 rounded-sm transition-all duration-300 ${idx < filledSegments
                            ? resolvedColor
                            : 'bg-auditor-muted/30'
                        }`}
                />
            ))}
        </div>
    );
};
