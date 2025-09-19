/**
 * Módulo para manejar operaciones de Entrada/Salida (I/O)
 * Gestiona recursos, colas de recursos y estados de procesos
 */

class IOScheduler {
    constructor() {
        // Colas de recursos: { "R1": [proceso1, proceso2], "R2": [...], ... }
        this.resourceQueues = {};
        
        // Procesos actualmente usando recursos: { "R1": proceso, "R2": null, ... }
        this.resourcesInUse = {};
        
        // Timeline de eventos de E/S
        this.ioTimeline = [];
        
        // Estados de procesos: ready, running, blocked, terminated
        this.processStates = {};
    }
    
    /**
     * Inicializa el scheduler con la lista de procesos
     * @param {Array} processes - Lista de procesos
     */
    initialize(processes) {
        // Extraer todos los recursos únicos de las operaciones E/S
        const allResources = new Set();
        
        processes.forEach(process => {
            // Inicializar estado del proceso
            this.processStates[process.id] = 'ready';
            
            // Extraer recursos de las operaciones E/S
            process.ioOperations.forEach(operation => {
                allResources.add(operation.resource);
            });
        });
        
        // Inicializar colas de recursos
        allResources.forEach(resource => {
            this.resourceQueues[resource] = [];
            this.resourcesInUse[resource] = null;
        });
        
        console.log('🔧 IOScheduler inicializado con recursos:', Array.from(allResources));
    }
    
    /**
     * Verifica si un proceso necesita hacer E/S en el momento actual
     * @param {Object} process - Proceso a verificar
     * @returns {Object|null} - Operación E/S si debe hacerla, null si no
     */
    checkIONeeded(process) {
        if (!process.ioOperations || process.ioOperations.length === 0) {
            return null;
        }
        
        // Buscar la próxima operación E/S no completada
        const nextOperation = process.ioOperations.find(op => 
            !op.completed && op.startTime === process.cpuTimeUsed
        );
        
        return nextOperation || null;
    }
    
    /**
     * Inicia una operación de E/S para un proceso
     * @param {Object} process - Proceso que inicia E/S
     * @param {Object} operation - Operación E/S a realizar
     * @param {number} currentTime - Tiempo actual de la simulación
     */
    startIOOperation(process, operation, currentTime) {
        console.log(`📥 ${process.name} inicia E/S en ${operation.resource} en tiempo ${currentTime}`);
        
        // Cambiar estado del proceso a bloqueado
        this.processStates[process.id] = 'blocked';
        process.currentState = 'blocked';
        
        // Agregar a la cola del recurso
        this.resourceQueues[operation.resource].push({
            process: process,
            operation: operation,
            startTime: currentTime,
            endTime: currentTime + operation.duration
        });
        
        // Registrar evento en timeline
        this.ioTimeline.push({
            time: currentTime,
            processId: process.id,
            processName: process.name,
            action: 'io_start',
            resource: operation.resource,
            duration: operation.duration
        });
        
        // Si el recurso está libre, iniciar inmediatamente
        if (this.resourcesInUse[operation.resource] === null) {
            this.assignResource(operation.resource, currentTime);
        }
    }
    
    /**
     * Asigna un recurso al primer proceso en su cola
     * @param {string} resource - Nombre del recurso
     * @param {number} currentTime - Tiempo actual
     */
    assignResource(resource, currentTime) {
        const queue = this.resourceQueues[resource];
        if (queue.length === 0) {
            return;
        }
        
        // Tomar el primer proceso de la cola (FCFS para recursos)
        const ioRequest = queue.shift();
        this.resourcesInUse[resource] = ioRequest;
        
        console.log(`🔄 Recurso ${resource} asignado a ${ioRequest.process.name}`);
    }
    
    /**
     * Procesa las operaciones de E/S en el tiempo actual
     * @param {number} currentTime - Tiempo actual de la simulación
     * @returns {Array} - Procesos que completaron E/S y están listos
     */
    processIOOperations(currentTime) {
        const processesReady = [];
        
        // Verificar cada recurso en uso
        Object.keys(this.resourcesInUse).forEach(resource => {
            const ioRequest = this.resourcesInUse[resource];
            
            if (ioRequest && currentTime >= ioRequest.endTime) {
                // Operación E/S completada
                const process = ioRequest.process;
                const operation = ioRequest.operation;
                
                console.log(`📤 ${process.name} completa E/S en ${resource} en tiempo ${currentTime}`);
                
                // Marcar operación como completada
                operation.completed = true;
                
                // Cambiar estado del proceso a listo
                this.processStates[process.id] = 'ready';
                process.currentState = 'ready';
                
                // Liberar recurso
                this.resourcesInUse[resource] = null;
                
                // Registrar evento en timeline
                this.ioTimeline.push({
                    time: currentTime,
                    processId: process.id,
                    processName: process.name,
                    action: 'io_complete',
                    resource: resource
                });
                
                // Agregar a lista de procesos listos
                processesReady.push(process);
                
                // Asignar recurso al siguiente proceso en cola
                this.assignResource(resource, currentTime);
            }
        });
        
        return processesReady;
    }
    
    /**
     * Obtiene el estado actual de todas las colas de recursos
     * @returns {Object} - Estado de las colas de recursos
     */
    getResourceQueuesState() {
        const state = {};
        
        Object.keys(this.resourceQueues).forEach(resource => {
            state[resource] = {
                inUse: this.resourcesInUse[resource]?.process?.name || null,
                queue: this.resourceQueues[resource].map(req => req.process.name),
                queueLength: this.resourceQueues[resource].length
            };
        });
        
        return state;
    }
    
    /**
     * Obtiene el estado de un proceso específico
     * @param {number} processId - ID del proceso
     * @returns {string} - Estado del proceso
     */
    getProcessState(processId) {
        return this.processStates[processId] || 'unknown';
    }
    
    /**
     * Obtiene todos los procesos en un estado específico
     * @param {string} state - Estado a filtrar (ready, running, blocked, terminated)
     * @returns {Array} - IDs de procesos en ese estado
     */
    getProcessesByState(state) {
        return Object.keys(this.processStates)
            .filter(processId => this.processStates[processId] === state)
            .map(processId => parseInt(processId));
    }
    
    /**
     * Cambia el estado de un proceso
     * @param {number} processId - ID del proceso
     * @param {string} newState - Nuevo estado
     */
    setProcessState(processId, newState) {
        this.processStates[processId] = newState;
    }
    
    /**
     * Obtiene estadísticas de E/S
     * @returns {Object} - Estadísticas de operaciones E/S
     */
    getIOStatistics() {
        const stats = {
            totalIOOperations: this.ioTimeline.filter(event => event.action === 'io_start').length,
            totalIOTime: 0,
            resourceUtilization: {},
            averageWaitTimePerResource: {}
        };
        
        // Calcular utilización de recursos
        Object.keys(this.resourceQueues).forEach(resource => {
            const resourceEvents = this.ioTimeline.filter(event => event.resource === resource);
            const ioTime = resourceEvents
                .filter(event => event.action === 'io_start')
                .reduce((sum, event) => sum + event.duration, 0);
            
            stats.resourceUtilization[resource] = ioTime;
            stats.totalIOTime += ioTime;
        });
        
        return stats;
    }
    
    /**
     * Reinicia el scheduler de E/S
     */
    reset() {
        this.resourceQueues = {};
        this.resourcesInUse = {};
        this.ioTimeline = [];
        this.processStates = {};
        
        console.log('🔄 IOScheduler reiniciado');
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IOScheduler };
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.IOScheduler = IOScheduler;
}
