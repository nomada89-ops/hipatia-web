import React, { useState, useMemo } from 'react';
import { ParsedTeacher } from '../../../utils/delphosParser';
import { User, Clock, Briefcase, Calendar, Lock } from 'lucide-react';

interface ItinerancyManagerProps {
    teachers: ParsedTeacher[];
    externalBlocks: Map<string, string[]>; // TeacherID -> Blocked Slot IDs (e.g., "L-1", "M-3")
    onToggleBlock: (teacherId: string, slotId: string) => void;
}

// const HOURS_PER_DAY = 6;
const DAYS = ['L', 'M', 'X', 'J', 'V'];
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const ItinerancyManager: React.FC<ItinerancyManagerProps> = ({
    teachers,
    externalBlocks,
    onToggleBlock
}) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTeachers = useMemo(() => {
        return teachers.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [teachers, searchTerm]);

    const activeTeacher = useMemo(() =>
        teachers.find(t => t.id === selectedTeacherId),
        [teachers, selectedTeacherId]);

    const getTeacherHours = (_teacherId: string) => {
        // Mock calculation for now, or use real if available
        return { assigned: 0, capacity: 18 };
    };

    const isItinerant = (teacherId: string) => {
        const blocks = externalBlocks.get(teacherId);
        return blocks && blocks.length > 0;
    };

    return (
        <div className="flex h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Sidebar: Teacher List */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <User size={18} className="text-indigo-600" />
                        Claustro ({teachers.length})
                    </h3>
                    <input
                        type="text"
                        placeholder="Buscar docente..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredTeachers.map(t => {
                        const hasBlocks = isItinerant(t.id);
                        const hours = getTeacherHours(t.id);

                        return (
                            <div
                                key={t.id}
                                onClick={() => setSelectedTeacherId(t.id)}
                                className={`p-3 border-b border-slate-100 cursor-pointer transition-colors hover:bg-white
                                    ${selectedTeacherId === t.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-medium text-slate-800 text-sm truncate pr-2">
                                        {t.name}
                                    </div>
                                    {hasBlocks && (
                                        <div className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 gap-1 shrink-0" title="Tiene restricciones externas">
                                            <Briefcase size={10} />
                                            <span>Ext.</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {hours.assigned}/{hours.capacity}h
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="truncate max-w-[120px]" title={t.department}>
                                        {t.department}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Area: Availability Grid */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                {activeTeacher ? (
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{activeTeacher.name}</h2>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                    <Briefcase size={14} />
                                    {activeTeacher.department || "Departamento General"}
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs font-mono bg-slate-100 px-1 rounded text-slate-400">ID: {activeTeacher.id}</span>
                                </p>
                            </div>
                            <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Disponibilidad Externa</div>
                                    <div className="text-[10px] text-indigo-700">Marque las casillas para bloquear tramos.</div>
                                </div>
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                            {/* Header Row */}
                            <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
                                <div className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Hora</div>
                                {DAY_NAMES.map((d, i) => (
                                    <div key={i} className="p-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider border-l border-slate-100">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Body Rows */}
                            <div className="divide-y divide-slate-100 flex-1 overflow-auto">
                                {[1, 2, 3, 4, 5, 6].map(hour => (
                                    <div key={hour} className="grid grid-cols-6 h-[70px]"> {/* Fixed height rows */}
                                        <div className="p-2 flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-50/50">
                                            {hour}º
                                        </div>
                                        {DAYS.map((day, _dayIndex) => {
                                            const slotId = `${day}-${hour}`; // e.g. L-1, M-3
                                            const teacherBlocks = externalBlocks.get(activeTeacher.id) || [];
                                            const isBlocked = teacherBlocks.includes(slotId);

                                            return (
                                                <div
                                                    key={slotId}
                                                    onClick={() => onToggleBlock(activeTeacher.id, slotId)}
                                                    className={`
                                                        border-l border-slate-100 relative cursor-pointer transition-all group
                                                        ${isBlocked
                                                            ? 'bg-red-50 hover:bg-red-100'
                                                            : 'hover:bg-indigo-50/30'
                                                        }
                                                    `}
                                                >
                                                    {isBlocked && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 animate-in zoom-in-50 duration-200">
                                                            <Lock size={20} />
                                                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Bloqueado</span>
                                                        </div>
                                                    )}

                                                    {/* Hover hint */}
                                                    {!isBlocked && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-300 pointer-events-none">
                                                            <Lock size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <User size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600">Seleccione un Docente</h3>
                        <p className="text-sm mt-2 max-w-md">
                            Seleccione un profesor del listado de la izquierda para gestionar su disponibilidad horaria y definir itinerancias.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
