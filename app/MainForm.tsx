'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useExamContext } from './ExamContext';
import { 
    Upload, Send, CheckCircle, AlertCircle, Loader2, FileDown, 
    Bold, Italic, List, ListOrdered, ArrowLeft, BookOpen, Book, AlertTriangle, FileText
} from 'lucide-react';

interface MainFormProps {
    onBack: () => void;
    userToken: string;
}

const MainForm: React.FC<MainFormProps> = ({ onBack, userToken }) => {
    const { 
        guiaCorreccion, setGuiaCorreccion, 
        materialReferenciaFiles, setMaterialReferenciaFiles, 
        setMaterialReferenciaTexto, materialReferenciaTexto 
    } = useExamContext();

    const [alumnoId, setAlumnoId] = useState('');
    const [idGrupo, setIdGrupo] = useState('');
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [examenArchivos, setExamenArchivos] = useState<File[]>([]);
    const [originalReport, setOriginalReport] = useState<string | null>(null);
    const [editedReport, setEditedReport] = useState<string>('');

    // Persistence
    useEffect(() => {
        const savedGroup = localStorage.getItem('hipatia_id_grupo');
        if (savedGroup) setIdGrupo(savedGroup);
        const savedMode = localStorage.getItem('hipatia_group_mode');
        if (savedMode === 'true') setIsGroupMode(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!guiaCorreccion && materialReferenciaFiles.length === 0) {
            setStatus('error');
            setMessage('Configura la rúbrica o referencia primero.');
            return;
        }
        if (examenArchivos.length === 0) {
            setStatus('error');
            setMessage('Adjunta al menos una hoja del examen.');
            return;
        }

        setStatus('sending');
        setMessage('Hipatia está corrigiendo el examen...');

        try {
            const formData = new FormData();
            formData.append('user_token', userToken);
            formData.append('id_grupo', isGroupMode && idGrupo ? idGrupo.trim() : "SIN_GRUPO");
            formData.append('alumno_id', alumnoId);
            formData.append('guia_correccion', guiaCorreccion);
            if (materialReferenciaTexto) {
                formData.append('material_referencia', materialReferenciaTexto);
            }

            examenArchivos.forEach((file, index) => {
                formData.append(`hoja_${index}`, file);
            });

            const url = process.env.NEXT_PUBLIC_WEBHOOK_AUDITOR || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/evaluacion-examen';
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const html = data.html_report || data.output || '<p>Informe generado.</p>';
                
                setOriginalReport(html);
                setEditedReport(html);

                const win = window.open('', 'InformeIndividual');
                if (win) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                }
                setStatus('success');
                setMessage('Examen corregido correctamente.');
            } else {
                throw new Error(`Error en corrección: ${response.status}`);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Error al subir el examen.');
        }
    };

    const handleGenerateGroupReport = async () => {
        if (!isGroupMode || !idGrupo) return;

        setStatus('sending');
        setMessage('Hipatia está analizando el grupo...');
        
        try {
            const response = await fetch('https://n8n.protocolohipatia.com/webhook/generar-informe-grupal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_token: userToken,
                    id_grupo: idGrupo.trim()
                }),
            });

            if (response.ok) {
                const html = await response.text();
                const win = window.open('', 'InformeGrupal');
                if (win) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                }
                setStatus('success');
                setMessage('Informe grupal generado correctamente.');
            } else {
                throw new Error(`Error en informe grupal: ${response.status}`);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Error al generar informe grupal.');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft size={20} /> Volver al Ecosistema
            </button>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    HIPATIA Auditor
                </h1>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                    v4.0 Enterprise
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificador del Alumno</label>
                        <input 
                            type="text" 
                            required
                            value={alumnoId} 
                            onChange={(e) => setAlumnoId(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                            placeholder="Nombre o ID Anónimo"
                        />
                        <p className="text-[10px] text-slate-400">Cumple con la normativa LOPD/RGPD al no almacenar datos sensibles.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificador de Grupo</label>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="group-mode-check"
                                    checked={isGroupMode}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setIsGroupMode(checked);
                                        localStorage.setItem('hipatia_group_mode', String(checked));
                                    }}
                                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="group-mode-check" className="text-sm font-medium text-slate-600 cursor-pointer">
                                    Habilitar modo grupal
                                </label>
                            </div>
                            {isGroupMode && (
                                <input 
                                    type="text" 
                                    required={isGroupMode}
                                    value={idGrupo} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setIdGrupo(val);
                                        localStorage.setItem('hipatia_id_grupo', val);
                                    }}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all animate-in zoom-in-95"
                                    placeholder="Ej: MAT-2024"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Archivos del Examen (Fotos/PDF)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 group">
                        <Upload className="mx-auto text-slate-300 group-hover:text-indigo-500 transition-colors mb-4" size={40} />
                        <p className="text-slate-500 font-medium mb-4">Arrastra las evidencias o haz clic para seleccionar</p>
                        <input 
                            type="file" 
                            multiple 
                            onChange={(e) => setExamenArchivos(prev => [...prev, ...Array.from(e.target.files || [])])}
                            className="hidden"
                            id="examFiles"
                        />
                        <label htmlFor="examFiles" className="bg-white border-2 border-indigo-100 text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 cursor-pointer shadow-sm">
                            Seleccionar Archivos
                        </label>
                    </div>
                    {examenArchivos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {examenArchivos.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                    <FileText size={14} /> {file.name}
                                    <button type="button" onClick={() => setExamenArchivos(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500"></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        type="submit" 
                        disabled={status === 'sending'}
                        className="bg-indigo-600 text-white p-5 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        {status === 'sending' && !message.includes('grupal') ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Corrigiendo...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={24} fill="currentColor" />
                                <span>Iniciar Auditoría</span>
                            </>
                        )}
                    </button>

                    {isGroupMode && (
                        <button 
                            type="button" 
                            onClick={handleGenerateGroupReport}
                            disabled={status === 'sending' || !idGrupo}
                            className="bg-white border-2 border-indigo-600 text-indigo-600 p-5 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            {status === 'sending' && message.includes('grupal') ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Generando...</span>
                                </>
                            ) : (
                                <>
                                    <BookOpen size={24} />
                                    <span>Informe Grupal</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {status === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertTriangle size={20} />
                        <span className="font-bold">{message}</span>
                    </div>
                )}
            </form>

            {originalReport && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                <CheckCircle size={30} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Resultado Generado</h3>
                                <p className="text-xs text-slate-500">Puedes editar el informe antes de guardarlo</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setOriginalReport(null)} className="p-3 text-slate-400 hover:text-slate-600">
                                Cerrar
                             </button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100">
                        <div 
                            className="prose max-w-none min-h-[400px] outline-none"
                            contentEditable
                            dangerouslySetInnerHTML={{ __html: editedReport }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainForm;