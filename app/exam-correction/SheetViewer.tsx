'use client';
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, FileText, CheckCircle, ZoomIn } from 'lucide-react';

interface SheetViewerProps {
    files: File[];
    isOpen: boolean;
    onClose: () => void;
}

export const SheetViewer = ({ files, isOpen, onClose }: SheetViewerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setCurrentIndex(0);
            return;
        }
    }, [isOpen]);

    useEffect(() => {
        if (files[currentIndex]) {
            const url = URL.createObjectURL(files[currentIndex]);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [currentIndex, files, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    const showPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
    const showNext = () => setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="absolute top-8 right-8 flex items-center gap-4">
                <span className="text-[11px] font-bold text-slate-900 bg-white px-3 py-1.5 rounded-full shadow-soft font-mono">
                    HOJA {currentIndex + 1} / {files.length}
                </span>
                <button onClick={onClose} className="p-3 bg-white text-slate-900 rounded-full shadow-soft hover:bg-slate-50 transition-all border border-slate-100">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative w-full max-w-5xl h-[90vh] flex flex-col items-center justify-center p-6">
                {/* Main Image View */}
                <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-elevate flex items-center justify-center group border border-slate-200">
                    {previewUrl ? (
                        files[currentIndex].type === 'application/pdf' ? (
                            <div className="text-slate-400 text-center">
                                <FileText className="h-20 w-20 mx-auto mb-6 opacity-20" />
                                <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">Vista previa no disponible</p>
                                <p className="text-xs mt-2 text-slate-500 font-mono tracking-widest">{files[currentIndex].name}</p>
                            </div>
                        ) : (
                            <img
                                src={previewUrl}
                                alt={`Hoja de examen ${currentIndex + 1}`}
                                className="max-w-full max-h-full object-contain p-4"
                            />
                        )
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <span className="text-xs font-bold uppercase tracking-widest">Renderizando Evidencia...</span>
                        </div>
                    )}

                    {/* Navigation Overlays */}
                    <button
                        onClick={(e) => { e.stopPropagation(); showPrev(); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 shadow-soft rounded-full text-slate-900 hover:bg-white transition-all border border-slate-100 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); showNext(); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 shadow-soft rounded-full text-slate-900 hover:bg-white transition-all border border-slate-100 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                {/* Interactive Filmstrip inside modal */}
                <div className="mt-8 flex gap-3 p-3 bg-white/50 backdrop-blur rounded-2xl border border-white/50 shadow-soft">
                    {files.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-12 h-16 rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden
                                ${idx === currentIndex
                                    ? 'border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                                    : 'border-white bg-white hover:border-slate-200'}`}
                        >
                            <span className={`text-[10px] font-mono font-bold ${idx === currentIndex ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {idx + 1}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
