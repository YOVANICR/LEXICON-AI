/*
  Archivo: backend/src/modules/users/users.controller.js
  Propósito: (Capa HTTP) Maneja las peticiones y respuestas para obtener y
             actualizar los datos del perfil de un usuario.
*/

'use strict';

const UsersService = require('./users.service');

/**
 * Controlador para obtener el perfil del usuario actualmente autenticado.
 * @param {import('express').Request} request - El objeto de la petición (contiene `request.user`).
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function getCurrentUserProfile(request, response) {
  try {
    // El ID del usuario no viene de los parámetros de la URL, sino del token decodificado,
    // lo cual es mucho más seguro.
    const user_id_from_token = request.user.id;
    
    const user_profile = await UsersService.getUserProfileById(user_id_from_token);
    
    return response.status(200).json(user_profile);

  } catch (error) {
    // Este error podría ocurrir si, por alguna razón, el usuario del token ya no existe en la BD.
    return response.status(404).json({ message: error.message });
  }
}

module.exports = {
  getCurrentUserProfile,
};