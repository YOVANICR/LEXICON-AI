/* ==========================================================================
   Archivo: frontend/src/core/api.service.js
   Propósito: Capa de comunicación con el servidor (carga/guardado de la BD).
   ========================================================================== */

const ApiService = {
  API_URL: 'http://localhost:3333/api/database',

  async load() {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        // El servidor respondió, pero con un error (ej. 404, 500)
        console.error('Error del servidor al cargar la BD. Estado:', response.status);
        DOM.toast(`Error del servidor (${response.status}) al cargar datos.`);
        return { docs: [], lexicon: {} };
      }
      const db = await response.json();
      console.log('Base de datos cargada desde el servidor.');
      return { docs: db.docs || [], lexicon: db.lexicon || {} };
    } catch (error) {
      // El servidor no respondió (apagado, sin conexión, etc.)
      console.error('No se pudo conectar al servidor para cargar la BD. ¿Está funcionando?', error);
      DOM.toast('Error de conexión. ¿El servidor está iniciado?');
      return { docs: [], lexicon: {} };
    }
  },

  async save(dbState) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbState)
      });
       if (!response.ok) {
        console.error('Error del servidor al guardar la BD. Estado:', response.status);
        DOM.toast(`Error del servidor (${response.status}) al guardar.`);
      }
    } catch (error) {
      console.error('No se pudo guardar la base de datos en el servidor.', error);
      DOM.toast('Error de conexión al guardar los datos.');
    }
  }
};