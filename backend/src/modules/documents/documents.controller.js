/*
  Archivo: backend/src/modules/documents/documents.controller.js
  Propósito: (Capa HTTP) Maneja las peticiones para obtener la lista de documentos
             de un usuario y para subir nuevos documentos.
*/

'use strict';

const DocumentsService = require('./documents.service');

/**
 * Controlador para obtener todos los documentos del usuario logueado.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function getAllDocumentsForCurrentUser(request, response) {
  try {
    const user_id = request.user.id; // Obtenido del token verificado.
    const documents = await DocumentsService.getDocumentsByUserId(user_id);
    return response.status(200).json(documents);
  } catch (error) {
    return response.status(404).json({ message: error.message });
  }
}

/**
 * Controlador para subir un nuevo documento.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 */
async function uploadNewDocument(request, response) {
  try {
    const user_id = request.user.id;
    const { title, text } = request.body;

    if (!title || !text) {
      return response.status(400).json({ message: 'El título y el texto son obligatorios.' });
    }

    const new_document = await DocumentsService.createNewDocumentForUser(user_id, { title, text });
    return response.status(201).json(new_document);
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllDocumentsForCurrentUser,
  uploadNewDocument,
};