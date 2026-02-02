import React, { useState } from 'react';

export const UserOptions = () => {
    const [optimizationLevel, setOptimizationLevel] = useState("balanced");
    const [deptAffinity, setDeptAffinity] = useState(50);
    const [compactness, setCompactness] = useState(70);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-4xl mx-auto my-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-3xl">🎛️</span> Panel de Control (Jefe de Estudios)
            </h2>
            <p className="text-slate-500 mb-6">Ajuste los pesos del algoritmo genético para priorizar ciertos aspectos sobre otros.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Optimization Strategy */}
                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🚀</span>
                        <h3 className="font-bold text-slate-700">Estrategia</h3>
                    </div>
                    <select
                        value={optimizationLevel}
                        onChange={(e) => setOptimizationLevel(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-slate-900 bg-white"
                    >
                        <option value="speed">Rápida (Heurística)</option>
                        <option value="balanced">Equilibrada (Estándar)</option>
                        <option value="deep">Profunda (OR-Tools / 1h+)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                        "Profunda" explorará millones de permutaciones para encontrar el óptimo global matemático.
                    </p>
                </div>

                {/* Card 2: Department Affinity */}
                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🤝</span>
                        <h3 className="font-bold text-slate-700">Afinidad Dpto.</h3>
                    </div>
                    <input
                        type="range" min="0" max="100"
                        value={deptAffinity} onChange={(e) => setDeptAffinity(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-right mt-1">
                        <span className="font-mono font-bold text-indigo-900 text-xl bg-indigo-100 p-1 px-2 rounded border border-indigo-200 inline-block">
                            {deptAffinity}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Importancia de agrupar horas libres de profesores del mismo departamento (Reuniones).
                    </p>
                </div>

                {/* Card 3: Compactness */}
                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🧱</span>
                        <h3 className="font-bold text-slate-700">Compacidad</h3>
                    </div>
                    <input
                        type="range" min="0" max="100"
                        value={compactness} onChange={(e) => setCompactness(parseInt(e.target.value))}
                        className="w-full accent-pink-500 cursor-pointer"
                    />
                    <div className="text-right mt-1">
                        <span className="font-mono font-bold text-pink-900 text-xl bg-pink-100 p-1 px-2 rounded border border-pink-200 inline-block">
                            {compactness}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Penalización por "huecos" (horas libres aisladas) en el horario personal.
                    </p>
                </div>
            </div>
        </div>
    );
};
