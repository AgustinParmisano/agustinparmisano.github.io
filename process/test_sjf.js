// Script de prueba para el algoritmo SJF
// Para ejecutar en la consola del navegador

function testSJF() {
    console.log("=== Iniciando prueba del algoritmo SJF ===");
    
    // Crear datos de prueba
    const testProcesses = [
        { id: 1, name: "P1", cpuTime: 6, arrivalTime: 0 },
        { id: 2, name: "P2", cpuTime: 8, arrivalTime: 0 },
        { id: 3, name: "P3", cpuTime: 7, arrivalTime: 0 },
        { id: 4, name: "P4", cpuTime: 3, arrivalTime: 0 }
    ];
    
    console.log("Procesos de entrada:", testProcesses);
    
    // Crear instancia del scheduler SJF
    const sjfScheduler = new SJFScheduler();
    
    // Ejecutar algoritmo
    try {
        const result = sjfScheduler.schedule(testProcesses);
        
        console.log("=== Resultados SJF ===");
        console.log("Procesos ejecutados:", result.processes);
        console.log("Timeline:", result.timeline);
        console.log("Estadísticas:", result.statistics);
        
        // Verificar orden esperado: P4, P1, P3, P2
        const expectedOrder = [4, 1, 3, 2];
        const actualOrder = [];
        let currentProcess = null;
        
        for (const entry of result.timeline) {
            if (currentProcess !== entry.processId) {
                actualOrder.push(entry.processId);
                currentProcess = entry.processId;
            }
        }
        
        console.log("Orden esperado:", expectedOrder);
        console.log("Orden obtenido:", actualOrder);
        
        const isCorrect = JSON.stringify(expectedOrder) === JSON.stringify(actualOrder);
        console.log("¿Orden correcto?", isCorrect);
        
        if (isCorrect) {
            console.log("✅ Prueba SJF EXITOSA!");
        } else {
            console.log("❌ Prueba SJF FALLIDA!");
        }
        
        return result;
    } catch (error) {
        console.error("❌ Error en la prueba SJF:", error);
        return null;
    }
}

// Ejecutar la prueba
if (typeof SJFScheduler !== 'undefined') {
    testSJF();
} else {
    console.log("SJFScheduler no está disponible. Asegúrate de que sjfScheduler.js esté cargado.");
}