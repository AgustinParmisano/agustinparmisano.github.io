/**
 * Script para ejecutar en la consola del navegador
 * Prueba directamente el simulador principal con E/S
 */

// Función para probar el simulador completo con E/S
function testFullSimulatorIO() {
    console.log('🚀 Probando simulador completo con E/S...');
    
    try {
        // Verificar que el simulador esté disponible
        if (!window.simulator) {
            console.error('❌ Simulador no disponible. Asegúrate de estar en la página principal.');
            return;
        }
        
        console.log('✅ Simulador encontrado');
        
        // Cargar el ejemplo de E/S
        console.log('📋 Cargando ejemplo FCFS con E/S...');
        window.simulator.loadExample('fcfs-io');
        
        // Esperar un momento y luego ejecutar simulación
        setTimeout(() => {
            console.log('⚡ Ejecutando simulación...');
            window.simulator.runSimulation();
            
            // Verificar resultados después de un momento
            setTimeout(() => {
                if (window.simulator.simulationResult) {
                    console.log('🎉 ¡Simulación completada!');
                    console.log('📊 Resultado:', window.simulator.simulationResult);
                    console.log('📈 Timeline:', window.simulator.simulationResult.timeline);
                    console.log('💾 Algoritmo:', window.simulator.simulationResult.algorithm);
                    
                    // Verificar eventos de E/S
                    const ioEvents = window.simulator.simulationResult.timeline.filter(event =>
                        event.action && (
                            event.action.includes('io') || 
                            event.state === 'blocked'
                        )
                    );
                    
                    console.log('🔄 Eventos de E/S encontrados:', ioEvents.length);
                    if (ioEvents.length > 0) {
                        console.log('🔄 Eventos de E/S:', ioEvents);
                    }
                    
                } else {
                    console.log('❌ No hay resultados de simulación');
                }
            }, 1000);
        }, 500);
        
    } catch (error) {
        console.error('❌ Error en test completo:', error);
    }
}

// Función para probar solo el scheduler de E/S
function testFCFSIOOnly() {
    console.log('🧪 Probando solo FCFSIOScheduler...');
    
    try {
        // Crear datos de prueba
        const yamlParser = new YAMLParser();
        const processes = yamlParser.loadIOExampleProcesses();
        
        console.log('📋 Procesos cargados:', processes.length);
        console.log('📋 Procesos:', processes);
        
        // Ejecutar scheduler
        const scheduler = new FCFSIOScheduler();
        const result = scheduler.schedule(processes);
        
        console.log('✅ Scheduler ejecutado');
        console.log('📊 Resultado completo:', result);
        console.log('⏰ Timeline events:', result.timeline.length);
        
        // Analizar timeline
        const cpuEvents = result.timeline.filter(e => e.action === 'cpu_execution');
        const ioEvents = result.timeline.filter(e => e.action && e.action.includes('io'));
        const blockedEvents = result.timeline.filter(e => e.state === 'blocked');
        
        console.log('💻 Eventos CPU:', cpuEvents.length);
        console.log('🔄 Eventos E/S:', ioEvents.length);
        console.log('🚫 Eventos bloqueados:', blockedEvents.length);
        
        if (ioEvents.length > 0) {
            console.log('🔄 Detalle eventos E/S:', ioEvents);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en test scheduler:', error);
    }
}

// Función para verificar el estado actual del simulador
function checkSimulatorState() {
    console.log('🔍 Verificando estado del simulador...');
    
    if (window.simulator) {
        console.log('✅ Simulador disponible');
        console.log('🎯 Algoritmo actual:', window.simulator.selectedAlgorithm);
        console.log('📋 Procesos actuales:', window.simulator.currentProcesses.length);
        console.log('📊 Resultado actual:', !!window.simulator.simulationResult);
        
        if (window.simulator.simulationResult) {
            console.log('📈 Timeline actual:', window.simulator.simulationResult.timeline.length);
            console.log('🏷️ Algoritmo del resultado:', window.simulator.simulationResult.algorithm);
        }
        
    } else {
        console.log('❌ Simulador no disponible');
    }
    
    // Verificar clases disponibles
    console.log('🔧 Clases disponibles:');
    console.log('  - FCFSIOScheduler:', typeof FCFSIOScheduler !== 'undefined');
    console.log('  - IOScheduler:', typeof IOScheduler !== 'undefined');
    console.log('  - YAMLParser:', typeof YAMLParser !== 'undefined');
}

console.log(`
🛠️  Scripts de prueba de E/S cargados!
📖 Ejecuta estos comandos en la consola:

testFullSimulatorIO()  - Prueba el simulador completo
testFCFSIOOnly()       - Prueba solo el scheduler de E/S  
checkSimulatorState()  - Verifica el estado actual
`);

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.testFullSimulatorIO = testFullSimulatorIO;
    window.testFCFSIOOnly = testFCFSIOOnly;
    window.checkSimulatorState = checkSimulatorState;
}
