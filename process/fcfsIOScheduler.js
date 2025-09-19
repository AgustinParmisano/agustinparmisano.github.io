/**
 * Módulo para implementar FCFS (First Come, First Served) con soporte para operaciones de E/S
 * Integra completamente el manejo de estados y recursos de E/S
 */

class FCFSIOScheduler {
    constructor() {
        this.processes = [];
        this.timeline = [];
        this.readyQueue = [];
        this.ioScheduler = null;
        this.statistics = {};
    }

    /**
     * Ejecuta el algoritmo FCFS con E/S sobre una lista de procesos
     * @param {Array} processes - Lista de procesos a planificar
     * @returns {Object} - Resultado de la simulación
     */
    schedule(processes) {
        if (!processes || processes.length === 0) {
            throw new Error('No hay procesos para planificar');
        }

        console.log('=== INICIANDO FCFS CON E/S ===');

        // Limpiar estado anterior
        this.reset();

        // Inicializar procesos
        this.initializeProcesses(processes);
        
        // Inicializar IOScheduler
        this.ioScheduler = new IOScheduler();
        this.ioScheduler.initialize(this.processes);

        // Ejecutar simulación
        this.simulateFCFSWithIO();

        // Calcular estadísticas
        this.calculateStatistics();

        console.log('=== FCFS CON E/S COMPLETADO ===');

        return {
            processes: this.processes,
            timeline: this.timeline,
            readyQueue: this.getReadyQueueStates(),
            ioQueues: this.ioScheduler.getResourceQueuesState(),
            statistics: this.statistics,
            algorithm: 'FCFS_IO'
        };
    }

    /**
     * Inicializa los procesos con campos necesarios para E/S
     * @param {Array} processes - Lista de procesos originales
     */
    initializeProcesses(processes) {
        this.processes = [...processes].map(process => ({
            ...process,
            // Campos originales mantenidos
            startTime: null,
            finishTime: null,
            responseTime: null,
            waitTime: null,
            // Campos para E/S (si no existen)
            currentState: process.currentState || 'ready',
            cpuTimeUsed: process.cpuTimeUsed || 0,
            remainingCpuTime: process.remainingCpuTime || process.cpuTime,
            currentIOIndex: process.currentIOIndex || 0,
            ioOperations: process.ioOperations || []
        })).sort((a, b) => a.arrivalTime - b.arrivalTime);

        console.log('Procesos inicializados:', this.processes.map(p => ({
            name: p.name,
            cpuTime: p.cpuTime,
            arrivalTime: p.arrivalTime,
            ioOps: p.ioOperations.length,
            ioDetails: p.ioOperations
        })));
    }

    /**
     * Simula la ejecución de FCFS con manejo completo de E/S
     */
    simulateFCFSWithIO() {
        let currentTime = 0;
        let executingProcess = null;
        const maxTime = this.calculateMaxSimulationTime();
        
        console.log(`Simulación máxima hasta tiempo ${maxTime}`);

        while (currentTime < maxTime && !this.allProcessesCompleted()) {
            console.log(`\n🕐 === Tiempo ${currentTime} ===`);

        // 1. Procesar operaciones de E/S que terminan
        const processesFromIO = this.ioScheduler.processIOOperations(currentTime);
        processesFromIO.forEach(process => {
            this.readyQueue.push(process);
            console.log(`📥 ${process.name} vuelve de E/S a Ready Queue`);
            
            // Registrar regreso de E/S en timeline
            this.timeline.push({
                time: currentTime,
                processId: process.id,
                processName: process.name,
                action: 'io_complete',
                state: 'ready'
            });
        });

            // 2. Agregar procesos que llegan al sistema
            this.addArrivingProcesses(currentTime);

            // 3. Si no hay proceso ejecutándose, seleccionar uno de la cola
            if (!executingProcess && this.readyQueue.length > 0) {
                executingProcess = this.selectNextProcess();
                this.startProcessExecution(executingProcess, currentTime);
            }

            // 4. Ejecutar proceso actual (si hay alguno)
            if (executingProcess) {
                const shouldContinue = this.executeProcessStep(executingProcess, currentTime);
                
                if (!shouldContinue) {
                    // Proceso terminó o fue bloqueado por E/S
                    executingProcess = null;
                }
            }

            // 5. Registrar estado actual para visualización
            this.recordCurrentState(currentTime, executingProcess);

            currentTime++;
        }

        console.log(`Simulación terminada en tiempo ${currentTime}`);
    }

    /**
     * Agrega procesos que llegan en el tiempo actual
     * @param {number} currentTime - Tiempo actual
     */
    addArrivingProcesses(currentTime) {
        const arriving = this.processes.filter(process => 
            process.arrivalTime === currentTime && 
            process.currentState === 'ready' &&
            !this.readyQueue.includes(process)
        );

        arriving.forEach(process => {
            this.readyQueue.push(process);
            this.ioScheduler.setProcessState(process.id, 'ready');
            console.log(`🚀 ${process.name} llega al sistema`);
        });
    }

    /**
     * Selecciona el siguiente proceso según FCFS (primero en llegar)
     * @returns {Object} - Proceso seleccionado
     */
    selectNextProcess() {
        // FCFS: tomar el primer proceso de la cola (ya están ordenados por llegada)
        const process = this.readyQueue.shift();
        this.ioScheduler.setProcessState(process.id, 'running');
        process.currentState = 'running';
        
        console.log(`⚡ Seleccionado para ejecución: ${process.name}`);
        return process;
    }

    /**
     * Inicia la ejecución de un proceso
     * @param {Object} process - Proceso a iniciar
     * @param {number} currentTime - Tiempo actual
     */
    startProcessExecution(process, currentTime) {
        if (process.startTime === null) {
            process.startTime = currentTime;
            process.waitTime = currentTime - process.arrivalTime;
            console.log(`🎬 ${process.name} inicia ejecución (TE: ${process.waitTime})`);
        } else {
            console.log(`🔄 ${process.name} reanuda ejecución`);
        }
    }

    /**
     * Ejecuta un paso de un proceso (una unidad de tiempo CPU)
     * @param {Object} process - Proceso ejecutándose
     * @param {number} currentTime - Tiempo actual
     * @returns {boolean} - true si debe continuar ejecutándose, false si termina/bloquea
     */
    executeProcessStep(process, currentTime) {
        // Registrar en timeline
        this.timeline.push({
            time: currentTime,
            processId: process.id,
            processName: process.name,
            action: 'cpu_execution',
            state: 'running'
        });

        // Incrementar tiempo CPU usado
        process.cpuTimeUsed++;
        process.remainingCpuTime--;

        console.log(`💻 ${process.name} ejecuta CPU (${process.cpuTimeUsed}/${process.cpuTime})`);

        // Verificar si necesita hacer E/S
        const ioOperation = this.ioScheduler.checkIONeeded(process);
        if (ioOperation) {
            console.log(`🔄 ${process.name} necesita E/S: ${ioOperation.resource}`);
            
            // Registrar inicio de E/S en timeline - esto reemplaza la ejecución CPU
            this.registerIOExecution(process, ioOperation, currentTime);
            
            // Iniciar operación E/S
            this.ioScheduler.startIOOperation(process, ioOperation, currentTime);
            
            // Proceso ya no está ejecutándose en CPU
            return false;
        }

        // Verificar si el proceso terminó
        if (process.remainingCpuTime === 0) {
            this.completeProcess(process, currentTime);
            return false;
        }

        return true; // Continúa ejecutándose
    }

    /**
     * Completa un proceso
     * @param {Object} process - Proceso a completar
     * @param {number} currentTime - Tiempo actual
     */
    completeProcess(process, currentTime) {
        process.finishTime = currentTime + 1;
        process.responseTime = process.finishTime - process.arrivalTime;
        process.currentState = 'terminated';
        this.ioScheduler.setProcessState(process.id, 'terminated');

        // Registrar finalización en timeline
        this.timeline.push({
            time: currentTime,
            processId: process.id,
            processName: process.name,
            action: 'process_complete',
            state: 'terminated'
        });

        console.log(`🏁 ${process.name} terminado (TR: ${process.responseTime})`);
    }
    
    /**
     * Registra la ejecución de E/S en el timeline para cada unidad de tiempo
     * @param {Object} process - Proceso que hace E/S
     * @param {Object} ioOperation - Operación de E/S
     * @param {number} startTime - Tiempo de inicio
     */
    registerIOExecution(process, ioOperation, startTime) {
        // Registrar cada unidad de tiempo de la operación E/S
        for (let t = 0; t < ioOperation.duration; t++) {
            this.timeline.push({
                time: startTime + t,
                processId: process.id,
                processName: process.name,
                action: `io_execution`,
                state: 'blocked',
                resource: ioOperation.resource,
                ioSequence: this.getIOSequenceForProcess(process, ioOperation)
            });
        }
    }
    
    /**
     * Obtiene el número de secuencia de E/S para un proceso
     * @param {Object} process - Proceso
     * @param {Object} ioOperation - Operación actual
     * @returns {string} - Secuencia de E/S
     */
    getIOSequenceForProcess(process, ioOperation) {
        // Contar cuántas operaciones E/S ha completado este proceso
        const completedIOOps = process.ioOperations.filter(op => op.completed).length;
        return `IO${completedIOOps + 1}`;
    }

    /**
     * Registra el estado actual para visualización
     * @param {number} currentTime - Tiempo actual
     * @param {Object} executingProcess - Proceso ejecutándose
     */
    recordCurrentState(currentTime, executingProcess) {
        // Solo registrar si hay algo que mostrar
        if (this.readyQueue.length > 0) {
            // Estado de ready queue para gantt chart
            // (implementar según necesidades de visualización)
        }
    }

    /**
     * Calcula el tiempo máximo de simulación
     * @returns {number} - Tiempo máximo estimado
     */
    calculateMaxSimulationTime() {
        const maxArrival = Math.max(...this.processes.map(p => p.arrivalTime));
        const totalCpuTime = this.processes.reduce((sum, p) => sum + p.cpuTime, 0);
        const totalIOTime = this.processes.reduce((sum, p) => {
            return sum + p.ioOperations.reduce((ioSum, op) => ioSum + op.duration, 0);
        }, 0);
        
        // Estimación conservadora
        return maxArrival + totalCpuTime + totalIOTime + 50;
    }

    /**
     * Verifica si todos los procesos han terminado
     * @returns {boolean} - true si todos terminaron
     */
    allProcessesCompleted() {
        return this.processes.every(p => p.currentState === 'terminated');
    }

    /**
     * Obtiene el estado de las ready queues para visualización
     * @returns {Object} - Estados de colas para el diagrama
     */
    getReadyQueueStates() {
        // Implementar según necesidades del gantt chart
        return {};
    }

    /**
     * Calcula estadísticas de la simulación
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
                ioUtilization: 0
            };
            return;
        }

        // Calcular estadísticas de CPU
        const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.responseTime, 0);
        const totalWaitTime = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0);
        
        const averageTurnaroundTime = totalTurnaroundTime / completedProcesses.length;
        const averageWaitTime = totalWaitTime / completedProcesses.length;

        const simulationEndTime = Math.max(...completedProcesses.map(p => p.finishTime));
        const simulationStartTime = Math.min(...this.processes.map(p => p.arrivalTime));
        const throughput = completedProcesses.length / (simulationEndTime - simulationStartTime);

        const totalCpuTime = completedProcesses.reduce((sum, p) => sum + p.cpuTime, 0);
        const cpuUtilization = (totalCpuTime / simulationEndTime) * 100;

        // Estadísticas de E/S
        const ioStats = this.ioScheduler.getIOStatistics();
        const ioUtilization = (ioStats.totalIOTime / simulationEndTime) * 100;

        this.statistics = {
            averageResponseTime: Number(averageTurnaroundTime.toFixed(2)),
            averageWaitTime: Number(averageWaitTime.toFixed(2)),
            averageTurnaroundTime: Number(averageTurnaroundTime.toFixed(2)),
            throughput: Number(throughput.toFixed(2)),
            cpuUtilization: Number(cpuUtilization.toFixed(2)),
            ioUtilization: Number(ioUtilization.toFixed(2)),
            totalProcesses: completedProcesses.length,
            simulationTime: simulationEndTime,
            totalIOOperations: ioStats.totalIOOperations,
            resourceUtilization: ioStats.resourceUtilization
        };

        console.log('\n📊 Estadísticas finales:', this.statistics);
    }

    /**
     * Reinicia el scheduler
     */
    reset() {
        this.processes = [];
        this.timeline = [];
        this.readyQueue = [];
        this.statistics = {};
        
        if (this.ioScheduler) {
            this.ioScheduler.reset();
        }
    }
}

// Función de utilidad para ejecutar FCFS con E/S
function runFCFSWithIO(processes) {
    try {
        const scheduler = new FCFSIOScheduler();
        return scheduler.schedule(processes);
    } catch (error) {
        console.error('Error en FCFS con E/S:', error);
        throw error;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FCFSIOScheduler, runFCFSWithIO };
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.FCFSIOScheduler = FCFSIOScheduler;
    window.runFCFSWithIO = runFCFSWithIO;
}
