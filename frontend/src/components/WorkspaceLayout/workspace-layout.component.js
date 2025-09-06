/*
  Archivo: frontend/src/components/WorkspaceLayout/workspace-layout.component.js
  (VERSIÓN CON TÍTULOS Y ROTACIÓN DEL BOTÓN DE PANEL DERECHO)
*/
const WorkspaceLayoutManager = (function () {
  'use strict';

  /**
   * Inicializa la funcionalidad para colapsar y expandir los paneles laterales.
   */
  function initializePanelToggling() {
    const panels = {
      left: { 
        panel: document.getElementById('leftPanel'), 
        button: document.getElementById('toggleLeftPanelBtn') 
      },
      right: { 
        panel: document.getElementById('rightPanel'), 
        button: document.getElementById('toggleRightPanelBtn') 
      }
    };

    function togglePanel(panelKey) {
      const { panel, button } = panels[panelKey];
      if (!panel || !button) return;

      try {
        panel.classList.toggle('is-collapsed');
        // Actualizar el título del botón según el estado del panel
        if (panel.classList.contains('is-collapsed')) {
          button.title = (panelKey === 'left') ? 'Mostrar Panel Izquierdo' : 'Mostrar Panel Derecho';
        } else {
          button.title = (panelKey === 'left') ? 'Ocultar Panel Izquierdo' : 'Ocultar Panel Derecho';
        }
      } catch (error) {
        console.error('Error al colapsar/expandir el panel:', error);
        ToastHandler.showToast('Error al operar el panel.');
      }
    }

    if (panels.left.button) {
      panels.left.button.addEventListener('click', () => togglePanel('left'));
    }
    if (panels.right.button) {
      panels.right.button.addEventListener('click', () => togglePanel('right'));
    }
  }

  /**
   * Inicializa la lógica para alternar vistas (Biblioteca, Léxico, etc.) dentro de un panel.
   * @param {string} panelId - El ID del panel (ej. 'leftPanel').
   */
  function initializeViewSwitching(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const panelTitle = document.getElementById(`${panelId}Title`);
    const viewButtons = Array.from(panel.querySelectorAll('[data-view]'));
    const views = Array.from(panel.querySelectorAll('.l-side-panel__content'));

    function showView(viewId, buttonElement) {
      views.forEach(view => view.classList.add('is-hidden'));
      viewButtons.forEach(btn => btn.classList.remove('is-active'));
      
      const viewElement = document.getElementById(viewId);
      if (viewElement) {
        viewElement.classList.remove('is-hidden');
        buttonElement.classList.add('is-active');
        if (panelTitle) {
          panelTitle.textContent = buttonElement.title;
        }
      }
    }

    function handleViewToggle(event) {
      try {
        const clickedButton = event.currentTarget;
        const viewIdToShow = clickedButton.dataset.view;

        if (panel.classList.contains('is-collapsed')) {
          panel.classList.remove('is-collapsed');
        }

        if (clickedButton.classList.contains('is-active')) {
          clickedButton.classList.remove('is-active');
          views.forEach(view => view.classList.add('is-hidden'));
          if (panelTitle) panelTitle.textContent = '';
          return;
        }

        showView(viewIdToShow, clickedButton);

      } catch (error) {
        console.error(`Error al cambiar de vista en ${panelId}:`, error);
        ToastHandler.showToast('Oops! No se pudo abrir la sección.');
      }
    }
    
    viewButtons.forEach(button => {
      button.addEventListener('click', handleViewToggle);
    });
    
    views.forEach(view => view.classList.add('is-hidden'));
    viewButtons.forEach(btn => btn.classList.remove('is-active'));
    if (panelTitle) {
      panelTitle.textContent = '';
    }
  }

  /**
   * Inicializa la lógica para el botón de Modo de Lectura Focalizada.
   */
  function initializeFocusModeButton() {
    const focusModeButton = document.getElementById('btnFocus');
    if (focusModeButton) {
      focusModeButton.addEventListener('click', () => {
        try {
          focusModeButton.classList.toggle('is-active');
          // UserSettingsState.toggleFocusMode(); 
          ToastHandler.showToast(`Modo Focalizado: ${focusModeButton.classList.contains('is-active') ? 'Activado' : 'Desactivado'}`);
        } catch (error) {
          console.error('Error al alternar modo focalizado:', error);
          ToastHandler.showToast('Error al cambiar el modo focalizado.');
        }
      });
    }
  }

  /**
   * Función principal que arranca toda la lógica del layout.
   */
  function initialize() {
    try {
      initializePanelToggling();
      initializeViewSwitching('leftPanel');
      initializeFocusModeButton();
      
      console.log('Componente WorkspaceLayoutManager inicializado.');
    } catch (error) {
      console.error('Error al inicializar WorkspaceLayoutManager.', error);
    }
  }

  return {
    initialize,
  };
})();