import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'HIPATIA | Ecosistema Educativo Integral con IA',
    description: 'HIPATIA es la plataforma definitiva de IA para docentes: corrección inteligente de exámenes manuscritos, generación de pruebas personalizadas y repositorio de Historia de España.',
};

export default function ExamCorrectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "HIPATIA",
        "applicationCategory": "EducationalSoftware",
        "description": "Herramienta universal de IA para profesores: corrección multimatataria, generación de exámenes y recursos especializados.",
        "featureList": [
            "Corrección universal de exámenes para cualquier asignatura y nivel educativo",
            "Digitalización OCR de caligrafía manuscrita en múltiples materias",
            "Generación de exámenes genéricos o basados en temarios específicos (PDF)",
            "Módulo especializado: Historia de España 2º Bachillerato (UCLM)",
            "Evaluación por consenso (Juez y Auditor) para máxima fiabilidad",
            "Modos de exigencia adaptables: ESTRICTO, ESTÁNDAR y ACNEE"
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
