// Debug script para verificar el problema de la columna de prioridad

console.log("🔧 DEBUG COLUMNA DE PRIORIDAD");

// Simular las conversiones que hace el sistema
const testAlgorithms = [
    'priority',
    'priority-preemptive',
    'PRIORITY',
    'PRIORITY_PREEMPTIVE',
    'PRIORITY-PREEMPTIVE'
];

console.log("📋 Probando conversiones de algoritmos:");

testAlgorithms.forEach(alg => {
    const normalized = alg.toUpperCase().replace('-', '_');
    const isPriority = normalized === 'PRIORITY';
    const isPriorityPreemptive = normalized === 'PRIORITY_PREEMPTIVE';
    
    console.log(`${alg} → ${normalized} | Priority: ${isPriority} | Preemptive: ${isPriorityPreemptive}`);
});

// Verificar el estado del DOM
function checkPriorityColumn() {
    const priorityColumn = document.getElementById('priorityColumn');
    if (priorityColumn) {
        console.log("📊 Estado de la columna de prioridad en tabla principal:");
        console.log("- Existe:", !!priorityColumn);
        console.log("- Display:", priorityColumn.style.display);
        console.log("- Visible:", priorityColumn.offsetWidth > 0);
    } else {
        console.log("❌ No se encontró elemento #priorityColumn");
    }
    
    // Verificar si hay tabla de Gantt
    const ganttTable = document.querySelector('.gantt-table');
    if (ganttTable) {
        console.log("📈 Tabla de Gantt encontrada");
        const headers = ganttTable.querySelectorAll('th');
        console.log("- Headers encontrados:", Array.from(headers).map(h => h.textContent));
        
        // Buscar específicamente "Prioridad"
        const priorityHeader = Array.from(headers).find(h => h.textContent === 'Prioridad');
        console.log("- Header 'Prioridad' encontrado:", !!priorityHeader);
    } else {
        console.log("❌ No se encontró tabla de Gantt");
    }
}

// Ejecutar verificación inicial
checkPriorityColumn();

// Verificar cada 2 segundos si cambia algo
let checkCount = 0;
const interval = setInterval(() => {
    checkCount++;
    console.log(`\n🔄 Verificación #${checkCount} (${checkCount * 2}s):`);
    checkPriorityColumn();
    
    if (checkCount >= 5) {
        clearInterval(interval);
        console.log("✅ Debug finalizado después de 10 segundos");
    }
}, 2000);
