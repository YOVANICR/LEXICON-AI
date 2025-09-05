/* ==========================================================================
   Archivo: frontend/src/features/lexicon/components/reader.component.js
   Propósito: Componente que gestiona la lógica y renderizado del panel Lector.
   ========================================================================== */

const ReaderComponent = ((documentsModel, vocabularyModel, dom) => {
  const { elements } = dom;
  let currentBubbleTarget = null;
  let activeLemmaForBubble = null;
  let isDragging = false;
  let highlightContainer = null;
  let segmentedTokensCache = [];
  
  // --- Estado de la Burbuja de Idiomas ---
  const allLanguages = {
    'Español': 'es', 'Inglés': 'en', 'Francés': 'fr',
    'Alemán': 'de', 'Italiano': 'it', 'Portugués': 'pt'
  };
  let visibleLangTags = ['Inglés', 'Español', 'Francés'];
  let activeLangForDisplay = 'Inglés';
  let pinnedLang = 'Inglés'; // Idioma anclado por defecto

  let apiResponsesCache = {}; 
  
  function init() {
    document.addEventListener('mouseup', _handleMouseUp);
    elements.bubble.addEventListener('click', _handleBubbleClicks);
    elements.readerContainer.addEventListener('mousedown', _handleMouseDown);
    elements.readerContainer.addEventListener('mousemove', _handleMouseMove);
    
    document.addEventListener('click', (e) => {
      const bubble = elements.bubble;
      const dropdown = bubble.querySelector('.c-lang-dropdown');
      
      if (bubble.style.display === 'flex' && !bubble.contains(e.target) && !_isSelectionRange(currentBubbleTarget, e.target)) {
        _hideBubble();
      }
      
      if (dropdown && dropdown.classList.contains('is-open') && !e.target.closest('.c-lang-add-btn')) {
          dropdown.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') _hideBubble();
    });
  }

  function _handleBubbleClicks(e) {
    const actionButton = e.target.closest('[data-status]');
    const addButton = e.target.closest('.c-lang-add-btn');
    const langTag = e.target.closest('.c-lang-tag');
    const langOption = e.target.closest('.c-lang-dropdown__item');
    const aiButton = e.target.closest('#aiButton');
    const editButton = e.target.closest('#editButton');
    const regenerateButton = e.target.closest('#regenerateButton');


    if (actionButton) _handleBubbleAction(actionButton);
    else if (addButton) _toggleLangDropdown(addButton);
    else if (langTag) _setActiveLangTag(langTag.dataset.langName);
    else if (langOption) _selectNewLanguage(langOption.dataset.lang);
    else if (aiButton) dom.toast('Próximamente: ¡Integración con Lexicon AI!');
    else if (editButton) dom.toast('Próximamente: ¡Edición manual de definiciones!');
    else if (regenerateButton) _regenerateWordInfo(activeLemmaForBubble);
  }

  function _toggleLangDropdown(button) {
    const dropdown = button.parentElement.querySelector('.c-lang-dropdown');
    if (dropdown) dropdown.classList.toggle('is-open');
  }

  async function _setActiveLangTag(langName) {
    if (activeLangForDisplay === langName) return;
    activeLangForDisplay = langName;
    await _updateBubbleContent(activeLemmaForBubble);
    _renderLangTags();
  }

  async function _selectNewLanguage(newLangName) {
    const dropdown = elements.bubble.querySelector('.c-lang-dropdown');
    if (dropdown) dropdown.classList.remove('is-open');

    if (visibleLangTags.includes(newLangName)) {
        _setActiveLangTag(newLangName);
        return;
    }
    
    const nonPinnedVisible = visibleLangTags.filter(lang => lang !== pinnedLang);
    if (nonPinnedVisible.length >= 2) {
        const lastNonPinned = nonPinnedVisible[nonPinnedVisible.length - 1];
        visibleLangTags = visibleLangTags.filter(lang => lang !== lastNonPinned);
    }
    
    visibleLangTags.push(newLangName);
    visibleLangTags.sort((a, b) => {
        if (a === pinnedLang) return -1;
        if (b === pinnedLang) return 1;
        return 0;
    });
    
    activeLangForDisplay = newLangName;
    await _updateBubbleContent(activeLemmaForBubble);
    _renderLangTags();
  }

  function _renderLangTags() {
    const tagsContainer = elements.bubble.querySelector('#bLangTags');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = '';
    
    visibleLangTags.forEach(langName => {
        const tag = document.createElement('div');
        tag.className = 'c-lang-tag';
        tag.dataset.langName = langName;

        // Solo la etiqueta anclada lleva el icono de Bandera.png
        if (langName === pinnedLang) {
            const icon = document.createElement('img');
            icon.src = 'assets/images/Bandera.png';
            icon.className = 'c-lang-tag__icon';
            tag.appendChild(icon);
        }

        const text = document.createTextNode(langName);
        tag.appendChild(text);

        if (langName === activeLangForDisplay) {
            tag.classList.add('is-active');
        }
        tagsContainer.appendChild(tag);
    });

    const addButton = document.createElement('button');
    addButton.className = 'c-lang-add-btn';
    addButton.textContent = '+';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'c-lang-dropdown';
    
    Object.keys(allLanguages).forEach(langName => {
      if (!visibleLangTags.includes(langName)) {
        const item = document.createElement('div');
        item.className = 'c-lang-dropdown__item';
        item.textContent = langName;
        item.dataset.lang = langName;
        dropdown.appendChild(item);
      }
    });

    addButton.appendChild(dropdown);
    tagsContainer.appendChild(addButton);
  }

  function _ensureHighlightContainer() {
    highlightContainer = elements.readerContainer.querySelector('.c-custom-highlight-container');
    if (!highlightContainer) {
        highlightContainer = document.createElement('div');
        highlightContainer.className = 'c-custom-highlight-container';
        elements.readerContainer.insertBefore(highlightContainer, elements.readerContainer.firstChild);
    }
  }

  function _clearCustomHighlight() {
      if (highlightContainer) { highlightContainer.innerHTML = ''; }
      window.getSelection().removeAllRanges();
  }

  function _handleMouseDown(e) {
    if (e.button !== 0 || !elements.readerContainer.contains(e.target)) return;
    isDragging = true;
    _ensureHighlightContainer();
    _clearCustomHighlight();
  }

  function _handleMouseMove(e) {
    if (!isDragging) return;
    if (highlightContainer) highlightContainer.innerHTML = '';
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const clientRects = selection.getRangeAt(0).getClientRects();
      const readerRect = elements.readerContainer.getBoundingClientRect();
      for (const rect of clientRects) {
        const highlightEl = document.createElement('div');
        highlightEl.className = 'c-custom-selection-highlight';
        highlightEl.style.left = `${rect.left - readerRect.left + elements.readerContainer.scrollLeft}px`;
        highlightEl.style.top = `${rect.top - readerRect.top + elements.readerContainer.scrollTop}px`;
        highlightEl.style.width = `${rect.width}px`;
        highlightEl.style.height = `${rect.height}px`;
        highlightContainer.appendChild(highlightEl);
      }
    }
  }

  function _handleMouseUp(e) {
      if (!isDragging) return;
      isDragging = false;
      if (elements.readerContainer.classList.contains('focus-mode-active')) {
          _clearCustomHighlight();
          return;
      }
      const selection = window.getSelection();
      if (selection.toString().trim().length > 0 || (selection.isCollapsed && e.target.closest('.c-reader__word'))) {
        _processSelection(e, selection);
      }
      setTimeout(_clearCustomHighlight, 150);
  }
  
  function _isSelectionRange(target, clickedElement) {
    if (!target) return false;
    if (target instanceof Range) {
        return target.commonAncestorContainer.contains(clickedElement);
    }
    return target.contains(clickedElement);
  }

  function _expandRangeToWords(range) {
    if (range.collapsed) return range;
    const WORD_BOUNDARY = /[^\p{L}\p{N}_'-]/u;
    let { startContainer, startOffset } = range;
    if (startContainer.nodeType === Node.TEXT_NODE) {
      while (startOffset > 0 && !WORD_BOUNDARY.test(startContainer.textContent[startOffset - 1])) { startOffset--; }
      range.setStart(startContainer, startOffset);
    }
    let { endContainer, endOffset } = range;
    if (endContainer.nodeType === Node.TEXT_NODE) {
      while (endOffset < endContainer.textContent.length && !WORD_BOUNDARY.test(endContainer.textContent[endOffset])) { endOffset++; }
      range.setEnd(endContainer, endOffset);
    }
    return range;
  }

  async function _processSelection(event, selection) {
    let text;
    if (selection.isCollapsed) {
        const target = event.target.closest('.c-reader__word');
        if (!target) return;
        currentBubbleTarget = target;
        text = target.dataset.lemma;
        const { surface } = target.dataset;
        const docId = documentsModel.getCurrentDocId();
        vocabularyModel.processWordClick(text, surface, docId);
    } else {
        let range = selection.getRangeAt(0);
        range = _expandRangeToWords(range);
        selection.removeAllRanges();
        selection.addRange(range);
        text = range.toString().trim();
        if (!text) return;
        currentBubbleTarget = range;
        const docId = documentsModel.getCurrentDocId();
        vocabularyModel.processPhraseSelection(text, docId);
    }
    
    activeLemmaForBubble = text.toLowerCase();
    apiResponsesCache = {};
    
    await _updateBubbleContent(activeLemmaForBubble);
    _showBubble(currentBubbleTarget, text); // Usamos 'text' para mostrar la forma original seleccionada
    MainController.renderLexicon();
  }

  async function _regenerateWordInfo(wordOrPhrase) {
      if (!wordOrPhrase) return;
      dom.toast('Regenerando...');
      apiResponsesCache = {};
      await _updateBubbleContent(wordOrPhrase);
      _showBubble(currentBubbleTarget, wordOrPhrase);
  }

  async function _updateBubbleContent(wordOrPhrase) {
      const targetLangCode = allLanguages[activeLangForDisplay];
      
      if (apiResponsesCache[targetLangCode]) {
          const info = apiResponsesCache[targetLangCode];
          elements.bubbleDefinition.textContent = `(${info.translation}) ${info.definition}`;
          return;
      }
      
      const info = await vocabularyModel.getWordDefinition(wordOrPhrase, targetLangCode);
      apiResponsesCache[targetLangCode] = info;
      elements.bubbleDefinition.textContent = `(${info.translation}) ${info.definition}`;
  }

  function _handleBubbleAction(button) {
    if (!button || !activeLemmaForBubble) return;
    const status = button.dataset.status === 'null' ? null : button.dataset.status;
    const lemma = activeLemmaForBubble;
    vocabularyModel.setWordStatus(lemma, status);
    dom.toast(`Estado de "${lemma}" actualizado.`);
    MainController.renderReader();
    MainController.renderLexicon();
    _hideBubble();
  }

  function _hideBubble() {
    elements.bubble.style.display = 'none';
    activeLemmaForBubble = null;
    currentBubbleTarget = null;
    apiResponsesCache = {};
    visibleLangTags = ['Inglés', 'Español', 'Francés'];
    activeLangForDisplay = 'Inglés';
  }
  
  function render(doc, lexicon, uiState) {
    elements.readerContainer.classList.toggle('focus-mode-active', uiState.isFocusModeActive);
    if (!doc) {
      elements.readerContainer.innerHTML = '';
      _updateToolbar('Sin documento', '');
      return;
    }
    if (uiState.isFocusModeActive && segmentedTokensCache.length === 0) {
      segmentedTokensCache = TextProcessor.segmenter(doc.text);
    } else if (!uiState.isFocusModeActive) {
      segmentedTokensCache = [];
    }
    if (uiState.isFocusModeActive) {
      _renderFocusMode(doc, lexicon, uiState);
    } else {
      _renderNormalMode(doc.text, lexicon, uiState);
    }
    elements.readerContainer.style.fontSize = `${uiState.fontSize}px`;
    const wordCount = doc.text.split(/\s+/).filter(Boolean).length;
    _updateToolbar(doc.title, ` | ${wordCount} palabras (aprox.)`);
  }

  function _renderNormalMode(text, lexicon, uiState) {
    const frag = document.createDocumentFragment();
    const highlightableLemmas = Object.keys(lexicon).filter(lemma => {
      const entry = lexicon[lemma];
      return entry && entry.status && uiState.activeStatuses.has(entry.status);
    });
    if (highlightableLemmas.length === 0) {
      const tokens = TextProcessor.tokenize(text);
      tokens.forEach(t => {
        if (t.type === 'word') frag.appendChild(_createWordSpan(t.text, lexicon, uiState));
        else frag.appendChild(document.createTextNode(t.text));
      });
      elements.readerContainer.innerHTML = '';
      elements.readerContainer.appendChild(frag);
      return;
    }
    highlightableLemmas.sort((a, b) => b.length - a.length);
    const regex = new RegExp(`\\b(${highlightableLemmas.map(Helpers.escapeRegExp).join('|')})\\b`, 'gi');
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const precedingText = text.slice(lastIndex, match.index);
        const tokens = TextProcessor.tokenize(precedingText);
        tokens.forEach(t => {
          if (t.type === 'word') frag.appendChild(_createWordSpan(t.text, lexicon, uiState));
          else frag.appendChild(document.createTextNode(t.text));
        });
      }
      const matchedText = match[0];
      const matchedLemma = matchedText.toLowerCase();
      const lexiconEntry = lexicon[matchedLemma];
      const span = document.createElement('span');
      span.className = 'c-reader__word';
      span.textContent = matchedText;
      span.dataset.surface = matchedText;
      span.dataset.lemma = matchedLemma;
      span.style.backgroundColor = `rgba(${_getRGBForStatus(lexiconEntry.status)}, ${uiState.opacity})`;
      frag.appendChild(span);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      const tokens = TextProcessor.tokenize(remainingText);
        tokens.forEach(t => {
          if (t.type === 'word') frag.appendChild(_createWordSpan(t.text, lexicon, uiState));
          else frag.appendChild(document.createTextNode(t.text));
        });
    }
    elements.readerContainer.innerHTML = '';
    elements.readerContainer.appendChild(frag);
  }

  function _renderFocusMode(doc, lexicon, uiState) {
    const lines = doc.text.split('\n');
    const frag = document.createDocumentFragment();
    const anchorToken = segmentedTokensCache.find(token => token.lineIndex === uiState.focusLineIndex && token.localIndex === uiState.focusWordTokenIndex);
    let activeSegmentIndex = -1;
    let segmentType = '';
    if (anchorToken) {
      switch (uiState.focusNavigationMode) {
        case 'phrase': segmentType = 'phraseIndex'; activeSegmentIndex = anchorToken.phraseIndex; break;
        case 'sentence': segmentType = 'sentenceIndex'; activeSegmentIndex = anchorToken.sentenceIndex; break;
      }
    }
    lines.forEach((lineText, lineIndex) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'c-reader__line';
      if (lineIndex === uiState.focusLineIndex) { lineDiv.classList.add('is-focused'); }
      const tokensInLine = TextProcessor.tokenize(lineText);
      if (tokensInLine.length === 0) {
        lineDiv.innerHTML = '&nbsp;';
      } else {
        tokensInLine.forEach((token, tokenIndex) => {
          if (token.type === 'word') {
            const wordSpan = _createWordSpan(token.text, lexicon, uiState);
            const wordInfo = segmentedTokensCache.find(t => t.lineIndex === lineIndex && t.localIndex === tokenIndex);
            if (uiState.focusNavigationMode === 'word') {
              if (lineIndex === uiState.focusLineIndex && tokenIndex === uiState.focusWordTokenIndex) {
                wordSpan.classList.add('is-word-focused');
              }
            } else if (wordInfo && wordInfo[segmentType] === activeSegmentIndex) {
              wordSpan.classList.add('is-segment-focused');
              wordSpan.style.backgroundColor = `rgba(9, 105, 218, ${uiState.opacity})`;
            }
            lineDiv.appendChild(wordSpan);
          } else {
            lineDiv.appendChild(document.createTextNode(token.text));
          }
        });
      }
      frag.appendChild(lineDiv);
    });
    elements.readerContainer.innerHTML = '';
    elements.readerContainer.appendChild(frag);
  }

  function _createWordSpan(surface, lexicon, uiState) {
    const span = document.createElement('span');
    const lem = TextProcessor.lemmaOf(surface);
    const rec = lexicon[lem];
    const status = rec?.status;
    span.className = 'c-reader__word';
    if (status && !rec.isPhrase && uiState.activeStatuses.has(status)) {
      span.style.backgroundColor = `rgba(${_getRGBForStatus(status)}, ${uiState.opacity})`;
    }
    span.textContent = surface;
    span.dataset.surface = surface;
    span.dataset.lemma = lem;
    return span;
  }

  function _updateToolbar(title, info) {
    elements.currentDocTitle.textContent = title;
    elements.docInfo.textContent = info;
  }

  async function _showBubble(target, wordOrPhrase) {
    elements.bubbleWord.textContent = `${wordOrPhrase}`;
    _renderLangTags();
    
    const r = (target instanceof Range) ? target.getBoundingClientRect() : target.getBoundingClientRect();
    const bx = Math.min(window.innerWidth - 390, Math.max(10, r.left));
    const by = r.bottom + 8 + window.scrollY;
    elements.bubble.style.left = bx + 'px';
    elements.bubble.style.top = by + 'px';
    elements.bubble.style.display = 'flex';
  }

  function _getRGBForStatus(status) {
    const { UNKNOWN, LEARNING } = Helpers.STATUS;
    return status === UNKNOWN ? '215,58,73' : status === LEARNING ? '210,153,34' : '45,164,78';
  }

  return { init, render };
})(DocumentsModel, VocabularyModel, DOM);