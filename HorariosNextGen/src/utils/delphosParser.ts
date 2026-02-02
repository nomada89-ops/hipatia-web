import { CLM_LEGAL_RULES } from '../config/clmLegalRules';

export interface ParsedTeacher {
    id: string;
    name: string;
    department?: string;
    specialty?: string;
}

export type CLMCategory = 'LECTIVA_PURA' | 'TUTORIA_ESO' | 'BOLSA_COORDINACION' | 'COMPENSATORIA' | 'OTRA';

export interface ParsedStudent {
    id: string; // Internal UUID
    groupId: string; // Link to Delphos Group
    pendingSubjects: string[]; // "La mochila de pendientes"
    isNeae: boolean;
    name?: string; // Optional for local reference
}

export interface ParsedSubject {
    id: string;
    name: string;
    abbreviation: string;
    department: string;
    courseId: string; // CODIGO_CURSO -> Link to Group
    codDelphos?: string; // For Export guard (1984)
    isTask?: boolean; // Flag for Tasks promoted to Subjects
    teacherId?: string; // App-level state for assignment
    hours?: number; // App-level state for hours
    group?: string; // Helper for display
    clmCategory?: CLMCategory; // CLM Legal Audit
    clmLectiveHours?: number; // Surgical split for 19h computation
    clmComplementaryHours?: number; // Administrative hours
}

export interface ParsedGroup {
    id: string;
    name: string;
    courseId: string;
    studentCount?: number;
    genderBalance?: { male: number; female: number; other?: number }; // For Enrichment Node
    needsCount?: number; // Students with special needs (ACNEAE/ACS)
    pendingSubjectsCount?: number; // Total "backpack" load
    groupLoadIndex?: 'LOW' | 'MEDIUM' | 'HIGH'; // Difficulty Index (Green/Amber/Red)
    iccScore?: number; // Índice de Complejidad Curricular (Ponderado)
    iccr?: number; // ICC Relativo (vs nivel)
}

export interface ParsedTask {
    id: string;
    name: string;
    shortName: string;
}

export interface ParsedClassroom {
    id: string;
    name: string;
}

export interface ParsedCourse {
    id: string;
    name: string; // DESCRIPCION
    abbreviation: string; // ABREVIATURA
}

export interface DepartmentStat {
    name: string;
    requiredHours: number;
    assignedHours: number;
    balance: number;
}

export interface EngineReport {
    departments: DepartmentStat[];
    totalSessions: number;
    totalCapacity: number;
    globalBalance: number;
}

export interface ParsedData {
    teachers: ParsedTeacher[];
    subjects: ParsedSubject[];
    groups: ParsedGroup[];
    tasks: ParsedTask[];
    classrooms: ParsedClassroom[];
    courses: ParsedCourse[];
    students?: ParsedStudent[]; // Local database sync
    engineReport: EngineReport;
}

export const parseDelphosXML = async (file: File): Promise<ParsedData> => {
    // FIX ENCODING: Delphos/Peñalara exports are often ISO-8859-1.
    const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'ISO-8859-1');
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const teachers: ParsedTeacher[] = [];
    const subjects: ParsedSubject[] = [];
    const groups: ParsedGroup[] = [];
    const tasks: ParsedTask[] = [];
    const classrooms: ParsedClassroom[] = [];

    const deptCapacity: Record<string, number> = {};
    const deptDemand: Record<string, number> = {};

    console.log("Delphos Parser: Initializing strict analysis of", file.name);

    // Helpers
    const getVal = (el: Element, key: string) => {
        const salidas = Array.from(el.children).filter(c => c.tagName.startsWith("salida") || c.tagName.startsWith("SALIDA"));
        const match = salidas.find(s => (s.getAttribute("dato") || "").toUpperCase() === key.toUpperCase());
        return match ? match.textContent?.trim() || "" : "";
    };

    const allListasal = Array.from(xmlDoc.getElementsByTagName("listasal"));

    // --- 1. RAW EXTRACTION PHASE ---

    // Teachers
    const potentialTeachers = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.startsWith("PROFESORES_");
    });

    // Subjects
    const potentialSubjects = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.startsWith("MATERIAS_");
    });

    // Groups
    const potentialGroups = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.startsWith("GRUPOS_");
    });

    // Activities (Bridge)
    const potentialActivities = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        // Avoid Confusion with ACTIVIDADES_GRUPO
        return seq.startsWith("ACTIVIDADES") && !seq.startsWith("ACTIVIDADES_GRUPO");
    });

    // Assignments
    const potentialAssignments = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.startsWith("GRUPOS_ACTIVIDAD") || seq.startsWith("ACTIVIDADES_GRUPO");
    });

    // Tasks
    const potentialTasks = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.startsWith("TAREAS_");
    });

    // --- 2. POPULATE DEFINITIONS ---

    console.log(`Delphos Parser: Found ${potentialSubjects.length} subjects, ${potentialGroups.length} groups, ${potentialActivities.length} activities, ${potentialAssignments.length} assignments.`);

    // Activity Map (Bridge: ActivityID -> SubjectID/TaskID)
    const activityMap = new Map<string, { type: 'SUBJECT' | 'TASK', refId: string }>();
    potentialActivities.forEach(item => {
        const id = getVal(item, "CLAVE");
        const materia = getVal(item, "MATERIA");
        const tarea = getVal(item, "TAREA");

        if (id) {
            if (materia) activityMap.set(id, { type: 'SUBJECT', refId: materia });
            else if (tarea) activityMap.set(id, { type: 'TASK', refId: tarea });
        }
    });

    // Teachers
    const parsedTeacherIds = new Set<string>();
    potentialTeachers.forEach(item => {
        const id = getVal(item, "CLAVE");
        const nombre = getVal(item, "NOMBRE");
        const dept = getVal(item, "DEPARTAMENTO") || "General";

        if (nombre && !parsedTeacherIds.has(id)) {
            teachers.push({ id, name: nombre, department: dept });
            parsedTeacherIds.add(id);
            if (!deptCapacity[dept]) deptCapacity[dept] = 0;
            deptCapacity[dept] += 18;
        }
    });

    // Groups & Course Dictionary
    const courseDictionary = new Map<string, string>();
    potentialGroups.forEach(item => {
        const id = getVal(item, "CLAVE");
        const nombre = getVal(item, "NOMBRE");
        const courseId = getVal(item, "CODIGO_CURSO");
        const courseDescr = getVal(item, "DESCRIPCION_CURSO");
        if (courseId && courseDescr) courseDictionary.set(courseId, courseDescr);
        if (nombre) groups.push({ id, name: nombre, courseId });
    });

    // Subject Definitions
    const subjectDefs = new Map<string, { name: string, abrev: string, dept: string, courseId: string }>();
    potentialSubjects.forEach(item => {
        const id = getVal(item, "CLAVE");
        const nombre = getVal(item, "NOMBRE");
        const abrev = getVal(item, "ABREVIATURA");
        const dept = getVal(item, "DEPARTAMENTO") || "General";
        const courseId = getVal(item, "CODIGO_CURSO");
        const courseDescr = getVal(item, "DESCRIPCION_CURSO");
        if (courseId && courseDescr) courseDictionary.set(courseId, courseDescr);
        if (id && nombre) subjectDefs.set(id, { name: nombre, abrev, dept, courseId });
    });

    // Task Definitions
    const taskDefs = new Map<string, { name: string, shortName: string }>();
    potentialTasks.forEach(item => {
        const id = getVal(item, "CLAVE");
        const nombre = getVal(item, "NOMBRE");
        const codDelphos = getVal(item, "CODIGO_DELPHOS");
        if (nombre) {
            taskDefs.set(id, { name: nombre, shortName: id });
            if (codDelphos) taskDefs.set(codDelphos, { name: nombre, shortName: id });
        }
    });

    // --- 3. LOGIC PHASE (Explosion) ---

    // Assignments
    const assignments: { activityId: string, groupId: string }[] = [];
    potentialAssignments.forEach(item => {
        const activityId = getVal(item, "ACTIVIDAD") || getVal(item, "MATERIA") || getVal(item, "TAREA");
        // HIERARCHY FIX: Check X_UNIDAD as primary or fallback for Group ID
        const groupId = getVal(item, "GRUPO") || getVal(item, "X_UNIDAD");
        if (activityId && groupId) assignments.push({ activityId, groupId });
    });

    // Create Subject Instances from Assignments
    // STRICT HIERARCHY: MATERIA -> GRUPO (X_UNIDAD)
    const assignedSubjectIds = new Set<string>();

    assignments.forEach(assign => {
        const { activityId: rawActId, groupId } = assign;
        const group = groups.find(g => g.id === groupId);

        if (!group) return;

        // Resolve Indirection
        let targetId = rawActId;
        let type: 'SUBJECT' | 'TASK' | 'UNKNOWN' = 'UNKNOWN';

        if (subjectDefs.has(rawActId)) type = 'SUBJECT';
        else if (taskDefs.has(rawActId)) type = 'TASK';
        else if (activityMap.has(rawActId)) {
            const resolved = activityMap.get(rawActId)!;
            targetId = resolved.refId;
            type = resolved.type;
        }

        // Processing
        if (type === 'SUBJECT' && subjectDefs.has(targetId)) {
            const def = subjectDefs.get(targetId)!;
            const uniqueId = `${targetId}-${groupId}`;

            // "Exploded" Subject Instance (e.g. Math-1A)
            if (!subjects.some(s => s.id === uniqueId)) {
                subjects.push({
                    id: uniqueId,
                    name: def.name,
                    abbreviation: def.abrev,
                    department: def.dept,
                    courseId: def.courseId || group.courseId,
                    group: group.name,
                    teacherId: undefined, // Will be filled by Sandbox
                    clmCategory: 'LECTIVA_PURA' // Real subjects are always Lectiva Pura
                });
                assignedSubjectIds.add(targetId);
            }
        }
        else if (type === 'TASK' && taskDefs.has(targetId)) {
            const def = taskDefs.get(targetId)!;
            // Broader LAASR Detection (kept for export compatibility)
            // const isLaasr = targetId === '1984' || def.name.match(/Atenci.n/i) || def.name.match(/Alternativa/i);

            // CLM Classification Logic
            let category: CLMCategory = 'OTRA';
            let lectiveSplit = 0;
            let compSplit = 0;
            const upperName = def.name.toUpperCase();

            if (upperName.includes('TUTORÍA DE ESO')) {
                category = 'TUTORIA_ESO';
                lectiveSplit = CLM_LEGAL_RULES.TUTORIA_ESO_LECTIVA;
                compSplit = CLM_LEGAL_RULES.TUTORIA_ESO_ADMIN;
            } else if (
                CLM_LEGAL_RULES.COORDINATION_KEYWORDS.some(key => upperName.includes(key))
            ) {
                category = 'BOLSA_COORDINACION';
            }

            const uniqueId = `TASK-${targetId}-${groupId}`;
            if (!subjects.some(s => s.id === uniqueId)) {
                subjects.push({
                    id: uniqueId,
                    name: def.name,
                    abbreviation: def.shortName,
                    department: "Tareas / Coordinación",
                    courseId: group.courseId,
                    group: group.name,
                    isTask: true,
                    codDelphos: targetId,
                    clmCategory: category,
                    clmLectiveHours: lectiveSplit || undefined,
                    clmComplementaryHours: compSplit || undefined
                });
            }
        }
    });

    // 3. FALLBACK: Catch Unassigned Subjects (Generic Mode)
    // If strict assignment logic missed subjects (or XML lacks explicit links),
    // we must restore them from definitions to ensure visibility.
    subjectDefs.forEach((def, id) => {
        if (!assignedSubjectIds.has(id)) {
            // Check if we should "Explode" against all groups of the course?
            // Risk: Showing "Latin" in "Science Group".
            // Safe Bet: Create a SINGLE Generic Instance. User deals with it (as before).

            subjects.push({
                id: id, // Original ID
                name: def.name,
                abbreviation: def.abrev,
                department: def.dept,
                courseId: def.courseId,
                group: "No Asignado", // Explicit indicator
                hours: 0
            });
        }
    });

    // 4. LOGIC ENRICHMENT: Forced LAASR (1984) Injection
    // If a group has "Religión", it MUST have "Atención Educativa" (Plan B).
    // This ensures that even if the XML omits the "Task", the scheduler knows it exists.
    const groupsWithReligion = new Set<string>();
    subjects.forEach(s => {
        if (s.name.toUpperCase().includes('RELIGI') && s.group && s.group !== 'No Asignado') {
            groupsWithReligion.add(s.group + '|' + s.courseId); // Composite Key to identify group uniquely
        }
    });

    let injectedLaasr = 0;
    groupsWithReligion.forEach(compositeKey => {
        const [groupName, courseId] = compositeKey.split('|');
        // Find actual group object to get ID
        const group = groups.find(g => g.name === groupName && g.courseId === courseId);
        if (!group) return;

        // Check if LAASR exists
        const hasLaasr = subjects.some(s =>
            s.courseId === courseId &&
            s.group === groupName &&
            (s.codDelphos === '1984' || s.name.toUpperCase().includes('ATENCI') || s.name.toUpperCase().includes('VALORES'))
        );

        if (!hasLaasr) {
            subjects.push({
                id: `AUTO-LAASR-${group.id}`,
                name: 'Atención Educativa (Auto)',
                abbreviation: 'LAASR',
                department: 'Atención Educativa',
                courseId: courseId,
                group: groupName,
                codDelphos: '1984',
                isTask: true,
                hours: 1 // Default to 1h if unknown? Or 0?
            });
            injectedLaasr++;
        }
    });

    console.log(`Delphos Parser: Final Subject Count: ${subjects.length} (Assignments: ${assignedSubjectIds.size}, Fallback: ${subjects.length - assignedSubjectIds.size - injectedLaasr}, Injected LAASR: ${injectedLaasr})`);

    // 4.5. MANDATORY INJECTION: "Asistencia al alumnado sin religión" (User Request)
    // The user explicitly requested this task. We inject it for EVERY group to ensure it's available.
    // We check if it already exists to avoid duplication.
    groups.forEach(group => {
        const hasRelAlt = subjects.some(s =>
            s.courseId === group.courseId &&
            s.group === group.name &&
            (s.name.includes('Asistencia al alumnado') || s.codDelphos === 'REL_ALT')
        );

        if (!hasRelAlt) {
            subjects.push({
                id: `AUTO-REL-ALT-${group.id}`,
                name: 'Asistencia al alumnado sin religión',
                abbreviation: 'STREL', // Standard Abbreviation?
                department: 'Religión (Alternativa)',
                courseId: group.courseId,
                group: group.name,
                codDelphos: 'REL_ALT',
                isTask: false, // Treat as Subject so it's assignable
                hours: 1
            });
        }
    });

    // 5. EXTRACT CLASSROOMS
    const potentialClassrooms = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.startsWith("AULAS_");
    });

    potentialClassrooms.forEach(item => {
        const id = getVal(item, "CLAVE");
        const nombre = getVal(item, "IDENTIFICACION");
        if (nombre) {
            classrooms.push({ id, name: nombre });
        }
    });

    // 6. EXTRACT COURSES (Educational Levels)
    let courses: ParsedCourse[] = [];

    // Strategy A: Explicit CURSOS block
    const potentialCourses = allListasal.filter(el => {
        const seq = (el.getAttribute("seq") || "").toUpperCase();
        return seq.includes("CURSO");
    });

    potentialCourses.forEach(item => {
        const id = getVal(item, "CODIGO") || getVal(item, "CLAVE");
        const nombre = getVal(item, "DESCRIPCION");
        const abrev = getVal(item, "ABREVIATURA");

        if (id && nombre) {
            courses.push({ id, name: nombre, abbreviation: abrev || nombre });
            courseDictionary.set(id, nombre); // Trust explicit definition
        }
    });

    // Strategy B: Fill gaps using Dictionary from MATERIAS/GRUPOS
    const existingCourseIds = new Set(courses.map(c => c.id));
    for (const [cId, cName] of courseDictionary.entries()) {
        if (!existingCourseIds.has(cId) && cId) {
            courses.push({
                id: cId,
                name: cName,
                abbreviation: cName
            });
            existingCourseIds.add(cId);
        }
    }

    // Strategy C: Minimal Fallback (Only ID) if absolutely no name found
    // User BANNED inventing names from Groups, so we default to ID if dictionary fails.
    const usedCourseIds = new Set([...subjects.map(s => s.courseId), ...groups.map(g => g.courseId)]);
    usedCourseIds.forEach(id => {
        if (id && !existingCourseIds.has(id)) {
            courses.push({ id: id, name: `Nivel ${id}`, abbreviation: id });
        }
    });

    // Deduplicate courses just in case
    const uniqueCourses = new Map<string, ParsedCourse>();
    courses.forEach(c => uniqueCourses.set(c.id, c));
    courses = Array.from(uniqueCourses.values());


    // --- ENGINE AUDIT BUILDER ---

    // --- ENGINE AUDIT BUILDER ---
    const departments: DepartmentStat[] = [];
    const uniqueDepts = new Set([...Object.keys(deptCapacity), ...Object.keys(deptDemand)]);

    let totalCap = 0;
    let totalDem = 0;

    uniqueDepts.forEach(d => {
        const req = deptDemand[d] || 0;
        const cap = deptCapacity[d] || 0;
        const bal = cap - req;
        totalCap += cap;
        totalDem += req;
        departments.push({
            name: d,
            requiredHours: req,
            assignedHours: cap,
            balance: bal
        });
    });

    // Fill specialized depts if missing
    teachers.forEach(t => {
        if (t.department && !departments.find(d => d.name === t.department)) {
            // ensure deps are present even if capacity/demand is 0 (though cap should be set)
        }
    });

    return {
        teachers,
        subjects,
        groups,
        tasks,
        classrooms,
        courses, // Return courses
        engineReport: {
            departments: departments.sort((a, b) => a.name.localeCompare(b.name)),
            totalSessions: totalDem,
            totalCapacity: totalCap,
            globalBalance: totalCap - totalDem
        }
    };
};
