/**
 * Test básico para verificar la implementación de Round Robin
 * Este archivo puede ser ejecutado en la consola del navegador
 */

// Función de prueba para Round Robin
function testRoundRobin() {
    console.log('=== Iniciando pruebas de Round Robin ===');
    
    // Crear instancia del scheduler
    const scheduler = new RoundRobinScheduler();
    
    // Procesos de prueba
    const testProcesses = [
        { id: 1, name: 'P1', cpuTime: 7, arrivalTime: 0 },
        { id: 2, name: 'P2', cpuTime: 4, arrivalTime: 2 },
        { id: 3, name: 'P3', cpuTime: 9, arrivalTime: 4 },
        { id: 4, name: 'P4', cpuTime: 5, arrivalTime: 5 }
    ];
    
    console.log('Procesos de prueba:', testProcesses);
    
    // Ejecutar con quantum = 3
    try {
        const result = scheduler.schedule(testProcesses, 3);
        
        console.log('\n=== Resultados de la simulación ===');
        console.log('Timeline:', result.timeline);
        console.log('Procesos finales:', result.processes);
        console.log('Estadísticas:', result.statistics);
        
        // Verificar que todos los procesos terminaron
        const allFinished = result.processes.every(p => p.finishTime !== null);
        console.log('¿Todos los procesos terminaron?', allFinished);
        
        // Verificar que el timeline no esté vacío
        console.log('Timeline tiene', result.timeline.length, 'entradas');
        
        // Verificar cálculos básicos
        const totalCpuTime = testProcesses.reduce((sum, p) => sum + p.cpuTime, 0);
        console.log('Tiempo total de CPU esperado:', totalCpuTime);
        
        if (allFinished && result.timeline.length > 0) {
            console.log('✅ Prueba básica exitosa');
            return true;
        } else {
            console.log('❌ Prueba básica falló');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        return false;
    }
}

// Función para probar diferentes quantums
function testDifferentQuantums() {
    console.log('\n=== Probando diferentes quantums ===');
    
    const scheduler = new RoundRobinScheduler();
    const testProcesses = [
        { id: 1, name: 'P1', cpuTime: 5, arrivalTime: 0 },
        { id: 2, name: 'P2', cpuTime: 3, arrivalTime: 0 },
        { id: 3, name: 'P3', cpuTime: 8, arrivalTime: 0 }
    ];
    
    const quantums = [1, 2, 4, 8];
    
    quantums.forEach(quantum => {
        try {
            const result = scheduler.schedule(testProcesses, quantum);
            console.log(`\nQuantum ${quantum}:`);
            console.log('  - Context switches:', result.statistics.contextSwitches);
            console.log('  - Tiempo promedio de espera:', result.statistics.averageWaitTime);
            console.log('  - Timeline length:', result.timeline.length);
        } catch (error) {
            console.error(`Error con quantum ${quantum}:`, error);
        }
    });
}

// Función para probar casos extremos
function testEdgeCases() {
    console.log('\n=== Probando casos extremos ===');
    
    const scheduler = new RoundRobinScheduler();
    
    // Caso 1: Un solo proceso
    try {
        const singleProcess = [{ id: 1, name: 'P1', cpuTime: 5, arrivalTime: 0 }];
        const result1 = scheduler.schedule(singleProcess, 2);
        console.log('✅ Caso un solo proceso: OK');
    } catch (error) {
        console.error('❌ Error con un solo proceso:', error);
    }
    
    // Caso 2: Procesos con tiempos de llegada muy diferentes
    try {
        const delayedProcesses = [
            { id: 1, name: 'P1', cpuTime: 3, arrivalTime: 0 },
            { id: 2, name: 'P2', cpuTime: 2, arrivalTime: 10 }
        ];
        const result2 = scheduler.schedule(delayedProcesses, 2);
        console.log('✅ Caso llegadas dispersas: OK');
    } catch (error) {
        console.error('❌ Error con llegadas dispersas:', error);
    }
    
    // Caso 3: Quantum muy grande
    try {
        const processes = [
            { id: 1, name: 'P1', cpuTime: 3, arrivalTime: 0 },
            { id: 2, name: 'P2', cpuTime: 2, arrivalTime: 0 }
        ];
        const result3 = scheduler.schedule(processes, 100);
        console.log('✅ Caso quantum grande: OK (debería comportarse como FCFS)');
    } catch (error) {
        console.error('❌ Error con quantum grande:', error);
    }
}

// Ejecutar todas las pruebas
function runAllTests() {
    console.log('🧪 Ejecutando todas las pruebas de Round Robin...\n');
    
    const test1 = testRoundRobin();
    testDifferentQuantums();
    testEdgeCases();
    
    console.log('\n🏁 Pruebas completadas');
    return test1;
}

// Exportar funciones para uso en consola
if (typeof window !== 'undefined') {
    window.testRoundRobin = testRoundRobin;
    window.testDifferentQuantums = testDifferentQuantums;
    window.testEdgeCases = testEdgeCases;
    window.runAllTests = runAllTests;
}
