
// Simulated output of a teacher audit after the delphosParser.ts update
const sampleTeacher = {
    id: '59890',
    name: 'Pérez López, José Gabriel',
    assignments: [
        { name: 'Matemáticas-1ESO-A', category: 'LECTIVA_PURA', hours: 4 },
        { name: 'Matemáticas-1ESO-B', category: 'LECTIVA_PURA', hours: 4 },
        { name: 'Matemáticas-2ESO-A', category: 'LECTIVA_PURA', hours: 4 },
        { name: 'Matemáticas-2ESO-B', category: 'LECTIVA_PURA', hours: 3 },
        { name: 'Refuerzo Matemáticas', category: 'LECTIVA_PURA', hours: 2 },
        { name: 'LDD - Tutoría de ESO', category: 'TUTORIA_ESO', hours: 2 }, // 1 Lectiva + 1 Admin
        { name: 'LFE - Coordinación del plan de lectura', category: 'BOLSA_COORDINACION', hours: 2 }
    ]
};

const totalLectivas = sampleTeacher.assignments
    .filter(a => a.category === 'LECTIVA_PURA' || (a.category === 'TUTORIA_ESO' && a.name.includes('ESO')))
    .reduce((sum, a) => sum + (a.category === 'TUTORIA_ESO' ? 1 : a.hours), 0);

console.log(`PROFESOR: ${sampleTeacher.name}`);
console.log(`-------------------------------------------`);
sampleTeacher.assignments.forEach(a => {
    console.log(`[${a.category.padEnd(18)}] ${a.name} (${a.hours}h)`);
});
console.log(`-------------------------------------------`);
console.log(`TOTAL LECTIVAS: ${totalLectivas}h`);

if (totalLectivas > 19) {
    const exceso = totalLectivas - 19;
    const compRequired = exceso * 2;
    console.log(`⚠️ ALERTA CLM: Excede el límite de 19h por ${exceso}h.`);
    console.log(`[COMPENSATORIA] Generación automática de ${compRequired}h complementarias.`);
}
