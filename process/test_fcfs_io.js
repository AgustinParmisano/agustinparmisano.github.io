/**
 * Pruebas básicas para FCFS con E/S
 * Para ejecutar en consola del navegador
 */

function testFCFSIO() {
    console.log('🧪 Iniciando pruebas de FCFS con E/S...\n');

    // Caso de prueba 1: Procesos con E/S básico
    const testCase1 = [
        {
            id: 1,
            name: "P1",
            cpuTime: 4,
            arrivalTime: 0,
            ioOperations: [
                { cpuTimeBeforeIO: 2, resource: "R1", duration: 1 }
            ]
        },
        {
            id: 2,
            name: "P2",
            cpuTime: 3,
            arrivalTime: 1,
            ioOperations: []
        }
    ];

    try {
        console.log('🔬 Caso de prueba 1: E/S básica');
        const scheduler1 = new FCFSIOScheduler();
        const result1 = scheduler1.schedule(testCase1);
        
        console.log('✅ Resultado caso 1:');
        console.log('- Procesos completados:', result1.processes.length);
        console.log('- Timeline eventos:', result1.timeline.length);
        console.log('- Estadísticas:', result1.statistics);
        
        // Verificar que P1 tiene operaciones de E/S en el timeline
        const ioEvents = result1.timeline.filter(event => 
            event.processName === 'P1' && event.action !== 'cpu_execution'
        );
        console.log('- Eventos E/S de P1:', ioEvents.length);
        
    } catch (error) {
        console.error('❌ Error en caso 1:', error);
    }

    // Caso de prueba 2: Sin E/S (comportamiento similar a FCFS normal)
    const testCase2 = [
        {
            id: 1,
            name: "P1",
            cpuTime: 5,
            arrivalTime: 0,
            ioOperations: []
        },
        {
            id: 2,
            name: "P2",
            cpuTime: 3,
            arrivalTime: 2,
            ioOperations: []
        }
    ];

    try {
        console.log('\n🔬 Caso de prueba 2: Sin E/S');
        const scheduler2 = new FCFSIOScheduler();
        const result2 = scheduler2.schedule(testCase2);
        
        console.log('✅ Resultado caso 2:');
        console.log('- Procesos completados:', result2.processes.length);
        console.log('- P1 tiempo finalización:', result2.processes[0].finishTime);
        console.log('- P2 tiempo finalización:', result2.processes[1].finishTime);
        
        // Verificar comportamiento FCFS: P1 debería terminar antes que P2 comience
        const p1Finish = result2.processes.find(p => p.name === 'P1').finishTime;
        const p2Start = result2.processes.find(p => p.name === 'P2').startTime;
        
        if (p2Start >= p1Finish) {
            console.log('✅ Comportamiento FCFS verificado');
        } else {
            console.log('❌ Error en comportamiento FCFS');
        }
        
    } catch (error) {
        console.error('❌ Error en caso 2:', error);
    }

    // Caso de prueba 3: E/S múltiple
    const testCase3 = [
        {
            id: 1,
            name: "P1",
            cpuTime: 6,
            arrivalTime: 0,
            ioOperations: [
                { cpuTimeBeforeIO: 2, resource: "R1", duration: 1 },
                { cpuTimeBeforeIO: 4, resource: "R2", duration: 2 }
            ]
        }
    ];

    try {
        console.log('\n🔬 Caso de prueba 3: E/S múltiple');
        const scheduler3 = new FCFSIOScheduler();
        const result3 = scheduler3.schedule(testCase3);
        
        console.log('✅ Resultado caso 3:');
        console.log('- Tiempo total simulación:', result3.statistics.simulationTime);
        console.log('- Operaciones E/S totales:', result3.statistics.totalIOOperations);
        
        // El proceso debería haber hecho 2 operaciones de E/S
        if (result3.statistics.totalIOOperations >= 2) {
            console.log('✅ E/S múltiple verificada');
        } else {
            console.log('❌ Error en E/S múltiple');
        }
        
    } catch (error) {
        console.error('❌ Error en caso 3:', error);
    }

    console.log('\n🧪 Pruebas de FCFS con E/S completadas');
}

// Función para probar el ejemplo completo del yamlParser
function testFCFSIOExample() {
    console.log('🧪 Probando ejemplo completo de FCFS con E/S...\n');
    
    try {
        const yamlParser = new YAMLParser();
        const processes = yamlParser.loadIOExampleProcesses();
        
        console.log('📋 Procesos cargados del ejemplo:');
        processes.forEach(p => {
            console.log(`- ${p.name}: CPU=${p.cpuTime}, llegada=${p.arrivalTime}, E/S=${p.ioOperations?.length || 0}`);
        });
        
        const scheduler = new FCFSIOScheduler();
        const result = scheduler.schedule(processes);
        
        console.log('\n📊 Resultados:');
        console.log('- Algoritmo:', result.algorithm);
        console.log('- Procesos completados:', result.statistics.totalProcesses);
        console.log('- Tiempo simulación:', result.statistics.simulationTime);
        console.log('- Utilización CPU:', result.statistics.cpuUtilization + '%');
        console.log('- Utilización E/S:', result.statistics.ioUtilization + '%');
        console.log('- Tiempo respuesta promedio:', result.statistics.averageResponseTime);
        
        console.log('\n✅ Ejemplo completo ejecutado exitosamente');
        return result;
        
    } catch (error) {
        console.error('❌ Error en ejemplo completo:', error);
        return null;
    }
}

// Función para probar integración con interfaz
function testIntegration() {
    console.log('🧪 Probando integración con interfaz...\n');
    
    try {
        // Verificar que las clases están disponibles
        if (typeof FCFSIOScheduler === 'undefined') {
            throw new Error('FCFSIOScheduler no está definido');
        }
        
        if (typeof IOScheduler === 'undefined') {
            throw new Error('IOScheduler no está definido');
        }
        
        if (typeof YAMLParser === 'undefined') {
            throw new Error('YAMLParser no está definido');
        }
        
        console.log('✅ Todas las clases necesarias están disponibles');
        
        // Verificar que el simulador principal puede acceder al nuevo scheduler
        if (window.simulator && window.simulator.fcfsIOScheduler) {
            console.log('✅ Simulador principal tiene acceso al FCFS IO Scheduler');
        } else {
            console.log('❌ Simulador principal no tiene acceso al FCFS IO Scheduler');
        }
        
        console.log('\n✅ Prueba de integración completada');
        
    } catch (error) {
        console.error('❌ Error en integración:', error);
    }
}

// Ejecutar todas las pruebas
function runAllTests() {
    console.log('🚀 Ejecutando todas las pruebas de FCFS con E/S...\n');
    console.log('=' .repeat(50));
    
    testFCFSIO();
    console.log('\n' + '=' .repeat(50));
    
    testFCFSIOExample();
    console.log('\n' + '=' .repeat(50));
    
    testIntegration();
    console.log('\n' + '=' .repeat(50));
    
    console.log('\n🎉 Todas las pruebas completadas');
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.testFCFSIO = testFCFSIO;
    window.testFCFSIOExample = testFCFSIOExample;
    window.testIntegration = testIntegration;
    window.runAllTests = runAllTests;
}

console.log('🔧 Archivo de pruebas cargado. Ejecuta runAllTests() para probar todo el sistema.');
