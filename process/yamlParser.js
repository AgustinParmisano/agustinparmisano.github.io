/**
 * Módulo para parsear archivos YAML con información de procesos
 */

class YAMLParser {
    constructor() {
        this.processes = [];
    }

    /**
     * Parsea un archivo YAML y extrae la información de los procesos
     * @param {string} yamlContent - Contenido del archivo YAML
     * @returns {Array} - Array de objetos proceso
     */
    parseYAML(yamlContent) {
        try {
            // Usar js-yaml para parsear el contenido
            const data = jsyaml.load(yamlContent);
            
            // Validar estructura del YAML
            if (!data.processes || !Array.isArray(data.processes)) {
                throw new Error('El archivo YAML debe contener una lista de procesos');
            }

            this.processes = data.processes.map((process, index) => {
                // Validar campos requeridos
                if (!process.name) {
                    throw new Error(`Proceso en índice ${index} no tiene nombre`);
                }
                if (typeof process.cpu_time !== 'number') {
                    throw new Error(`Proceso ${process.name} no tiene tiempo de CPU válido`);
                }
                if (typeof process.arrival_time !== 'number') {
                    throw new Error(`Proceso ${process.name} no tiene tiempo de llegada válido`);
                }

                // Parsear operaciones de E/S si existen
                const ioOperations = this.parseIOOperations(process.io_operations || []);
                
                return {
                    id: process.id || index + 1,
                    name: process.name,
                    cpuTime: process.cpu_time,
                    arrivalTime: process.arrival_time,
                    priority: process.priority || null,
                    ioOperations: ioOperations, // Nuevas operaciones E/S
                    // Campos calculados que se llenarán después
                    startTime: null,
                    finishTime: null,
                    responseTime: null,
                    waitTime: null,
                    // Campos para manejo de E/S
                    currentState: 'ready', // ready, running, blocked, terminated
                    cpuTimeUsed: 0, // Tiempo de CPU usado hasta ahora
                    remainingCpuTime: process.cpu_time, // Tiempo de CPU restante
                    currentIOIndex: 0 // Índice de la próxima operación E/S
                };
            });

            // No ordenar automáticamente - cada algoritmo decide su ordenación
            return this.processes;
        } catch (error) {
            console.error('Error al parsear YAML:', error);
            throw new Error(`Error al parsear archivo YAML: ${error.message}`);
        }
    }

    /**
     * Lee un archivo YAML desde el input file
     * @param {File} file - Archivo seleccionado por el usuario
     * @returns {Promise<Array>} - Promise que resuelve con la lista de procesos
     */
    async readYAMLFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No se ha seleccionado ningún archivo'));
                return;
            }

            if (!file.name.endsWith('.yml') && !file.name.endsWith('.yaml')) {
                reject(new Error('Por favor seleccione un archivo YAML válido (.yml o .yaml)'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const yamlContent = e.target.result;
                    const processes = this.parseYAML(yamlContent);
                    resolve(processes);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Genera un ejemplo de YAML para pruebas
     * @returns {string} - Contenido YAML de ejemplo
     */
    getExampleYAML() {
        return `# Ejemplo de archivo YAML para simulador FCFS
# Basado en la imagen proporcionada

processes:
  - id: 1
    name: "P1"
    cpu_time: 9
    arrival_time: 0
    
  - id: 2
    name: "P2"
    cpu_time: 5
    arrival_time: 1
    
  - id: 3
    name: "P3"
    cpu_time: 3
    arrival_time: 2
    
  - id: 4
    name: "P4"
    cpu_time: 7
    arrival_time: 3

# Configuración adicional (opcional)
algorithm: "FCFS"
time_quantum: null  # No aplica para FCFS
`;
    }

    /**
     * Crea y descarga un archivo YAML de ejemplo
     */
    downloadExampleYAML() {
        const yamlContent = this.getExampleYAML();
        const blob = new Blob([yamlContent], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ejemplo_procesos.yaml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Parsea las operaciones de E/S de un proceso
     * @param {Array|string} ioData - Datos de E/S del YAML
     * @returns {Array} - Array de operaciones E/S parseadas
     */
    parseIOOperations(ioData) {
        if (!ioData || ioData.length === 0) {
            return [];
        }
        
        // Si es string, parsear formato: "(R1,2,1)(R2,3,1)"
        if (typeof ioData === 'string') {
            return this.parseIOString(ioData);
        }
        
        // Si es array, cada elemento debe ser un objeto
        if (Array.isArray(ioData)) {
            return ioData.map((op, index) => {
                if (typeof op.resource !== 'string') {
                    throw new Error(`Operación E/S ${index}: recurso debe ser string`);
                }
                if (typeof op.start_time !== 'number' || op.start_time < 0) {
                    throw new Error(`Operación E/S ${index}: start_time debe ser número >= 0`);
                }
                if (typeof op.duration !== 'number' || op.duration <= 0) {
                    throw new Error(`Operación E/S ${index}: duration debe ser número > 0`);
                }
                
                return {
                    resource: op.resource,
                    cpuTimeBeforeIO: op.start_time, // Tiempo relativo al inicio del proceso
                    startTime: op.start_time, // Mantener compatibilidad
                    duration: op.duration,
                    completed: false
                };
            });
        }
        
        throw new Error('Las operaciones E/S deben ser string o array');
    }
    
    /**
     * Parsea operaciones E/S en formato string: "(R1,2,1)(R2,3,1)"
     * @param {string} ioString - String con operaciones E/S
     * @returns {Array} - Array de operaciones parseadas
     */
    parseIOString(ioString) {
        const operations = [];
        
        // Regex para encontrar patrones (Recurso,tiempo,duracion)
        const regex = /\(([^,]+),(\d+),(\d+)\)/g;
        let match;
        
        while ((match = regex.exec(ioString)) !== null) {
            const [, resource, startTime, duration] = match;
            
            operations.push({
                resource: resource.trim(),
                cpuTimeBeforeIO: parseInt(startTime),
                startTime: parseInt(startTime), // Mantener compatibilidad
                duration: parseInt(duration),
                completed: false
            });
        }
        
        return operations;
    }
    
    /**
     * Valida que un proceso tenga todos los campos necesarios
     * @param {Object} process - Objeto proceso a validar
     * @returns {boolean} - True si es válido
     */
    validateProcess(process) {
        const requiredFields = ['name', 'cpuTime', 'arrivalTime'];
        
        for (const field of requiredFields) {
            if (process[field] === undefined || process[field] === null) {
                return false;
            }
        }

        // Validar tipos de datos
        if (typeof process.cpuTime !== 'number' || process.cpuTime <= 0) {
            return false;
        }
        
        if (typeof process.arrivalTime !== 'number' || process.arrivalTime < 0) {
            return false;
        }

        return true;
    }

    /**
     * Obtiene los procesos parseados
     * @returns {Array} - Lista de procesos
     */
    getProcesses() {
        return this.processes;
    }

    /**
     * Limpia los procesos almacenados
     */
    clearProcesses() {
        this.processes = [];
    }

    /**
     * Carga procesos desde el ejemplo de la imagen
     * @returns {Array} - Lista de procesos del ejemplo
     */
    loadExampleProcesses() {
        const exampleYAML = this.getExampleYAML();
        return this.parseYAML(exampleYAML);
    }

    /**
     * Genera un ejemplo de YAML específico para SJF
     * @returns {string} - Contenido YAML de ejemplo para SJF
     */
    getSJFExampleYAML() {
        return `# Ejemplo de archivo YAML para simulador SJF
# Datos optimizados para mostrar las diferencias con FCFS

processes:
  - id: 1
    name: "P1"
    cpu_time: 6
    arrival_time: 0
    
  - id: 2
    name: "P2"
    cpu_time: 8
    arrival_time: 0
    
  - id: 3
    name: "P3"
    cpu_time: 7
    arrival_time: 0
    
  - id: 4
    name: "P4"
    cpu_time: 3
    arrival_time: 0

# Con SJF, el orden de ejecución será: P4(3), P1(6), P3(7), P2(8)
# Con FCFS, el orden sería: P1(6), P2(8), P3(7), P4(3)
# Esto muestra claramente las diferencias entre ambos algoritmos

algorithm: "SJF"
time_quantum: null  # No aplica para SJF no preemptivo
`;
    }

    /**
     * Carga procesos desde el ejemplo SJF
     * @returns {Array} - Lista de procesos del ejemplo SJF
     */
    loadSJFExampleProcesses() {
        const sjfExampleYAML = this.getSJFExampleYAML();
        return this.parseYAML(sjfExampleYAML);
    }

    /**
     * Genera un ejemplo de YAML específico para Round Robin
     * @returns {string} - Contenido YAML de ejemplo para Round Robin
     */
    getRoundRobinExampleYAML() {
        return `# Ejemplo de archivo YAML para simulador Round Robin
# Datos optimizados para mostrar características de preemptividad

processes:
  - id: 1
    name: "P1"
    cpu_time: 7
    arrival_time: 0
    
  - id: 2
    name: "P2"
    cpu_time: 4
    arrival_time: 2
    
  - id: 3
    name: "P3"
    cpu_time: 9
    arrival_time: 4
    
  - id: 4
    name: "P4"
    cpu_time: 5
    arrival_time: 5

# Configuración para Round Robin
algorithm: "Round Robin"
quantum: 3

# Este ejemplo demuestra:
# - Naturaleza preemptiva del algoritmo
# - Fairness en el tiempo de CPU
# - Rotación circular de procesos
# - Mejora en tiempo de respuesta vs FCFS
`;
    }

    /**
     * Carga procesos desde el ejemplo Round Robin
     * @returns {Array} - Lista de procesos del ejemplo Round Robin
     */
    loadRoundRobinExampleProcesses() {
        const rrExampleYAML = this.getRoundRobinExampleYAML();
        return this.parseYAML(rrExampleYAML);
    }

    /**
     * Genera un ejemplo de YAML específico para Priority Scheduling
     * @returns {string} - Contenido YAML de ejemplo para Priority
     */
    getPriorityExampleYAML() {
        return `# Ejemplo de archivo YAML para Priority Scheduling
# Los números de prioridad menores indican mayor prioridad

processes:
  - id: 1
    name: "P1"
    cpu_time: 8
    arrival_time: 0
    priority: 3
    
  - id: 2
    name: "P2"
    cpu_time: 4
    arrival_time: 1
    priority: 1
    
  - id: 3
    name: "P3"
    cpu_time: 9
    arrival_time: 2
    priority: 4
    
  - id: 4
    name: "P4"
    cpu_time: 5
    arrival_time: 3
    priority: 2

# Configuración para Priority Scheduling
algorithm: "Priority Scheduling"
preemptive: false  # Implementación no preemptiva

# Orden de ejecución esperado basado en prioridades:
# P1 (llega en 0, prioridad 3) - se ejecuta primero porque no hay otros
# P2 (llega en 1, prioridad 1) - mayor prioridad, pero P1 ya está ejecutando
# Después de P1: P2 (prioridad 1), luego P4 (prioridad 2), finalmente P3 (prioridad 4)
`;
    }

    /**
     * Carga procesos desde el ejemplo Priority Scheduling
     * @returns {Array} - Lista de procesos del ejemplo Priority
     */
    loadPriorityExampleProcesses() {
        const priorityExampleYAML = this.getPriorityExampleYAML();
        return this.parseYAML(priorityExampleYAML);
    }

    /**
     * Genera un ejemplo de YAML específico para Priority Preemptive Scheduling
     * @returns {string} - Contenido YAML de ejemplo para Priority Preemptive
     */
    getPriorityPreemptiveExampleYAML() {
        return `# Ejemplo de archivo YAML para Priority Preemptive Scheduling
# Diseñado para mostrar las características de preempción por prioridad

processes:
  - id: 1
    name: "P1"
    cpu_time: 10
    arrival_time: 0
    priority: 3
    
  - id: 2
    name: "P2"
    cpu_time: 1
    arrival_time: 1
    priority: 1
    
  - id: 3
    name: "P3"
    cpu_time: 2
    arrival_time: 2
    priority: 4
    
  - id: 4
    name: "P4"
    cpu_time: 1
    arrival_time: 3
    priority: 2

# Configuración para Priority Preemptive Scheduling
algorithm: "Priority Preemptive Scheduling"
preemptive: true

# Comportamiento esperado:
# Tiempo 0-1: P1 ejecuta (prioridad 3)
# Tiempo 1-2: P2 interrumpe a P1 (prioridad 1 > prioridad 3) y se ejecuta
# Tiempo 2-3: P1 reanuda (prioridad 3 > prioridad 4 de P3)
# Tiempo 3-4: P4 interrumpe a P1 (prioridad 2 > prioridad 3)
# Tiempo 4-6: P3 ejecuta (P4 terminó, prioridad 4 < prioridad 3 de P1)
# Tiempo 6-14: P1 termina de ejecutar

# Este ejemplo demuestra:
# - Preempción inmediata cuando llega un proceso de mayor prioridad
# - Reanudación de procesos interrumpidos
# - Múltiples cambios de contexto
# - Mejor tiempo de respuesta para procesos de alta prioridad
`;
    }

    /**
     * Carga procesos desde el ejemplo Priority Preemptive Scheduling
     * @returns {Array} - Lista de procesos del ejemplo Priority Preemptive
     */
    loadPriorityPreemptiveExampleProcesses() {
        const priorityPreemptiveExampleYAML = this.getPriorityPreemptiveExampleYAML();
        return this.parseYAML(priorityPreemptiveExampleYAML);
    }
    
    /**
     * Genera un ejemplo de YAML con operaciones de E/S (basado en la imagen)
     * @returns {string} - Contenido YAML de ejemplo con E/S
     */
    getIOExampleYAML() {
        return `# Ejemplo de archivo YAML con operaciones de Entrada/Salida
# Basado en la imagen proporcionada - FCFS con E/S

processes:
  - id: 1
    name: "P1"
    cpu_time: 4
    arrival_time: 0
    io_operations: "(R1,2,1)"  # Recurso R1, inicia en CPU tiempo 2, dura 1
    
  - id: 2
    name: "P2"
    cpu_time: 6
    arrival_time: 2
    io_operations: "(R2,3,1)(R2,5,1)"  # Dos operaciones en R2
    
  - id: 3
    name: "P3"
    cpu_time: 4
    arrival_time: 3
    # Sin operaciones E/S
    
  - id: 4
    name: "P4"
    cpu_time: 5
    arrival_time: 6
    io_operations: "(R3,1,2)(R3,3,1)"  # R3 al inicio y después
    
  - id: 5
    name: "P5"
    cpu_time: 2
    arrival_time: 8
    # Sin operaciones E/S

# Configuración para FCFS con E/S
algorithm: "FCFS_IO"
io_enabled: true

# Explicación del formato E/S:
# (Recurso,TiempoInicio,Duración)
# - Recurso: Identificador del recurso (R1, R2, R3, etc.)
# - TiempoInicio: Tiempo relativo al inicio de ejecución del proceso
# - Duración: Tiempo que toma la operación E/S

# Comportamiento esperado:
# - Cuando un proceso llega al momento de E/S, se bloquea
# - Pasa a la cola del recurso correspondiente
# - El CPU pasa al siguiente proceso listo
# - Después de completar E/S, el proceso vuelve a la cola de listos
`;
    }
    
    /**
     * Carga procesos desde el ejemplo con E/S
     * @returns {Array} - Lista de procesos del ejemplo con E/S
     */
    loadIOExampleProcesses() {
        const ioExampleYAML = this.getIOExampleYAML();
        return this.parseYAML(ioExampleYAML);
    }
}

// Exportar para uso en otros módulos
window.YAMLParser = YAMLParser;
