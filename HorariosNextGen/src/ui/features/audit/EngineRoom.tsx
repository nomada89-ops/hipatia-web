import React, { useMemo } from 'react';
import { CheckCircle, PlusCircle, Users } from 'lucide-react';
import { EngineReport, ParsedTeacher } from '../../../utils/delphosParser';

interface EngineRoomProps {
    report: EngineReport;
    onVacanciesGenerated: (newTeachers: ParsedTeacher[], newReport: EngineReport) => void;
}

export const EngineRoom: React.FC<EngineRoomProps> = ({ report, onVacanciesGenerated }) => {

    // Sort logic
    const sortedDepts = useMemo(() => {
        return [...report.departments].sort((a, b) => a.balance - b.balance);
    }, [report]);

    const hasDeficit = report.globalBalance < 0 || sortedDepts.some(d => d.balance < 0);

    const handleGenerateVacancies = () => {
        const newTeachers: ParsedTeacher[] = [];
        const newDepartments = report.departments.map(dept => {
            if (dept.balance < 0) {
                const deficit = Math.abs(dept.balance);
                // Simple heuristic: 18h per teacher
                const needed = Math.ceil(deficit / 18);
                const assignedAddition = needed * 18;

                // Generate Teachers
                for (let i = 1; i <= needed; i++) {
                    newTeachers.push({
                        id: `VAC_${dept.name.substring(0, 3).toUpperCase()}_${i}-${Date.now()}`,
                        name: `VACANTE ${dept.name.toUpperCase()} ${i}`,
                        department: dept.name
                    });
                }

                // Return updated Stat
                return {
                    ...dept,
                    assignedHours: dept.assignedHours + assignedAddition,
                    balance: dept.balance + assignedAddition
                };
            }
            return dept;
        });

        // Calculate Global
        const newTotalCapacity = newDepartments.reduce((acc, d) => acc + d.assignedHours, 0);

        const newReport: EngineReport = {
            ...report,
            departments: newDepartments,
            totalCapacity: newTotalCapacity,
            globalBalance: newTotalCapacity - report.totalSessions
        };

        onVacanciesGenerated(newTeachers, newReport);
    };

    return (
        <div className="bg-white text-slate-800 rounded-xl shadow-sm border border-slate-200 w-full overflow-hidden font-mono mt-4">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-wide">AUDITORÍA DE PLANTILLA</h2>
                        <div className="text-xs text-slate-500">Análisis de Cobertura Horaria</div>
                    </div>
                </div>

                {hasDeficit && (
                    <button
                        onClick={handleGenerateVacancies}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4" />
                        GENERAR PROFESORES POR CUBRIR
                    </button>
                )}
                {!hasDeficit && (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        PLANTILLA OPTIMIZADA
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Departamento</th>
                            <th className="px-6 py-3 text-right font-semibold">Horas Totales (XML)</th>
                            <th className="px-6 py-3 text-right font-semibold">Horas Cubiertas</th>
                            <th className="px-6 py-3 text-right font-semibold">Balance</th>
                            <th className="px-6 py-3 text-center font-semibold">Vacantes Propuestas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedDepts.map((dept) => {
                            const isDeficit = dept.balance < 0;
                            const neededVacancies = isDeficit ? Math.ceil(Math.abs(dept.balance) / 18) : 0;

                            return (
                                <tr key={dept.name} className={`hover:bg-slate-50 transition-colors ${isDeficit ? 'bg-red-50/50' : ''}`}>
                                    <td className="px-6 py-3 font-medium text-slate-700">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-3 text-right text-slate-500">
                                        {dept.requiredHours}h
                                    </td>
                                    <td className="px-6 py-3 text-right text-slate-500">
                                        {dept.assignedHours}h
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold">
                                        <span className={`px-2 py-1 rounded border ${isDeficit ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {dept.balance > 0 ? '+' : ''}{dept.balance}h
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {neededVacancies > 0 ? (
                                            <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                                <Users className="w-3 h-3" />
                                                +{neededVacancies}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer Status */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                <div>
                    TOTAL: {report.totalSessions} SESIONES
                </div>
                <div>
                    BALANCE GLOBAL: {report.globalBalance}H
                </div>
            </div>
        </div>
    );
};
