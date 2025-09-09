/*
  Archivo: frontend/src/components/Library/library.component.js
  Propósito: Gestiona toda la lógica y el renderizado del panel de la Biblioteca,
             incluyendo la lista de documentos y el formulario para añadir nuevos textos.
*/

const LibraryComponent = (function () {
  'use strict';

/**
   * @private
   * Crea y devuelve un elemento HTML de tarjeta de documento a partir de sus datos.
   * @param {object} doc_data - El objeto del documento.
   * @param {boolean} is_active - Si la tarjeta corresponde al documento activo.
   * @returns {HTMLElement} El elemento div de la tarjeta del documento.
   */
  function createDocumentCard(doc_data, is_active = false) {
    try {
      // 1. Contenedores principales para el efecto de volteo
      const card_container = document.createElement('div');
      card_container.className = 'c-document-card';
      if (is_active) {
        card_container.classList.add('c-document-card--is-active');
      }
      card_container.dataset.documentId = doc_data.id;

      const flipper = document.createElement('div');
      flipper.className = 'c-document-card__flipper';

      const front_face = document.createElement('div');
      front_face.className = 'c-document-card__front';

      const back_face = document.createElement('div');
      back_face.className = 'c-document-card__back';

      // 2. Contenido de la Cara FRONTAL
      const title = document.createElement('div');
      title.className = 'c-document-card__title';
      title.textContent = doc_data.title;

      const actions_container = document.createElement('div');
      actions_container.className = 'c-document-card__actions-container';

      // Botón de Estudiar (Icono)
      const study_button = document.createElement('button');
      study_button.className = 'c-document-card__action-button';
      study_button.title = "Estudiar Documento";
      study_button.dataset.action = 'study-document';
      const study_icon = document.createElement('img');
      study_icon.className = 'c-document-card__action-button-icon';
      study_icon.src = is_active ? '../assets/images/lectura2activado.svg' : '../assets/images/lectura2desactivado.svg';
      study_button.appendChild(study_icon);

      // Botón de Editar (Icono)
      const edit_button = document.createElement('button');
      edit_button.className = 'c-document-card__action-button';
      edit_button.title = "Editar Documento";
      edit_button.dataset.action = 'edit-document';
      const edit_icon = document.createElement('img');
      edit_icon.className = 'c-document-card__action-button-icon';
      edit_icon.src = '../assets/images/textodesactivado.svg';
      edit_button.appendChild(edit_icon);
      
      actions_container.append(study_button, edit_button);
      
      front_face.append(title, actions_container);

      // Botón de Anclar
      const pin_button = document.createElement('button');
      pin_button.className = 'c-document-card__pin-button';
      if (doc_data.isPinned) {
        pin_button.classList.add('c-document-card__pin-button--is-pinned');
      }
      pin_button.title = doc_data.isPinned ? "Desanclar documento" : "Anclar documento";
      pin_button.dataset.action = 'toggle-pin';
      const pin_icon = document.createElement('img');
      pin_icon.className = 'c-document-card__pin-button-icon';
      pin_icon.src = doc_data.isPinned ? '../assets/images/Bandera.png' : '../assets/images/BanderaVacia.png';
      pin_icon.alt = 'Anclar';
      pin_button.appendChild(pin_icon);
      front_face.appendChild(pin_button);

      // 3. Contenido de la Cara TRASERA
      const metadata = document.createElement('div');
      metadata.className = 'c-document-card__metadata';
      const formatted_date = new Date(doc_data.lastAccessed).toLocaleString();
      metadata.innerHTML = `<strong>Último acceso:</strong><br>${formatted_date}`;
      back_face.appendChild(metadata);

      // 4. Ensamblaje final
      flipper.append(front_face, back_face);
      card_container.appendChild(flipper);
      
      return card_container;
    } catch (error) {
      console.error("Error al crear la tarjeta del documento:", error);
      // Devuelve un elemento de error para no romper el renderizado.
      const error_element = document.createElement('div');
      error_element.textContent = "Error al cargar esta tarjeta.";
      return error_element;
    }
  }
  /**
   * @private
   * Renderiza la lista completa de documentos en el contenedor.
   * Limpia la lista anterior y dibuja la nueva basándose en los datos recibidos.
   * @param {Object} eventData - Datos del EventBus con la lista de documentos.
   */
  function renderDocumentsList(eventData) {
    // Verificación de seguridad
    if (!eventData || !eventData.documents) {
      console.warn('renderDocumentsList fue llamado sin datos de documentos.');
      return;
    }

    const documents = eventData.documents;
    const active_document_id = eventData.activeDocumentId;
    const listContainer = DOM_ELEMENTS.documentsListContainer;

    // Si el contenedor no existe en el DOM, detenemos la función para evitar errores.
    if (!listContainer) {
      console.error('No se encontró el contenedor de la lista de documentos (docList).');
      return;
    }

    // 1. Limpia la lista anterior de forma segura y eficiente.
    while (listContainer.firstChild) {
      listContainer.removeChild(listContainer.firstChild);
    }
    
    // 2. Muestra un mensaje si no hay documentos.
    if (documents.length === 0) {
      listContainer.innerHTML = `<p class="u-text-muted">${TranslationService.t('library_empty_message')}</p>`;
      return;
    }

    // 3. Crea y añade las nuevas tarjetas a un fragmento para optimizar el rendimiento.
    const fragment = document.createDocumentFragment();
    documents.forEach(doc => {
      const is_card_active = doc.id === active_document_id;
      const cardElement = createDocumentCard(doc, is_card_active);
      fragment.appendChild(cardElement);
    });

    // 4. Añade todas las tarjetas al DOM de una sola vez.
    listContainer.appendChild(fragment);
  }

   /**
   * @private
   * Maneja los clics dentro del contenedor de la lista de documentos.
   * @param {Event} event - El objeto del evento de clic.
   */
  function handleDocumentListClick(event) {
    const target = event.target;
    const card = target.closest('.c-document-card');
    if (!card) return;

    const document_id = card.dataset.documentId;
    const action_button = target.closest('[data-action]');
    
    // Si se hizo clic en un botón de acción específico
    if (action_button) {
      const action = action_button.dataset.action;
      switch (action) {
        case 'study-document':
          DocumentsState.setCurrentActiveDocumentById(document_id);
          break;
        case 'edit-document':
          alert(`Funcionalidad para editar ${document_id} no implementada.`);
          break;
        case 'toggle-pin':
          DocumentsState.togglePinState(document_id);
          break;
      }
    } else {
      // Si se hizo clic en cualquier otra parte de la tarjeta, activa el volteo
      const flipper = card.querySelector('.c-document-card__flipper');
      if (flipper) {
        flipper.classList.toggle('c-document-card__flipper--is-flipped');
      }
    }
  }

  /**
   * Inicializa el componente de la Biblioteca.
   */
  function initialize() {
    try {
      EventBus.subscribe('documents:listChanged', renderDocumentsList);
      
      DOM_ELEMENTS.documentsListContainer.addEventListener('click', handleDocumentListClick);

      console.log('Componente de Biblioteca (con tarjetas v3) inicializado.');
    } catch (error) {
      console.error('Error al inicializar el componente de Biblioteca.', error);
    }
  }

  // API Pública del Componente
  return {
    initialize,
  };
})();