/*
  Archivo: frontend/src/components/WorkspaceLayout/workspace-layout.component.js
  Propósito: Gestiona la maquetación y la interacción de los paneles principales.
*/
const WorkspaceLayoutManager = (function () {
  'use strict';
  
  const panels = {
    left: { 
      panel: null, 
      button: null
    },
    right: { 
      panel: null, 
      button: null 
    }
  };

  /**
   * @private
   * Actualiza los tooltips de los botones de colapsar paneles con el idioma actual.
   */
  function translatePanelToggleButtons() {
    for (const panelKey in panels) {
      const { panel, button } = panels[panelKey];
      if (!panel || !button) continue;
      
      const isCollapsed = panel.classList.contains('is-collapsed');
      if (panelKey === 'left') {
        button.title = isCollapsed ? TranslationService.t('tooltip_show_left_panel') : TranslationService.t('tooltip_hide_left_panel');
      } else {
        button.title = isCollapsed ? TranslationService.t('tooltip_show_right_panel') : TranslationService.t('tooltip_hide_right_panel');
      }
    }
  }

  /**
   * Inicializa la funcionalidad para colapsar y expandir los paneles laterales.
   */
  function initializePanelToggling() {
    panels.left.panel = document.getElementById('leftPanel');
    panels.left.button = document.getElementById('toggleLeftPanelBtn');
    panels.right.panel = document.getElementById('rightPanel');
    panels.right.button = document.getElementById('toggleRightPanelBtn');

    function togglePanel(panelKey) {
      const { panel } = panels[panelKey];
      if (!panel) return;
      try {
        panel.classList.toggle('is-collapsed');
        translatePanelToggleButtons(); // Re-traducir al cambiar estado
      } catch (error) {
        console.error('Error al colapsar/expandir el panel:', error);
        // MODIFICADO: Se usa clave de traducción
        ToastHandler.showToast(TranslationService.t('toast_panel_error'));
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
   * @private
   * Actualiza los títulos de los botones de vistas (Biblioteca, Léxico).
   */
  function translateViewButtons() {
    const panel = document.getElementById('leftPanel');
    if (!panel) return;
    
    const viewButtons = panel.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
      const viewId = button.dataset.view;
      if (viewId === 'libraryView') {
        button.title = TranslationService.t('library_title');
      } else if (viewId === 'lexiconView') {
        button.title = TranslationService.t('lexicon_title');
      }
    });
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
        // MODIFICADO: Se usa clave de traducción
        ToastHandler.showToast(TranslationService.t('toast_view_change_error'));
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
          const isActive = focusModeButton.classList.contains('is-active');
          // MODIFICADO: Se usa clave de traducción
          const messageKey = isActive ? 'toast_focus_mode_activated' : 'toast_focus_mode_deactivated';
          ToastHandler.showToast(TranslationService.t(messageKey));
        } catch (error) {
          console.error('Error al alternar modo focalizado:', error);
          // MODIFICADO: Se usa clave de traducción
          ToastHandler.showToast(TranslationService.t('toast_focus_mode_error'));
        }
      });
    }
  }

  /**
   * @private
   * Vuelve a traducir todos los textos controlados por este componente.
   * AHORA ES MANEJADO GLOBALMENTE POR 'ui-translator.js', pero esta función
   * se mantiene para lógica específica del componente si es necesaria.
   */
  function translateComponent() {
    // La traducción de tooltips ahora es manejada por el UITranslator global.
    // Esta función podría usarse para actualizar estados internos si fuera necesario.
  }

  /**
   * Función principal que arranca toda la lógica del layout.
   */
  function initialize() {
    try {
      initializePanelToggling();
      initializeViewSwitching('leftPanel');
      initializeFocusModeButton();
      
      // La traducción ahora es global y no necesita ser manejada aquí.
      // El UITranslator se encarga de actualizar los 'title' de los botones.
      
      console.log('Componente WorkspaceLayoutManager inicializado.');
    } catch (error) {
      console.error('Error al inicializar WorkspaceLayoutManager.', error);
    }
  }

  return {
    initialize,
  };
})();