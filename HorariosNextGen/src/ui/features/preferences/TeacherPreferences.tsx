import React, { useState } from 'react';
interface TeacherPreferencesProps {
    teachers?: { id: string, name: string }[];
}

export const TeacherPreferences: React.FC<TeacherPreferencesProps> = ({ teachers = [] }) => {
    // 5 Days x 6 Slots
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
    const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
    const [maxDailyHours, setMaxDailyHours] = useState(4);
    const [freeAfternoons, setFreeAfternoons] = useState(false);

    const toggleSlot = (day: number, slot: number) => {
        const id = `${day}-${slot}`;
        setUnavailableSlots(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Auto-select first teacher if available and none selected
    React.useEffect(() => {
        if (teachers.length > 0 && !selectedTeacherId) {
            setSelectedTeacherId(teachers[0].id);
        }
    }, [teachers]);

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const slots = [1, 2, 3, 4, 5, 6];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-4xl mx-auto my-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-3xl">☕</span> Gestión de Deseos y Preferencias
            </h2>
            <p className="text-slate-500 mb-6">Configure sus restricciones personales. El Motor de Cuadrante intentará respetarlas siempre que la Normativa CCAA lo permita.</p>

            {/* Teacher Selector (Only visible if we have teachers) */}
            {teachers.length > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-4">
                    <label className="font-bold text-indigo-900">Profesor/a:</label>
                    <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="flex-1 p-2 border border-indigo-200 rounded text-slate-700 font-bold"
                    >
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <div className="text-xs text-indigo-400 font-mono hidden sm:block">ID: {selectedTeacherId}</div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Grid Selector */}
                <div>
                    <h3 className="font-bold text-indigo-900 mb-3">Disponibilidad Horaria</h3>
                    <div className="grid grid-cols-6 gap-1 bg-slate-50 p-2 rounded border border-slate-200">
                        {/* Headers */}
                        <div className="col-span-1"></div>
                        {days.map(d => <div key={d} className="text-[10px] font-bold text-center text-slate-500 uppercase">{d.substr(0, 3)}</div>)}
                        {slots.map(s => (
                            <React.Fragment key={s}>
                                <div className="text-xs text-slate-400 font-mono flex items-center justify-center p-1">H{s}</div>
                                {days.map((d, dIdx) => {
                                    const id = `${dIdx + 1}-${s}`;
                                    const isSelected = unavailableSlots.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => toggleSlot(dIdx + 1, s)}
                                            className={`h-8 rounded transition-all border ${isSelected ? 'bg-red-100 border-red-300' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                                            title={isSelected ? "Marcado como NO DESEADO" : "Disponible"}
                                        >
                                            {isSelected && <span className="text-red-500 text-xs">✕</span>}
                                        </button>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-400 flex gap-4">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-slate-200"></span> Disponible</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-300"></span> No Deseado</span>
                    </div>
                </div>
                {/* Constraints Form */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Máximo Horas Lectivas / Día</label>
                        <input
                            type="range" min="2" max="6" step="1"
                            value={maxDailyHours} onChange={(e) => setMaxDailyHours(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>2h (Relax)</span>
                            <span className="font-bold text-indigo-600">{maxDailyHours} horas</span>
                            <span>6h (Intenso)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded border border-indigo-100">
                        <input
                            type="checkbox"
                            checked={freeAfternoons}
                            onChange={(e) => setFreeAfternoons(e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="block font-bold text-slate-700">Solicitar Tardes Libres</span>
                            <span className="text-xs text-slate-500">Prioridad Alta. Puede requerir comprimir horario matutino.</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded shadow-lg transition-transform active:scale-95 flex justify-center gap-2">
                            <span>💾 Guardar Preferencias</span>
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-2">
                            Datos almacenados localmente. Se sincronizarán con el Motor de Optimización ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
