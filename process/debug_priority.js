// Debug script para Priority Scheduler
console.log("🔍 DEBUG PRIORITY SCHEDULER");

// Verificar qué funciones están disponibles
console.log("Funciones disponibles:");
console.log("- runPriorityScheduling:", typeof window.runPriorityScheduling);
console.log("- PriorityScheduler:", typeof window.PriorityScheduler);
console.log("- runPrioritySchedulingSimple:", typeof window.runPrioritySchedulingSimple);

// Test rápido con datos de ejemplo (igual al del simulador)
const testProcesses = [
    { id: 1, name: "P1", cpuTime: 8, arrivalTime: 0, priority: 3 },
    { id: 2, name: "P2", cpuTime: 4, arrivalTime: 1, priority: 1 },
    { id: 3, name: "P3", cpuTime: 9, arrivalTime: 2, priority: 4 },
    { id: 4, name: "P4", cpuTime: 5, arrivalTime: 3, priority: 2 }
];

console.log("📋 Datos de prueba:", testProcesses);

try {
    console.log("🚀 Ejecutando runPriorityScheduling...");
    const result = runPriorityScheduling(testProcesses);
    console.log("✅ Resultado obtenido:");
    console.log("- Procesos:", result.processes?.length || 0);
    console.log("- Timeline:", result.timeline?.length || 0);
    console.log("- Algoritmo:", result.algorithm);
    console.log("- Estadísticas:", !!result.statistics);
    
    if (result.statistics) {
        console.log("📊 Estadísticas disponibles:");
        console.log("- averageResponseTime:", result.statistics.averageResponseTime);
        console.log("- averageWaitTime:", result.statistics.averageWaitTime);
        console.log("- throughput:", result.statistics.throughput);
        console.log("- cpuUtilization:", result.statistics.cpuUtilization);
    } else {
        console.log("❌ No hay objeto statistics en el resultado");
    }
    
} catch (error) {
    console.error("❌ Error al ejecutar runPriorityScheduling:", error);
}

// Verificar si hay algún evento de carga pendiente
console.log("🔄 Verificando eventos DOM...");
if (document.readyState === 'loading') {
    console.log("⏳ DOM aún cargando...");
    document.addEventListener('DOMContentLoaded', () => {
        console.log("✅ DOM cargado completamente");
    });
} else {
    console.log("✅ DOM ya está listo");
}
