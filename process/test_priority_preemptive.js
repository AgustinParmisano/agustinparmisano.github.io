// Script de prueba para Priority Preemptive Scheduling
// Para ejecutar en la consola del navegador

function testPriorityPreemptive() {
    console.log("=== Iniciando prueba del algoritmo Priority Preemptive Scheduling ===");
    
    // Crear datos de prueba
    const testProcesses = [
        { id: 1, name: "P1", cpuTime: 10, arrivalTime: 0, priority: 3 },
        { id: 2, name: "P2", cpuTime: 1, arrivalTime: 1, priority: 1 },
        { id: 3, name: "P3", cpuTime: 2, arrivalTime: 2, priority: 4 },
        { id: 4, name: "P4", cpuTime: 1, arrivalTime: 3, priority: 2 }
    ];
    
    console.log("Procesos de entrada:", testProcesses);
    
    try {
        // Ejecutar algoritmo usando la función utilitaria
        const result = runPreemptivePriorityScheduling(testProcesses);
        
        console.log("=== Resultados Priority Preemptive Scheduling ===");
        console.log("Procesos ejecutados:", result.processes);
        console.log("Timeline:", result.timeline);
        
        // Verificar comportamiento preemptivo esperado:
        // Tiempo 0: P1 empieza
        // Tiempo 1: P2 (prioridad 1) interrumpe a P1 (prioridad 3)
        // Tiempo 2: P2 termina, P1 reanuda (prioridad 3 > prioridad 4 de P3)
        // Tiempo 3: P4 (prioridad 2) interrumpe a P1 (prioridad 3)
        // Tiempo 4: P4 termina, P3 ejecuta (P1 espera)
        // Tiempo 6: P3 termina, P1 reanuda hasta completar
        
        // Verificar orden de ejecución en timeline
        const executionOrder = [];
        let currentProcess = null;
        
        for (const entry of result.timeline) {
            if (currentProcess !== entry.processId) {
                executionOrder.push(entry.processId);
                currentProcess = entry.processId;
            }
        }
        
        console.log("Orden de ejecución obtenido:", executionOrder);
        
        // Verificar preempciones específicas
        console.log("=== Verificación de preempciones ===");
        
        // Verificar tiempos de finalización
        const p1 = result.processes.find(p => p.id === 1);
        const p2 = result.processes.find(p => p.id === 2);
        const p3 = result.processes.find(p => p.id === 3);
        const p4 = result.processes.find(p => p.id === 4);
        
        console.log("Tiempos de finalización:");
        console.log(`P1: ${p1.finishTime} (esperado: 14)`);
        console.log(`P2: ${p2.finishTime} (esperado: 2)`);
        console.log(`P3: ${p3.finishTime} (esperado: 6)`);
        console.log(`P4: ${p4.finishTime} (esperado: 4)`);
        
        // Verificar que P2 termine antes que los demás (mayor prioridad)
        const p2FinishesFirst = p2.finishTime < p1.finishTime && 
                              p2.finishTime < p3.finishTime && 
                              p2.finishTime < p4.finishTime;
        
        console.log("¿P2 (prioridad más alta) termina primero?", p2FinishesFirst);
        
        // Verificar que P4 termine antes que P3 (mayor prioridad)
        const p4BeforeP3 = p4.finishTime < p3.finishTime;
        console.log("¿P4 (prioridad 2) termina antes que P3 (prioridad 4)?", p4BeforeP3);
        
        // Verificar cambios de contexto
        const contextSwitches = result.statistics.contextSwitches;
        console.log(`Cambios de contexto: ${contextSwitches} (esperado: >= 5)`);
        
        // Verificar que hay múltiples preempciones
        const hasMultiplePreemptions = contextSwitches >= 5;
        console.log("¿Hay múltiples preempciones?", hasMultiplePreemptions);
        
        // Verificar tiempos de respuesta
        console.log("\n=== Verificación de tiempos de respuesta ===");
        result.processes.forEach(process => {
            console.log(`${process.name}: TR=${process.responseTime}, TE=${process.waitTime}`);
        });
        
        // P2 debería tener tiempo de respuesta muy bajo (alta prioridad)
        const p2HasLowResponseTime = p2.responseTime <= 2;
        console.log("¿P2 tiene tiempo de respuesta bajo?", p2HasLowResponseTime);
        
        const allChecksPass = p2FinishesFirst && p4BeforeP3 && hasMultiplePreemptions && p2HasLowResponseTime;
        
        if (allChecksPass) {
            console.log("✅ Prueba Priority Preemptive EXITOSA!");
        } else {
            console.log("❌ Prueba Priority Preemptive FALLIDA!");
        }
        
        return result;
    } catch (error) {
        console.error("❌ Error en la prueba Priority Preemptive:", error);
        return null;
    }
}

// Función auxiliar para probar casos edge preemptivos
function testPreemptiveEdgeCases() {
    console.log("\n=== Pruebas de casos límite preemptivos ===");
    
    // Caso 1: Proceso que llega con prioridad muy alta
    console.log("\n--- Caso 1: Interrupción inmediata ---");
    const immediatePreemption = [
        { id: 1, name: "P1", cpuTime: 5, arrivalTime: 0, priority: 5 },
        { id: 2, name: "P2", cpuTime: 2, arrivalTime: 2, priority: 1 }
    ];
    
    try {
        const result1 = runPreemptivePriorityScheduling(immediatePreemption);
        const p1 = result1.processes.find(p => p.id === 1);
        const p2 = result1.processes.find(p => p.id === 2);
        
        console.log(`P1 termina en: ${p1.finishTime}`);
        console.log(`P2 termina en: ${p2.finishTime}`);
        console.log("¿P2 interrumpe a P1?", p2.finishTime < p1.finishTime);
        console.log("✅ Caso 1 completado");
    } catch (error) {
        console.error("❌ Error en caso 1:", error);
    }
    
    // Caso 2: Múltiples procesos con la misma prioridad alta
    console.log("\n--- Caso 2: Misma prioridad alta ---");
    const samePriority = [
        { id: 1, name: "P1", cpuTime: 4, arrivalTime: 0, priority: 3 },
        { id: 2, name: "P2", cpuTime: 2, arrivalTime: 1, priority: 1 },
        { id: 3, name: "P3", cpuTime: 3, arrivalTime: 2, priority: 1 }
    ];
    
    try {
        const result2 = runPreemptivePriorityScheduling(samePriority);
        console.log("Resultado misma prioridad alta:", result2.processes);
        console.log("✅ Caso 2 completado");
    } catch (error) {
        console.error("❌ Error en caso 2:", error);
    }
}

// Ejecutar las pruebas
if (typeof runPreemptivePriorityScheduling !== 'undefined') {
    testPriorityPreemptive();
    testPreemptiveEdgeCases();
} else {
    console.log("runPreemptivePriorityScheduling no está disponible. Asegúrate de que priorityPreemptiveScheduler.js esté cargado.");
}
