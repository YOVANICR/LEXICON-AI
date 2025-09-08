/*
  Archivo: frontend/src/services/backend-api.service.js
  Propósito: Centraliza todas las llamadas `fetch` al backend modular. Este es el ÚNICO
             lugar que conoce las URLs de la nueva API RESTful.
*/

const BackendApiService = (function () {
  'use strict';
  
  // URL base del servidor. Centralizada para fácil modificación.
  const API_BASE_URL = 'http://localhost:3333/api';

  /**
   * ==========================================================================
   * ANÁLISIS DE ERRORES Y SOLUCIÓN
   * ==========================================================================
   * ERROR IDENTIFICADO: Peticiones GET a /api/documents y /api/lexicon fallan con 401 (Unauthorized).
   * CAUSA: Las peticiones no incluían un encabezado 'Authorization' con un token JWT.
   * SOLUCIÓN: La función 'createAuthenticatedHeaders' ahora obtiene el token desde
   * 'UserSessionState' y lo incluye en todas las peticiones protegidas.
   * ==========================================================================
   */

  /**
   * Función de ayuda para crear cabeceras autenticadas.
   * Obtiene el token JWT desde `UserSessionState` y lo añade.
   * @private
   */
  function createAuthenticatedHeaders() {
    const token = UserSessionState.getToken(); // Obtiene el token del módulo de estado de sesión.
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // Añade el token si existe.
    }
    return headers;
  }

  /**
   * Carga la lista de documentos del usuario desde el endpoint GET /documents.
   * @returns {Promise<Array>} Una promesa que resuelve con la lista de documentos.
   */
  async function getDocuments() {
    try {
      // Flujo: Realiza la petición GET al endpoint específico de documentos.
      // Se incluyen las cabeceras de autenticación.
      const response = await fetch(`${API_BASE_URL}/documents`, {
        headers: createAuthenticatedHeaders()
      });
      // Si la respuesta no es exitosa (ej. 401, 404, 500), se lanza un error.
      if (!response.ok) {
        // Mejor manejo de errores: Si es 401, indicamos que se necesita login.
        if (response.status === 401) {
          ToastHandler.showToast('Sesión no autorizada. Por favor, inicia sesión.');
        }
        throw new Error(`Error del servidor al cargar documentos: ${response.status}`);
      }
      // Se retorna la respuesta parseada como JSON.
      return await response.json();
    } catch (error) {
      console.error('Servicio API: Fallo al cargar documentos.', error);
      // Evita mostrar un segundo toast si ya se mostró uno de 401.
      if (!error.message.includes('401')) { 
        ToastHandler.showToast('Error de conexión al cargar tus documentos.');
      }
      return []; // Devuelve un array vacío para que la app no se rompa.
    }
  }

  /**
   * Carga el léxico del usuario desde el endpoint GET /lexicon.
   * @returns {Promise<Object>} Una promesa que resuelve con el objeto del léxico.
   */
  async function getLexicon() {
    try {
      // Flujo: Realiza la petición GET al endpoint específico de léxico.
      // Se incluyen las cabeceras de autenticación.
      const response = await fetch(`${API_BASE_URL}/lexicon`, {
        headers: createAuthenticatedHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) {
          ToastHandler.showToast('Sesión no autorizada. Por favor, inicia sesión.');
        }
        throw new Error(`Error del servidor al cargar el léxico: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Servicio API: Fallo al cargar el léxico.', error);
      if (!error.message.includes('401')) {
        ToastHandler.showToast('Error al cargar tu léxico.');
      }
      return {}; // Devuelve un objeto vacío para que la app no se rompa.
    }
  }

  // Se exponen las nuevas funciones modulares.
  return {
    getDocuments,
    getLexicon,
  };
})();