import React, { useState, useEffect } from 'react';
import { ParsedTeacher } from '../../../utils/delphosParser';
import { ArrowRight, Clock } from 'lucide-react';

interface AvailabilityManagerProps {
    teachers: ParsedTeacher[];
    onBack: () => void;
    onNext: () => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ teachers, onBack, onNext }) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

    useEffect(() => {
        if (teachers.length > 0 && !selectedTeacherId) {
            setSelectedTeacherId(teachers[0].id);
        }
    }, [teachers]);

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const slots = [1, 2, 3, 4, 5, 6];

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="text-indigo-600" /> Gestión de Disponibilidad
                    </h2>
                    <p className="text-slate-500">Define huecos libres y preferencias para los profesores ya asignados.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onBack} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">
                        Atrás
                    </button>
                    <button onClick={onNext} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2">
                        Siguiente Etapa <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400">
                <p>Aquí irá el componente rediseñado de TeacherPreferences.tsx</p>
                <p>Mostrando carga para: {teachers.find(t => t.id === selectedTeacherId)?.name || "Seleccionar..."}</p>
            </div>
        </div>
    );
};
