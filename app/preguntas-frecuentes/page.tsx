'use client';
import React from 'react';
import { ArrowLeft, Rocket, Brain, Accessibility, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>HIPAT<span className="text-indigo-600">IA</span></span> <span className="text-slate-400 font-medium">| Preguntas Frecuentes</span>
                </h1>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-12 pb-24">
                {/* Hero */}
                <section className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-2">
                        <CheckCircle size={12} /> Actualizado 2026
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Todo lo que necesitas saber <br className="hidden md:block" /> sobre la <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">nueva generación.</span>
                    </h2>
                </section>

                {/* Module 1: Antigravity */}
                <section className="bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shadow-sm"><Rocket size={28} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Potencia y Capacidad</h3>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Motor Antigravity</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <FAQItem
                            question="¿Quanto texto puede leer Hipatia? ¿Puedo subir un libro entero?"
                            answer="SÍ. Gracias al nuevo motor Antigravity, hemos eliminado el límite de lectura tradicional. Ahora puedes subir libros completos, temarios de oposiciones o novelas de más de 300 páginas (hasta 500.000 caracteres) de una sola vez. Hipatia no 'resume' ni recorta; lee y analiza la totalidad del documento para crear exámenes globales que cubren inicio, nudo y desenlace."
                        />
                        <FAQItem
                            question="¿Puedo generar un examen mezclando varios temas a la vez?"
                            answer="Por supuesto. Al subir un archivo masivo (ej: 'Tema 1, 2 y 3'), Hipatia detecta la extensión y aplica automáticamente una Distribución Inteligente: generará preguntas equilibradas del principio, la parte central y el final del temario, asegurando una evaluación completa."
                        />
                    </div>
                </section>

                {/* Module 2: Profile */}
                <section className="bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                        <div className="bg-fuchsia-50 p-3 rounded-2xl text-fuchsia-600 shadow-sm"><Brain size={28} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personalización y Memoria</h3>
                            <p className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest">Perfil Docente</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <FAQItem
                            question="¿Tengo que repetirle mis instrucciones (ej: 'trátame de tú') cada vez?"
                            answer={
                                <span>
                                    YA NO. Hipatia ha dejado de ser "amnésica". Ahora dispones del botón <strong>"Mi Perfil Docente"</strong>. Configúralo una sola vez con tus preferencias:
                                    <br /><br />
                                    <strong>• Tono de voz:</strong> (Ej: Cercano, Estricto, Académico).<br />
                                    <strong>• Líneas Rojas:</strong> Cosas que prohíbes (Ej: "No uses preguntas de Verdadero/Falso").<br />
                                    <strong>• Sello Personal:</strong> Tus manías didácticas. Hipatia consultará tu perfil antes de escribir una sola palabra. Si le dijiste que no queréis fechas, nunca más te pondrá fechas.
                                </span>
                            }
                        />
                    </div>
                </section>

                {/* Module 3: Inclusion */}
                <section className="bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                        <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 shadow-sm"><Accessibility size={28} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inclusión y DUA</h3>
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Diseño Universal de Aprendizaje</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <FAQItem
                            question="¿Cómo ayuda Hipatia con los alumnos NEAE / ACNEE?"
                            answer={
                                <span>
                                    Con nuestra tecnología de <strong>Inclusión Radical</strong>. No tienes que trabajar el triple. Con un solo clic, Hipatia genera 3 versiones simultáneas de tu examen o material:
                                    <br /><br />
                                    <strong>1. Versión Estándar:</strong> Para el grupo general.<br />
                                    <strong>2. Versión No Significativa (Focus):</strong> Formato Lectura Fácil, enunciados cortos y apoyo visual.<br />
                                    <strong>3. Versión Significativa (ACS):</strong> Adaptación curricular con reducción de contenidos y ejercicios de unir/relacionar.<br />
                                    <br />
                                    Además, generamos el Informe de Justificación Pedagógica para que lo adjuntes a la programación ante inspección.
                                </span>
                            }
                        />
                    </div>
                </section>

                {/* Module 4: Security */}
                <section className="bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 shadow-sm"><Shield size={28} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Corrección y Seguridad</h3>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Triple Consenso</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <FAQItem
                            question="¿Es fiable la nota que pone la IA? ¿Alucina?"
                            answer={
                                <span>
                                    Hipatia no corrige sola. Utilizamos un sistema de <strong>Triple Consenso</strong> para blindar la objetividad:
                                    <br /><br />
                                    ⚖️ <strong>El Juez:</strong> Analiza la respuesta del alumno contra la rúbrica.<br />
                                    🧐 <strong>El Auditor:</strong> Revisa si el Juez ha sido demasiado severo o laxo.<br />
                                    👨‍⚖️ <strong>El Tribunal Supremo:</strong> Emite la nota final consensuada. Esto garantiza una precisión técnica superior a la corrección humana fatigada.
                                </span>
                            }
                        />
                        <FAQItem
                            question="¿Qué pasa con la privacidad de mis alumnos?"
                            answer="Aplicamos el principio 'Zero-Bias' (Cero Sesgo). Hipatia anonimiza los datos antes de procesarlos. No sabe si el alumno se llama Juan o María, ni conoce su historial de comportamiento. Solo evalúa la evidencia de aprendizaje presente en el papel. Tus alumnos están protegidos."
                        />
                        <FAQItem
                            question="¿Sirve para corregir exámenes hechos a mano?"
                            answer="Sí. Nuestro OCR Académico lee caligrafía manuscrita (incluso 'letra de médico') a partir de una simple foto hecha con el móvil. No obligamos a los alumnos a usar pantallas; ellos usan papel y boli, tú usas Hipatia."
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}

const FAQItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => (
    <div className="group">
        <h4 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{question}</h4>
        <div className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
            {typeof answer === 'string' ? <p>{answer}</p> : answer}
        </div>
    </div>
);
