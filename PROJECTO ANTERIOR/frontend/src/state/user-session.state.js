/*
  Archivo: frontend/src/state/user-session.state.js
  Propósito: Gestiona el estado de la sesión del usuario en el lado del cliente.
             Almacena el token JWT y los datos básicos del perfil del usuario.
             Actúa como la "fuente de la verdad" sobre si un usuario está autenticado.
*/

const UserSessionState = (function () {
  'use strict';

  /**
   * @private
   * Almacena el token JWT de la sesión activa.
   * Por ahora, usaremos un token ficticio para las pruebas de autorización.
   * @type {string|null}
   */
  let current_user_token = null;
  
  /**
   * @private
   * Almacena el objeto del perfil del usuario logueado.
   * @type {Object|null}
   */
  let current_user_profile = null;
  
  /**
   * ==========================================================================
   * ANÁLISIS DE ERRORES Y SOLUCIÓN
   * ==========================================================================
   * ERROR IDENTIFICADO: Las peticiones a /api/documents y /api/lexicon fallan con 401 (Unauthorized).
   * CAUSA: El frontend no está enviando ningún token JWT al backend para autorizar las peticiones.
   * SOLUCIÓN: Implementar un mecanismo para obtener y almacenar un token JWT (incluso si es ficticio por ahora)
   * y proporcionarlo a 'BackendApiService' para que lo incluya en las cabeceras.
   * Este módulo será la fuente de ese token.
   * ==========================================================================
   */

  /**
   * Inicia una nueva sesión de usuario con un token y perfil.
   * Normalmente, esto sería llamado después de un login exitoso.
   * @param {string} token - El token JWT recibido del backend.
   * @param {Object} userProfile - El objeto con los datos del perfil del usuario.
   */
  function startSession(token, userProfile) {
    current_user_token = token;
    current_user_profile = userProfile;

    // Persistir el token en sessionStorage para que la sesión se mantenga en la pestaña
    try {
      sessionStorage.setItem('user_jwt_token', token);
      sessionStorage.setItem('user_profile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('UserSessionState: No se pudo guardar la sesión en sessionStorage.', error);
    }
    
    EventBus.publish('session:loggedIn', { user: userProfile });
    console.log('UserSessionState: Sesión iniciada para el usuario', userProfile.email || 'desconocido');
  }

  /**
   * Cierra la sesión del usuario actual.
   * Elimina el token y el perfil de la memoria y de sessionStorage.
   */
  function endSession() {
    current_user_token = null;
    current_user_profile = null;
    try {
      sessionStorage.removeItem('user_jwt_token');
      sessionStorage.removeItem('user_profile');
    } catch (error) {
      console.error('UserSessionState: No se pudo remover la sesión de sessionStorage.', error);
    }
    
    EventBus.publish('session:loggedOut');
    console.log('UserSessionState: Sesión cerrada.');
  }
  
  /**
   * Obtiene el token JWT actual.
   * @returns {string|null} El token JWT o null si no hay sesión activa.
   */
  function getToken() {
    // Si no hay token en memoria, intenta recuperarlo de sessionStorage.
    if (!current_user_token) {
      try {
        current_user_token = sessionStorage.getItem('user_jwt_token');
      } catch (error) {
        console.error('UserSessionState: Error al recuperar token de sessionStorage.', error);
      }
    }
    return current_user_token;
  }

  /**
   * Obtiene el perfil del usuario actualmente logueado.
   * @returns {Object|null} El perfil del usuario o null si no hay sesión activa.
   */
  function getCurrentUserProfile() {
    if (!current_user_profile) {
      try {
        const profile_json = sessionStorage.getItem('user_profile');
        if (profile_json) {
          current_user_profile = JSON.parse(profile_json);
        }
      } catch (error) {
        console.error('UserSessionState: Error al recuperar perfil de sessionStorage.', error);
      }
    }
    return current_user_profile;
  }

  /**
   * Inicializa el módulo.
   * Intenta reanudar una sesión existente desde sessionStorage al cargar la página.
   * Para las pruebas actuales, si no hay sesión, inicia una con un token ficticio.
   */
  function initialize() {
    console.log('UserSessionState: Inicializando...');
    const saved_token = sessionStorage.getItem('user_jwt_token');
    if (saved_token) {
      current_user_token = saved_token;
      const saved_profile = sessionStorage.getItem('user_profile');
      if (saved_profile) {
        current_user_profile = JSON.parse(saved_profile);
      }
      console.log('UserSessionState: Sesión reanudada desde sessionStorage.');
      EventBus.publish('session:loggedIn', { user: current_user_profile });
    } else {
      // Por propósitos de desarrollo y para superar el 401,
      // iniciamos una sesión ficticia automáticamente si no hay una.
      console.warn('UserSessionState: No hay sesión activa. Iniciando sesión ficticia para desarrollo.');
      startSession('FAKE_JWT_TOKEN_FOR_DEVELOPMENT', { email: 'dev@example.com', name: 'Desarrollador' });
    }
  }

  return {
    initialize,
    startSession,
    endSession,
    getToken,
    getCurrentUserProfile,
  };
})();