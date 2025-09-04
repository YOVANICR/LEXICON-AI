/* ==========================================================================
   Archivo: extension/content-video.js
   Propósito: Responder con el texto de subtítulos visibles (YT/Netflix).
   Nota: Solo lectura; no resalta. El resaltado lo hace content-highlighter.
   ========================================================================== */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSubtitle") {
    let currentPhrase = "";
    const host = location.hostname;

    if (host.includes("youtube")) {
      const container = document.querySelector(".ytp-caption-window-container");
      if (container) {
        const segments = container.querySelectorAll(".ytp-caption-segment");
        currentPhrase = Array.from(segments).map(s => s.textContent).join(" ").trim();
        console.log("[Content-Video] (YT) Captions detectados.");
      } else {
        console.log("[Content-Video] (YT) No captions visibles. Activa CC.");
      }
    } else if (host.includes("netflix")) {
      const segments = document.querySelectorAll(".player-timedtext-text-container span");
      currentPhrase = Array.from(segments).map(s => s.textContent).join(" ").trim();
      if (currentPhrase) console.log("[Content-Video] (NFLX) Subtítulos detectados.");
    }

    sendResponse({ phrase: currentPhrase || null });
  }
  return true;
});
