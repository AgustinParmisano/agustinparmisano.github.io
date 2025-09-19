// Script de prueba para el algoritmo Priority Scheduling
// Para ejecutar en la consola del navegador

function testPriority() {
    console.log("=== Iniciando prueba del algoritmo Priority Scheduling ===");
    
    // Crear datos de prueba
    const testProcesses = [
        { id: 1, name: "P1", cpuTime: 8, arrivalTime: 0, priority: 3 },
        { id: 2, name: "P2", cpuTime: 4, arrivalTime: 1, priority: 1 },
        { id: 3, name: "P3", cpuTime: 9, arrivalTime: 2, priority: 4 },
        { id: 4, name: "P4", cpuTime: 5, arrivalTime: 3, priority: 2 }
    ];
    
    console.log("Procesos de entrada:", testProcesses);
    
    try {
        // Ejecutar algoritmo usando la función utilitaria
        const result = runPriorityScheduling(testProcesses);
        
        console.log("=== Resultados Priority Scheduling ===");
        console.log("Procesos ejecutados:", result.processes);
        console.log("Timeline:", result.timeline);
        
        // Verificar orden esperado basado en prioridades:
        // P1 (llega 0, prioridad 3) - ejecuta primero porque no hay otros
        // Luego por prioridad: P2 (prioridad 1), P4 (prioridad 2), P3 (prioridad 4)
        const expectedOrder = [1, 2, 4, 3];
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
        
        // Verificar tiempos
        console.log("=== Verificación de tiempos ===");
        result.processes.forEach(process => {
            console.log(`${process.name}: Inicio=${process.startTime}, Fin=${process.finishTime}, TR=${process.responseTime}, TE=${process.waitTime}`);
        });
        
        // Verificar que los procesos con mayor prioridad se ejecuten antes
        const p1 = result.processes.find(p => p.id === 1);
        const p2 = result.processes.find(p => p.id === 2);
        const p3 = result.processes.find(p => p.id === 3);
        const p4 = result.processes.find(p => p.id === 4);
        
        // P1 debe ejecutarse primero (llega primero)
        const p1StartsFirst = p1.startTime === 0;
        console.log("¿P1 inicia primero?", p1StartsFirst);
        
        // P2 (prioridad 1) debe ejecutarse antes que P4 (prioridad 2)
        const p2BeforeP4 = p2.startTime < p4.startTime;
        console.log("¿P2 (prioridad 1) antes que P4 (prioridad 2)?", p2BeforeP4);
        
        // P4 (prioridad 2) debe ejecutarse antes que P3 (prioridad 4)
        const p4BeforeP3 = p4.startTime < p3.startTime;
        console.log("¿P4 (prioridad 2) antes que P3 (prioridad 4)?", p4BeforeP3);
        
        const allChecksPass = isCorrect && p1StartsFirst && p2BeforeP4 && p4BeforeP3;
        
        if (allChecksPass) {
            console.log("✅ Prueba Priority Scheduling EXITOSA!");
        } else {
            console.log("❌ Prueba Priority Scheduling FALLIDA!");
        }
        
        return result;
    } catch (error) {
        console.error("❌ Error en la prueba Priority:", error);
        return null;
    }
}

// Función auxiliar para probar casos edge
function testPriorityEdgeCases() {
    console.log("\n=== Pruebas de casos límite ===");
    
    // Caso 1: Procesos con la misma prioridad
    console.log("\n--- Caso 1: Misma prioridad ---");
    const samePriorityProcesses = [
        { id: 1, name: "P1", cpuTime: 5, arrivalTime: 0, priority: 2 },
        { id: 2, name: "P2", cpuTime: 3, arrivalTime: 1, priority: 2 },
        { id: 3, name: "P3", cpuTime: 4, arrivalTime: 2, priority: 2 }
    ];
    
    try {
        const result1 = runPriorityScheduling(samePriorityProcesses);
        console.log("Resultado misma prioridad:", result1.processes);
        console.log("✅ Caso 1 completado");
    } catch (error) {
        console.error("❌ Error en caso 1:", error);
    }
    
    // Caso 2: Un solo proceso
    console.log("\n--- Caso 2: Un solo proceso ---");
    const singleProcess = [
        { id: 1, name: "P1", cpuTime: 5, arrivalTime: 0, priority: 1 }
    ];
    
    try {
        const result2 = runPriorityScheduling(singleProcess);
        console.log("Resultado un proceso:", result2.processes);
        console.log("✅ Caso 2 completado");
    } catch (error) {
        console.error("❌ Error en caso 2:", error);
    }
    
    // Caso 3: Procesos sin prioridad (debe fallar)
    console.log("\n--- Caso 3: Sin prioridad (debe fallar) ---");
    const noPriorityProcesses = [
        { id: 1, name: "P1", cpuTime: 5, arrivalTime: 0 }
    ];
    
    try {
        const result3 = runPriorityScheduling(noPriorityProcesses);
        console.log("❌ Caso 3 no debería haber funcionado");
    } catch (error) {
        console.log("✅ Caso 3 falló correctamente:", error.message);
    }
}

// Ejecutar las pruebas
if (typeof runPriorityScheduling !== 'undefined') {
    testPriority();
    testPriorityEdgeCases();
} else {
    console.log("runPriorityScheduling no está disponible. Asegúrate de que priorityScheduler.js esté cargado.");
}
