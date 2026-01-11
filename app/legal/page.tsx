'use client';
import React, { Suspense } from 'react';
import { ArrowLeft, Shield, Eye, FileText, Lock, Scale, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LegalContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'aviso-legal';

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>HIPAT<span className="text-violet-600">IA</span></span> <span className="text-slate-400 font-medium">| Centro Legal y Transparencia</span>
                </h1>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">

                {/* Navigation Tabs (Pseudo) */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-4 border-b border-slate-200">
                    <Link href="?tab=aviso-legal" className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${tab === 'aviso-legal' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>Aviso Legal</Link>
                    <Link href="?tab=privacidad" className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${tab === 'privacidad' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>Política de Privacidad</Link>
                    <Link href="?tab=transparencia" className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${tab === 'transparencia' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>Transparencia Algorítmica</Link>
                </div>

                {tab === 'aviso-legal' && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Scale size={24} /></div>
                            <h2 className="text-2xl font-bold text-slate-900">Aviso Legal y Condiciones de Uso</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 leading-relaxed">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">1. Identidad del Servicio</h3>
                                <p>HIPATIA es un ecosistema de software educativo v4.0 desarrollado para la automatización de la evaluación y la creación de contenidos pedagógicos. Su objetivo es asistir a los docentes mediante herramientas avanzadas de Inteligencia Artificial.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">2. Propiedad Intelectual de la IA</h3>
                                <p>Los informes y análisis generados por nuestra metodología de <strong>Consenso (Gemini)</strong> se licencian como herramientas de apoyo docente. La propiedad intelectual de los materiales subidos por el profesor (PDFs de temario propio, apuntes, rúbricas) permanece exclusivamente bajo la titularidad del usuario o del centro educativo correspondiente. HIPATIA no reclama derechos sobre el contenido educativo aportado.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">3. Responsabilidad Docente</h3>
                                <p>El sistema ofrece una <strong>propuesta de calificación</strong> basada en análisis técnico y niveles de exigencia configurables (Estricto, Estándar, ACNEE). Sin embargo, se establece expresamente que la validación final, la interpretación pedagógica y la firma del acta de notas corresponden <strong>siempre y exclusivamente al profesor humano</strong>, prevaleciendo su criterio profesional sobre la sugerencia algorítmica.</p>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'privacidad' && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Lock size={24} /></div>
                            <h2 className="text-2xl font-bold text-slate-900">Política de Privacidad y Protección de Menores</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 leading-relaxed">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">1. Finalidad del Tratamiento</h3>
                                <p>Los datos procesados (imágenes de exámenes manuscritos, identificadores de alumnos y calificaciones) se utilizan con el único fin de realizar la corrección técnica, el análisis de competencias y la generación de informes de retroalimentación educativa.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">2. Protección de Datos de Menores (Anonimización Proactiva)</h3>
                                <p>HIPATIA aplica un protocolo estricto de seguridad. Cualquier nombre propio detectado por el sistema OCR en las cabeceras de los exámenes es sustituido automáticamente por un identificador genérico (tokenización) antes de ser procesado por los modelos de lenguaje, garantizando que la IA no almacene ni procese identidades reales de menores.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">3. Tratamiento de Datos Biométricos (Grafología)</h3>
                                <p>Se informa que el sistema utiliza visión artificial (OCR) únicamente para transcribir la caligrafía manuscrita a texto digital procesable. HIPATIA <strong>no realiza análisis biométricos</strong> de personalidad, estado emocional ni identificación forense basada en rasgos físicos de la escritura.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">4. Derechos del Interesado y Retención</h3>
                                <p>Garantizamos los derechos de acceso, rectificación y supresión de los datos. Los registros de exámenes, ya sean del módulo de Historia de España o genéricos, se eliminan de nuestros servidores activos tras finalizar el periodo de reclamación escolar establecido por la normativa vigente.</p>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'transparencia' && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Eye size={24} /></div>
                            <h2 className="text-2xl font-bold text-slate-900">FAQ: Transparencia Algorítmica</h2>
                        </div>

                        <div className="space-y-6 divide-y divide-slate-100">
                            <div className="pt-4 first:pt-0">
                                <h4 className="text-base font-bold text-slate-900 mb-2">¿Es legal que una IA califique a mis alumnos?</h4>
                                <p className="text-slate-600">HIPATIA no sustituye al profesor; actúa como un asistente técnico de alta precisión. La calificación proporcionada es una propuesta motivada basada en la rúbrica oficial, que el docente debe supervisar y ratificar. El sistema garantiza la transparencia detallando ("explicabilidad") cómo se computa cada décima de la nota.</p>
                            </div>

                            <div className="pt-4">
                                <h4 className="text-base font-bold text-slate-900 mb-2">¿Dónde se almacenan los PDFs que subo para generar exámenes?</h4>
                                <p className="text-slate-600">Los materiales están cifrados y se utilizan exclusivamente en tiempo de ejecución para alimentar el contexto ("context window") de tu propia sesión. No se comparten con otros usuarios ni se utilizan para el entrenamiento de modelos públicos externos.</p>
                            </div>

                            <div className="pt-4">
                                <h4 className="text-base font-bold text-slate-900 mb-2">¿Cómo se garantiza la equidad en el modo ACNEE?</h4>
                                <p className="text-slate-600">El modo <strong>ACNEE</strong> (Alumnos con Necesidades Específicas de Apoyo Educativo) ajusta dinámicamente los umbrales de penalización formal (como la ortografía estricta o la precisión terminológica), priorizando la evaluación semántica y la comprensión de conceptos clave sobre el rigor formal, asegurando una evaluación adaptada y justa.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function LegalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Cargando...</div>}>
            <LegalContent />
        </Suspense>
    );
}
