/*
  Archivo: backend/src/modules/auth/auth.controller.js
  Propósito: (Capa HTTP) Maneja las peticiones y respuestas HTTP para el módulo de autenticación.
             Extrae los datos de la petición, invoca a la capa de servicio para ejecutar la lógica de negocio,
             y formatea la respuesta HTTP (éxito o error).
*/

'use strict';

const AuthenticationService = require('./auth.service');

/**
 * Controlador para manejar el registro de un nuevo usuario.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function registerNewUser(request, response) {
  try {
    const { email, password } = request.body;

    // Validación de entrada simple. Una validación más robusta usaría DTOs o librerías como Joi.
    if (!email || !password) {
      return response.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
    }

    const result = await AuthenticationService.registerNewUser({ email, password });
    return response.status(201).json({ message: 'Usuario registrado exitosamente.', userId: result.id });

  } catch (error) {
    // Si el servicio lanza un error (ej. "Usuario ya existe"), lo capturamos y enviamos una respuesta adecuada.
    return response.status(409).json({ message: error.message });
  }
}

/**
 * Controlador para manejar el inicio de sesión de un usuario.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function authenticateUser(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
    }

    const { token, user } = await AuthenticationService.loginUser({ email, password });
    return response.status(200).json({ message: 'Inicio de sesión exitoso.', token, user });

  } catch (error) {
    return response.status(401).json({ message: error.message });
  }
}

module.exports = {
  registerNewUser,
  authenticateUser,
};