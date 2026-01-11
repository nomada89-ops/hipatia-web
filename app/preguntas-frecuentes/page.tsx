'use client';
import React from 'react';
import { ArrowLeft, BookOpen, Layers, Zap } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
                <Link href="/exam-correction" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>HIPAT<span className="text-violet-600">IA</span></span> <span className="text-slate-400 font-medium">| Preguntas Frecuentes</span>
                </h1>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
                {/* Hero */}
                <section className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Resolviendo dudas sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Educación e IA</span></h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">Todo lo que necesitas saber sobre la corrección universal, la generación de exámenes y el rigor académico de HIPATIA.</p>
                </section>

                {/* Module 1 */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Layers size={24} /></div>
                        <h3 className="text-xl font-bold text-slate-800">Versatilidad y Materias</h3>
                    </div>
                    <div className="space-y-6 divide-y divide-slate-100">
                        <FAQItem question="¿Puedo usar HIPATIA para materias de ciencias o idiomas?" answer="Absolutamente. HIPATIA es una herramienta universal diseñada para adaptarse a cualquier asignatura. Su IA identifica el contexto de la materia para aplicar el rigor adecuado, ya sea en una redacción de Lengua, un examen de Biología o problemas de Química." />
                        <FAQItem question="¿Cómo se adapta el sistema a diferentes niveles educativos?" answer="El profesor define el nivel de exigencia (Estricto, Estándar o ACNEE) y la rúbrica. Esto permite que el sistema corrija con la misma eficacia desde Educación Primaria hasta niveles universitarios." />
                    </div>
                </section>

                {/* Module 2 */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-fuchsia-100 p-2 rounded-lg text-fuchsia-600"><Zap size={24} /></div>
                        <h3 className="text-xl font-bold text-slate-800">Creación de Contenidos</h3>
                    </div>
                    <div className="space-y-6 divide-y divide-slate-100">
                        <FAQItem question="¿Cómo genera el sistema nuevos exámenes?" answer="Puedes elegir entre dos modos: Generación Genérica (la IA propone preguntas basadas en el currículo general) o Generación Basada en Materiales, donde el examen se construye exclusivamente a partir de los apuntes o PDFs que tú subas." />
                    </div>
                </section>

                {/* Module 3 */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><BookOpen size={24} /></div>
                        <h3 className="text-xl font-bold text-slate-800">Especialización en Historia (UCLM)</h3>
                    </div>
                    <div className="space-y-6 divide-y divide-slate-100">
                        <FAQItem question="¿Qué ofrece el rincón de Historia de España?" answer="Es una sección premium con recursos específicos para 2º de Bachillerato bajo el currículo de la UCLM. Incluye rúbricas oficiales, modelos de examen sobre el siglo XIX y materiales enfocados a preparar con éxito la EBAU." />
                    </div>
                </section>
            </main>
        </div>
    );
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <div className="pt-4 first:pt-0">
        <h4 className="text-base font-bold text-slate-900 mb-2">{question}</h4>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">{answer}</p>
    </div>
);
