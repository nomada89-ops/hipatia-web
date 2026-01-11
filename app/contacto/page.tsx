'use client';

import React, { useState } from 'react';
import { Mail, User, School, MessageSquare, Send, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        centro: '',
        motivo: '',
        mensaje: ''
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_CONTACTO || 'https://n8n-n8n.ehqtcd.easypanel.host/webhook/contacto-hipatia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    centro_educativo: formData.centro,
                    motivo_consulta: formData.motivo,
                    mensaje: formData.mensaje,
                    fecha: new Date().toISOString(),
                    origen: 'Formulario de Contacto Web'
                })
            });

            if (response.ok) {
                setStatus('success');
            } else {
                throw new Error('Error en el envío');
            }
        } catch (error) {
            console.error('Contact error:', error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-inter">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">¡Mensaje Recibido!</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                    Gracias por contactar con HIPATIA. Nuestro equipo revisará tu solicitud y te responderemos en el email institucional proporcionado en breve.
                </p>
                <Link
                    href="/exam-correction"
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02]"
                >
                    <ChevronLeft size={18} />
                    VOLVER AL INICIO
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-inter selection:bg-indigo-100">
            {/* Header / Logo */}
            <header className="p-6 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/exam-correction" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-indigo-600 text-white p-1 rounded font-bold text-xs">H</div>
                        <span className="font-bold text-slate-900 tracking-tight">HIPATIA</span>
                    </Link>
                    <Link href="/exam-correction" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1">
                        <ChevronLeft size={14} /> Volver a la plataforma
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-16 md:py-24 px-6">
                {/* Background Decor */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-50/50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]"></div>
                </div>

                <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-2">
                        <Mail size={14} className="text-indigo-600" />
                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest">Atención al Docente</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                        Contacto y <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Soporte técnico</span>.
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                        ¿Tienes dudas sobre la implementación de la IA en tu aula o necesitas una demo personalizada para tu centro educativo?
                    </p>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-indigo-900/10 p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700 delay-100">
                    {/* Decorative accent */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Nombre */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <User size={12} className="text-indigo-500" />
                                    Nombre Completo
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Prof. Arturo Pérez"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Mail size={12} className="text-indigo-500" />
                                    Email Institucional (preferible)
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="nombre@uclm.es"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Centro Educativo */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <School size={12} className="text-indigo-500" />
                                    Centro Educativo
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal"
                                    value={formData.centro}
                                    onChange={(e) => setFormData({ ...formData, centro: e.target.value })}
                                    placeholder="Nombre del IES, Facultad o Colegio"
                                />
                            </div>

                            {/* Motivo */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <MessageSquare size={12} className="text-indigo-500" />
                                    Motivo de consulta
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                                        value={formData.motivo}
                                        onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                    >
                                        <option value="" disabled>Selecciona una opción</option>
                                        <option value="Solicitar Demo para mi Centro.">Solicitar Demo para mi Centro.</option>
                                        <option value="Problemas con mi Token.">Problemas con mi Token.</option>
                                        <option value="Propuesta comercial personalizada.">Propuesta comercial personalizada.</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <MessageSquare size={12} className="text-indigo-500" />
                                Mensaje
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.mensaje}
                                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/5 outline-none transition-all font-bold text-slate-800 resize-none placeholder:text-slate-300 placeholder:font-normal leading-relaxed"
                                placeholder="Cuéntanos más sobre cómo podemos ayudarte..."
                            />
                        </div>

                        {status === 'error' && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-4 rounded-xl text-center animate-in shake">
                                Hubo un problema al enviar el mensaje. Por favor, inténtelo de nuevo o contacte directamente por email.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className={`w-full h-16 rounded-2xl font-black text-white shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group
                                ${status === 'submitting' ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-600/30 active:scale-[0.98]'}`}
                        >
                            {status === 'submitting' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>ENVIANDO...</span>
                                </>
                            ) : (
                                <>
                                    <span>ENVIAR SOLICITUD</span>
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-16 text-center">
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <h4 className="text-slate-900 font-black text-lg">99.9%</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Uptime Garantizado</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100"></div>
                        <div className="text-center">
                            <h4 className="text-slate-900 font-black text-lg">24h</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Respuesta Media</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                        HIPAT<span className="text-indigo-400">IA</span> • Ecosistema v4.0 • UCLM
                    </div>
                </div>
            </main>
        </div>
    );
}
