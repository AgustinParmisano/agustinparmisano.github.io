/**
 * Planificador por Prioridades (Priority Scheduling)
 * 
 * El algoritmo de prioridades selecciona el proceso con la prioridad más alta
 * (menor número = mayor prioridad) de entre los procesos disponibles.
 * Es un algoritmo no preemptivo.
 */

class PriorityScheduler {
    constructor(processes) {
        this.processes = JSON.parse(JSON.stringify(processes)); // Copia profunda
        this.timeline = [];
        this.readyQueue = [];
        this.currentTime = 0;
        this.completedProcesses = [];
        
        // Validar que todos los procesos tengan prioridad
        this.validateProcesses();
        
        // Inicializar procesos
        this.initializeProcesses();
    }
    
    /**
     * Valida que todos los procesos tengan campo de prioridad
     */
    validateProcesses() {
        for (const process of this.processes) {
            if (typeof process.priority === 'undefined' || process.priority === null) {
                throw new Error(`El proceso ${process.id || process.name} no tiene prioridad definida`);
            }
            if (typeof process.priority !== 'number' || process.priority < 0) {
                throw new Error(`La prioridad del proceso ${process.id || process.name} debe ser un número no negativo`);
            }
        }
    }
    
    /**
     * Inicializa los procesos con valores por defecto
     */
    initializeProcesses() {
        this.processes.forEach(process => {
            process.remainingTime = process.cpuTime;
            process.startTime = null;
            process.finishTime = null;
            process.responseTime = null;
            process.waitTime = null;
            process.completed = false;
        });
    }
    
    /**
     * Ejecuta la simulación completa
     * @returns {Object} - Resultados de la simulación
     */
    schedule() {
        console.log('=== INICIANDO PLANIFICACIÓN POR PRIORIDADES ===');
        console.log('Procesos iniciales:', this.processes.map(p => ({
            id: p.id,
            name: p.name,
            cpuTime: p.cpuTime,
            arrivalTime: p.arrivalTime,
            priority: p.priority
        })));
        
        // Implementación simplificada sin loops infinitos
        const maxTime = Math.max(...this.processes.map(p => p.arrivalTime)) + 
                       this.processes.reduce((sum, p) => sum + p.cpuTime, 0) + 100; // Buffer adicional
        
        while (this.completedProcesses.length < this.processes.length) {
            // Verificar timeout de seguridad
            if (this.currentTime > maxTime) {
                console.error(`TIMEOUT: Tiempo ${this.currentTime} excede el máximo esperado ${maxTime}`);
                throw new Error('Timeout en Priority Scheduler - posible loop infinito');
            }
            
            // Agregar procesos que han llegado
            this.addArrivingProcesses();
            
            // Si hay procesos en cola, ejecutar el de mayor prioridad
            if (this.readyQueue.length > 0) {
                const selectedProcess = this.selectHighestPriorityProcess();
                if (selectedProcess) {
                    this.executeProcessToCompletion(selectedProcess);
                } else {
                    this.currentTime++; // Avanzar tiempo si no se puede seleccionar
                }
            } else {
                // No hay procesos listos, saltar al próximo tiempo de llegada
                const nextArrivalTime = this.findNextArrivalTime();
                if (nextArrivalTime !== null && nextArrivalTime > this.currentTime) {
                    console.log(`Saltando de tiempo ${this.currentTime} a ${nextArrivalTime}`);
                    this.currentTime = nextArrivalTime;
                } else {
                    // No hay más procesos por llegar
                    console.log('No hay más procesos pendientes');
                    break;
                }
            }
        }
        
        this.calculateMetrics();
        
        console.log('=== PLANIFICACIÓN POR PRIORIDADES COMPLETADA ===');
        console.log('Timeline final:', this.timeline);
        console.log('Procesos finalizados:', this.processes.map(p => ({
            id: p.id,
            name: p.name,
            startTime: p.startTime,
            finishTime: p.finishTime,
            responseTime: p.responseTime,
            waitTime: p.waitTime
        })));
        
        // Calcular estadísticas para compatibilidad
        const completedProcesses = this.processes.filter(p => p.finishTime !== null);
        let statistics = {
            averageResponseTime: 0,
            averageWaitTime: 0,
            averageTurnaroundTime: 0,
            throughput: 0,
            cpuUtilization: 0,
            totalProcesses: completedProcesses.length,
            simulationTime: this.currentTime
        };
        
        if (completedProcesses.length > 0) {
            const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.responseTime, 0);
            const totalWaitTime = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0);
            
            const averageTurnaroundTime = totalTurnaroundTime / completedProcesses.length;
            const averageWaitTime = totalWaitTime / completedProcesses.length;
            
            const simulationEndTime = Math.max(...completedProcesses.map(p => p.finishTime));
            const simulationStartTime = Math.min(...this.processes.map(p => p.arrivalTime));
            const throughput = completedProcesses.length / (simulationEndTime - simulationStartTime);
            
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
        
        return {
            processes: this.processes,
            timeline: this.timeline,
            algorithm: 'PRIORITY',
            statistics: statistics,
            readyQueue: {} // Compatibilidad
        };
    }
    
    
    /**
     * Agrega procesos que han llegado en el tiempo actual a la cola de listos
     */
    addArrivingProcesses() {
        const arrivingProcesses = this.processes.filter(process => 
            process.arrivalTime <= this.currentTime && // <= en lugar de ===
            !process.completed &&
            !this.readyQueue.some(p => p.id === process.id)
        );
        
        arrivingProcesses.forEach(process => {
            this.readyQueue.push(process);
            console.log(`Proceso ${process.name} agregado a cola de listos (Prioridad: ${process.priority})`);
        });
        
        // Ordenar cola por prioridad (menor número = mayor prioridad)
        this.readyQueue.sort((a, b) => a.priority - b.priority);
        
        if (this.readyQueue.length > 0) {
            console.log('Cola de listos ordenada por prioridad:', 
                this.readyQueue.map(p => `${p.name}(${p.priority})`));
        }
    }
    
    /**
     * Selecciona el proceso con la mayor prioridad de la cola de listos
     * @returns {Object|null} - Proceso seleccionado o null si no hay procesos
     */
    selectHighestPriorityProcess() {
        if (this.readyQueue.length === 0) {
            return null;
        }
        
        // La cola ya está ordenada por prioridad, tomar el primero
        return this.readyQueue[0];
    }
    
    /**
     * Ejecuta un proceso hasta su completación (algoritmo no preemptivo)
     * @param {Object} process - Proceso a ejecutar
     */
    executeProcessToCompletion(process) {
        console.log(`\n--- Tiempo ${this.currentTime} ---`);
        console.log(`Ejecutando proceso ${process.name} por ${process.remainingTime} unidades de tiempo`);
        
        // Marcar tiempo de inicio si es la primera vez que se ejecuta
        if (process.startTime === null) {
            process.startTime = this.currentTime;
            console.log(`Proceso ${process.name} iniciado en tiempo ${this.currentTime}`);
        }
        
        // Ejecutar todas las unidades de tiempo restantes
        for (let i = 0; i < process.remainingTime; i++) {
            // Agregar entrada al timeline
            this.timeline.push({
                time: this.currentTime + i,
                processId: process.id,
                processName: process.name,
                action: 'executing'
            });
            
            console.log(`  Tiempo ${this.currentTime + i}: Ejecutando ${process.name}`);
        }
        
        // Actualizar tiempo actual
        this.currentTime += process.remainingTime;
        
        // Marcar proceso como completado
        process.finishTime = this.currentTime;
        process.remainingTime = 0;
        process.completed = true;
        
        // Remover de la cola de listos
        this.readyQueue = this.readyQueue.filter(p => p.id !== process.id);
        
        // Agregar a procesos completados
        this.completedProcesses.push(process);
        
        console.log(`Proceso ${process.name} completado en tiempo ${process.finishTime}`);
    }
    
    /**
     * Calcula las métricas de tiempo para todos los procesos
     */
    calculateMetrics() {
        console.log('\n=== CALCULANDO MÉTRICAS ===');
        
        this.processes.forEach(process => {
            // Tiempo de respuesta (Turnaround Time) = Tiempo de finalización - Tiempo de llegada
            process.responseTime = process.finishTime - process.arrivalTime;
            
            // Tiempo de espera = Tiempo de respuesta - Tiempo de CPU
            process.waitTime = process.responseTime - process.cpuTime;
            
            console.log(`Proceso ${process.name}:`);
            console.log(`  Llegada: ${process.arrivalTime}, Inicio: ${process.startTime}, Fin: ${process.finishTime}`);
            console.log(`  TR (Turnaround): ${process.responseTime}, TE (Espera): ${process.waitTime}`);
        });
        
        // Calcular promedios
        const avgResponseTime = this.processes.reduce((sum, p) => sum + p.responseTime, 0) / this.processes.length;
        const avgWaitTime = this.processes.reduce((sum, p) => sum + p.waitTime, 0) / this.processes.length;
        
        console.log(`\nTiempo de respuesta promedio: ${avgResponseTime.toFixed(2)}`);
        console.log(`Tiempo de espera promedio: ${avgWaitTime.toFixed(2)}`);
    }
    
    /**
     * Encuentra el próximo tiempo de llegada de procesos no completados
     * @returns {number|null} - Próximo tiempo de llegada o null si no hay más
     */
    findNextArrivalTime() {
        const pendingProcesses = this.processes.filter(p => !p.completed && p.arrivalTime > this.currentTime);
        if (pendingProcesses.length === 0) {
            return null;
        }
        return Math.min(...pendingProcesses.map(p => p.arrivalTime));
    }
    
    /**
     * Obtiene el estado actual de la cola de listos para visualización
     * @returns {Array} - Procesos en cola de listos ordenados por prioridad
     */
    getReadyQueueState() {
        return this.readyQueue.map(process => ({
            id: process.id,
            name: process.name,
            priority: process.priority,
            remainingTime: process.remainingTime
        }));
    }
}

// Función de utilidad para ejecutar el planificador
function runPriorityScheduling(processes) {
    try {
        const scheduler = new PriorityScheduler(processes);
        return scheduler.schedule();
    } catch (error) {
        console.error('Error en planificación por prioridades:', error);
        throw error;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PriorityScheduler, runPriorityScheduling };
}
