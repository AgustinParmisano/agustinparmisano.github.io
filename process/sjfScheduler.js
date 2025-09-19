/**
 * Módulo para implementar el algoritmo de planificación SJF (Shortest Job First)
 * Implementación no preemptiva - el proceso más corto disponible es seleccionado para ejecutar
 */

class SJFScheduler {
    constructor() {
        this.processes = [];
        this.timeline = [];
        this.readyQueue = {};
        this.statistics = {};
    }

    /**
     * Ejecuta el algoritmo SJF sobre una lista de procesos
     * @param {Array} processes - Lista de procesos a planificar
     * @returns {Object} - Resultado de la simulación
     */
    schedule(processes) {
        if (!processes || processes.length === 0) {
            throw new Error('No hay procesos para planificar');
        }

        // Limpiar estado anterior
        this.reset();

        // Copiar procesos y inicializar campos calculados
        this.processes = [...processes].map(process => ({
            ...process,
            startTime: null,
            finishTime: null,
            responseTime: null,
            waitTime: null
        }));

        // Ejecutar simulación SJF
        this.simulateSJF();

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
     * Simula la ejecución del algoritmo SJF (no preemptivo)
     */
    simulateSJF() {
        console.log('=== Iniciando simulación SJF ===');
        console.log('Procesos iniciales:', this.processes.map(p => `${p.name}(CPU:${p.cpuTime}, Arr:${p.arrivalTime})`));
        
        let currentTime = 0;
        let executingProcess = null;
        let executionTimeRemaining = 0;
        
        // Encontrar el tiempo máximo necesario
        const totalCpuTime = this.processes.reduce((sum, p) => sum + p.cpuTime, 0);
        const maxTime = totalCpuTime + Math.max(...this.processes.map(p => p.arrivalTime));
        console.log('Tiempo máximo de simulación:', maxTime);
        console.log('Tiempo total de CPU:', totalCpuTime);

        // Simular cada unidad de tiempo
        for (currentTime = 0; currentTime < maxTime; currentTime++) {
            console.log(`\n--- Tiempo ${currentTime} ---`);
            
            // Obtener procesos disponibles (que han llegado y no han sido ejecutados)
            const readyProcesses = this.getReadyProcesses(currentTime);
            console.log('Procesos listos:', readyProcesses.map(p => `${p.name}(${p.cpuTime})`));
            
            // Si no hay proceso ejecutándose, seleccionar el próximo usando SJF
            if (!executingProcess && readyProcesses.length > 0) {
                // SJF: seleccionar el proceso con menor tiempo de CPU
                // En caso de empate, seleccionar el que llegó primero (FCFS como criterio de desempate)
                executingProcess = readyProcesses.reduce((shortest, current) => {
                    if (current.cpuTime < shortest.cpuTime) {
                        return current;
                    } else if (current.cpuTime === shortest.cpuTime) {
                        // Desempate por orden de llegada (FCFS)
                        return current.arrivalTime < shortest.arrivalTime ? current : shortest;
                    }
                    return shortest;
                });
                
                executionTimeRemaining = executingProcess.cpuTime;
                
                // Marcar tiempo de inicio
                executingProcess.startTime = currentTime;
                // Tiempo de espera = tiempo de inicio - tiempo de llegada
                executingProcess.waitTime = currentTime - executingProcess.arrivalTime;
                
                console.log(`Proceso ${executingProcess.name} inicia en tiempo ${currentTime}:`);
                console.log(`  - Llegada: ${executingProcess.arrivalTime}`);
                console.log(`  - CPU Time: ${executingProcess.cpuTime}`);
                console.log(`  - Tiempo de espera: ${executingProcess.waitTime}`);
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
                    // Tiempo de retorno = tiempo de finalización - tiempo de llegada
                    executingProcess.responseTime = executingProcess.finishTime - executingProcess.arrivalTime;
                    
                    console.log(`Proceso ${executingProcess.name} termina en tiempo ${executingProcess.finishTime}:`);
                    console.log(`  - Tiempo de retorno (TR): ${executingProcess.responseTime}`);
                    console.log(`  - Tiempo de espera (TE): ${executingProcess.waitTime}`);
                    
                    executingProcess = null;
                }
            }

            // Guardar estado de la cola para visualización
            // Mostrar procesos listos ordenados por tiempo de CPU (más corto primero)
            const queueForDisplay = readyProcesses
                .filter(p => !executingProcess || p.id !== executingProcess.id)
                .sort((a, b) => {
                    if (a.cpuTime === b.cpuTime) {
                        return a.arrivalTime - b.arrivalTime; // Desempate por llegada
                    }
                    return a.cpuTime - b.cpuTime;
                })
                .map(p => p.id);
                
            if (queueForDisplay.length > 0) {
                this.readyQueue[currentTime] = queueForDisplay;
            }

            // Terminar si todos los procesos han terminado
            const allFinished = this.processes.every(p => p.finishTime !== null);
            if (allFinished && !executingProcess) {
                break;
            }
        }
    }

    /**
     * Obtiene todos los procesos listos en un momento dado
     * @param {number} currentTime - Tiempo actual
     * @returns {Array} - Lista de procesos listos
     */
    getReadyProcesses(currentTime) {
        return this.processes.filter(p => 
            p.arrivalTime <= currentTime && 
            p.startTime === null
        );
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

        // Calcular promedios (responseTime ya contiene el turnaround time)
        const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.responseTime, 0);
        const totalWaitTime = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0);

        const averageTurnaroundTime = totalTurnaroundTime / completedProcesses.length;
        const averageWaitTime = totalWaitTime / completedProcesses.length;

        // Calcular throughput
        const simulationEndTime = Math.max(...completedProcesses.map(p => p.finishTime));
        const simulationStartTime = Math.min(...this.processes.map(p => p.arrivalTime));
        const throughput = completedProcesses.length / (simulationEndTime - simulationStartTime);

        // Calcular utilización de CPU
        const totalCpuTime = completedProcesses.reduce((sum, p) => sum + p.cpuTime, 0);
        const cpuUtilization = (totalCpuTime / simulationEndTime) * 100;

        this.statistics = {
            averageResponseTime: Number(averageTurnaroundTime.toFixed(2)), // TR = Turnaround Time
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
window.SJFScheduler = SJFScheduler;