/**
 * Planificador por Prioridades Preemptivo (Preemptive Priority Scheduling)
 * 
 * Este algoritmo selecciona el proceso con la prioridad más alta disponible
 * y puede interrumpir el proceso en ejecución si llega uno con mayor prioridad.
 * (Menor número = Mayor prioridad)
 */

function runPreemptivePriorityScheduling(inputProcesses) {
    console.log('=== INICIANDO PRIORITY PREEMPTIVE SCHEDULING ===');
    
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
        process.lastExecutionTime = null; // Para manejar preempciones
    });
    
    const timeline = [];
    const readyQueue = [];
    let currentTime = 0;
    let executingProcess = null;
    const completedProcesses = [];
    
    // Calcular tiempo máximo posible
    const maxPossibleTime = Math.max(...processes.map(p => p.arrivalTime)) + 
                           processes.reduce((sum, p) => sum + p.cpuTime, 0) + 50;
    
    console.log('Procesos a planificar (Preemptivo):', processes.map(p => ({
        id: p.id, name: p.name, cpu: p.cpuTime, arrival: p.arrivalTime, priority: p.priority
    })));
    
    // Bucle principal - ejecuta unidad por unidad de tiempo
    while (completedProcesses.length < processes.length && currentTime < maxPossibleTime) {
        console.log(`\n=== Tiempo ${currentTime} ===`);
        
        // 1. Agregar procesos que han llegado a la cola
        const arriving = processes.filter(p => 
            p.arrivalTime === currentTime && 
            !p.completed && 
            !readyQueue.some(r => r.id === p.id) &&
            (!executingProcess || p.id !== executingProcess.id)
        );
        
        arriving.forEach(p => {
            readyQueue.push(p);
            console.log(`+ Proceso ${p.name} llega (prioridad ${p.priority})`);
        });
        
        // 2. Verificar si hay un proceso de mayor prioridad que el en ejecución
        let shouldPreempt = false;
        let highestPriorityProcess = null;
        
        if (readyQueue.length > 0) {
            // Encontrar el proceso con mayor prioridad en la cola
            readyQueue.sort((a, b) => a.priority - b.priority);
            highestPriorityProcess = readyQueue[0];
            
            // Verificar si debe hacer preempción
            if (executingProcess && highestPriorityProcess.priority < executingProcess.priority) {
                shouldPreempt = true;
                console.log(`⚡ PREEMPCIÓN: ${highestPriorityProcess.name}(${highestPriorityProcess.priority}) interrumpe a ${executingProcess.name}(${executingProcess.priority})`);
            }
        }
        
        // 3. Manejar preempción si es necesaria
        if (shouldPreempt) {
            // Devolver proceso en ejecución a la cola
            readyQueue.push(executingProcess);
            readyQueue.sort((a, b) => a.priority - b.priority);
            
            // El proceso interrumpido ya no está ejecutando
            executingProcess = null;
        }
        
        // 4. Seleccionar proceso a ejecutar
        if (!executingProcess && readyQueue.length > 0) {
            executingProcess = readyQueue.shift(); // Tomar el de mayor prioridad
            
            // Marcar tiempo de inicio si es la primera vez
            if (executingProcess.startTime === null) {
                executingProcess.startTime = currentTime;
                console.log(`→ Iniciando ${executingProcess.name} en tiempo ${currentTime}`);
            } else {
                console.log(`→ Reanudando ${executingProcess.name} en tiempo ${currentTime}`);
            }
        }
        
        // 5. Ejecutar una unidad de tiempo
        if (executingProcess) {
            // Registrar en timeline
            timeline.push({
                time: currentTime,
                processId: executingProcess.id,
                processName: executingProcess.name,
                action: 'executing'
            });
            
            // Reducir tiempo restante
            executingProcess.remainingTime--;
            executingProcess.lastExecutionTime = currentTime;
            
            console.log(`→ [${currentTime}] ${executingProcess.name} (restante: ${executingProcess.remainingTime})`);
            
            // Verificar si el proceso terminó
            if (executingProcess.remainingTime === 0) {
                executingProcess.finishTime = currentTime + 1;
                executingProcess.completed = true;
                completedProcesses.push(executingProcess);
                
                console.log(`✓ ${executingProcess.name} completado en tiempo ${executingProcess.finishTime}`);
                executingProcess = null;
            }
        } else {
            console.log(`→ [${currentTime}] CPU inactiva`);
        }
        
        // 6. Mostrar estado actual
        if (readyQueue.length > 0) {
            console.log('Cola listos:', readyQueue.map(p => `${p.name}(${p.priority})`));
        }
        
        // Avanzar tiempo
        currentTime++;
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
    const completedProcessesFiltered = processes.filter(p => p.finishTime !== null);
    let statistics = {
        averageResponseTime: 0,
        averageWaitTime: 0,
        averageTurnaroundTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        contextSwitches: calculateContextSwitches(timeline),
        totalProcesses: completedProcessesFiltered.length,
        simulationTime: currentTime
    };
    
    if (completedProcessesFiltered.length > 0) {
        const totalTurnaroundTime = completedProcessesFiltered.reduce((sum, p) => sum + p.responseTime, 0);
        const totalWaitTime = completedProcessesFiltered.reduce((sum, p) => sum + p.waitTime, 0);
        
        const averageTurnaroundTime = totalTurnaroundTime / completedProcessesFiltered.length;
        const averageWaitTime = totalWaitTime / completedProcessesFiltered.length;
        
        const simulationEndTime = Math.max(...completedProcessesFiltered.map(p => p.finishTime));
        const simulationStartTime = Math.min(...processes.map(p => p.arrivalTime));
        const throughput = completedProcessesFiltered.length / (simulationEndTime - simulationStartTime);
        
        const totalCpuTime = completedProcessesFiltered.reduce((sum, p) => sum + p.cpuTime, 0);
        const cpuUtilization = (totalCpuTime / simulationEndTime) * 100;
        
        statistics = {
            averageResponseTime: Number(averageTurnaroundTime.toFixed(2)),
            averageWaitTime: Number(averageWaitTime.toFixed(2)),
            averageTurnaroundTime: Number(averageTurnaroundTime.toFixed(2)),
            throughput: Number(throughput.toFixed(2)),
            cpuUtilization: Number(cpuUtilization.toFixed(2)),
            contextSwitches: statistics.contextSwitches,
            totalProcesses: completedProcessesFiltered.length,
            simulationTime: simulationEndTime
        };
    }
    
    console.log('\n=== RESULTADOS PRIORITY PREEMPTIVE ===');
    processes.forEach(p => {
        console.log(`${p.name}: Llegada=${p.arrivalTime}, Inicio=${p.startTime}, Fin=${p.finishTime}, TR=${p.responseTime}, TE=${p.waitTime}`);
    });
    
    console.log('\n=== ESTADÍSTICAS PREEMPTIVE ===');
    console.log(`TR promedio: ${statistics.averageResponseTime}`);
    console.log(`TE promedio: ${statistics.averageWaitTime}`);
    console.log(`Cambios de contexto: ${statistics.contextSwitches}`);
    console.log(`Throughput: ${statistics.throughput} procesos/unidad`);
    console.log(`Utilización CPU: ${statistics.cpuUtilization}%`);
    
    return {
        processes: processes,
        timeline: timeline,
        algorithm: 'PRIORITY_PREEMPTIVE',
        statistics: statistics,
        readyQueue: {}
    };
}

/**
 * Calcula el número de cambios de contexto en el timeline
 * @param {Array} timeline - Timeline de ejecución
 * @returns {number} - Número de cambios de contexto
 */
function calculateContextSwitches(timeline) {
    if (timeline.length <= 1) return 0;
    
    let switches = 0;
    let previousProcess = timeline[0].processId;
    
    for (let i = 1; i < timeline.length; i++) {
        if (timeline[i].processId !== previousProcess) {
            switches++;
            previousProcess = timeline[i].processId;
        }
    }
    
    return switches;
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runPreemptivePriorityScheduling };
}
