import React, { useState, useEffect } from 'react';
import { X, Save, UserCog, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface TeacherProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToken: string;
    initialData?: {
        tono?: string;
        prohibido?: string;
        fetiches?: string;
        estructura?: string;
    };
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ isOpen, onClose, userToken, initialData }) => {
    const [formData, setFormData] = useState({
        tono: '',
        prohibido: '',
        fetiches: '',
        estructura: ''
    });
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                tono: initialData.tono || '',
                prohibido: initialData.prohibido || '',
                fetiches: initialData.fetiches || '',
                estructura: initialData.estructura || ''
            });
        }
    }, [isOpen, initialData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        setMessage('');

        try {
            const payload = {
                token: userToken,
                preferencia_tono: formData.tono,
                preferencia_prohibido: formData.prohibido,
                preferencia_fetiches: formData.fetiches,
                preferencia_estructura: formData.estructura
            };

            const response = await fetch('https://n8n.protocolohipatia.com/webhook/actualizar-perfil', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStatus('success');
                    setMessage('Perfil actualizado correctamente');
                    setTimeout(() => {
                        onClose();
                        setStatus('idle');
                    }, 1500);
                } else {
                    throw new Error('La respuesta indica error');
                }
            } else {
                throw new Error('Error en la conexión');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setStatus('error');
            setMessage('No se pudieron guardar los cambios. Inténtalo de nuevo.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <UserCog size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Perfil Docente</h2>
                            <p className="text-xs text-slate-500 font-medium">Personaliza cómo Hipatia trabaja para ti</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                    {/* Tono */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tono de Voz</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                            placeholder="Ej: Cercano, motivador, formal, académico..."
                            value={formData.tono}
                            onChange={(e) => setFormData({ ...formData, tono: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 pl-1">Define la personalidad de la IA en sus respuestas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Estructura */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Estructura Favorita</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                                placeholder="Ej: 5 preguntas test + 2 desarrollo"
                                value={formData.estructura}
                                onChange={(e) => setFormData({ ...formData, estructura: e.target.value })}
                            />
                        </div>
                        {/* Sello Personal */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Sello Personal (Fetiches)</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                                placeholder="Ej: Siempre preguntar actualidad..."
                                value={formData.fetiches}
                                onChange={(e) => setFormData({ ...formData, fetiches: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Líneas Rojas */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            Líneas Rojas <span className="text-rose-500 text-[9px] bg-rose-50 px-1.5 py-0.5 rounded font-bold border border-rose-100">PROHIBIDO</span>
                        </label>
                        <textarea
                            rows={3}
                            className="w-full p-3 bg-rose-50/30 border-2 border-transparent rounded-xl focus:border-rose-400 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-rose-200/70 resize-none"
                            placeholder="Ej: No usar preguntas de verdadero/falso. No preguntar fechas exactas..."
                            value={formData.prohibido}
                            onChange={(e) => setFormData({ ...formData, prohibido: e.target.value })}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    {/* Status Message */}
                    <div className="flex-1 mr-4">
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold animate-in fade-in">
                                <AlertCircle size={16} /> <span>{message}</span>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold animate-in fade-in">
                                <CheckCircle size={16} /> <span>{message}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={status === 'saving'}
                            className={`px-6 py-2 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2
                                ${status === 'saving'
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'}`}
                        >
                            {status === 'saving' ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Guardar Perfil
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
