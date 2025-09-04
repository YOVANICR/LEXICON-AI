/* ==========================================================================
   Archivo: extension/content-highlighter.js
   Propósito: Resaltar palabras del léxico en la página.
   Versión Optimizada + Menú contextual para cambiar estados + hotkeys.
   ========================================================================== */
(function () {
  if (window.__LI_HIGHLIGHTER_RUNNING__) return;
  window.__LI_HIGHLIGHTER_RUNNING__ = true;

  const isYouTube = location.hostname.includes("youtube.com");
  const HIGHLIGHTABLE_STATUSES = new Set(["unknown", "learning", "known", "none"]);
  let lexicon = {};
  let highlightRegex = null;
  const observers = new WeakMap();

  let lastHoverHighlight = null;

  // --- UTILIDADES ---
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getRegex() {
    if (highlightRegex) return highlightRegex;
    const wordsToHighlight = Object.keys(lexicon).filter(key => {
      const entry = lexicon[key];
      return entry && entry.status && HIGHLIGHTABLE_STATUSES.has(entry.status);
    });
    if (wordsToHighlight.length === 0) return null;

    wordsToHighlight.sort((a, b) => b.length - a.length);
    const escapedWords = wordsToHighlight.map(word => escapeRegExp(word));
    try {
      highlightRegex = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");
    } catch (e) {
      const chunkSize = 200;
      const chunks = [];
      for (let i = 0; i < escapedWords.length; i += chunkSize) {
        chunks.push(new RegExp(`\\b(${escapedWords.slice(i, i + chunkSize).join("|")})\\b`, "gi"));
      }
      highlightRegex = chunks;
    }
    return highlightRegex;
  }

  function testAnyRegex(regexOrArray, text) {
    if (!regexOrArray) return false;
    if (Array.isArray(regexOrArray)) {
      return regexOrArray.some(r => (r.lastIndex = 0, r.test(text)));
    }
    regexOrArray.lastIndex = 0;
    return regexOrArray.test(text);
  }

  function execAll(regexOrArray, text, cb) {
    if (Array.isArray(regexOrArray)) {
      for (const r of regexOrArray) {
        r.lastIndex = 0;
        let m;
        while ((m = r.exec(text)) !== null) cb(m, r);
      }
    } else {
      let m;
      regexOrArray.lastIndex = 0;
      while ((m = regexOrArray.exec(text)) !== null) cb(m, regexOrArray);
    }
  }

  // --- FUNCIONES DE RESALTADO ---
  function highlightTextNode(textNode) {
    try {
      if (!textNode?.nodeValue || textNode.parentNode?.dataset?.liProcessed) return;

      const regex = getRegex();
      if (!regex) return;

      const original = textNode.nodeValue;
      if (!testAnyRegex(regex, original)) return;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      const matches = [];
      execAll(regex, original, (m) => {
        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
      });
      matches.sort((a, b) => a.start - b.start);

      for (const m of matches) {
        if (m.start > lastIndex) {
          frag.appendChild(document.createTextNode(original.slice(lastIndex, m.start)));
        }
        const lemmaLower = m.text.toLowerCase();
        const status = (lexicon[lemmaLower]?.status || "unknown").toLowerCase();

        const span = document.createElement("span");
        span.className = `li-highlight li-highlight--status-${status}`;
        span.textContent = m.text;
        frag.appendChild(span);

        lastIndex = m.end;
      }

      if (lastIndex < original.length) {
        frag.appendChild(document.createTextNode(original.slice(lastIndex)));
      }

      // Replace the text node with the fragment
      const parent = textNode.parentNode;
      if (parent) {
        parent.replaceChild(frag, textNode);
        if (frag.firstChild?.parentNode) {
          frag.firstChild.parentNode.dataset.liProcessed = "true";
        }
      }
    } catch (err) {
      // No-op: evitar romper la página por errores de manipulación DOM
      console.warn("[Highlighter] highlightTextNode error:", err);
    }
  }

  function processAllTextNodes(element) {
    if (!element || !lexicon) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const p = node.parentElement;
        // Rechazar elementos que no queremos tocar
        if (!p || p.closest('script, style, textarea, input, [contenteditable="true"], .li-highlight')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (p.dataset?.liProcessed) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const targets = [];
    while (walker.nextNode()) targets.push(walker.currentNode);
    for (const textNode of targets) highlightTextNode(textNode);
  }

  function updateExistingHighlights(root = document) {
    const spans = root.querySelectorAll(".li-highlight");
    for (const span of spans) {
      const lemmaLower = span.textContent.trim().toLowerCase();
      const status = (lexicon[lemmaLower]?.status || "unknown").toLowerCase();
      span.className = `li-highlight li-highlight--status-${status}`;
    }
  }

  // --- NUEVO: Resaltar frases completas ---
  function wrapSelectionAsPhrase(state) {
    try {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return;

      const contents = range.cloneContents();
      // Quitar spans previos
      contents.querySelectorAll(".li-highlight").forEach(span => {
        const parent = span.parentNode;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      });

      const text = contents.textContent.trim();
      if (!text) return;

      // Crear span unificado
      const span = document.createElement("span");
      span.className = `li-highlight li-highlight--status-${state}`;
      span.textContent = text;

      range.deleteContents();
      range.insertNode(span);

      chrome.runtime.sendMessage({
        action: "updateWordStatus",
        word: text,
        status: state
      });

      sel.removeAllRanges();
    } catch (err) {
      console.warn("[Highlighter] wrapSelectionAsPhrase error:", err);
    }
  }

  // --- OBSERVADORES ---
  function observe(target, cb, options) {
    if (!target) return;
    let obs = observers.get(target);
    if (!obs) {
      obs = new MutationObserver(cb);
      obs.observe(target, options);
      observers.set(target, obs);
    }
  }

  function startHighlighting(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    processAllTextNodes(root);
    observe(root, (mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          try {
            if (n.nodeType === 3) {
              highlightTextNode(n);
            } else if (n.nodeType === 1) {
              processAllTextNodes(n);
            }
          } catch (_) { /* ignore nodes that detach quickly */ }
        }
      }
    }, { childList: true, subtree: true });
  }

  // --- YOUTUBE (mantener subtítulos intactos + añadir titles/desc/comments con scroll infinito) ---
  function initYouTube() {
    // probeStaticContent: intenta iniciar resaltado para comentarios, descripción y títulos
    const probeStaticContent = () => {
      try {
        // Comentarios: preferimos el contenedor #contents dentro de #comments
        const commentsRoot = document.querySelector("#comments");
        if (commentsRoot) {
          const commentsContents = commentsRoot.querySelector('#contents') || commentsRoot;
          startHighlighting(commentsContents);
        }

        // Descripción (normal y expandida)
        const description = document.querySelector("#description, #description-inline-expander");
        if (description) startHighlighting(description);

        // Títulos (pueden aparecer varios; por seguridad los procesamos todos)
        const titles = document.querySelectorAll("#video-title");
        titles.forEach(title => startHighlighting(title));
      } catch (err) {
        console.warn("[Highlighter] probeStaticContent error:", err);
      }
    };

    // Observer dedicado para detectar subtítulos (dejamos la lógica previa intacta)
    const mainObserver = new MutationObserver((mutations, obs) => {
      try {
        const captionContainer = document.querySelector(".ytp-caption-window-container");
        if (captionContainer) {
          // Mantener la lógica existente para subtítulos (no la tocamos)
          console.log("[Highlighter] Contenedor de subtítulos detectado. Iniciando observador de segmentos.");
          const captionObserver = new MutationObserver(() => {
            const newSegments = captionContainer.querySelectorAll('.ytp-caption-segment:not([data-li-processed="true"])');
            if (newSegments.length > 0) {
              newSegments.forEach(segment => {
                processAllTextNodes(segment);
                segment.setAttribute('data-li-processed', 'true');
              });
            }
          });
          captionObserver.observe(captionContainer, { childList: true, subtree: true });
          // No desconectamos aquí el mainObserver porque también lo usaremos para detectar cuando
          // aparezcan secciones como #comments o #description en navegación SPA; en muchas páginas
          // YouTube los elementos se inyectan pronto, pero puede variar.
        }

        // Además de subtítulos, si aparecen nuevas secciones (comments/description/title) las procesamos
        probeStaticContent();
      } catch (err) {
        console.warn("[Highlighter] mainObserver callback error:", err);
      }
    });

    // Observador adicional ligero para detectar aparición inicial tardía de #comments / description / titles
    // Se desconecta una vez que encuentra y lanza startHighlighting (ya que startHighlighting instala su propio observer)
    const commentsProbeObserver = new MutationObserver((mutations, obs) => {
      try {
        const commentsRoot = document.querySelector("#comments");
        const description = document.querySelector("#description, #description-inline-expander");
        const hasTitles = document.querySelector("#video-title");
        if (commentsRoot || description || hasTitles) {
          probeStaticContent();
          obs.disconnect(); // ya startHighlighting puso su propio observer; este probe ya no hace falta
        }
      } catch (err) {
        // ignore
      }
    });

    // Lanzar primera pasada
    probeStaticContent();

    // Empezar observadores
    mainObserver.observe(document.body, { childList: true, subtree: true });
    commentsProbeObserver.observe(document.body, { childList: true, subtree: true });
  }

  // --- RECARGA ---
  function reloadAndHighlight() {
    highlightRegex = null;
    chrome.runtime.sendMessage({ action: "getLexiconForHighlighting" }, (response) => {
      if (chrome.runtime.lastError || !response?.lexicon) {
        lexicon = {};
        return;
      }
      lexicon = response.lexicon;
      updateExistingHighlights(document);
      processAllTextNodes(document.body);
      if (isYouTube) initYouTube();
    });
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "lexiconUpdated") {
      reloadAndHighlight();
    }
  });

  // --- CARGA INICIAL ---
  chrome.runtime.sendMessage({ action: "getLexiconForHighlighting" }, (response) => {
    if (chrome.runtime.lastError || !response?.lexicon || Object.keys(response.lexicon).length === 0) {
      return;
    }
    lexicon = response.lexicon;
    if (isYouTube) initYouTube();
    else startHighlighting(document.body);
  });

  // ===========================================================
  // CONTEXT MENU Y HOTKEY
  // ===========================================================
  document.addEventListener("mouseover", (e) => {
    const t = e.target && e.target.closest(".li-highlight");
    if (t) lastHoverHighlight = t;
  }, true);

  function removeOldMenu() {
    const oldMenu = document.querySelector("#li-context-menu");
    if (oldMenu) oldMenu.remove();
  }

  function openContextMenuForTarget(target, x, y) {
    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed;

    const word = hasSelection ? sel.toString().trim().toLowerCase() : (target?.textContent.trim().toLowerCase() || "");
    if (!word) return;

    const options = [
      { status: "unknown", label: "No Aprendida" },
      { status: "learning", label: "Aprendiendo" },
      { status: "known",   label: "Aprendida" },
      { status: "none",    label: "Sin etiqueta" }
    ];

    removeOldMenu();

    const menu = document.createElement("div");
    menu.id = "li-context-menu";
    menu.style.position = "fixed";
    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
    menu.style.background = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.padding = "6px";
    menu.style.zIndex = 2147483647;
    menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    menu.style.fontSize = "14px";
    menu.style.borderRadius = "6px";
    menu.style.minWidth = "160px";

    options.forEach(opt => {
      const item = document.createElement("div");
      item.textContent = opt.label;
      item.style.cursor = "pointer";
      item.style.padding = "6px 10px";
      item.style.userSelect = "none";
      item.addEventListener("mouseenter", () => item.style.background = "#f2f2f2");
      item.addEventListener("mouseleave", () => item.style.background = "transparent");
      item.addEventListener("click", () => {
        if (hasSelection) {
          wrapSelectionAsPhrase(opt.status);
        } else if (target) {
          target.className = `li-highlight li-highlight--status-${opt.status}`;
          chrome.runtime.sendMessage({
            action: "updateWordStatus",
            word,
            status: opt.status
          });
        }
        removeOldMenu();
      });
      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    const close = () => removeOldMenu();
    setTimeout(() => {
      document.addEventListener("click", close, { once: true });
      document.addEventListener("scroll", close, { once: true, capture: true });
      window.addEventListener("blur", close, { once: true });
    }, 0);
  }

  // Context menu: si hay selección o estamos sobre un highlight
  document.addEventListener("contextmenu", (e) => {
    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed;
    const target = e.target && e.target.closest(".li-highlight");
    if (!target && !hasSelection) return;
    e.preventDefault();
    openContextMenuForTarget(target, e.clientX, e.clientY);
  });

  // Hotkey Ctrl+Shift+X → abre menú sobre selección o highlight cercano
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.code === "KeyX" || e.key.toLowerCase() === "x")) {
      const sel = window.getSelection();
      const hasSelection = sel && !sel.isCollapsed;
      let target = null;

      if (!hasSelection && sel && sel.rangeCount > 0) {
        const anchorEl = (sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement)) || null;
        if (anchorEl) target = anchorEl.closest(".li-highlight");
      }
      if (!target && document.activeElement) {
        target = document.activeElement.closest && document.activeElement.closest(".li-highlight");
      }
      if (!target) target = lastHoverHighlight;

      if (target || hasSelection) {
        e.preventDefault();
        const rect = (target?.getBoundingClientRect?.() || { left: e.clientX, top: e.clientY, width: 0, height: 0 });
        const x = rect.left + Math.min(120, rect.width / 2);
        const y = rect.top + rect.height;
        openContextMenuForTarget(target, Math.max(8, x), Math.max(8, y));
      }
    }
  });
})();
