/**
 * DICCIONARIO DE NORMATIVA LEGAL - CASTILLA LA MANCHA (CLM)
 * 
 * Este archivo centraliza todas las constantes legislativas que rigen el motor
 * de HorariosNextGen. Cuando se publique una nueva Orden de Inicio de Curso
 * (ej. curso 2026-2027), solo será necesario actualizar estos valores.
 */

export const CLM_LEGAL_RULES = {
    /**
     * Límite máximo de horas lectivas semanales para el profesorado de Secundaria.
     * Según Orden 108/2025 de 24 de julio.
     */
    MAX_LECTIVAS: 19,

    /**
     * Ratio de compensación por exceso de horas lectivas.
     * Por cada hora que exceda las 19 lectivas, se deben generar 2 horas complementarias.
     * Ejemplo: Un profesor con 20h lectivas (+1h exceso) recibirá +2h complementarias de compensación.
     */
    COMPENSATORIA_RATIO: 2,

    /**
     * Desglose quirúrgico de la Tutoría de ESO.
     * CLM establece que la tutoría de ESO consta de 2 periodos.
     * TUTORIA_ESO_LECTIVA: 1h presencial con el grupo (Suma para las 19h).
     * TUTORIA_ESO_ADMIN: 1h de gestión administrativa (Complementaria, NO suma para las 19h).
     */
    TUTORIA_ESO_LECTIVA: 1,
    TUTORIA_ESO_ADMIN: 1,

    /**
     * Tutoría de Bachillerato.
     * Generalmente es 1 hora lectiva (Suma para las 19h).
     */
    TUTORIA_BACH_LECTIVA: 1,

    /**
     * Palabras clave para la detección automática de Bolsas de Coordinación.
     * Estas horas no computan como 'Lectiva Pura' pero restan disponibilidad.
     */
    COORDINATION_KEYWORDS: [
        'COORDINACIÓN',
        'ERASMUS',
        'ETWINNING',
        'LECTURA',
        'BIENESTAR',
        'DIGITALIZACIÓN',
        'BIBLIOTECA',
        'RESPONSABLE'
    ]
};
