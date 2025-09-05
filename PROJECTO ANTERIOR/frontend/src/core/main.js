/* ==========================================================================
   Archivo: frontend/src/core/main.js
   Propósito: Punto de entrada y orquestador principal de la aplicación.
   ========================================================================== */

const MainController = ((documentsModel, vocabularyModel, libraryComponent, readerComponent, vocabularyComponent, dom) => {
  let dbState = { docs: [], lexicon: {} };
  let lastKnownDbTimestamp = 0;
  
  const uiState = {
    activeStatuses: new Set(['unknown', 'learning', 'known']),
    fontSize: 18,
    opacity: 0.25,
    isFocusModeActive: false,
    focusLineIndex: 0,
    focusWordTokenIndex: -1,
    focusNavigationMode: 'word',
  };
  
  let segmentedTokensCache = [];
  let maxPhraseIndex = 0;
  let maxSentenceIndex = 0;

  async function init() {
    console.log('App inicializada por MainController.');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }
    
    dbState = await ApiService.load();
    documentsModel.init(dbState.docs, saveState);
    vocabularyModel.init(dbState.lexicon, saveState);
    
    libraryComponent.init();
    readerComponent.init();
    vocabularyComponent.init();
    WorkspacePage.init();
    
    _initGlobalListeners();
    _initReaderToolbarListeners();
    renderAll();
    _startSyncPolling();
  }
  
  function _startSyncPolling() {
    // La primera carga de la versión se hace dentro del try...catch del intervalo
    setInterval(async () => {
      try {
        const response = await fetch('/api/database-version');
        if (!response.ok) {
            // No mostramos toast aquí para no ser intrusivos, pero lo logueamos.
            console.warn(`[Sync] El sondeo recibió una respuesta no exitosa: ${response.status}`);
            return;
        }
        const data = await response.json();
        
        if (data.lastModified > lastKnownDbTimestamp && lastKnownDbTimestamp > 0) {
          console.log('[Sync] Se detectó una nueva versión de la base de datos. Actualizando...');
          DOM.toast('Sincronizando nuevos datos...');
          lastKnownDbTimestamp = data.lastModified;
          
          dbState = await ApiService.load();
          documentsModel.init(dbState.docs, saveState);
          vocabularyModel.init(dbState.lexicon, saveState);
          renderAll();
        } else {
            // Actualizamos el timestamp en la primera carga exitosa
            if(lastKnownDbTimestamp === 0) {
                lastKnownDbTimestamp = data.lastModified;
            }
        }
      } catch (error) { 
          // Solo logueamos el error en consola para no molestar al usuario con toasts repetitivos.
          console.warn('[Sync] No se pudo conectar para sincronizar. Se reintentará.', error.message);
      }
    }, 5000);
  }

  async function saveState() {
    const currentDocsState = documentsModel.getDocsState();
    const currentLexiconState = vocabularyModel.getLexiconState();
    dbState = { docs: currentDocsState, lexicon: currentLexiconState };
    
    await ApiService.save(dbState);
    
    try {
        const response = await fetch('/api/database-version');
        const data = await response.json();
        lastKnownDbTimestamp = data.lastModified;
    } catch (e) {
      // No hacer nada si falla la actualización del timestamp, no es crítico
    }

    console.log('[MainController] Estado guardado en el servidor.');
  }

  function _initGlobalListeners() {
    const { elements } = dom;
    elements.btnLeft.addEventListener('click', () => _togglePanel('left'));
    elements.btnRight.addEventListener('click', () => _togglePanel('right'));
    elements.btnTheme.addEventListener('click', _toggleTheme);
    elements.btnFocus.addEventListener('click', _toggleFocusMode);
    document.addEventListener('keydown', (e) => {
      if (!uiState.isFocusModeActive) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); _navigateFocusLine(1); } 
      else if (e.key === 'ArrowUp') { e.preventDefault(); _navigateFocusLine(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); _navigateFocusHorizontal(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); _navigateFocusHorizontal(-1); }
    });
    elements.focusControls.addEventListener('click', (e) => {
        const target = e.target.closest('[data-focus-mode]');
        if (target) {
            uiState.focusNavigationMode = target.dataset.focusMode;
            _updateFocusModeButtons();
        }
    });
  }
  
  function _initReaderToolbarListeners() {
    const { elements } = dom;
    elements.filterAll.addEventListener('click', () => {
        const all = ['known', 'learning', 'unknown'];
        const allAreActive = all.every(s => uiState.activeStatuses.has(s));
        allAreActive ? uiState.activeStatuses.clear() : all.forEach(s => uiState.activeStatuses.add(s));
        renderReader();
        renderFilterButtons();
    });
    elements.filterKnown.addEventListener('click', () => _toggleStatusFilter('known'));
    elements.filterLearning.addEventListener('click', () => _toggleStatusFilter('learning'));
    elements.filterUnknown.addEventListener('click', () => _toggleStatusFilter('unknown'));
    elements.fontValueInput.addEventListener('input', _handleFontChange);
    elements.opacityValueInput.addEventListener('input', _handleOpacityChange);
  }

  function _togglePanel(side) { dom.elements.app.classList.toggle(`l-app--hide-${side}`); }
  
  function _toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  }

  function _toggleFocusMode() {
    const currentDoc = documentsModel.getCurrentDoc();
    if (!currentDoc) {
      dom.toast('Abre un documento para usar la lectura focalizada.');
      return;
    }
    uiState.isFocusModeActive = !uiState.isFocusModeActive;
    if (uiState.isFocusModeActive) {
      segmentedTokensCache = TextProcessor.segmenter(currentDoc.text);
      if (segmentedTokensCache.length > 0) {
        maxPhraseIndex = segmentedTokensCache[segmentedTokensCache.length - 1].phraseIndex;
        maxSentenceIndex = segmentedTokensCache[segmentedTokensCache.length - 1].sentenceIndex;
      }
      uiState.focusLineIndex = 0;
      _navigateFocusLine(0);
    } else {
      segmentedTokensCache = [];
    }
    dom.elements.focusControls.classList.toggle('is-visible', uiState.isFocusModeActive);
    dom.elements.highlightControls.style.display = uiState.isFocusModeActive ? 'none' : 'flex';
    renderReader();
  }

  function _navigateFocusLine(direction) {
    const doc = documentsModel.getCurrentDoc();
    if (!doc) return;
    const lines = doc.text.split('\n');
    const lineCount = lines.length;
    const newIndex = uiState.focusLineIndex + direction;
    if (newIndex < 0 || newIndex >= lineCount) return;
    uiState.focusLineIndex = newIndex;
    const newLineText = lines[uiState.focusLineIndex];
    const tokensInNewLine = TextProcessor.tokenize(newLineText);
    const firstWordIndex = tokensInNewLine.findIndex(t => t.type === 'word');
    uiState.focusWordTokenIndex = firstWordIndex;
    renderReader();
    _scrollToFocusedLine();
  }

  function _navigateFocusHorizontal(direction) {
    switch (uiState.focusNavigationMode) {
      case 'word': _navigateByWord(direction); break;
      case 'phrase': _navigateBySegment('phraseIndex', maxPhraseIndex, direction); break;
      case 'sentence': _navigateBySegment('sentenceIndex', maxSentenceIndex, direction); break;
    }
    renderReader();
    _scrollToFocusedLine();
  }

  function _navigateByWord(direction) {
      const lineText = documentsModel.getCurrentDoc().text.split('\n')[uiState.focusLineIndex] || '';
      const tokensInLine = TextProcessor.tokenize(lineText);
      const wordTokensInLine = tokensInLine.map((t, i) => ({...t, originalIndex: i})).filter(t => t.type === 'word');
      if (wordTokensInLine.length === 0) return;
      const currentWordIndexInLine = wordTokensInLine.findIndex(t => t.originalIndex === uiState.focusWordTokenIndex);
      let newWordIndexInLine = currentWordIndexInLine + direction;
      if (newWordIndexInLine >= 0 && newWordIndexInLine < wordTokensInLine.length) {
          uiState.focusWordTokenIndex = wordTokensInLine[newWordIndexInLine].originalIndex;
      }
  }

  function _navigateBySegment(segmentType, maxSegmentIndex, direction) {
      if (segmentedTokensCache.length === 0) return;
      const anchorToken = segmentedTokensCache.find(t => t.lineIndex === uiState.focusLineIndex && t.localIndex === uiState.focusWordTokenIndex) || segmentedTokensCache[0];
      const currentSegmentIndex = anchorToken[segmentType];
      const targetSegmentIndex = currentSegmentIndex + direction;
      if (targetSegmentIndex < 0 || targetSegmentIndex > maxSegmentIndex) return;
      let nextToken = (direction > 0) ? segmentedTokensCache.find(t => t[segmentType] === targetSegmentIndex) : segmentedTokensCache.find(t => t[segmentType] === targetSegmentIndex);
      if (nextToken) {
          uiState.focusLineIndex = nextToken.lineIndex;
          uiState.focusWordTokenIndex = nextToken.localIndex;
      }
  }

  function _scrollToFocusedLine() {
      const focusedLine = dom.elements.readerContainer.querySelector('.is-focused');
      if (focusedLine) {
          const readerRect = dom.elements.readerContainer.getBoundingClientRect();
          const lineRect = focusedLine.getBoundingClientRect();
          const desiredScrollTop = dom.elements.readerContainer.scrollTop + lineRect.top - readerRect.top - (readerRect.height / 2) + (lineRect.height / 2);
          dom.elements.readerContainer.scrollTop = desiredScrollTop;
      }
  }

  function _updateFocusModeButtons() {
      dom.elements.focusControls.querySelectorAll('[data-focus-mode]').forEach(btn => {
          btn.classList.toggle('is-active', btn.dataset.focusMode === uiState.focusNavigationMode);
      });
  }

  function _toggleStatusFilter(status) {
    uiState.activeStatuses.has(status) ? uiState.activeStatuses.delete(status) : uiState.activeStatuses.add(status);
    renderReader();
    renderFilterButtons();
  }
  
  function _handleFontChange(e) {
    const newSize = parseInt(e.target.value, 10);
    if (!isNaN(newSize) && newSize >= 10 && newSize <= 40) { uiState.fontSize = newSize; renderReader(); }
  }
  
  function _handleOpacityChange(e) {
    const newOpacityPct = parseInt(e.target.value, 10);
    if (!isNaN(newOpacityPct) && newOpacityPct >= 0 && newOpacityPct <= 100) { uiState.opacity = newOpacityPct / 100; renderReader(); }
  }

  function renderAll() {
    dom.elements.fontValueInput.value = uiState.fontSize;
    dom.elements.opacityValueInput.value = Math.round(uiState.opacity * 100);
    renderLibrary();
    renderReader();
    renderLexicon();
    renderFilterButtons();
  }
  
  function renderLibrary(animate = false) {
    libraryComponent.render(documentsModel.getAllDocs(), documentsModel.getCurrentDocId(), dom.elements.searchDocsInput.value, animate);
  }

  function renderReader() {
    readerComponent.render(documentsModel.getCurrentDoc(), vocabularyModel.getLexicon(), uiState);
  }
  
  function renderLexicon() {
    vocabularyComponent.render(vocabularyModel.getLexicon(), dom.elements.searchLexInput.value, dom.elements.filterStatusSelect.value);
  }
  
  function renderFilterButtons() {
    dom.elements.filterAll.classList.toggle('c-filter-bar__circle--is-active', uiState.activeStatuses.size >= 3);
    dom.elements.filterKnown.classList.toggle('c-filter-bar__circle--is-active', uiState.activeStatuses.has('known'));
    dom.elements.filterLearning.classList.toggle('c-filter-bar__circle--is-active', uiState.activeStatuses.has('learning'));
    dom.elements.filterUnknown.classList.toggle('c-filter-bar__circle--is-active', uiState.activeStatuses.has('unknown'));
  }

  return { init, renderAll, renderReader, renderLexicon, renderLibrary };

})(DocumentsModel, VocabularyModel, LibraryComponent, ReaderComponent, VocabularyComponent, DOM);


document.addEventListener('DOMContentLoaded', () => {
  MainController.init();
});