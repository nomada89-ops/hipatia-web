import { ParsedGroup, ParsedData, ParsedStudent } from './delphosParser';

/**
 * ENROLLMENT MAPPER (Nodo de Enriquecimiento)
 * 
 * LOPD Compliance: Este módulo procesa datos de matrícula de formaefímera 
 * para enriquecer los grupos de Delphos. No almacena nombres de alumnos.
 */

export interface EnrollmentCSVRow {
    groupName: string;
    studentId?: string; // Optional: Unique ID per student
    totalStudents?: number; // Aggregate mode
    male?: number;
    female?: number;
    needs?: number; // ACNEAE/ACS
    pendingSubjects?: string[]; // "La mochila"
}

export interface MatchingProposal {
    csvGroup: string;
    delphosGroupId: string;
    delphosGroupName: string;
    confidence: number; // 0 to 1
}

/**
 * Normaliza nombres de grupos para mejorar el matching.
 * Ejemplo: "1º ESO A" -> "1esoa"
 */
const normalizeGroupName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/º|ª/g, '')
        .replace(/\s+/g, '')
        .replace(/[-_]/g, '')
        .replace(/educaciónsecundariaobligatoria/g, 'eso');
};

/**
 * Propone emparejamientos entre el CSV y los grupos de Delphos.
 */
export const proposeEnrollmentMatches = (
    csvRows: EnrollmentCSVRow[],
    delphosGroups: ParsedGroup[]
): MatchingProposal[] => {
    // Collect unique group names from CSV
    const uniqueCSVGroups = Array.from(new Set(csvRows.map(r => r.groupName)));

    return uniqueCSVGroups.map(csvGroup => {
        const normCSV = normalizeGroupName(csvGroup);

        let bestMatch: ParsedGroup | null = null;
        let maxScore = 0;

        for (const dg of delphosGroups) {
            const normDG = normalizeGroupName(dg.name);

            let score = 0;
            if (normCSV === normDG) score = 1.0;
            else if (normCSV.includes(normDG) || normDG.includes(normCSV)) score = 0.8;

            if (dg.name.length > 0 && dg.name === csvGroup) score = 1.0;

            if (score > maxScore) {
                maxScore = score;
                bestMatch = dg;
            }
        }

        return {
            csvGroup: csvGroup,
            delphosGroupId: bestMatch?.id || '',
            delphosGroupName: bestMatch ? bestMatch.name : 'SIN COINCIDENCIA',
            confidence: maxScore
        };
    });
};

/**
 * Calcula el Índice de Complejidad Curricular (ICC).
 * Ponderación: Alumnos(1) + NEAE(3) + Pendientes(0.5)
 */
export const calculateICC = (
    students: number,
    needs: number = 0,
    pendings: number = 0
): number => {
    return (students * 1) + (needs * 3) + (pendings * 0.5);
};

/**
 * Determina el índice visual basado en el ICC.
 */
export const getLoadIndexFromICC = (icc: number, studentCount: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (studentCount === 0) return 'LOW';
    const relativeICC = icc / studentCount;

    if (relativeICC > 2.0 || icc > 45) return 'HIGH'; // Critical
    if (relativeICC > 1.5 || icc > 35) return 'MEDIUM';
    return 'LOW';
};

/**
 * Fusiona los datos confirmados en la estructura de Delphos.
 * Ahora maneja tanto agregados como filas individuales de alumnos con UPSERT.
 */
export const enrichDataWithEnrollment = (
    data: ParsedData,
    confirmedMatches: Map<string, string>, // csvGroupName -> delphosGroupId
    csvRows: EnrollmentCSVRow[]
): ParsedData => {
    const studentsByGroup = new Map<string, EnrollmentCSVRow[]>();

    csvRows.forEach(row => {
        const delphosId = confirmedMatches.get(row.groupName);
        if (delphosId) {
            const list = studentsByGroup.get(delphosId) || [];
            list.push(row);
            studentsByGroup.set(delphosId, list);
        }
    });

    // 1. First Pass: Aggregate ICC per level to compute ICCr (Relative)
    const levelICCStats = new Map<string, { totalICC: number, groupCount: number }>();

    data.groups.forEach(group => {
        const rows = studentsByGroup.get(group.id) || [];
        if (rows.length === 0) return;

        const studentCount = rows.reduce((acc, r) => acc + (r.totalStudents || 1), 0);
        const needsCount = rows.reduce((acc, r) => acc + (r.needs || 0), 0);
        const pendingCount = rows.reduce((acc, r) => acc + (r.pendingSubjects?.length || 0), 0);
        const icc = calculateICC(studentCount, needsCount, pendingCount);

        const stats = levelICCStats.get(group.courseId) || { totalICC: 0, groupCount: 0 };
        stats.totalICC += icc;
        stats.groupCount += 1;
        levelICCStats.set(group.courseId, stats);
    });

    // 2. Second Pass: Enrich Groups with ICC and ICCr
    const enrichedGroups = data.groups.map(group => {
        const rows = studentsByGroup.get(group.id) || [];
        if (rows.length === 0) return group;

        const studentCount = rows.reduce((acc, r) => acc + (r.totalStudents || 1), 0);
        const needsCount = rows.reduce((acc, r) => acc + (r.needs || 0), 0);
        const pendingCount = rows.reduce((acc, r) => acc + (r.pendingSubjects?.length || 0), 0);
        const icc = calculateICC(studentCount, needsCount, pendingCount);

        // ICCr (Relative): ICC / Average ICC of the Level
        const levelStats = levelICCStats.get(group.courseId);
        const avgLevelICC = levelStats ? levelStats.totalICC / levelStats.groupCount : icc;
        const iccr = avgLevelICC > 0 ? icc / avgLevelICC : 1;

        return {
            ...group,
            studentCount,
            needsCount,
            pendingSubjectsCount: pendingCount,
            iccScore: icc,
            iccr: parseFloat(iccr.toFixed(2)),
            groupLoadIndex: getLoadIndexFromICC(icc, studentCount)
        };
    });

    // 3. UPSERT Logic for Students: Association with profiles
    const existingStudents = data.students || [];
    const newStudents: ParsedStudent[] = [];

    studentsByGroup.forEach((rows, groupId) => {
        rows.forEach((row, idx) => {
            const studentId = row.studentId || `std-${groupId}-${idx}`;

            // Check if student exists (UPSERT)
            const existingIdx = existingStudents.findIndex(s => s.id === studentId);

            const studentData: ParsedStudent = {
                id: studentId,
                groupId,
                isNeae: (row.needs || 0) > 0,
                pendingSubjects: row.pendingSubjects || [],
                name: row.studentId ? undefined : `Alumno ${idx + 1}`
            };

            if (existingIdx >= 0) {
                existingStudents[existingIdx] = studentData; // Update
            } else {
                newStudents.push(studentData); // Create
            }
        });
    });

    return {
        ...data,
        groups: enrichedGroups,
        students: [...existingStudents, ...newStudents]
    };
};
