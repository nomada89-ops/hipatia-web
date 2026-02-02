import { Conflict } from "../ui/features/schedule/ConflictPanel";

// Mock Data Generator for "Demo Mode"
export const generateDemoData = () => {
    const departments = ["Matemáticas", "Lengua", "Inglés", "Informática", "Historia"];
    const teachers = Array.from({ length: 20 }, (_, i) => ({
        id: `T${i}`,
        name: `Profesor ${i + 1}`,
        department: departments[i % departments.length],
        hash: `HASH_DEMO_${i}`
    }));

    const subjects = ["MAT", "LEN", "ING", "PROG", "HIS"];

    // Generate ~100 sessions
    const sessions = [];
    for (let i = 0; i < 100; i++) {
        const t = teachers[i % 20];
        sessions.push({
            id: `S${i}`,
            teacher_id: t.hash,
            group_id: `${1 + (i % 4)}º Grado`,
            subject_id: subjects[i % 5],
            day: (i % 5) + 1,
            slot_index: (i % 6) + 1,
            start_time: "08:00",
            end_time: "09:00"
        });
    }

    const conflicts: Conflict[] = [
        {
            id: "d1",
            type: "CRITICAL",
            message: "Simulación Conflicto Legal: Solapamiento Reunión Dept.",
            affectedIds: [teachers[0].hash]
        },
        {
            id: "d2",
            type: "WARNING",
            message: "Violación de Preferencia: Tarde Libre Solicitada",
            affectedIds: [teachers[5].hash]
        }
    ];

    return { teachers, sessions, conflicts };
};
