/* ==========================================================================
   Archivo: extension/content-extractor.js
   Propósito: Se inyecta en la página activa para extraer el artículo limpio.
   Utiliza Readability.js para hacer el trabajo pesado.
   ========================================================================== */

// Esta línea es especial. Readability.js se inyectará ANTES que este script,
// por lo que la clase Readability ya estará disponible globalmente.

// 1. Clonamos el documento actual. Readability modifica el DOM, así que
//    trabajamos sobre una copia para no alterar la página que el usuario está viendo.
const documentClone = document.cloneNode(true);

// 2. Instanciamos Readability con el documento clonado.
const reader = new Readability(documentClone);

// 3. Ejecutamos el parseo. Esto extrae el artículo.
const article = reader.parse();

// 4. article contendrá el resultado. Puede ser null si Readability no encontró
//    un artículo (ej. en una página de búsqueda de Google).
if (article) {
  // 5. Enviamos el resultado (título y contenido HTML) al background script.
  chrome.runtime.sendMessage({
    action: "articleExtracted",
    payload: {
      title: article.title,
      content: article.content // Este es el contenido HTML limpio.
    }
  });
} else {
  // 6. Si no se encontró un artículo, enviamos un mensaje de error.
  chrome.runtime.sendMessage({
    action: "extractionFailed"
  });
}