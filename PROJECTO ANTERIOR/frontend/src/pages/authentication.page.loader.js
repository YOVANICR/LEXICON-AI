/*
  Archivo: frontend/src/pages/authentication.page.loader.js
  Propósito: Orquesta la lógica de la página de autenticación.
*/

const AuthenticationPageLoader = (function () {
  'use strict';
  
  async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const response = await BackendApiService.loginUser({ email, password });
      if (response && response.token) {
        UserSessionState.startSession(response.token, response.user);
        window.location.href = 'workspace-reader.html';
      } else {
        alert(response.message || 'Error desconocido al iniciar sesión.');
      }
    } catch (error) {
      alert('Error de conexión. No se pudo iniciar sesión.');
    }
  }
  
  async function handleRegisterSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await BackendApiService.registerUser({ email, password });
      alert(response.message);
      if (response.userId) {
        // Podríamos loguear automáticamente al usuario o pedirle que inicie sesión.
        window.location.reload(); // Recargar para que vea el formulario de login.
      }
    } catch (error) {
      alert('Error de conexión. No se pudo registrar la cuenta.');
    }
  }

  function initializePage() {
    try {
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      loginForm.addEventListener('submit', handleLoginSubmit);
      registerForm.addEventListener('submit', handleRegisterSubmit);
      console.log('Cargador de Página de Autenticación inicializado.');
    } catch (error) {
      console.error('Error al inicializar la página de autenticación.', error);
    }
  }

  return {
    initializePage,
  };
})();