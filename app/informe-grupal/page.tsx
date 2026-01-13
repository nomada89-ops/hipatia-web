"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Zap, ArrowLeft, Loader2, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GroupReportPage() {
    const router = useRouter();
    const [idGrupo, setIdGrupo] = useState('');
    const [status, setStatus] = useState < 'idle' | 'sending' | 'success' | 'error' > ('idle');
    const [htmlReport, setHtmlReport] = useState < string | null > (null);
    const [loadingMsg, setLoadingMsg] = useState('Procesando datos grupales...');
    const [errorMsg, setErrorMsg] = useState('');

    // --- SEGURIDAD: CHECK TOKEN ---
    useEffect(() => {
        const token = localStorage.getItem('user_token') || localStorage.getItem('token');
        if (!token) {
            router.push('/');
        }
    }, [router]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('user_token') || localStorage.getItem('token');

        if (!token) {
            alert('Sesión expirada. Por favor, reinicia sesión.');
            router.push('/');
            return;
        }

        if (!idGrupo.trim()) {
            alert('Por favor, introduce un ID de Grupo válido.');
            return;
        }

        setStatus('sending');
        setHtmlReport(null);
        setErrorMsg('');

        try {
            const response = await fetch('https://n8n.protocolohipatia.com/webhook/generar-informe-grupal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_grupo: idGrupo,
                    user_token: token
                })
            });

            if (response.ok) {
                const text = await response.text();
                // A veces n8n devuelve JSON con { "html": "..." } o directo HTML
                // Intentamos parsear JSON por si acaso
                try {
                    const json = JSON.parse(text);
                    setHtmlReport(json.html || json.output || text);
                } catch {
                    setHtmlReport(text);
                }
                setStatus('success');
            } else {
                throw new Error(`Error ${response.status}: Servidor no respondió correctamente.`);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMsg('No se pudo generar el informe. Verifica el ID del grupo e inténtalo de nuevo.');
        }
    };

    // --- VISTA HTML DEL REPORTE ---
    if (htmlReport) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                {/* Header Resultado */}
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setHtmlReport(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Informe Grupal</span>
                            <h2 className="text-lg font-bold text-slate-900">{idGrupo}</h2>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                            IMPRIMIR PDF
                        </button>
                    </div>
                </div>

                {/* Contenido HTML Seguro */}
                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto bg-white p-10 rounded-xl shadow-sm border border-slate-100 min-h-[500px]">
                        <div
                            className="prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: htmlReport }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA FORMULARIO ---
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
            {/* Sidebar Visual */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8 text-indigo-400">
                        <Users size={24} />
                        <span className="font-bold tracking-widest text-xs uppercase">Módulo Grupal</span>
                    </div>
                    <h1 className="text-3xl font-black leading-tight mb-4">
                        Visión Global de tu Clase
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Genera informes agregados para detectar patrones, dificultades comunes y estadísticas de rendimiento por grupo.
                    </p>
                </div>

                <div className="relative z-10 mt-12 md:mt-0">
                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-emerald-400" size={16} />
                            <span className="text-xs font-bold text-slate-300">Zona Segura</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Solo se procesan datos de exámenes previamente corregidos y etiquetados con el ID de grupo correspondiente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-6 md:p-12 items-center justify-center relative">
                <button
                    onClick={() => router.push('/')}
                    className="absolute top-6 right-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold"
                >
                    <ArrowLeft size={16} /> Volver al Corrector Individual
                </button>

                <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4 shadow-sm">
                            <FileText size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Generar Informe</h2>
                        <p className="text-slate-500 mt-2">Introduce el identificador único del grupo</p>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">ID del Grupo</label>
                            <input
                                type="text"
                                value={idGrupo}
                                onChange={(e) => setIdGrupo(e.target.value)}
                                placeholder="Ej: 2BACH-A"
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:shadow-lg outline-none transition-all font-bold text-lg text-center tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-normal"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending' || !idGrupo.trim()}
                            className={`w-full py-4 text-lg font-black text-white rounded-xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2
                                ${status === 'sending' || !idGrupo.trim()
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200'}`}
                        >
                            {status === 'sending' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="text-sm font-bold animate-pulse">GENERANDO...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={20} className="fill-white/20" />
                                    <span>GENERAR ANÁLISIS</span>
                                </>
                            )}
                        </button>

                        {status === 'error' && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-center">
                                <p className="text-xs font-bold text-rose-600">{errorMsg}</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
