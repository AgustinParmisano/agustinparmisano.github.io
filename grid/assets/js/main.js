class ImageGrid {
  constructor() {
    this.gridRows = 4;
    this.gridCols = 6;
    this.showBorders = true;
    this.aspectRatio = true;
    this.images = [];
    this.allImages = []; // Pool completo de imágenes disponibles
    this.cellSize = 0; // Tamaño calculado de cada celda
    this.resizeTimeout = null; // Para debounce del resize
    this.fixedImages = new Set(); // Posiciones fijas (solo índices)
    this.fixedImagesData = new Map(); // Datos de imágenes fijas: posición -> {imageData, isFixed: true}
    this.selectedCell = null; // Celda seleccionada para intercambio
    
    // Sistema de navegación
    this.navigationHistory = []; // Historial de estados (solo imágenes no fijas)
    this.currentHistoryIndex = -1; // Índice actual en el historial
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadAvailableImages();
    this.generateGrid();
  }

  bindEvents() {
    // Botón aplicar configuración
    const applyBtn = document.getElementById('apply-config');
    applyBtn.addEventListener('click', () => this.applyConfiguration());

    // Cerrar modal al aplicar
    const modal = document.getElementById('configModal');
    modal.addEventListener('hidden.bs.modal', () => {
      this.generateGrid();
    });

    // Redimensionar grid cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
      this.debounceResize();
    });

    // Botones de navegación
    const navLeft = document.getElementById('nav-left');
    const navRight = document.getElementById('nav-right');
    
    navLeft.addEventListener('click', () => this.navigateLeft());
    navRight.addEventListener('click', () => this.navigateRight());

    // Botón de descarga
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', () => this.downloadGridAsImage());

    // Navegación con teclado
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

    // Ajuste inicial tras el primer render
    window.requestAnimationFrame(() => {
      this.generateGrid();
      this.saveCurrentState(); // Guardar estado inicial
      this.updateNavigationButtons();
    });
  }

  async loadAvailableImages() {
    // Cargar imágenes locales únicas (100 archivos)
    this.allImages = this.generateLocalImages();
    this.images = []; // Se llenará según el tamaño del grid, garantizando unicidad
  }

  generateLocalImages() {
    const images = [];
    
    // Usar las 100 imágenes locales descargadas (únicas)
    for (let i = 1; i <= 100; i++) {
      const imageNumber = i.toString().padStart(3, '0');
      images.push({
        url: `imagenes/imagen_${imageNumber}.jpg`,
        alt: `Imagen ${i}`,
        id: i
      });
    }
    
    return images;
  }

  applyConfiguration() {
    // Obtener configuración del modal
    const selectedSize = document.querySelector('input[name="gridSize"]:checked').value;
    const showBorders = document.getElementById('showBorders').checked;
    const aspectRatio = document.getElementById('aspectRatio').checked;

    // Parsear el tamaño del grid (formato: "filas x columnas")
    const [rows, cols] = selectedSize.split('x').map(num => parseInt(num));
    this.gridRows = rows;
    this.gridCols = cols;
    this.showBorders = showBorders;
    this.aspectRatio = aspectRatio;

    // Actualizar información en el footer
    this.updateGridInfo();

    // Mostrar spinner
    this.showLoading();

    // Regenerar grid después de un pequeño delay para mostrar el spinner
    setTimeout(() => {
      this.generateGrid();
      this.hideLoading();
      
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('configModal'));
      modal.hide();
    }, 500);
  }

  updateGridInfo() {
    const gridInfo = document.getElementById('grid-info');
    const totalImages = this.gridRows * this.gridCols;
    gridInfo.textContent = `Grid: ${this.gridRows}x${this.gridCols} (${totalImages} imágenes)`;
  }

  showLoading() {
    document.getElementById('loading-spinner').classList.remove('d-none');
  }

  hideLoading() {
    document.getElementById('loading-spinner').classList.add('d-none');
  }

  // Calcular tamaño óptimo del grid basado en viewport
  calculateOptimalGridSize() {
    const headerHeight = 80; // Altura aproximada del header
    const footerHeight = 70; // Altura aproximada del footer
    const mainPadding = 64;  // Padding del main container (32px * 2)
    const gridGap = 8;       // Gap entre celdas
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Espacio disponible
    const availableHeight = viewportHeight - headerHeight - footerHeight - mainPadding;
    const availableWidth = viewportWidth - 64; // Margen horizontal del container (32px * 2)
    
    // Calcular tamaño de celda basado en altura y ancho disponible
    const totalGapHeight = gridGap * (this.gridRows - 1);
    const totalGapWidth = gridGap * (this.gridCols - 1);
    
    const maxCellHeight = (availableHeight - totalGapHeight) / this.gridRows;
    const maxCellWidth = (availableWidth - totalGapWidth) / this.gridCols;
    
    // Usar el menor para mantener proporción cuadrada de las celdas
    this.cellSize = Math.floor(Math.min(maxCellHeight, maxCellWidth));
    
    // Asegurar un tamaño mínimo
    this.cellSize = Math.max(this.cellSize, 30);
  }

  // Aplicar el tamaño calculado al grid
  applyGridSize() {
    const container = document.getElementById('grid-container');
    const gridGap = 8;
    
    // Aplicar dimensiones fijas al grid
    const totalWidth = (this.cellSize * this.gridCols) + (gridGap * (this.gridCols - 1));
    const totalHeight = (this.cellSize * this.gridRows) + (gridGap * (this.gridRows - 1));
    
    container.style.width = `${totalWidth}px`;
    container.style.height = `${totalHeight}px`;
    container.style.gridTemplateColumns = `repeat(${this.gridCols}, ${this.cellSize}px)`;
    container.style.gridTemplateRows = `repeat(${this.gridRows}, ${this.cellSize}px)`;
  }

  generateGrid() {
    // Calcular tamaño óptimo antes de generar
    this.calculateOptimalGridSize();
    
    const container = document.getElementById('grid-container');
    const totalImages = this.gridRows * this.gridCols;

    // Asegurar imágenes únicas iniciales para el tamaño actual
    this.ensureUniqueImagesForGrid(totalImages);

    // Limpiar contenido previo
    container.innerHTML = '';

    // Aplicar tamaño calculado
    this.applyGridSize();

    // Generar celdas
    for (let i = 0; i < totalImages; i++) {
      const cell = this.createImageCell(i);
      container.appendChild(cell);
    }

    // Actualizar info del grid
    this.updateGridInfo();
  }

  createImageCell(index) {
    const cell = document.createElement('div');
    cell.className = 'image-cell';
    cell.dataset.index = index; // Guardar el índice para referencia
    
    // Aplicar configuraciones
    if (this.showBorders) {
      cell.classList.add('bordered');
    }
    
    if (this.aspectRatio) {
      cell.classList.add('square');
    }

    // Verificar si la imagen está fija
    if (this.fixedImages.has(index)) {
      cell.classList.add('fixed');
    }

    // Agregar event listener para clics
    cell.addEventListener('click', (e) => this.handleCellClick(e, index));

    // Crear contenido interno
    const inner = document.createElement('div');
    inner.className = 'inner';

    // Verificar si hay imagen disponible
    if (index < this.images.length) {
      const imageData = this.images[index];
      const img = document.createElement('img');
      
      img.src = imageData.url;
      img.alt = imageData.alt;
      img.loading = 'lazy';
      
      // Manejar errores de carga
      img.addEventListener('error', () => {
        inner.innerHTML = `
          <div class="text-center text-muted">
            <i class="fas fa-image fa-2x mb-2"></i>
            <div class="small">Imagen ${index + 1}</div>
          </div>
        `;
      });

      inner.appendChild(img);
    } else {
      // Placeholder para imágenes no disponibles
      inner.innerHTML = `
        <div class="text-center text-muted">
          <i class="fas fa-image fa-2x mb-2"></i>
          <div class="small">Imagen ${index + 1}</div>
        </div>
      `;
    }

    cell.appendChild(inner);
    return cell;
  }

  // Manejar clic en celda
  handleCellClick(event, index) {
    event.preventDefault();
    
    // Verificar si se mantiene presionada alguna tecla para intercambio
    const isShiftPressed = event.shiftKey;
    
    if (isShiftPressed) {
      // Modo intercambio con Shift + clic
      this.handleImageSwap(event, index);
    } else {
      // Modo normal: alternar estado fijo con un solo clic
      this.toggleFixedState(index);
    }
  }
  
  // Manejar intercambio de imágenes (solo con Shift)
  handleImageSwap(event, index) {
    // Si la imagen está fija, no hacer nada para intercambio
    if (this.fixedImages.has(index)) {
      return;
    }
    
    const cell = event.currentTarget;
    
    // Si no hay celda seleccionada, seleccionar esta
    if (!this.selectedCell) {
      this.selectedCell = { index, element: cell };
      cell.classList.add('selected');
    } else if (this.selectedCell.index === index) {
      // Si se hace clic en la misma celda, deseleccionar
      this.deselectCell();
    } else {
      // Si la segunda celda no está fija, intercambiar
      if (!this.fixedImages.has(index)) {
        this.swapImages(this.selectedCell.index, index);
      }
      this.deselectCell();
    }
  }
  
  // Alternar estado fijo de una imagen
  toggleFixedState(index) {
    if (this.fixedImages.has(index)) {
      // Desfijar: eliminar de estructura fija
      this.fixedImages.delete(index);
      this.fixedImagesData.delete(index);
    } else {
      // Fijar: guardar imagen en estructura separada
      this.fixedImages.add(index);
      if (this.images[index]) {
        this.fixedImagesData.set(index, {
          imageData: this.images[index],
          position: index,
          isFixed: true
        });
      }
    }
    
    // Actualizar visual de la celda
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (cell) {
      cell.classList.toggle('fixed', this.fixedImages.has(index));
    }
  }
  
  // Deseleccionar celda actual
  deselectCell() {
    if (this.selectedCell) {
      this.selectedCell.element.classList.remove('selected');
      this.selectedCell = null;
    }
  }
  
  // Intercambiar imágenes entre dos posiciones
  swapImages(index1, index2) {
    // Intercambiar los datos de las imágenes
    const temp = this.images[index1];
    this.images[index1] = this.images[index2];
    this.images[index2] = temp;
    
    // Actualizar el contenido visual de las celdas
    this.updateCellContent(index1);
    this.updateCellContent(index2);
  }
  
  // Actualizar el contenido visual de una celda
  updateCellContent(index) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (!cell) return;
    
    const inner = cell.querySelector('.inner');
    if (!inner) return;
    
    // Limpiar contenido actual
    inner.innerHTML = '';
    
    // Verificar si hay imagen disponible
    if (index < this.images.length) {
      const imageData = this.images[index];
      const img = document.createElement('img');
      
      img.src = imageData.url;
      img.alt = imageData.alt;
      img.loading = 'lazy';
      
      // Manejar errores de carga
      img.addEventListener('error', () => {
        inner.innerHTML = `
          <div class="text-center text-muted">
            <i class="fas fa-image fa-2x mb-2"></i>
            <div class="small">Imagen ${index + 1}</div>
          </div>
        `;
      });

      inner.appendChild(img);
    } else {
      // Placeholder para imágenes no disponibles
      inner.innerHTML = `
        <div class="text-center text-muted">
          <i class="fas fa-image fa-2x mb-2"></i>
          <div class="small">Imagen ${index + 1}</div>
        </div>
      `;
    }
  }

  // ==================== SISTEMA DE NAVEGACIÓN ====================
  
  // Guardar estado actual en el historial (solo imágenes no fijas)
  saveCurrentState() {
    const totalImages = this.gridRows * this.gridCols;
    const nonFixedImages = [];
    
    // Guardar solo las imágenes que no están fijas
    for (let i = 0; i < totalImages; i++) {
      if (!this.fixedImages.has(i)) {
        nonFixedImages[i] = this.images[i] || null;
      } else {
        nonFixedImages[i] = null; // Marcar como posición fija
      }
    }
    
    const currentState = {
      nonFixedImages: nonFixedImages
    };
    
    // Si estamos en medio del historial, eliminar estados futuros
    if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
      this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
    }
    
    this.navigationHistory.push(currentState);
    this.currentHistoryIndex = this.navigationHistory.length - 1;
    
    // Limitar historial a 20 estados
    if (this.navigationHistory.length > 20) {
      this.navigationHistory.shift();
      this.currentHistoryIndex--;
    }
    
    this.updateNavigationButtons();
  }
  
  // Navegar hacia atrás (izquierda)
  navigateLeft() {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      this.restoreState(this.navigationHistory[this.currentHistoryIndex]);
      this.updateNavigationButtons();
    }
  }
  
  // Navegar hacia adelante (derecha)
  navigateRight() {
    // Si hay un estado futuro en el historial, restaurarlo
    if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
      this.currentHistoryIndex++;
      this.restoreState(this.navigationHistory[this.currentHistoryIndex]);
    } else {
      // Si no hay estado futuro, generar uno nuevo
      this.generateRandomImagesForNonFixed();
      this.updateAllNonFixedCells();
      this.saveCurrentState();
    }
    
    this.updateNavigationButtons();
  }
  
  // Restaurar un estado del historial (mantener fijas las actuales)
  restoreState(state) {
    const totalImages = this.gridRows * this.gridCols;
    
    // Restaurar arreglo completo combinando fijas y no fijas
    this.images = new Array(totalImages);
    
    // Primero, colocar las imágenes fijas en sus posiciones
    for (const [position, fixedData] of this.fixedImagesData.entries()) {
      if (position < totalImages) {
        this.images[position] = fixedData.imageData;
      }
    }
    
    // Luego, restaurar las imágenes no fijas del historial
    for (let i = 0; i < totalImages; i++) {
      if (!this.fixedImages.has(i) && state.nonFixedImages[i]) {
        this.images[i] = state.nonFixedImages[i];
      }
    }
    
    // Regenerar grid visual
    this.generateGrid();
  }
  
  // Generar imágenes random para posiciones no fijas evitando duplicados en TODO el grid
  generateRandomImagesForNonFixed() {
    const totalImages = this.gridRows * this.gridCols;

    // Primero, restaurar imágenes fijas desde la estructura separada
    this.images = new Array(totalImages);
    for (const [position, fixedData] of this.fixedImagesData.entries()) {
      if (position < totalImages) {
        this.images[position] = fixedData.imageData;
      }
    }

    // Conjunto de IDs ya usados por imágenes fijas
    const usedIds = new Set();
    for (const [position, fixedData] of this.fixedImagesData.entries()) {
      if (position < totalImages) {
        usedIds.add(fixedData.imageData.id);
      }
    }

    // Determinar posiciones libres (no fijas)
    const nonFixedPositions = [];
    for (let i = 0; i < totalImages; i++) {
      if (!this.fixedImages.has(i)) {
        nonFixedPositions.push(i);
      }
    }

    // Candidatos disponibles que no están usados por imágenes fijas
    let candidates = this.allImages.filter(img => !usedIds.has(img.id));

    // Si no hay suficientes candidatos únicos, usar todos disponibles
    if (candidates.length < nonFixedPositions.length) {
      candidates = [...this.allImages];
    }

    // Barajar candidatos
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Asignar candidatos a posiciones no fijas, evitando duplicados en el grid actual
    const newUsed = new Set(usedIds); // Incluir IDs ya usados por fijas
    let ci = 0;
    
    for (const pos of nonFixedPositions) {
      // Buscar candidato que no esté ya usado en este grid
      let chosen = null;
      let attempts = 0;
      
      while (!chosen && attempts < candidates.length) {
        const candidate = candidates[(ci + attempts) % candidates.length];
        if (!newUsed.has(candidate.id)) {
          chosen = candidate;
          newUsed.add(candidate.id);
        }
        attempts++;
      }
      
      // Si todos están usados, usar el siguiente disponible (fallback)
      if (!chosen) {
        chosen = candidates[ci % candidates.length];
      }
      
      this.images[pos] = chosen;
      ci++;
    }
  }
  
  // Actualizar todas las celdas no fijas visualmente
  updateAllNonFixedCells() {
    const totalImages = this.gridRows * this.gridCols;
    
    for (let i = 0; i < totalImages; i++) {
      if (!this.fixedImages.has(i)) {
        this.updateCellContent(i);
      }
    }
  }
  
  // Actualizar estado de los botones de navegación
  updateNavigationButtons() {
    const navLeft = document.getElementById('nav-left');
    const navRight = document.getElementById('nav-right');
    
    // Botón izquierda: habilitado si hay historial previo
    if (navLeft) navLeft.disabled = this.currentHistoryIndex <= 0;
    
    // Botón derecha: habilitado si hay al menos una imagen en el pool
    if (navRight) navRight.disabled = this.allImages.length === 0;
  }

  // ==================== NAVEGACIÓN CON TECLADO ====================
  
  // Manejar navegación con teclado
  handleKeyboardNavigation(event) {
    // Solo procesar si no hay modales abiertos
    if (document.querySelector('.modal.show')) {
      return;
    }
    
    // Solo procesar si no estamos escribiendo en algún input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch(event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.navigateLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigateRight();
        break;
      case 'Escape':
        // Deseleccionar celda si hay alguna seleccionada
        this.deselectCell();
        break;
    }
  }
  
  // Debounce para resize de ventana
  debounceResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.generateGrid();
    }, 150);
  }

  // ==================== DESCARGA DE GRID ====================
  
  // Capturar grid como imagen y descargarlo
  async downloadGridAsImage() {
    try {
      // Mostrar indicador de carga
      this.showLoading();
      
      const gridElement = document.getElementById('grid-container');
      if (!gridElement) {
        throw new Error('Grid no encontrado');
      }

      // Crear canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar canvas con el tamaño exacto del grid
      const gridGap = 8;
      const totalWidth = (this.cellSize * this.gridCols) + (gridGap * (this.gridCols - 1));
      const totalHeight = (this.cellSize * this.gridRows) + (gridGap * (this.gridRows - 1));
      
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      
      // Fondo del canvas
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Renderizar cada celda del grid
      const totalImages = this.gridRows * this.gridCols;
      const promises = [];
      
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const cellIndex = row * this.gridCols + col;
          const x = col * (this.cellSize + gridGap);
          const y = row * (this.cellSize + gridGap);
          
          if (cellIndex < totalImages && this.images[cellIndex]) {
            const imageData = this.images[cellIndex];
            promises.push(this.drawImageOnCanvas(ctx, imageData.url, x, y, this.cellSize, this.cellSize));
          } else {
            // Dibujar celda vacía
            ctx.fillStyle = '#dee2e6';
            ctx.fillRect(x, y, this.cellSize, this.cellSize);
          }
        }
      }
      
      // Esperar a que todas las imágenes se carguen
      await Promise.all(promises);
      
      // Dibujar bordes para imágenes fijas después de cargar todas las imágenes
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const cellIndex = row * this.gridCols + col;
          const x = col * (this.cellSize + gridGap);
          const y = row * (this.cellSize + gridGap);
          
          if (this.fixedImages.has(cellIndex)) {
            ctx.strokeStyle = '#28a745';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);
          }
        }
      }
      
      // Descargar imagen
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `image-grid-${this.gridRows}x${this.gridCols}-${timestamp}.jpeg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      
      // Simular clic en el enlace para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.hideLoading();
      
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      this.hideLoading();
      alert('Error al descargar la imagen. Por favor, intenta de nuevo.');
    }
  }

  // Función auxiliar: asegurar imágenes únicas iniciales del grid
  ensureUniqueImagesForGrid(totalImages) {
    const needed = totalImages;
    this.images = new Array(needed);

    // Primero, colocar imágenes fijas desde la estructura separada
    const usedIds = new Set();
    for (const [position, fixedData] of this.fixedImagesData.entries()) {
      if (position < needed) {
        this.images[position] = fixedData.imageData;
        usedIds.add(fixedData.imageData.id);
      }
    }

    // Identificar posiciones libres (no fijas)
    const freePositions = [];
    for (let i = 0; i < needed; i++) {
      if (!this.fixedImages.has(i)) {
        freePositions.push(i);
      }
    }

    // Candidatos disponibles excluyendo los ya usados por imágenes fijas
    let candidates = this.allImages.filter(img => !usedIds.has(img.id));

    // Si no hay suficientes candidatos, usar todas las imágenes
    if (candidates.length < freePositions.length) {
      candidates = [...this.allImages];
    }

    // Barajar candidatos
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Asignar candidatos a posiciones libres evitando duplicados
    const newUsed = new Set(usedIds);
    let ci = 0;
    
    for (const pos of freePositions) {
      let chosen = null;
      let attempts = 0;
      
      // Buscar candidato que no esté ya usado
      while (!chosen && attempts < candidates.length) {
        const candidate = candidates[(ci + attempts) % candidates.length];
        if (!newUsed.has(candidate.id)) {
          chosen = candidate;
          newUsed.add(candidate.id);
        }
        attempts++;
      }
      
      // Fallback si todos están usados
      if (!chosen) {
        chosen = candidates[ci % candidates.length];
      }
      
      this.images[pos] = chosen;
      ci++;
    }
  }

  // Función auxiliar para dibujar imagen en canvas
  drawImageOnCanvas(ctx, imageSrc, x, y, width, height) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          ctx.drawImage(img, x, y, width, height);
        } catch (error) {
          // Si hay error al dibujar, dibujar rectángulo gris
          ctx.fillStyle = '#dee2e6';
          ctx.fillRect(x, y, width, height);
        }
        resolve();
      };
      
      img.onerror = () => {
        // Si la imagen no carga, dibujar un rectángulo gris
        ctx.fillStyle = '#dee2e6';
        ctx.fillRect(x, y, width, height);
        resolve();
      };
      
      img.src = imageSrc;
    });
  }
  
  // Método para cargar imágenes desde la carpeta (si están disponibles)
  async loadLocalImages() {
    try {
      // Este método intentaría cargar imágenes reales de la carpeta imagenes/
      // Pero debido a las limitaciones del navegador, necesitaríamos un servidor
      // Por ahora usamos placeholder images
      console.log('Función para cargar imágenes locales - requiere servidor web');
    } catch (error) {
      console.error('Error cargando imágenes locales:', error);
      // Fallback a placeholder images
      this.images = this.generatePlaceholderImages();
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ImageGrid();
});

// Función auxiliar para detectar si hay imágenes en la carpeta
async function checkLocalImages() {
  // Esta función podría implementarse con fetch() si hay un servidor
  // que liste los archivos de la carpeta imagenes/
  return [];
}
