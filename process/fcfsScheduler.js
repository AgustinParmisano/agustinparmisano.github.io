/**
 * Módulo para implementar el algoritmo de planificación FCFS (First Come, First Served)
 */

class FCFSScheduler {
    constructor() {
        this.processes = [];
        this.timeline = [];
        this.readyQueue = {};
        this.statistics = {};
    }

    /**
     * Ejecuta el algoritmo FCFS sobre una lista de procesos
     * @param {Array} processes - Lista de procesos a planificar
     * @returns {Object} - Resultado de la simulación
     */
    schedule(processes) {
        if (!processes || processes.length === 0) {
            throw new Error('No hay procesos para planificar');
        }

        // Limpiar estado anterior
        this.reset();

        // Copiar y ordenar procesos por tiempo de llegada
        this.processes = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

        // Ejecutar simulación FCFS
        this.simulateFCFS();

        // Calcular estadísticas
        this.calculateStatistics();

        return {
            processes: this.processes,
            timeline: this.timeline,
            readyQueue: this.readyQueue,
            statistics: this.statistics
        };
    }

    /**
     * Simula la ejecución del algoritmo FCFS
     */
    simulateFCFS() {
        console.log('Iniciando simulación FCFS con procesos:', this.processes);
        
        let currentTime = 0;
        let executingProcess = null;
        let executionTimeRemaining = 0;
        
        // Cola de procesos listos (en orden de llegada)
        const readyQueue = [];
        
        // Encontrar el tiempo máximo necesario
        const totalCpuTime = this.processes.reduce((sum, p) => sum + p.cpuTime, 0);
        const maxTime = totalCpuTime + Math.max(...this.processes.map(p => p.arrivalTime));
        console.log('Tiempo máximo de simulación:', maxTime);

        // Simular cada unidad de tiempo
        for (currentTime = 0; currentTime < maxTime; currentTime++) {
            console.log(`\n--- Tiempo ${currentTime} ---`);
            console.log('Ready queue al inicio:', readyQueue.map(p => p.name));
            console.log('Proceso ejecutándose:', executingProcess ? executingProcess.name : 'ninguno');
            // Agregar procesos que llegan en este tiempo a la cola
            this.processes.forEach(process => {
                if (process.arrivalTime === currentTime && !process.startTime && !process.inQueue) {
                    readyQueue.push(process);
                    process.inQueue = true; // Marcar como agregado a la cola
                }
            });

            // Si no hay proceso ejecutándose, tomar el siguiente de la cola
            if (!executingProcess && readyQueue.length > 0) {
                executingProcess = readyQueue.shift(); // FCFS: primero en llegar, primero en servirse
                executionTimeRemaining = executingProcess.cpuTime;
                
                // Marcar tiempo de inicio
                executingProcess.startTime = currentTime;
                executingProcess.responseTime = currentTime - executingProcess.arrivalTime;
                executingProcess.waitTime = executingProcess.responseTime;
            }

            // Ejecutar proceso actual si existe
            if (executingProcess) {
                // Agregar al timeline
                this.timeline.push({
                    time: currentTime,
                    processId: executingProcess.id,
                    processName: executingProcess.name
                });

                executionTimeRemaining--;

                // Si el proceso termina
                if (executionTimeRemaining === 0) {
                    executingProcess.finishTime = currentTime + 1;
                    executingProcess = null;
                }
            }

            // Guardar estado de la cola para visualización
            const queueForDisplay = readyQueue.map(p => p.id);
            if (queueForDisplay.length > 0) {
                this.readyQueue[currentTime] = queueForDisplay;
            }

            // Terminar si todos los procesos han terminado
            const allFinished = this.processes.every(p => p.finishTime !== null);
            if (allFinished && !executingProcess && readyQueue.length === 0) {
                break;
            }
        }
    }

    /**
     * Obtiene el siguiente proceso listo para ejecutar (FCFS)
     * @param {number} currentTime - Tiempo actual
     * @returns {Object|null} - Siguiente proceso o null
     */
    getNextReadyProcess(currentTime) {
        return this.processes.find(p => 
            p.arrivalTime <= currentTime && 
            !p.startTime
        ) || null;
    }

    /**
     * Obtiene todos los procesos listos en un momento dado
     * @param {number} currentTime - Tiempo actual
     * @returns {Array} - Lista de procesos listos
     */
    getAllReadyProcesses(currentTime) {
        return this.processes.filter(p => 
            p.arrivalTime <= currentTime && 
            !p.startTime
        );
    }

    /**
     * Obtiene el estado de la cola de listos en un momento dado
     * @param {number} currentTime - Tiempo actual
     * @param {Object} executingProcess - Proceso en ejecución
     * @returns {Array} - Estado de la cola
     */
    getReadyQueueState(currentTime, executingProcess) {
        const readyProcesses = this.getAllReadyProcesses(currentTime);
        
        // Filtrar el proceso en ejecución si existe
        return readyProcesses
            .filter(p => !executingProcess || p.id !== executingProcess.id)
            .map(p => p.name);
    }

    /**
     * Calcula las estadísticas de la simulación
     */
    calculateStatistics() {
        const completedProcesses = this.processes.filter(p => p.finishTime !== null);
        
        if (completedProcesses.length === 0) {
            this.statistics = {
                averageResponseTime: 0,
                averageWaitTime: 0,
                averageTurnaroundTime: 0,
                throughput: 0,
                cpuUtilization: 0
            };
            return;
        }

        // Calcular tiempo de turnaround para cada proceso
        completedProcesses.forEach(process => {
            process.turnaroundTime = process.finishTime - process.arrivalTime;
        });

        // Calcular promedios
        const totalResponseTime = completedProcesses.reduce((sum, p) => sum + p.responseTime, 0);
        const totalWaitTime = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0);
        const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);

        const averageResponseTime = totalResponseTime / completedProcesses.length;
        const averageWaitTime = totalWaitTime / completedProcesses.length;
        const averageTurnaroundTime = totalTurnaroundTime / completedProcesses.length;

        // Calcular throughput
        const simulationEndTime = Math.max(...completedProcesses.map(p => p.finishTime));
        const simulationStartTime = Math.min(...this.processes.map(p => p.arrivalTime));
        const throughput = completedProcesses.length / (simulationEndTime - simulationStartTime);

        // Calcular utilización de CPU
        const totalCpuTime = completedProcesses.reduce((sum, p) => sum + p.cpuTime, 0);
        const cpuUtilization = (totalCpuTime / simulationEndTime) * 100;

        this.statistics = {
            averageResponseTime: Number(averageResponseTime.toFixed(2)),
            averageWaitTime: Number(averageWaitTime.toFixed(2)),
            averageTurnaroundTime: Number(averageTurnaroundTime.toFixed(2)),
            throughput: Number(throughput.toFixed(2)),
            cpuUtilization: Number(cpuUtilization.toFixed(2)),
            totalProcesses: completedProcesses.length,
            simulationTime: simulationEndTime
        };
    }

    /**
     * Reinicia el estado del scheduler
     */
    reset() {
        // Limpiar propiedades de los procesos
        this.processes.forEach(process => {
            delete process.startTime;
            delete process.finishTime;
            delete process.responseTime;
            delete process.waitTime;
            delete process.turnaroundTime;
            delete process.inQueue;
        });
        
        this.processes = [];
        this.timeline = [];
        this.readyQueue = {};
        this.statistics = {};
    }

    /**
     * Obtiene el timeline agrupado por bloques continuos
     * @returns {Array} - Timeline agrupado
     */
    getGroupedTimeline() {
        if (this.timeline.length === 0) return [];

        const grouped = [];
        let currentBlock = {
            processId: this.timeline[0].processId,
            processName: this.timeline[0].processName,
            startTime: this.timeline[0].time,
            endTime: this.timeline[0].time + 1,
            duration: 1
        };

        for (let i = 1; i < this.timeline.length; i++) {
            const currentEntry = this.timeline[i];

            if (currentEntry.processId === currentBlock.processId && 
                currentEntry.time === currentBlock.endTime) {
                // Extender el bloque actual
                currentBlock.endTime = currentEntry.time + 1;
                currentBlock.duration++;
            } else {
                // Terminar el bloque actual y comenzar uno nuevo
                grouped.push({ ...currentBlock });
                currentBlock = {
                    processId: currentEntry.processId,
                    processName: currentEntry.processName,
                    startTime: currentEntry.time,
                    endTime: currentEntry.time + 1,
                    duration: 1
                };
            }
        }

        // Agregar el último bloque
        grouped.push(currentBlock);

        return grouped;
    }

    /**
     * Valida que los procesos tengan la estructura correcta
     * @param {Array} processes - Lista de procesos a validar
     * @returns {boolean} - True si todos los procesos son válidos
     */
    validateProcesses(processes) {
        if (!Array.isArray(processes) || processes.length === 0) {
            return false;
        }

        for (const process of processes) {
            if (!process.name || 
                typeof process.cpuTime !== 'number' || process.cpuTime <= 0 ||
                typeof process.arrivalTime !== 'number' || process.arrivalTime < 0) {
                return false;
            }
        }

        return true;
    }
}

// Exportar para uso en otros módulos
window.FCFSScheduler = FCFSScheduler;