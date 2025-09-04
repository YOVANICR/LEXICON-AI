/*
  Archivo: frontend/src/components/Library/library.component.js
  Propósito: Gestiona toda la lógica y el renderizado del panel de la Biblioteca,
             incluyendo la lista de documentos y el formulario para añadir nuevos textos.
*/

const LibraryComponent = (function () {
  'use strict';

  /**
   * @private
   * La función que se ejecuta para renderizar la lista de documentos.
   * @param {Object} eventData - Los datos recibidos del EventBus, que contienen la lista de documentos.
   */
  function renderDocumentsList(eventData) {
    const documents = eventData.documents;
    const listContainer = DOM_ELEMENTS.documentsListContainer;
    
    listContainer.innerHTML = '';
    
    if (!documents || documents.length === 0) {
      listContainer.innerHTML = '<p>No hay documentos en tu biblioteca.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    documents.forEach(doc => {
      const cardElement = document.createElement('div');
      cardElement.className = 'c-doc-card';
      cardElement.innerHTML = `<div class="c-doc-card__title">${doc.title}</div>`;
      cardElement.dataset.documentId = doc.id;
      fragment.appendChild(cardElement);
    });

    listContainer.appendChild(fragment);
  }

  /**
   * @private
   * Maneja el evento de clic en el botón para agregar un nuevo documento.
   */
  function handleAddDocumentClick() {
    const title = DOM_ELEMENTS.documentTitleInput.value;
    const text = DOM_ELEMENTS.documentTextInput.value;

    if (!text.trim()) {
      alert('El texto del documento no puede estar vacío.');
      return;
    }
    
    DocumentsState.addDocument(title, text);

    DOM_ELEMENTS.documentTitleInput.value = '';
    DOM_ELEMENTS.documentTextInput.value = '';
  }
  
  /**
   * @private
   * Maneja los clics dentro del contenedor de la lista de documentos (delegación de eventos).
   * @param {Event} event - El objeto del evento de clic.
   */
  function handleDocumentListClick(event) {
    // Usamos .closest() para encontrar el ancestro más cercano que sea una tarjeta de documento.
    const clicked_card = event.target.closest('.c-doc-card');
    
    // Verificamos que se hizo clic en una tarjeta y que esta tiene un ID de documento.
    if (clicked_card && clicked_card.dataset.documentId) {
      const document_id = clicked_card.dataset.documentId;
      console.log(`Componente Biblioteca: Se hizo clic en el documento ${document_id}`);
      
      // Notifica al estado la INTENCIÓN de cambiar el documento activo.
      DocumentsState.setCurrentActiveDocumentById(document_id);
    }
  }

  /**
   * Inicializa el componente de la Biblioteca.
   */
  function initialize() {
    try {
      // 1. Suscribirse a los eventos relevantes del EventBus.
      EventBus.subscribe('documents:listChanged', renderDocumentsList);
      
      // 2. Asignar los manejadores de eventos a los elementos del DOM.
      DOM_ELEMENTS.addDocumentButton.addEventListener('click', handleAddDocumentClick);
      // Añadimos un único listener al CONTENEDOR. Esto es más eficiente que añadir uno por cada tarjeta.
      DOM_ELEMENTS.documentsListContainer.addEventListener('click', handleDocumentListClick);

      console.log('Componente de Biblioteca inicializado.');
    } catch (error)
    {
      console.error('Error al inicializar el componente de Biblioteca.', error);
    }
  }

  // API Pública del Componente
  return {
    initialize,
  };
})();