/*
  PATH: src/i18n/ui-translator.js

  Purpose:
  - Walk the DOM and translate nodes with data-i18n-key attributes.
  - Supports data-i18n-target values: title, placeholder, value, html, aria-label (and default text).
  - Adds an accessible .sr-only label for buttons with icon children instead of replacing children.
  - Subscribes to EventBus 'language:changed' if available so translations re-run.
*/

/**
 * UITranslator module.
 * Responsible for mapping translations into DOM elements.
 *
 * @module UITranslator
 */
const UITranslator = (function () {
  'use strict';

  /**
   * Translate a single element (guarded).
   * @param {Element} el
   * @returns {void}
   */
  function translateElement(el) {
    try {
      if (!el || !el.dataset) return;
      const key = el.dataset.i18nKey || el.getAttribute('data-i18n-key');
      if (!key) return;

      const target = (el.dataset.i18nTarget || el.getAttribute('data-i18n-target') || '').toLowerCase();
      const translation = (typeof TranslationService !== 'undefined' && TranslationService.t)
        ? TranslationService.t(key)
        : key;

      if (target === 'title') {
        // set both property and attribute for max compatibility
        try { el.title = translation; } catch (e) { /* ignore */ }
        try { el.setAttribute('title', translation); } catch (e) { /* ignore */ }
        return;
      }

      if (target === 'placeholder') {
        if ('placeholder' in el) el.placeholder = translation;
        else el.setAttribute('placeholder', translation);
        return;
      }

      if (target === 'value') {
        if ('value' in el) el.value = translation;
        else el.setAttribute('value', translation);
        return;
      }

      if (target === 'html' || el.hasAttribute('data-i18n-html')) {
        el.innerHTML = translation;
        return;
      }

      if (target === 'aria-label' || el.hasAttribute('data-i18n-aria')) {
        el.setAttribute('aria-label', translation);
        return;
      }

      // default: try to replace only text content without removing icon children
      if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        const hasTextOnly = Array.from(el.childNodes).every(
          (n) => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'SPAN')
        );

        if (hasTextOnly) {
          el.textContent = translation;
        } else {
          // keep children (icons), set title and append hidden label for screen readers
          try { el.title = translation; } catch (e) { /* ignore */ }
          if (!el.querySelector('.sr-only')) {
            const span = document.createElement('span');
            span.className = 'sr-only';
            span.textContent = translation;
            el.appendChild(span);
          } else {
            // update existing sr-only text
            el.querySelectorAll('.sr-only').forEach(s => { s.textContent = translation; });
          }
        }
        return;
      }

      // fallback
      el.textContent = translation;
    } catch (e) {
      console.warn('UITranslator: translateElement error', e, el);
    }
  }

  /**
   * Translate all nodes under root (defaults to document).
   * @param {ParentNode} [root=document]
   */
  function translatePage(root = document) {
    try {
      const nodes = root.querySelectorAll('[data-i18n-key]');
      nodes.forEach(translateElement);
    } catch (e) {
      console.error('UITranslator: translatePage failed', e);
    }
  }

  /**
   * Initialize the translator:
   * - runs initial translation
   * - subscribes to EventBus 'language:changed' if available
   */
  function initialize() {
    try {
      translatePage();
      if (typeof EventBus !== 'undefined' && EventBus.subscribe) {
        // subscribe if EventBus exists
        EventBus.subscribe('language:changed', () => {
          try { translatePage(); } catch (e) { console.warn('UITranslator: language:changed handler error', e); }
        });
      } else {
        // no EventBus: safe fallback (nothing else required)
        console.info('UITranslator: EventBus not present — translations were applied once at init.');
      }
      console.log('UITranslator initialized.');
    } catch (e) {
      console.error('UITranslator initialization failed', e);
    }
  }

  // Public API
  const API = {
    initialize,
    translatePage,
    translateElement
  };

  // Merge into window safely so other modules referencing window.UITranslator continue to work.
  try {
    if (typeof window !== 'undefined') {
      window.UITranslator = Object.assign(window.UITranslator || {}, API);
    }
  } catch (e) {
    console.warn('UITranslator: could not assign to window', e);
  }

  return API;
})();
