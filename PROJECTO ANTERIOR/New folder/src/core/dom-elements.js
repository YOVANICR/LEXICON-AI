/*
  Archivo: frontend/src/core/dom-elements.js
  Propósito: Centraliza todas las referencias a los elementos del DOM en un único objeto.
             Esto desacopla el código JavaScript de la estructura HTML. Si un ID cambia en el HTML,
             solo necesita ser actualizado en este archivo.
*/

const DOM_ELEMENTS = (function () {
  'use strict';

  // Este objeto contendrá todas las referencias a los nodos del DOM.
  const elements = {
    // Contenedor principal de la aplicación
    appContainer: document.getElementById('app'),

    // Elementos de la Biblioteca
    documentTitleInput: document.getElementById('docTitle'),
    documentTextInput: document.getElementById('docText'),
    addDocumentButton: document.getElementById('addDoc'),
    documentsListContainer: document.getElementById('docList'),

    // Elementos del Lector
    readerContainer: document.getElementById('reader'),
    currentDocumentTitle: document.getElementById('currentDocTitle'),
    documentInfo: document.getElementById('docInfo'),

    // Elementos del Léxico
    lexiconTableBody: document.getElementById('lexTableBody'),

    // Elementos de la Burbuja de Información
    wordBubble: document.getElementById('bubble'),
    wordBubbleTitle: document.getElementById('bWord'),
    wordBubbleDefinition: document.getElementById('bDefinition'),
    
    // Notificaciones
    toastNotification: document.getElementById('toast')
  };
  
  // Verificación post-carga para asegurar que los elementos críticos existen.
  // Esto es un mecanismo de depuración temprana.
  for (const key in elements) {
    if (elements[key] === null) {
      console.warn(`DOM_ELEMENTS: El elemento con la clave "${key}" no fue encontrado en el DOM. Esto puede causar errores.`);
    }
  }

  return elements;
})();