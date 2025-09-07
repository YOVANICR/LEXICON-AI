/*
  PATH: src/i18n/translation.service.js

  Purpose:
  - Load locale JSON files (src/i18n/locales/*.json) and provide t(key) API.
  - Publish "language:changed" via EventBus when language changes (if EventBus exists).
  - Merge safely into window.TranslationService to avoid breaking code that expects that global.
*/

/**
 * TranslationService module.
 * Lightweight loader and accessor for i18n strings.
 *
 * Usage:
 *   await TranslationService.initialize(LanguageDetector.detectInitialLanguage());
 *   const text = TranslationService.t('menu.open');
 *
 * @module TranslationService
 */
const TranslationService = (function () {
  'use strict';

  const AVAILABLE_LANGUAGES = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ru: "Русский",
  ja: "日本語",
  zh: "中文",
  hi: "हिन्दी",
  ko: "한국어",
  pt: "Português",
  it: "Italiano",
  ar: "العربية",
  bn: "বাংলা",
  tr: "Türkçe",
  fa: "فارسی",
  sw: "Kiswahili",
  tl: "Filipino",
  pl: "Polski",
  uk: "Українська",
  el: "Ελληνικά"
};

  let strings = {};           // loaded translation map
  let currentLang = null;     // current language code
  let isInitialized = false;  // flag to avoid repeated initialization

  /**
   * Compute base URL for i18n folder relative to this script.
   * If document.currentScript is not available (bundler), falls back to '/src/i18n/'.
   * @returns {string}
   */
  const I18N_BASE = (function () {
    try {
      const scriptUrl = (document && document.currentScript && document.currentScript.src) || null;
      if (scriptUrl) {
        // returns a URL ending with slash
        return new URL('.', scriptUrl).href;
      }
    } catch (e) {
      // ignore and use fallback
    }
    return '/src/i18n/';
  })();

  /**
   * Load locale JSON. Non-throwing: returns an object or empty object on failure.
   *
   * @param {string} lang - language code (e.g. 'en' or 'es')
   * @returns {Promise<Object>} parsed JSON or {}
   */
  async function loadLocale(lang) {
    try {
      if (!lang || !AVAILABLE_LANGUAGES[lang]) {
        console.warn('TranslationService: loadLocale called with unsupported lang:', lang);
        return {};
      }
      const url = new URL(`locales/${lang}.json`, I18N_BASE).href;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        console.warn('TranslationService: failed to fetch locale', url, res.status);
        return {};
      }
      const json = await res.json();
      return json || {};
    } catch (err) {
      console.warn('TranslationService: loadLocale error', err);
      return {};
    }
  }

  /**
   * Initialize the translation service with the given language.
   * Does not throw — if loading fails, it leaves strings empty and returns the language used.
   *
   * @param {string} [lang] - preferred language; if omitted, 'es' fallback will be used
   * @returns {Promise<string>} the language that ended up being set
   */
  async function initialize(lang) {
    try {
      if (isInitialized && currentLang === lang) {
        return currentLang;
      }
      currentLang = lang || 'es';
      strings = await loadLocale(currentLang);
      isInitialized = true;

      // Notify others if EventBus exists
      try {
        if (typeof EventBus !== 'undefined' && EventBus.publish) {
          EventBus.publish('language:changed', { lang: currentLang });
        }
      } catch (e) {
        console.warn('TranslationService: EventBus publish failed', e);
      }

      console.log('[TranslationService] initialized with', currentLang);
      return currentLang;
    } catch (err) {
      console.error('[TranslationService] initialize unexpected error', err);
      isInitialized = true; // avoid repeated attempts that might loop
      return currentLang || 'es';
    }
  }

  /**
   * Change language at runtime.
   *
   * @param {string} lang - new language code
   * @returns {Promise<void>}
   */
  async function changeLanguage(lang) {
    try {
      if (!AVAILABLE_LANGUAGES[lang]) {
        console.warn('TranslationService: changeLanguage unsupported language', lang);
        return;
      }
      currentLang = lang;
      strings = await loadLocale(lang);

      // persist preference if LanguageDetector is available
      try {
        if (typeof window !== 'undefined' && window.LanguageDetector && window.LanguageDetector.savePreferredLanguage) {
          window.LanguageDetector.savePreferredLanguage(lang);
        }
      } catch (e) {
        console.warn('TranslationService: LanguageDetector.savePreferredLanguage failed', e);
      }

      // publish event
      try {
        if (typeof EventBus !== 'undefined' && EventBus.publish) {
          EventBus.publish('language:changed', { lang });
        }
      } catch (e) {
        console.warn('TranslationService: EventBus publish failed', e);
      }
    } catch (err) {
      console.error('TranslationService: changeLanguage error', err);
    }
  }

  /**
   * Translate a key (supports dot-notation for nested objects).
   *
   * @param {string} key - translation key, e.g. 'menu.open'
   * @param {string|null} [fallback=null] - fallback text if key not found (defaults to key)
   * @returns {string}
   */
  function translate(key, fallback = null) {
    try {
      if (!key) return fallback || '';
      if (key.indexOf('.') > -1) {
        const parts = key.split('.');
        let node = strings;
        for (const p of parts) {
          if (node && typeof node === 'object' && p in node) node = node[p];
          else {
            node = null;
            break;
          }
        }
        return typeof node === 'string' ? node : fallback || key;
      }
      return strings && key in strings ? strings[key] : fallback || key;
    } catch (e) {
      console.warn('TranslationService: translate error for key', key, e);
      return fallback || key;
    }
  }

  // Public API
  const API = {
    initialize,
    changeLanguage,
    translate,
    t: translate,
    getCurrentLanguage: () => currentLang,
    getAvailableLanguages: () => Object.assign({}, AVAILABLE_LANGUAGES)
  };

  // Merge into window safely
  try {
    if (typeof window !== 'undefined') {
      window.TranslationService = Object.assign(window.TranslationService || {}, API);
    }
  } catch (e) {
    console.warn('TranslationService: could not assign to window', e);
  }

  return API;
})();
