/*
  Archivo: frontend/src/services/backend-api.service.js
  Propósito: Centraliza todas las llamadas a la API del backend. Este es el ÚNICO lugar
             en la aplicación que conoce las URLs del servidor. Abstrae la complejidad de `fetch`
             y proporciona un manejo de errores de red consistente.
*/

const BackendApiService = (function () {
  'use strict';

  /**
   * @private
   * La URL base de la API del servidor. En un entorno de producción, esto provendría de un archivo de configuración.
   */
  const API_BASE_URL = 'http://localhost:3333/api';

  /**
   * Carga todo el estado de la base de datos (documentos y léxico) desde el servidor.
   * @returns {Promise<Object>} Una promesa que resuelve con el estado de la base de datos ({ docs, lexicon }).
   * @throws {Error} Si la respuesta de la red no es exitosa.
   */
  async function loadFullDatabase() {
    try {
      const response = await fetch(`${API_BASE_URL}/database`);

      // Verificación profesional: no basta con que la promesa resuelva, la respuesta HTTP debe ser exitosa (status 2xx).
      if (!response.ok) {
        throw new Error(`Error del servidor al cargar la base de datos. Estado: ${response.status}`);
      }

      const databaseState = await response.json();
      console.log('Servicio API: Base de datos cargada exitosamente desde el servidor.');
      return {
        docs: databaseState.docs || [],
        lexicon: databaseState.lexicon || {}
      };
    } catch (networkError) {
      console.error('Servicio API: No se pudo conectar al servidor para cargar la BD. ¿Está funcionando?', networkError);
      // Aquí se podría lanzar el error para que el llamador lo maneje o devolver un estado por defecto.
      // Devolver un estado por defecto hace la aplicación más resiliente.
      return { docs: [], lexicon: {} };
    }
  }

  /**
   * Guarda el estado completo de la aplicación en el servidor.
   * @param {Object} fullDatabaseState - El objeto que contiene { docs, lexicon }.
   * @returns {Promise<void>}
   */
  async function saveFullDatabase(fullDatabaseState) {
    try {
      const response = await fetch(`${API_BASE_URL}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullDatabaseState)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor al guardar la base de datos. Estado: ${response.status}`);
      }
      
      console.log('Servicio API: El estado se ha guardado correctamente en el servidor.');
    } catch (networkError) {
      console.error('Servicio API: No se pudo guardar la base de datos en el servidor.', networkError);
      // Opcionalmente, notificar al usuario a través de un toast.
      // ToastHandler.showToast('Error de conexión al guardar los datos.');
    }
  }

  // API Pública del Servicio
  return {
    loadFullDatabase,
    saveFullDatabase,
  };
})();