/**
 * Script para debuggear la inicialización del simulador
 */

function debugSimulatorInit() {
    console.log('🔍 Debuggeando inicialización del simulador...');
    
    // Verificar que todas las clases necesarias estén disponibles
    const classes = {
        'ProcessSimulator': typeof ProcessSimulator !== 'undefined',
        'YAMLParser': typeof YAMLParser !== 'undefined',
        'FCFSScheduler': typeof FCFSScheduler !== 'undefined',
        'FCFSIOScheduler': typeof FCFSIOScheduler !== 'undefined',
        'IOScheduler': typeof IOScheduler !== 'undefined',
        'SJFScheduler': typeof SJFScheduler !== 'undefined',
        'RoundRobinScheduler': typeof RoundRobinScheduler !== 'undefined',
        'PriorityScheduler': typeof PriorityScheduler !== 'undefined',
        'GanttChart': typeof GanttChart !== 'undefined'
    };
    
    console.log('📚 Clases disponibles:', classes);
    
    // Verificar si hay errores específicos
    Object.keys(classes).forEach(className => {
        if (!classes[className]) {
            console.error(`❌ ${className} no está definido`);
        } else {
            console.log(`✅ ${className} está disponible`);
        }
    });
    
    // Intentar crear el simulador manualmente
    console.log('\n🧪 Intentando crear simulador manualmente...');
    try {
        const testSimulator = new ProcessSimulator();
        console.log('✅ Simulador creado exitosamente:', testSimulator);
        
        // Asignar al window si no existe
        if (!window.simulator) {
            window.simulator = testSimulator;
            console.log('✅ Simulador asignado a window.simulator');
        }
        
    } catch (error) {
        console.error('❌ Error al crear simulador:', error);
        console.error('Stack trace:', error.stack);
    }
}

function checkDOMReady() {
    console.log('🔍 Verificando estado del DOM...');
    console.log('  - document.readyState:', document.readyState);
    console.log('  - DOMContentLoaded ya disparado:', document.readyState !== 'loading');
    
    // Verificar elementos críticos
    const criticalElements = [
        'ganttChart',
        'algorithmSelect',
        'loadFCFSIOExample',
        'simulate'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  - ${id}:`, !!element);
    });
}

function forceSimulatorInit() {
    console.log('🔧 Forzando inicialización del simulador...');
    
    try {
        // Asegurarse que el DOM esté listo
        if (document.readyState === 'loading') {
            console.log('⏳ DOM aún cargando, esperando...');
            document.addEventListener('DOMContentLoaded', forceSimulatorInit);
            return;
        }
        
        // Crear simulador
        if (!window.simulator) {
            window.simulator = new ProcessSimulator();
            console.log('✅ Simulador forzado creado exitosamente');
        } else {
            console.log('ℹ️ Simulador ya existe');
        }
        
        // Verificar que funcione
        setTimeout(() => {
            debugFCFSIOButton();
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al forzar inicialización:', error);
    }
}

console.log(`
🛠️ Scripts de debug de inicialización cargados:
- debugSimulatorInit(): Verifica clases disponibles
- checkDOMReady(): Verifica estado del DOM
- forceSimulatorInit(): Fuerza crear el simulador

Ejecuta debugSimulatorInit() primero para ver qué está faltando.
`);

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.debugSimulatorInit = debugSimulatorInit;
    window.checkDOMReady = checkDOMReady;
    window.forceSimulatorInit = forceSimulatorInit;
}
