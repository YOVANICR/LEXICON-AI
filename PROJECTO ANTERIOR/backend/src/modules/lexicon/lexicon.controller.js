/*
  Archivo: backend/src/modules/lexicon/lexicon.controller.js
  Propósito: (Capa HTTP) Maneja las peticiones para obtener el léxico de un usuario
             y para añadir o actualizar entradas en su léxico.
*/

'use strict';

const LexiconService = require('./lexicon.service');

/**
 * Controlador para obtener el léxico completo del usuario autenticado.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function getLexiconForCurrentUser(request, response) {
  try {
    const user_id_from_token = request.user.id;
    const user_lexicon = await LexiconService.getLexiconByUserId(user_id_from_token);
    return response.status(200).json(user_lexicon);
  } catch (error) {
    return response.status(404).json({ message: error.message });
  }
}

/**
 * Controlador para guardar el léxico completo del usuario.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function saveLexiconForCurrentUser(request, response) {
  try {
    const user_id_from_token = request.user.id;
    const lexicon_data = request.body;

    if (!lexicon_data) {
      return response.status(400).json({ message: 'No se proporcionaron datos del léxico.' });
    }

    await LexiconService.saveLexiconForUserId(user_id_from_token, lexicon_data);
    return response.status(200).json({ message: 'Léxico guardado exitosamente.' });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

module.exports = {
  getLexiconForCurrentUser,
  saveLexiconForCurrentUser,
};