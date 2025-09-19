# Simulador de Algoritmos de Planificación de Procesos

Un simulador interactivo de algoritmos de planificación de procesos que incluye **FCFS (First Come, First Served)** y **SJF (Shortest Job First)** desarrollado con HTML, CSS y JavaScript vanilla.

## 🚀 Características

- **Múltiples algoritmos**: Implementación completa de FCFS y SJF con selector interactivo
- **Algoritmo FCFS**: First Come, First Served (no preemptivo)
- **Algoritmo SJF**: Shortest Job First (no preemptivo) con desempate por orden de llegada
- **Visualización de Gantt**: Diagrama de Gantt interactivo con colores diferenciados por proceso
- **Carga de archivos YAML**: Soporte para cargar configuraciones de procesos desde archivos YAML
- **Ejemplos incluidos**: Datos de ejemplo específicos para cada algoritmo
- **Comparación de algoritmos**: Ejemplos que muestran las diferencias entre FCFS y SJF
- **Estadísticas detalladas**: Cálculo automático de tiempos de respuesta, espera y estadísticas promedio
- **Cola de listos**: Visualización del estado de la cola de procesos listos por tiempo
- **Interfaz responsive**: Diseño adaptable para diferentes tamaños de pantalla

## 📁 Estructura del Proyecto

```
process/
├── index.html              # Página principal del simulador
├── styles.css              # Estilos CSS para la interfaz
├── yamlParser.js           # Módulo para parsear archivos YAML
├── fcfsScheduler.js        # Implementación del algoritmo FCFS
├── sjfScheduler.js         # Implementación del algoritmo SJF
├── ganttChart.js           # Generador de diagramas de Gantt
├── main.js                 # Módulo principal que integra todo
├── ejemplo_fcfs.yaml       # Archivo de ejemplo para FCFS
├── ejemplo_sjf.yaml        # Archivo de ejemplo para SJF
└── README.md               # Este archivo
```

## 🔧 Instalación y Uso

1. **Clona o descarga** los archivos del proyecto
2. **Abre** `index.html` en tu navegador web
3. **Selecciona el algoritmo** que deseas simular (FCFS o SJF)
4. **Carga un archivo YAML** con datos de procesos o usa los ejemplos incluidos
5. **Haz clic** en "Simular Procesos" para ejecutar el algoritmo

### Formato del archivo YAML

```yaml
processes:
  - id: 1
    name: "P1"
    cpu_time: 9
    arrival_time: 0
    
  - id: 2
    name: "P2"
    cpu_time: 5
    arrival_time: 1
    
  # ... más procesos

algorithm: "FCFS"  # o "SJF"
```

### Campos requeridos:
- `name`: Nombre del proceso (string)
- `cpu_time`: Tiempo de CPU requerido (número entero positivo)
- `arrival_time`: Tiempo de llegada (número entero >= 0)

## 📊 Ejemplos de Datos

### Ejemplo FCFS
El simulador incluye un ejemplo para FCFS basado en el siguiente caso:

| Proceso | CPU | Llegada |
|---------|-----|---------|
| P1      | 4   | 0       |
| P2      | 3   | 1       |
| P3      | 2   | 3       |
| P4      | 3   | 4       |

### Ejemplo SJF
También incluye un ejemplo optimizado para mostrar las diferencias con FCFS:

| Proceso | CPU | Llegada |
|---------|-----|---------|
| P1      | 6   | 0       |
| P2      | 8   | 0       |
| P3      | 7   | 0       |
| P4      | 3   | 0       |

**Con SJF:** Orden de ejecución P4→P1→P3→P2 (minimiza tiempo de espera)  
**Con FCFS:** Orden de ejecución P1→P2→P3→P4 (orden de llegada)

Esto demuestra cómo SJF evita el "efecto convoy" que puede ocurrir en FCFS.

## 🎯 Funcionalidades

### Visualización Principal
- **Diagrama de Gantt**: Muestra la ejecución de procesos en una línea temporal
- **Tabla de procesos**: Datos de entrada y resultados calculados
- **Cola de listos**: Estado de la cola por cada unidad de tiempo
- **Estadísticas**: Métricas de rendimiento del algoritmo

### Interactividad
- **Selector de algoritmo**: Cambio dinámico entre FCFS y SJF
- **Drag & Drop**: Arrastra archivos YAML directamente al simulador
- **Tooltips**: Información detallada al pasar el mouse sobre los procesos
- **Mensajes informativos**: Feedback visual para todas las acciones
- **Botones de ejemplo**: Carga rápida de datos de prueba para cada algoritmo

### Cálculos Automáticos
- Tiempo de inicio de cada proceso
- Tiempo de finalización
- Tiempo de respuesta (Response Time)
- Tiempo de espera (Wait Time)
- Tiempo de turnaround
- Estadísticas promedio

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica y moderna
- **CSS3**: Estilos responsivos con Flexbox y Grid
- **JavaScript ES6+**: Programación modular con clases
- **js-yaml**: Librería para parsear archivos YAML
- **LocalStorage**: Para persistir configuraciones (opcional)

## 📚 Algoritmos Implementados

### FCFS (First Come, First Served)
El algoritmo **First Come, First Served** es uno de los más simples de planificación de procesos:

1. Los procesos se ejecutan en el orden de llegada
2. No hay desalojo (non-preemptive)
3. Un proceso debe terminar completamente antes de que inicie el siguiente
4. Simple de implementar pero puede causar el "convoy effect"

### SJF (Shortest Job First)
El algoritmo **Shortest Job First** optimiza el tiempo de espera promedio:

1. Selecciona el proceso con menor tiempo de CPU disponible
2. No hay desalojo (non-preemptive en esta implementación)
3. En caso de empate, usa FCFS como criterio de desempate
4. Minimiza el tiempo de espera promedio pero puede causar "starvation"

### Fórmulas utilizadas (ambos algoritmos):
- **Tiempo de espera** = Tiempo de inicio - Tiempo de llegada
- **Tiempo de retorno (turnaround)** = Tiempo de finalización - Tiempo de llegada
- **Tiempo de respuesta** = Tiempo de retorno (en algoritmos no preemptivos)

## 🎨 Personalización

### Colores de procesos
Los procesos se muestran con diferentes colores en el diagrama de Gantt. Puedes personalizar los colores editando las clases CSS `.process-1`, `.process-2`, etc. en `styles.css`.

### Algoritmos personalizados
Para agregar nuevos algoritmos:
1. Crea una nueva clase scheduler siguiendo el patrón de `fcfsScheduler.js` o `sjfScheduler.js`
2. Agrégala al selector en `index.html`
3. Intégrala en `main.js` siguiendo el patrón existente

### Unidad de tiempo visual
La escala visual puede ajustarse modificando la variable `timeUnit` en `ganttChart.js` (por defecto 30px por unidad).

## 🐛 Resolución de Problemas

### Error al cargar archivo YAML
- Verifica que el archivo tenga extensión `.yml` o `.yaml`
- Asegúrate de que la estructura YAML sea correcta
- Revisa que todos los campos requeridos estén presentes

### Diagrama no se muestra
- Verifica que JavaScript esté habilitado en tu navegador
- Abre la consola de desarrollador (F12) para ver errores
- Asegúrate de que todos los archivos JS estén cargados

### Cálculos incorrectos
- Verifica que los tiempos de llegada sean valores enteros
- Los tiempos de CPU deben ser números positivos
- Revisa que no haya procesos duplicados

## 🤝 Contribuciones

Este es un proyecto educativo. Si encuentras errores o tienes sugerencias:

1. Reporta issues detallando el problema
2. Propón mejoras o nuevas funcionalidades
3. Comparte casos de prueba adicionales

## 📝 Licencia

Este proyecto está desarrollado con fines educativos y puede ser usado libremente para aprendizaje y enseñanza de algoritmos de planificación de procesos.

## 📚 Referencias

- Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). Operating System Concepts
- Tanenbaum, A. S., & Bos, H. (2014). Modern Operating Systems
- Stallings, W. (2017). Operating Systems: Internals and Design Principles

---

**Desarrollado como herramienta educativa para el estudio y comparación de algoritmos de planificación de procesos del sistema operativo.**

## 🆆 Nuevas Características (v2.0)

- ✨ **Algoritmo SJF agregado**: Implementación completa del algoritmo Shortest Job First
- 🔄 **Selector dinámico**: Cambia entre algoritmos sin recargar la página
- 📈 **Ejemplos comparativos**: Datos optimizados para mostrar diferencias entre algoritmos
- 🛠️ **Arquitectura modular**: Fácil agregado de nuevos algoritmos
- 📊 **Estadísticas mejoradas**: Métricas detalladas para ambos algoritmos
