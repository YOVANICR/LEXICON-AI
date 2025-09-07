/*
  PATH: src/i18n/language-detector.js

  Purpose:
  - Detect user's preferred language using localStorage and navigator.
  - Expose a tiny API for reading/saving the language preference.
  - Merge safely into window.LanguageDetector if already present (adds missing methods instead of overwriting).
*/

/**
 * LanguageDetector module.
 * Detects initial language preferences and persists them.
 * Merged into window.LanguageDetector to maintain compatibility.
 *
 * @module LanguageDetector
 */
const LanguageDetector = (function () {
  'use strict';

  /**
   * Supported languages.
   * @type {string[]}
   */
  const SUPPORTED_LANGUAGES = ['en', 'es'];

  /**
   * Default language to use when nothing else is found.
   * @type {string}
   */
  const DEFAULT_LANGUAGE = 'es';

  /**
   * localStorage key used to persist user language preference.
   * @type {string}
   */
  const LOCAL_STORAGE_KEY = 'user_preferred_language';

  /**
   * Detect the initial language.
   * Order:
   *  1) localStorage saved preference
   *  2) navigator.languages / navigator.language
   *  3) default
   *
   * @returns {'en'|'es'} The detected language (one of SUPPORTED_LANGUAGES or DEFAULT_LANGUAGE).
   */
  function detectInitialLanguage() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
      }

      const nav = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
      if (nav) {
        const short = String(nav).split('-')[0];
        if (SUPPORTED_LANGUAGES.includes(short)) return short;
      }
    } catch (e) {
      // Defensive logging only — never throw here.
      console.warn('LanguageDetector: detectInitialLanguage error', e);
    }
    return DEFAULT_LANGUAGE;
  }

  /**
   * Save user's preference in localStorage.
   * Silently fails if localStorage is unavailable.
   *
   * @param {string} lang - Language code to save (must be supported).
   * @returns {void}
   */
  function savePreferredLanguage(lang) {
    try {
      if (SUPPORTED_LANGUAGES.includes(lang)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, lang);
      } else {
        console.warn(`LanguageDetector: savePreferredLanguage ignored unsupported language "${lang}"`);
      }
    } catch (e) {
      console.warn('LanguageDetector: savePreferredLanguage error', e);
    }
  }

  // Public API
  const API = {
    detectInitialLanguage,
    savePreferredLanguage,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
  };

  // Merge into global to avoid breaking code that expects window.LanguageDetector
  try {
    if (typeof window !== 'undefined') {
      window.LanguageDetector = Object.assign(window.LanguageDetector || {}, API);
    }
  } catch (e) {
    // If even accessing window fails (very unusual), we silently continue with API local only.
    console.warn('LanguageDetector: could not assign to window', e);
  }

  return API;
})();
