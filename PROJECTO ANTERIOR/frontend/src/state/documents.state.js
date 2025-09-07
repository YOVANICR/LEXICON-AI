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
    const new_document_object = {
      id: `doc_${timestamp_now}`,
      title: document_title.trim() || `Documento sin título ${timestamp_now}`,
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
      localStorage.setItem('currentActiveDocId', document_id);
      
      // Notifica a los componentes interesados (como el Lector) qué documento se ha seleccionado.
      EventBus.publish('documents:documentSelected', { document: selected_document });
    }
  }

  // API Pública del Módulo
  return {
    initialize,
    addDocument,
    deleteDocumentById,
    getAllDocuments,
    setCurrentActiveDocumentById // <- Esta función faltaba en el return
  };
})();