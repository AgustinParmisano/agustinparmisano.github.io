/**
 * Módulo para implementar el algoritmo de planificación Round Robin
 * Implementación preemptiva con quantum de tiempo configurable
 */

class RoundRobinScheduler {
    constructor(quantum = 2) {
        this.quantum = quantum;
        this.processes = [];
        this.timeline = [];
        this.readyQueue = {};
        this.statistics = {};
    }

    /**
     * Establece el quantum de tiempo
     * @param {number} quantum - Quantum de tiempo para Round Robin
     */
    setQuantum(quantum) {
        if (quantum <= 0) {
            throw new Error('El quantum debe ser un número positivo');
        }
        this.quantum = quantum;
    }

    /**
     * Ejecuta el algoritmo Round Robin sobre una lista de procesos
     * @param {Array} processes - Lista de procesos a planificar
     * @param {number} quantum - Quantum de tiempo (opcional)
     * @returns {Object} - Resultado de la simulación
     */
    schedule(processes, quantum = null) {
        if (!processes || processes.length === 0) {
            throw new Error('No hay procesos para planificar');
        }

        if (quantum !== null) {
            this.setQuantum(quantum);
        }

        // Limpiar estado anterior
        this.reset();

        // Copiar procesos y inicializar campos calculados
        this.processes = [...processes].map(process => ({
            ...process,
            startTime: null,
            finishTime: null,
            responseTime: null,
            waitTime: null,
            remainingTime: process.cpuTime, // Tiempo restante de CPU
            firstExecution: true // Para calcular tiempo de respuesta
        }));

        // Ejecutar simulación Round Robin
        this.simulateRoundRobin();

        // Calcular estadísticas
        this.calculateStatistics();

        return {
            processes: this.processes,
            timeline: this.timeline,
            readyQueue: this.readyQueue,
            statistics: this.statistics,
            quantum: this.quantum
        };
    }

    /**
     * Simula la ejecución del algoritmo Round Robin (preemptivo)
     */
    simulateRoundRobin() {
        console.log(`=== Iniciando simulación Round Robin (Quantum: ${this.quantum}) ===`);
        console.log('Procesos iniciales:', this.processes.map(p => 
            `${p.name}(CPU:${p.cpuTime}, Arr:${p.arrivalTime})`
        ));
        
        let currentTime = 0;
        let executingProcess = null;
        let quantumTimeRemaining = 0;
        let readyProcessQueue = []; // Cola circular para Round Robin
        
        // Encontrar el tiempo máximo necesario
        const totalCpuTime = this.processes.reduce((sum, p) => sum + p.cpuTime, 0);
        const maxArrivalTime = Math.max(...this.processes.map(p => p.arrivalTime));
        const maxTime = totalCpuTime + maxArrivalTime + 50; // Buffer adicional
        console.log('Tiempo máximo de simulación:', maxTime);
        console.log('Tiempo total de CPU:', totalCpuTime);

        // Simular cada unidad de tiempo
        for (currentTime = 0; currentTime < maxTime; currentTime++) {
            console.log(`\\n--- Tiempo ${currentTime} ---`);
            
            // Agregar procesos que llegan en este tiempo a la cola
            const arrivingProcesses = this.processes.filter(p => 
                p.arrivalTime === currentTime && p.remainingTime > 0
            );
            
            arrivingProcesses.forEach(process => {
                readyProcessQueue.push(process);
                console.log(`Proceso ${process.name} llega y se agrega a la cola`);
            });

            // Si el proceso actual terminó su quantum o terminó completamente
            if (executingProcess && quantumTimeRemaining <= 0) {
                if (executingProcess.remainingTime > 0) {
                    // El proceso no terminó, regresarlo al final de la cola
                    readyProcessQueue.push(executingProcess);
                    console.log(`Proceso ${executingProcess.name} agotó su quantum, regresa a la cola`);
                } else {
                    console.log(`Proceso ${executingProcess.name} terminó completamente`);
                }
                executingProcess = null;
            }

            // Seleccionar siguiente proceso si no hay uno ejecutándose
            if (!executingProcess && readyProcessQueue.length > 0) {
                executingProcess = readyProcessQueue.shift(); // Tomar del frente de la cola
                quantumTimeRemaining = this.quantum;
                
                // Si es la primera vez que se ejecuta este proceso
                if (executingProcess.firstExecution) {
                    executingProcess.startTime = currentTime; // Tiempo de primera respuesta
                    executingProcess.firstExecution = false;
                    console.log(`Proceso ${executingProcess.name} inicia por primera vez en tiempo ${currentTime}`);
                } else {
                    console.log(`Proceso ${executingProcess.name} reanuda ejecución en tiempo ${currentTime}`);
                }
            }

            // Ejecutar proceso actual si existe
            if (executingProcess) {
                // Agregar al timeline
                this.timeline.push({
                    time: currentTime,
                    processId: executingProcess.id,
                    processName: executingProcess.name,
                    quantum: this.quantum,
                    quantumRemaining: quantumTimeRemaining,
                    cpuRemaining: executingProcess.remainingTime
                });

                // Reducir tiempo restante de CPU y quantum
                executingProcess.remainingTime--;
                quantumTimeRemaining--;

                console.log(`Ejecutando ${executingProcess.name}: CPU restante=${executingProcess.remainingTime}, Quantum restante=${quantumTimeRemaining}`);

                // Si el proceso termina completamente
                if (executingProcess.remainingTime === 0) {
                    executingProcess.finishTime = currentTime + 1;
                    // Tiempo de retorno = tiempo de finalización - tiempo de llegada
                    executingProcess.responseTime = executingProcess.finishTime - executingProcess.arrivalTime;
                    // Tiempo de espera = tiempo de retorno - tiempo de CPU
                    executingProcess.waitTime = executingProcess.responseTime - executingProcess.cpuTime;
                    
                    console.log(`Proceso ${executingProcess.name} termina en tiempo ${executingProcess.finishTime}:`);
                    console.log(`  - Tiempo de retorno (TR): ${executingProcess.responseTime}`);
                    console.log(`  - Tiempo de espera (TE): ${executingProcess.waitTime}`);
                    
                    executingProcess = null;
                    quantumTimeRemaining = 0;
                }
            }

            // Guardar estado de la cola para visualización
            const queueForDisplay = [...readyProcessQueue].map(p => p.id);
            if (queueForDisplay.length > 0) {
                this.readyQueue[currentTime] = queueForDisplay;
            }

            // Terminar si todos los procesos han terminado
            const allFinished = this.processes.every(p => p.remainingTime === 0);
            if (allFinished) {
                console.log(`\\nTodos los procesos han terminado en tiempo ${currentTime + 1}`);
                break;
            }
        }

        console.log('\\n=== Simulación Round Robin completada ===');
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
                cpuUtilization: 0,
                contextSwitches: 0
            };
            return;
        }

        // Calcular promedios
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

        // Calcular cambios de contexto (aproximado basado en timeline)
        let contextSwitches = 0;
        let lastProcessId = null;
        for (const timeSlot of this.timeline) {
            if (lastProcessId !== null && lastProcessId !== timeSlot.processId) {
                contextSwitches++;
            }
            lastProcessId = timeSlot.processId;
        }

        this.statistics = {
            averageResponseTime: Number(averageTurnaroundTime.toFixed(2)), // En RR, TR = Response Time
            averageWaitTime: Number(averageWaitTime.toFixed(2)),
            averageTurnaroundTime: Number(averageTurnaroundTime.toFixed(2)),
            throughput: Number(throughput.toFixed(2)),
            cpuUtilization: Number(cpuUtilization.toFixed(2)),
            contextSwitches: contextSwitches,
            quantum: this.quantum
        };

        console.log('\\nEstadísticas calculadas:', this.statistics);
    }

    /**
     * Reinicia el estado del scheduler
     */
    reset() {
        this.processes = [];
        this.timeline = [];
        this.readyQueue = {};
        this.statistics = {};
    }

    /**
     * Obtiene información del algoritmo
     */
    getAlgorithmInfo() {
        return {
            name: 'Round Robin',
            type: 'Preemptive',
            quantum: this.quantum,
            description: `Round Robin con quantum de ${this.quantum} unidades de tiempo. Los procesos se ejecutan en turnos circulares.`
        };
    }
}
