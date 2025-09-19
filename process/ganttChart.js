/**
 * Módulo para generar y mostrar diagramas de Gantt
 */

class GanttChart {
    constructor() {
        this.container = null;
        this.timeScale = null;
        this.processes = [];
        this.timeline = [];
        this.maxTime = 0;
        this.timeUnit = 30; // pixels por unidad de tiempo
    }

    /**
     * Inicializa el diagrama de Gantt
     * @param {string} containerId - ID del contenedor del diagrama
     */
    initialize(containerId) {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            throw new Error('No se encontró el contenedor del diagrama de Gantt');
        }
    }

    /**
     * Renderiza el diagrama de Gantt completo
     * @param {Object} schedulerResult - Resultado del scheduler
     * @param {string} algorithm - Algoritmo utilizado (para mostrar en la etiqueta)
     */
    render(schedulerResult, algorithm = 'UNKNOWN') {
        if (!schedulerResult || !schedulerResult.processes || !schedulerResult.timeline) {
            this.clearChart();
            return;
        }

        this.processes = schedulerResult.processes;
        this.timeline = schedulerResult.timeline;
        this.algorithm = algorithm.toUpperCase();
        this.quantum = schedulerResult.quantum || null; // Capturar quantum si está disponible
        
        // Calcular tiempo máximo
        this.maxTime = Math.max(
            ...this.processes
                .filter(p => p.finishTime !== null)
                .map(p => p.finishTime)
        );

        // Limpiar contenedor
        this.clearChart();

        // Generar el diagrama
        this.renderGanttBars();
    }

    /**
     * Renderiza el diagrama de Gantt como tabla (formato Excel)
     */
    renderGanttBars() {
        // Crear leyenda explicativa
        const legend = this.createGanttLegend();
        this.container.appendChild(legend);
        
        // Crear tabla de Gantt
        const ganttTable = this.createGanttTable();
        this.container.appendChild(ganttTable);
    }

    /**
     * Crea la leyenda explicativa del diagrama de Gantt
     * @returns {HTMLElement} - Leyenda del diagrama
     */
    createGanttLegend() {
        const legend = document.createElement('div');
        legend.className = 'gantt-legend';
        
        legend.innerHTML = `
            <h4>📊 Leyenda del Diagrama de Gantt</h4>
            <div class="legend-item">
                <span class="symbol">&gt;</span> Llegada del proceso
            </div>
            <div class="legend-item">
                <span class="symbol">&lt;</span> Finalización completa del proceso
            </div>
            <div class="legend-item">
                <span style="background-color: #ffcccb; padding: 2px 6px; border: 1px solid #ccc;">1,2,3...</span> Secuencia de ejecución
            </div>
            <div class="legend-item">
                <strong>Quantum (RR):</strong> ${this.algorithm === 'RR' ? (this.quantum || 'N/A') + ' unidades' : 'N/A'}
            </div>
        `;
        
        return legend;
    }
    
    /**
     * Crea la tabla del diagrama de Gantt (formato Excel)
     * @returns {HTMLElement} - Tabla del diagrama
     */
    createGanttTable() {
        const table = document.createElement('table');
        table.className = 'gantt-table';
        
        // Crear encabezado
        const header = this.createTableHeader();
        table.appendChild(header);
        
        // Crear filas para cada proceso
        this.processes.forEach(process => {
            const row = this.createProcessRow(process);
            table.appendChild(row);
        });
        
        // Crear fila de Ready Queue
        const queueRow = this.createReadyQueueRow();
        table.appendChild(queueRow);
        
        return table;
    }
    
    /**
     * Crea el encabezado de la tabla
     * @returns {HTMLElement} - Encabezado de la tabla
     */
    createTableHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Columnas fijas
        const headers = ['Procesos', 'CPU', 'Llegada'];
        
        // Agregar columna de Prioridad solo para algoritmo Priority
        if (this.algorithm === 'PRIORITY') {
            headers.push('Prioridad');
        }
        
        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.className = 'gantt-header-fixed';
            headerRow.appendChild(th);
        });
        
        // Columnas de tiempo (0 a maxTime-1)
        for (let time = 0; time < this.maxTime; time++) {
            const th = document.createElement('th');
            th.textContent = time;
            th.className = 'gantt-header-time';
            headerRow.appendChild(th);
        }
        
        // Columnas TR y TE
        ['TR', 'TE'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.className = 'gantt-header-result';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        return thead;
    }
    
    /**
     * Crea una fila para un proceso específico
     * @param {Object} process - Proceso a renderizar
     * @returns {HTMLElement} - Fila del proceso
     */
    createProcessRow(process) {
        const row = document.createElement('tr');
        row.className = `gantt-process-row process-${process.id}`;
        
        // Columna de proceso (número)
        const processCell = document.createElement('td');
        processCell.textContent = process.id;
        processCell.className = 'gantt-cell-process';
        row.appendChild(processCell);
        
        // Columna CPU
        const cpuCell = document.createElement('td');
        cpuCell.textContent = process.cpuTime;
        cpuCell.className = 'gantt-cell-fixed';
        row.appendChild(cpuCell);
        
        // Columna Llegada
        const arrivalCell = document.createElement('td');
        arrivalCell.textContent = process.arrivalTime;
        arrivalCell.className = 'gantt-cell-fixed';
        row.appendChild(arrivalCell);
        
        // Columna Prioridad (solo para Priority Scheduling)
        if (this.algorithm === 'PRIORITY') {
            const priorityCell = document.createElement('td');
            priorityCell.textContent = process.priority !== undefined ? process.priority : '-';
            priorityCell.className = 'gantt-cell-fixed';
            row.appendChild(priorityCell);
        }
        
        // Celdas de tiempo
        for (let time = 0; time < this.maxTime; time++) {
            const timeCell = document.createElement('td');
            timeCell.className = 'gantt-cell-time';
            
            // Verificar si es el momento de llegada del proceso
            if (time === process.arrivalTime) {
                // Mostrar símbolo de llegada independientemente del estado
                const executionInfo = this.getProcessExecutionAtTime(process, time);
                if (executionInfo.isExecuting) {
                    // Si está ejecutándose en su momento de llegada
                    timeCell.textContent = `>${executionInfo.sequence}`;
                    timeCell.classList.add('executing');
                    
                    // Verificar si también termina en este momento
                    const isLastExecution = this.isLastExecutionTime(process, time);
                    if (isLastExecution) {
                        timeCell.textContent = `>${executionInfo.sequence}<`;
                    }
                } else {
                    // Si no está ejecutándose pero es su momento de llegada
                    timeCell.textContent = '>';
                    timeCell.classList.add('executing'); // Usar el estilo del proceso
                }
            } else {
                // Para otros momentos, verificar solo si está ejecutándose
                const executionInfo = this.getProcessExecutionAtTime(process, time);
                if (executionInfo.isExecuting) {
                    timeCell.textContent = executionInfo.sequence;
                    timeCell.classList.add('executing');
                    
                    // Verificar si es la última ejecución del proceso
                    const isLastExecution = this.isLastExecutionTime(process, time);
                    if (isLastExecution) {
                        timeCell.textContent = `${executionInfo.sequence}<`;
                    }
                }
            }
            
            row.appendChild(timeCell);
        }
        
        // Columna TR (Tiempo Respuesta)
        const trCell = document.createElement('td');
        trCell.textContent = process.responseTime !== null ? process.responseTime : '-';
        trCell.className = 'gantt-cell-result';
        row.appendChild(trCell);
        
        // Columna TE (Tiempo Espera)
        const teCell = document.createElement('td');
        teCell.textContent = process.waitTime !== null ? process.waitTime : '-';
        teCell.className = 'gantt-cell-result';
        row.appendChild(teCell);
        
        return row;
    }
    
    /**
     * Determina si un tiempo dado es la última ejecución de un proceso
     * @param {Object} process - Proceso
     * @param {number} time - Tiempo a verificar
     * @returns {boolean} - True si es la última ejecución
     */
    isLastExecutionTime(process, time) {
        // Para algoritmos preemptivos (Round Robin), usar el timeline
        if (this.timeline && this.timeline.length > 0) {
            // Obtener todas las ejecuciones de este proceso
            const processExecutions = this.timeline.filter(entry => 
                entry.processId === process.id
            );
            
            if (processExecutions.length === 0) {
                return false;
            }
            
            // Encontrar el tiempo máximo de ejecución para este proceso
            const maxExecutionTime = Math.max(...processExecutions.map(entry => entry.time));
            return time === maxExecutionTime;
        }
        
        // Para algoritmos no preemptivos, usar finishTime
        if (process.finishTime && typeof process.finishTime === 'number') {
            return time === process.finishTime - 1;
        }
        
        return false;
    }
    
    /**
     * Obtiene información de ejecución de un proceso en un tiempo específico
     * @param {Object} process - Proceso
     * @param {number} time - Tiempo específico
     * @returns {Object} - Información de ejecución
     */
    getProcessExecutionAtTime(process, time) {
        // Para algoritmos preemptivos (Round Robin), usar el timeline
        if (this.timeline && this.timeline.length > 0) {
            const timelineEntry = this.timeline.find(entry => 
                entry.time === time && entry.processId === process.id
            );
            
            if (!timelineEntry) {
                return { isExecuting: false };
            }
            
            // Calcular secuencia basada en cuántas veces ha ejecutado este proceso hasta ahora
            const executionsSoFar = this.timeline.filter(entry => 
                entry.time < time && entry.processId === process.id
            ).length;
            
            const sequence = executionsSoFar + 1;
            
            return {
                isExecuting: true,
                sequence: sequence
            };
        }
        
        // Para algoritmos no preemptivos (FCFS, SJF), usar el método original
        if (typeof process.startTime !== 'number' || typeof process.finishTime !== 'number') {
            return { isExecuting: false };
        }
        
        const isExecuting = time >= process.startTime && time < process.finishTime;
        if (!isExecuting) {
            return { isExecuting: false };
        }
        
        const sequence = time - process.startTime + 1;
        
        return {
            isExecuting: true,
            sequence: sequence
        };
    }
    
    /**
     * Crea la fila de Ready Queue
     * @returns {HTMLElement} - Fila de Ready Queue
     */
    createReadyQueueRow() {
        const row = document.createElement('tr');
        row.className = 'gantt-queue-row';
        
        // Celda de etiqueta
        const labelCell = document.createElement('td');
        labelCell.textContent = this.algorithm || 'UNKNOWN';
        labelCell.className = 'gantt-cell-process';
        labelCell.style.fontWeight = 'bold';
        row.appendChild(labelCell);
        
        // Celda de Ready Queue
        const queueLabelCell = document.createElement('td');
        queueLabelCell.textContent = 'Ready Queue';
        queueLabelCell.className = 'gantt-cell-fixed';
        queueLabelCell.style.fontWeight = 'bold';
        // Ajustar colspan según si hay columna de prioridad
        queueLabelCell.colSpan = this.algorithm === 'PRIORITY' ? 3 : 2;
        row.appendChild(queueLabelCell);
        
        // Celdas de tiempo con procesos en cola - Solo mostrar la secuencia inicial
        for (let time = 0; time < this.maxTime; time++) {
            const timeCell = document.createElement('td');
            timeCell.className = 'gantt-cell-queue';
            
            // Mostrar solo en las primeras celdas la secuencia de procesos
            if (time < this.processes.length) {
                const process = this.processes.find(p => p.id === time + 1);
                if (process) {
                    timeCell.textContent = `>${process.id}`;
                }
            }
            
            row.appendChild(timeCell);
        }
        
        // Celdas de resultado (promedio)
        const avgResponseCell = document.createElement('td');
        avgResponseCell.textContent = this.getAverageResponseTime();
        avgResponseCell.className = 'gantt-cell-result';
        avgResponseCell.style.fontWeight = 'bold';
        row.appendChild(avgResponseCell);
        
        const avgWaitCell = document.createElement('td');
        avgWaitCell.textContent = this.getAverageWaitTime();
        avgWaitCell.className = 'gantt-cell-result';
        avgWaitCell.style.fontWeight = 'bold';
        row.appendChild(avgWaitCell);
        
        return row;
    }
    
    /**
     * Obtiene los procesos en Ready Queue en un tiempo específico
     * @param {number} time - Tiempo específico
     * @returns {Array} - Lista de procesos en cola
     */
    getReadyQueueAtTime(time) {
        // En el tiempo 0, mostrar todos los procesos que han llegado
        if (time === 0) {
            const arrivedProcesses = this.processes
                .filter(p => p.arrivalTime <= time)
                .sort((a, b) => a.arrivalTime - b.arrivalTime)
                .map(p => `>${p.id}`);
            return arrivedProcesses;
        }
        
        // Para otros tiempos, mostrar solo los procesos que están esperando
        const waiting = [];
        this.processes.forEach(process => {
            if (process.arrivalTime <= time) {
                // Si ha llegado pero no ha iniciado, o si ha iniciado pero no en este momento
                if (!process.startTime || process.startTime > time) {
                    waiting.push(`>${process.id}`);
                } else if (process.startTime <= time && process.finishTime > time) {
                    // No agregar si está ejecutándose
                    return;
                }
            }
        });
        
        return waiting;
    }
    
    /**
     * Calcula el tiempo de respuesta promedio
     * @returns {number} - Tiempo promedio
     */
    getAverageResponseTime() {
        const completedProcesses = this.processes.filter(p => 
            typeof p.responseTime === 'number' && p.responseTime !== null
        );
        if (completedProcesses.length === 0) return '0.0';
        
        const total = completedProcesses.reduce((sum, p) => sum + p.responseTime, 0);
        const average = total / completedProcesses.length;
        console.log('Cálculo TR (Turnaround) promedio:', completedProcesses.map(p => `${p.name}:${p.responseTime}`), 'Total:', total, 'Promedio:', average);
        return average.toFixed(1);
    }
    
    /**
     * Calcula el tiempo de espera promedio
     * @returns {number} - Tiempo promedio
     */
    getAverageWaitTime() {
        const completedProcesses = this.processes.filter(p => 
            typeof p.waitTime === 'number' && p.waitTime !== null
        );
        if (completedProcesses.length === 0) return '0.0';
        
        const total = completedProcesses.reduce((sum, p) => sum + p.waitTime, 0);
        const average = total / completedProcesses.length;
        console.log('Cálculo TE promedio:', completedProcesses.map(p => `${p.name}:${p.waitTime}`), 'Total:', total, 'Promedio:', average);
        return average.toFixed(1);
    }

    /**
     * Agregar eventos a los bloques de proceso
     * @param {HTMLElement} blockElement - Elemento del bloque
     * @param {Object} block - Datos del bloque
     */
    addBlockEvents(blockElement, block) {
        blockElement.addEventListener('mouseenter', () => {
            this.showProcessInfo(block);
        });

        blockElement.addEventListener('mouseleave', () => {
            this.hideProcessInfo();
        });
    }

    /**
     * Muestra información del proceso en hover
     * @param {Object} block - Datos del bloque
     */
    showProcessInfo(block) {
        // Crear tooltip dinámico si no existe
        let tooltip = document.getElementById('process-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'process-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
        }

        const process = this.processes.find(p => p.id === block.processId);
        tooltip.innerHTML = `
            <strong>${block.processName}</strong><br>
            Tiempo CPU: ${process ? process.cpuTime : 'N/A'}<br>
            Llegada: ${process ? process.arrivalTime : 'N/A'}<br>
            Inicio: ${block.startTime}<br>
            Fin: ${block.endTime}
        `;

        tooltip.style.display = 'block';

        // Posicionar tooltip cerca del mouse
        document.addEventListener('mousemove', this.positionTooltip);
    }

    /**
     * Oculta la información del proceso
     */
    hideProcessInfo() {
        const tooltip = document.getElementById('process-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
        document.removeEventListener('mousemove', this.positionTooltip);
    }

    /**
     * Posiciona el tooltip cerca del mouse
     * @param {MouseEvent} e - Evento de mouse
     */
    positionTooltip(e) {
        const tooltip = document.getElementById('process-tooltip');
        if (tooltip) {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 10}px`;
        }
    }


    /**
     * Agrupa el timeline en bloques continuos
     * @returns {Array} - Timeline agrupado
     */
    groupTimeline() {
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
            const current = this.timeline[i];

            if (current.processId === currentBlock.processId && 
                current.time === currentBlock.endTime) {
                // Extender el bloque actual
                currentBlock.endTime = current.time + 1;
                currentBlock.duration++;
            } else {
                // Terminar el bloque actual y comenzar uno nuevo
                grouped.push({ ...currentBlock });
                currentBlock = {
                    processId: current.processId,
                    processName: current.processName,
                    startTime: current.time,
                    endTime: current.time + 1,
                    duration: 1
                };
            }
        }

        // Agregar el último bloque
        grouped.push(currentBlock);

        return grouped;
    }

    /**
     * Actualiza la tabla de procesos con los resultados
     * @param {Array} processes - Lista de procesos con resultados
     */
    updateProcessTable(processes) {
        const tableBody = document.querySelector('#processTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        processes.forEach(process => {
            const row = document.createElement('tr');
            
            // Determinar si mostrar columna de prioridad
            const showPriority = this.algorithm === 'PRIORITY';
            const priorityCell = showPriority && process.priority !== undefined ? 
                `<td>${process.priority}</td>` : 
                (showPriority ? '<td>-</td>' : '');
            
            row.innerHTML = `
                <td>${process.name}</td>
                <td>${process.cpuTime}</td>
                <td>${process.arrivalTime}</td>
                ${priorityCell}
                <td>${process.startTime !== null ? process.startTime : '-'}</td>
                <td>${process.finishTime !== null ? process.finishTime : '-'}</td>
                <td>${process.responseTime !== null ? process.responseTime : '-'}</td>
                <td>${process.waitTime !== null ? process.waitTime : '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * Actualiza la visualización de la cola de listos como tabla
     * @param {Object} readyQueue - Estado de la cola por tiempo
     */
    updateReadyQueueDisplay(readyQueue) {
        const container = document.getElementById('readyQueueDisplay');
        if (!container) return;

        container.innerHTML = '';

        // Crear tabla de cola de listos
        const queueTable = this.createReadyQueueTable(readyQueue);
        container.appendChild(queueTable);
    }
    
    /**
     * Crea una tabla para mostrar la evolución de la Ready Queue
     * @param {Object} readyQueue - Estado de la cola por tiempo
     * @returns {HTMLElement} - Tabla de la cola
     */
    createReadyQueueTable(readyQueue) {
        const table = document.createElement('table');
        table.className = 'queue-table';
        
        // Crear encabezado
        const header = this.createQueueTableHeader();
        table.appendChild(header);
        
        // Crear cuerpo de la tabla
        const tbody = this.createQueueTableBody(readyQueue);
        table.appendChild(tbody);
        
        return table;
    }
    
    /**
     * Crea el encabezado de la tabla de Ready Queue
     * @returns {HTMLElement} - Encabezado de la tabla
     */
    createQueueTableHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Columna de tiempo
        const timeHeader = document.createElement('th');
        timeHeader.textContent = 'Tiempo';
        timeHeader.className = 'queue-header-time';
        headerRow.appendChild(timeHeader);
        
        // Columna de procesos ejecutándose
        const executingHeader = document.createElement('th');
        executingHeader.textContent = 'Ejecutando';
        executingHeader.className = 'queue-header-executing';
        headerRow.appendChild(executingHeader);
        
        // Columna de cola de listos
        const queueHeader = document.createElement('th');
        queueHeader.textContent = 'Cola de Listos';
        queueHeader.className = 'queue-header-ready';
        headerRow.appendChild(queueHeader);
        
        // Columna de estado
        const statusHeader = document.createElement('th');
        statusHeader.textContent = 'Estado';
        statusHeader.className = 'queue-header-status';
        headerRow.appendChild(statusHeader);
        
        thead.appendChild(headerRow);
        return thead;
    }
    
    /**
     * Crea el cuerpo de la tabla de Ready Queue
     * @param {Object} readyQueue - Estado de la cola por tiempo
     * @returns {HTMLElement} - Cuerpo de la tabla
     */
    createQueueTableBody(readyQueue) {
        const tbody = document.createElement('tbody');
        
        // Obtener rango de tiempo completo
        const maxTime = Math.max(...this.processes.map(p => p.finishTime || 0));
        
        for (let time = 0; time < maxTime; time++) {
            const row = document.createElement('tr');
            
            // Columna de tiempo
            const timeCell = document.createElement('td');
            timeCell.textContent = time;
            timeCell.className = 'queue-cell-time';
            row.appendChild(timeCell);
            
            // Columna de proceso ejecutándose
            const executingCell = document.createElement('td');
            const executingProcess = this.getExecutingProcessAtTime(time);
            if (executingProcess) {
                executingCell.innerHTML = `<span class="executing-process">P${executingProcess.id}</span>`;
            } else {
                executingCell.innerHTML = '<span class="no-process">-</span>';
            }
            executingCell.className = 'queue-cell-executing';
            row.appendChild(executingCell);
            
            // Columna de cola de listos
            const queueCell = document.createElement('td');
            const queueAtTime = this.getDetailedReadyQueueAtTime(time);
            if (queueAtTime.length > 0) {
                const queueElements = queueAtTime.map(processId => 
                    `<span class="queue-process-item">P${processId}</span>`
                ).join(', ');
                queueCell.innerHTML = queueElements;
            } else {
                queueCell.innerHTML = '<span class="empty-queue">Vacía</span>';
            }
            queueCell.className = 'queue-cell-ready';
            row.appendChild(queueCell);
            
            // Columna de estado
            const statusCell = document.createElement('td');
            const status = this.getSystemStatusAtTime(time);
            statusCell.innerHTML = `<span class="status-${status.type}">${status.message}</span>`;
            statusCell.className = 'queue-cell-status';
            row.appendChild(statusCell);
            
            // Resaltar filas importantes
            if (this.isImportantTime(time)) {
                row.classList.add('important-time');
            }
            
            tbody.appendChild(row);
        }
        
        return tbody;
    }
    
    /**
     * Obtiene el proceso que se está ejecutando en un tiempo dado
     * @param {number} time - Tiempo específico
     * @returns {Object|null} - Proceso ejecutándose o null
     */
    getExecutingProcessAtTime(time) {
        // Para algoritmos preemptivos como Round Robin, usar el timeline
        if (this.timeline && this.timeline.length > 0) {
            const timelineEntry = this.timeline.find(entry => entry.time === time);
            if (timelineEntry) {
                return this.processes.find(p => p.id === timelineEntry.processId) || null;
            }
            return null;
        }
        
        // Para algoritmos no preemptivos (FCFS, SJF), usar el método original
        return this.processes.find(p => 
            p.startTime <= time && p.finishTime > time
        ) || null;
    }
    
    /**
     * Obtiene los procesos en cola de listos de manera detallada
     * @param {number} time - Tiempo específico
     * @returns {Array} - IDs de procesos en cola
     */
    getDetailedReadyQueueAtTime(time) {
        const ready = [];
        
        this.processes.forEach(process => {
            // Proceso ha llegado pero no ha iniciado aún
            if (process.arrivalTime <= time && 
                (!process.startTime || process.startTime > time)) {
                ready.push(process.id);
            }
        });
        
        return ready.sort((a, b) => {
            const processA = this.processes.find(p => p.id === a);
            const processB = this.processes.find(p => p.id === b);
            return processA.arrivalTime - processB.arrivalTime;
        });
    }
    
    /**
     * Obtiene el estado del sistema en un tiempo dado
     * @param {number} time - Tiempo específico
     * @returns {Object} - Estado del sistema
     */
    getSystemStatusAtTime(time) {
        const executing = this.getExecutingProcessAtTime(time);
        const ready = this.getDetailedReadyQueueAtTime(time);
        const arrivals = this.processes.filter(p => p.arrivalTime === time);
        const completions = this.processes.filter(p => p.finishTime === time);
        
        if (arrivals.length > 0) {
            const arrivedNames = arrivals.map(p => `P${p.id}`).join(', ');
            return {
                type: 'arrival',
                message: `Llega: ${arrivedNames}`
            };
        }
        
        if (completions.length > 0) {
            const completedNames = completions.map(p => `P${p.id}`).join(', ');
            return {
                type: 'completion',
                message: `Termina: ${completedNames}`
            };
        }
        
        if (executing) {
            return {
                type: 'executing',
                message: 'Procesando'
            };
        }
        
        if (ready.length > 0) {
            return {
                type: 'waiting',
                message: 'Esperando CPU'
            };
        }
        
        return {
            type: 'idle',
            message: 'Sistema inactivo'
        };
    }
    
    /**
     * Determina si un tiempo es importante para resaltar
     * @param {number} time - Tiempo a evaluar
     * @returns {boolean} - True si es un tiempo importante
     */
    isImportantTime(time) {
        // Tiempo es importante si hay llegadas o finalizaciones
        const hasArrivals = this.processes.some(p => p.arrivalTime === time);
        const hasCompletions = this.processes.some(p => p.finishTime === time);
        const hasStarts = this.processes.some(p => p.startTime === time);
        
        return hasArrivals || hasCompletions || hasStarts;
    }

    /**
     * Actualiza las estadísticas
     * @param {Object} statistics - Estadísticas calculadas
     */
    updateStatistics(statistics) {
        const avgResponseTime = document.getElementById('avgResponseTime');
        const avgWaitTime = document.getElementById('avgWaitTime');

        if (avgResponseTime) {
            avgResponseTime.textContent = statistics.averageResponseTime || '-';
        }
        
        if (avgWaitTime) {
            avgWaitTime.textContent = statistics.averageWaitTime || '-';
        }
        
        // Actualizar estadísticas adicionales si existen
        this.updateAdditionalStatistics(statistics);
    }
    
    /**
     * Actualiza estadísticas adicionales específicas del algoritmo
     * @param {Object} statistics - Estadísticas calculadas
     */
    updateAdditionalStatistics(statistics) {
        const statsDisplay = document.getElementById('statsDisplay');
        if (!statsDisplay) return;
        
        // Remover estadísticas adicionales previas
        const existingExtra = statsDisplay.querySelectorAll('.extra-stat');
        existingExtra.forEach(stat => stat.remove());
        
        // Agregar estadísticas específicas de Round Robin
        if (statistics.contextSwitches !== undefined) {
            const contextSwitchesP = document.createElement('p');
            contextSwitchesP.className = 'extra-stat';
            contextSwitchesP.innerHTML = `Cambios de Contexto: <span>${statistics.contextSwitches}</span>`;
            statsDisplay.appendChild(contextSwitchesP);
        }
        
        if (statistics.quantum !== undefined) {
            const quantumP = document.createElement('p');
            quantumP.className = 'extra-stat';
            quantumP.innerHTML = `Quantum Usado: <span>${statistics.quantum} unidades</span>`;
            statsDisplay.appendChild(quantumP);
        }
        
        if (statistics.throughput !== undefined) {
            const throughputP = document.createElement('p');
            throughputP.className = 'extra-stat';
            throughputP.innerHTML = `Throughput: <span>${statistics.throughput} procesos/tiempo</span>`;
            statsDisplay.appendChild(throughputP);
        }
        
        if (statistics.cpuUtilization !== undefined) {
            const utilizationP = document.createElement('p');
            utilizationP.className = 'extra-stat';
            utilizationP.innerHTML = `Utilización CPU: <span>${statistics.cpuUtilization}%</span>`;
            statsDisplay.appendChild(utilizationP);
        }
    }

    /**
     * Limpia el diagrama de Gantt
     */
    clearChart() {
        if (this.container) {
            this.container.innerHTML = '';
        }

        // Limpiar tooltip si existe
        const tooltip = document.getElementById('process-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * Ajusta el tamaño de la unidad de tiempo
     * @param {number} newTimeUnit - Nueva unidad de tiempo en pixels
     */
    setTimeUnit(newTimeUnit) {
        this.timeUnit = newTimeUnit;
    }

    /**
     * Exporta el diagrama como imagen
     * @param {string} filename - Nombre del archivo
     */
    exportAsImage(filename = 'gantt-chart.png') {
        // Esta funcionalidad requeriría una librería como html2canvas
        console.log('Funcionalidad de exportación no implementada aún');
    }
}

// Exportar para uso en otros módulos
window.GanttChart = GanttChart;