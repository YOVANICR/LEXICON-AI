/* ==========================================================================
   Archivo: frontend/src/features/lexicon/components/library.component.js
   Propósito: Componente que gestiona la lógica y renderizado del panel Biblioteca.
   ========================================================================== */

const LibraryComponent = ((documentsModel, dom) => {
  const { elements } = dom;

  function init() {
    elements.addDocBtn.addEventListener('click', _handleAddDoc);
    elements.docListContainer.addEventListener('click', _handleListClick);
    elements.clearFieldsBtn.addEventListener('click', clearNewDocInput);
    elements.exportDbBtn.addEventListener('click', _handleExportDocs);
    elements.importDbBtn.addEventListener('click', _handleImportDocs);
    elements.wipeDbBtn.addEventListener('click', _handleWipeDB);
    elements.searchDocsInput.addEventListener('input', () => {
        MainController.renderLibrary();
    });
    elements.toggleAdvancedBtn.addEventListener('click', () => {
      elements.advancedControlsContainer.classList.toggle('is-visible');
    });
  }

  function _handleAddDoc() {
    const { title, text } = getNewDocInput();
    if (!text.trim()) {
      dom.toast('El texto no puede estar vacío.');
      return;
    }
    const newDoc = documentsModel.addDocument(title, text);
    documentsModel.setCurrentDocId(newDoc.id);
    clearNewDocInput();
    MainController.renderAll();
    dom.toast('Documento agregado.');
  }

  function _handleListClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action, id } = target.dataset;
    if (!action || !id) return;

    if (action === 'open-doc') {
      documentsModel.setCurrentDocId(id);
      MainController.renderReader();
      MainController.renderLibrary(true);
    }
    if (action === 'delete-doc') {
      if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
        const wasCurrentDoc = documentsModel.getCurrentDocId() === id;
        documentsModel.deleteDocument(id);
        if (wasCurrentDoc) documentsModel.setCurrentDocId(null);
        MainController.renderAll();
        dom.toast('Documento eliminado.');
      }
    }
    if (action === 'toggle-pin') {
      documentsModel.togglePin(id);
      MainController.renderLibrary(true);
    }
  }
  
  function _handleExportDocs() {
    const docs = documentsModel.getAllDocs();
    if (docs.length === 0) return dom.toast('No hay documentos para exportar.');
    const docsToExport = docs.map(doc => ({ title: doc.title, text: doc.text }));
    const blob = new Blob([JSON.stringify(docsToExport, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mis_documentos.json';
    a.click();
    URL.revokeObjectURL(a.href);
    dom.toast('Documentos exportados.');
  }

  function _handleImportDocs() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (!Array.isArray(importedData)) throw new Error('El archivo JSON debe contener un array.');
          let importedCount = 0;
          importedData.forEach(docData => {
            if (docData.title && docData.text) {
              documentsModel.addDocument(docData.title, docData.text);
              importedCount++;
            }
          });
          if (importedCount > 0) {
            MainController.renderLibrary();
            dom.toast(`${importedCount} documento(s) importado(s).`);
          } else { dom.toast('No se encontraron documentos válidos.'); }
        } catch (error) { alert('Error al importar: ' + error.message); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function _handleWipeDB() {
    if (confirm('¿ESTÁS SEGURO? Se borrarán todos tus datos del servidor.')) {
      const emptyDB = { docs: [], lexicon: {} };
      await ApiService.save(emptyDB);
      localStorage.removeItem('currentDocId');
      localStorage.removeItem('theme');
      dom.toast('Base de datos borrada. Recargando...');
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  function render(docs, currentDocId, searchQuery = '', animate = false) {
    const query = searchQuery.trim().toLowerCase();
    const sortedDocs = [...docs].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (b.lastAccessed || 0) - (a.lastAccessed || 0);
    });
    const filteredDocs = sortedDocs.filter(doc => !query || doc.title.toLowerCase().includes(query));
    elements.docListContainer.innerHTML = '';
    if (filteredDocs.length === 0) {
      elements.docListContainer.innerHTML = '<p class="u-text-muted" style="text-align:center; padding: 20px 0;">No hay documentos.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    filteredDocs.forEach(doc => {
      frag.appendChild(_createDocCard(doc, doc.id === currentDocId, animate));
    });
    elements.docListContainer.appendChild(frag);
  }

  function _createDocCard(doc, isActive, animate) {
    const card = document.createElement('div');
    card.className = 'c-doc-card';
    card.classList.toggle('c-doc-card--is-active', isActive);
    if (isActive && animate) { card.classList.add('just-activated'); }
    const pinImage = doc.isPinned ? 'assets/images/Bandera.png' : 'assets/images/BanderaVacia.png';
    card.innerHTML = `
      <div class="c-doc-card__title">${Helpers.escapeHTML(doc.title)}</div>
      <div class="c-doc-card__meta">Accedido: ${new Date(doc.lastAccessed).toLocaleString()}</div>
      <div class="c-doc-card__actions">
        <button class="c-btn c-btn--ghost c-btn--small" data-action="open-doc" data-id="${doc.id}">Leer</button>
        <button class="c-btn c-btn--gray c-btn--small" data-action="delete-doc" data-id="${doc.id}">Borrar</button>
        ${isActive ? '<span class="c-doc-card__indicator">Leyendo...</span>' : ''}
      </div>
      <button class="c-doc-card__pin-btn ${doc.isPinned ? 'c-doc-card__pin-btn--pinned' : ''}" data-action="toggle-pin" data-id="${doc.id}" title="Anclar documento">
        <img src="${pinImage}" alt="Anclar">
      </button>
    `;
    return card;
  }

  function getNewDocInput() {
    return {
      title: elements.docTitleInput.value,
      text: elements.docTextInput.value
    };
  }

  function clearNewDocInput() {
    elements.docTitleInput.value = '';
    elements.docTextInput.value = '';
  }

  return { init, render };
})(DocumentsModel, DOM);