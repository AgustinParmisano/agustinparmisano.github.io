# Simulador de Procesos FCFS

Un simulador interactivo del algoritmo de planificación de procesos **First Come, First Served (FCFS)** desarrollado con HTML, CSS y JavaScript vanilla.

## 🚀 Características

- **Algoritmo FCFS**: Implementación completa del algoritmo First Come, First Served
- **Visualización de Gantt**: Diagrama de Gantt interactivo con colores diferenciados por proceso
- **Carga de archivos YAML**: Soporte para cargar configuraciones de procesos desde archivos YAML
- **Ejemplo incluido**: Datos de ejemplo basados en un caso de estudio real
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
├── ganttChart.js           # Generador de diagramas de Gantt
├── main.js                 # Módulo principal que integra todo
├── ejemplo_procesos.yaml   # Archivo de ejemplo con datos de procesos
└── README.md               # Este archivo
```

## 🛠️ Instalación y Uso

1. **Clona o descarga** los archivos del proyecto
2. **Abre** `index.html` en tu navegador web
3. **Carga un archivo YAML** con datos de procesos o usa el ejemplo incluido
4. **Haz clic** en "Simular Procesos" para ejecutar el algoritmo

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

algorithm: "FCFS"
```

### Campos requeridos:
- `name`: Nombre del proceso (string)
- `cpu_time`: Tiempo de CPU requerido (número entero positivo)
- `arrival_time`: Tiempo de llegada (número entero >= 0)

## 📊 Ejemplo de Datos

El simulador incluye un ejemplo basado en el siguiente caso:

| Proceso | CPU | Llegada |
|---------|-----|---------|
| P1      | 9   | 0       |
| P2      | 5   | 1       |
| P3      | 3   | 2       |
| P4      | 7   | 3       |

**Resultados esperados:**
- Tiempo de respuesta promedio: 8.0
- Tiempo de espera promedio: 8.0

## 🎯 Funcionalidades

### Visualización Principal
- **Diagrama de Gantt**: Muestra la ejecución de procesos en una línea temporal
- **Tabla de procesos**: Datos de entrada y resultados calculados
- **Cola de listos**: Estado de la cola por cada unidad de tiempo
- **Estadísticas**: Métricas de rendimiento del algoritmo

### Interactividad
- **Drag & Drop**: Arrastra archivos YAML directamente al simulador
- **Tooltips**: Información detallada al pasar el mouse sobre los procesos
- **Mensajes informativos**: Feedback visual para todas las acciones
- **Botón de ejemplo**: Carga rápida de datos de prueba

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

## 📈 Algoritmo FCFS

El algoritmo **First Come, First Served** es uno de los más simples de planificación de procesos:

1. Los procesos se ejecutan en el orden de llegada
2. No hay desalojo (non-preemptive)
3. Un proceso debe terminar completamente antes de que inicie el siguiente
4. Simple de implementar pero puede causar el "convoy effect"

### Fórmulas utilizadas:
- **Tiempo de respuesta** = Tiempo de inicio - Tiempo de llegada
- **Tiempo de espera** = Tiempo de respuesta (en FCFS no hay preemption)
- **Tiempo de turnaround** = Tiempo de finalización - Tiempo de llegada

## 🎨 Personalización

### Colores de procesos
Los procesos se muestran con diferentes colores en el diagrama de Gantt. Puedes personalizar los colores editando las clases CSS `.process-1`, `.process-2`, etc. en `styles.css`.

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

**Desarrollado como herramienta educativa para el estudio de algoritmos de planificación de procesos del sistema operativo.**