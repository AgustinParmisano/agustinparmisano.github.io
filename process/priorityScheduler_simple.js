/**
 * Planificador por Prioridades (Priority Scheduling) - Versión Simplificada
 * Versión robusta sin loops infinitos
 */

function runPrioritySchedulingSimple(inputProcesses) {
    console.log('=== INICIANDO PRIORITY SCHEDULING SIMPLE ===');
    
    // Validar entrada
    if (!inputProcesses || inputProcesses.length === 0) {
        throw new Error('No hay procesos para planificar');
    }
    
    // Validar que todos tengan prioridad
    for (const process of inputProcesses) {
        if (typeof process.priority === 'undefined' || process.priority === null) {
            throw new Error(`El proceso ${process.id || process.name} no tiene prioridad definida`);
        }
    }
    
    // Copia profunda de procesos
    const processes = JSON.parse(JSON.stringify(inputProcesses));
    
    // Inicializar procesos
    processes.forEach(process => {
        process.remainingTime = process.cpuTime;
        process.startTime = null;
        process.finishTime = null;
        process.responseTime = null;
        process.waitTime = null;
        process.completed = false;
    });
    
    const timeline = [];
    const readyQueue = [];
    let currentTime = 0;
    const completedProcesses = [];
    
    // Calcular tiempo máximo posible (para prevenir loops infinitos)
    const maxPossibleTime = Math.max(...processes.map(p => p.arrivalTime)) + 
                           processes.reduce((sum, p) => sum + p.cpuTime, 0) + 50;
    
    console.log('Procesos a planificar:', processes.map(p => ({
        id: p.id, name: p.name, cpu: p.cpuTime, arrival: p.arrivalTime, priority: p.priority
    })));
    
    // Bucle principal simplificado
    while (completedProcesses.length < processes.length && currentTime < maxPossibleTime) {
        console.log(`\n=== Tiempo ${currentTime} ===`);
        
        // 1. Agregar TODOS los procesos que han llegado y no están en cola
        const arriving = processes.filter(p => 
            p.arrivalTime <= currentTime && // <= en lugar de ===
            !p.completed && 
            !readyQueue.some(r => r.id === p.id)
        );
        
        arriving.forEach(p => {
            readyQueue.push(p);
            if (p.arrivalTime === currentTime) {
                console.log(`+ Proceso ${p.name} llega (prioridad ${p.priority})`);
            } else {
                console.log(`+ Proceso ${p.name} agregado a cola (llegó en ${p.arrivalTime}, prioridad ${p.priority})`);
            }
        });
        
        // 2. Ordenar cola por prioridad (menor número = mayor prioridad)
        readyQueue.sort((a, b) => a.priority - b.priority);
        
        if (readyQueue.length > 0) {
            console.log('Cola actual:', readyQueue.map(p => `${p.name}(${p.priority})`));
        }
        
        // 3. Si hay procesos listos, ejecutar el de mayor prioridad
        if (readyQueue.length > 0) {
            const process = readyQueue[0]; // El de mayor prioridad
            
            // Marcar inicio si es necesario
            if (process.startTime === null) {
                process.startTime = currentTime;
                console.log(`→ Iniciando ${process.name} en tiempo ${currentTime}`);
            }
            
            // Ejecutar proceso completamente (no preemptivo)
            console.log(`→ Ejecutando ${process.name} por ${process.remainingTime} unidades`);
            
            for (let i = 0; i < process.remainingTime; i++) {
                timeline.push({
                    time: currentTime + i,
                    processId: process.id,
                    processName: process.name,
                    action: 'executing'
                });
                console.log(`  [${currentTime + i}] ${process.name}`);
            }
            
            // Avanzar tiempo
            currentTime += process.remainingTime;
            
            // Completar proceso
            process.finishTime = currentTime;
            process.remainingTime = 0;
            process.completed = true;
            
            // Remover de cola y agregar a completados
            readyQueue.splice(0, 1);
            completedProcesses.push(process);
            
            console.log(`✓ ${process.name} completado en tiempo ${process.finishTime}`);
            
        } else {
            // No hay procesos listos, buscar el próximo
            const pending = processes.filter(p => !p.completed && p.arrivalTime > currentTime);
            
            if (pending.length > 0) {
                const nextArrival = Math.min(...pending.map(p => p.arrivalTime));
                console.log(`→ Saltando de ${currentTime} a ${nextArrival}`);
                currentTime = nextArrival;
            } else {
                console.log('→ No hay más procesos pendientes');
                break;
            }
        }
    }
    
    // Verificar timeout
    if (currentTime >= maxPossibleTime) {
        throw new Error(`TIMEOUT: Posible loop infinito detectado en tiempo ${currentTime}`);
    }
    
    // Calcular métricas
    processes.forEach(process => {
        if (process.finishTime !== null) {
            process.responseTime = process.finishTime - process.arrivalTime;
            process.waitTime = process.responseTime - process.cpuTime;
        }
    });
    
    // Calcular estadísticas
    const completedProcesses = processes.filter(p => p.finishTime !== null);
    let statistics = {
        averageResponseTime: 0,
        averageWaitTime: 0,
        averageTurnaroundTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        totalProcesses: completedProcesses.length,
        simulationTime: currentTime
    };
    
    if (completedProcesses.length > 0) {
        // Calcular promedios
        const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.responseTime, 0);
        const totalWaitTime = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0);
        
        const averageTurnaroundTime = totalTurnaroundTime / completedProcesses.length;
        const averageWaitTime = totalWaitTime / completedProcesses.length;
        
        // Calcular throughput
        const simulationEndTime = Math.max(...completedProcesses.map(p => p.finishTime));
        const simulationStartTime = Math.min(...processes.map(p => p.arrivalTime));
        const throughput = completedProcesses.length / (simulationEndTime - simulationStartTime);
        
        // Calcular utilización de CPU
        const totalCpuTime = completedProcesses.reduce((sum, p) => sum + p.cpuTime, 0);
        const cpuUtilization = (totalCpuTime / simulationEndTime) * 100;
        
        statistics = {
            averageResponseTime: Number(averageTurnaroundTime.toFixed(2)),
            averageWaitTime: Number(averageWaitTime.toFixed(2)),
            averageTurnaroundTime: Number(averageTurnaroundTime.toFixed(2)),
            throughput: Number(throughput.toFixed(2)),
            cpuUtilization: Number(cpuUtilization.toFixed(2)),
            totalProcesses: completedProcesses.length,
            simulationTime: simulationEndTime
        };
    }
    
    console.log('\n=== RESULTADOS ===');
    processes.forEach(p => {
        console.log(`${p.name}: Llegada=${p.arrivalTime}, Inicio=${p.startTime}, Fin=${p.finishTime}, TR=${p.responseTime}, TE=${p.waitTime}`);
    });
    
    console.log('\n=== ESTADÍSTICAS ===');
    console.log(`TR promedio: ${statistics.averageResponseTime}`);
    console.log(`TE promedio: ${statistics.averageWaitTime}`);
    console.log(`Throughput: ${statistics.throughput} procesos/unidad`);
    console.log(`Utilización CPU: ${statistics.cpuUtilization}%`);
    
    return {
        processes: processes,
        timeline: timeline,
        algorithm: 'PRIORITY',
        statistics: statistics,
        readyQueue: {} // Objeto vacío por compatibilidad
    };
}

// Reemplazar la función original completamente
if (typeof window !== 'undefined') {
    // Guardar referencia de la original si existe
    if (window.runPriorityScheduling) {
        window.runPrioritySchedulingOriginal = window.runPriorityScheduling;
    }
    
    // Reemplazar con la versión simple
    window.runPriorityScheduling = runPrioritySchedulingSimple;
    
    // También reemplazar la clase si existe
    if (window.PriorityScheduler) {
        window.PrioritySchedulerOriginal = window.PriorityScheduler;
    }
    
    console.log('✅ Priority Scheduler Simple activado y funcionando');
    console.log('Versión anterior guardada como runPrioritySchedulingOriginal');
    
    // Verificar que la función funcione
    try {
        const testResult = runPrioritySchedulingSimple([
            { id: 1, name: 'Test', cpuTime: 1, arrivalTime: 0, priority: 1 }
        ]);
        console.log('✅ Test del Priority Scheduler: Exitoso');
        console.log('Estadísticas incluidas:', !!testResult.statistics);
    } catch (error) {
        console.error('❌ Test del Priority Scheduler: Error', error);
    }
}
