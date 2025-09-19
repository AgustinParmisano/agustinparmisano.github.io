/**
 * Archivo principal del simulador de procesos FCFS
 * Integra todos los módulos y maneja la interfaz de usuario
 */

class ProcessSimulator {
    constructor() {
        this.yamlParser = new YAMLParser();
        this.fcfsScheduler = new FCFSScheduler();
        this.fcfsIOScheduler = new FCFSIOScheduler();
        this.sjfScheduler = new SJFScheduler();
        this.roundRobinScheduler = new RoundRobinScheduler();
        this.priorityScheduler = new PriorityScheduler([]);
        this.ganttChart = new GanttChart();
        
        this.currentProcesses = [];
        this.simulationResult = null;
        this.selectedAlgorithm = 'fcfs'; // Algoritmo por defecto
        
        this.initialize();
    }

    /**
     * Inicializa el simulador y configura los eventos
     */
    initialize() {
        try {
            // Inicializar el diagrama de Gantt
            this.ganttChart.initialize('ganttChart');
            
            // Configurar eventos de la interfaz
            this.setupEventListeners();
            
            // Mostrar mensaje inicial
            this.showInitialMessage();
            
        } catch (error) {
            console.error('Error al inicializar el simulador:', error);
            this.showError('Error al inicializar el simulador: ' + error.message);
        }
    }

    /**
     * Configura todos los event listeners de la interfaz
     */
    setupEventListeners() {
        // Botón para cargar archivo YAML
        const fileInput = document.getElementById('yamlFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files[0]);
            });
        }

        // Selector de algoritmo
        const algorithmSelect = document.getElementById('algorithmSelect');
        if (algorithmSelect) {
            algorithmSelect.addEventListener('change', (e) => {
                this.handleAlgorithmChange(e.target.value);
            });
        }

        // Botón para cargar ejemplo FCFS
        const loadExampleBtn = document.getElementById('loadExample');
        if (loadExampleBtn) {
            loadExampleBtn.addEventListener('click', () => {
                this.loadExample('fcfs');
            });
        }

        // Botón para cargar ejemplo SJF
        const loadSJFExampleBtn = document.getElementById('loadSJFExample');
        if (loadSJFExampleBtn) {
            loadSJFExampleBtn.addEventListener('click', () => {
                this.loadExample('sjf');
            });
        }

        // Botón para cargar ejemplo Round Robin
        const loadRRExampleBtn = document.getElementById('loadRRExample');
        if (loadRRExampleBtn) {
            loadRRExampleBtn.addEventListener('click', () => {
                this.loadExample('rr');
            });
        }

        // Botón para cargar ejemplo Priority
        const loadPriorityExampleBtn = document.getElementById('loadPriorityExample');
        if (loadPriorityExampleBtn) {
            loadPriorityExampleBtn.addEventListener('click', () => {
                this.loadExample('priority');
            });
        }

        // Botón para cargar ejemplo Priority Preemptive
        const loadPriorityPreemptiveExampleBtn = document.getElementById('loadPriorityPreemptiveExample');
        if (loadPriorityPreemptiveExampleBtn) {
            loadPriorityPreemptiveExampleBtn.addEventListener('click', () => {
                this.loadExample('priority-preemptive');
            });
        }

        // Botón para cargar ejemplo FCFS con E/S
        const loadFCFSIOExampleBtn = document.getElementById('loadFCFSIOExample');
        if (loadFCFSIOExampleBtn) {
            loadFCFSIOExampleBtn.addEventListener('click', () => {
                this.loadExample('fcfs-io');
            });
        }

        // Botón para simular
        const simulateBtn = document.getElementById('simulate');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                this.runSimulation();
            });
        }

        // Agregar evento de drag & drop para archivos YAML
        this.setupDragAndDrop();
    }

    /**
     * Configura funcionalidad de drag & drop
     */
    setupDragAndDrop() {
        const container = document.querySelector('.input-section');
        if (!container) return;

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });
    }

    /**
     * Maneja la selección de archivo YAML
     * @param {File} file - Archivo seleccionado
     */
    async handleFileSelection(file) {
        if (!file) {
            this.showError('No se seleccionó ningún archivo');
            return;
        }

        try {
            this.showLoading('Cargando archivo...');
            
            // Parsear el archivo YAML
            this.currentProcesses = await this.yamlParser.readYAMLFile(file);
            
            this.hideLoading();
            this.showSuccess(`Archivo cargado exitosamente. ${this.currentProcesses.length} procesos encontrados.`);
            
            // Mostrar procesos en la tabla
            this.updateProcessTable(this.currentProcesses);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Error al cargar archivo: ' + error.message);
        }
    }

    /**
     * Maneja el cambio de algoritmo
     * @param {string} algorithm - Algoritmo seleccionado
     */
    handleAlgorithmChange(algorithm) {
        this.selectedAlgorithm = algorithm;
        
        // Actualizar título
        const algorithmTitle = document.getElementById('algorithmTitle');
        if (algorithmTitle) {
            if (algorithm === 'fcfs') {
                algorithmTitle.textContent = 'Algoritmo FCFS (First Come, First Served)';
            } else if (algorithm === 'sjf') {
                algorithmTitle.textContent = 'Algoritmo SJF (Shortest Job First)';
            } else if (algorithm === 'rr') {
                algorithmTitle.textContent = 'Algoritmo Round Robin';
            } else if (algorithm === 'priority') {
                algorithmTitle.textContent = 'Algoritmo Priority Scheduling (Non-Preemptive)';
            } else if (algorithm === 'priority-preemptive') {
                algorithmTitle.textContent = 'Algoritmo Priority Scheduling (Preemptive)';
            }
        }
        
        // Mostrar/ocultar control de quantum
        const quantumInput = document.getElementById('quantumInput');
        if (quantumInput) {
            if (algorithm === 'rr') {
                quantumInput.style.display = 'flex';
            } else {
                quantumInput.style.display = 'none';
            }
        }
        
        // Mostrar/ocultar columna de prioridad
        const priorityColumn = document.getElementById('priorityColumn');
        if (priorityColumn) {
            if (algorithm === 'priority' || algorithm === 'priority-preemptive') {
                priorityColumn.style.display = 'table-cell';
            } else {
                priorityColumn.style.display = 'none';
            }
        }
        
        // Mostrar/ocultar columna de E/S
        const ioColumn = document.getElementById('ioColumn');
        if (ioColumn) {
            // Mostrar columna E/S si hay procesos con operaciones de E/S
            const hasIO = this.currentProcesses.some(p => 
                p.ioOperations && p.ioOperations.length > 0
            );
            if (hasIO || algorithm === 'fcfs-io') {
                ioColumn.style.display = 'table-cell';
            } else {
                ioColumn.style.display = 'none';
            }
        }
        
        // Limpiar resultados anteriores si existen
        if (this.simulationResult) {
            this.reset();
        }
        
        this.showSuccess(`Algoritmo cambiado a ${algorithm.toUpperCase()}`);
    }

    /**
     * Carga el ejemplo de procesos
     * @param {string} algorithmType - Tipo de algoritmo para el ejemplo
     */
    loadExample(algorithmType = null) {
        try {
            this.showLoading('Cargando ejemplo...');
            
            // Usar el algoritmo especificado o el seleccionado actualmente
            const algorithm = algorithmType || this.selectedAlgorithm;
            
            // Cargar procesos del ejemplo según el algoritmo
            if (algorithm === 'sjf') {
                this.currentProcesses = this.yamlParser.loadSJFExampleProcesses();
            } else if (algorithm === 'rr') {
                this.currentProcesses = this.yamlParser.loadRoundRobinExampleProcesses();
            } else if (algorithm === 'priority') {
                this.currentProcesses = this.yamlParser.loadPriorityExampleProcesses();
            } else if (algorithm === 'priority-preemptive') {
                this.currentProcesses = this.yamlParser.loadPriorityPreemptiveExampleProcesses();
            } else if (algorithm === 'fcfs-io') {
                this.currentProcesses = this.yamlParser.loadIOExampleProcesses();
            } else {
                this.currentProcesses = this.yamlParser.loadExampleProcesses();
            }
            
            // Sincronizar selector de algoritmo
            const algorithmSelect = document.getElementById('algorithmSelect');
            if (algorithmSelect) {
                // Para fcfs-io, usar fcfs como algoritmo base
                const selectValue = algorithm === 'fcfs-io' ? 'fcfs' : algorithm;
                if (algorithmSelect.value !== selectValue) {
                    algorithmSelect.value = selectValue;
                    this.handleAlgorithmChange(selectValue);
                }
            }
            
            // Si es fcfs-io, forzar que se muestren las columnas E/S
            if (algorithm === 'fcfs-io') {
                this.selectedAlgorithm = 'fcfs'; // Mantener fcfs como algoritmo
                this.updateIOColumnVisibility(); // Forzar mostrar columna E/S
            }
            
            this.hideLoading();
            this.showSuccess(`Ejemplo ${algorithm.toUpperCase()} cargado exitosamente. ${this.currentProcesses.length} procesos cargados.`);
            
            // Mostrar procesos en la tabla
            this.updateProcessTable(this.currentProcesses);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Error al cargar ejemplo: ' + error.message);
        }
    }

    /**
     * Ejecuta la simulación del algoritmo seleccionado
     */
    runSimulation() {
        if (!this.currentProcesses || this.currentProcesses.length === 0) {
            this.showError('Primero debe cargar un archivo YAML o el ejemplo');
            return;
        }

        try {
            this.showLoading(`Ejecutando simulación ${this.selectedAlgorithm.toUpperCase()}...`);
            
            // Ejecutar algoritmo seleccionado
            let scheduler;
            // Verificar si los procesos tienen E/S para usar scheduler apropiado
            const hasIOOperations = this.currentProcesses.some(p => 
                p.ioOperations && p.ioOperations.length > 0
            );
            
            if (this.selectedAlgorithm === 'sjf') {
                scheduler = this.sjfScheduler;
                this.simulationResult = scheduler.schedule(this.currentProcesses);
            } else if (this.selectedAlgorithm === 'rr') {
                scheduler = this.roundRobinScheduler;
                const quantumValue = document.getElementById('quantumValue')?.value || 2;
                this.simulationResult = scheduler.schedule(this.currentProcesses, parseInt(quantumValue));
            } else if (this.selectedAlgorithm === 'priority') {
                this.simulationResult = runPriorityScheduling(this.currentProcesses);
            } else if (this.selectedAlgorithm === 'priority-preemptive') {
                this.simulationResult = runPreemptivePriorityScheduling(this.currentProcesses);
            } else {
                // FCFS: usar scheduler con E/S si hay operaciones de E/S
                if (hasIOOperations) {
                    scheduler = this.fcfsIOScheduler;
                    this.simulationResult = scheduler.schedule(this.currentProcesses);
                } else {
                    scheduler = this.fcfsScheduler;
                    this.simulationResult = scheduler.schedule(this.currentProcesses);
                }
            }
            
            // Actualizar todas las visualizaciones
            this.updateAllDisplays();
            
            this.hideLoading();
            this.showSuccess(`Simulación ${this.selectedAlgorithm.toUpperCase()} completada exitosamente`);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Error en la simulación: ' + error.message);
        }
    }

    /**
     * Actualiza todas las visualizaciones con los resultados
     */
    updateAllDisplays() {
        if (!this.simulationResult) return;

        // Actualizar diagrama de Gantt
        this.ganttChart.render(this.simulationResult, this.selectedAlgorithm);
        
        // Actualizar tabla de procesos
        this.ganttChart.updateProcessTable(this.simulationResult.processes);
        
        // Actualizar cola de listos
        this.ganttChart.updateReadyQueueDisplay(this.simulationResult.readyQueue);
        
        // Actualizar estadísticas
        this.ganttChart.updateStatistics(this.simulationResult.statistics);
    }

    /**
     * Actualiza solo la tabla de procesos (antes de simular)
     * @param {Array} processes - Lista de procesos
     */
    updateProcessTable(processes) {
        const tableBody = document.querySelector('#processTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        // Primero actualizar visibilidad de columnas
        this.updateIOColumnVisibility();
        
        processes.forEach(process => {
            const row = document.createElement('tr');
            
            // Determinar si mostrar columnas especiales
            const showPriority = this.selectedAlgorithm === 'priority' || this.selectedAlgorithm === 'priority-preemptive';
            const showIO = this.currentProcesses.some(p => 
                p.ioOperations && p.ioOperations.length > 0
            );
            
            // Crear celdas condicionales
            const ioCell = showIO ? 
                `<td>${this.formatIOOperations(process.ioOperations || [])}</td>` : '';
            const priorityCell = showPriority && process.priority !== undefined ? 
                `<td>${process.priority}</td>` : 
                (showPriority ? '<td>-</td>' : '');
            
            row.innerHTML = `
                <td>${process.name}</td>
                <td>${process.cpuTime}</td>
                <td>${process.arrivalTime}</td>
                ${ioCell}
                ${priorityCell}
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Actualiza la visibilidad de la columna E/S
     */
    updateIOColumnVisibility() {
        const ioColumn = document.getElementById('ioColumn');
        if (ioColumn) {
            const hasIO = this.currentProcesses.some(p => 
                p.ioOperations && p.ioOperations.length > 0
            );
            
            if (hasIO) {
                ioColumn.style.display = 'table-cell';
                console.log('📊 Mostrando columna E/S');
            } else {
                ioColumn.style.display = 'none';
                console.log('📊 Ocultando columna E/S');
            }
        }
    }
    
    /**
     * Formatea las operaciones de E/S para mostrar en la tabla
     * @param {Array} ioOperations - Lista de operaciones de E/S
     * @returns {string} - String formateado para mostrar
     */
    formatIOOperations(ioOperations) {
        if (!ioOperations || ioOperations.length === 0) {
            return '-';
        }
        
        // Formatear cada operación como (Recurso,Tiempo,Duración)
        return ioOperations.map(op => {
            const resource = op.resource || 'R?';
            const cpuTime = op.cpuTimeBeforeIO || op.startTime || '?';
            const duration = op.duration || '?';
            return `(${resource},${cpuTime},${duration})`;
        }).join(' ');
    }

    /**
     * Muestra un mensaje de carga
     * @param {string} message - Mensaje a mostrar
     */
    showLoading(message = 'Cargando...') {
        const container = document.querySelector('.results-section');
        if (container) {
            container.classList.add('loading');
        }
        
        this.showMessage(message, 'info');
    }

    /**
     * Oculta el indicador de carga
     */
    hideLoading() {
        const container = document.querySelector('.results-section');
        if (container) {
            container.classList.remove('loading');
        }
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje a mostrar
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Muestra un mensaje en la interfaz
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, info)
     */
    showMessage(message, type = 'info') {
        // Remover mensajes anteriores
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        // Estilos del mensaje
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            ${type === 'success' ? 'background: #4CAF50;' : ''}
            ${type === 'error' ? 'background: #f44336;' : ''}
            ${type === 'info' ? 'background: #2196F3;' : ''}
        `;

        document.body.appendChild(messageElement);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    /**
     * Muestra mensaje inicial de bienvenida
     */
    showInitialMessage() {
        const container = document.querySelector('.results-section');
        if (container) {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'welcome-message';
            welcomeMessage.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>¡Bienvenido al Simulador de Algoritmos de Planificación!</h3>
                    <p>Para comenzar:</p>
                    <ol style="text-align: left; display: inline-block;">
                        <li>Selecciona el algoritmo de planificación (FCFS, SJF o Round Robin)</li>
                        <li>Carga un archivo YAML con los procesos</li>
                        <li>O usa los botones de ejemplo para cargar datos de prueba</li>
                        <li>Haz clic en "Simular Procesos" para ejecutar el algoritmo</li>
                    </ol>
                    <p style="margin-top: 20px;">
                        <small>El archivo YAML debe contener una lista de procesos con: nombre, tiempo de CPU y tiempo de llegada</small>
                    </p>
                </div>
            `;
            
            container.insertBefore(welcomeMessage, container.firstChild);
        }
    }

    /**
     * Limpia todos los resultados y reinicia el estado
     */
    reset() {
        this.currentProcesses = [];
        this.simulationResult = null;
        
        // Limpiar visualizaciones
        this.ganttChart.clearChart();
        
        // Limpiar tabla
        const tableBody = document.querySelector('#processTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
        }
        
        // Limpiar cola de listos
        const queueDisplay = document.getElementById('readyQueueDisplay');
        if (queueDisplay) {
            queueDisplay.innerHTML = '';
        }
        
        // Limpiar estadísticas
        document.getElementById('avgResponseTime').textContent = '-';
        document.getElementById('avgWaitTime').textContent = '-';
        
        this.showSuccess('Simulador reiniciado');
    }

    /**
     * Exporta los resultados como JSON
     */
    exportResults() {
        if (!this.simulationResult) {
            this.showError('No hay resultados para exportar');
            return;
        }

        const data = {
            algorithm: this.selectedAlgorithm.toUpperCase(),
            timestamp: new Date().toISOString(),
            processes: this.simulationResult.processes,
            statistics: this.simulationResult.statistics,
            timeline: this.simulationResult.timeline
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `simulacion_${this.selectedAlgorithm}_resultados.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showSuccess('Resultados exportados exitosamente');
    }
}

// Inicializar el simulador cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.simulator = new ProcessSimulator();
        console.log('Simulador de Procesos FCFS iniciado correctamente');
    } catch (error) {
        console.error('Error al iniciar el simulador:', error);
        alert('Error al iniciar el simulador: ' + error.message);
    }
});

// Función global para descargar el ejemplo YAML
function downloadExampleYAML() {
    if (window.simulator && window.simulator.yamlParser) {
        window.simulator.yamlParser.downloadExampleYAML();
    }
}