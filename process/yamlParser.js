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

                return {
                    id: process.id || index + 1,
                    name: process.name,
                    cpuTime: process.cpu_time,
                    arrivalTime: process.arrival_time,
                    // Campos calculados que se llenarán después
                    startTime: null,
                    finishTime: null,
                    responseTime: null,
                    waitTime: null
                };
            });

            // Ordenar procesos por tiempo de llegada (FCFS)
            this.processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

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
}

// Exportar para uso en otros módulos
window.YAMLParser = YAMLParser;