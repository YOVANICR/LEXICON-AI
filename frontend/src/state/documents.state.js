/*
  Archivo: frontend/src/state/documents.state.js
  Propósito: Gestiona el estado de los documentos del usuario (crear, leer, eliminar, etc.).
             Actúa como la única fuente de verdad para los datos de los documentos.
             Notifica al resto de la aplicación sobre cualquier cambio a través del EventBus.
*/

const DocumentsState = (function () {
  'use strict';
  
  /**
   * @private
   * @type {Array<Object>}
   * El array que almacena en memoria todos los documentos del usuario.
   */
  let documents_list = [];
  
  /**
   * @private
   * @type {string|null}
   * El ID del documento que está actualmente activo o siendo leído.
   */
  let current_active_document_id = null;

  /**
   * Carga el estado inicial del módulo CON los datos del backend.
   * @param {Array<Object>} initial_documents - La lista de documentos cargada desde el backend.
   */
  function initialize(initial_documents = []) {
    documents_list = initial_documents;
    current_active_document_id = localStorage.getItem('currentActiveDocId');
    
    // Notifica a los componentes (como la Biblioteca) que la lista inicial de documentos está lista.
    EventBus.publish('documents:listChanged', { documents: documents_list });
    console.log('Estado de Documentos inicializado con datos del servidor.');
  }

  /**
   * Agrega un nuevo documento a la lista.
   * @param {string} document_title - El título del nuevo documento.
   * @param {string} document_text_content - El contenido de texto del documento.
   * @returns {Object} El objeto del nuevo documento creado.
   */
  function addDocument(document_title, document_text_content) {
    const timestamp_now = Date.now();
    
    // ✨ CORREGIDO: Nos aseguramos de que el título sea una cadena y tenga un valor por defecto.
    const final_title = (typeof document_title === 'string' && document_title.trim() !== '') 
      ? document_title.trim() 
      : `Texto ${timestamp_now}`;

    const new_document_object = {
      id: `doc_${timestamp_now}`,
      title: final_title, // Usamos la variable corregida
      text: document_text_content,
      createdAt: timestamp_now,
      lastAccessed: timestamp_now,
      isPinned: false
    };
    
    documents_list.unshift(new_document_object);
    
    // Notifica a toda la aplicación que la lista de documentos ha cambiado.
    EventBus.publish('documents:listChanged', { documents: documents_list });
    
    return new_document_object;
  }

  /**
   * Crea un nuevo documento a partir de un texto pegado y lo establece como activo.
   * Esta función actúa como un orquestador entre la creación y la selección.
   * @param {string} pastedTextContent - El contenido de texto plano que el usuario pegó.
   * @returns {void}
   */
  function addAndSelectPastedText(pastedTextContent) {
    try {
      // Validación para asegurar que el texto no esté vacío.
      if (!pastedTextContent || typeof pastedTextContent !== 'string' || pastedTextContent.trim() === '') {
        throw new Error('El contenido del texto pegado no puede estar vacío.');
      }

      // 1. Reutiliza la función existente para crear el objeto del documento.
      const newDocument = addDocument('Texto Pegado', pastedTextContent);
      
      // 2. Establece este nuevo documento como el activo.
      // Esto publicará automáticamente el evento 'documents:documentSelected'
      // que el ReaderComponent está esperando.
      setCurrentActiveDocumentById(newDocument.id);

    } catch (error) {
      console.error('DocumentsState: Error al procesar y seleccionar el texto pegado.', error);
      // En un futuro, podríamos notificar al usuario con un toast de error.
      // ToastHandler.showToast('Error al procesar el texto.');
    }
  }
  /**
   * Elimina un documento de la lista por su ID.
   * @param {string} document_id_to_delete - El ID del documento a eliminar.
   */
  function deleteDocumentById(document_id_to_delete) {
    documents_list = documents_list.filter(doc => doc.id !== document_id_to_delete);
    EventBus.publish('documents:listChanged', { documents: documents_list });
  }

  /**
   * Obtiene todos los documentos.
   * @returns {Array<Object>} Una copia del array de documentos.
   */
  function getAllDocuments() {
    return [...documents_list];
  }

   /**
   * Establece el documento activo actual y notifica a la aplicación.
   * @param {string} document_id - El ID del documento que se ha seleccionado.
   */
  function setCurrentActiveDocumentById(document_id) {
    const selected_document = documents_list.find(doc => doc.id === document_id);

    if (selected_document) {
      current_active_document_id = document_id;
      // Actualizamos la fecha de último acceso al seleccionar el documento
      selected_document.lastAccessed = Date.now();
      localStorage.setItem('currentActiveDocId', document_id);
      
      // Notifica al Lector qué documento específico se ha seleccionado.
      EventBus.publish('documents:documentSelected', { 
          document: selected_document 
      });

      // ✨ CORRECCIÓN CLAVE: Notifica a la Biblioteca y le envía
      // la lista COMPLETA y el ID del documento ACTIVO.
      EventBus.publish('documents:listChanged', {
        documents: documents_list,
        activeDocumentId: current_active_document_id
      });
    }
  }

  function togglePinState(document_id) {
    const document_to_toggle = documents_list.find(doc => doc.id === document_id);
    if (document_to_toggle) {
      document_to_toggle.isPinned = !document_to_toggle.isPinned;
      
      // Reordena la lista para poner los anclados primero
      documents_list.sort((a, b) => b.isPinned - a.isPinned);

      // Notifica a la UI que la lista ha cambiado para que se re-renderice
      EventBus.publish('documents:listChanged', { 
        documents: documents_list,
        activeDocumentId: current_active_document_id 
      });
    }
  }

  // API Pública del Módulo
  return {
    initialize,
    addDocument,
    deleteDocumentById,
    getAllDocuments,
    setCurrentActiveDocumentById, // <- Esta función faltaba en el return
    addAndSelectPastedText,
    togglePinState
  };
})();