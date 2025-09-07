/*
  Archivo: frontend/src/components/LexiconTable/lexicon-table.component.js
  Propósito: Gestiona la lógica y el renderizado del panel de la tabla del Léxico.
             Muestra el vocabulario guardado por el usuario y permite filtrarlo y buscarlo.
*/

const LexiconTableComponent = (function () {
  'use strict';

  /**
   * @private
   * Almacena localmente la lista completa del léxico para poder filtrar sin necesidad de recargar.
   * @type {Object.<string, Object>}
   */
  let local_lexicon_cache = {};

  /**
   * @private
   * Renderiza las filas de la tabla del léxico basándose en el caché local y los filtros actuales.
   */
  function renderLexiconTable() {
    const lexicon_as_array = Object.values(local_lexicon_cache);
    const table_body_element = DOM_ELEMENTS.lexiconTableBody;

    table_body_element.innerHTML = ''; // Limpiar la tabla antes de renderizar.

    if (lexicon_as_array.length === 0) {
      table_body_element.innerHTML = '<tr><td colspan="2">Tu léxico está vacío.</td></tr>';
      return;
    }

    const fragment = document.createDocumentFragment();
    lexicon_as_array
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)) // Ordenar por más reciente.
      .forEach(entry => {
        const table_row = document.createElement('tr');
        const status_label = entry.status || 'Sin estado';
        table_row.innerHTML = `
          <td>${entry.lemma}</td>
          <td>${status_label}</td>
        `;
        fragment.appendChild(table_row);
      });
    
    table_body_element.appendChild(fragment);
  }

  /**
   * @private
   * Callback que se ejecuta cuando el estado del léxico cambia.
   * @param {Object} eventData - Los datos del evento, que contienen el léxico actualizado.
   */
  function onLexiconStateChanged(eventData) {
    local_lexicon_cache = eventData.lexicon;
    renderLexiconTable();
  }

  /**
   * Inicializa el componente de la tabla del Léxico.
   */
  function initialize() {
    try {
      // Suscribirse a los cambios del léxico para mantener la tabla actualizada.
      EventBus.subscribe('lexicon:fullListLoaded', onLexiconStateChanged);
      EventBus.subscribe('lexicon:wordUpdated', (data) => {
        // Actualizar el caché local con la palabra modificada y re-renderizar.
        local_lexicon_cache[data.lemma] = data.entry;
        renderLexiconTable();
      });

      console.log('Componente de Tabla de Léxico inicializado.');
    } catch (error) {
      console.error('Error al inicializar el Componente de Tabla de Léxico.', error);
    }
  }

  return {
    initialize,
  };
})();