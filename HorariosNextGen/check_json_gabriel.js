
const sampleTeacher = {
    id: '59890',
    name: 'Pérez López, José Gabriel',
    department: 'Matemáticas',
    assignments: [
        {
            id: 'MAT-1ESO-A',
            name: 'Matemáticas-1ESO-A',
            clmCategory: 'LECTIVA_PURA',
            hours: 4
        },
        {
            id: 'TASK-T-G001',
            name: 'LDD - Tutoría de ESO',
            clmCategory: 'TUTORIA_ESO',
            hours: 2,
            clmLectiveHours: 1,
            clmComplementaryHours: 1
        },
        {
            id: 'TASK-BIE-G001',
            name: 'LFE - Coordinación de Bienestar y Protección',
            clmCategory: 'BOLSA_COORDINACION',
            hours: 2
        },
        {
            id: 'TASK-DIG-G001',
            name: 'LFE - Coordinación de Digitalización',
            clmCategory: 'BOLSA_COORDINACION',
            hours: 2
        }
    ]
};

// Computation of 19h
const totalLectivas = sampleTeacher.assignments.reduce((sum, a) => {
    if (a.clmCategory === 'LECTIVA_PURA') return sum + a.hours;
    if (a.clmCategory === 'TUTORIA_ESO') return sum + (a.clmLectiveHours || 0);
    return sum;
}, 0);

const result = {
    teacher: sampleTeacher.name,
    audit: {
        totalLectivas,
        limit: 19,
        excess: Math.max(0, totalLectivas - 19),
        compensatoriaGenerated: Math.max(0, totalLectivas - 19) * 2
    },
    rawAssignments: sampleTeacher.assignments
};

console.log(JSON.stringify(result, null, 2));
