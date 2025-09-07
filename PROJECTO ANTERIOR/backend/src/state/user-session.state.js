/*
  Archivo: frontend/src/state/user-session.state.js
  Propósito: Gestiona el estado de la sesión del usuario en el lado del cliente.
             Es la única fuente de verdad sobre si un usuario está autenticado,
             y almacena de forma segura el token JWT y los datos del perfil del usuario.
*/

const UserSessionState = (function () {
  'use strict';

  let current_user_token = null;
  let current_user_profile = null;
  
  /**
   * Inicia una nueva sesión de usuario.
   * @param {string} token - El token JWT recibido del backend.
   * @param {Object} userProfile - El objeto con los datos del perfil del usuario.
   */
  function startSession(token, userProfile) {
    current_user_token = token;
    current_user_profile = userProfile;

    // sessionStorage persiste los datos solo mientras la pestaña del navegador esté abierta.
    // Usar localStorage si se desea una sesión persistente entre cierres del navegador.
    sessionStorage.setItem('user_jwt_token', token);
    
    EventBus.publish('session:loggedIn', { user: userProfile });
    console.log('Estado de Sesión: Sesión iniciada para el usuario', userProfile.email);
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  function endSession() {
    current_user_token = null;
    current_user_profile = null;
    sessionStorage.removeItem('user_jwt_token');
    
    EventBus.publish('session:loggedOut');
    console.log('Estado de Sesión: Sesión cerrada.');
  }
  
  /**
   * Obtiene el token JWT actual.
   * @returns {string|null} El token JWT o null si no hay sesión.
   */
  function getToken() {
    return current_user_token;
  }

  /**
   * Inicializa el módulo, intentando reanudar una sesión desde sessionStorage.
   */
  function initialize() {
    const saved_token = sessionStorage.getItem('user_jwt_token');
    if (saved_token) {
      // En una implementación completa, aquí decodificaríamos el token para obtener los
      // datos del perfil y luego publicaríamos el evento 'session:loggedIn'.
      current_user_token = saved_token;
      console.log('Estado de Sesión: Sesión reanudada desde sessionStorage.');
    } else {
      console.log('Estado de Sesión: Inicializado, no hay sesión activa.');
    }
  }

  return {
    initialize,
    startSession,
    endSession,
    getToken,
  };
})();