/* ==========================================================================
   Archivo: frontend/src/shared/utils/text-processor.js
   Propósito: Módulo de procesamiento de lenguaje.
   ========================================================================== */
const TextProcessor = (() => {
  const WORD_RE = /[A-Za-z]+(?:'[A-Za-z]+)?/;
  const PRON = new Set(['i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their','mine','yours','hers','ours','theirs']);
  const DET = new Set(['the','a','an','this','that','these','those','some','any','no','each','every','either','neither','much','many','few','several','all','both']);

  function tokenize(text) {
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (/\s/.test(ch)) {
        let j = i + 1; 
        while (j < text.length && /\s/.test(text[j])) j++;
        tokens.push({ type: 'space', text: text.slice(i, j) });
        i = j; 
        continue;
      }
      let m = text.slice(i).match(new RegExp('^' + WORD_RE.source));
      if (m) {
        tokens.push({ type: 'word', text: m[0] });
        i += m[0].length; 
        continue;
      }
      tokens.push({ type: 'punct', text: ch }); 
      i++;
    }
    return tokens;
  }

  function lemmaOf(w) {
    const lw = w.toLowerCase();
    if (PRON.has(lw) || DET.has(lw)) return lw;
    if (lw.endsWith('ies')) return lw.slice(0, -3) + 'y';
    if (/(ses|xes|zes|ches|shes)$/.test(lw)) return lw.slice(0, -2);
    if (lw.endsWith('s') && lw.length > 3 && !lw.endsWith('ss')) return lw.slice(0, -1);
    if (lw.endsWith('ing') && lw.length > 4) return lw.slice(0, -3);
    if (lw.endsWith('ed') && lw.length > 3) return lw.slice(0, -2);
    return lw;
  }

  function segmenter(text) {
    const lines = text.split('\n');
    let allTokens = [];
    let sentenceIndex = 0;
    let phraseIndex = 0;
    const SENTENCE_END = new Set(['.', '!', '?']);
    const PHRASE_DELIMITER = new Set([',', ';', ':']);
    lines.forEach((lineText, lineIndex) => {
      const lineTokens = tokenize(lineText);
      lineTokens.forEach((token, tokenIndex) => {
        token.lineIndex = lineIndex;
        token.sentenceIndex = sentenceIndex;
        token.phraseIndex = phraseIndex;
        token.localIndex = tokenIndex;
        if (token.type === 'word') {
          allTokens.push(token);
        }
        if (token.type === 'punct') {
          if (SENTENCE_END.has(token.text)) {
            sentenceIndex++;
            phraseIndex++;
          } else if (PHRASE_DELIMITER.has(token.text)) {
            phraseIndex++;
          }
        }
      });
    });
    return allTokens;
  }

  return {
    tokenize,
    lemmaOf,
    segmenter,
  };
})();
