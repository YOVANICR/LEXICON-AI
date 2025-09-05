/* ==========================================================================
   Archivo: frontend/src/shared/utils/helpers.js
   Propósito: Módulo de utilidades generales y constantes.
   ========================================================================== */
const Helpers = (() => {
  const STATUS = {
    UNKNOWN: 'unknown',
    LEARNING: 'learning',
    KNOWN: 'known',
    NONE: 'none'
  };

  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return {
    STATUS,
    escapeHTML,
    escapeRegExp,
  };
})();
