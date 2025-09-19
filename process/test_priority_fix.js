// Prueba rápida para verificar que se corrigió el loop infinito
console.log("=== PRUEBA RÁPIDA PRIORITY SCHEDULER ===");

// Caso que podría causar loop infinito: procesos que llegan tarde
const testProcesses = [
    { id: 1, name: "P1", cpuTime: 2, arrivalTime: 5, priority: 1 },
    { id: 2, name: "P2", cpuTime: 3, arrivalTime: 10, priority: 2 }
];

console.log("Probando con procesos que llegan tarde:", testProcesses);

try {
    if (typeof runPriorityScheduling !== 'undefined') {
        console.time("Ejecución Priority Scheduler");
        const result = runPriorityScheduling(testProcesses);
        console.timeEnd("Ejecución Priority Scheduler");
        console.log("✅ Éxito! No hay loop infinito");
        console.log("Procesos completados:", result.processes.length);
    } else {
        console.log("❌ runPriorityScheduling no disponible");
    }
} catch (error) {
    console.log("❌ Error:", error.message);
}

// Caso normal
const normalProcesses = [
    { id: 1, name: "P1", cpuTime: 3, arrivalTime: 0, priority: 2 },
    { id: 2, name: "P2", cpuTime: 2, arrivalTime: 1, priority: 1 }
];

console.log("\nProbando caso normal:", normalProcesses);

try {
    if (typeof runPriorityScheduling !== 'undefined') {
        console.time("Caso normal");
        const result = runPriorityScheduling(normalProcesses);
        console.timeEnd("Caso normal");
        console.log("✅ Caso normal exitoso");
    }
} catch (error) {
    console.log("❌ Error en caso normal:", error.message);
}
