import React, { useState } from 'react';
import { Clock, Coffee, Save } from 'lucide-react';

interface TimeframeConfigProps {
    onSave: (config: any) => void;
}

export const TimeframeConfig: React.FC<TimeframeConfigProps> = ({ onSave }) => {
    const [startTime, setStartTime] = useState("08:30");
    const [endTime, setEndTime] = useState("14:30");
    const [interval, setInterval] = useState(55);
    const [breakDuration, setBreakDuration] = useState(30);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Definir Marco Horario</h2>
                        <p className="text-xs text-slate-500">Configure la estructura de la jornada lectiva</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora Inicio</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 font-mono text-2xl font-bold text-slate-900 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora Fin</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 font-mono text-2xl font-bold text-slate-900 bg-slate-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración Sesión (min)</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <input
                                type="range" min="45" max="60" step="5"
                                value={interval}
                                onChange={(e) => setInterval(parseInt(e.target.value))}
                                className="flex-1 accent-indigo-600 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-indigo-900 text-xl w-14 text-right bg-indigo-50 p-1 rounded border border-indigo-100">{interval}'</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración Recreo (min)</label>
                        <div className="flex items-center gap-4 bg-amber-50 p-3 rounded border border-amber-200">
                            <Coffee className="w-4 h-4 text-amber-500" />
                            <input
                                type="range" min="15" max="45" step="5"
                                value={breakDuration}
                                onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                                className="flex-1 accent-amber-500 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-amber-900 text-xl w-14 text-right bg-amber-100 p-1 rounded border border-amber-200">{breakDuration}'</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={() => onSave({ startTime, endTime, interval, breakDuration })}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Confirmar y Generar Cuadrante
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        Esta configuración se aplicará al Solver de OR-Tools
                    </p>
                </div>
            </div>
        </div>
    );
};
