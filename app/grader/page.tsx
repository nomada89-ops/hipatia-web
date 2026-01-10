'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function GraderPage() {
    const [file, setFile] = useState<File | null>(null);
    const [studentId, setStudentId] = useState('');
    const [rubric, setRubric] = useState('');
    const [criteria, setCriteria] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        if (!file || !studentId) {
            setError("Por favor, sube un examen e introduce el ID del alumno.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('studentId', studentId);
            formData.append('rubric', rubric);
            formData.append('criteria', criteria);

            const res = await fetch('/api/grader', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error procesando el examen');
            }

            setResult(data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <header className="max-w-4xl mx-auto mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    Sistema de Calificación IA
                </h1>
                <p className="text-gray-500 text-lg">
                    Sube el examen, añade criterios y obtén una corrección auditada al instante.
                </p>
            </header>

            <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Sección 1: Datos del Alumno */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ID Anónimo del Alumno <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: ALU-2024-001"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Este ID se usará para nombrar la carpeta en Drive.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Instrucciones Adicionales (Opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Sé estricto con las tildes..."
                                value={criteria}
                                onChange={(e) => setCriteria(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Sección 2: Subida de Archivo */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-blue-50/50 transition-colors text-center cursor-pointer relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center pointer-events-none">
                            <div className="bg-blue-100 p-4 rounded-full mb-4">
                                <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800">
                                {file ? file.name : "Arrastra tu examen o haz clic aquí"}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Soporta JPG, PNG, PDF</p>
                        </div>
                    </div>

                    {/* Sección 3: Rúbrica */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rúbrica o Modelo de Corrección
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Pega aquí las preguntas y respuestas correctas, o los criterios de evaluación..."
                            value={rubric}
                            onChange={(e) => setRubric(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 resize-y"
                        />
                    </div>

                    {/* Botón de Acción */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-6 h-6" /> Procesando con IA...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-6 h-6" /> Evaluar Examen
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </form>

                {/* Resultados */}
                {result && (
                    <div className="mt-10 p-8 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <h2 className="text-2xl font-bold text-green-800">Evaluación Completada</h2>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                <span className="text-gray-500 uppercase text-xs tracking-wider font-semibold">Nota Final</span>
                                <span className="text-4xl font-extrabold text-blue-600">{result.grade}/10</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.feedback}</p>
                        </div>

                        {result.driveLink && (
                            <a
                                href={result.driveLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                            >
                                <FileText className="w-4 h-4" />
                                Ver Informe PDF en Google Drive
                            </a>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
