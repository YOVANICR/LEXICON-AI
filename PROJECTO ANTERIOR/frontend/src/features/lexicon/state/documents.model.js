/* ==========================================================================
   Archivo: frontend/src/features/lexicon/state/documents.model.js
   Propósito: (Modelo) Gestiona el estado de los documentos.
   ========================================================================== */
const DocumentsModel = (() => {
  let docs = [];
  let currentDocId = null;
  let onDataChange = () => {}; // Callback para notificar al controlador

  /**
   * Inicializa el modelo. Ya no carga datos, los recibe del controlador.
   * @param {Array} initialDocs - El array de documentos inicial.
   * @param {Function} onDataChangeCallback - La función a llamar cuando los datos cambien.
   */
  function init(initialDocs, onDataChangeCallback) {
    docs = initialDocs || [];
    currentDocId = localStorage.getItem('currentDocId') || null;
    onDataChange = onDataChangeCallback;
    _migrateData(); 
  }
  
  /**
   * Notifica al MainController que los datos han cambiado y necesitan ser guardados.
   */
  function _commit() {
    onDataChange();
  }

  /**
   * Script de migración. No cambia su lógica interna, pero ahora usa el nuevo _commit.
   */
  function _migrateData() {
    if (!Array.isArray(docs)) {
      docs = [];
      return;
    }
    let needsDataUpdate = false;
    docs.forEach(doc => {
      if (doc && typeof doc === 'object') {
        if (typeof doc.lastAccessed === 'undefined') {
          doc.lastAccessed = doc.createdAt || Date.now();
          needsDataUpdate = true;
        }
      }
    });

    if (needsDataUpdate) {
      console.log('Datos de documentos antiguos migrados exitosamente.');
      _commit();
    }
  }

  function getAllDocs() {
    return [...docs];
  }

  function addDocument(title, text) {
    const now = Date.now();
    const newDoc = {
      id: 'doc_' + now,
      title: title.trim() || `Documento ${now}`,
      text: text,
      createdAt: now,
      lastAccessed: now,
      isPinned: false
    };
    docs.unshift(newDoc);
    _commit();
    return newDoc;
  }

  function getDocumentById(id) {
    return docs.find(doc => doc.id === id);
  }

  function deleteDocument(id) {
    docs = docs.filter(doc => doc.id !== id);
    _commit();
  }

  function togglePin(id) {
    const doc = getDocumentById(id);
    if (doc) {
      doc.isPinned = !doc.isPinned;
      _commit();
    }
  }

  function updateLastAccessed(id) {
    const doc = getDocumentById(id);
    if (doc) {
      doc.lastAccessed = Date.now();
      _commit();
    }
  }

  function getCurrentDocId() {
    return currentDocId;
  }

  function setCurrentDocId(id) {
    currentDocId = id;
    if (id) {
      localStorage.setItem('currentDocId', id);
      updateLastAccessed(id); // Esto indirectamente llamará a _commit()
    } else {
      localStorage.removeItem('currentDocId');
    }
  }

  function getCurrentDoc() {
    if (!currentDocId) return null;
    return getDocumentById(currentDocId);
  }
  
  /**
   * Devuelve el estado actual de los documentos para que el controlador lo guarde.
   * @returns {Array} El array de documentos.
   */
  function getDocsState() { 
    return docs; 
  }

  // API Pública del Módulo
  return {
    init,
    getAllDocs,
    addDocument,
    getDocumentById,
    deleteDocument,
    togglePin,
    updateLastAccessed,
    getCurrentDocId,
    setCurrentDocId,
    getCurrentDoc,
    getDocsState,
  };
})();
