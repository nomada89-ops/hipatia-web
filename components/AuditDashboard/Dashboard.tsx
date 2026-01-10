import React, { useState, useEffect } from 'react';
import { Bold, Italic, List, CheckCircle, FileDown, Loader2, ArrowLeft, MoreHorizontal, Maximize2 } from 'lucide-react';

interface DashboardProps {
    alumnoId: string;
    files: File[];
    initialReport: string;
    onReset: () => void;
    onDownload: () => void;
    onNewCorrection: () => void;
    onSaveEdit: (newContent: string) => void;
}

export default function Dashboard({
    alumnoId,
    files,
    initialReport,
    onReset,
    onDownload,
    onNewCorrection,
    onSaveEdit
}: DashboardProps) {
    const [finalGrade, setFinalGrade] = useState<string>('--');
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Extract grade from HTML if possible (assuming standard format like "Nota: X.XX")
    useEffect(() => {
        const match = initialReport.match(/Nota[:\s]*([\d\.]+)/i) || initialReport.match(/Calificación[:\s]*([\d\.]+)/i);
        if (match && match[1]) {
            setFinalGrade(match[1]);
        }
    }, [initialReport]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.innerHTML = initialReport;
        }
    }, [initialReport]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onSaveEdit(e.currentTarget.innerHTML);
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (contentRef.current) {
            onSaveEdit(contentRef.current.innerHTML);
            contentRef.current.focus();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
            {/* 1. Header Glassmorphism */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Auditor IA</h1>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-lg tracking-tight">{alumnoId || 'Sin Nombre'}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
                                    APROBADO
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs text-slate-500 font-medium">Nota Final</span>
                            <span className="text-2xl font-mono font-bold text-slate-900 leading-none">{finalGrade}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <button onClick={onReset} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Restablecer">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onDownload}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                            >
                                <FileDown className="h-4 w-4" />
                                <span>Exportar .DOC</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Bento Grid Layout */}
            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Column 1: File Viewer & Quick Stats (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* File Gallery Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Evidencias ({files.length})
                            </h3>
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <Maximize2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                            {files.map((file, idx) => (
                                <div key={idx} className="relative aspect-square bg-slate-50 rounded-lg border border-slate-200 overflow-hidden group cursor-pointer hover:border-indigo-400 transition-all">
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono group-hover:text-indigo-600">
                                        hoja_{idx}
                                    </div>
                                    {/* Placeholder for real thumbnail if implemented */}
                                    <div className="absolute  bottom-1 right-1 px-1.5 py-0.5 bg-white/90 rounded text-[10px] text-slate-700 font-mono border border-slate-200 shadow-sm">
                                        OCR OK
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Summary Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <CheckCircle className="h-24 w-24 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Precisión IA</h3>
                        <div className="text-3xl font-mono font-bold text-slate-800 mb-2">98.5%</div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[98.5%] shadow-[0_0_10px_rgba(99,102,241,0.3)]"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">Basado en el análisis de {files.length} páginas.</p>
                    </div>
                </div>

                {/* Column 2: Main Editor Area (9 cols) */}
                <div className="lg:col-span-9 flex flex-col gap-6">

                    {/* Editor Toolbar (Floating Style) */}
                    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-2 flex items-center gap-1 w-fit shadow-md mx-auto lg:mx-0 sticky top-20 z-40">
                        <button onClick={() => execCmd('bold')} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Negrita">
                            <Bold className="h-4 w-4" />
                        </button>
                        <button onClick={() => execCmd('italic')} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Cursiva">
                            <Italic className="h-4 w-4" />
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-2"></div>
                        <button onClick={() => execCmd('insertUnorderedList')} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Lista">
                            <List className="h-4 w-4" />
                        </button>
                        <button onClick={() => execCmd('formatBlock', 'H3')} className="px-3 py-1 text-xs font-bold font-mono text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Subtítulo">
                            H3
                        </button>
                    </div>

                    {/* Editor Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-1 min-h-[600px] relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-60"></div>

                        <div className="p-8 md:p-10 h-full overflow-y-auto custom-scrollbar">
                            <div
                                ref={contentRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={handleInput}
                                className="prose prose-slate prose-lg max-w-none focus:outline-none"
                            // 'prose-slate' styles for light mode
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Action Button for New Correction (Mobile/Desktop) */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={onNewCorrection}
                    className="group flex items-center justify-center w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl shadow-indigo-500/30 transition-all hover:scale-110 active:scale-95"
                    title="Nueva Corrección"
                >
                    <Loader2 className="h-6 w-6 group-hover:animate-spin-once" />
                </button>
            </div>
        </div>
    );
}
