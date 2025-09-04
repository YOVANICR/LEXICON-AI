/* ==========================================================================
   Archivo: background.js
   Propósito: Orquestador principal. Incluye importador de artículos y menú contextual.
   ========================================================================== */

const API_BASE_URL = 'http://localhost:3333/api';

// ==========================================================================
// CONFIGURACIÓN INICIAL Y MENÚ CONTEXTUAL
// ==========================================================================

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "li-main-menu",
    title: "Lector Inmersivo",
    contexts: ["selection"]
  });

  const statuses = [
    { id: "learning", title: "Marcar como 'Aprendiendo'" },
    { id: "known",    title: "Marcar como 'Aprendida'" },
    { id: "unknown",  title: "Marcar como 'No Aprendida'" },
    { id: "none",     title: "Quitar Estado" }
  ];

  statuses.forEach(statusInfo => {
    chrome.contextMenus.create({
      id: `li-status-${statusInfo.id}`,
      parentId: "li-main-menu",
      title: statusInfo.title,
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = (info.selectionText || "").trim();
  if (!selectedText) return;

  const status = info.menuItemId.replace('li-status-', '');
  saveWordAndUpdate({
    word: selectedText,
    status: status
  });
});

// ==========================================================================
// LÓGICA DEL IMPORTADOR DE ARTÍCULOS
// ==========================================================================

chrome.action.onClicked.addListener((tab) => {
  // Inyectar Readability.js primero
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["lib/Readability.js"]
  }).then(() => {
    // Luego el extractor
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-extractor.js"]
    });
  });
});

// ==========================================================================
// LÓGICA DE COMUNICACIÓN Y GUARDADO
// ==========================================================================

function notifyLexiconUpdate() {
  chrome.tabs.query({}, (tabs) => {
    for (const t of tabs) {
      try {
        chrome.tabs.sendMessage(t.id, { action: "lexiconUpdated" }, () => {
          // Evitar crash por lastError cuando la pestaña no tiene content script
          void chrome.runtime.lastError;
        });
      } catch (_) {
        // No-op
      }
    }
  });
}

async function saveWordAndUpdate(payload) {
  const { word, status } = payload;
  const lowerWord = (word || "").toLowerCase();

  try {
    const response = await fetch(`${API_BASE_URL}/add-phrase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lemma: lowerWord, isPhrase: word.includes(' '), status: status })
    });
    if (!response.ok) {
      let errorMsg = `Error del servidor: ${response.status}.`;
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMsg = errorData.message;
      } catch (_) {}
      throw new Error(errorMsg);
    }
    console.log(`[Background] Guardado/Actualizado: "${lowerWord}" (${status})`);
    notifyLexiconUpdate();
  } catch (error) {
    console.error(`[Background] Error al guardar selección:`, error?.message || error);
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "capture-phrase") {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs && tabs[0];
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, { action: "getSubtitle" }, (response) => {
        if (response && response.phrase) {
          saveWordAndUpdate({ word: response.phrase.trim(), status: 'learning' });
        } else {
          console.log("[Background] No se encontró subtítulo visible.");
        }
      });
    } catch (e) {
      console.warn(`[Background] No se pudo comunicar con content script:`, e?.message || e);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveSelectedWord") {
    saveWordAndUpdate(request.payload);
    return; // no async response aquí
  }
  
  if (request.action === "getLexiconForHighlighting") {
    fetch(`${API_BASE_URL}/database`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(db => sendResponse({ lexicon: db.lexicon }))
      .catch(err => {
        console.error("[Background] No se pudo obtener la BD:", err);
        sendResponse({ lexicon: null, error: String(err) });
      });
    return true; // mantener el canal abierto para sendResponse
  }

  if (request.action === "updateWordStatus") {
    const { word, status } = request;
    saveWordAndUpdate({ word, status });
    // No necesitamos sendResponse; el content ya actualiza visualmente y luego llegará "lexiconUpdated"
    return;
  }

  if (request.action === "articleExtracted") {
    const { title, content } = request.payload;
    const encodedTitle = encodeURIComponent(title);
    chrome.storage.session.set({ articleForImport: content }, () => {
      const urlToOpen = `http://localhost:3333/index.html?importTitle=${encodedTitle}&importFromStorage=true`;
      chrome.tabs.create({ url: urlToOpen });
    });
  } else if (request.action === "extractionFailed") {
    try {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: () => alert("No se pudo extraer un artículo de esta página.")
      });
    } catch (_) {
      // No-op
    }
  }
});
