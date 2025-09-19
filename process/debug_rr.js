// Script de debug para verificar Round Robin
console.log('=== DEBUG ROUND ROBIN ===');

// Crear instancia
const rrScheduler = new RoundRobinScheduler(3);

// Procesos simples
const testProcesses = [
    { id: 1, name: 'P1', cpuTime: 4, arrivalTime: 0 },
    { id: 2, name: 'P2', cpuTime: 3, arrivalTime: 1 }
];

console.log('Procesos:', testProcesses);

// Ejecutar
const result = rrScheduler.schedule(testProcesses);

console.log('\n=== TIMELINE ===');
result.timeline.forEach(entry => {
    console.log(`Tiempo ${entry.time}: Proceso ${entry.processName} (ID: ${entry.processId})`);
});

console.log('\n=== PROCESOS FINALES ===');
result.processes.forEach(p => {
    console.log(`${p.name}: Start=${p.startTime}, Finish=${p.finishTime}, TR=${p.responseTime}, TE=${p.waitTime}`);
});

console.log('\n=== VERIFICACIÓN: ¿Solo un proceso por tiempo? ===');
const timeMap = new Map();
result.timeline.forEach(entry => {
    if (timeMap.has(entry.time)) {
        console.error(`ERROR: Tiempo ${entry.time} tiene múltiples procesos!`);
        console.error(`  Anterior: ${timeMap.get(entry.time)}`);
        console.error(`  Actual: ${entry.processName}`);
    } else {
        timeMap.set(entry.time, entry.processName);
    }
});

console.log('✅ Verificación completada');

// Exportar resultado para inspección
window.debugRRResult = result;
