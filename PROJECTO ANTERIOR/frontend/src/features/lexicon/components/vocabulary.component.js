/* ==========================================================================
   Archivo: frontend/src/features/lexicon/components/vocabulary.component.js
   Propósito: Componente que gestiona la lógica y renderizado del panel de Vocabulario (Léxico).
   ========================================================================== */

const VocabularyComponent = ((vocabularyModel, dom) => {
  const { elements } = dom;

  function init() {
    elements.searchLexInput.addEventListener('input', MainController.renderLexicon);
    elements.filterStatusSelect.addEventListener('change', MainController.renderLexicon);
    elements.exportLexCsvBtn.addEventListener('click', _handleExportLexicon);
    elements.importCsvBtn.addEventListener('click', () => elements.importCsvFile.click());
    elements.importCsvFile.addEventListener('change', (e) => _handleImportLexicon(e.target.files[0]));
  }

  function _handleExportLexicon() {
      const lexicon = vocabularyModel.getLexicon();
      if (Object.keys(lexicon).length === 0) return dom.toast('El léxico está vacío.');
      const dataToExport = Object.values(lexicon).map(w => ({ lemma: w.lemma, status: w.status || 'none', seen: w.seen || 0 }));
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mi_lexicon.csv';
      a.click();
      URL.revokeObjectURL(a.href);
      dom.toast('Léxico exportado como CSV.');
  }

  function _handleImportLexicon(file) {
      if (!file) return;
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              // La importación ahora sucede en el modelo, que devuelve el conteo.
              const importedCount = vocabularyModel.importFromCSV(results.data);
              if (importedCount > 0) {
                dom.toast(`${importedCount} palabra(s) importada(s).`);
                MainController.renderAll();
              } else {
                dom.toast('No se encontraron datos válidos.');
              }
          }
      });
  }

  function render(lexicon, searchQuery = '', statusFilter = 'all') {
    const query = searchQuery.trim().toLowerCase();
    const rows = Object.values(lexicon)
      .filter(r => {
        const matchesQuery = !query || r.lemma.includes(query);
        const matchesStatus = statusFilter === 'all' || (r.status || 'none') === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => (b.seen || 0) - (a.seen || 0));
    elements.lexiconTableBody.innerHTML = '';
    if (rows.length === 0) {
        elements.lexiconTableBody.innerHTML = '<tr><td colspan="2" class="u-text-muted" style="text-align:center;padding:20px;">No hay palabras que coincidan.</td></tr>';
        return;
    }
    rows.forEach(r => {
      const tr = document.createElement('tr');
      const status = r.status || Helpers.STATUS.NONE;
      const phraseBadge = r.isPhrase ? '<span class="c-pill c-pill--phrase">Frase</span>' : '';
      tr.innerHTML = `
        <td class="c-lexicon-table__cell">
          <strong>${Helpers.escapeHTML(r.lemma)}</strong>
          ${phraseBadge}
        </td>
        <td class="c-lexicon-table__cell">
          <span class="c-pill c-pill--status-${status}">${_statusToLabel(status)}</span>
        </td>
      `;
      elements.lexiconTableBody.appendChild(tr);
    });
  }

  function _statusToLabel(s) {
    const { UNKNOWN, LEARNING, KNOWN } = Helpers.STATUS;
    return s === UNKNOWN ? 'No aprendida' : s === LEARNING ? 'En proceso' : s === KNOWN ? 'Aprendida' : 'Sin estado';
  }

  return { init, render };
})(VocabularyModel, DOM);