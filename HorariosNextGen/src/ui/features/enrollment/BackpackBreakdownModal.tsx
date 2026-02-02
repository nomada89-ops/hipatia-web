import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BackpackBreakdownModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [groupData, setGroupData] = useState<{ groupId: string, groupName: string } | null>(null);
    const [breakdown, setBreakdown] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleShow = (e: any) => {
            setGroupData(e.detail);
            setIsOpen(true);
            fetchBreakdown(e.detail.groupId);
        };

        window.addEventListener('show-backpack-breakdown', handleShow);
        return () => window.removeEventListener('show-backpack-breakdown', handleShow);
    }, []);

    const fetchBreakdown = async (groupId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/enrollment/group/${groupId}/backpack`);
            const data = await res.json();
            setBreakdown(data);
        } catch (e) {
            console.error("Failed to fetch backpack breakdown:", e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !groupData) return null;

    const totalPendings = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
                >
                    {/* Header */}
                    <div className="bg-indigo-900 px-6 py-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-800 rounded-lg">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">Mochila de Pendientes</h2>
                                <p className="text-indigo-300 text-xs">Desglose Curricular: {groupData.groupName}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-indigo-800 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-medium">Consultando base de datos local...</p>
                            </div>
                        ) : totalPendings === 0 ? (
                            <div className="py-10 text-center text-slate-500">
                                <p>No se encontraron temas pendientes para este grupo.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-indigo-900">Total "Mochila"</span>
                                    </div>
                                    <span className="text-lg font-bold text-indigo-600 font-mono">{totalPendings}</span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Materias Pendientes</h3>
                                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                        {Object.entries(breakdown).sort(([, a], [, b]) => b - a).map(([subject, count]) => (
                                            <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors group">
                                                <span className="text-sm text-slate-700 font-medium truncate mr-4" title={subject}>{subject}</span>
                                                <span className={`
                                                    px-2 py-1 rounded text-xs font-bold font-mono
                                                    ${count > 10 ? 'bg-rose-100 text-rose-700' : count > 5 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}
                                                `}>
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {totalPendings > 20 && (
                                    <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded flex gap-3 text-rose-800 text-xs">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <p><strong>Alerta:</strong> Este grupo presenta una saturación crítica de pendientes. Considere refuerzo ordinario.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-6 bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
