/* ==========================================================================
   Archivo: frontend/src/shared/utils/dom.helpers.js
   Propósito: Módulo de utilidad para el DOM.
   ========================================================================== */
const DOM = (() => {
  const elements = {
    app: document.getElementById('app'),
    docTitleInput: document.getElementById('docTitle'),
    docTextInput: document.getElementById('docText'),
    addDocBtn: document.getElementById('addDoc'),
    docListContainer: document.getElementById('docList'),
    clearFieldsBtn: document.getElementById('clearFields'),
    exportDbBtn: document.getElementById('exportDB'),
    importDbBtn: document.getElementById('importDB'),
    wipeDbBtn: document.getElementById('wipeDB'),
    searchDocsInput: document.getElementById('searchDocs'),
    toggleAdvancedBtn: document.getElementById('toggleAdvanced'),
    advancedControlsContainer: document.getElementById('advancedControls'),
    btnLeft: document.getElementById('btnLeft'),
    btnRight: document.getElementById('btnRight'),
    btnTheme: document.getElementById('btnTheme'),
    btnFocus: document.getElementById('btnFocus'),
    currentDocTitle: document.getElementById('currentDocTitle'),
    docInfo: document.getElementById('docInfo'),
    fontValueInput: document.getElementById('fontValue'),
    opacityValueInput: document.getElementById('opacityValue'),
    filterAll: document.getElementById('filterAll'),
    filterKnown: document.getElementById('filterKnown'),
    filterLearning: document.getElementById('filterLearning'),
    filterUnknown: document.getElementById('filterUnknown'),
    readerContainer: document.getElementById('reader'),
    searchLexInput: document.getElementById('searchLex'),
    filterStatusSelect: document.getElementById('filterStatus'),
    exportLexCsvBtn: document.getElementById('exportLexCSV'),
    importCsvBtn: document.getElementById('importCsvBtn'),
    importCsvFile: document.getElementById('importCsvFile'),
    lexiconTableBody: document.getElementById('lexTableBody'),
    bubble: document.getElementById('bubble'),
    bubbleWord: document.getElementById('bWord'),
    bubbleDefinition: document.getElementById('bDefinition'),
    bubbleActions: document.querySelector('.c-word-bubble__actions'),
    toast: document.getElementById('toast'),
    focusControls: document.getElementById('focusControls'),
    highlightControls: document.getElementById('highlightControls'), // Añadido para completitud
  };

  function toast(msg) {
    elements.toast.textContent = msg;
    elements.toast.style.display = 'block';
    clearTimeout(elements.toast._t);
    elements.toast._t = setTimeout(() => {
      elements.toast.style.display = 'none';
    }, 1800);
  }

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  return { elements, toast, $, $$ };
})();