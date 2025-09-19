/**
 * Script de debug para el botón FCFS con E/S
 * Ejecutar en la consola del navegador
 */

function debugFCFSIOButton() {
    console.log('🔍 Debuggeando botón FCFS con E/S...');
    
    // 1. Verificar que el botón existe
    const btn = document.getElementById('loadFCFSIOExample');
    console.log('📋 Botón encontrado:', !!btn);
    if (btn) {
        console.log('📋 Botón HTML:', btn.outerHTML);
        console.log('📋 Botón visible:', btn.offsetWidth > 0 && btn.offsetHeight > 0);
    }
    
    // 2. Verificar que el simulador existe
    console.log('🎯 Simulador disponible:', !!window.simulator);
    if (window.simulator) {
        console.log('🎯 Algoritmo actual:', window.simulator.selectedAlgorithm);
        console.log('🎯 Procesos actuales:', window.simulator.currentProcesses.length);
    }
    
    // 3. Probar manualmente el método loadExample
    if (window.simulator) {
        console.log('🧪 Probando loadExample("fcfs-io")...');
        try {
            window.simulator.loadExample('fcfs-io');
            console.log('✅ loadExample ejecutado sin errores');
        } catch (error) {
            console.error('❌ Error en loadExample:', error);
        }
    }
    
    // 4. Verificar que YAMLParser tiene el método correcto
    if (window.simulator && window.simulator.yamlParser) {
        console.log('📄 loadIOExampleProcesses disponible:', 
            typeof window.simulator.yamlParser.loadIOExampleProcesses === 'function');
        
        if (typeof window.simulator.yamlParser.loadIOExampleProcesses === 'function') {
            try {
                const processes = window.simulator.yamlParser.loadIOExampleProcesses();
                console.log('📄 Procesos E/S cargados:', processes.length);
                console.log('📄 Primer proceso:', processes[0]);
            } catch (error) {
                console.error('❌ Error al cargar procesos E/S:', error);
            }
        }
    }
    
    // 5. Probar clic manual en el botón
    if (btn) {
        console.log('🖱️ Simulando clic en el botón...');
        btn.click();
        
        setTimeout(() => {
            if (window.simulator) {
                console.log('🖱️ Después del clic - Procesos:', window.simulator.currentProcesses.length);
                console.log('🖱️ Después del clic - Algoritmo:', window.simulator.selectedAlgorithm);
            }
        }, 100);
    }
}

// Función simple para probar solo la carga de procesos
function testIOProcessesLoad() {
    console.log('🧪 Probando carga de procesos E/S...');
    
    try {
        const yamlParser = new YAMLParser();
        console.log('✅ YAMLParser creado');
        
        const processes = yamlParser.loadIOExampleProcesses();
        console.log('✅ Procesos cargados:', processes.length);
        
        processes.forEach((p, i) => {
            console.log(`📋 P${i+1}:`, {
                name: p.name,
                cpuTime: p.cpuTime,
                arrivalTime: p.arrivalTime,
                ioOperations: p.ioOperations?.length || 0
            });
        });
        
        return processes;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

console.log(`
🛠️ Scripts de debug cargados:
- debugFCFSIOButton(): Debug completo del botón
- testIOProcessesLoad(): Prueba solo carga de procesos
`);

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.debugFCFSIOButton = debugFCFSIOButton;
    window.testIOProcessesLoad = testIOProcessesLoad;
}
