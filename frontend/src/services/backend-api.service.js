/*
  Archivo: frontend/src/services/backend-api.service.js
  Propósito: Centraliza todas las llamadas `fetch` a tu propio backend.
*/

const BackendApiService = (function () {
  'use strict';
  
  const API_BASE_URL = 'http://localhost:3333/api';

  /**
   * Envía las credenciales del usuario al endpoint de registro.
   * @param {Object} credentials - Objeto con { email, password }.
   * @returns {Promise<Object>} La respuesta del servidor.
   */
 async function registerUser(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await response.json();
    } catch (error) {
      console.error('Servicio API: Error de red al intentar registrar usuario.', error);
      return { message: 'Error de conexión con el servidor.' };
    }
  }

  async function loginUser(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await response.json();
    } catch (error) {
      console.error('Servicio API: Error de red al intentar iniciar sesión.', error);
      return { message: 'Error de conexión con el servidor.' };
    }
  }

  // ... (otras funciones como loadFullDatabase, etc.) ...
  
  return {
    registerUser,
    loginUser,
    loadFullDatabase,
    saveFullDatabase,
  };
})();